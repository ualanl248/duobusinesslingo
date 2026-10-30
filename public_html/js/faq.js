document.addEventListener("DOMContentLoaded", () => {
  // Acordeón FAQ
  const list = document.getElementById("faq-list");
  if (list) {
    // accesibilidad básica
    list.querySelectorAll(".faq-q").forEach((q) => {
      q.setAttribute("role", "button");
      q.setAttribute("tabindex", "0");
      q.setAttribute("aria-expanded", q.closest(".faq-item")?.classList.contains("open") ? "true" : "false");
    });

    const setOpen = (item, open) => {
      item.classList.toggle("open", open);
      const q = item.querySelector(".faq-q");
      if (q) q.setAttribute("aria-expanded", open ? "true" : "false");
    };

    const closeAllExcept = (keep) => {
      list.querySelectorAll(".faq-item").forEach((it) => {
        if (it !== keep) setOpen(it, false);
      });
    };

    const toggleFrom = (qEl) => {
      const item = qEl.closest(".faq-item");
      if (!item) return;
      const willOpen = !item.classList.contains("open");
      closeAllExcept(item);
      setOpen(item, willOpen);
    };

    list.addEventListener("click", (e) => {
      const q = e.target.closest(".faq-q");
      if (!q) return;
      toggleFrom(q);
    });

    list.addEventListener("keydown", (e) => {
      const q = e.target.closest(".faq-q");
      if (!q) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleFrom(q);
      }
    });
  }

  // Marcar link activo cuando el header se inyecta
  const markActive = () => {
    const header = document.querySelector("#site-header");
    if (!header) return false;
    const link = header.querySelector('a[href="./faq.html"], a[href="faq.html"]');
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
