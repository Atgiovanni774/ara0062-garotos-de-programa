<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/config/conexao.php';

function perguntar(string $rotulo): string
{
    echo $rotulo;
    return trim((string) fgets(STDIN));
}

$nome = perguntar('Nome do supervisor_geral: ');
$email = strtolower(perguntar('E-mail: '));
echo 'Senha (mínimo 3 caracteres): ';
if (DIRECTORY_SEPARATOR === '\\') {
    $comando = 'powershell -NoProfile -Command "$segura=Read-Host -Prompt \'Senha\' -AsSecureString; $ptr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($segura); try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }"';
    $senha = trim((string) shell_exec($comando));
} else {
    shell_exec('stty -echo');
    $senha = trim((string) fgets(STDIN));
    shell_exec('stty echo');
    echo PHP_EOL;
}

if (mb_strlen($nome) < 3 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($senha) < 3) {
    fwrite(STDERR, "Dados inválidos. Nenhuma conta foi criada.\n");
    exit(1);
}

try {
    $comando = $conexao->prepare("INSERT INTO usuario (nm_usuario, email_usuario, senha_usuario, cargo_usuario, status_ativo) VALUES (?, ?, ?, 'Supervisor_Geral', 1)");
    $comando->execute([$nome, $email, password_hash($senha, PASSWORD_DEFAULT)]);
    echo "supervisor_geral criado. Apague a senha do terminal/histórico, se aplicável.\n";
} catch (PDOException $erro) {
    fwrite(STDERR, $erro->getCode() === '23000' ? "Este e-mail já está cadastrado.\n" : "Erro ao criar supervisor_geral: {$erro->getMessage()}\n");
    exit(1);
} finally {
    $senha = '';
}
