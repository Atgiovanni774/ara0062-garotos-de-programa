-- Para bancos que já foram criados com a versão anterior do banco.sql.
-- Execute uma única vez no banco fulano antes de usar login/gestão de solicitações.
ALTER TABLE mensagens
  ADD COLUMN status ENUM('nova', 'em_analise', 'resolvida') NOT NULL DEFAULT 'nova';

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  papel ENUM('auxiliar_de_logística', 'supervisor_geral', 'auxiliar_fiscal') NOT NULL DEFAULT 'auxiliar_de_logística',
  status ENUM('ativo', 'pendente', 'bloqueado') NOT NULL DEFAULT 'ativo',
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
