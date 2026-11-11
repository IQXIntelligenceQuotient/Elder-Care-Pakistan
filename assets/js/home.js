document.querySelectorAll('.navbar-area .menu-item-has-children > a').forEach(link => {
  link.addEventListener('click', event => event.preventDefault());
});

const navbar = document.querySelector('.navbar');
const backToTop = document.querySelector('.back-to-top');
let scheduled = false;
function updateScrollControls() {
  navbar?.classList.toggle('sticky-active', window.scrollY >= 445);
  if (backToTop) backToTop.hidden = window.scrollY <= 1000;
  scheduled = false;
}
window.addEventListener('scroll', () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(updateScrollControls);
}, { passive: true });
backToTop?.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });
});
updateScrollControls();
