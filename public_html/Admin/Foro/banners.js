// banners.js - Gestionar Banners y Anuncios
 (function(){
  const container = document.getElementById('content-area');

  // Mock banners data - replaceable by injecting window.__FORO.api
  let mockBanners = [
    { id: 'B1001', title: 'Banner 1', date: '2025-10-25', text: 'Mensaje promocional 1', image: null, active: true },
    { id: 'B1002', title: 'Banner 2', date: '2025-10-20', text: 'Anuncio informativo', image: null, active: true },
    { id: 'B1003', title: 'Banner 3', date: '2025-10-15', text: 'Campaña verde', image: null, active: true },
    { id: 'B1004', title: 'Borrador 1', date: '2025-11-01', text: 'Borrador no publicado', image: null, active: false }
  ];

  function getApi(){
    return (window.__FORO && window.__FORO.api) || null;
  }

  // Fetch banners - supports { search, active }
  async function fetchBanners(options = {}){
    const api = getApi();
    if(api && typeof api.fetchBanners === 'function'){
      return await api.fetchBanners(options);
    }
    
    // Intentar llamar a la API real
    try {
      const response = await fetch('/api-admin/foro/get-banners.php', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar anuncios');
      }
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Error al cargar anuncios');
      
      // Mapear respuesta de API a formato esperado
      return data.banners.map(b => ({
        id: b.id,
        title: 'Anuncio Oficial',
        date: b.createdAt.split(' ')[0],
        text: b.content,
        image: null,
        active: true
      }));
    } catch (error) {
      console.error('API Error (fetchBanners):', error);
      
      // Fallback mock
      const { search = '', active } = options;
      let list = mockBanners.slice();
      if(typeof active === 'boolean') list = list.filter(b => b.active === active);
      if(search && typeof search === 'string'){
        const s = search.trim().toLowerCase();
        list = list.filter(b => b.title.toLowerCase().includes(s) || b.text.toLowerCase().includes(s));
      }
      return list;
    }
  }

  async function fetchActiveBanners(options = {}){
    return await fetchBanners(Object.assign({}, options, { active: true }));
  }

  async function createBanner(banner){
    const api = getApi();
    if(api && typeof api.createBanner === 'function'){
      return await api.createBanner(banner);
    }
    
    // Intentar llamar a la API real
    try {
      const response = await fetch('/api-admin/foro/create-banner.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: banner.text })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear anuncio');
      }
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Error al crear anuncio');
      
      return data;
    } catch (error) {
      console.error('API Error (createBanner):', error);
      
      // Fallback mock
      const newBanner = Object.assign({}, banner, { id: 'B'+(Date.now()%10000), date: new Date().toISOString().slice(0,10) });
      mockBanners.unshift(newBanner);
      return { success: true, bannerId: newBanner.id };
    }
  }

  async function updateBanner(id, patch){
    const api = getApi();
    if(api && typeof api.updateBanner === 'function'){
      return await api.updateBanner(id, patch);
    }
    mockBanners = mockBanners.map(b => b.id === id ? Object.assign({}, b, patch) : b);
    return mockBanners.find(b => b.id === id);
  }

  async function deleteBanner(id){
    const api = getApi();
    if(api && typeof api.deleteBanner === 'function'){
      return await api.deleteBanner(id);
    }
    
    // Intentar llamar a la API real (usa el mismo endpoint que eliminar mensajes)
    try {
      const response = await fetch('/api-admin/foro/delete-message.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ messageId: id })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar anuncio');
      }
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Error al eliminar anuncio');
      
      return data;
    } catch (error) {
      console.error('API Error (deleteBanner):', error);
      
      // Fallback mock
      mockBanners = mockBanners.filter(b => b.id !== id);
      return { success: true };
    }
  }

  async function setActive(id, active){
    const api = getApi();
    if(api && typeof api.setActive === 'function'){
      return await api.setActive(id, active);
    }
    return await updateBanner(id, { active });
  }

  // Render layout and components
  function renderLayout(){
    if(!container) return;
    container.innerHTML = `
      <div class="dashboard-header">
        <h2>Gestionar Banners y Anuncios</h2>
        <p>Crea y controla los banners y anuncios del foro</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px;">
        <div class="card" id="b-create-card">
          <h3 style="margin: 0 0 12px 0;">Crear Nuevo Banner</h3>
          <div style="margin-bottom: 8px;">
            <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Título del banner</label>
            <input id="b-title" placeholder="Título..." style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;" />
          </div>
          <div style="margin-bottom: 8px;">
            <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Mensaje</label>
            <textarea id="b-text" rows="4" placeholder="Contenido..." style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
          </div>
          <div style="margin-bottom: 8px;">
            <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Imagen del banner</label>
            <div id="b-image" style="border: 2px dashed #ddd; border-radius: 4px; height: 80px; display: flex; align-items: center; justify-content: center; background: #fafafa; cursor: pointer;">
              <p style="margin: 0; font-size: 12px; color: #999;">Click para subir imagen</p>
            </div>
          </div>
          <div style="margin-bottom: 8px;">
            <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Tipo de anuncio</label>
            <div><label><input type="radio" name="b-type" value="informativo" checked /> Informativo</label></div>
            <div><label><input type="radio" name="b-type" value="urgente" /> Urgente</label></div>
            <div><label><input type="radio" name="b-type" value="promocional" /> Promocional</label></div>
          </div>
          <button id="b-create-btn" class="btn btn-primary" style="width: 100%; background: #16a34a; color: white;">Publicar banner</button>
        </div>

        <div class="card" id="b-active-card">
          <h3 style="margin: 0 0 12px 0;">Banners Activos</h3>

          <!-- Search area for active banners -->
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;">
            <input id="b-active-search" placeholder="Buscar por título o ID..." style="flex:1;padding:8px;border:1px solid var(--border);border-radius:6px" />
            <button id="b-active-search-btn" class="btn btn-primary" style="padding:8px 12px">Buscar</button>
            <button id="b-active-refresh-btn" class="btn" style="padding:8px 12px">Refrescar</button>
          </div>

          <div id="b-active-list"></div>
          <div id="b-active-status" style="margin-top:8px;color:#666;font-size:13px"></div>
        </div>
      </div>
    `;
  }

  function renderActiveList(list){
    const area = document.getElementById('b-active-list');
    if(!area) return;
    if(!list || list.length === 0){
      area.innerHTML = '<div class="card">No hay banners activos.</div>';
      return;
    }

    area.innerHTML = list.map(b => `
      <div style="border:1px solid #ddd;border-radius:4px;padding:8px;margin-bottom:8px;">
        <div style="background:linear-gradient(135deg,#999,#666);height:60px;border-radius:4px;margin-bottom:8px"></div>
        <h4 style="margin:0 0 4px 0">${b.title}</h4>
        <p style="margin:0 0 8px 0;font-size:12px;color:#666">Publicado: ${b.date} • ${b.id}</p>
        <div style="display:flex;gap:6px">
          <button class="btn btn-secondary b-action" data-action="edit" data-id="${b.id}" style="flex:1;font-size:12px;color:#FAFAFA">Editar</button>
          <button class="btn btn-secondary b-action" data-action="deactivate" data-id="${b.id}" style="flex:1;font-size:12px;color:#c33">Desactivar</button>
          <button class="btn btn-secondary b-action" data-action="delete" data-id="${b.id}" style="flex:1;font-size:12px">Eliminar</button>
        </div>
      </div>
    `).join('');

    area.querySelectorAll('.b-action').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        const status = document.getElementById('b-active-status');
        try{
          status.textContent = 'Procesando...';
          if(action === 'deactivate'){
            await setActive(id, false);
          } else if(action === 'delete'){
            await deleteBanner(id);
          } else if(action === 'edit'){
            // minimal edit flow: prompt for new title
            const current = mockBanners.find(x => x.id === id) || {};
            const newTitle = prompt('Editar título', current.title || '');
            if(newTitle !== null) await updateBanner(id, { title: newTitle });
          }
          status.textContent = '';
          await reloadActive();
        }catch(err){
          console.error('Action error', err);
          status.textContent = 'Error al ejecutar la acción';
        }
      });
    });
  }

  async function reloadActive(){
    const status = document.getElementById('b-active-status');
    try{
      status.textContent = 'Cargando...';
      const input = document.getElementById('b-active-search');
      const search = input ? input.value.trim() : '';
      const list = await fetchActiveBanners({ search });
      renderActiveList(list);
      status.textContent = '';
    }catch(err){
      console.error('Failed loading active banners', err);
      status.textContent = 'Error al cargar banners';
    }
  }

  function attachHandlers(){
    const createBtn = document.getElementById('b-create-btn');
    if(createBtn){
      createBtn.addEventListener('click', async () => {
        const title = document.getElementById('b-title').value.trim();
        const text = document.getElementById('b-text').value.trim();
        if(!title){ alert('El título es requerido'); return; }
        await createBanner({ title, text });
        document.getElementById('b-title').value = '';
        document.getElementById('b-text').value = '';
        await reloadActive();
      });
    }

    const searchBtn = document.getElementById('b-active-search-btn');
    const refreshBtn = document.getElementById('b-active-refresh-btn');
    const searchInput = document.getElementById('b-active-search');
    if(searchBtn) searchBtn.addEventListener('click', () => reloadActive());
    if(refreshBtn) refreshBtn.addEventListener('click', () => { if(searchInput) searchInput.value = ''; reloadActive(); });
    if(searchInput) searchInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') reloadActive(); });
  }

  function init(){
    renderLayout();
    setTimeout(() => { attachHandlers(); reloadActive(); }, 60);
  }

  // Expose for backend integration
  window.__FORO = Object.assign(window.__FORO || {}, {
    fetchBanners,
    fetchActiveBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    setActive,
    init
  });

  // Auto-init
  init();
})();
