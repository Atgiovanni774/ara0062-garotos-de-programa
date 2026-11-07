<?php

declare(strict_types=1);

require_once __DIR__ . '/config/auth.php';
require_once __DIR__ . '/config/conexao.php';

$usuario = exigirPapel(['auxiliar_fiscal', 'supervisor_geral']);
$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($metodo === 'POST') {
    exigirCsrf();
    $entrada = json_decode(file_get_contents('php://input'), true);
    $entrada = is_array($entrada) ? $entrada : [];
    $id = filter_var($entrada['id'] ?? null, FILTER_VALIDATE_INT);
    $status = (string) ($entrada['status'] ?? '');
    if (!$id || !in_array($status, ['nova', 'em_analise', 'resolvida'], true)) {
        responderJson(['erro' => 'Atualização inválida.'], 422);
    }

    $filtro = $usuario['papel'] === 'auxiliar_fiscal'
        ? " AND assunto IN ('sugestao', 'desatualizado')"
        : '';
    $verifica = $conexao->prepare('SELECT id FROM mensagens WHERE id = ?' . $filtro);
    $verifica->execute([$id]);
    if (!$verifica->fetchColumn()) {
        responderJson(['erro' => 'Solicitação não encontrada ou fora da sua permissão.'], 404);
    }
    $atualiza = $conexao->prepare('UPDATE mensagens SET status = ? WHERE id = ?' . $filtro);
    $atualiza->execute([$status, $id]);
    responderJson(['mensagem' => 'Solicitação atualizada.']);
}

if ($metodo !== 'GET') {
    responderJson(['erro' => 'Método não permitido.'], 405);
}

if ($usuario['papel'] === 'auxiliar_fiscal') {
    $consulta = $conexao->query("SELECT id, nome, email, assunto, mensagem, status, criada_em FROM mensagens WHERE assunto IN ('sugestao', 'desatualizado') ORDER BY criada_em DESC");
} else {
    $consulta = $conexao->query('SELECT id, nome, email, assunto, mensagem, status, criada_em FROM mensagens ORDER BY criada_em DESC');
}
responderJson(['mensagens' => $consulta->fetchAll(PDO::FETCH_ASSOC)]);