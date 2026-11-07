CREATE DATABASE IF NOT EXISTS login
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE login;

CREATE TABLE IF NOT EXISTS mensagens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(60) NOT NULL,
  email VARCHAR(120) NOT NULL,
  assunto VARCHAR(20) NOT NULL,
  mensagem TEXT NOT NULL,
  status ENUM('nova', 'em_analise', 'resolvida') NOT NULL DEFAULT 'nova',
  criada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nm_usuario VARCHAR(100) NOT NULL,
  email_usuario VARCHAR(190) NOT NULL UNIQUE,
  senha_usuario VARCHAR(255) NOT NULL,
  cargo_usuario ENUM('Auxiliar_de_Logistica', 'Auxiliar_Fiscal', 'Supervisor_Geral') NOT NULL,
  status_ativo ENUM('ativo', 'pendente', 'bloqueado') NOT NULL DEFAULT 'ativo',
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cursos (
  id_curso INT AUTO_INCREMENT PRIMARY KEY,
  titulo_curso VARCHAR(150) NOT NULL,
  descricao_curso TEXT NOT NULL,
  carga_horaria INT NOT NULL, -- Tempo do curso em horas
  cargo_destinado ENUM('Auxiliar_de_Logistica', 'Auxiliar_Fiscal', 'Supervisor_Geral', 'Todos') NOT NULL,
  status_curso ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS progresso_curso (
  id_progresso INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_curso INT NOT NULL,
  porcentagem DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  status_progresso ENUM('pendente', 'em_andamento', 'concluido') NOT NULL DEFAULT 'pendente',
  data_inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_conclusao DATETIME NULL,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
  FOREIGN KEY (id_curso) REFERENCES cursos(id_curso)
);

INSERT INTO cursos (titulo_curso, descricao_curso, carga_horaria, cargo_destinado) VALUES

-- Cursos para Auxiliar de Logística
('Recebimento e Conferência', 'Técnicas de inspeção visual, validação de documentação (danfe) e identificação de avarias no recebimento de mercadorias.', 8, 'Auxiliar_de_Logistica'),
('Fundamentos de Armazenagem', 'Boas práticas de layout de estoque, endereçamento de porta-paletes e otimização de espaço físico.', 12, 'Auxiliar_de_Logistica'),
('Metodologia 5S no Estoque', 'Aplicação prática dos sensos de utilização, ordenação, limpeza, saúde e autodisciplina em ambientes logísticos.', 10, 'Auxiliar_de_Logistica'),
('Gestão de Inventário', 'Métodos de contagem cíclica, inventário rotativo e técnicas para garantir a acuracidade dos dados do sistema.', 15, 'Auxiliar_de_Logistica'),
('Noções de Roteirização', 'Conceitos básicos de distribuição, cálculo de cubagem e otimização de rotas para redução de custos de frete.', 20, 'Auxiliar_de_Logistica'),
('Embalagem e Proteção', 'Padronização de embalagens, uso adequado de filme stretch, cantoneiras e fitas de arquear para segurança da carga.', 8, 'Auxiliar_de_Logistica'),
('Segurança Operacional', 'Normas regulamentadoras aplicadas à logística, uso de EPIs e procedimentos seguros para movimentação de carga.', 10, 'Auxiliar_de_Logistica'),
('Picking e Packing', 'Técnicas de separação de pedidos (discreto, por zona, por lote) para aumentar a velocidade de expedição.', 16, 'Auxiliar_de_Logistica'),
('Logística Reversa', 'Processos de devolução, triagem de retornos, descarte sustentável e reinserção de produtos no estoque.', 12, 'Auxiliar_de_Logistica'),
('Indicadores Logísticos', 'Introdução aos KPIs de operação: On-Time Delivery (OTD), Order Fill Rate e taxa de avarias.', 14, 'Auxiliar_de_Logistica'),

-- Cursos para Auxiliar Fiscal
('Introdução à Legislação', 'Visão geral do sistema tributário brasileiro, esferas de arrecadação e as obrigações acessórias das empresas.', 15, 'Auxiliar_Fiscal'),
('Estrutura da NF-e', 'Análise detalhada do XML da Nota Fiscal Eletrônica, regras de validação e correção de rejeições comuns da SEFAZ.', 20, 'Auxiliar_Fiscal'),
('Dominando CFOP e CST', 'Guia prático para a correta aplicação dos Códigos Fiscais de Operação e Códigos de Situação Tributária nas notas.', 25, 'Auxiliar_Fiscal'),
('Apuração de ICMS e IPI', 'Cálculos de impostos indiretos, regras de substituição tributária, isenções, suspensões e diferimento.', 30, 'Auxiliar_Fiscal'),
('Retenções na Fonte', 'Mapeamento e cálculo de impostos retidos em serviços: IRRF, INSS, CSLL, PIS e COFINS.', 20, 'Auxiliar_Fiscal'),
('Simples Nacional em Foco', 'Regras de enquadramento, anexos, cálculo do DAS e principais particularidades do regime simplificado.', 18, 'Auxiliar_Fiscal'),
('Regimes de Tributação', 'Comparativo prático entre Lucro Presumido e Lucro Real, focando nas rotinas de suporte do auxiliar.', 22, 'Auxiliar_Fiscal'),
('Introdução ao SPED', 'O que é o Sistema Público de Escrituração Digital, blocos essenciais do SPED Fiscal e EFD-Contribuições.', 25, 'Auxiliar_Fiscal'),
('Conciliação Fiscal', 'Técnicas de cruzamento de dados entre o sistema ERP, as notas emitidas e os extratos contábeis.', 16, 'Auxiliar_Fiscal'),
('Organização e Arquivamento', 'Gestão de documentos fiscais digitais e físicos, prazos de guarda e preparação para auditorias.', 8, 'Auxiliar_Fiscal'),

-- Cursos para Supervisor Geral
('Liderança e Gestão', 'Estratégias de gestão de pessoas para supervisores, transição de técnico para líder e delegação de tarefas.', 25, 'Supervisor_Geral'),
('Feedback Efetivo', 'Técnicas de comunicação não-violenta e estruturação de feedbacks corretivos e de reconhecimento.', 15, 'Supervisor_Geral'),
('Gestão de Conflitos', 'Mapeamento de tensões na equipe, mediação de disputas operacionais e reconstrução de clima organizacional.', 20, 'Supervisor_Geral'),
('Planejamento e Metas SMART', 'Como desdobrar os objetivos da diretoria em metas específicas, mensuráveis, alcançáveis e temporais para a equipe.', 18, 'Supervisor_Geral'),
('Análise de Dados Estratégicos', 'Leitura de dashboards, interpretação de relatórios de desempenho e tomada de decisão baseada em fatos.', 30, 'Supervisor_Geral'),
('Produtividade e Tempo', 'Matriz de Eisenhower, priorização de demandas emergenciais e redução de gargalos na rotina de supervisão.', 12, 'Supervisor_Geral'),
('Inteligência Emocional', 'Autocontrole em situações de pressão, resiliência e como manter o engajamento do time em momentos de crise.', 20, 'Supervisor_Geral'),
('Cultura de Segurança', 'O papel do líder na fiscalização de normas de segurança do trabalho e promoção de um ambiente seguro.', 15, 'Supervisor_Geral'),
('Condução de Reuniões', 'Como estruturar pautas, controlar o tempo de fala e gerar planos de ação claros nas reuniões diárias (Daily/DDS).', 10, 'Supervisor_Geral'),
('Avaliação de Desempenho', 'Ferramentas de avaliação 360, criação de Planos de Desenvolvimento Individual (PDI) e retenção de talentos.', 25, 'Supervisor_Geral');