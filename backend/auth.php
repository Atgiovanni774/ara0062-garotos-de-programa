<?php

declare(strict_types=1);

require_once __DIR__ . '/config/auth.php';
require_once __DIR__ . '/config/conexao.php';
iniciarSessaoSegura();

$acao = $_GET['acao'] ?? '';
$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$entrada = json_decode(file_get_contents('php://input'), true);
$entrada = is_array($entrada) ? $entrada : [];

$papeis = ['auxiliar_de_logística', 'supervisor_geral', 'auxiliar_fiscal'];

try {
    if ($metodo === 'GET' && $acao === 'sessao') {
        $usuario = usuarioAtual();
        $_SESSION['csrf'] = $_SESSION['csrf'] ?? bin2hex(random_bytes(32));
        responderJson(['usuario' => $usuario, 'csrf' => $_SESSION['csrf'] ?? null]);
    }

    if ($metodo === 'POST' && $acao === 'registrar') {
        exigirCsrf();
        $nome = trim((string) ($entrada['nome'] ?? ''));
        $email = mb_strtolower(trim((string) ($entrada['email'] ?? '')));
        $senha = (string) ($entrada['senha'] ?? '');
        $papel = (string) ($entrada['papel'] ?? 'auxiliar_de_logística');

        if (mb_strlen($nome) < 3 || mb_strlen($nome) > 100 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            responderJson(['erro' => 'Informe nome e e-mail válidos.'], 422);
        }
        if (strlen($senha) < 3 || strlen($senha) > 200) {
            responderJson(['erro' => 'A senha deve ter pelo menos 3 caracteres.'], 422);
        }
        if (!in_array($papel, $papeis, true)) {
            responderJson(['erro' => 'Tipo de conta inválido.'], 422);
        }

        // Contas privilegiadas ficam pendentes até um supervisor_geral aprová-las.
        $status = $papel === 'auxiliar_de_logística' ? 'ativo' : 'pendente';
        $cargos = [
            'auxiliar_de_logística' => 'Auxiliar_de_Logistica',
            'auxiliar_fiscal' => 'Auxiliar_Fiscal',
            'supervisor_geral' => 'Supervisor_Geral',
        ];
        $sql = 'INSERT INTO usuario (nm_usuario, email_usuario, senha_usuario, cargo_usuario, status_ativo) VALUES (?, ?, ?, ?, ?)';
        $comando = $conexao->prepare($sql);
        try {
            $comando->execute([$nome, $email, password_hash($senha, PASSWORD_DEFAULT), $cargos[$papel], $status === 'ativo' ? 1 : 0]);
        } catch (PDOException $erro) {
            if ($erro->getCode() === '23000') {
                responderJson(['erro' => 'Já existe uma conta com este e-mail.'], 409);
            }
            throw $erro;
        }
        responderJson([
            'mensagem' => $status === 'ativo'
                ? 'Cadastro concluído. Você já pode entrar.'
                : 'Solicitação recebida. Um supervisor_geral precisa aprovar este perfil antes do primeiro acesso.',
            'pendente' => $status === 'pendente',
        ], 201);
    }

    if ($metodo === 'POST' && $acao === 'entrar') {
        exigirCsrf();
        $email = mb_strtolower(trim((string) ($entrada['email'] ?? '')));
        $senha = (string) ($entrada['senha'] ?? '');
        $consulta = $conexao->prepare("SELECT id_usuario AS id, nm_usuario AS nome, email_usuario AS email, senha_usuario AS senha_hash, CASE cargo_usuario WHEN 'Supervisor_Geral' THEN 'supervisor_geral' WHEN 'Auxiliar_Fiscal' THEN 'auxiliar_fiscal' ELSE 'auxiliar_de_logística' END AS papel, 'ativo' AS status FROM usuario WHERE email_usuario = ? AND status_ativo = 1 LIMIT 1");
        $consulta->execute([$email]);
        $usuario = $consulta->fetch(PDO::FETCH_ASSOC);

        if (!$usuario || !password_verify($senha, $usuario['senha_hash'])) {
            responderJson(['erro' => 'E-mail ou senha incorretos.'], 401);
        }
        if ($usuario['status'] !== 'ativo') {
            responderJson(['erro' => 'Esta conta ainda aguarda aprovação do supervisor_geral.'], 403);
        }
        $dados = definirSessaoUsuario($usuario);
        responderJson(['usuario' => $dados, 'csrf' => $_SESSION['csrf']]);
    }

    if ($metodo === 'POST' && $acao === 'sair') {
        exigirCsrf();
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }
        session_destroy();
        responderJson(['mensagem' => 'Sessão encerrada.']);
    }

    if ($metodo === 'GET' && $acao === 'usuarios') {
        exigirPapel(['supervisor_geral']);
        $usuarios = $conexao->query("SELECT id_usuario AS id, nm_usuario AS nome, email_usuario AS email, CASE cargo_usuario WHEN 'Supervisor_Geral' THEN 'supervisor_geral' WHEN 'Auxiliar_Fiscal' THEN 'auxiliar_fiscal' ELSE 'auxiliar_de_logística' END AS papel, CASE WHEN status_ativo = 1 THEN 'ativo' ELSE 'pendente' END AS status, criado_em FROM usuario ORDER BY status_ativo ASC, nm_usuario")->fetchAll(PDO::FETCH_ASSOC);
        responderJson(['usuarios' => $usuarios]);
    }

    if ($metodo === 'POST' && $acao === 'atualizar-usuario') {
        exigirPapel(['supervisor_geral']);
        exigirCsrf();
        $id = filter_var($entrada['id'] ?? null, FILTER_VALIDATE_INT);
        $papel = (string) ($entrada['papel'] ?? '');
        $status = (string) ($entrada['status'] ?? '');
        if (!$id || !in_array($papel, $papeis, true) || !in_array($status, ['ativo', 'pendente', 'bloqueado'], true)) {
            responderJson(['erro' => 'Dados de perfil inválidos.'], 422);
        }
        if ((int) $_SESSION['usuario']['id'] === $id && ($papel !== 'supervisor_geral' || $status !== 'ativo')) {
            responderJson(['erro' => 'Não é possível remover ou desativar seu próprio acesso administrativo.'], 422);
        }
        $cargos = [
            'auxiliar_de_logística' => 'Auxiliar_de_Logistica',
            'auxiliar_fiscal' => 'Auxiliar_Fiscal',
            'supervisor_geral' => 'Supervisor_Geral',
        ];
        $alvo = $conexao->prepare("SELECT CASE cargo_usuario WHEN 'Supervisor_Geral' THEN 'supervisor_geral' WHEN 'Auxiliar_Fiscal' THEN 'auxiliar_fiscal' ELSE 'auxiliar_de_logística' END AS papel, CASE WHEN status_ativo = 1 THEN 'ativo' ELSE 'pendente' END AS status FROM usuario WHERE id_usuario = ?");
        $alvo->execute([$id]);
        $anterior = $alvo->fetch(PDO::FETCH_ASSOC);
        if (!$anterior) {
            responderJson(['erro' => 'Conta não encontrada.'], 404);
        }
        if ($anterior['papel'] === 'supervisor_geral' && $anterior['status'] === 'ativo' && ($papel !== 'supervisor_geral' || $status !== 'ativo')) {
            $total = (int) $conexao->query("SELECT COUNT(*) FROM usuario WHERE cargo_usuario = 'Supervisor_Geral' AND status_ativo = 1")->fetchColumn();
            if ($total <= 1) {
                responderJson(['erro' => 'O sistema precisa manter pelo menos um supervisor_geral ativo.'], 409);
            }
        }
        $atualiza = $conexao->prepare('UPDATE usuario SET cargo_usuario = ?, status_ativo = ? WHERE id_usuario = ?');
        $atualiza->execute([$cargos[$papel], $status === 'ativo' ? 1 : 0, $id]);
        responderJson(['mensagem' => 'Permissões atualizadas.']);
    }

    responderJson(['erro' => 'Ação não encontrada.'], 404);
} catch (Throwable $erro) {
    error_log('Falha em auth.php: ' . $erro->getMessage());
    responderJson(['erro' => 'Não foi possível concluir a operação. Verifique a configuração do servidor.'], 500);
}
