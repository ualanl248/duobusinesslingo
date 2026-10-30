(() => {
  async function fetchMe() {
    // Si no hay token, no intentar hacer la petición
    if (!hasToken()) {
      return null;
    }

    try {
      const res = await fetchAuth('auth/me');
      if (!res.ok) return null;
      const data = await res.json().catch(() => null);
      if (data?.status === 'ok') {
        return data.data;
      }
      return null;
    } catch (error) {
      // Silenciar errores de CORS/red en páginas de visitante - es esperado
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        // Error de red o CORS - probablemente estamos en una página visitante sin sesión válida
        clearToken(); // Limpiar token inválido
        return null;
      }
      console.error('Error checking auth:', error);
      return null;
    }
  }

  function setAuthUI(user) {
    // Oculta/muestra elementos según autenticación
    document.querySelectorAll("[data-auth='guest']").forEach(el => {
      el.style.display = user ? "none" : "";
    });
    document.querySelectorAll("[data-auth='authed']").forEach(el => {
      el.style.display = user ? "" : "none";
    });

    const nameEl = document.querySelector("[data-auth-name]");
    if (nameEl) nameEl.textContent = user?.nombre || user?.email || "";
  }

  async function doLogout() {
    try {
      await fetchAuth('auth/logout', { method: "POST" });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      clearToken();
      window.location.href = "./index.html";
    }
  }

  function wireLogout() {
    const btn = document.querySelector("[data-logout]");
    if (!btn || btn.dataset.wired === "1") return;
    btn.dataset.wired = "1";

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      doLogout();
    });
  }

  async function init() {
    if (!hasToken()) {
      setAuthUI(null);
      wireLogout();
      return;
    }

    const user = await fetchMe();
    setAuthUI(user);
    wireLogout();
  }

  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("layout:loaded", init); // cuando se inyecta header/footer
})();
