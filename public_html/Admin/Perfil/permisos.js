// permisos.js - Conceder Permisos de Administrador
const getToken = () => localStorage.getItem('jwt_token');
(function () {
  const container = document.getElementById("content-area");

  // Mock users (fallback)
  let mockUsers = [
    {
      id: "U1001",
      name: "Ana Pérez",
      email: "ana@ejemplo.com",
      isAdmin: true,
    },
    {
      id: "U1002",
      name: "Luis Gómez",
      email: "luis@ejemplo.com",
      isAdmin: false,
    },
    {
      id: "U1003",
      name: "María López",
      email: "maria@ejemplo.com",
      isAdmin: true,
    },
    {
      id: "U1004",
      name: "Carlos Ruiz",
      email: "carlos@ejemplo.com",
      isAdmin: false,
    },
  ];

  function getApi() {
    return (window.__PERFIL && window.__PERFIL.api) || null;
  }

  // Fetch users; supports options { search, roleFilter: 'all'|'admins' }
  async function fetchUsers(options = {}) {
    const api = getApi();
    if (api && typeof api.fetchUsers === "function") {
      return await api.fetchUsers(options);
    }
    const token = getToken();
    // Intentar llamar a la API REST nueva
    try {
      const params = new URLSearchParams();
      if (options.search) params.append("search", options.search);
      if (options.roleFilter) params.append("roleFilter", options.roleFilter);

      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(
        `https://api.duobusinesslingo.com/usuarios/buscar`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cargar usuarios");
      }

      const data = await response.json();

      // La API REST devuelve: { status: "ok", data: [...] }
      if (data.status !== 'ok') {
        throw new Error(data.error || "Error al cargar usuarios");
      }

      // Mapear de la estructura del backend a la estructura esperada por el frontend
      const users = data.data.map(u => ({
        id: u.idUsuario,
        name: u.nombre,
        email: u.email,
        isAdmin: u.esAdmin
      }));
      let result = users;
      if (options.search) {
        const s = options.search.toLowerCase();
        result = result.filter(
          (u) =>
            u.name.toLowerCase().includes(s) ||
            u.email.toLowerCase().includes(s)
        );
      }
      if (options.roleFilter === "admins") {
        result = result.filter((u) => u.isAdmin);
      }
      return result;
    } catch (error) {
      console.error("API Error (fetchUsers):", error);

      // Fallback a datos mock
      let result = mockUsers.slice();
      if (options.search) {
        const s = options.search.toLowerCase();
        result = result.filter(
          (u) =>
            u.name.toLowerCase().includes(s) ||
            u.email.toLowerCase().includes(s)
        );
      }
      if (options.roleFilter === "admins") {
        result = result.filter((u) => u.isAdmin);
      }
      return result;
    }
  }

  async function setAdminRole(userId, isAdmin) {
    const api = getApi();
    if (api && typeof api.setAdminRole === "function") {
      return await api.setAdminRole(userId, isAdmin);
    }

    // Intentar llamar a la API REST nueva
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch("https://api.duobusinesslingo.com/usuarios/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ userId, esAdmin: isAdmin }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar rol");
      }

      const data = await response.json();
      if (data.status !== 'ok') {
        throw new Error(data.error || "Error al actualizar rol");
      }

      return { success: true };
    } catch (error) {
      console.error("API Error (setAdminRole):", error);

      // Fallback a mock
      mockUsers = mockUsers.map((u) =>
        u.id === userId ? Object.assign({}, u, { isAdmin }) : u
      );
      return { success: true };
    }
  }

  async function adminResetPassword(userId, newPassword) {
    try {
      const response = await fetch("/api-admin/perfil/admin-reset-password.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al restablecer contraseña");
      }

      const data = await response.json();
      if (!data.success)
        throw new Error(data.error || "Error al restablecer contraseña");

      return data;
    } catch (error) {
      console.error("API Error (adminResetPassword):", error);
      throw error;
    }
  }

  function renderLayout() {
    if (!container) return;
    container.innerHTML = `
      <div class="dashboard-header">
        <h2>Conceder permisos de administrador</h2>
        <p>Gestiona quién tiene acceso de administrador en la plataforma</p>
      </div>

      <div class="card" style="margin-top: 12px">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <div style="flex:1;min-width:220px">
            <label class="search-label">Buscar usuario</label>
            <div style="display:flex;gap:8px;margin-top:8px">
              <input id="perm-search-input" class="search-input" placeholder="Buscar por nombre o email..." />
              <button id="perm-search-btn" class="btn btn-primary">Buscar</button>
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <button id="perm-filter-all" class="btn">Todos los usuarios</button>
            <button id="perm-filter-admin" class="btn btn-primary">Solo administradores</button>
            <button id="perm-refresh" class="btn">Refrescar</button>
          </div>
        </div>
      </div>

      <div id="perm-grid" class="permissions-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px"></div>
      <div id="perm-status" style="margin-top:8px;color:#666;font-size:13px"></div>
    `;
  }

  function renderUserCards(users) {
    const grid = document.getElementById("perm-grid");
    if (!grid) return;
    if (!users || users.length === 0) {
      grid.innerHTML = '<div class="card">No se encontraron usuarios.</div>';
      return;
    }

    grid.innerHTML = users
      .map(
        (u) => `
      <div class="permission-card card" data-id="${u.id}">
        <h4 style="margin:0">${escapeHtml(u.name)}</h4>
        <div class="kv">${escapeHtml(u.email)}</div>
        <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-secondary role-btn" data-id="${u.id
          }" data-admin="${u.isAdmin ? "1" : "0"}" style="flex:1; min-width:140px;">
            ${u.isAdmin
            ? "Administrador (Quitar rol)"
            : "No es administrador (Conceder rol)"
          }
          </button>
          <button class="btn reset-pwd-btn" data-id="${u.id}" data-name="${escapeHtml(u.name)}" style="background:#b82828;color:white;min-width:140px;">
            Restablecer contraseña
          </button>
        </div>
      </div>
    `
      )
      .join("");

    // attach handlers for role buttons
    grid.querySelectorAll(".role-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const currently = btn.dataset.admin === "1";
        const status = document.getElementById("perm-status");
        try {
          status.textContent = "Actualizando rol...";
          await setAdminRole(id, !currently);
          await reload();
          status.textContent = "";
        } catch (err) {
          console.error("Role update error", err);
          status.textContent = "Error al actualizar rol";
        }
      });
    });

    // attach handlers for reset password buttons
    grid.querySelectorAll(".reset-pwd-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const userId = btn.dataset.id;
        const userName = btn.dataset.name;
        const status = document.getElementById("perm-status");

        // Prompt for new password
        const newPassword = prompt(`Introduce la nueva contraseña para ${userName}:\n\n(Mínimo 6 caracteres)`);

        if (!newPassword) {
          return; // User cancelled
        }

        if (newPassword.length < 6) {
          alert("La contraseña debe tener al menos 6 caracteres");
          return;
        }

        try {
          status.textContent = "Restableciendo contraseña...";
          await adminResetPassword(userId, newPassword);
          status.textContent = "";
          alert(`Contraseña de ${userName} actualizada correctamente`);
        } catch (err) {
          console.error("Password reset error", err);
          status.textContent = "Error al restablecer contraseña";
          alert("Error al restablecer contraseña: " + err.message);
        }
      });
    });
  }

  async function reload() {
    const status = document.getElementById("perm-status");
    try {
      status.textContent = "Cargando...";
      const input = document.getElementById("perm-search-input");
      const search = input ? input.value.trim() : "";
      const filterAdmin = document
        .getElementById("perm-filter-admin")
        .classList.contains("btn-primary");
      const roleFilter = filterAdmin ? "admins" : "all";
      const users = await fetchUsers({ search, roleFilter });
      renderUserCards(users);
      status.textContent = "";
    } catch (err) {
      console.error("Failed loading users", err);
      status.textContent = "Error al cargar usuarios";
    }
  }

  function attachHandlers() {
    const btnAll = document.getElementById("perm-filter-all");
    const btnAdmin = document.getElementById("perm-filter-admin");
    const searchBtn = document.getElementById("perm-search-btn");
    const refresh = document.getElementById("perm-refresh");
    const input = document.getElementById("perm-search-input");

    if (btnAll && btnAdmin) {
      btnAll.addEventListener("click", () => {
        btnAll.classList.add("btn-primary");
        btnAdmin.classList.remove("btn-primary");
        reload();
      });
      btnAdmin.addEventListener("click", () => {
        btnAdmin.classList.add("btn-primary");
        btnAll.classList.remove("btn-primary");
        reload();
      });
      // default: All inactive, Admins active
      btnAll.classList.remove("btn-primary");
      btnAdmin.classList.add("btn-primary");
    }

    if (searchBtn) searchBtn.addEventListener("click", () => reload());
    if (input)
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") reload();
      });
    if (refresh)
      refresh.addEventListener("click", () => {
        if (input) input.value = "";
        reload();
      });
  }

  function escapeHtml(str) {
    if (typeof str !== "string") return "";
    return str.replace(/[&<>\"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function init() {
    renderLayout();
    setTimeout(() => {
      attachHandlers();
      reload();
    }, 40);
  }

  // Expose API
  window.__PERFIL = Object.assign(window.__PERFIL || {}, {
    fetchUsers,
    setAdminRole,
    adminResetPassword,
    init,
  });

  init();
})();
