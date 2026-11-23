try {
  const preferencias = JSON.parse(localStorage.getItem('gaco-prefs') || '{}');
  const temaEscuro = preferencias.tema === 'escuro' || ((!preferencias.tema || preferencias.tema === 'auto') && matchMedia('(prefers-color-scheme: dark)').matches);
  const classes = document.documentElement.classList;
  if (temaEscuro) classes.add('dark-mode');
  if (preferencias.texto === 'grande') classes.add('texto-grande');
  if (preferencias.movimento === 'reduzido') classes.add('sem-movimento');
} catch (erro) {
  console.error('Não foi possível aplicar as preferências salvas.', erro);
}
