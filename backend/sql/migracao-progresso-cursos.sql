

ALTER TABLE progresso_curso
  ADD COLUMN visualizado_em DATETIME NULL,
  ADD UNIQUE KEY uq_progresso_usuario_curso (id_usuario, id_curso);
