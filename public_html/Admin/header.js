// Header shared behavior: set active nav and wire navigation
function setupHeaderNavigation() {
  const path = window.location.pathname;

  // Known subdirectories (lowercase for matching)
  const subdirs = ["actividades", "foro", "pagos", "perfil"];
  const currentPath = path.toLowerCase();
  const currentSubdir = subdirs.find((s) =>
    currentPath.includes("/" + s + "/")
  );

  // Determine path prefix: ./ for root Admin files, ../ for subdirectory files
  const prefix = currentSubdir ? "../" : "./";

  // Improved module detection for active state
  let currentModule = "dashboard";
  if (currentSubdir) {
    // Map folder names to data-nav IDs
    const folderMap = {
      actividades: "actividades",
      foro: "foro",
      pagos: "pagos",
      perfil: "perfil",
    };
    currentModule = folderMap[currentSubdir] || "dashboard";
  } else {
    // Fallback for root files
    if (
      path.endsWith("app.html") ||
      path.endsWith("/Admin/") ||
      path.endsWith("/Admin")
    ) {
      currentModule = "dashboard";
    }
  }

  const header = document.querySelector("header.header");
  const navButtons = header ? header.querySelectorAll(".nav-btn") : [];

  if (navButtons.length === 0) {
    // Retry if buttons not found yet
    setTimeout(setupHeaderNavigation, 100);
    return;
  }

  navButtons.forEach((b) => {
    if (b.dataset.nav === currentModule) b.classList.add("active");
    b.addEventListener("click", (e) => {
      e.preventDefault();
      const v = b.dataset.nav;
      let targetPath;

      // Always use capitalized folder names for consistency
      if (v === "dashboard") {
        targetPath = prefix + "app.html";
      } else if (v === "perfil") {
        targetPath = prefix + "Perfil/permisos.html";
      } else if (v === "foro") {
        targetPath = prefix + "Foro/eliminar.html";
      } else if (v === "pagos") {
        targetPath = prefix + "Pagos/pagos-realizados.html";
      } else if (v === "actividades") {
        targetPath = prefix + "Actividades/crear.html";
      } else if (v === "config") {
        targetPath = prefix + "Configuracion/cookies.html";
      } else if (v === "reportes") {
        targetPath = prefix + "Reportes/actividad.html";
      } else {
        targetPath = prefix + "app.html";
      }
      window.location.href = targetPath;
    });
  });

  // --- NEW ACTIONS ---
  const btnFrontend = document.getElementById('btn-go-frontend');
  if(btnFrontend){
      btnFrontend.addEventListener('click', () => {
          // Go to FrontendCliente (sibling folder to Admin)
          // If prefix is "./", we are in Admin root -> "../FrontendCliente/"
          // If prefix is "../", we are in Admin/Sub -> "../../FrontendCliente/"
          const base = prefix === "./" ? "../" : "../../"; 
          window.location.href = base + "FrontendCliente/index.html";
      });
  }

  const btnLogout = document.getElementById('btn-logout');
  if(btnLogout){
      btnLogout.addEventListener('click', () => {
          if(confirm('¿Cerrar sesión?')){
            localStorage.removeItem('jwt_token');
            // Redirect to login (sibling to Admin folder is index.html or login.html)
            const base = prefix === "./" ? "../" : "../../";
            window.location.href = base + "login.html"; 
          }
      });
  }
}

// Load user information from API
async function loadUserInfo() {
  // Primero mostrar valores por defecto inmediatamente
  showDefaultUserInfo();

  try {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      console.log("No JWT token found");
      return;
    }

    const apiUrl = "https://api.duobusinesslingo.com/auth/me";

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });


    if (response.ok) {
      const responseData = await response.json();

      // La API devuelve los datos en responseData.data
      const usuario = responseData.data;

      if (usuario && usuario.nombre) {
        const userName = usuario.nombre;
        const userGreet = document.querySelector(".user-greet");
        const avatar = document.querySelector(".avatar");


        if (userGreet) {
          userGreet.textContent = `Hola, ${userName}`;
        }

        if (avatar) {
          avatar.textContent = userName.charAt(0).toUpperCase();
        }
      } else {
        console.log("No usuario.nombre found in response");
      }
    } else {
      console.log("API request failed");
    }
  } catch (error) {
    console.error("Error al cargar información del usuario:", error);
  }
}

// Mostrar información por defecto
function showDefaultUserInfo() {
  const userGreet = document.querySelector(".user-greet");
  const avatar = document.querySelector(".avatar");

  if (userGreet) {
    userGreet.style.opacity = "1";
  }
  if (avatar) {
    avatar.style.opacity = "1";
  }
}

// Setup on DOMContentLoaded or immediately if already loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setupHeaderNavigation();
    loadUserInfo();
  });
} else {
  setupHeaderNavigation();
  loadUserInfo();
}
