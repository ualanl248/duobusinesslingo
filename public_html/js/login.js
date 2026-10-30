/**
 * =============================================================================
 * LOGIN.JS - Módulo de Autenticación
 * =============================================================================
 * 
 * CONFIGURACIÓN ACTUAL: API Local PHP (XAMPP)
 * 
 * Este archivo maneja el login del usuario. Actualmente conecta a la API PHP
 * local para pruebas. En el futuro, se migrará a una API REST con JWT.
 * 
 * =============================================================================
 * GUÍA DE MIGRACIÓN A API REST (FUTURO)
 * =============================================================================
 * 
 * Cuando implementes la API REST externa (ej: Slim Framework, Laravel, etc.),
 * sigue estos pasos:
 * 
 * 1. CAMBIAR LA URL DEL ENDPOINT (línea ~35):
 *    - ACTUAL:  "./api/auth/login.php"
 *    - FUTURO:  "https://api.tudominio.com/auth/login"
 * 
 * 2. AJUSTAR EL BODY DE LA PETICIÓN (línea ~39):
 *    La API externa puede esperar campos diferentes:
 *    - ACTUAL:  { email, password }
 *    - FUTURO:  { email, pass } o { username, password } según tu API
 * 
 * 3. AJUSTAR LA RESPUESTA (líneas ~50-65):
 *    La estructura de respuesta puede variar:
 *    
 *    API LOCAL devuelve:
 *    {
 *      "message": "OK",
 *      "token": "dummy_token",
 *      "user": { "id": 1, "name": "...", "isAdmin": 0|1 }
 *    }
 *    
 *    API REST típica devuelve:
 *    {
 *      "status": "ok",
 *      "data": { 
 *        "token": "eyJhbGciOiJIUzI1NiIs...",  // JWT real
 *        "es_admin": 0|1,
 *        "user_id": 1
 *      }
 *    }
 *    
 *    Cambia estas líneas según la estructura de tu API:
 *    - const responseData = data.user || data.data || data;
 *    - const isAdmin = responseData.isAdmin == 1;  // o responseData.es_admin
 * 
 * 4. QUITAR credentials: "include" (línea ~38):
 *    - Si usas JWT puro, no necesitas cookies de sesión
 *    - Si usas cookies HttpOnly para el token, déjalo
 * 
 * 5. AÑADIR EL TOKEN A PETICIONES FUTURAS:
 *    Una vez guardado el JWT, todas las peticiones autenticadas deben incluirlo:
 *    
 *    fetch('/api/protected-endpoint', {
 *      headers: {
 *        'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
 *        'Content-Type': 'application/json'
 *      }
 *    });
 * 
 * 6. CONFIGURAR CORS EN EL SERVIDOR:
 *    Si la API está en otro dominio, asegúrate de tener CORS configurado:
 *    - Access-Control-Allow-Origin: https://tudominio.com
 *    - Access-Control-Allow-Credentials: true (si usas cookies)
 *    - Access-Control-Allow-Headers: Authorization, Content-Type
 * 
 * =============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const alertBox = document.getElementById("login-alert");
  const submitBtn = document.getElementById("login-submit");

  if (!form) return;

  const setAlert = (msg = "") => {
    alertBox.textContent = msg;
  };

  const setLoading = (loading) => {
    submitBtn.disabled = loading;
    submitBtn.style.opacity = loading ? "0.85" : "1";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setAlert("");

    const email = form.email?.value?.trim();
    const password = form.password?.value ?? "";

    if (!email || !password) {
      setAlert("Completa email y contraseña.");
      return;
    }

    setLoading(true);

    try {
      // Usar apiUrl() de config.js para detectar ambiente automáticamente
      const res = await fetch(apiUrl('auth/login'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setAlert(data.message || data.error || "No se pudo iniciar sesión.");
        setLoading(false);
        return;
      }

      // =========================================================================
      // PROCESAR RESPUESTA
      // =========================================================================
      // La API REST devuelve { status: "ok", data: { token, usuario: {...} } }
      // =========================================================================

      if (data.status !== 'ok') {
        setAlert(data.error || "Error en el servidor");
        setLoading(false);
        return;
      }

      // Guardar el token JWT usando helper de config.js
      if (data.data?.token) {
        saveToken(data.data.token);
        console.log("Token guardado en localStorage");
      } else {
        setAlert("No se recibió token de autenticación");
        setLoading(false);
        return;
      }

      // Redirección tras login -> Área de Clientes o Admin
      const usuario = data.data.usuario || {};
      console.log("Login response data:", usuario);

      // =========================================================================
      // DETERMINAR SI ES ADMIN
      // =========================================================================
      // La API REST devuelve 'esAdmin' en el objeto usuario
      // =========================================================================
      const isAdmin = usuario.esAdmin == 1;

      if (isAdmin) {
        console.log("Redirecting to Admin...");
        window.location.href = "./Admin/app.html";
      } else {
        console.log("Redirecting to client area.");
        window.location.href = "./FrontendCliente/index.html";
      }
    } catch (err) {
      console.error(err);
      setAlert("Error de red. Revisa la API o CORS.");
      setLoading(false);
    }
  });
});
