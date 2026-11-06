document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || document.querySelector('dialog[open]')) return;

  const menu = document.querySelector('.navbar-area .menu.toggle-btn[aria-expanded="true"]');
  if (!menu || !menu.getClientRects().length) return;

  menu.click();
  menu.focus();
});
