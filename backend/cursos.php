<?php

declare(strict_types=1);

require_once __DIR__ . '/config/auth.php';
require_once __DIR__ . '/config/conexao.php';
require_once __DIR__ . '/config/cursos.php';

iniciarSessaoSegura();

try {
    $metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($metodo, ['GET', 'POST'], true)) {
        header('Allow: GET, POST');
        responderJson(['erro' => 'Método não permitido.'], 405);
    }

    $usuario = exigirPapel(['auxiliar_de_logística', 'auxiliar_fiscal', 'supervisor_geral']);
    if ($metodo === 'POST') {
        exigirCsrf();
        $entrada = json_decode(file_get_contents('php://input'), true);
        $entrada = is_array($entrada) ? $entrada : [];
        $idCurso = filter_var($entrada['id'] ?? null, FILTER_VALIDATE_INT);
        $acao = (string) ($entrada['acao'] ?? '');
        if (!$idCurso || !in_array($acao, ['visualizado', 'concluido', 'pendente'], true)) {
            responderJson(['erro' => 'Atualização de curso inválida.'], 422);
        }
        if (!consultarCursosPermitidos($conexao, $usuario, $idCurso)) {
            responderJson(['erro' => 'Curso não encontrado ou não disponível para este perfil.'], 404);
        }

        if ($acao === 'visualizado') {
            $atualiza = $conexao->prepare(
                "INSERT INTO progresso_curso (id_usuario, id_curso, porcentagem, status_progresso, visualizado_em)
                 VALUES (?, ?, 0, 'pendente', CURRENT_TIMESTAMP)
                 ON DUPLICATE KEY UPDATE visualizado_em = COALESCE(visualizado_em, CURRENT_TIMESTAMP)"
            );
            $atualiza->execute([(int) $usuario['id'], $idCurso]);
        } elseif ($acao === 'concluido') {
            $atualiza = $conexao->prepare(
                "INSERT INTO progresso_curso (id_usuario, id_curso, porcentagem, status_progresso, visualizado_em, data_conclusao)
                 VALUES (?, ?, 100, 'concluido', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                 ON DUPLICATE KEY UPDATE porcentagem = 100, status_progresso = 'concluido',
                     visualizado_em = COALESCE(visualizado_em, CURRENT_TIMESTAMP), data_conclusao = CURRENT_TIMESTAMP"
            );
            $atualiza->execute([(int) $usuario['id'], $idCurso]);
        } else {
            $atualiza = $conexao->prepare(
                "INSERT INTO progresso_curso (id_usuario, id_curso, porcentagem, status_progresso, data_conclusao)
                 VALUES (?, ?, 0, 'pendente', NULL)
                 ON DUPLICATE KEY UPDATE porcentagem = 0, status_progresso = 'pendente', data_conclusao = NULL"
            );
            $atualiza->execute([(int) $usuario['id'], $idCurso]);
        }
        responderJson(['mensagem' => 'Progresso do curso atualizado.']);
    }

    $cursos = consultarCursosPermitidos($conexao, $usuario);
    $progresso = $conexao->prepare(
        'SELECT id_curso, status_progresso, visualizado_em FROM progresso_curso WHERE id_usuario = ?'
    );
    $progresso->execute([(int) $usuario['id']]);
    $porCurso = [];
    foreach ($progresso->fetchAll(PDO::FETCH_ASSOC) as $registro) {
        $porCurso[(int) $registro['id_curso']] = $registro;
    }
    foreach ($cursos as &$curso) {
        $registro = $porCurso[(int) $curso['id']] ?? null;
        $curso['visualizado'] = $registro !== null && $registro['visualizado_em'] !== null;
        $curso['concluido'] = $registro !== null && $registro['status_progresso'] === 'concluido';
    }
    unset($curso);
    responderJson(['cursos' => $cursos]);
} catch (Throwable $erro) {
    error_log('Falha em cursos.php: ' . $erro->getMessage());
    responderJson(['erro' => 'Não foi possível carregar os cursos. Verifique a configuração do servidor.'], 500);
}
