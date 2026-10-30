document.addEventListener("DOMContentLoaded", () => {
  const activate = () => {
    const footer = document.querySelector("#site-footer");
    if (!footer) return false;

    const a = footer.querySelector('a[href="./terms.html"], a[href="terms.html"]');
    if (!a) return false;

    a.classList.add("active");
    return true;
  };

  if (activate()) return;
  const obs = new MutationObserver(() => activate() && obs.disconnect());
  obs.observe(document.documentElement, { childList: true, subtree: true });
});
