<?php

declare(strict_types=1);

require_once __DIR__ . '/config/auth.php';
require_once __DIR__ . '/config/conexao.php';

$usuario = exigirPapel(['supervisor_geral']);
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

    $verifica = $conexao->prepare('SELECT id FROM mensagens WHERE id = ?');
    $verifica->execute([$id]);
    if (!$verifica->fetchColumn()) {
        responderJson(['erro' => 'Solicitação não encontrada ou fora da sua permissão.'], 404);
    }
    $atualiza = $conexao->prepare('UPDATE mensagens SET status = ? WHERE id = ?');
    $atualiza->execute([$status, $id]);
    responderJson(['mensagem' => 'Solicitação atualizada.']);
}

if ($metodo !== 'GET') {
    responderJson(['erro' => 'Método não permitido.'], 405);
}

if ($usuario['papel'] !== 'supervisor_geral') {
    responderJson(['erro' => 'Você não tem permissão para consultar solicitações de conteúdo.'], 403);
}
$consulta = $conexao->query('SELECT id, nome, email, assunto, mensagem, status, criada_em FROM mensagens ORDER BY criada_em DESC');
responderJson(['mensagens' => $consulta->fetchAll(PDO::FETCH_ASSOC)]);