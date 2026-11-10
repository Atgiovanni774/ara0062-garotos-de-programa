<?php

declare(strict_types=1);

function consultarCursosPermitidos(PDO $conexao, array $usuario, ?int $idCurso = null): array
{
    $setores = [
        'auxiliar_de_logística' => 'Auxiliar_de_Logistica',
        'auxiliar_fiscal' => 'Auxiliar_Fiscal',
    ];
    $papel = $usuario['papel'] ?? '';

    $sql = "SELECT id_curso AS id, titulo_curso AS titulo, descricao_curso AS descricao,
                   carga_horaria, CASE cargo_destinado
                       WHEN 'Auxiliar_de_Logistica' THEN 'Logística'
                       WHEN 'Auxiliar_Fiscal' THEN 'Fiscal'
                       WHEN 'Supervisor_Geral' THEN 'Supervisão'
                       WHEN 'Todos' THEN 'Todos os setores'
                   END AS setor
            FROM cursos
            WHERE status_curso = 'ativo'";
    $parametros = [];

    if ($papel !== 'supervisor_geral') {
        if (!isset($setores[$papel])) {
            return [];
        }
        $sql .= ' AND cargo_destinado = ?';
        $parametros[] = $setores[$papel];
    }

    if ($idCurso !== null) {
        $sql .= ' AND id_curso = ?';
        $parametros[] = $idCurso;
    }

    $sql .= ' ORDER BY titulo_curso';
    $consulta = $conexao->prepare($sql);
    $consulta->execute($parametros);
    return $consulta->fetchAll(PDO::FETCH_ASSOC);
}
