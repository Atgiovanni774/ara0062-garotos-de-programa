<?php

date_default_timezone_set("America/Sao_Paulo");
$nome = $_POST["nome"] ?? "";
$email = $_POST["email"] ?? "";
$assunto = $_POST["assunto"] ?? "";
$mensagem = $_POST["mensagem"] ?? "";
$limite = 500;
$hoje = date("d/m/Y");
$hora = date("H:i");
$tamanho = mb_strlen($mensagem);
$sobra = $limite - $tamanho;
$carimbo = "Recebida em " . $hoje . " às " . $hora . ".";

$nomeSeguro = htmlspecialchars($nome);
$emailSeguro = htmlspecialchars($email);
$assuntoSeguro = htmlspecialchars($assunto);
$mensagemSegura = htmlspecialchars($mensagem);

if ($nome === "") {
    exit("Nada chegou do formulário.");
}

require "config/conexao.php";

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
<p><a href="../frontend/index.html#contato"> Voltar para a página</a></p>
</section>
</main>
<footer>
<p>Equipe Garotos de Programa &middot; 2026 &middot; ARA0062 &middot; Newton Paiva</p>
</footer>
</body>
</html>
