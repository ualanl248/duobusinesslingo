// planes.js - Gestionar Planes y Precios (API-ready)
(function () {
  const container = document.getElementById('content-area');
  let editingPlanId = null;
  let currentPlans = []; // Planes cargados de la API

  // Mock plans (fallback)
  let mockPlans = [
    { id: 'P1001', name: 'Plan Básico', price: 29.99, currency: 'EUR', features: 'Acceso a cursos básicos\nForum de estudiantes\nCertificados', color: '#1773b0' },
    { id: 'P1002', name: 'Plan Pro', price: 49.99, currency: 'EUR', features: 'Acceso a todos los cursos\nClases en vivo\nSoporte prioritario\nCertificados', color: '#f97316' },
    { id: 'P1003', name: 'Plan Premium', price: 99.99, currency: 'EUR', features: 'Todo del plan Pro\nMentoría personal\nAcceso a recursos premium\nSoporte 24/7', color: '#16a34a' }
  ];

  const API_BASE = 'https://api.duobusinesslingo.com/planes';

  function getApi() {
    return (window.__PAGOS && window.__PAGOS.api) || null;
  }

  function getAuthHeader() {
    const token = localStorage.getItem('jwt_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async function fetchPlans(search = '') {
    const api = getApi();
    if (api && typeof api.fetchPlans === 'function') {
      return await api.fetchPlans();
    }

    try {
      // Si hay búsqueda, filtrar en cliente o pasar parámetro si la API lo soporta.
      // La API actual es GET /planes (listar todos). 
      const response = await fetch(API_BASE, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader()
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar planes');
      }

      const data = await response.json(); 
      console.log('API FETCH PLANES RESPONSE:', data); // DEBUG

      // JSON Structure expected: { status: "ok", data: { success: true, planes: [...] } }
      // Or variations depending on API wrapper.
      let planes = [];

      if (data.data && Array.isArray(data.data.planes)) {
        // Wrapper { status: 'ok', data: { planes: [...] } }
        planes = data.data.planes;
      } else if (data.data && data.data.success && Array.isArray(data.data.planes)) {
         // Explicit success check
         planes = data.data.planes;
      } else if (Array.isArray(data.planes)) {
        // Direct object { planes: [...] }
        planes = data.planes;
      } else if (data.data && Array.isArray(data.data)) {
        // Fallback: data: [...]
        planes = data.data;
      } else if (Array.isArray(data)) {
        // Root array
        planes = data;
      } else {
        console.warn('Could not find planes array in response', data);
      }

      // Mapping para asegurar formato frontend
      const mapped = planes.map(p => ({
        id: p.idPlan,
        name: p.nombre,
        price: parseFloat(p.precio),
        currency: 'EUR',
        features: p.descripcion,
        durationDays: parseInt(p.duracion_dias),
        color: '#1773b0' // Fixed color
      }));

      
      if(search){
          const s = search.toLowerCase();
          return mapped.filter(p => p.name.toLowerCase().includes(s));
      }

      return mapped;

    } catch (error) {
      console.error('API Error (fetchPlans):', error);
      // Fallback vacío si falla la API real para no mostrar datos falsos confuso
      return []; 
    }
  }

  async function createPlan(plan) {
    const api = getApi();
    if (api && typeof api.createPlan === 'function') {
      return await api.createPlan(plan);
    }

    const payload = {
      nombre: plan.name,
      precio: plan.price,
      descripcion: plan.features || '',
      duracion_dias: plan.durationDays || 30,
      color: plan.color || '#1773b0'
    };

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            ...getAuthHeader()
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear plan');
      }

      const data = await response.json();
      return data; // {status: 'ok', id: ...}
    } catch (error) {
      console.error('API Error (createPlan):', error);
      throw error;
    }
  }

  async function updatePlan(id, patch) {
    const api = getApi();
    if (api && typeof api.updatePlan === 'function') {
      return await api.updatePlan(id, patch);
    }

    // Mapeo inverso de frontend a backend keys
    const payload = {};
    if(patch.name) payload.nombre = patch.name;
    if(patch.price !== undefined) payload.precio = patch.price;
    if(patch.features !== undefined) payload.descripcion = patch.features;
    if(patch.color) payload.color = patch.color;
    if(patch.durationDays) payload.duracion_dias = patch.durationDays;

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            ...getAuthHeader()
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar plan');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error (updatePlan):', error);
      throw error;
    }
  }

  async function deletePlan(id) {
    const api = getApi();
    if (api && typeof api.deletePlan === 'function') {
      return await api.deletePlan(id);
    }

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { 
            'Content-Type': 'application/json',
             ...getAuthHeader()
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar plan');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error (deletePlan):', error);
      throw error;
    }
  }

  function renderLayout() {
    if (!container) return;
    container.innerHTML = `
      <div class="dashboard-header">
        <h2>Gestionar Planes y Precios</h2>
        <p>Configura y administra los planes de suscripción disponibles</p>
      </div>

      <div style="margin-top:12px;display:flex;gap:12px;align-items:flex-end;justify-content:space-between">
        <div style="flex:1;max-width:400px">
          <label style="display:block;font-size:13px;color:#666;margin-bottom:6px;font-weight:500">Buscar por nombre o ID</label>
          <div style="display:flex;gap:8px">
            <input id="plan-search" placeholder="Buscar plan..." style="flex:1;padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px"/>
            <button id="plan-search-btn" class="btn btn-primary">Buscar</button>
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <button id="plan-create-btn" class="btn btn-primary" style="background:#16a34a;color:white">+ Crear nuevo plan</button>
          <button id="plan-refresh-btn" class="btn">Refrescar</button>
        </div>
      </div>
      
      <div id="plan-status" style="margin-top:8px;color:#666;font-size:13px"></div>

      <!-- Formulario de creación de plan (oculto por defecto) -->
      <div id="plan-create-form" style="display:none;margin-top:16px">
        <div class="card" style="background:#f8f9fa;border:2px solid #16a34a">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <h3 style="margin:0;color:#16a34a">Crear Nuevo Plan</h3>
            <button id="plan-cancel-btn" class="btn-outline">Cancelar</button>
          </div>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div>
              <label style="display:block;font-size:13px;color:#666;margin-bottom:6px;font-weight:500">Nombre del Plan *</label>
              <input id="new-plan-name" type="text" placeholder="Ej: Plan Premium" style="width:100%;padding:8px 12px;border:1px solid #ddd;border-radius:6px"/>
            </div>
            
            <div>
              <label style="display:block;font-size:13px;color:#666;margin-bottom:6px;font-weight:500">Precio Mensual (€) *</label>
              <input id="new-plan-price" type="number" step="0.01" min="0" placeholder="29.99" style="width:100%;padding:8px 12px;border:1px solid #ddd;border-radius:6px"/>
            </div>
            
            <div>
              <label style="display:block;font-size:13px;color:#666;margin-bottom:6px;font-weight:500">Duración (días) *</label>
              <input id="new-plan-duration" type="number" min="1" value="30" style="width:100%;padding:8px 12px;border:1px solid #ddd;border-radius:6px"/>
            </div>
            

          </div>
          
          <div style="margin-top:16px">
            <label style="display:block;font-size:13px;color:#666;margin-bottom:6px;font-weight:500">Descripción / Características</label>
            <textarea id="new-plan-description" rows="4" placeholder="Describe las características del plan..." style="width:100%;padding:8px 12px;border:1px solid #ddd;border-radius:6px;resize:vertical"></textarea>
          </div>
          
          <div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end">
            <button id="plan-save-btn" class="btn btn-primary" style="background:#16a34a;color:white">Guardar Plan</button>
          </div>
          
          <div id="plan-create-status" style="margin-top:8px;color:#666;font-size:13px"></div>
        </div>
      </div>

      <div id="plan-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px"></div>
    `;
  }

  function renderPlans(plans) {
    const grid = document.getElementById('plan-grid');
    if (!grid) return;
    if (!plans || plans.length === 0) { grid.innerHTML = '<div class="card">No hay planes configurados.</div>'; return; }

    const fixedColor = '#1773b0';
    grid.innerHTML = plans.map(p => `
      <div class="card" style="border:1px solid #ddd;padding:12px;" data-id="${p.id}">
        <div style="background:${fixedColor};color:white;padding:8px;border-radius:4px;margin-bottom:8px;text-align:center">
          <h3 style="margin:0">${escapeHtml(p.name)}</h3>
        </div>
        <div style="margin-bottom:8px">
          <label style="display:block;font-size:12px;color:#666;margin-bottom:4px">Duración del plan (días)</label>
          <input class="plan-price" value="${p.durationDays}" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:4px" disabled />
        </div>
        <div style="margin-bottom:8px">
          <label style="display:block;font-size:12px;color:#666;margin-bottom:4px">Precio mensual (€)</label>
          <input class="plan-price" value="${p.price}" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:4px" disabled />
        </div>
        <div style="margin-bottom:8px">
          <label style="display:block;font-size:12px;color:#666;margin-bottom:4px">Características</label>
          <textarea class="plan-features" rows="3" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:4px" disabled>${escapeHtml(p.features)}</textarea>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-secondary plan-edit-btn" data-id="${p.id}" style="flex:1;font-size:12px;color:#FAFAFA">Editar</button>
          <button class="btn btn-secondary plan-delete-btn" data-id="${p.id}" style="flex:1;font-size:12px;color:#ed3939">Eliminar</button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.plan-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => renderEditMode(btn.dataset.id));
    });
    grid.querySelectorAll('.plan-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('¿Eliminar este plan? Esta acción no se puede deshacer.')) return;
        const status = document.getElementById('plan-status'); if (status) status.textContent = 'Eliminando...';
        try {
          await deletePlan(btn.dataset.id);
          if (status) status.textContent = 'Plan eliminado';
          await reload();
        } catch (err) {
          console.error('Delete error', err);
          if (status) status.textContent = 'Error al eliminar';
        }
      });
    });
  }

  function renderEditMode(planId) {
    editingPlanId = planId;
    // Usar currentPlans (planes cargados) en lugar de mockPlans
    const plan = currentPlans.find(p => p.id == planId) || mockPlans.find(p => p.id === planId) || {};
    const card = container.querySelector(`[data-id="${planId}"]`);
    if (!card) return;

    // Removemos la lógica de color dinámico y permitimos editar nombre
    const fixedColor = '#1773b0'; 

    card.innerHTML = `
      <div style="background:${fixedColor};color:white;padding:8px;border-radius:4px;margin-bottom:8px;text-align:center">
         <label style="display:block;font-size:11px;color:#e0f2fe;margin-bottom:2px;text-align:left">Nombre del Plan</label>
         <input class="plan-name-edit" value="${escapeHtml(plan.name)}" style="width:100%;padding:4px;border:none;border-radius:2px;color:#333" />
      </div>
          <div style="margin-bottom:8px">
          <label style="display:block;font-size:12px;color:#666;margin-bottom:4px">Duración del plan (días)</label>
          <input class="plan-duration-edit" value="${plan.durationDays}" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:4px" />
          </div>
      <div style="margin-bottom:8px">
        <label style="display:block;font-size:12px;color:#666;margin-bottom:4px">Precio mensual (€)</label>
        <input class="plan-price-edit" value="${plan.price}" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:4px" />
      </div>
      <div style="margin-bottom:8px">
        <label style="display:block;font-size:12px;color:#666;margin-bottom:4px">Características</label>
        <textarea class="plan-features-edit" rows="3" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:4px">${escapeHtml(plan.features)}</textarea>
      </div>
      
      <div style="display:flex;gap:6px">
        <button class="plan-save-btn" data-id="${planId}" style="flex:1;padding:8px;background:#16a34a;color:white;border:none;border-radius:4px;cursor:pointer">Guardar</button>
        <button class="plan-cancel-btn" data-id="${planId}" style="flex:1;padding:8px;background:#ddd;border:none;border-radius:4px;cursor:pointer">Cancelar</button>
      </div>
    `;

    card.querySelector('.plan-save-btn').addEventListener('click', async () => {
      const name = card.querySelector('.plan-name-edit').value.trim() || plan.name;
      const price = parseFloat(card.querySelector('.plan-price-edit').value) || plan.price;
      const features = card.querySelector('.plan-features-edit').value.trim();
      const durationDays = parseInt(card.querySelector('.plan-duration-edit').value) || plan.durationDays;
      // Color fijo
      
      const status = document.getElementById('plan-status'); if (status) status.textContent = 'Guardando...';
      try {
        await updatePlan(planId, { name, price, features, durationDays });
        if (status) status.textContent = 'Plan guardado';
        editingPlanId = null;
        await reload();
      } catch (err) {
        console.error('Save error', err);
        if (status) status.textContent = 'Error al guardar';
      }
    });

    card.querySelector('.plan-cancel-btn').addEventListener('click', async () => {
      editingPlanId = null;
      await reload();
    });
  }

  async function reload() {
    const searchInput = document.getElementById('plan-search');
    const search = searchInput ? searchInput.value.trim() : '';
    const status = document.getElementById('plan-status');
    if (status) status.textContent = 'Cargando...';
    try {
      const plans = await fetchPlans(search);
      currentPlans = plans; // Guardar planes cargados
      renderPlans(plans);
      if (status) status.textContent = '';
    } catch (err) {
      console.error('Load error', err);
      if (status) status.textContent = 'Error al cargar planes';
    }
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>\"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  function attachHandlers() {
    const createBtn = document.getElementById('plan-create-btn');
    const refreshBtn = document.getElementById('plan-refresh-btn');
    const searchBtn = document.getElementById('plan-search-btn');
    const searchInput = document.getElementById('plan-search');
    const cancelBtn = document.getElementById('plan-cancel-btn');
    const saveBtn = document.getElementById('plan-save-btn');
    const createForm = document.getElementById('plan-create-form');

    if (searchBtn) searchBtn.addEventListener('click', reload);
    if (searchInput) searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') reload(); });

    if (createBtn) createBtn.addEventListener('click', () => {
      if (createForm) {
        createForm.style.display = createForm.style.display === 'none' ? 'block' : 'none';
        if (createForm.style.display === 'block') {
          document.getElementById('new-plan-name').value = '';
          document.getElementById('new-plan-price').value = '';
          document.getElementById('new-plan-duration').value = '30';

          document.getElementById('new-plan-description').value = '';
          document.getElementById('plan-create-status').textContent = '';
        }
      }
    });

    if (cancelBtn) cancelBtn.addEventListener('click', () => {
      if (createForm) createForm.style.display = 'none';
    });

    if (saveBtn) saveBtn.addEventListener('click', async () => {
      const name = document.getElementById('new-plan-name').value.trim();
      const priceStr = document.getElementById('new-plan-price').value;
      const durationStr = document.getElementById('new-plan-duration').value;

      const description = document.getElementById('new-plan-description').value.trim();
      const statusEl = document.getElementById('plan-create-status');

      if (!name) {
        if (statusEl) statusEl.textContent = 'El nombre del plan es obligatorio';
        if (statusEl) statusEl.style.color = '#dc3545';
        return;
      }

      const price = parseFloat(priceStr);
      if (isNaN(price) || price <= 0) {
        if (statusEl) statusEl.textContent = 'El precio debe ser un número mayor a 0';
        if (statusEl) statusEl.style.color = '#dc3545';
        return;
      }

      const duration = parseInt(durationStr);
      if (isNaN(duration) || duration <= 0) {
        if (statusEl) statusEl.textContent = 'La duración debe ser un número mayor a 0';
        if (statusEl) statusEl.style.color = '#dc3545';
        return;
      }

      if (statusEl) statusEl.textContent = 'Creando plan...';
      if (statusEl) statusEl.style.color = '#666';

      try {
        await createPlan({
          name,
          price,
          currency: 'EUR',
          features: description,
          durationDays: duration
        });
        if (statusEl) statusEl.textContent = 'Plan creado exitosamente';
        if (statusEl) statusEl.style.color = '#16a34a';
        setTimeout(() => {
          if (createForm) createForm.style.display = 'none';
        }, 1500);
        await reload();
      } catch (err) {
        console.error('Create error', err);
        if (statusEl) statusEl.textContent = 'Error al crear plan: ' + (err.message || 'Error desconocido');
        if (statusEl) statusEl.style.color = '#dc3545';
      }
    });

    if (refreshBtn) refreshBtn.addEventListener('click', reload);
  }

  function init() {
    renderLayout();
    setTimeout(() => { attachHandlers(); reload(); }, 40);
  }

  // Expose API
  window.__PAGOS = Object.assign(window.__PAGOS || {}, {
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    init
  });

  init();
})();
