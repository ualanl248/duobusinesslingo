function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const isOpen = document.body.classList.toggle('nav-open');
      // Switch between hamburger and X
      toggle.textContent = isOpen ? '✕' : '☰';
      toggle.setAttribute('aria-expanded', isOpen);
    });
  }

  const dropdown = document.querySelector('.lang-dropdown');
  if (dropdown) {
    const trigger = dropdown.querySelector('.lang');
    const menu = dropdown.querySelector('.lang-menu');

    trigger?.addEventListener('click', (e) => {
      e.preventDefault();
      dropdown.classList.toggle('open');
      trigger.setAttribute('aria-expanded', dropdown.classList.contains('open') ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
        trigger?.setAttribute('aria-expanded', 'false');
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) document.body.classList.remove('nav-open');
    });
  }
}

// If header/footer are injected, wait for that event
document.addEventListener('layout:loaded', initNav);

// Fallback for pages without injection (or if header is already in DOM)
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('header')) initNav();
});
