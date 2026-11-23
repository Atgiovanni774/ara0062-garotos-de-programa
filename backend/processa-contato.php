<?php

date_default_timezone_set("America/Sao_Paulo");
$nome = is_string($_POST['nome'] ?? null) ? trim($_POST['nome']) : '';
$email = is_string($_POST['email'] ?? null) ? trim($_POST['email']) : '';
$assunto = is_string($_POST['assunto'] ?? null) ? $_POST['assunto'] : '';
$mensagem = is_string($_POST['mensagem'] ?? null) ? trim($_POST['mensagem']) : '';
$limite = 500;
$hoje = date("d/m/Y");
$hora = date("H:i");
$tamanho = mb_strlen($mensagem);
$sobra = $limite - $tamanho;
$carimbo = "Recebida em " . $hoje . " às " . $hora . ".";
$assuntosPermitidos = ['duvida', 'sugestao', 'desatualizado', 'outro'];
$erros = [];

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    http_response_code(405);
    exit('Método não permitido.');
}

if (mb_strlen($nome) < 3 || mb_strlen($nome) > 60 || preg_match('/\d/u', $nome)) {
    $erros[] = 'Informe um nome com 3 a 60 caracteres e sem números.';
}
if (mb_strlen($email) > 120 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $erros[] = 'Informe um endereço de e-mail válido.';
}
if (!in_array($assunto, $assuntosPermitidos, true)) {
    $erros[] = 'Selecione um assunto válido.';
}
if ($tamanho < 1 || $tamanho > $limite) {
    $erros[] = 'A mensagem deve ter entre 1 e 500 caracteres.';
} elseif (in_array($assunto, ['sugestao', 'desatualizado'], true) && $tamanho < 20) {
    $erros[] = 'Para sugestões e avisos de atualização, escreva pelo menos 20 caracteres.';
}

if ($erros) {
    http_response_code(422);
    ?>
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Revise o formulário - Portal GACO</title>
        <link rel="stylesheet" href="../frontend/css/estilo.css">
    </head>
    <body>
        <main>
            <section class="painel">
                <h1>Não foi possível enviar a mensagem</h1>
                <ul>
                    <?php foreach ($erros as $erro): ?>
                        <li><?= htmlspecialchars($erro, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?></li>
                    <?php endforeach; ?>
                </ul>
                <p><a href="../frontend/index.html#/contato">Voltar ao formulário</a></p>
            </section>
        </main>
    </body>
    </html>
    <?php
    exit;
}

$nomeSeguro = htmlspecialchars($nome, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$emailSeguro = htmlspecialchars($email, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$assuntoSeguro = htmlspecialchars($assunto, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$mensagemSegura = htmlspecialchars($mensagem, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

require_once __DIR__ . "/config/conexao.php";

$sql = "INSERT INTO mensagens (nome, email, assunto, mensagem) VALUES (?, ?, ?, ?)";
$comando = $conexao->prepare($sql);
$comando->execute([$nome, $email, $assunto, $mensagem]);

$numero = $conexao->lastInsertId();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mensagem recebida - Equipe Garotos de Programa</title>
<link rel="stylesheet" href="../frontend/css/estilo.css">
</head>
<body>
<header>
<h1>Equipe Garotos de Programa</h1>
<p>Estudante de Sistemas de Informação</p>
</header>
<main>
<section id="resposta">
<h2>Obrigado, <?php echo $nomeSeguro; ?>!</h2>
<p class="aviso">Mensagem nº <?php echo $numero; ?> guardada. <?php echo $carimbo; ?></p>
<p>Vou responder no e-mail <strong><?php echo $emailSeguro; ?></strong>.</p>
<p>Assunto: <?php echo $assuntoSeguro; ?></p>
<p>A sua mensagem tem <?php echo $tamanho; ?> caracteres - sobraram <?php echo $sobra; ?> dos <?php echo $limite; ?>.</p>
<blockquote><?php echo $mensagemSegura; ?></blockquote>
<p><a href="../frontend/index.html#/contato">Voltar para o contato</a></p>
</section>
</main>
<footer>
<p>Equipe Garotos de Programa &middot; 2026 &middot; ARA0062 &middot; Newton Paiva</p>
</footer>
</body>
</html>