<?php
require "config/conexao.php";
$comando = $conexao->query("SELECT * FROM mensagens ORDER BY id DESC");
$mensagens = $comando->fetchAll();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Mensagens Recebidas</title>
</head>
<body>
    <table>
        <?php foreach ($mensagens as $m): ?>
        <tr>
            <td><?php echo $m["id"]; ?></td>
            <td><?php echo htmlspecialchars($m["nome"]); ?></td>
            <td><?php echo htmlspecialchars($m["mensagem"]); ?></td>
        </tr>
        <?php endforeach; ?>
    </table>
</body>
</html>