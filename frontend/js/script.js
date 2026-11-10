/* ===========================================================================
   Portal GACO: comportamento da página
   Depende de dados.js (TIPOS, AREAS, DOCUMENTOS, PERGUNTAS, API).
   Organização: utilidades → estado → busca → telas → ficha → eventos → início
   =========================================================================== */
(() => {
  'use strict';

  /* ---------- utilidades ---------- */
  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const $$ = (sel, raiz = document) => Array.from(raiz.querySelectorAll(sel));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const fmtData = (iso) => { const [a, m, d] = iso.split('-'); return `${d}/${m}/${a}`; };
  const hojeZero = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const diasAte = (iso) => Math.round((new Date(iso + 'T00:00:00') - hojeZero()) / 86400000);
  const icone = (nome) => `<svg class="ic" aria-hidden="true"><use href="#i-${nome}"/></svg>`;
  const plural = (n, um, varios) => (n === 1 ? um : varios);

  const memoria = {
    ler(chave, padrao) {
      try { const v = localStorage.getItem('gaco-' + chave); return v === null ? padrao : JSON.parse(v); } catch { return padrao; }
    },
    gravar(chave, valor) {
      try { localStorage.setItem('gaco-' + chave, JSON.stringify(valor)); } catch { /* sem armazenamento: segue sem salvar */ }
    },
    limparTudo() {
      try { Object.keys(localStorage).filter((k) => k.startsWith('gaco-')).forEach((k) => localStorage.removeItem(k)); } catch { /* ignora */ }
    },
  };

  /* ---------- estado ---------- */
  const estado = {
    docs: [],
    favoritos: new Set(memoria.ler('favoritos', [])),
    lidos: memoria.ler('lidos', {}),             // { id: { versao, em } }
    progresso: {},
    trilhas: [],
    cursos: null,
    cursosVisualizados: new Set(),
    consultas: memoria.ler('consultas', {}),     // { id: n }
    vazias: memoria.ler('buscas-vazias', {}),    // { termoNormalizado: { termo, n, ultima } }
    prefs: Object.assign({ tema: 'auto', texto: 'normal', movimento: 'normal' }, memoria.ler('prefs', {})),
    filtros: { q: '', tipo: '', area: '', ordem: 'relevancia', fav: false },
    tela: '',
    docAberto: '',
    docPorNavegacao: false,
    usuario: null,
    csrf: '',
  };

  const TELAS = ['inicio', 'biblioteca', 'perguntas', 'treinamentos', 'relatorios', 'conteudos', 'usuarios', 'contato', 'equipe', 'configuracoes'];
  const docPorId = (id) => estado.docs.find((d) => d.id === id);

  const ROTULOS_PAPEL = {
    auxiliar_de_logistica: 'Auxiliar de Logística',
    auxiliar_fiscal: 'Auxiliar Fiscal',
    supervisor_geral: 'Supervisor Geral',
  };

  async function requisicaoApi(url, opcoes = {}) {
    const headers = Object.assign({ 'Accept': 'application/json' }, opcoes.headers || {});
    if (opcoes.body && typeof opcoes.body !== 'string') {
      headers['Content-Type'] = 'application/json';
      opcoes.body = JSON.stringify(opcoes.body);
    }
    if (estado.csrf) headers['X-CSRF-Token'] = estado.csrf;
    const resposta = await fetch(url, Object.assign({ credentials: 'same-origin' }, opcoes, { headers }));
    let dados;
    try { dados = await resposta.json(); } catch { throw new Error('Resposta inválida do servidor.'); }
    if (!resposta.ok) throw new Error(dados.erro || 'Não foi possível concluir a operação.');
    return dados;
  }

  function podeAcessar(tela) {
    if (tela === 'relatorios' || tela === 'conteudos') return estado.usuario?.papel === 'supervisor_geral';
    if (tela === 'usuarios') return estado.usuario?.papel === 'supervisor_geral';
    return !!estado.usuario;
  }

  function atualizarAcessoUsuario() {
    const usuario = estado.usuario;
    $('#acesso').hidden = !!usuario;
    $('#menu').hidden = !usuario;
    $('#aplicacao').hidden = !usuario;
    if (!usuario) return;
    $('#usuario-identidade').textContent = `${usuario.nome} · ${ROTULOS_PAPEL[usuario.papel] || usuario.papel}`;
    $$('[data-perfil]').forEach((item) => {
      item.hidden = !item.dataset.perfil.split(',').map((papel) => papel.trim()).includes(usuario.papel);
    });
  }

  function mostrarAcesso(mensagem = '', csrf = '') {
    estado.usuario = null;
    estado.csrf = csrf;
    atualizarAcessoUsuario();
    $('#mensagem-acesso').textContent = mensagem;
    document.title = 'Entrar · Portal GACO';
  }

  async function abrirAplicacao(usuario, csrf) {
    estado.usuario = usuario;
    estado.csrf = csrf || '';
    estado.progresso = {};
    estado.cursosVisualizados = new Set();
    estado.cursos = null;
    try {
      await carregarDocumentos();
    } catch (erro) {
      mostrarAcesso('Não foi possível carregar os documentos. Verifique a conexão e tente novamente.');
      console.error(erro);
      return;
    }
    atualizarAcessoUsuario();
    if (!location.hash || location.hash === '#/acesso') location.hash = '#/inicio';
    else rotear();
  }

  function alternarFormularioAcesso(modo) {
    const registrar = modo === 'registrar';
    $('#form-entrar').hidden = registrar;
    $('#form-registro').hidden = !registrar;
    $('#titulo-acesso').textContent = registrar ? 'Crie sua conta' : 'Entre no portal';
    $('#mensagem-acesso').textContent = '';
    $$('[data-modo-acesso]').forEach((botao) => {
      const ativo = botao.dataset.modoAcesso === modo;
      botao.classList.toggle('ativa', ativo);
      botao.setAttribute('aria-pressed', String(ativo));
    });
  }

  async function renderUsuarios() {
    const destino = $('#lista-usuarios');
    destino.innerHTML = '<p class="ajuda">Carregando contas…</p>';
    try {
      const { usuarios } = await requisicaoApi('../backend/auth.php?acao=usuarios');
      destino.innerHTML = usuarios.length ? usuarios.map((u) => `
        <article class="usuario-card" data-usuario-id="${Number(u.id)}">
          <div class="usuario-dados"><strong>${esc(u.nome)}</strong><span>${esc(u.email)}</span><small>Cadastro: ${esc(u.criado_em)}</small></div>
          <label>Papel<select data-papel-usuario>
            <option value="colaborador" ${u.papel === 'colaborador' ? 'selected' : ''}>Colaborador</option>
            <option value="auxiliar_fiscal" ${u.papel === 'auxiliar_fiscal' ? 'selected' : ''}>Auxiliar Fiscal</option>
            <option value="supervisor_geral" ${u.papel === 'supervisor_geral' ? 'selected' : ''}>supervisor_geral</option>
          </select></label>
          <label>Status<select data-status-usuario>
            <option value="ativo" ${u.status === 'ativo' ? 'selected' : ''}>Ativo</option>
            <option value="pendente" ${u.status === 'pendente' ? 'selected' : ''}>Pendente</option>
            <option value="bloqueado" ${u.status === 'bloqueado' ? 'selected' : ''}>Bloqueado</option>
          </select></label>
          <button type="button" class="btn btn-secundario" data-salvar-usuario>Salvar</button>
        </article>`).join('') : '<div class="vazio"><strong>Nenhuma conta cadastrada</strong></div>';
    } catch (erro) {
      destino.innerHTML = `<p class="aviso erro">${esc(erro.message)}</p>`;
    }
  }

  async function renderSolicitacoes() {
    const destino = $('#lista-conteudos');
    destino.innerHTML = '<p class="ajuda">Carregando solicitações…</p>';
    try {
      const { mensagens } = await requisicaoApi('../backend/mensagens.php');
      destino.innerHTML = mensagens.length ? mensagens.map((m) => `
        <article class="solicitacao-card" data-mensagem-id="${Number(m.id)}">
          <div class="solicitacao-cab"><div><strong>${esc(m.assunto === 'desatualizado' ? 'Documento desatualizado' : m.assunto === 'sugestao' ? 'Sugestão de conteúdo' : 'Contato')}</strong><span>${esc(m.nome)} · ${esc(m.email)}</span></div><time>${esc(m.criada_em)}</time></div>
          <p>${esc(m.mensagem)}</p>
          <div class="solicitacao-acoes"><label>Status<select data-status-mensagem>
            <option value="nova" ${m.status === 'nova' ? 'selected' : ''}>Nova</option>
            <option value="em_analise" ${m.status === 'em_analise' ? 'selected' : ''}>Em análise</option>
            <option value="resolvida" ${m.status === 'resolvida' ? 'selected' : ''}>Resolvida</option>
          </select></label><button type="button" class="btn btn-secundario" data-salvar-mensagem>Atualizar</button></div>
        </article>`).join('') : '<div class="vazio"><strong>Nenhuma solicitação</strong>As sugestões de conteúdo aparecerão aqui.</div>';
    } catch (erro) {
      destino.innerHTML = `<p class="aviso erro">${esc(erro.message)}</p>`;
    }
  }

  /* ---------- preferências (tema, texto, movimento) ---------- */
  const mqEscuro = window.matchMedia('(prefers-color-scheme: dark)');

  function temaEscuroAtivo() {
    return estado.prefs.tema === 'escuro' || (estado.prefs.tema === 'auto' && mqEscuro.matches);
  }

  function aplicarPrefs() {
    const raiz = document.documentElement;
    const escuro = temaEscuroAtivo();
    raiz.classList.toggle('dark-mode', escuro);
    raiz.classList.toggle('texto-grande', estado.prefs.texto === 'grande');
    raiz.classList.toggle('sem-movimento', estado.prefs.movimento === 'reduzido');

    const btn = $('#btn-tema');
    btn.innerHTML = icone(escuro ? 'sun' : 'moon');
    btn.setAttribute('aria-label', escuro ? 'Mudar para o tema claro' : 'Mudar para o tema escuro');

    $$('input[name="tema"]').forEach((r) => { r.checked = r.value === estado.prefs.tema; });
    $$('input[name="texto"]').forEach((r) => { r.checked = r.value === estado.prefs.texto; });
    $('#cfg-movimento').checked = estado.prefs.movimento === 'reduzido';
  }

  function salvarPrefs(mudancas) {
    Object.assign(estado.prefs, mudancas);
    memoria.gravar('prefs', estado.prefs);
    aplicarPrefs();
  }

  /* ---------- aviso rápido (toast) ---------- */
  let timerToast;
  function avisar(texto) {
    const t = $('#toast');
    t.textContent = texto;
    t.classList.add('visivel');
    clearTimeout(timerToast);
    timerToast = setTimeout(() => t.classList.remove('visivel'), 2600);
  }

  /* =========================================================================
     BUSCA
     Ignora acento e maiúscula, aceita plural ("reformáveis" acha "reformável")
     e exige que TODAS as palavras digitadas apareçam no documento.
     ========================================================================= */
  const radical = (w) => {
    if (w.length <= 3) return w;
    const mapa = { oes: 'ao', aes: 'ao', ais: 'al', eis: 'el', ois: 'ol' };
    return w.replace(/(oes|aes|ais|eis|ois)$/, (m) => mapa[m]).replace(/(es|s)$/, '');
  };
  const palavras = (texto) => norm(texto).split(/[^a-z0-9]+/).filter(Boolean);
  const tokensDe = (q) => palavras(q).map(radical);
  const indexar = (texto) => palavras(texto).map(radical).join(' ');

  function prepararIndice(d) {
    d._i = {
      titulo: indexar(d.titulo),
      id: indexar(d.id),
      tags: indexar(d.tags.join(' ')),
      resumo: indexar(d.resumo),
      corpo: indexar([...d.passos, ...d.cuidados, ...d.referencias, d.area, d.responsavel, TIPOS[d.tipo].rotulo].join(' ')),
    };
  }

  function pontuar(d, toks) {
    let total = 0;
    for (const t of toks) {
      let p = 0;
      if (d._i.titulo.includes(t)) p += 6;
      if (d._i.id.includes(t)) p += 5;
      if (d._i.tags.includes(t)) p += 4;
      if (d._i.resumo.includes(t)) p += 2;
      if (d._i.corpo.includes(t)) p += 1;
      if (!p) return 0;
      total += p;
    }
    return total;
  }

  const popularidade = (d) => d.consultas + (estado.consultas[d.id] || 0);

  function buscar({ q = '', tipo = '', area = '', ordem = 'relevancia', fav = false } = {}) {
    const toks = tokensDe(q);
    let lista = estado.docs
      .filter((d) => (!tipo || d.tipo === tipo) && (!area || d.area === area) && (!fav || estado.favoritos.has(d.id)))
      .map((d) => ({ doc: d, nota: toks.length ? pontuar(d, toks) : 1 }))
      .filter((r) => r.nota > 0);

    const porData = (a, b) => b.doc.atualizado.localeCompare(a.doc.atualizado);
    const ordens = {
      relevancia: toks.length ? (a, b) => b.nota - a.nota || popularidade(b.doc) - popularidade(a.doc) : porData,
      recentes: porData,
      populares: (a, b) => popularidade(b.doc) - popularidade(a.doc),
      revisao: (a, b) => a.doc.revisao.localeCompare(b.doc.revisao),
      az: (a, b) => a.doc.titulo.localeCompare(b.doc.titulo, 'pt-BR'),
    };
    return lista.sort(ordens[ordem] || ordens.relevancia);
  }

  /* Destaca os termos buscados sem quebrar o HTML. */
  function marcar(texto, toks) {
    const original = String(texto);
    if (!toks.length) return esc(original);
    const n = norm(original);
    if (n.length !== original.length) return esc(original);
    const faixas = [];
    for (const t of toks) {
      const variacoes = t.length >= 5 ? [t, t.slice(0, -1)] : [t];
      for (const v of variacoes) {
        let i = n.indexOf(v);
        while (i !== -1) { faixas.push([i, i + v.length]); i = n.indexOf(v, i + v.length); }
        if (faixas.length) break;
      }
    }
    if (!faixas.length) return esc(original);
    faixas.sort((a, b) => a[0] - b[0]);
    const unidas = [faixas[0].slice()];
    for (const [ini, fim] of faixas.slice(1)) {
      const ult = unidas[unidas.length - 1];
      if (ini <= ult[1]) ult[1] = Math.max(ult[1], fim); else unidas.push([ini, fim]);
    }
    let saida = '';
    let pos = 0;
    for (const [ini, fim] of unidas) {
      saida += esc(original.slice(pos, ini)) + '<mark>' + esc(original.slice(ini, fim)) + '</mark>';
      pos = fim;
    }
    return saida + esc(original.slice(pos));
  }

  /* Quando o termo só aparece dentro dos passos, mostra o trecho. */
  function trecho(d, toks) {
    if (!toks.length) return '';
    const cabeca = norm(d.titulo + ' ' + d.resumo);
    if (toks.some((k) => cabeca.includes(k))) return '';
    const alvos = [...d.passos.map((t, i) => [`Passo ${i + 1}:`, t]), ...d.cuidados.map((t) => ['Cuidado:', t])];
    for (const [rotulo, texto] of alvos) {
      const n = norm(texto);
      if (toks.some((k) => n.includes(k))) return `<p class="trecho"><b>${rotulo}</b>${marcar(texto, toks)}</p>`;
    }
    return '';
  }

  /* =========================================================================
     PEÇAS REUTILIZÁVEIS
     ========================================================================= */
  const badgeTipo = (tipo) => `<span class="badge t-${TIPOS[tipo].cor}">${icone(TIPOS[tipo].icone)}${TIPOS[tipo].rotulo}</span>`;

  function situacaoRevisao(d) {
    const n = diasAte(d.revisao);
    if (n < 0) return { k: 'vencida', n, icone: 'alert', txt: `Revisão vencida há ${-n} ${plural(-n, 'dia', 'dias')}` };
    if (n <= 60) return { k: 'breve', n, icone: 'clock', txt: `Revisão em ${n} ${plural(n, 'dia', 'dias')}` };
    return { k: 'ok', n, icone: 'check', txt: 'Revisão em dia' };
  }
  const chipRevisao = (d) => {
    const r = situacaoRevisao(d);
    return `<span class="status ${r.k}">${icone(r.icone)}${r.txt}</span>`;
  };

  function cartaoDoc(d, toks = []) {
    const fav = estado.favoritos.has(d.id);
    return `
      <article class="doc-card" data-tipo="${TIPOS[d.tipo].cor}">
        <div class="doc-topo"><span class="cod">${esc(d.id)}</span>${badgeTipo(d.tipo)}</div>
        <h3><a href="#/doc/${esc(d.id)}" data-abrir="${esc(d.id)}">${marcar(d.titulo, toks)}</a></h3>
        <p class="doc-resumo">${marcar(d.resumo, toks)}</p>
        ${trecho(d, toks)}
        <div class="doc-meta">
          <span>${icone('layers')}${esc(d.area)}</span>
          <span>Versão ${esc(d.versao)}</span>
          ${chipRevisao(d)}
        </div>
        ${botaoFav(d)}
      </article>`;
  }

  function botaoFav(d) {
    const fav = estado.favoritos.has(d.id);
    return `<button type="button" class="btn-fav" data-fav="${esc(d.id)}" aria-pressed="${fav}"
              aria-label="${fav ? 'Tirar dos favoritos' : 'Adicionar aos favoritos'}: ${esc(d.titulo)}">${icone(fav ? 'star-fill' : 'star')}</button>`;
  }

  function linhaDoc(d, extra = '') {
    return `<li data-tipo="${TIPOS[d.tipo].cor}">
      <div class="l-info"><a href="#/doc/${esc(d.id)}" data-abrir="${esc(d.id)}">${esc(d.titulo)}</a>
      <small>${esc(d.id)}${extra}</small></div>${badgeTipo(d.tipo)}</li>`;
  }

  function kpi(rotulo, valor, ic, classe = '') {
    return `<div class="kpi ${classe}"><span class="kpi-ic">${icone(ic)}</span><div><strong>${valor}</strong><span class="kpi-rot">${rotulo}</span></div></div>`;
  }

  /* =========================================================================
     TELAS
     ========================================================================= */
  /* ----- Início ----- */
  async function renderInicio() {
    const n = estado.docs.length;
    const emDia = estado.docs.filter((d) => situacaoRevisao(d).k === 'ok').length;
    const lidos = estado.docs.filter((d) => estado.lidos[d.id] && estado.lidos[d.id].versao === d.versao).length;

    $('#hero-chips').innerHTML = ['armazenagem reformável', 'devolução de material', 'trabalho em altura', 'EPI', 'NR-22', 'resíduos']
      .map((t) => `<button type="button" data-q="${esc(t)}">${esc(t)}</button>`).join('');

    $('#inicio-perguntas').innerHTML = PERGUNTAS.slice(0, 4)
      .map((p, i) => `<li><a href="#/perguntas?p=${i}">${esc(p.q)}${icone('arrow')}</a></li>`).join('');

    const recentes = [...estado.docs].sort((a, b) => b.atualizado.localeCompare(a.atualizado)).slice(0, 5);
    $('#inicio-recentes').innerHTML = recentes
      .map((d) => linhaDoc(d, ` · atualizado em ${fmtData(d.atualizado)}`)).join('');

    $('#inicio-tipos').innerHTML = Object.entries(TIPOS).map(([chave, t]) => {
      const qtd = estado.docs.filter((d) => d.tipo === chave).length;
      return `<a class="tile" data-tipo="${t.cor}" href="#/biblioteca?tipo=${chave}">${icone(t.icone)}<strong>${qtd}</strong><span>${t.plural}</span></a>`;
    }).join('');

    const favs = estado.docs.filter((d) => estado.favoritos.has(d.id));
    $('#inicio-favoritos').innerHTML = favs.length
      ? `<ul class="lista-docs">${favs.map((d) => linhaDoc(d)).join('')}</ul>`
      : `<div class="vazio"><strong>Você ainda não tem favoritos</strong>Toque na estrela de um documento para ele aparecer aqui.</div>`;

    try {
      await carregarCursos();
      atualizarKpisInicio({ n, emDia, lidos });
    } catch (erro) {
      $('#kpis-inicio').innerHTML = `<p class="aviso erro">${esc(erro.message)}</p>`;
    }
  }

  function atualizarKpisInicio(documentos) {
    if (!documentos) {
      const n = estado.docs.length;
      documentos = {
        n,
        emDia: estado.docs.filter((d) => situacaoRevisao(d).k === 'ok').length,
        lidos: estado.docs.filter((d) => estado.lidos[d.id] && estado.lidos[d.id].versao === d.versao).length,
      };
    }
    const totalCursos = (estado.cursos || []).length;
    const concluidos = (estado.cursos || []).filter((curso) => curso.concluido).length;
    const progresso = totalCursos ? Math.round((concluidos / totalCursos) * 100) : 0;
    $('#kpis-inicio').innerHTML =
      kpi('documentos vigentes', documentos.n, 'file') +
      kpi('com revisão em dia', `${documentos.n ? Math.round((documentos.emDia / documentos.n) * 100) : 0}%`, 'check') +
      kpi('leituras que você confirmou', `${documentos.lidos} de ${documentos.n}`, 'shield') +
      kpi('cursos disponíveis', totalCursos, 'grad') +
      kpi('cursos visualizados', estado.cursosVisualizados.size, 'book') +
      kpi('cursos concluídos', `${concluidos} (${progresso}%)`, 'check');
  }

  async function carregarCursos() {
    if (estado.cursos !== null) return estado.cursos;
    const { cursos } = await requisicaoApi('../backend/cursos.php');
    estado.cursos = cursos.map((curso) => ({
      ...curso,
      id: Number(curso.id),
      carga_horaria: Number(curso.carga_horaria),
    }));
    estado.cursosVisualizados = new Set(estado.cursos.filter((curso) => curso.visualizado).map((curso) => curso.id));
    estado.progresso = Object.fromEntries(
      estado.cursos.filter((curso) => curso.concluido).map((curso) => [`curso-${curso.id}`, true])
    );
    return estado.cursos;
  }

  async function carregarDocumentos() {
    estado.docs = await API.listar();
    estado.docs.forEach(prepararIndice);
    return estado.docs;
  }

  async function marcarCursoVisualizado(id) {
    const cursoId = Number(id);
    const curso = (estado.cursos || []).find((item) => item.id === cursoId);
    if (!curso || curso.visualizado) return;
    await requisicaoApi('../backend/cursos.php', {
      method: 'POST',
      body: { id: cursoId, acao: 'visualizado' },
    });
    curso.visualizado = true;
    estado.cursosVisualizados.add(cursoId);
    atualizarKpisInicio();
  }

  async function salvarConclusaoCurso(checkbox) {
    const cursoId = Number(checkbox.dataset.mod.replace(/^curso-/, ''));
    const concluido = checkbox.checked;
    try {
      await requisicaoApi('../backend/cursos.php', {
        method: 'POST',
        body: { id: cursoId, acao: concluido ? 'concluido' : 'pendente' },
      });
      estado.progresso[checkbox.dataset.mod] = concluido || undefined;
      if (!concluido) delete estado.progresso[checkbox.dataset.mod];
      const curso = (estado.cursos || []).find((item) => item.id === cursoId);
      if (curso) curso.concluido = concluido;
      atualizarTrilha(checkbox.dataset.trilha);
      atualizarKpisInicio();
    } catch (erro) {
      checkbox.checked = !concluido;
      avisar(erro.message);
    }
  }

  /* ----- Biblioteca ----- */
  let timerVazia;

  function urlBiblioteca() {
    const f = estado.filtros;
    const p = new URLSearchParams();
    if (f.q) p.set('q', f.q);
    if (f.tipo) p.set('tipo', f.tipo);
    if (f.area) p.set('area', f.area);
    if (f.ordem !== 'relevancia') p.set('ordem', f.ordem);
    if (f.fav) p.set('fav', '1');
    const s = p.toString();
    return '#/biblioteca' + (s ? '?' + s : '');
  }

  function montarControlesBiblioteca() {
    $('#bib-area').innerHTML = '<option value="">Todas as áreas</option>' + AREAS.map((a) => `<option>${esc(a)}</option>`).join('');
    const base = buscar({ q: estado.filtros.q, area: estado.filtros.area, fav: estado.filtros.fav });
    const conta = (t) => base.filter((r) => r.doc.tipo === t).length;
    const todos = `<button type="button" class="chip" data-tipo-filtro="" aria-pressed="${!estado.filtros.tipo}">Todos <span class="n">${base.length}</span></button>`;
    $('#bib-tipos').innerHTML = todos + Object.entries(TIPOS).map(([chave, t]) =>
      `<button type="button" class="chip" data-tipo="${t.cor}" data-tipo-filtro="${chave}" aria-pressed="${estado.filtros.tipo === chave}">${icone(t.icone)}${t.plural} <span class="n">${conta(chave)}</span></button>`
    ).join('');
    $('#bib-area').value = estado.filtros.area;
  }

  function renderBiblioteca({ atualizarUrl = false } = {}) {
    const f = estado.filtros;
    montarControlesBiblioteca();
    $('#bib-q').value = f.q;
    $('#bib-ordem').value = f.ordem;
    $('#bib-fav').checked = f.fav;

    const toks = tokensDe(f.q);
    const rotulo = (f.q ? norm(f.q).split(/\s+/).filter(Boolean) : []);
    const marcas = rotulo.map(radical);
    const resultados = buscar(f);
    $('#bib-contagem').innerHTML = f.q
      ? `<strong>${resultados.length}</strong> ${plural(resultados.length, 'resultado', 'resultados')} para “${esc(f.q)}”`
      : `<strong>${resultados.length}</strong> ${plural(resultados.length, 'documento', 'documentos')}`;

    const alvo = $('#bib-resultados');
    if (resultados.length) {
      alvo.innerHTML = resultados.map((r) => cartaoDoc(r.doc, marcas.length ? marcas : toks)).join('');
    } else {
      const termo = f.q.trim();
      alvo.innerHTML = `<div class="vazio largura-total">
        <strong>${termo ? `Nada encontrado para “${esc(termo)}”` : 'Nenhum documento com esses filtros'}</strong>
        ${termo ? 'Tente uma palavra mais curta ou o código do documento. Se ele deveria existir, avise a equipe.' : 'Limpe os filtros para ver todos os documentos.'}
        <div>${termo
          ? `<button type="button" class="btn btn-primario" data-sugerir="${esc(termo)}">Sugerir este documento</button>`
          : `<button type="button" class="btn btn-secundario" data-limpar-filtros>Limpar filtros</button>`}</div></div>`;
    }

    // Busca sem resultado vira "lacuna de conhecimento" (aparece em Relatórios).
    clearTimeout(timerVazia);
    if (!resultados.length && f.q.trim().length >= 3) {
      timerVazia = setTimeout(() => registrarBuscaVazia(f.q.trim()), 1200);
    }

    if (atualizarUrl) history.replaceState(null, '', urlBiblioteca());
  }

  function registrarBuscaVazia(termo) {
    const chave = norm(termo).replace(/\s+/g, ' ');
    const atual = estado.vazias[chave] || { termo, n: 0 };
    atual.n += 1;
    atual.ultima = new Date().toISOString().slice(0, 10);
    estado.vazias[chave] = atual;
    memoria.gravar('buscas-vazias', estado.vazias);
  }

  /* ----- Dúvidas rápidas ----- */
  function renderPerguntas(params) {
    const abrir = params.has('p') ? Number(params.get('p')) : -1;
    $('#lista-perguntas').innerHTML = PERGUNTAS.map((p, i) => {
      const docs = p.docs.map(docPorId).filter(Boolean);
      return `<details class="faq" ${i === abrir ? 'open' : ''}>
        <summary>${esc(p.q)}</summary>
        <div class="faq-corpo">
          <p>${esc(p.resp)}</p>
          <div class="faq-docs">${docs.map((d) =>
            `<a href="#/doc/${esc(d.id)}" data-abrir="${esc(d.id)}" data-tipo="${TIPOS[d.tipo].cor}"><span class="cod">${esc(d.id)}</span><span class="t">${esc(d.titulo)}</span>${icone('arrow')}</a>`
          ).join('')}</div>
        </div></details>`;
    }).join('');
    if (abrir >= 0) {
      const alvo = $$('#lista-perguntas .faq')[abrir];
      if (alvo) setTimeout(() => alvo.scrollIntoView({ block: 'center' }), 50);
    }
  }

  /* ----- Treinamentos ----- */
  function resumoTrilha(trilha) {
    const feitos = trilha.cursos.filter((curso) => estado.progresso[curso.id]).length;
    const total = trilha.cursos.length;
    const horas = trilha.cursos.reduce((soma, curso) => soma + curso.horas, 0);
    return { feitos, total, pct: Math.round((feitos / total) * 100), horas };
  }

  async function renderTreinamentos() {
    const destino = $('#lista-cursos');
    destino.innerHTML = '<p class="ajuda">Carregando cursos…</p>';
    try {
      const cursos = await carregarCursos();
      estado.trilhas = Object.values(cursos.reduce((grupos, curso) => {
        const setor = curso.setor || 'Outros';
        const id = norm(setor).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        if (!grupos[id]) grupos[id] = { id, titulo: `Cursos de ${setor}`, descricao: `Cursos disponíveis para o setor ${setor}.`, cursos: [] };
        grupos[id].cursos.push({
          id: `curso-${Number(curso.id)}`,
          cursoId: Number(curso.id),
          titulo: curso.titulo,
          descricao: curso.descricao,
          horas: Number(curso.carga_horaria),
        });
        return grupos;
      }, {}));

      destino.innerHTML = estado.trilhas.length ? estado.trilhas.map((trilha) => {
        const resumo = resumoTrilha(trilha);
        return `<article class="painel" id="trilha-${esc(trilha.id)}">
          <div class="trilha-cab"><h2>${esc(trilha.titulo)}</h2><p>${esc(trilha.descricao)}</p></div>
          <div class="progresso">
            <progress class="barra" value="${resumo.pct}" max="100" aria-label="Progresso: ${esc(trilha.titulo)}">${resumo.pct}%</progress>
            <span class="prog-txt">${textoProgresso(resumo)}</span>
          </div>
          <ol class="modulos">${trilha.cursos.map((curso) => {
            const feito = !!estado.progresso[curso.id];
            return `<li class="${feito ? 'feito' : ''}">
              <label><input type="checkbox" data-mod="${esc(curso.id)}" data-trilha="${esc(trilha.id)}" ${feito ? 'checked' : ''}>
                <span class="check-box">${icone('check')}</span>
                <span class="mod-tit"><b>${esc(curso.titulo)}</b><small>${curso.horas} ${plural(curso.horas, 'hora', 'horas')} · ${esc(curso.descricao)}</small></span></label>
              <details class="curso-detalhes">
                <summary data-curso-visualizar="${curso.cursoId}">Visualizar</summary>
                <div><p>${esc(curso.descricao)}</p>
                  <a class="btn btn-secundario" data-curso-pdf="${curso.cursoId}" href="../backend/curso-pdf.php?id=${curso.cursoId}">Baixar material ilustrativo (PDF)</a>
                </div>
              </details>
            </li>`;
          }).join('')}</ol></article>`;
      }).join('') : '<div class="vazio"><strong>Nenhum curso disponível</strong>Não há cursos ativos cadastrados para o seu setor.</div>';
    } catch (erro) {
      destino.innerHTML = `<p class="aviso erro">${esc(erro.message)}</p>`;
    }
  }

  function textoProgresso(resumo) {
    return resumo.feitos === resumo.total
      ? `Trilha concluída. Total de ${resumo.horas} ${plural(resumo.horas, 'hora', 'horas')}`
      : `${resumo.feitos} de ${resumo.total} ${plural(resumo.total, 'curso', 'cursos')}, cerca de ${resumo.horas} ${plural(resumo.horas, 'hora', 'horas')} no total`;
  }

  function atualizarTrilha(trilhaId) {
    const trilha = estado.trilhas.find((item) => item.id === trilhaId);
    const caixa = $(`#trilha-${trilhaId}`);
    if (!trilha || !caixa) return;
    const resumo = resumoTrilha(trilha);
    $('.barra', caixa).value = resumo.pct;
    $('.prog-txt', caixa).textContent = textoProgresso(resumo);
    trilha.cursos.forEach((curso) => {
      const checkbox = $(`[data-mod="${curso.id}"]`, caixa);
      if (checkbox) checkbox.closest('li').classList.toggle('feito', checkbox.checked);
    });
  }

  /* ----- Relatórios ----- */
  function barras(itens, classe = '') {
    const max = Math.max(1, ...itens.map((i) => i.valor));
    return `<div class="barras">${itens.map((i) =>
      `<div class="barra-linha" ${i.cor ? `data-tipo="${i.cor}"` : ''}><span>${esc(i.rotulo)}</span>
        <progress class="trilho" value="${i.valor}" max="${max}" aria-label="${esc(i.rotulo)}: ${i.valor}"></progress><b>${i.valor}</b></div>`
    ).join('')}</div>`;
  }

  function renderRelatorios() {
    const docs = estado.docs;
    const venc = docs.filter((d) => situacaoRevisao(d).k === 'vencida');
    const breve = docs.filter((d) => situacaoRevisao(d).k === 'breve');
    const lacunas = Object.values(estado.vazias).sort((a, b) => b.n - a.n);

    $('#kpis-rel').innerHTML =
      kpi('documentos na base', docs.length, 'file') +
      kpi('com revisão em dia', docs.length - venc.length - breve.length, 'check') +
      kpi('revisões nos próximos 60 dias', breve.length, 'clock', breve.length ? 'alerta' : '') +
      kpi('revisões vencidas', venc.length, 'alert', venc.length ? 'perigo' : '');

    const porTipo = Object.entries(TIPOS).map(([k, t]) => ({ rotulo: t.plural, cor: t.cor, valor: docs.filter((d) => d.tipo === k).length }));
    const porArea = AREAS.map((a) => ({ rotulo: a, valor: docs.filter((d) => d.area === a).length })).filter((i) => i.valor).sort((a, b) => b.valor - a.valor);
    const top = [...docs].sort((a, b) => popularidade(b) - popularidade(a)).slice(0, 6).map((d) => ({ rotulo: d.titulo, cor: TIPOS[d.tipo].cor, valor: popularidade(d) }));

    $('#graficos-rel').innerHTML =
      `<section class="painel" aria-labelledby="g1"><div class="painel-cab"><h2 id="g1">Documentos por tipo</h2></div>${barras(porTipo)}</section>
       <section class="painel" aria-labelledby="g2"><div class="painel-cab"><h2 id="g2">Documentos por área</h2></div>${barras(porArea)}</section>
      <section class="painel largura-total" aria-labelledby="g3"><div class="painel-cab"><h2 id="g3">Mais consultados</h2></div>${barras(top)}</section>`;

    const pend = [...venc, ...breve].sort((a, b) => a.revisao.localeCompare(b.revisao));
    $('#rel-pendencias').innerHTML = pend.length ? `<div class="tabela-rolagem"><table class="tabela">
      <thead><tr><th scope="col">Documento</th><th scope="col">Responsável</th><th scope="col" class="num">Revisão prevista</th><th scope="col">Situação</th></tr></thead>
      <tbody>${pend.map((d) => `<tr><th scope="row"><a href="#/doc/${esc(d.id)}" data-abrir="${esc(d.id)}">${esc(d.titulo)}</a><br><span class="cod">${esc(d.id)}</span></th>
        <td>${esc(d.responsavel)}</td><td class="num">${fmtData(d.revisao)}</td><td>${chipRevisao(d)}</td></tr>`).join('')}</tbody></table></div>`
      : `<div class="vazio"><strong>Nenhuma revisão pendente</strong>Todos os documentos estão em dia pelos próximos 60 dias.</div>`;

    $('#rel-lacunas').innerHTML = lacunas.length ? `<p class="ajuda">Termos que alguém buscou neste navegador e não encontrou. São candidatos a novos documentos.</p>
      <div class="tabela-rolagem"><table class="tabela"><thead><tr><th scope="col">Termo buscado</th><th scope="col" class="num">Vezes</th><th scope="col" class="num">Última busca</th></tr></thead>
      <tbody>${lacunas.map((l) => `<tr><th scope="row">${esc(l.termo)}</th><td class="num">${l.n}</td><td class="num">${fmtData(l.ultima)}</td></tr>`).join('')}</tbody></table></div>`
      : `<div class="vazio"><strong>Nenhuma busca sem resultado ainda</strong>Quando alguém buscar algo que não existe na biblioteca, o termo aparece aqui.</div>`;
  }

  function exportarCsv() {
    const campos = ['Código', 'Título', 'Tipo', 'Área', 'Versão', 'Atualizado em', 'Próxima revisão', 'Responsável', 'Situação da revisão'];
    const aspas = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const linhas = estado.docs.map((d) => [d.id, d.titulo, TIPOS[d.tipo].rotulo, d.area, d.versao, fmtData(d.atualizado), fmtData(d.revisao), d.responsavel, situacaoRevisao(d).txt].map(aspas).join(';'));
    const csv = '﻿' + [campos.map(aspas).join(';'), ...linhas].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'documentos-portal-gaco.csv' });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    avisar('Lista exportada em CSV.');
  }

  /* ----- Contato ----- */
  function prepararContato(params) {
    const sel = $('#doc-rel');
    if (!sel.options.length) {
      sel.innerHTML = '<option value="">Nenhum</option>' + estado.docs.map((d) => `<option value="${esc(d.id)}">${esc(d.id)}: ${esc(d.titulo)}</option>`).join('');
    }
    if (params.has('assunto')) $('#assunto').value = params.get('assunto');
    if (params.has('msg')) { $('#mensagem').value = params.get('msg'); }
    if (params.has('doc')) sel.value = params.get('doc');
    atualizarAssunto();
    contarCaracteres();
  }

  const campoMensagem = $('#mensagem');
  const campoAssunto = $('#assunto');
  const campoNome = $('#nome');
  const aviso = $('#aviso');

  function contarCaracteres() {
    const restam = campoMensagem.maxLength - campoMensagem.value.length;
    const contador = $('#contador');
    contador.textContent = `Restam ${restam} ${plural(restam, 'caractere', 'caracteres')}`;
    contador.classList.toggle('alerta', restam < 50);
  }

  function atualizarAssunto() {
    const dicas = {
      duvida: 'Qual é a sua dúvida? Diga a atividade e a área.',
      sugestao: 'Qual documento está faltando? Conte para que ele serviria.',
      desatualizado: 'O que está errado ou desatualizado? Se puder, indique o passo.',
      outro: 'Escreva a sua mensagem.',
    };
    campoMensagem.placeholder = dicas[campoAssunto.value] || dicas.outro;
    $('#campo-doc').hidden = !['desatualizado', 'duvida'].includes(campoAssunto.value);
  }

  const temNumero = (texto) => /\d/.test(texto);

  function conferirFormulario(evento) {
    let nome = campoNome.value.trim().replace(/\s{2,}/g, ' ');
    campoNome.value = nome;
    aviso.className = 'aviso erro';

    const exigeDetalhe = ['sugestao', 'desatualizado'].includes(campoAssunto.value);
    if (nome.length < 3 || nome.length > 60) {
      evento.preventDefault(); aviso.textContent = 'O nome precisa ter entre 3 e 60 letras.'; campoNome.focus();
    } else if (temNumero(nome)) {
      evento.preventDefault(); aviso.textContent = 'O nome não pode ter números.'; campoNome.focus();
    } else if (exigeDetalhe && campoMensagem.value.trim().length < 20) {
      evento.preventDefault(); aviso.textContent = 'Conte um pouco mais: escreva pelo menos 20 caracteres.'; campoMensagem.focus();
    } else {
      // Documento relacionado entra no início da mensagem (a tabela do banco não muda).
      const doc = $('#doc-rel').value;
      if (doc && !campoMensagem.value.startsWith(`[${doc}]`)) campoMensagem.value = `[${doc}] ${campoMensagem.value}`;
      aviso.className = 'aviso ok';
      aviso.textContent = 'Tudo certo! Enviando...';
    }
  }

  /* ----- Configurações: nada a desenhar, só sincronizar com aplicarPrefs ----- */

  /* =========================================================================
     FICHA DO DOCUMENTO (janela lateral)
     ========================================================================= */
  const dlg = $('#dlg-doc');

  function htmlFicha(d) {
    const lido = estado.lidos[d.id];
    const leituraOk = !!lido && lido.versao === d.versao;
    const fav = estado.favoritos.has(d.id);
    const relacionados = (d.relacionados || []).map(docPorId).filter(Boolean);

    return `
      <header class="dlg-topo" data-tipo="${TIPOS[d.tipo].cor}">
        <div class="dlg-linha"><span class="cod">${esc(d.id)}</span>${badgeTipo(d.tipo)}${chipRevisao(d)}</div>
        <button type="button" class="btn-icone" data-fechar aria-label="Fechar documento">${icone('x')}</button>
      </header>
      <div class="dlg-corpo" data-tipo="${TIPOS[d.tipo].cor}">
        <h2 id="dlg-titulo">${esc(d.titulo)}</h2>
        <p class="dlg-resumo">${esc(d.resumo)}</p>
        <dl class="ficha">
          <div><dt>Área</dt><dd>${esc(d.area)}</dd></div>
          <div><dt>Versão vigente</dt><dd>${esc(d.versao)}</dd></div>
          <div><dt>Atualizado em</dt><dd>${fmtData(d.atualizado)}</dd></div>
          <div><dt>Próxima revisão</dt><dd>${fmtData(d.revisao)}</dd></div>
          <div><dt>Responsável</dt><dd>${esc(d.responsavel)}</dd></div>
        </dl>

        <h3>Passo a passo</h3>
        <ol class="passos">${d.passos.map((p) => `<li><span>${esc(p)}</span></li>`).join('')}</ol>

        <aside class="callout-seg" aria-labelledby="cs-t">
          <h3 id="cs-t">${icone('alert')}Cuidados de segurança</h3>
          <ul>${d.cuidados.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
        </aside>

        <h3>Referências e requisitos legais</h3>
        <ul class="refs">${d.referencias.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>

        ${relacionados.length ? `<h3>Documentos relacionados</h3>
          <div class="rel-lista">${relacionados.map((r) =>
            `<a href="#/doc/${esc(r.id)}" data-abrir="${esc(r.id)}" data-tipo="${TIPOS[r.tipo].cor}"><span class="cod">${esc(r.id)}</span><span class="t">${esc(r.titulo)}</span>${icone('arrow')}</a>`).join('')}</div>` : ''}

        <p class="aviso-demo">Conteúdo ilustrativo do protótipo. Em caso de dúvida, vale o documento oficial vigente.
          Algo errado aqui? <a href="#/contato?assunto=desatualizado&doc=${esc(d.id)}">Avise a equipe</a>.</p>
      </div>
      <footer class="dlg-rodape">
        <button type="button" class="btn btn-secundario btn-fav-dlg" data-fav="${esc(d.id)}" aria-pressed="${fav}">${icone(fav ? 'star-fill' : 'star')}<span>${fav ? 'Nos favoritos' : 'Favoritar'}</span></button>
        <button type="button" class="btn btn-secundario" data-copiar="${esc(d.id)}">${icone('link')}Copiar link</button>
        <button type="button" class="btn btn-secundario" data-imprimir>${icone('print')}Imprimir</button>
        <span class="espaco"></span>
        <button type="button" class="btn btn-secundario btn-lido" data-ler="${esc(d.id)}" aria-pressed="${leituraOk}">${icone('check')}<span>${leituraOk ? `Leitura confirmada em ${fmtData(lido.em)}` : 'Li e entendi'}</span></button>
      </footer>`;
  }

  function abrirFicha(id) {
    const d = docPorId(id);
    if (!d) {
      avisar('Documento não encontrado. Ele pode ter sido removido ou o código está errado.');
      history.replaceState(null, '', '#/biblioteca');
      rotear();
      return;
    }
    $('#dlg-conteudo').innerHTML = htmlFicha(d);
    if (estado.docAberto !== id) {
      estado.consultas[id] = (estado.consultas[id] || 0) + 1;
      memoria.gravar('consultas', estado.consultas);
      estado.docAberto = id;
    }
    if (!dlg.open) dlg.showModal();
    $('.dlg-corpo', dlg).scrollTop = 0;
    document.title = `${d.id} · ${d.titulo} · Portal GACO`;
  }

  function abrirDoc(id, dentroDaFicha) {
    if (dentroDaFicha) {
      location.replace('#/doc/' + encodeURIComponent(id));   // troca a ficha sem empilhar histórico
    } else {
      estado.docPorNavegacao = true;
      location.hash = '#/doc/' + encodeURIComponent(id);
    }
  }

  dlg.addEventListener('close', () => {
    estado.docAberto = '';
    if (!location.hash.startsWith('#/doc/')) return;       // fechou por troca de rota
    if (estado.docPorNavegacao) { estado.docPorNavegacao = false; history.back(); }
    else { history.replaceState(null, '', '#/biblioteca'); rotear(); }
  });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  function alternarFavorito(id) {
    const d = docPorId(id);
    if (!d) return;
    const agora = !estado.favoritos.has(id);
    if (agora) estado.favoritos.add(id); else estado.favoritos.delete(id);
    memoria.gravar('favoritos', [...estado.favoritos]);

    $$(`[data-fav="${CSS.escape(id)}"]`).forEach((b) => {
      b.setAttribute('aria-pressed', agora);
      if (b.classList.contains('btn-fav')) {
        b.innerHTML = icone(agora ? 'star-fill' : 'star');
        b.setAttribute('aria-label', `${agora ? 'Tirar dos favoritos' : 'Adicionar aos favoritos'}: ${d.titulo}`);
      } else {
        b.innerHTML = `${icone(agora ? 'star-fill' : 'star')}<span>${agora ? 'Nos favoritos' : 'Favoritar'}</span>`;
      }
    });
    avisar(agora ? 'Adicionado aos favoritos.' : 'Removido dos favoritos.');
    if (estado.tela === 'biblioteca' && estado.filtros.fav && !dlg.open) renderBiblioteca();
    if (estado.tela === 'inicio' && !dlg.open) renderInicio();
  }

  function confirmarLeitura(id) {
    const d = docPorId(id);
    if (!d) return;
    const atual = estado.lidos[id];
    if (atual && atual.versao === d.versao) {
      delete estado.lidos[id];
      avisar('Confirmação de leitura removida.');
    } else {
      estado.lidos[id] = { versao: d.versao, em: new Date().toISOString().slice(0, 10) };
      avisar(`Leitura confirmada: ${d.id}, versão ${d.versao}.`);
    }
    memoria.gravar('lidos', estado.lidos);
    if (estado.cursos !== null) atualizarKpisInicio();
    const btn = $(`[data-ler="${CSS.escape(id)}"]`);
    if (btn) {
      const l = estado.lidos[id];
      btn.setAttribute('aria-pressed', !!l);
      $('span', btn).textContent = l ? `Leitura confirmada em ${fmtData(l.em)}` : 'Li e entendi';
    }
  }

  async function copiarLink(id) {
    const url = location.href.split('#')[0] + '#/doc/' + encodeURIComponent(id);
    try { await navigator.clipboard.writeText(url); avisar('Link copiado.'); }
    catch { avisar('Não foi possível copiar. Copie o endereço na barra do navegador.'); }
  }

  /* =========================================================================
     ROTAS  (#/tela?parametros   e   #/doc/CÓDIGO)
     ========================================================================= */
  function lerRota() {
    const bruto = location.hash.replace(/^#\/?/, '');
    const [caminho, qs = ''] = bruto.split('?');
    const partes = caminho.split('/').filter(Boolean).map((p) => { try { return decodeURIComponent(p); } catch { return p; } });
    return { partes, params: new URLSearchParams(qs) };
  }

  function mostrarTela(tela, params) {
    if (!podeAcessar(tela)) {
      if (estado.usuario) {
        avisar('Seu perfil não tem permissão para essa área.');
        history.replaceState(null, '', '#/inicio');
      }
      tela = 'inicio';
      params = new URLSearchParams();
    }
    const mudou = estado.tela !== tela;
    estado.tela = tela;

    $$('.tela').forEach((s) => { s.hidden = s.id !== 'sec-' + tela; });
    $$('.lateral nav a').forEach((a) => {
      if (a.dataset.rota === tela) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });

    const secao = $('#sec-' + tela);
    document.title = `${secao.dataset.titulo} · Portal GACO`;

    if (tela === 'inicio') renderInicio();
    if (tela === 'biblioteca') {
      estado.filtros = {
        q: params.get('q') || '',
        tipo: TIPOS[params.get('tipo')] ? params.get('tipo') : '',
        area: AREAS.includes(params.get('area')) ? params.get('area') : '',
        ordem: ['relevancia', 'recentes', 'populares', 'revisao', 'az'].includes(params.get('ordem')) ? params.get('ordem') : 'relevancia',
        fav: params.get('fav') === '1',
      };
      renderBiblioteca();
    }
    if (tela === 'perguntas') renderPerguntas(params);
    if (tela === 'treinamentos') renderTreinamentos();
    if (tela === 'relatorios') renderRelatorios();
    if (tela === 'conteudos') renderSolicitacoes();
    if (tela === 'usuarios') renderUsuarios();
    if (tela === 'contato') prepararContato(params);

    fecharMenu();
    if (mudou) {
      window.scrollTo(0, 0);
      const h1 = $('h1', secao);
      if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
    }
  }

  function rotear() {
    const { partes, params } = lerRota();
    if (partes[0] === 'doc' && partes[1]) {
      if (!estado.tela) mostrarTela('biblioteca', new URLSearchParams());
      abrirFicha(partes[1]);
      return;
    }
    if (dlg.open) dlg.close();
    mostrarTela(TELAS.includes(partes[0]) ? partes[0] : 'inicio', params);
  }

  function irPara(hash) { location.hash = hash; }
  function irBusca(q) {
    const termo = q.trim();
    irPara('#/biblioteca' + (termo ? '?q=' + encodeURIComponent(termo) : ''));
  }

  /* =========================================================================
     MENU (celular)
     ========================================================================= */
  function fecharMenu() {
    document.body.classList.remove('nav-aberta');
    $('#veu').hidden = true;
    $('#btn-menu').setAttribute('aria-expanded', 'false');
  }
  function alternarMenu() {
    const abrir = !document.body.classList.contains('nav-aberta');
    document.body.classList.toggle('nav-aberta', abrir);
    $('#veu').hidden = !abrir;
    $('#btn-menu').setAttribute('aria-expanded', String(abrir));
    if (abrir) $('.lateral nav a').focus();
  }

  /* =========================================================================
     BUSCA GLOBAL COM SUGESTÕES
     ========================================================================= */
  const campoGlobal = $('#busca-global');
  const listaSug = $('#sugestoes');
  let sugestoes = [];
  let sugAtiva = -1;

  function fecharSugestoes() {
    listaSug.hidden = true;
    campoGlobal.setAttribute('aria-expanded', 'false');
    campoGlobal.removeAttribute('aria-activedescendant');
    sugAtiva = -1;
  }

  function marcarSugestao(i) {
    sugAtiva = i;
    $$('li', listaSug).forEach((li, idx) => li.setAttribute('aria-selected', String(idx === i)));
    if (i >= 0) campoGlobal.setAttribute('aria-activedescendant', 'sug-' + i); else campoGlobal.removeAttribute('aria-activedescendant');
  }

  function mostrarSugestoes() {
    const q = campoGlobal.value.trim();
    if (!q) return fecharSugestoes();
    sugestoes = buscar({ q }).slice(0, 6).map((r) => r.doc);
    const toks = tokensDe(q);
    listaSug.innerHTML = sugestoes.map((d, i) =>
      `<li role="option" id="sug-${i}" data-id="${esc(d.id)}" aria-selected="false"><span class="sug-cod">${esc(d.id)}</span><span>${marcar(d.titulo, toks)}</span></li>`
    ).join('') +
      `<li role="option" id="sug-${sugestoes.length}" class="sug-todos" data-todos aria-selected="false">${icone('search')}${sugestoes.length ? 'Ver todos os resultados' : 'Nada encontrado. Buscar mesmo assim'} para “${esc(q)}”</li>`;
    listaSug.hidden = false;
    campoGlobal.setAttribute('aria-expanded', 'true');
    sugAtiva = -1;
  }

  function escolherSugestao(li) {
    fecharSugestoes();
    if (li.dataset.id) { campoGlobal.value = ''; abrirDoc(li.dataset.id, false); }
    else irBusca(campoGlobal.value);
  }

  campoGlobal.addEventListener('input', mostrarSugestoes);
  campoGlobal.addEventListener('keydown', (e) => {
    const total = $$('li', listaSug).length;
    if (listaSug.hidden || !total) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); marcarSugestao((sugAtiva + 1) % total); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); marcarSugestao((sugAtiva - 1 + total) % total); }
    else if (e.key === 'Escape') { fecharSugestoes(); }
    else if (e.key === 'Enter' && sugAtiva >= 0) { e.preventDefault(); escolherSugestao($$('li', listaSug)[sugAtiva]); }
  });
  campoGlobal.addEventListener('blur', () => setTimeout(fecharSugestoes, 120));
  listaSug.addEventListener('mousedown', (e) => { e.preventDefault(); const li = e.target.closest('li'); if (li) escolherSugestao(li); });
  $('#form-busca').addEventListener('submit', (e) => { e.preventDefault(); fecharSugestoes(); irBusca(campoGlobal.value); });

  /* =========================================================================
     EVENTOS GERAIS
     ========================================================================= */
  document.addEventListener('click', (e) => {
    const alvo = e.target;

    const salvarUsuario = alvo.closest('[data-salvar-usuario]');
    if (salvarUsuario) {
      const card = salvarUsuario.closest('[data-usuario-id]');
      requisicaoApi('../backend/auth.php?acao=atualizar-usuario', {
        method: 'POST',
        body: {
          id: Number(card.dataset.usuarioId),
          papel: $('[data-papel-usuario]', card).value,
          status: $('[data-status-usuario]', card).value,
        },
      }).then((r) => { avisar(r.mensagem); renderUsuarios(); }).catch((erro) => avisar(erro.message));
      return;
    }

    const salvarMensagem = alvo.closest('[data-salvar-mensagem]');
    if (salvarMensagem) {
      const card = salvarMensagem.closest('[data-mensagem-id]');
      requisicaoApi('../backend/mensagens.php', {
        method: 'POST',
        body: { id: Number(card.dataset.mensagemId), status: $('[data-status-mensagem]', card).value },
      }).then((r) => { avisar(r.mensagem); renderSolicitacoes(); }).catch((erro) => avisar(erro.message));
      return;
    }

    const modoAcesso = alvo.closest('[data-modo-acesso]');
    if (modoAcesso) { alternarFormularioAcesso(modoAcesso.dataset.modoAcesso); return; }
    if (alvo.closest('#btn-sair')) {
      requisicaoApi('../backend/auth.php?acao=sair', { method: 'POST', body: {} })
        .catch(() => {})
        .finally(() => {
          estado.tela = '';
          estado.cursos = null;
          estado.cursosVisualizados = new Set();
          estado.progresso = {};
          mostrarAcesso('Sessão encerrada.');
        });
      return;
    }

    const cursoVisualizar = alvo.closest('[data-curso-visualizar]');
    if (cursoVisualizar) {
      const detalhes = cursoVisualizar.closest('details');
      if (detalhes && !detalhes.open) {
        marcarCursoVisualizado(cursoVisualizar.dataset.cursoVisualizar).catch((erro) => avisar(erro.message));
      }
      return;
    }
    const cursoPdf = alvo.closest('[data-curso-pdf]');
    if (cursoPdf) marcarCursoVisualizado(cursoPdf.dataset.cursoPdf).catch((erro) => avisar(erro.message));

    const fav = alvo.closest('[data-fav]');
    if (fav) { e.preventDefault(); alternarFavorito(fav.dataset.fav); return; }

    const abrir = alvo.closest('[data-abrir]');
    if (abrir) { e.preventDefault(); abrirDoc(abrir.dataset.abrir, !!abrir.closest('dialog')); return; }

    const chip = alvo.closest('[data-q]');
    if (chip) { irBusca(chip.dataset.q); return; }

    const tipoF = alvo.closest('[data-tipo-filtro]');
    if (tipoF) {
      estado.filtros.tipo = tipoF.dataset.tipoFiltro === estado.filtros.tipo ? '' : tipoF.dataset.tipoFiltro;
      renderBiblioteca({ atualizarUrl: true });
      $(`[data-tipo-filtro="${estado.filtros.tipo}"]`)?.focus();
      return;
    }
    if (alvo.closest('[data-limpar-filtros]') || alvo.closest('#bib-limpar')) {
      estado.filtros = { q: '', tipo: '', area: '', ordem: 'relevancia', fav: false };
      renderBiblioteca({ atualizarUrl: true });
      $('#bib-q').focus();
      return;
    }
    const sug = alvo.closest('[data-sugerir]');
    if (sug) { irPara('#/contato?assunto=sugestao&msg=' + encodeURIComponent('Não encontrei documento sobre: ' + sug.dataset.sugerir + '. ')); return; }

    const ler = alvo.closest('[data-ler]');
    if (ler) { confirmarLeitura(ler.dataset.ler); return; }
    const copiar = alvo.closest('[data-copiar]');
    if (copiar) { copiarLink(copiar.dataset.copiar); return; }
    if (alvo.closest('[data-imprimir]')) { window.print(); return; }
    if (alvo.closest('[data-fechar]')) { dlg.close(); return; }

    if (alvo.closest('#btn-menu')) { alternarMenu(); return; }
    if (alvo.closest('#veu')) { fecharMenu(); return; }
    if (alvo.closest('#btn-tema')) { salvarPrefs({ tema: temaEscuroAtivo() ? 'claro' : 'escuro' }); return; }
    if (alvo.closest('#btn-csv')) { exportarCsv(); return; }
    if (alvo.closest('#btn-limpar-dados')) {
      if (confirm('Apagar os dados salvos deste navegador?')) {
        memoria.limparTudo();
        location.reload();
      }
    }
  });

  document.addEventListener('change', (e) => {
    const alvo = e.target;
    if (alvo.matches('[data-mod]')) {
      salvarConclusaoCurso(alvo);
    } else if (alvo.name === 'tema') salvarPrefs({ tema: alvo.value });
    else if (alvo.name === 'texto') salvarPrefs({ texto: alvo.value });
    else if (alvo.id === 'cfg-movimento') salvarPrefs({ movimento: alvo.checked ? 'reduzido' : 'normal' });
    else if (alvo.id === 'bib-area') { estado.filtros.area = alvo.value; renderBiblioteca({ atualizarUrl: true }); }
    else if (alvo.id === 'bib-ordem') { estado.filtros.ordem = alvo.value; renderBiblioteca({ atualizarUrl: true }); }
    else if (alvo.id === 'bib-fav') { estado.filtros.fav = alvo.checked; renderBiblioteca({ atualizarUrl: true }); }
    else if (alvo.id === 'assunto') atualizarAssunto();
  });

  let timerBib;
  $('#bib-q').addEventListener('input', (e) => {
    estado.filtros.q = e.target.value;
    clearTimeout(timerBib);
    timerBib = setTimeout(() => {
      const pos = e.target.selectionStart;
      renderBiblioteca({ atualizarUrl: true });
      e.target.setSelectionRange(pos, pos);
    }, 160);
  });

  $('#form-hero').addEventListener('submit', (e) => { e.preventDefault(); irBusca($('#hero-q').value); });
  $('#form-bib').addEventListener('submit', (e) => e.preventDefault());
  $('#form-contato').addEventListener('submit', conferirFormulario);
  $('#form-contato').addEventListener('reset', () => setTimeout(() => { contarCaracteres(); atualizarAssunto(); aviso.textContent = ''; }, 0));
  campoMensagem.addEventListener('input', contarCaracteres);

  $('#form-entrar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const avisoAcesso = $('#mensagem-acesso');
    avisoAcesso.textContent = 'Verificando acesso…';
    try {
      const r = await requisicaoApi('../backend/auth.php?acao=entrar', {
        method: 'POST',
        body: { email: $('#login-email').value, senha: $('#login-senha').value },
      });
      $('#login-senha').value = '';
      await abrirAplicacao(r.usuario, r.csrf);
    } catch (erro) {
      avisoAcesso.textContent = erro.message;
    }
  });

  $('#form-registro').addEventListener('submit', async (e) => {
    e.preventDefault();
    const avisoAcesso = $('#mensagem-acesso');
    avisoAcesso.textContent = 'Enviando cadastro…';
    try {
      const r = await requisicaoApi('../backend/auth.php?acao=registrar', {
        method: 'POST',
        body: {
          nome: $('#registro-nome').value,
          email: $('#registro-email').value,
          senha: $('#registro-senha').value,
          papel: $('#registro-papel').value,
        },
      });
      $('#registro-senha').value = '';
      avisoAcesso.textContent = r.mensagem;
      if (!r.pendente) {
        $('#login-email').value = $('#registro-email').value;
        alternarFormularioAcesso('entrar');
        $('#mensagem-acesso').textContent = r.mensagem;
      }
    } catch (erro) {
      avisoAcesso.textContent = erro.message;
    }
  });

  document.addEventListener('keydown', (e) => {
    const emCampo = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if (e.key === '/' && !emCampo && !dlg.open && !e.ctrlKey && !e.metaKey) { e.preventDefault(); campoGlobal.focus(); }
    if (e.key === 'Escape' && document.body.classList.contains('nav-aberta')) { fecharMenu(); $('#btn-menu').focus(); }
  });

  window.addEventListener('hashchange', rotear);
  mqEscuro.addEventListener('change', aplicarPrefs);

  /* =========================================================================
     INÍCIO
     ========================================================================= */
  (async function iniciar() {
    aplicarPrefs();
    try {
      const sessao = await requisicaoApi('../backend/auth.php?acao=sessao');
      if (!sessao.usuario) {
        mostrarAcesso('', sessao.csrf || '');
        return;
      }
      estado.usuario = sessao.usuario;
      estado.csrf = sessao.csrf || '';
      estado.progresso = {};
      estado.cursosVisualizados = new Set();
      atualizarAcessoUsuario();
      await carregarDocumentos();
    } catch (erro) {
      if (!estado.usuario) {
        mostrarAcesso('Não foi possível validar a sessão. Confira se o backend PHP está ativo.');
        console.error(erro);
        return;
      }
      $('#conteudo').innerHTML = `<div class="vazio"><strong>Não foi possível carregar os documentos</strong>Verifique sua conexão e recarregue a página.</div>`;
      console.error(erro);
      return;
    }
    rotear();
  })();
})();
