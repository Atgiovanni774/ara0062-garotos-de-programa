/* ===========================================================================
   Portal GACO — camada de dados

   HOJE: os dados ficam nos arrays abaixo (conteúdo de DEMONSTRAÇÃO).
   DEPOIS DO BANCO: só o objeto `API` (no fim do arquivo) precisa mudar.
   Troque o corpo de API.listar() por algo como:

       const r = await fetch('../backend/api/documentos.php');
       return r.json();

   desde que cada documento volte com os mesmos campos abaixo, o resto do
   front (busca, filtros, relatórios) continua funcionando sem alteração.

   Campos de um documento:
     id          código único (ex.: PRO-LOG-014)
     titulo, resumo
     tipo        procedimento | instrucao | legal | seguranca
     area        uma das AREAS
     versao      texto (ex.: "3.1")
     atualizado  AAAA-MM-DD   (data da versão vigente)
     revisao     AAAA-MM-DD   (próxima revisão obrigatória)
     responsavel cargo/área dona do documento
     consultas   contador de consultas (no banco: COUNT de uma tabela de acessos)
     passos[], cuidados[], referencias[], tags[], relacionados[] (ids)

   ATENÇÃO: os textos abaixo são ILUSTRATIVOS, criados para o protótipo.
   Não são os procedimentos oficiais da empresa. Referências a NRs e leis
   existem de verdade, mas o passo a passo deve ser substituído pelo
   documento oficial vigente.
   =========================================================================== */

const TIPOS = {
  procedimento: { rotulo: 'Procedimento',          plural: 'Procedimentos',          cor: 'proc',  icone: 'file'   },
  instrucao:    { rotulo: 'Instrução de trabalho', plural: 'Instruções de trabalho', cor: 'inst',  icone: 'list'   },
  legal:        { rotulo: 'Requisito legal',       plural: 'Requisitos legais',      cor: 'legal', icone: 'scale'  },
  seguranca:    { rotulo: 'Norma de segurança',    plural: 'Normas de segurança',    cor: 'seg',   icone: 'shield' },
};

const AREAS = ['Logística', 'Segurança', 'Meio Ambiente', 'Manutenção', 'Operação', 'Gestão de Pessoas'];

const DOCUMENTOS = [
  {
    id: 'PRO-LOG-014', tipo: 'procedimento', area: 'Logística', versao: '3.1',
    titulo: 'Armazenagem de material reformável',
    resumo: 'Como identificar, registrar e guardar material que volta para reforma, sem misturar com material novo ou sucata.',
    atualizado: '2026-09-12', revisao: '2027-03-12', responsavel: 'Coordenação de Logística', consultas: 214,
    passos: [
      'Confirme que o material tem a etiqueta "Reformável" e o número da ordem de reforma.',
      'Verifique o estado geral e remova resíduos, óleo e fluidos antes de movimentar.',
      'Registre a entrada no sistema de estoque com o status "Aguardando reforma".',
      'Armazene na baia sinalizada para reformáveis, separada de material novo e de sucata.',
      'Confira o endereçamento e proteja o material contra chuva e poeira.',
      'Avise o planejamento de manutenção que o item está disponível para reforma.',
    ],
    cuidados: [
      'Use luvas e calçado de segurança ao movimentar peças.',
      'Peças com resíduo de óleo ficam sobre bandeja de contenção.',
      'Não empilhe acima da altura indicada na sinalização da baia.',
    ],
    referencias: ['NR-11 — Transporte, movimentação, armazenagem e manuseio de materiais', 'Veja também: PRO-LOG-015'],
    tags: ['reformável', 'reforma', 'armazenagem', 'almoxarifado', 'estoque', 'sucata', 'baia'],
    relacionados: ['PRO-LOG-015', 'IT-LOG-021', 'IT-OPE-017'],
  },
  {
    id: 'PRO-LOG-015', tipo: 'procedimento', area: 'Logística', versao: '2.4',
    titulo: 'Devolução de material de aplicação direta',
    resumo: 'Passo a passo para devolver o que foi comprado para um serviço específico e não foi usado.',
    atualizado: '2026-06-03', revisao: '2026-10-15', responsavel: 'Coordenação de Logística', consultas: 187,
    passos: [
      'Confirme que o material não foi usado e está na embalagem original ou em condição equivalente.',
      'Abra a solicitação de devolução informando a ordem de serviço e a quantidade.',
      'Anexe a nota fiscal ou o comprovante de recebimento.',
      'Leve o material à conferência no recebimento para inspeção visual e contagem.',
      'Aguarde a aprovação da conferência antes de liberar o material.',
      'Confirme no sistema o estorno ou a baixa e arquive o comprovante.',
    ],
    cuidados: [
      'Material com validade vencida ou embalagem violada não é aceito de volta.',
      'Produtos químicos devem acompanhar a ficha de segurança (FISPQ).',
    ],
    referencias: ['Política interna de compras e devoluções', 'Veja também: IT-LOG-021'],
    tags: ['devolução', 'aplicação direta', 'estorno', 'nota fiscal', 'sobra', 'material'],
    relacionados: ['IT-LOG-021', 'PRO-LOG-014'],
  },
  {
    id: 'PRO-GES-001', tipo: 'procedimento', area: 'Gestão de Pessoas', versao: '1.3',
    titulo: 'Como encontrar a instrução de trabalho da sua tarefa',
    resumo: 'O caminho curto para descobrir qual documento vale para a atividade que você vai fazer agora.',
    atualizado: '2026-08-20', revisao: '2027-02-20', responsavel: 'Gestão do Conhecimento', consultas: 163,
    passos: [
      'Anote a atividade, a área e o equipamento envolvidos.',
      'Busque pelo nome da atividade ou pelo código do documento.',
      'Filtre por "Instrução de trabalho" e pela sua área.',
      'Confira se a versão aberta é a vigente e se a revisão está em dia.',
      'Leia os cuidados de segurança antes de começar e confirme a leitura.',
      'Se não achar nada, pare e fale com seu supervisor. Depois use "Sugerir documento" no Contato.',
    ],
    cuidados: [
      'Na dúvida entre dois documentos, vale o mais restritivo até o supervisor confirmar.',
      'Não execute a tarefa com documento marcado como "Revisão vencida" sem avisar o supervisor.',
    ],
    referencias: ['Veja também: NOR-SEG-003'],
    tags: ['instrução de trabalho', 'qual documento', 'tarefa', 'atividade', 'integração', 'busca'],
    relacionados: ['NOR-SEG-003', 'PRO-GP-005'],
  },
  {
    id: 'NOR-SEG-003', tipo: 'seguranca', area: 'Segurança', versao: '4.0',
    titulo: 'Análise preliminar de risco e permissão de trabalho',
    resumo: 'Antes de qualquer atividade não rotineira: identificar perigos, definir controles e obter a permissão.',
    atualizado: '2026-10-02', revisao: '2027-04-02', responsavel: 'Segurança do Trabalho', consultas: 241,
    passos: [
      'Descreva a atividade e o local com a equipe que vai executá-la.',
      'Liste os perigos: altura, energia elétrica, espaço confinado, carga suspensa, produtos químicos.',
      'Defina as medidas de controle e os EPIs para cada perigo.',
      'Emita a permissão de trabalho quando a atividade for de risco (altura, confinado, a quente, elétrica).',
      'Faça a conversa de segurança com todos e colete as assinaturas.',
      'Pare a atividade se as condições mudarem e refaça a análise.',
    ],
    cuidados: [
      'Todo colaborador tem o direito e o dever de interromper uma atividade insegura.',
      'A permissão vale só para o local, o período e a equipe descritos nela.',
    ],
    referencias: ['NR-1 — Disposições gerais e gerenciamento de riscos ocupacionais', 'NR-22 — Segurança e saúde ocupacional na mineração'],
    tags: ['APR', 'permissão de trabalho', 'PT', 'risco', 'cuidados de segurança', 'perigos', 'atividade'],
    relacionados: ['NOR-SEG-001', 'NOR-SEG-010', 'NOR-SEG-011', 'NOR-SEG-006'],
  },
  {
    id: 'NOR-SEG-001', tipo: 'seguranca', area: 'Segurança', versao: '3.2',
    titulo: 'Uso, conservação e troca de EPI',
    resumo: 'Qual EPI usar em cada área, como guardar e quando trocar.',
    atualizado: '2026-05-18', revisao: '2027-05-18', responsavel: 'Segurança do Trabalho', consultas: 158,
    passos: [
      'Use sempre o EPI básico na área operacional: capacete, óculos, botina e colete.',
      'Complemente com o EPI da atividade indicado na APR (luvas, protetor auricular, respirador).',
      'Inspecione o EPI antes de cada uso: rachaduras, desgaste, validade e CA.',
      'Substitua imediatamente qualquer item danificado e registre a troca.',
      'Higienize e guarde conforme a orientação do fabricante.',
    ],
    cuidados: [
      'Não improvise nem modifique EPI.',
      'EPI sem Certificado de Aprovação (CA) válido não pode ser usado.',
    ],
    referencias: ['NR-6 — Equipamento de proteção individual'],
    tags: ['EPI', 'capacete', 'luvas', 'óculos', 'bota', 'respirador', 'proteção individual'],
    relacionados: ['NOR-SEG-003'],
  },
  {
    id: 'NOR-SEG-010', tipo: 'seguranca', area: 'Segurança', versao: '2.5',
    titulo: 'Trabalho em altura',
    resumo: 'Requisitos para qualquer atividade acima de 2 metros do nível inferior com risco de queda.',
    atualizado: '2026-07-09', revisao: '2027-01-09', responsavel: 'Segurança do Trabalho', consultas: 176,
    passos: [
      'Confirme que você tem treinamento de altura e aptidão médica válidos.',
      'Faça a APR e emita a permissão de trabalho em altura.',
      'Inspecione cinto, talabarte e pontos de ancoragem antes de subir.',
      'Isole e sinalize a área abaixo contra queda de materiais.',
      'Mantenha 100% de ancoragem, inclusive durante o deslocamento.',
      'Suspenda a atividade em caso de chuva forte, vento ou raios.',
    ],
    cuidados: [
      'Ferramentas devem ser amarradas para evitar queda de objetos.',
      'Nunca trabalhe em altura sozinho sem meio de comunicação e plano de resgate.',
    ],
    referencias: ['NR-35 — Trabalho em altura'],
    tags: ['altura', 'NR-35', 'queda', 'cinto', 'talabarte', 'andaime', 'escada'],
    relacionados: ['NOR-SEG-003', 'NOR-SEG-001'],
  },
  {
    id: 'NOR-SEG-011', tipo: 'seguranca', area: 'Segurança', versao: '2.1',
    titulo: 'Entrada em espaço confinado',
    resumo: 'O que é obrigatório antes, durante e depois de entrar em tanques, silos, galerias e similares.',
    atualizado: '2026-04-27', revisao: '2026-11-30', responsavel: 'Segurança do Trabalho', consultas: 97,
    passos: [
      'Verifique se há Permissão de Entrada e Trabalho (PET) emitida e válida.',
      'Designe o vigia, que fica do lado de fora durante toda a atividade.',
      'Meça a atmosfera: oxigênio, gases inflamáveis e tóxicos.',
      'Isole e bloqueie energias e tubulações que se conectam ao espaço.',
      'Entre somente com comunicação e equipe de resgate disponíveis.',
      'Encerre a PET e registre a saída de todos.',
    ],
    cuidados: [
      'O vigia nunca entra no espaço para resgatar. Ele aciona a equipe de resgate.',
      'Reavalie a atmosfera continuamente, não apenas na entrada.',
    ],
    referencias: ['NR-33 — Segurança e saúde nos trabalhos em espaços confinados'],
    tags: ['espaço confinado', 'NR-33', 'PET', 'vigia', 'tanque', 'silo', 'atmosfera'],
    relacionados: ['NOR-SEG-003', 'NOR-SEG-006'],
  },
  {
    id: 'NOR-SEG-006', tipo: 'seguranca', area: 'Manutenção', versao: '3.0',
    titulo: 'Bloqueio e etiquetagem de energias (LOTO)',
    resumo: 'Como desenergizar, bloquear e sinalizar um equipamento antes de qualquer intervenção.',
    atualizado: '2026-03-30', revisao: '2027-03-30', responsavel: 'Manutenção Industrial', consultas: 133,
    passos: [
      'Comunique a operação e identifique todas as fontes de energia do equipamento.',
      'Desligue e isole as energias: elétrica, hidráulica, pneumática e mecânica.',
      'Aplique seu cadeado pessoal e a etiqueta de bloqueio em cada ponto.',
      'Descarregue a energia residual e teste a ausência de energia.',
      'Só então inicie a intervenção.',
      'Ao terminar, cada pessoa retira o próprio cadeado e a operação confirma a liberação.',
    ],
    cuidados: [
      'Cada pessoa usa seu cadeado. Nunca retire o de outra pessoa.',
      'Teste a partida do equipamento para confirmar que o bloqueio funciona.',
    ],
    referencias: ['NR-10 — Segurança em instalações e serviços em eletricidade', 'NR-12 — Segurança no trabalho em máquinas e equipamentos'],
    tags: ['LOTO', 'bloqueio', 'etiquetagem', 'cadeado', 'energia', 'manutenção', 'desenergizar'],
    relacionados: ['NOR-SEG-003', 'IT-MAN-008'],
  },
  
  {
    id: 'PRO-AMB-009', tipo: 'procedimento', area: 'Meio Ambiente', versao: '1.8',
    titulo: 'Resposta a derramamento de óleo e produtos químicos',
    resumo: 'O que fazer nos primeiros minutos de um vazamento: proteger pessoas, conter e comunicar.',
    atualizado: '2026-09-28', revisao: '2027-03-28', responsavel: 'Meio Ambiente', consultas: 84,
    passos: [
      'Afaste as pessoas e sinalize a área. Corte a fonte do vazamento, se for seguro.',
      'Acione a brigada e o meio ambiente pelo canal de emergência.',
      'Contenha com barreiras e material absorvente do kit de emergência.',
      'Recolha o material contaminado em recipiente identificado.',
      'Registre a ocorrência com local, produto, volume estimado e ações tomadas.',
    ],
    cuidados: [
      'Consulte a FISPQ do produto antes de se aproximar.',
      'Evite que o produto chegue a drenagens e cursos d\'água.',
    ],
    referencias: ['NR-20 — Segurança e saúde no trabalho com inflamáveis e combustíveis'],
    tags: ['vazamento', 'derramamento', 'óleo', 'emergência', 'químico', 'kit mitigação', 'FISPQ'],
    relacionados: ['LEG-AMB-002', 'NOR-SEG-001'],
  },
  {
    id: 'LEG-SEG-004', tipo: 'legal', area: 'Segurança', versao: '1.6',
    titulo: 'Segurança e saúde na mineração (NR-22)',
    resumo: 'Resumo das obrigações da NR-22 que mais afetam o dia a dia da operação.',
    atualizado: '2026-01-22', revisao: '2027-01-22', responsavel: 'Jurídico e Segurança', consultas: 92,
    passos: [
      'Conheça o Programa de Gerenciamento de Riscos da sua área.',
      'Participe dos treinamentos obrigatórios e mantenha os registros em dia.',
      'Cumpra a sinalização e as restrições de acesso das frentes de lavra e pilhas.',
      'Comunique condições inseguras ao supervisor e à CIPA.',
    ],
    cuidados: [
      'O descumprimento de requisitos legais pode causar interdição e responsabilização.',
    ],
    referencias: ['NR-22 — Segurança e saúde ocupacional na mineração'],
    tags: ['NR-22', 'mineração', 'requisito legal', 'norma regulamentadora', 'legislação'],
    relacionados: ['NOR-SEG-003', 'PRO-GP-005'],
  },
  {
    id: 'IT-LOG-021', tipo: 'instrucao', area: 'Logística', versao: '2.0',
    titulo: 'Recebimento e conferência de materiais',
    resumo: 'Como conferir quantidade, qualidade e documentação ao receber um material no almoxarifado.',
    atualizado: '2026-08-05', revisao: '2027-02-05', responsavel: 'Almoxarifado', consultas: 126,
    passos: [
      'Confira a nota fiscal com o pedido de compra.',
      'Inspecione embalagem, quantidade e integridade do material.',
      'Registre divergências com foto e comunique o comprador.',
      'Dê entrada no sistema e identifique com etiqueta de endereçamento.',
      'Encaminhe o material ao local de armazenagem correto.',
    ],
    cuidados: [
      'Use auxílio mecânico para volumes acima do limite de carga manual.',
      'Não receba produto químico sem a FISPQ.',
    ],
    referencias: ['NR-11 — Transporte, movimentação, armazenagem e manuseio de materiais'],
    tags: ['recebimento', 'conferência', 'nota fiscal', 'almoxarifado', 'divergência'],
    relacionados: ['PRO-LOG-014', 'PRO-LOG-015', 'IT-OPE-017'],
  },
  {
    id: 'IT-MAN-008', tipo: 'instrucao', area: 'Manutenção', versao: '1.4',
    titulo: 'Inspeção pré-uso de ferramentas e equipamentos portáteis',
    resumo: 'Checklist rápido para saber se a ferramenta está apta antes de começar o serviço.',
    atualizado: '2026-03-11', revisao: '2026-09-30', responsavel: 'Manutenção Industrial', consultas: 71,
    passos: [
      'Verifique o estado de cabos, plugues, carcaça e proteções.',
      'Confirme que a etiqueta de calibração ou inspeção está válida.',
      'Teste o funcionamento sem carga.',
      'Retire de uso e etiquete como "Defeito" qualquer ferramenta reprovada.',
    ],
    cuidados: [
      'Nunca use ferramenta elétrica com cabo danificado.',
      'Desconecte da energia para trocar acessórios.',
    ],
    referencias: ['NR-12 — Segurança no trabalho em máquinas e equipamentos'],
    tags: ['ferramenta', 'inspeção', 'checklist', 'pré-uso', 'equipamento portátil'],
    relacionados: ['NOR-SEG-006'],
  },
  {
    id: 'IT-OPE-017', tipo: 'instrucao', area: 'Operação', versao: '2.2',
    titulo: 'Movimentação manual e mecânica de cargas',
    resumo: 'Quando levantar à mão, quando usar auxílio mecânico e como sinalizar a movimentação.',
    atualizado: '2026-06-24', revisao: '2027-06-24', responsavel: 'Operação', consultas: 105,
    passos: [
      'Avalie peso, formato e trajeto antes de movimentar.',
      'Use auxílio mecânico quando a carga ultrapassar o limite definido para movimentação manual.',
      'Em movimentação mecânica, isole a rota e use sinaleiro.',
      'Posicione e fixe a carga de forma estável antes de liberar.',
    ],
    cuidados: [
      'Nunca passe sob carga suspensa.',
      'Mantenha a coluna reta e use as pernas ao levantar à mão.',
    ],
    referencias: ['NR-11 — Transporte, movimentação, armazenagem e manuseio de materiais'],
    tags: ['carga', 'movimentação', 'içamento', 'empilhadeira', 'ergonomia', 'peso'],
    relacionados: ['PRO-LOG-014', 'IT-LOG-021'],
  },
  {
    id: 'PRO-GP-005', tipo: 'procedimento', area: 'Gestão de Pessoas', versao: '2.0',
    titulo: 'Integração de novos colaboradores',
    resumo: 'Roteiro das primeiras semanas: o que ler, quais treinamentos fazer e quem acompanha.',
    atualizado: '2026-07-30', revisao: '2027-07-30', responsavel: 'Gestão de Pessoas', consultas: 138,
    passos: [
      'Receba o acesso ao portal e o seu tutor na área.',
      'Conclua a trilha "Integração do novo colaborador" nos primeiros dias.',
      'Confirme a leitura dos documentos obrigatórios da sua função.',
      'Acompanhe o tutor nas primeiras atividades antes de executar sozinho.',
      'Faça a avaliação de fim de integração com o supervisor.',
    ],
    cuidados: [
      'Nenhuma atividade de risco é liberada antes dos treinamentos obrigatórios.',
    ],
    referencias: ['NR-1 — Disposições gerais e gerenciamento de riscos ocupacionais'],
    tags: ['integração', 'novo colaborador', 'treinamento', 'onboarding', 'tutor'],
    relacionados: ['PRO-GES-001', 'NOR-SEG-001', 'LEG-SEG-004'],
  },
];

/* Dúvidas do dia a dia. As quatro primeiras vêm direto da demanda. */
const PERGUNTAS = [
  {
    q: 'Como faço armazenagem de material reformável?',
    resp: 'Identifique com a etiqueta "Reformável", registre a entrada como "Aguardando reforma" e guarde na baia sinalizada, longe de material novo e de sucata.',
    docs: ['PRO-LOG-014'],
  },
  {
    q: 'Como faço devolução de material de aplicação direta?',
    resp: 'Abra a solicitação de devolução com a ordem de serviço, anexe a nota e leve o material para conferência. A baixa só vale depois da aprovação.',
    docs: ['PRO-LOG-015', 'IT-LOG-021'],
  },
  {
    q: 'Quais cuidados de segurança devo seguir nesta atividade?',
    resp: 'Comece sempre pela APR e pelo EPI básico. Se a tarefa envolve altura, espaço confinado ou energia, siga também a norma específica.',
    docs: ['NOR-SEG-003', 'NOR-SEG-001', 'NOR-SEG-010', 'NOR-SEG-011', 'NOR-SEG-006'],
  },
  {
    q: 'Qual instrução de trabalho se aplica a esta tarefa?',
    resp: 'Busque pelo nome da atividade, filtre por "Instrução de trabalho" e confira a versão vigente. Se não achar, pare e fale com o supervisor.',
    docs: ['PRO-GES-001', 'IT-LOG-021', 'IT-OPE-017', 'IT-MAN-008'],
  },
  {
    q: 'O que fazer se houver um vazamento de óleo ou produto químico?',
    resp: 'Afaste as pessoas, corte a fonte se for seguro, acione a emergência e contenha com o kit absorvente. Depois registre a ocorrência.',
    docs: ['PRO-AMB-009', 'LEG-AMB-002'],
  },
  {
    q: 'Como descarto cada tipo de resíduo?',
    resp: 'Separe na origem pelo código de cores. Resíduo perigoso vai para o ponto de armazenamento temporário, nunca para a lixeira comum.',
    docs: ['LEG-AMB-002'],
  },
  {
    q: 'Estou começando agora. Por onde eu começo?',
    resp: 'Faça a trilha de integração, leia e confirme os documentos obrigatórios e acompanhe seu tutor antes de atuar sozinho.',
    docs: ['PRO-GP-005', 'PRO-GES-001', 'NOR-SEG-001'],
  },
];

/* Único ponto de acesso aos dados. Troque aqui quando o banco estiver pronto. */
const API = {
  async listar() {
    return DOCUMENTOS;
  },
};
