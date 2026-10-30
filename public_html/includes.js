async function injectPartial(targetId, url) {
  const el = document.getElementById(targetId);
  if (!el) return;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo cargar ${url} (${res.status})`);
  el.innerHTML = await res.text();
}

document.addEventListener("DOMContentLoaded", async () => {
  const base = document.body.getAttribute("data-partials-base") || "./";

  try {
    await Promise.all([
      injectPartial("site-header", `${base}header.html`),
      injectPartial("site-footer", `${base}footer.html`),
    ]);

    // ✅ Este es el que tu i18n.js está escuchando
    document.dispatchEvent(new CustomEvent("layout:loaded"));
  } catch (e) {
    console.error(e);
  }
});
