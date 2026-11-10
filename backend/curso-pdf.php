<?php

declare(strict_types=1);

require_once __DIR__ . '/config/auth.php';
require_once __DIR__ . '/config/conexao.php';
require_once __DIR__ . '/config/cursos.php';

iniciarSessaoSegura();

function textoPdf(string $texto): string
{
    $ascii = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $texto);
    if ($ascii === false) {
        throw new RuntimeException('Não foi possível converter o texto do curso para PDF.');
    }
    return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $ascii);
}

function adicionarTextoPdf(array &$comandos, string $texto, int $x, int $y, int $tamanho = 11, bool $negrito = false): void
{
    $fonte = $negrito ? 'F2' : 'F1';
    $comandos[] = "BT /$fonte $tamanho Tf $x $y Td (" . textoPdf($texto) . ") Tj ET";
}

function quebrarTextoPdf(string $texto, int $largura = 88): array
{
    $texto = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $texto);
    if ($texto === false) {
        throw new RuntimeException('Não foi possível converter a descrição do curso para PDF.');
    }
    return explode("\n", wordwrap($texto, $largura, "\n", true));
}

function gerarPdf(array $curso): string
{
    $comandos = [
        '0.86 0.93 0.9 rg 0 760 595 82 re f',
        '0.12 0.35 0.29 rg 44 44 507 1 re f',
    ];
    adicionarTextoPdf($comandos, 'PORTAL GACO | MATERIAL ILUSTRATIVO', 44, 812, 10, true);
    $titulo = quebrarTextoPdf($curso['titulo'], 48);
    foreach ($titulo as $indice => $linha) {
        adicionarTextoPdf($comandos, $linha, 44, 779 - ($indice * 22), 18, true);
    }
    $deslocamentoTitulo = (count($titulo) - 1) * 22;
    adicionarTextoPdf($comandos, 'Setor: ' . $curso['setor'] . '    Carga horaria: ' . $curso['carga_horaria'] . ' horas', 44, 737 - $deslocamentoTitulo, 11);

    $y = 698 - $deslocamentoTitulo;
    foreach ([
        ['APRESENTACAO', $curso['descricao']],
        ['OBJETIVO DE APRENDIZAGEM', 'Compreender os conceitos e aplicar as praticas relacionadas ao tema deste curso.'],
        ['CONTEUDO SUGERIDO', '1. Conceitos e termos fundamentais do tema.'],
        ['CONTEUDO SUGERIDO', '2. Procedimentos e aplicacao pratica na rotina do setor.'],
        ['CONTEUDO SUGERIDO', '3. Boas praticas de seguranca, qualidade e conformidade.'],
        ['ATIVIDADE DE FIXACAO', 'Descreva como os conceitos do curso se aplicam a uma situacao real de trabalho.'],
        ['REGISTRO DE CONCLUSAO', 'Leia o material, tire duvidas com a supervisao e marque a conclusao no portal.'],
    ] as [$titulo, $conteudo]) {
        adicionarTextoPdf($comandos, $titulo, 44, $y, 11, true);
        $y -= 20;
        foreach (quebrarTextoPdf($conteudo) as $linha) {
            adicionarTextoPdf($comandos, $linha, 44, $y, 10);
            $y -= 15;
        }
        $y -= 13;
    }

    $y = min($y, 83);
    adicionarTextoPdf($comandos, 'Este PDF e ilustrativo e nao substitui procedimentos, normas ou treinamentos oficiais.', 44, $y, 9);
    adicionarTextoPdf($comandos, 'Confirme sempre os requisitos vigentes com a supervisao responsavel.', 44, $y - 14, 9);

    $stream = implode("\n", $comandos);
    $objetos = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
        '<< /Length ' . strlen($stream) . " >>\nstream\n" . $stream . "\nendstream",
    ];

    $pdf = "%PDF-1.4\n";
    $offsets = [0];
    foreach ($objetos as $indice => $objeto) {
        $offsets[] = strlen($pdf);
        $pdf .= ($indice + 1) . " 0 obj\n" . $objeto . "\nendobj\n";
    }
    $xref = strlen($pdf);
    $pdf .= "xref\n0 " . (count($objetos) + 1) . "\n0000000000 65535 f \n";
    for ($i = 1; $i <= count($objetos); $i++) {
        $pdf .= sprintf("%010d 00000 n \n", $offsets[$i]);
    }
    $pdf .= "trailer\n<< /Size " . (count($objetos) + 1) . " /Root 1 0 R >>\nstartxref\n" . $xref . "\n%%EOF";
    return $pdf;
}

try {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
        header('Allow: GET');
        http_response_code(405);
        exit('Método não permitido.');
    }

    $usuario = exigirPapel(['auxiliar_de_logística', 'auxiliar_fiscal', 'supervisor_geral']);
    $idCurso = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$idCurso || $idCurso < 1) {
        http_response_code(400);
        exit('Código de curso inválido.');
    }
    $cursos = consultarCursosPermitidos($conexao, $usuario, $idCurso);
    if (!$cursos) {
        http_response_code(404);
        exit('Curso não encontrado ou não disponível para este perfil.');
    }

    $pdf = gerarPdf($cursos[0]);
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="curso-' . $idCurso . '.pdf"');
    header('Content-Length: ' . strlen($pdf));
    header('Cache-Control: no-store');
    echo $pdf;
} catch (Throwable $erro) {
    error_log('Falha em curso-pdf.php: ' . $erro->getMessage());
    http_response_code(500);
    exit('Não foi possível gerar o PDF do curso.');
}
