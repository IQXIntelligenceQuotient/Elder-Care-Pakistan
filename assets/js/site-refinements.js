const menuTrigger = document.querySelector('.navbar-area .menu.toggle-btn[aria-controls], .ecp-care-menu-trigger');

if (menuTrigger && typeof HTMLDialogElement !== 'undefined' && HTMLDialogElement.prototype.showModal) {
  const menu = document.getElementById(menuTrigger.getAttribute('aria-controls'));
  if (menu) {
    const mobile = window.matchMedia('(max-width: 991.98px)');
    const originalPosition = document.createComment('Main navigation');
    menu.before(originalPosition);
    const drawer = document.createElement('dialog');
    drawer.className = 'ecp-nav-drawer';
    drawer.setAttribute('aria-labelledby', 'ecp-nav-title');
    drawer.innerHTML = '<div class="ecp-nav-drawer-header"><h2 id="ecp-nav-title">Menu</h2><button type="button" autofocus aria-label="Close navigation">×</button></div>';
    const closeButton = drawer.querySelector('button');
    document.body.append(drawer);
    menuTrigger.classList.add('ecp-menu-ready');
    menuTrigger.setAttribute('aria-haspopup', 'dialog');
    let scrollPosition = 0;

    function closeDrawer() {
      if (!drawer.open) return;
      drawer.close();
      originalPosition.after(menu);
      menuTrigger.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('ecp-nav-locked');
      document.body.style.removeProperty('--ecp-nav-scroll-top');
      if (mobile.matches) menuTrigger.focus({ preventScroll: true });
      window.scrollTo({ top: scrollPosition, behavior: 'instant' });
    }

    menuTrigger.addEventListener('click', () => {
      if (!mobile.matches || drawer.open) return;
      scrollPosition = window.scrollY;
      drawer.append(menu);
      document.body.style.setProperty('--ecp-nav-scroll-top', `-${scrollPosition}px`);
      document.documentElement.classList.add('ecp-nav-locked');
      menuTrigger.setAttribute('aria-expanded', 'true');
      drawer.showModal();
    });

    closeButton.addEventListener('click', closeDrawer);
    drawer.addEventListener('cancel', event => {
      event.preventDefault();
      closeDrawer();
    });
    drawer.addEventListener('click', event => {
      if (event.target === drawer) {
        const bounds = drawer.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right) closeDrawer();
        return;
      }
      const link = event.target.closest('a');
      if (!link) return;
      if (link.matches('.menu-item-has-children > a')) {
        event.preventDefault();
        link.setAttribute('aria-expanded', String(link.getAttribute('aria-expanded') !== 'true'));
      } else {
        closeDrawer();
      }
    });
    mobile.addEventListener('change', () => {
      if (!mobile.matches) closeDrawer();
    });
  }
}
