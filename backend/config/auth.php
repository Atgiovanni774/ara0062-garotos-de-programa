<?php

declare(strict_types=1);

function iniciarSessaoSegura(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_name('gaco_session');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $https,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function responderJson(array $dados, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function usuarioAtual(): ?array
{
    iniciarSessaoSegura();
    $sessao = $_SESSION['usuario'] ?? null;
    if (!$sessao) {
        return null;
    }

    global $conexao;
    if (isset($conexao) && $conexao instanceof PDO) {
        $consulta = $conexao->prepare("SELECT id_usuario AS id, nm_usuario AS nome, email_usuario AS email, CASE cargo_usuario WHEN 'Supervisor_Geral' THEN 'supervisor_geral' WHEN 'Auxiliar_Fiscal' THEN 'auxiliar_fiscal' ELSE 'auxiliar_de_logística' END AS papel FROM usuario WHERE id_usuario = ? AND status_ativo = 1 LIMIT 1");
        $consulta->execute([(int) $sessao['id']]);
        $atual = $consulta->fetch(PDO::FETCH_ASSOC);
        if (!$atual) {
            $_SESSION = [];
            session_regenerate_id(true);
            return null;
        }
        $_SESSION['usuario'] = [
            'id' => (int) $atual['id'],
            'nome' => $atual['nome'],
            'email' => $atual['email'],
            'papel' => $atual['papel'],
        ];
    }
    return $_SESSION['usuario'];
}

function exigirPapel(array $papeis): array
{
    $usuario = usuarioAtual();
    if (!$usuario) {
        responderJson(['erro' => 'Faça login para continuar.'], 401);
    }
    if (!in_array($usuario['papel'], $papeis, true)) {
        responderJson(['erro' => 'Você não tem permissão para esta ação.'], 403);
    }
    return $usuario;
}

function exigirCsrf(): void
{
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!$token || !hash_equals($_SESSION['csrf'] ?? '', $token)) {
        responderJson(['erro' => 'Sessão expirada. Atualize a página e tente novamente.'], 419);
    }
}

function definirSessaoUsuario(array $usuario): array
{
    session_regenerate_id(true);
    $_SESSION['usuario'] = [
        'id' => (int) $usuario['id'],
        'nome' => $usuario['nome'],
        'email' => $usuario['email'],
        'papel' => $usuario['papel'],
    ];
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['usuario'];
}
