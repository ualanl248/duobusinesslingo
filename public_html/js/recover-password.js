document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("recover-password-form");
  const alertBox = document.getElementById("recover-alert");
  const btn = document.getElementById("recover-submit");

  if (!form) return;

  const token = new URLSearchParams(location.search).get("token") || "";

  const setAlert = (msg = "") => { alertBox.textContent = msg; };
  const setLoading = (on) => {
    btn.disabled = on;
    btn.style.opacity = on ? "0.85" : "1";
  };

  if (!token) {
    setAlert("El enlace de recuperación no es válido o ha caducado.");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setAlert("");

    if (!token) {
      setAlert("El enlace de recuperación no es válido o ha caducado.");
      return;
    }

    const p1 = document.getElementById("new-password").value;
    const p2 = document.getElementById("confirm-password").value;

    if (p1 !== p2) return setAlert("Las contraseñas no coinciden.");
    if (p1.length < 8) return setAlert("La contraseña debe tener al menos 8 caracteres.");

    setLoading(true);

    try {
      // [FUTURE API] const res = await fetch("/api/auth/reset-password", { ... });
      const res = await fetch(apiUrl('auth/reset-password'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, password: p1 })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setAlert(data.message || "No se pudo cambiar la contraseña.");
        setLoading(false);
        return;
      }

      // OK -> al login
      window.location.href = "./login.html";
    } catch (err) {
      console.error(err);
      setAlert("Error de red. Revisa el servidor.");
      setLoading(false);
    }
  });
});
