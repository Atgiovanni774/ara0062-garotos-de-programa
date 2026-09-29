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
