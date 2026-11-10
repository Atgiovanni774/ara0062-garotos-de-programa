-- Execute uma única vez em bancos existentes para salvar visualizações e
-- conclusões de cursos por usuário.
ALTER TABLE progresso_curso
  ADD COLUMN visualizado_em DATETIME NULL,
  ADD UNIQUE KEY uq_progresso_usuario_curso (id_usuario, id_curso);
