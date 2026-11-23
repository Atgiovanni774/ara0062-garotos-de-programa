CREATE DATABASE IF NOT EXISTS login
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";











CREATE TABLE `cursos` (
  `id_curso` int(11) NOT NULL,
  `titulo_curso` varchar(150) NOT NULL,
  `descricao_curso` text NOT NULL,
  `carga_horaria` int(11) NOT NULL,
  `cargo_destinado` enum('Auxiliar_de_Logistica','Auxiliar_Fiscal','Supervisor_Geral','Todos') NOT NULL,
  `status_curso` enum('ativo','inativo') NOT NULL DEFAULT 'ativo',
  `criado_em` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;





INSERT INTO `cursos` (`id_curso`, `titulo_curso`, `descricao_curso`, `carga_horaria`, `cargo_destinado`, `status_curso`, `criado_em`) VALUES
(1, 'Recebimento e Conferência', 'Técnicas de inspeção visual, validação de documentação (danfe) e identificação de avarias no recebimento de mercadorias.', 8, 'Auxiliar_de_Logistica', 'ativo', '2026-11-06 23:05:52'),
(2, 'Fundamentos de Armazenagem', 'Boas práticas de layout de estoque, endereçamento de porta-paletes e otimização de espaço físico.', 12, 'Auxiliar_de_Logistica', 'ativo', '2026-11-06 23:05:52'),
(3, 'Metodologia 5S no Estoque', 'Aplicação prática dos sensos de utilização, ordenação, limpeza, saúde e autodisciplina em ambientes logísticos.', 10, 'Auxiliar_de_Logistica', 'ativo', '2026-11-06 23:05:52'),
(4, 'Gestão de Inventário', 'Métodos de contagem cíclica, inventário rotativo e técnicas para garantir a acuracidade dos dados do sistema.', 15, 'Auxiliar_de_Logistica', 'ativo', '2026-11-06 23:05:52'),
(5, 'Noções de Roteirização', 'Conceitos básicos de distribuição, cálculo de cubagem e otimização de rotas para redução de custos de frete.', 20, 'Auxiliar_de_Logistica', 'ativo', '2026-11-06 23:05:52'),
(6, 'Embalagem e Proteção', 'Padronização de embalagens, uso adequado de filme stretch, cantoneiras e fitas de arquear para segurança da carga.', 8, 'Auxiliar_de_Logistica', 'ativo', '2026-11-06 23:05:52'),
(7, 'Segurança Operacional', 'Normas regulamentadoras aplicadas à logística, uso de EPIs e procedimentos seguros para movimentação de carga.', 10, 'Auxiliar_de_Logistica', 'ativo', '2026-11-06 23:05:52'),
(8, 'Picking e Packing', 'Técnicas de separação de pedidos (discreto, por zona, por lote) para aumentar a velocidade de expedição.', 16, 'Auxiliar_de_Logistica', 'ativo', '2026-11-06 23:05:52'),
(9, 'Logística Reversa', 'Processos de devolução, triagem de retornos, descarte sustentável e reinserção de produtos no estoque.', 12, 'Auxiliar_de_Logistica', 'ativo', '2026-11-06 23:05:52'),
(10, 'Indicadores Logísticos', 'Introdução aos KPIs de operação: On-Time Delivery (OTD), Order Fill Rate e taxa de avarias.', 14, 'Auxiliar_de_Logistica', 'ativo', '2026-11-06 23:05:52'),
(11, 'Introdução à Legislação', 'Visão geral do sistema tributário brasileiro, esferas de arrecadação e as obrigações acessórias das empresas.', 15, 'Auxiliar_Fiscal', 'ativo', '2026-11-06 23:05:52'),
(12, 'Estrutura da NF-e', 'Análise detalhada do XML da Nota Fiscal Eletrônica, regras de validação e correção de rejeições comuns da SEFAZ.', 20, 'Auxiliar_Fiscal', 'ativo', '2026-11-06 23:05:52'),
(13, 'Dominando CFOP e CST', 'Guia prático para a correta aplicação dos Códigos Fiscais de Operação e Códigos de Situação Tributária nas notas.', 25, 'Auxiliar_Fiscal', 'ativo', '2026-11-06 23:05:52'),
(14, 'Apuração de ICMS e IPI', 'Cálculos de impostos indiretos, regras de substituição tributária, isenções, suspensões e diferimento.', 30, 'Auxiliar_Fiscal', 'ativo', '2026-11-06 23:05:52'),
(15, 'Retenções na Fonte', 'Mapeamento e cálculo de impostos retidos em serviços: IRRF, INSS, CSLL, PIS e COFINS.', 20, 'Auxiliar_Fiscal', 'ativo', '2026-11-06 23:05:52'),
(16, 'Simples Nacional em Foco', 'Regras de enquadramento, anexos, cálculo do DAS e principais particularidades do regime simplificado.', 18, 'Auxiliar_Fiscal', 'ativo', '2026-11-06 23:05:52'),
(17, 'Regimes de Tributação', 'Comparativo prático entre Lucro Presumido e Lucro Real, focando nas rotinas de suporte do auxiliar.', 22, 'Auxiliar_Fiscal', 'ativo', '2026-11-06 23:05:52'),
(18, 'Introdução ao SPED', 'O que é o Sistema Público de Escrituração Digital, blocos essenciais do SPED Fiscal e EFD-Contribuições.', 25, 'Auxiliar_Fiscal', 'ativo', '2026-11-06 23:05:52'),
(19, 'Conciliação Fiscal', 'Técnicas de cruzamento de dados entre o sistema ERP, as notas emitidas e os extratos contábeis.', 16, 'Auxiliar_Fiscal', 'ativo', '2026-11-06 23:05:52'),
(20, 'Organização e Arquivamento', 'Gestão de documentos fiscais digitais e físicos, prazos de guarda e preparação para auditorias.', 8, 'Auxiliar_Fiscal', 'ativo', '2026-11-06 23:05:52'),
(21, 'Liderança e Gestão', 'Estratégias de gestão de pessoas para supervisores, transição de técnico para líder e delegação de tarefas.', 25, 'Supervisor_Geral', 'ativo', '2026-11-06 23:05:52'),
(22, 'Feedback Efetivo', 'Técnicas de comunicação não-violenta e estruturação de feedbacks corretivos e de reconhecimento.', 15, 'Supervisor_Geral', 'ativo', '2026-11-06 23:05:52'),
(23, 'Gestão de Conflitos', 'Mapeamento de tensões na equipe, mediação de disputas operacionais e reconstrução de clima organizacional.', 20, 'Supervisor_Geral', 'ativo', '2026-11-06 23:05:52'),
(24, 'Planejamento e Metas SMART', 'Como desdobrar os objetivos da diretoria em metas específicas, mensuráveis, alcançáveis e temporais para a equipe.', 18, 'Supervisor_Geral', 'ativo', '2026-11-06 23:05:52'),
(25, 'Análise de Dados Estratégicos', 'Leitura de dashboards, interpretação de relatórios de desempenho e tomada de decisão baseada em fatos.', 30, 'Supervisor_Geral', 'ativo', '2026-11-06 23:05:52'),
(26, 'Produtividade e Tempo', 'Matriz de Eisenhower, priorização de demandas emergenciais e redução de gargalos na rotina de supervisão.', 12, 'Supervisor_Geral', 'ativo', '2026-11-06 23:05:52'),
(27, 'Inteligência Emocional', 'Autocontrole em situações de pressão, resiliência e como manter o engajamento do time em momentos de crise.', 20, 'Supervisor_Geral', 'ativo', '2026-11-06 23:05:52'),
(28, 'Cultura de Segurança', 'O papel do líder na fiscalização de normas de segurança do trabalho e promoção de um ambiente seguro.', 15, 'Supervisor_Geral', 'ativo', '2026-11-06 23:05:52'),
(29, 'Condução de Reuniões', 'Como estruturar pautas, controlar o tempo de fala e gerar planos de ação claros nas reuniões diárias (Daily/DDS).', 10, 'Supervisor_Geral', 'ativo', '2026-11-06 23:05:52'),
(30, 'Avaliação de Desempenho', 'Ferramentas de avaliação 360, criação de Planos de Desenvolvimento Individual (PDI) e retenção de talentos.', 25, 'Supervisor_Geral', 'ativo', '2026-11-06 23:05:52');







CREATE TABLE `mensagens` (
  `id` int(11) NOT NULL,
  `nome` varchar(60) NOT NULL,
  `email` varchar(120) NOT NULL,
  `assunto` varchar(20) NOT NULL,
  `mensagem` text NOT NULL,
  `status` enum('nova','em_analise','resolvida') NOT NULL DEFAULT 'nova',
  `criada_em` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;





INSERT INTO `mensagens` (`id`, `nome`, `email`, `assunto`, `mensagem`, `status`, `criada_em`) VALUES
(1, 'Jonata', 'jonata@gmail.com', 'outro', 'Que site bacana!', 'em_analise', '2026-11-07 13:40:03'),
(2, 'Arthur Giovanne', 'arthur@gmail.com', 'desatualizado', '[NOR-SEG-003] O curso NOR-SEG-003 tem pouca informação.', 'nova', '2026-11-17 19:56:47');







CREATE TABLE `progresso_curso` (
  `id_progresso` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_curso` int(11) NOT NULL,
  `porcentagem` decimal(5,2) NOT NULL DEFAULT 0.00,
  `status_progresso` enum('pendente','em_andamento','concluido') NOT NULL DEFAULT 'pendente',
  `data_inicio` datetime NOT NULL DEFAULT current_timestamp(),
  `data_conclusao` datetime DEFAULT NULL,
  `visualizado_em` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;







CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `nm_usuario` varchar(100) NOT NULL,
  `email_usuario` varchar(150) NOT NULL,
  `senha_usuario` varchar(255) NOT NULL,
  `cargo_usuario` enum('Auxiliar_de_Logistica','Auxiliar_Fiscal','Supervisor_Geral') NOT NULL,
  `status_ativo` enum('ativo','pendente','bloqueado') NOT NULL DEFAULT 'ativo',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `token_senha` varchar(255) DEFAULT NULL,
  `status` enum('ativo','pendente','bloqueado') NOT NULL DEFAULT 'ativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;





INSERT INTO `usuario` (`id_usuario`, `nm_usuario`, `email_usuario`, `senha_usuario`, `cargo_usuario`, `status_ativo`, `criado_em`, `token_senha`, `status`) VALUES
(1, 'Jonata', 'jonata@gmail.com', '$2y$10$WmO/eFgZXI3yCSwj1xD81u7xKc.6VZZbc3Mj8Zr3FlBN/4k7Ziady', 'Auxiliar_Fiscal', 'ativo', '2026-11-06 22:46:21', NULL, 'ativo'),
(2, 'Felipe', 'felipe@gmail.com', '$2y$10$WmO/eFgZXI3yCSwj1xD81u7xKc.6VZZbc3Mj8Zr3FlBN/4k7Ziady', 'Auxiliar_de_Logistica', 'ativo', '2026-11-06 22:46:21', NULL, 'ativo'),
(3, 'Arthur', 'arthur@gmail.com', '$2y$10$WmO/eFgZXI3yCSwj1xD81u7xKc.6VZZbc3Mj8Zr3FlBN/4k7Ziady', 'Supervisor_Geral', 'ativo', '2026-11-07 01:42:50', NULL, 'ativo');








ALTER TABLE `cursos`
  ADD PRIMARY KEY (`id_curso`);




ALTER TABLE `mensagens`
  ADD PRIMARY KEY (`id`);




ALTER TABLE `progresso_curso`
  ADD PRIMARY KEY (`id_progresso`),
  ADD UNIQUE KEY `uq_progresso_usuario_curso` (`id_usuario`,`id_curso`),
  ADD KEY `id_curso` (`id_curso`);




ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email_usuario` (`email_usuario`);








ALTER TABLE `cursos`
  MODIFY `id_curso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;




ALTER TABLE `mensagens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;




ALTER TABLE `progresso_curso`
  MODIFY `id_progresso` int(11) NOT NULL AUTO_INCREMENT;




ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=435;








ALTER TABLE `progresso_curso`
  ADD CONSTRAINT `progresso_curso_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  ADD CONSTRAINT `progresso_curso_ibfk_2` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`);
COMMIT;