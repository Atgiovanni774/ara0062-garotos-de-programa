# Portal de Gestão e Acesso ao Conhecimento Operacional

*Assunto:* Centralização, padronização e consulta de procedimentos, instruções de trabalho e normas de segurança.

*Equipe Garotos de Programa:* Arthur Giovanni Lacerda Lisboa · Jonata Romano Guimarães · Guilherme Lopes Gomes · Matheus Tadeu Nunes Vidigal Tiote · Felipe Herminio Nunes · Marcos Rodrigues Rosa

*Disciplina:* ARA0062 — Desenvolvimento Web em HTML5, CSS, JavaScript e PHP

*Centro Universitário Newton Paiva · 2026/2*

---

## Sobre o projeto

O *Portal de Gestão e Acesso ao Conhecimento Operacional* é uma aplicação web desenvolvida para centralizar informações relacionadas a procedimentos, instruções de trabalho, treinamentos e normas de segurança. O sistema foi pensado para facilitar o acesso e a organização do conhecimento operacional, permitindo que os usuários naveguem pelas diferentes áreas do sistema por meio de um menu lateral.

A aplicação conta com uma página principal com informações da equipe, uma área de pesquisa rápida, procedimentos operacionais, treinamentos, relatórios e configurações. Durante o desenvolvimento, também serão incorporados recursos de validação e interação com JavaScript, processamento no servidor utilizando PHP e integração com banco de dados para armazenamento e consulta das informações.

---

## Identidade visual

A identidade visual foi desenvolvida com foco em **organização, clareza, legibilidade e aparência profissional**, utilizando uma combinação de verde-escuro, tons de cinza e branco. A estrutura visual utiliza uma navegação lateral fixa e cartões para organizar os diferentes conteúdos do sistema.

### Paleta

| Papel | Cor | Por que esta |
| :--- | :--- | :--- |
| `--principal` | `#1f6f5c` | Cor principal da interface, utilizada no cabeçalho, títulos e botões principais para transmitir seriedade e confiabilidade. |
| `--sobre-principal` | `#ffffff` | Cor do texto exibido sobre a cor principal, garantindo forte contraste e legibilidade. |
| `--fundo` | `#e8f1ee` | Fundo geral da página, criando contraste suave com as áreas de conteúdo. |
| `--superficie` | `#ffffff` | Fundo dos cartões e das áreas principais de conteúdo. |
| `--texto` | `#222222` | Cor principal dos textos, priorizando máxima legibilidade. |

### Segundo tema (`tema-noite.css`)

O projeto possui um segundo tema implementado em um arquivo separado (`frontend/css/tema-noite.css`), que altera as variáveis do `:root` para tons escuros, indicado para uso noturno ou ambientes com pouca luz.

| Variável | Tema padrão | Modo escuro |
| :--- | :--- | :--- |
| `--principal` | `#1f6f5c` | `#dfa03f` |
| `--sobre-principal` | `#ffffff` | `#1b1016` |
| `--fundo` | `#e8f1ee` | `#1b1016` |
| `--superficie` | `#ffffff` | `#2a1a22` |
| `--texto` | `#222222` | `#f0e8ec` |

### Contraste (Conferido no WebAIM Contrast Checker)

* **--texto sobre --superficie** ............. 15,9:1 (Aprovado)
* **--principal sobre --superficie** ............. 5,4:1 (Aprovado)
* **--texto-fraco sobre --fundo** ............. 6,1:1 (Aprovado)
* **--sobre-principal sobre --principal** ............. 5,4:1 (Aprovado)

### Tipografia

**Fonte:** `Poppins`, com plano B `Arial, sans-serif`.  
**Pesos:** 400 e 600.  
**Escala utilizada:** `h1: 2.5rem`, `h2: 1.75rem`, `h3: 1.25rem`, corpo: `1rem`.

---
## Funcionalidades

O sistema está organizado em diferentes áreas acessíveis pelo menu lateral:

* *Principal / Equipe:* apresenta a identificação do projeto, imagem e informações dos integrantes.
* *Pesquisa Rápida:* permite inserir um termo para pesquisa no sistema.
* *Procedimentos:* apresenta procedimentos operacionais organizados em cartões.
* *Treinamentos:* apresenta módulos de capacitação técnica.
* *Relatórios:* apresenta informações sobre o andamento e desempenho do projeto.
* *Configurações:* disponibiliza a seleção entre o tema padrão e o modo escuro.

---

## Como abrir

1. Abra a *pasta inteira do projeto* no VS Code (Arquivo → Abrir Pasta).
2. Abra o arquivo frontend/index.html.
3. Clique em *Go Live, utilizando a extensão **Live Server*.

Como o index.html está dentro da pasta frontend/, os caminhos relativos utilizados são:

| Para acessar     | Caminho no index.html           |
| ---------------- | --------------------------------- |
| Folha de estilos | css/estilo.css                  |
| JavaScript       | js/script.js                    |
| Imagens          | img/foto.jpg                    |
| Backend          | ../backend/processa-contato.php |

---

## Estrutura

text
.
├─ README.md                  esta folha de rosto
├─ frontend/                  tudo o que roda no navegador
│  ├─ index.html              página principal
│  ├─ css/
│  │  └─ estilo.css           folha de estilos do projeto
│  ├─ js/
│  │  └─ script.js            comportamento e interações
│  └─ img/
│     └─ .gitkeep             mantém a pasta no Git
└─ backend/                   tudo o que roda no servidor
   ├─ config/
   │  └─ conexao.php          conexão com o banco de dados
   └─ processa-contato.php    processamento do formulário


---

## Quem fez o quê

| Integrante                            |  Principais Responsabilidade       |
| ------------------------------------- | ---------------------------------- |
| *Arthur Giovanni Lacerda Lisboa*    | Liderança e organização do projeto |
| *Jonata Romano Guimarães*           | Tipografia                       |
| *Guilherme Lopes Gomes*             | HTML Body                        |
| *Matheus Tadeu Nunes Vidigal Tiote* | Cabeçalho e Navegação            |
| *Felipe Herminio Nunes*             | Tabelas                          |
| *Marcos Rodrigues Rosa*             | Formulários                      |

---

## Andamento por ciclo

* [x] *Ciclo 3* — Repositório, equipe e estrutura do projeto
* [x] *Ciclo 3* — frontend/: página com listas, tabela e formulário de contato
* [x] *Ciclos 4 e 5* — frontend/css/: identidade visual, layout e responsividade
* [x] *Ciclos 6 e 7* — frontend/js/: interação, validação e dados via JSON
* [ ] *Ciclos 8 a 10* — backend/: formulário, integração e operações com o banco de dados

---

## Tecnologias utilizadas

* *HTML5* — estrutura e organização semântica das páginas.
* *CSS3* — estilização, layout, responsividade e temas visuais.
* *JavaScript* — interações, navegação entre seções e funcionalidades dinâmicas.
* *Git/GitHub* — controle de versão e colaboração da equipe.
