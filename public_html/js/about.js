// Page-specific helpers for about.html
document.addEventListener("DOMContentLoaded", () => {
  // Marca "Sobre nosotros" como activo cuando el header se inyecta
  const markActive = () => {
    const header = document.querySelector("#site-header");
    if (!header) return false;

    const link = header.querySelector('a[href="./about.html"], a[href="about.html"]');
    if (!link) return false;

    link.classList.add("active");
    return true;
  };

  if (markActive()) return;

  const obs = new MutationObserver(() => {
    if (markActive()) obs.disconnect();
  });

  obs.observe(document.documentElement, { childList: true, subtree: true });
});
