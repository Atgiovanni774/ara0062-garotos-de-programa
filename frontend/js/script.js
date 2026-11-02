const themeSelect = document.getElementById('theme-select');
const savedTheme = localStorage.getItem('ara0062-theme') || themeSelect.value;

themeSelect.value = savedTheme;
document.documentElement.classList.toggle('dark-mode', savedTheme === 'dark');

function showTab(tabId, event) {
	event.preventDefault();

	const activeSection = document.getElementById(tabId);
	if (!activeSection) return;

	document.querySelectorAll('.tab-content').forEach((section) => {
		section.classList.toggle('active', section === activeSection);
	});

	document.querySelectorAll('aside nav a').forEach((link) => {
		link.classList.toggle('active', link === event.currentTarget);
	});

	document.getElementById('page-title').textContent =
		activeSection.querySelector('h2').textContent;
}

function mudarTema() {
	const darkModeEnabled = themeSelect.value === 'dark';

	document.documentElement.classList.toggle('dark-mode', darkModeEnabled);
	localStorage.setItem('ara0062-theme', darkModeEnabled ? 'dark' : 'light');
}

const campoMensagem = document.querySelector("#mensagem");
const contador = document.querySelector("#contador");

function contarCaracteres() {
  const restam = campoMensagem.maxLength - campoMensagem.value.length;

  contador.textContent = `Restam ${restam} caracteres`;

  if (restam < 50) {
    contador.classList.add("alerta");
  } else {
    contador.classList.remove("alerta");
  }
}

campoMensagem.addEventListener("input", contarCaracteres);

const formulario = document.querySelector("form");
const campoNome = document.querySelector("#nome");
const campoAssunto = document.querySelector("#assunto");
const aviso = document.querySelector("#aviso");

function temNumero(texto) {
  let achou = false;

  for (let i = 0; i < texto.length; i++) {
    if ("0123456789".includes(texto[i])) {
      achou = true;
      break;
    }
  }

  return achou;
}

function conferirFormulario(evento) {
  let nome = campoNome.value.trim();

  while (nome.includes("  ")) {
    nome = nome.replace("  ", " ");
  }

  campoNome.value = nome;

  if (nome.length < 3 || nome.length > 60) {
    evento.preventDefault();
    aviso.textContent = "O nome precisa ter entre 3 e 60 letras.";
  } else if (temNumero(nome)) {
    evento.preventDefault();
    aviso.textContent = "O nome não pode ter números.";
  } else if (campoAssunto.value === "trabalho" && campoMensagem.value.trim().length < 20) {
    evento.preventDefault();
    aviso.textContent = "Conte mais sobre a proposta (mínimo 20).";
  } else {
    aviso.textContent = "Tudo certo! Enviando...";
  }
}

formulario.addEventListener("submit", conferirFormulario);

function trocarDica() {
  switch (campoAssunto.value) {
    case "duvida":
      campoMensagem.placeholder = "Qual é a sua dúvida?";
      break;
    case "trabalho":
      campoMensagem.placeholder = "Conte a proposta: o que é e o prazo.";
      break;
    default:
      campoMensagem.placeholder = "Escreva a sua mensagem.";
  }
}
