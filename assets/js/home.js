document.querySelectorAll('.navbar-area .menu-item-has-children > a').forEach(link => {
  link.addEventListener('click', event => event.preventDefault());
});

const navbar = document.querySelector('.navbar');
const backToTop = document.querySelector('.back-to-top');
let scheduled = false;
let wasSticky = false;
let wasBackToTopVisible = false;
function updateScrollControls() {
  const scrollY = window.scrollY;
  const isSticky = scrollY >= 445;
  const isBackToTopVisible = scrollY > 1000;
  if (isSticky !== wasSticky) {
    navbar?.classList.toggle('sticky-active', isSticky);
    wasSticky = isSticky;
  }
  if (backToTop && isBackToTopVisible !== wasBackToTopVisible) {
    backToTop.style.display = isBackToTopVisible ? 'block' : 'none';
    wasBackToTopVisible = isBackToTopVisible;
  }
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
window.addEventListener('pageshow', updateScrollControls);
