(() => {
  const KEY = "gsa_cookie_consent"; // "accepted" | "rejected"

  const get = () => localStorage.getItem(KEY);
  const set = (v) => localStorage.setItem(KEY, v);

  function hideBanner() {
    const banner = document.getElementById("cookie-banner");
    if (!banner) return;
    banner.hidden = true;
  }

  function showBanner() {
    const banner = document.getElementById("cookie-banner");
    if (!banner) return;
    banner.hidden = false;
  }

  function emit(consent) {
    document.dispatchEvent(new CustomEvent("cookie:consent", { detail: { consent } }));
  }

  function wire() {
    const accept = document.getElementById("cookie-accept");
    const reject = document.getElementById("cookie-reject");

    if (accept && accept.dataset.wired !== "1") {
      accept.dataset.wired = "1";
      accept.addEventListener("click", () => {
        set("accepted");
        hideBanner();
        emit("accepted");
      });
    }

    if (reject && reject.dataset.wired !== "1") {
      reject.dataset.wired = "1";
      reject.addEventListener("click", () => {
        set("rejected");
        hideBanner();
        emit("rejected");
      });
    }
  }

  function init() {
    // Si ya eligió, no molestamos
    if (get()) {
      hideBanner();
      return;
    }
    showBanner();
    wire();
  }

  // Cuando carga la página
  document.addEventListener("DOMContentLoaded", init);

  // Cuando se inyecta el footer (porque el banner está en footer.html)
  document.addEventListener("layout:loaded", () => {
    init();
  });
})();
