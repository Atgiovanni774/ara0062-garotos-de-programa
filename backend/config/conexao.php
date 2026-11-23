<?php










   $servidor = "localhost";
   $banco = "login";
   $usuario = "root";
   $senha = "";

      $conexao = new PDO(
         "mysql:host=$servidor;dbname=$banco;charset=utf8mb4",
         $usuario,
         $senha,
         [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
      );
   ?>