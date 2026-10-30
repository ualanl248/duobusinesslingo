// ajustes.js - Ajustes Generales de la Cuenta
(function () {
  const container = document.getElementById('content-area');

  // Simple mock of settings (fallback)
  let mockSettings = {
    avatar: null,
    name: 'Admin Name',
  };

  function getApi() {
    return (window.__PERFIL && window.__PERFIL.api) || null;
  }

  async function fetchSettings() {
    const api = getApi();
    if (api && typeof api.fetchSettings === 'function') {
      return await api.fetchSettings();
    }

    // Intentar llamar a la API REST nueva
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('https://api.duobusinesslingo.com/usuarios/perfil', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      console.log('fetchSettings response status:', response.status);

      if (response.status === 404) {
        console.warn('Usuario no encontrado (404 detected).');
        alert('Tu sesión no es válida (el usuario no existe). Por favor, inicia sesión nuevamente.');
        window.location.href = '/login.html';
        return Object.assign({}, mockSettings);
      }

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error && errorData.error.includes('Usuario no encontrado')) {
          console.warn('Usuario no encontrado (error message detected).');
          alert('Tu sesión no es válida (el usuario no existe). Por favor, inicia sesión nuevamente.');
          window.location.href = '/login.html';
          return Object.assign({}, mockSettings);
        }
        throw new Error(errorData.error || 'Error al cargar configuración');
      }

      const data = await response.json();
      if (data.status !== 'ok') throw new Error(data.error || 'Error al cargar configuración');

      // La API REST devuelve: { status: "ok", data: { ...usuario } }
      const user = data.data.perfil || {};
        console.log('fetchSettings user data:', user);
      return {
        avatar: user.url_imagen || null,
        name: user.nombre || '',
        username: user.username || '',
        telefono: user.telefono || '',
      };
    } catch (error) {
      console.error('API Error (fetchSettings):', error);
      if (error.message && error.message.includes('Usuario no encontrado')) {
        alert('Tu sesión no es válida (el usuario no existe). Por favor, inicia sesión nuevamente.');
        window.location.href = '/login.html';
      }
      return Object.assign({}, mockSettings);
    }
  }

  async function updateSettings(patch) {
    const api = getApi();
    if (api && typeof api.updateSettings === 'function') {
      return await api.updateSettings(patch);
    }

    const token = localStorage.getItem('jwt_token');

    if(!token) {
        throw new Error('No hay token de autenticación');
        window.location.href = '../login.html';
    }
    // Intentar llamar a la API real    
    try {
      const response = await fetch('https://api.duobusinesslingo.com/usuarios/perfil', {
        method: 'PUT',
        body: JSON.stringify(patch),
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar configuración');
      }

      const data = await response.json();
      if (data.status !== 'ok') throw new Error(data.error || 'Error al actualizar configuración');

      return data;
    } catch (error) {
      console.error('API Error (updateSettings):', error);
      mockSettings = Object.assign({}, mockSettings, patch);
      return mockSettings;
    }
  }

  async function resetPassword(currentPassword, newPassword) {
    const api = getApi();
    if (api && typeof api.resetPassword === 'function') {
      return await api.resetPassword(currentPassword, newPassword);
    }

    // Intentar llamar a la API real
    try {
      const response = await fetch('/api-admin/perfil/update-password.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cambiar contraseña');
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Error al cambiar contraseña');

      return data;
    } catch (error) {
      console.error('API Error (resetPassword):', error);
      throw error; // Re-lanzar para que el UI muestre el error
    }
  }

  async function uploadAvatar(file) {
    const api = getApi();
    if (api && typeof api.uploadAvatar === 'function') {
      return await api.uploadAvatar(file);
    }

    // Intentar llamar a la API real
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api-admin/perfil/upload-avatar.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir avatar');
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Error al subir avatar');

      return { url: data.avatarUrl };
    } catch (error) {
      console.error('API Error (uploadAvatar):', error);
      // Fallback: crear URL local temporal
      const url = URL.createObjectURL(file);
      mockSettings.avatar = url;
      return { url };
    }
  }

  function renderLayout(settings) {
    if (!container) return;
    container.innerHTML = `
      <div class="dashboard-header">
        <h2>Ajustes Generales de la Cuenta</h2>
        <p>Configura la información personal y seguridad de tu cuenta</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px;">
        <div>
          <div class="card">
            <h3 style="margin: 0 0 12px 0;">Foto de perfil</h3>
            <div id="aj-avatar-preview" style="height: 160px; background: #f3f4f6; border-radius: 4px; margin-bottom: 8px; display:flex;align-items:center;justify-content:center;">${settings.avatar ? '<img src="' + settings.avatar + '" style="max-height:100%;max-width:100%;border-radius:4px" />' : '<span style="color:#999">No hay avatar</span>'}</div>
            <input id="aj-avatar-input" type="file" accept="image/*" style="display:none" />
            <button id="aj-change-avatar" class="btn btn-secondary" style="width: 100%;">Cambiar foto</button>
          </div>

          <div class="card" style="margin-top: 12px;">
            <h3 style="margin: 0 0 12px 0;">Información Personal</h3>
            <div style="margin-bottom: 8px;">
              <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Username</label>
              <input id="aj-username" value="${escapeHtml(settings.username)}" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;" />
            </div>
            <div style="margin-bottom: 8px;">
              <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Nombre completo</label>
              <input id="aj-name" value="${escapeHtml(settings.name)}" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;" />
            </div>
            <div style="margin-bottom: 8px;">
              <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Telefono</label>
              <input id="aj-telefono" value="${escapeHtml(settings.telefono)}" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;" />
            </div>
          </div>
        </div>

        <div>
          <div class="card">
            <h3 style="margin: 0 0 12px 0;">Seguridad</h3>
            <div style="margin-bottom: 8px;">
              <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Contraseña actual</label>
              <input id="aj-current-pass" type="password" placeholder="••••••••" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;" />
            </div>
            <div style="margin-bottom: 8px;">
              <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Nueva contraseña</label>
              <input id="aj-new-pass" type="password" placeholder="••••••••" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;" />
            </div>
            <div style="margin-bottom: 8px;">
              <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Confirmar contraseña</label>
              <input id="aj-confirm-pass" type="password" placeholder="••••••••" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;" />
            </div>
            <button id="aj-change-pass-btn" class="btn btn-primary" style="width: 100%; background: #f97316;">Cambiar contraseña</button>
            <div id="aj-pass-status" style="margin-top:8px;color:#666;font-size:13px"></div>
          </div>
        </div>
      </div>

      <div style="margin-top: 12px;">
        <button id="aj-save-all" class="btn btn-primary" style="width: 100%; background: #16a34a; color: white; padding: 10px;">Guardar todos los cambios</button>
        <div id="aj-save-status" style="margin-top:8px;color:#666;font-size:13px"></div>
      </div>
    `;
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  function attachHandlers() {
    const changeAvatarBtn = document.getElementById('aj-change-avatar');
    const avatarInput = document.getElementById('aj-avatar-input');
    const avatarStatus = document.getElementById('aj-save-status');
    if (changeAvatarBtn && avatarInput) {
      changeAvatarBtn.addEventListener('click', () => avatarInput.click());
      avatarInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        // Validate file type and size
        const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        const maxSize = 2 * 1024 * 1024; // 2 MB
        if (!allowed.includes(file.type)) {
          if (avatarStatus) avatarStatus.textContent = 'Tipo de archivo no soportado. Usa PNG/JPEG/WEBP.';
          return;
        }
        if (file.size > maxSize) {
          if (avatarStatus) avatarStatus.textContent = 'El archivo es demasiado grande. Máx 2 MB.';
          return;
        }

        // Show local preview immediately
        const preview = document.getElementById('aj-avatar-preview');
        const reader = new FileReader();
        reader.onload = function (ev) {
          if (preview) preview.innerHTML = `<img src="${ev.target.result}" style="max-height:100%;max-width:100%;border-radius:4px" />`;
        };
        reader.readAsDataURL(file);

        // Upload in background (still show preview even if upload fails)
        if (avatarStatus) avatarStatus.textContent = 'Subiendo avatar...';
        try {
          const res = await uploadAvatar(file);
          if (res && res.url && preview) { preview.innerHTML = `<img src="${res.url}" style="max-height:100%;max-width:100%;border-radius:4px" />`; }
          if (avatarStatus) avatarStatus.textContent = 'Avatar actualizado';
        } catch (err) {
          console.error('Avatar upload error', err);
          if (avatarStatus) avatarStatus.textContent = 'Error al subir avatar (preview mostrada localmente)';
        }
        setTimeout(() => { if (avatarStatus) avatarStatus.textContent = ''; }, 3000);
      });
    }

    const changePassBtn = document.getElementById('aj-change-pass-btn');
    if (changePassBtn) {
      changePassBtn.addEventListener('click', async () => {
        const current = document.getElementById('aj-current-pass').value;
        const next = document.getElementById('aj-new-pass').value;
        const confirm = document.getElementById('aj-confirm-pass').value;
        const status = document.getElementById('aj-pass-status');
        // Basic validations
        if (!current) { status.textContent = 'Ingresa la contraseña actual'; return; }
        if (!next || next !== confirm) { status.textContent = 'La nueva contraseña y la confirmación no coinciden'; return; }
        if (next.length < 8) { status.textContent = 'La contraseña debe tener al menos 8 caracteres'; return; }
        if (!/[0-9]/.test(next) || !/[A-Za-z]/.test(next)) {
          status.textContent = 'La contraseña debe incluir letras y números'; return;
        }
        status.textContent = 'Actualizando contraseña...';
        try {
          await resetPassword(current, next);
          status.textContent = 'Contraseña actualizada';
          document.getElementById('aj-current-pass').value = '';
          document.getElementById('aj-new-pass').value = '';
          document.getElementById('aj-confirm-pass').value = '';
        } catch (err) {
          console.error('Reset password error', err);
          status.textContent = 'Error al actualizar contraseña';
        }
        setTimeout(() => { if (status) status.textContent = ''; }, 3000);
      });
    }

    const saveAllBtn = document.getElementById('aj-save-all');
    if (saveAllBtn) {
      saveAllBtn.addEventListener('click', async () => {
        const status = document.getElementById('aj-save-status');
        // Gather and validate
        const nombre = document.getElementById('aj-name').value.trim();
        const username = document.getElementById('aj-username').value.trim();
        const telefono = document.getElementById('aj-telefono').value.trim();
        if (!validateName(nombre)) { if (status) status.textContent = 'Nombre inválido'; return; }
        if (!validateUsername(username)) { if (status) status.textContent = 'Username inválido'; return; }
        if (!validateTelefono(telefono)) { if (status) status.textContent = 'Teléfono inválido'; return; }

        const payload = {
            nombre: nombre,
          username: username,
            telefono: telefono,
        };
        status.textContent = 'Guardando...';
        try {
          await updateSettings(payload);
          status.textContent = 'Configuración guardada';
        } catch (err) {
          console.error('Save settings error', err);
          status.textContent = 'Error al guardar configuración';
        }
        setTimeout(() => { if (status) status.textContent = ''; }, 2000);
      });
    }
  }

    function validateTelefono(telefono) {
        //optional, allow empty
    if (!telefono) return true;
        // Only allow 9 digits (spain format)
    const re = /^\d{9}$/;
    return re.test(telefono);
  }

  function validateName(name) {
    if (!name) return false;
    // disallow control chars and excessive length
    if (name.length < 2 || name.length > 100) return false;
    if (/[<>\{\}]/.test(name)) return false;
    return true;
  }

  function validateUsername(username) {
    if (!username) return false;
    // allow alphanumeric and underscores, 3-30 chars
    const re = /^[a-zA-Z0-9_]{3,30}$/;
    return re.test(username);

  }

  async function init() {
    const settings = await fetchSettings();
    renderLayout(settings);
    setTimeout(() => attachHandlers(), 40);
  }

  // Expose API hooks for backend integration
  window.__PERFIL = Object.assign(window.__PERFIL || {}, {
    fetchSettings,
    updateSettings,
    resetPassword,
    uploadAvatar,
    init
  });

  init();
})();
