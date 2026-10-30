// eliminar.js - Eliminar mensajes del foro
(function(){
  // Escapa texto para insertarlo de forma segura en HTML (previene XSS)
  function escapeHtml(value){
    return String(value ?? '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  const API_BASE = 'https://api.duobusinesslingo.com';
  
  // Función para obtener el token JWT
  const getToken = () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.warn('[eliminar.js] No se encontró token JWT en localStorage');
    }
    return token;
  };
  
  // Headers de autenticación
  const authHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };
  
  const content = document.getElementById('content-area');

  // Mock messages — replace via API
  let mockMessages = [
    { id: 'MSG1001', user: 'Usuario 1', date: '2025-10-31', text: 'Contenido del mensaje del usuario en el foro. Este es un mensaje de ejemplo...' },
    { id: 'MSG1002', user: 'Usuario 2', date: '2025-10-30', text: 'Otro mensaje de ejemplo...' },
    { id: 'MSG1003', user: 'Usuario 3', date: '2025-10-29', text: 'Mensaje potencialmente ofensivo...' }
  ];

  // Helper to get external API object if assigned to window.__FORO.api
  function getApi(){
    return (window.__FORO && window.__FORO.api) || null;
  }

  // API-ready fetch function: accepts options { search, filter: 'all'|'24h' }
  async function fetchMessages(options = {}){
    const { search = '', filter = 'all' } = options;
    const api = getApi();
    if(api && typeof api.fetchMessages === 'function'){
      return await api.fetchMessages(options);
    }
    
    // Intentar llamar a la API real
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filter) params.append('filter', filter);
      
      const headers = authHeaders();
      const url = `${API_BASE}/foro/mensajes?${params}`;
      
      console.log('[eliminar.js] Fetching:', url);
      console.log('[eliminar.js] Headers:', JSON.stringify(headers));
      console.log('[eliminar.js] Token value:', getToken() ? 'EXISTS (' + getToken().substring(0, 20) + '...)' : 'NULL');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[eliminar.js] Response NOT OK:', response.status, errorData);
        throw new Error(errorData.error || 'Error al cargar mensajes');
      }
      
      const responseJson = await response.json();
      console.log('[eliminar.js] API Response:', responseJson);
      
      // La API devuelve { status: "ok", data: { success, messages, isSuscrito } }
      const apiData = responseJson.data || responseJson;
      
      if (!apiData.success) throw new Error(apiData.error || 'Error al cargar mensajes');
      
      // Mapear respuesta de API a formato esperado por el frontend
      return apiData.mensajes.reverse().map(m => ({
        id: m.id,
        user: m.nombreCompleto,
        date: m.tiempo, // Assumed format YYYY-MM-DD HH:mm:ss or YYYY-MM-DD
        text: m.mensaje,
        avatar: m.url_imagen || null
      }));
    } catch (error) {
      console.error('API Error (fetchMessages):', error);
      
      // fallback: filter mockMessages
      let data = mockMessages.slice();
      if(search && typeof search === 'string'){
        const s = search.trim().toLowerCase();
        data = data.filter(m => m.user.toLowerCase().includes(s) || m.id.toLowerCase().includes(s));
      }
      
      if (filter === '24h') {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        data = data.filter(m => {
          const msgDate = new Date(m.date);
          return msgDate >= oneDayAgo;
        });
      }
      
      return data;
    }
  }

  // Minimal action handlers prepared for API
  async function deleteMessage(id){
    const api = getApi();
    if(api && typeof api.deleteMessage === 'function'){
      return await api.deleteMessage(id);
    }
    
    // Intentar llamar a la API real
    try {
      const response = await fetch(`${API_BASE}/foro/mensajes/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar mensaje');
      }
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Error al eliminar mensaje');
      
      return data;
    } catch (error) {
      console.error('API Error (deleteMessage):', error);
      
      // Fallback mock
      mockMessages = mockMessages.filter(m => m.id !== id);
      return { success: true };
    }
  }

  function renderLayout(){
    content.innerHTML = `
      <div class="dashboard-header">
        <h2>Eliminar mensajes del foro</h2>
        <p>Gestiona todos los mensajes del foro</p>
      </div>

      <div class="card" style="margin-top: 12px; display: flex; gap: 12px; align-items: center;">
        <span style="font-size: 14px; color: #666;">Filtrar por:</span>
        <button id="for-filter-all" class="btn btn-primary" data-filter="all" style="background: #1773b0; color: white;">Todos</button>
        <button id="for-filter-24h" class="btn btn-secondary" data-filter="24h">Últimas 24h</button>
      </div>

      <div style="margin-top:12px; margin-bottom:12px; display:flex; gap:8px; align-items:center">
        <input id="for-search-input" class="search-input" placeholder="Buscar usuario o ID..." style="flex:1;padding:8px;border:1px solid var(--border);border-radius:6px" />
        <button id="for-search-btn" class="btn btn-primary" style="padding:8px 12px">Buscar</button>
        <button id="for-refresh-btn" class="btn" style="padding:8px 12px">Refrescar</button>
      </div>

      <div id="for-list-area"></div>
      <div id="for-status" style="margin-top:8px;color:#666;font-size:13px"></div>
    `;
    
    // Attach filter handlers specifically after render
    const btnAll = document.getElementById('for-filter-all');
    const btn24h = document.getElementById('for-filter-24h');
    
    btnAll.addEventListener('click', () => {
        btnAll.classList.add('btn-primary');
        btnAll.classList.remove('btn-secondary');
        btnAll.style.background = '#1773b0';
        btnAll.style.color = 'white';
        
        btn24h.classList.remove('btn-primary');
        btn24h.classList.add('btn-secondary');
        btn24h.style.background = '';
        btn24h.style.color = '';
        reload();
    });
    
    btn24h.addEventListener('click', () => {
        btn24h.classList.add('btn-primary');
        btn24h.classList.remove('btn-secondary');
        btn24h.style.background = '#1773b0';
        btn24h.style.color = 'white';
        
        btnAll.classList.remove('btn-primary');
        btnAll.classList.add('btn-secondary');
        btnAll.style.background = '';
        btnAll.style.color = '';
        reload();
    });
  }

  function renderMessages(list){
    const area = document.getElementById('for-list-area');
    if(!list || list.length === 0){
      area.innerHTML = '<div class="card">No se encontraron mensajes.</div>';
      return;
    }

    area.innerHTML = list.map(m => {
      // Generar avatar: foto o inicial del nombre
      // La URL puede venir como 'assets/avatars/...' o '/assets/avatars/...'
      // Desde Admin/Foro/ necesitamos subir 2 niveles para llegar al root
      let avatarUrl = null;
      if (m.avatar) {
        // Quitar / inicial si existe, luego añadir ../../
        const cleanPath = m.avatar.startsWith('/') ? m.avatar.substring(1) : m.avatar;
        avatarUrl = escapeHtml('../../' + cleanPath);
      }
      const avatarContent = avatarUrl 
        ? `<img src="${avatarUrl}" alt="${escapeHtml(m.user)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:24px;font-weight:bold;color:#666">${escapeHtml((m.user || 'U').charAt(0).toUpperCase())}</span>` 
        : `<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:24px;font-weight:bold;color:#666">${escapeHtml((m.user || 'U').charAt(0).toUpperCase())}</span>`;
      
      return `
      <div class="card" style="margin-bottom:12px;padding:12px;">
        <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:8px">
          <div style="width:60px;height:60px;background:#ddd;border-radius:50%;flex-shrink:0;overflow:hidden">${avatarContent}</div>
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <h4 style="margin:0">${escapeHtml(m.user)}</h4>
                <div style="font-size:12px;color:#666">${escapeHtml(m.date)} • ${escapeHtml(m.id)}</div>
              </div>
            </div>
            <div style="background:#f3f4f6;padding:10px;border-radius:6px;margin-top:8px">${escapeHtml(m.text)}</div>
            <div style="display:flex;gap:8px;margin-top:8px">
              <button class="btn btn-secondary for-action" data-action="delete" data-id="${escapeHtml(m.id)}" style="color:#FFFFFF">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    }).join('');

    // Attach action handlers
    area.querySelectorAll('.for-action').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        const statusEl = document.getElementById('for-status');
        try{
          statusEl.textContent = 'Procesando...';
          if(action === 'delete'){
            await deleteMessage(id);
          } 
          statusEl.textContent = '';
          await reload();
        }catch(err){
          console.error('Action error', err);
          statusEl.textContent = 'Error al ejecutar la acción';
        }
      });
    });
  }

  async function reload(){
    const statusEl = document.getElementById('for-status');
    try{
      statusEl.textContent = 'Cargando...';
      const input = document.getElementById('for-search-input');
      const search = input ? input.value.trim() : '';
      
      const btn24h = document.getElementById('for-filter-24h');
      const filter = (btn24h && btn24h.classList.contains('btn-primary')) ? '24h' : 'all';
      
      const list = await fetchMessages({ search, filter });
      renderMessages(list);
      statusEl.textContent = '';
    }catch(err){
      console.error('Failed to load messages', err);
      statusEl.textContent = 'Error al cargar mensajes';
    }
  }

  function attachSearchHandlers(){
    const input = document.getElementById('for-search-input');
    const btn = document.getElementById('for-search-btn');
    const refresh = document.getElementById('for-refresh-btn');
    if(btn) btn.addEventListener('click', () => reload());
    if(input) input.addEventListener('keydown', (e) => { if(e.key === 'Enter') reload(); });
    if(refresh) refresh.addEventListener('click', () => { if(input) input.value = ''; reload(); });
  }

  function init(){
    renderLayout();
    setTimeout(() => { attachSearchHandlers(); reload(); }, 60);
  }

  // Expose API hooks
  window.__FORO = Object.assign(window.__FORO || {}, {
    fetchMessages,
    deleteMessage,
    init
  });

  // Esperar a que el DOM esté listo antes de inicializar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM ya está listo, inicializar
    init();
  }
})();
