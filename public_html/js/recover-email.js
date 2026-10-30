document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("recover-email-form");
  const alertBox = document.getElementById("recover-email-alert");
  const btn = document.getElementById("recover-email-submit");
  const devBox = document.getElementById("recover-dev-link");

  if (!form) return;

  const setAlert = (msg = "", ok = false) => {
    alertBox.style.color = ok ? "#166534" : "#b91c1c";
    alertBox.textContent = msg;
  };

  const setLoading = (on) => {
    btn.disabled = on;
    btn.style.opacity = on ? "0.85" : "1";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (devBox) { devBox.hidden = true; devBox.innerHTML = ""; }
    setAlert("");

    const email = document.getElementById("recover-email")?.value?.trim() || "";
    if (!email) return setAlert("Introduce tu email.");

    setLoading(true);

    try {
      // [FUTURE API] const res = await fetch("/api/auth/recover-request", { ... });
      const res = await fetch(apiUrl('auth/forgot-password'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email })
      });

      const data = await res.json().catch(() => ({}));

      // Importante: aunque el email no exista, respondemos “OK” (seguridad).
      if (!res.ok) {
        setAlert(data.message || "No se pudo procesar la solicitud.");
        setLoading(false);
        return;
      }

      setAlert(
        "Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.",
        true
      );

      // En local: si el backend devuelve devLink, lo mostramos para probar sin emails
      if (data.devLink && devBox) {
        devBox.hidden = false;
        devBox.innerHTML = `Enlace de prueba (local): <a href="${data.devLink}">${data.devLink}</a>`;
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setAlert("Error de red. Revisa el servidor.");
      setLoading(false);
    }
  });
});
