# Portal de Gestão e Acesso ao Conhecimento Operacional

*Assunto:* Centralização, padronização e consulta de procedimentos, instruções de trabalho e normas de segurança.

*Equipe Garotos de Programa:* Arthur Giovanni Lacerda Lisboa · Jonata Romano Guimarães · Guilherme Lopes Gomes · Matheus Tadeu Nunes Vidigal Tiote · Felipe Herminio Nunes · Marcos Rodrigues Rosa

*Disciplina:* ARA0062 — Desenvolvimento Web em HTML5, CSS, JavaScript e PHP

*Centro Universitário Newton Paiva · 2026/2*

---

## Sobre o projeto

O *Portal de Gestão e Acesso ao Conhecimento Operacional* é uma aplicação web desenvolvida para centralizar informações relacionadas a procedimentos, instruções de trabalho, treinamentos e normas de segurança. O sistema foi pensado para facilitar o acesso e a organização do conhecimento operacional, permitindo que os usuários naveguem pelas diferentes áreas do sistema por meio de um menu lateral.

A aplicação conta com pesquisa rápida, procedimentos operacionais, treinamentos, relatórios, configurações e autenticação por papéis. PHP e MySQL atendem a sessão, cadastro, permissões e solicitações de contato/editoriais.

---

## Identidade visual

A identidade visual foi pensada para um portal de uso diário no chão de operação: **clareza, leitura rápida e aparência profissional**. A cor principal é um verde-mineral. Cada tipo de documento tem uma cor própria, inspirada em sinalização de segurança, e aparece como uma lombada colorida na lateral do cartão, para o colaborador reconhecer o tipo sem ler. O topo da página inicial usa curvas de nível (mapa topográfico) como referência ao ambiente de mineração.

### Paleta

| Papel | Cor | Uso |
| :--- | :--- | :--- |
| `--principal` | `#1f6f5c` | Botões principais, links, destaques e hero. |
| `--sobre-principal` | `#ffffff` | Texto sobre a cor principal. |
| `--fundo` | `#e8f1ee` | Fundo geral da página. |
| `--superficie` | `#ffffff` | Painéis e cartões. |
| `--texto` | `#1c2723` | Texto principal. |
| `--texto-fraco` | `#4d5c56` | Textos de apoio. |
| `--cat-proc` | `#1f6f5c` | Procedimento (verde). |
| `--cat-inst` | `#1d6aa5` | Instrução de trabalho (azul). |
| `--cat-legal` | `#6d4bb5` | Requisito legal (roxo). |
| `--cat-seg` | `#d9640f` | Norma de segurança (laranja). |

### Segundo tema (`tema-noite.css`)

O tema escuro fica em um arquivo separado (`frontend/css/tema-noite.css`) e só redefine as variáveis do `:root` quando o `<html>` recebe a classe `dark-mode`. Pode ser escolhido em Configurações, pelo botão da barra superior ou seguir a preferência do aparelho (modo Automático).

| Variável | Tema padrão | Modo escuro |
| :--- | :--- | :--- |
| `--principal` | `#1f6f5c` | `#4cc3a0` |
| `--sobre-principal` | `#ffffff` | `#062a21` |
| `--fundo` | `#e8f1ee` | `#0c1411` |
| `--superficie` | `#ffffff` | `#141e1a` |
| `--texto` | `#1c2723` | `#e5eee9` |

### Tipografia

**Fonte:** `Poppins`, com plano B `Arial, sans-serif`. **Pesos:** 400, 500, 600 e 700.
**Escala:** título de página `2rem`, painéis `1.15rem`, corpo `1rem`. Nunca abaixo de `.75rem`.

---

## Funcionalidades

Tudo roda em uma página só, com rotas pelo endereço (`#/biblioteca?q=altura`), então qualquer tela ou documento pode ser compartilhado por link.

* *Início:* busca grande, buscas frequentes, indicadores de documentos e cursos disponíveis, visualizados e concluídos, dúvidas do dia a dia, atualizados recentemente, atalhos por tipo e favoritos.
* *Busca global (barra superior):* sugestões enquanto digita, setas e Enter, atalho `/`. Ignora acentos, aceita plural e exige todas as palavras.
* *Biblioteca:* filtros por tipo e área, ordenação, só favoritos, termo destacado nos resultados e trecho do passo quando o termo só aparece dentro do documento.
* *Ficha do documento:* passo a passo, cuidados de segurança, referências legais, versão, responsável, prazo de revisão, documentos relacionados, favoritar, copiar link, imprimir e **"Li e entendi"** (vale por versão: se o documento mudar, pede de novo).
* *Dúvidas rápidas:* as perguntas reais da demanda, já respondidas, com os documentos completos.
* *Treinamentos:* cursos ativos carregados da tabela `cursos`, organizados em trilhas com checkboxes e barra de progresso; visualizações e conclusões ficam salvas por usuário na tabela `progresso_curso`. Cada curso oferece um PDF ilustrativo gerado com os dados do banco. Auxiliares veem apenas os cursos do próprio setor e o supervisor_geral vê os cursos de todos os setores.
* *Relatórios:* documentos por tipo e área, mais consultados, revisões vencidas ou próximas, **buscas sem resultado** (lacunas de conteúdo) e exportação em CSV.
* *Contato:* sugerir documento, avisar que está desatualizado ou tirar dúvida (grava no banco via PHP).
* *Colaborador:* consulta documentos e treinamentos e envia solicitações.
* *Auxiliar Fiscal:* consulta documentos e cursos do setor fiscal, sem acesso a Relatórios nem Solicitações de conteúdo.
* *Supervisor Geral:* acessa todas as áreas, Relatórios, Solicitações de conteúdo e gestão de usuários, além de aprovar cadastros e bloquear contas.
* *Cadastro:* colaborador pode entrar após criar a conta; pedidos de gestor/supervisor_geral ficam pendentes até aprovação.
* *Equipe e desafio:* resumo da demanda e tabela "causa do problema → resposta do portal".
* *Configurações:* tema, tamanho do texto, reduzir animações e apagar dados salvos.

O conteúdo dos 14 documentos é **de demonstração**. As normas e leis citadas (NR-6, NR-11, NR-22, NR-33, NR-35, Lei 12.305/2010 etc.) existem, mas os passo a passo são ilustrativos e devem ser trocados pelos documentos oficiais.

---

## Como abrir

O login depende de PHP e MySQL; abrir com Live Server não executa o backend.

1. No XAMPP, copie a pasta do repositório para `C:\xampp\htdocs\ara0062-garotos-de-programa-main`. Se o nome da pasta for diferente, use esse nome no endereço do último passo.
2. No painel do XAMPP, inicie Apache e MySQL.
3. Abra `http://localhost/phpmyadmin`, selecione **Importar** e escolha `backend/sql/banco.sql`. O arquivo cria o banco `login` e as tabelas necessárias para o projeto. Para uma instalação nova, não execute também os arquivos de migração.
4. Confira host, banco e credenciais em `backend/config/conexao.php`.
5. No terminal, entre na pasta do projeto e crie a conta inicial de supervisor:
   - PowerShell: `& C:\xampp\php\php.exe backend\criar-admin.php`
   - Linux/macOS com PHP no `PATH`: `php backend/criar-admin.php`
6. Abra `http://localhost/ara0062-garotos-de-programa-main/frontend/`. Entre com a conta criada; em **Contato**, envie uma mensagem e, como supervisor, confira o novo registro em **Solicitações de conteúdo**.

Para atualizar um banco já existente, faça backup antes de aplicar migrações. Execute `backend/sql/migracao-auth.sql` e `backend/sql/migracao-progresso-cursos.sql` somente quando o banco ainda não tiver as alterações correspondentes.

Os estilos ficam exclusivamente nas folhas externas `frontend/css/estilo.css` e `frontend/css/tema-noite.css`.

## Estrutura
```
├─ README.md                  esta folha de rosto
├─ frontend/                  tudo o que roda no navegador
│  ├─ index.html              página única com todas as telas
│  ├─ css/
│  │  ├─ estilo.css           folha de estilos do projeto
│  │  └─ tema-noite.css       variáveis do modo escuro
│  ├─ js/
│  │  ├─ dados.js             documentos, dúvidas e a camada API
│  │  ├─ script.js            rotas, busca, ficha do documento e telas
│  │  └─ tema-inicial.js      aplica as preferências visuais salvas
│  └─ img/
│     └─ .gitkeep             mantém a pasta no Git
└─ backend/                   tudo o que roda no servidor
   ├─ config/
   │  ├─ conexao.php          conexão com o banco de dados
   │  └─ cursos.php           consulta de cursos conforme o setor
   ├─ sql/
   │  ├─ banco.sql            criação do banco, mensagens e usuários
   │  ├─ migracao-auth.sql    migração para bancos já existentes
   │  └─ migracao-progresso-cursos.sql  progresso persistente por usuário
   ├─ auth.php                cadastro, sessão e administração de contas
   ├─ cursos.php              lista cursos ativos conforme o setor do usuário
   ├─ curso-pdf.php           gera PDF ilustrativo para um curso autorizado
   ├─ criar-admin.php         provisionamento do primeiro supervisor_geral (CLI)
   ├─ processa-contato.php    processamento do formulário
   ├─ mensagens.php           fila editorial protegida por papel
   └─ teste-conexao.php       testa a conexão do PHP com o banco de dados
```

## Dados da biblioteca e do banco

Os documentos da biblioteca e as perguntas rápidas são conteúdo de demonstração em `frontend/js/dados.js`. O formulário de contato, os cursos e as contas já usam MySQL. As solicitações gravadas são listadas dinamicamente pela tela **Solicitações de conteúdo**, por consulta PHP ao banco. Para uma evolução futura, o catálogo de documentos também pode ser movido para o banco, mantendo o formato de dados consumido pela interface:

| Campo no JSON | Sugestão de coluna |
| :--- | :--- |
| `id` (ex.: PRO-LOG-014) | `codigo` (único) |
| `titulo`, `resumo` | `titulo`, `resumo` |
| `tipo` (procedimento, instrucao, legal, seguranca) | `tipo` |
| `area`, `versao`, `responsavel` | `area`, `versao`, `responsavel` |
| `atualizado`, `revisao` (AAAA-MM-DD) | `atualizado_em`, `revisao_em` |
| `passos[]`, `cuidados[]`, `referencias[]`, `tags[]` | tabelas filhas (ou uma coluna JSON) |
| `relacionados[]` (códigos) | tabela de ligação documento ↔ documento |
| `consultas` | contagem de uma tabela de acessos |

Favoritos, leituras confirmadas, progresso dos treinamentos e buscas sem resultado ainda ficam no navegador (`localStorage`), independentemente do login. Contas e mensagens ficam no banco. Os assuntos de contato são `duvida`, `sugestao`, `desatualizado` e `outro`.

---

## Quem fez o quê

| Integrante                            |  Principais Responsabilidade       | Matrícula                          | Usuário GitHub                     | 
| ------------------------------------- | ---------------------------------- | ---------------------------------- | ---------------------------------- |
| *Arthur Giovanni Lacerda Lisboa*      | Liderança e organização do projeto | 202601758233                       | @Atgiovanni774                     |
| *Jonata Romano Guimarães*             | Criação e integração Banco de Dados| 202603331725                       | @JonataRomano                      |
| *Guilherme Lopes Gomes*               | HTML Body                          | 202602601851                       | @Guilhermez7                       |
| *Matheus Tadeu Nunes Vidigal Tiote*   | Cabeçalho e Navegação              | 202603302521                       | @matheustnvtiote-commits           |
| *Felipe Herminio Nunes*               | Tabelas                            |                                    |                                    |
| *Marcos Rodrigues Rosa*               | Formulários                        |                                    |                                    |

---

## Andamento por ciclo

* [x] *Ciclo 3* — Repositório, equipe e estrutura do projeto
* [x] *Ciclo 3* — frontend/: página com listas, tabela e formulário de contato
* [x] *Ciclos 4 e 5* — frontend/css/: identidade visual, layout e responsividade
* [x] *Ciclos 6 e 7* — frontend/js/: interação, validação e dados via JSON
* [x] *Ciclos 8 a 10* — backend/: formulário, integração e operações com o banco de dados

---

## Tecnologias utilizadas

* *HTML5* — estrutura e organização semântica das páginas.
* *CSS3* — estilização, layout, responsividade e temas visuais.
* *JavaScript* — interações, navegação entre seções e funcionalidades dinâmicas.
* *PHP* - processamento no servidor, validação de formulários e integração back-end.
* *SQL* - criação, estruturação e persistência de dados no banco relacional.
* *Git/GitHub* — controle de versão e colaboração da equipe.
