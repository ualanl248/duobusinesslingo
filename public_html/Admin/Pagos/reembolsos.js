// reembolsos.js
 (function(){
  // Escapa texto para insertarlo de forma segura en HTML (previene XSS)
  function escapeHtml(value) {
      return String(value ?? '')
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  const content = document.getElementById('content-area');

  // Mock data — replace when API is ready
  let mockRefunds = [
    { id: '#PAY2001', user: 'Usuario 1', amount: '49.99', date: '2025-10-21', reason: 'No estoy satisfecho con el servicio recibido', status: 'pendiente' },
    { id: '#PAY2002', user: 'Usuario 2', amount: '99.98', date: '2025-10-22', reason: 'Cobro duplicado', status: 'pendiente' },
    { id: '#PAY2003', user: 'Usuario 3', amount: '19.99', date: '2025-10-18', reason: 'Cancelación antes de inicio', status: 'procesado' }
  ];

  // Configuration for API integration — can be set via window.__REEMBOLSOS.configure()
  const config = {
    // baseUrl: '',
    // endpoints: { fetchRefunds: '/refunds', approve: '/refunds/:id/approve', reject: '/refunds/:id/reject', contact: '/users/:id/contact' }
  };

  function configure(cfg = {}){
    Object.assign(config, cfg);
  }

  // Helper to call configured API if provided in window.__REEMBOLSOS.api
  function getExternalApi(){
    return (window.__REEMBOLSOS && window.__REEMBOLSOS.api) || null;
  }

  // API layer (calls external API if provided, otherwise uses mock data)
  // Accepts options: { search }
  async function fetchRefunds(options = {}){
    const { search = '' } = options;
    const external = getExternalApi();
    if(external && typeof external.fetchRefunds === 'function'){
      return await external.fetchRefunds(options);
    }
    // fallback: return mock data copy filtered by search
    let data = mockRefunds.slice();
    if(search && typeof search === 'string'){
      const s = search.trim().toLowerCase();
      data = data.filter(r => r.id.toLowerCase().includes(s) || r.user.toLowerCase().includes(s));
    }
    return data;
  }

  async function approveRefund(id){
    const external = getExternalApi();
    if(external && typeof external.approveRefund === 'function'){
      return await external.approveRefund(id);
    }
    // fallback: update mock data
    mockRefunds = mockRefunds.map(r => r.id === id ? { ...r, status: 'procesado' } : r);
    return { success: true };
  }

  async function rejectRefund(id){
    const external = getExternalApi();
    if(external && typeof external.rejectRefund === 'function'){
      return await external.rejectRefund(id);
    }
    // fallback: remove request from mock pending list (or mark rejected)
    mockRefunds = mockRefunds.map(r => r.id === id ? { ...r, status: 'rechazado' } : r);
    return { success: true };
  }

  async function contactUser(id){
    const external = getExternalApi();
    if(external && typeof external.contactUser === 'function'){
      return await external.contactUser(id);
    }
    // fallback: no-op
    console.log('contactUser placeholder', id);
    return { success: true };
  }

  function formatCurrency(v){
    return `€${Number(v).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  }

  function renderLayout(){
    content.innerHTML = `
      <div class="card" style="margin-bottom:16px">
        <h2>Reembolsos y Cancelaciones</h2>
      </div>
      <div id="re-stats" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px"></div>

      <div style="margin-bottom:12px;padding:12px;background:#fff6ee;border-radius:8px;border:1px solid rgba(250,200,150,0.3)">Solicitudes Pendientes</div>

      <div id="re-search" style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <input id="re-search-input" class="search-input" placeholder="Buscar por ID o usuario..." style="flex:1;padding:8px;border:1px solid var(--border);border-radius:6px" />
        <button id="re-search-btn" class="btn btn-primary" style="padding:8px 12px">Buscar</button>
        <button id="re-refresh-btn" class="btn" style="padding:8px 12px">Refrescar</button>
      </div>

      <div id="re-list"></div>
      <div id="re-status" style="margin-top:8px;color:#666;font-size:13px"></div>
    `;
  }

  function renderStats(list){
    const pendientes = list.filter(r=> r.status === 'pendiente').length;
    const procesados = list.filter(r=> r.status === 'procesado').length;
    const totalReembolsado = list.filter(r=> r.status === 'procesado').reduce((s,r)=> s + Number(r.amount), 0);

    const root = document.getElementById('re-stats');
    root.innerHTML = `
      <div style="background:#fff7ed;border-radius:8px;padding:18px">
        <div class="stat-label">Reembolsos pendientes</div>
        <div style="font-size:24px;font-weight:700;margin-top:8px">${pendientes}</div>
      </div>
      <div style="background:#ecfdf5;border-radius:8px;padding:18px">
        <div class="stat-label">Reembolsos procesados</div>
        <div style="font-size:24px;font-weight:700;margin-top:8px">${procesados}</div>
      </div>
      <div style="background:#eef2ff;border-radius:8px;padding:18px">
        <div class="stat-label">Total reembolsado</div>
        <div style="font-size:24px;font-weight:700;margin-top:8px">${formatCurrency(totalReembolsado)}</div>
      </div>
    `;
  }

  function renderList(list){
    const root = document.getElementById('re-list');
    const pending = list.filter(r=> r.status === 'pendiente');
    if(pending.length === 0){
      root.innerHTML = '<div class="card">No hay solicitudes pendientes.</div>';
      return;
    }

    root.innerHTML = pending.map(r => `
      <div class="card" style="margin-bottom:12px;padding:16px;border-radius:8px">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:12px">
          <div>
            <div class="kv">ID de pago</div>
            <div style="font-weight:700;margin-top:6px">${escapeHtml(r.id)}</div>
          </div>
          <div>
            <div class="kv">Usuario</div>
            <div style="font-weight:700;margin-top:6px">${escapeHtml(r.user)}</div>
          </div>
          <div>
            <div class="kv">Monto</div>
            <div style="font-weight:700;margin-top:6px">${formatCurrency(r.amount)}</div>
          </div>
        </div>

        <div style="margin-bottom:12px">
          <div class="kv">Motivo</div>
          <div style="background:#f7fafc;padding:10px;border-radius:6px;margin-top:8px">${escapeHtml(r.reason)}</div>
        </div>

        <div style="display:flex;gap:12px">
          <button class="btn re-action" data-id="${escapeHtml(r.id)}" data-action="aprobar" style="background:#059e3e;color:white;border-radius:6px;padding:10px 18px;border:none">Aprobar reembolso</button>
          <button class="btn-outline re-action" data-id="${escapeHtml(r.id)}" data-action="rechazar" style="border-color:#dc2626;color:#dc2626;padding:10px 18px;border-radius:6px">Rechazar</button>
          <button class="btn-outline re-action" data-id="${escapeHtml(r.id)}" data-action="contactar" style="border-color:#2563eb;color:#2563eb;padding:10px 18px;border-radius:6px">Contactar usuario</button>
        </div>
      </div>
    `).join('');

    // attach handlers
    root.querySelectorAll('.re-action').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        const statusEl = document.getElementById('re-status');
        try{
          statusEl.textContent = 'Procesando...';
          if(action === 'aprobar'){
            await approveRefund(id);
          } else if(action === 'rechazar'){
            await rejectRefund(id);
          } else if(action === 'contactar'){
            await contactUser(id);
          }
          statusEl.textContent = '';
          // refresh list after action
          await reload();
        }catch(err){
          console.error('Action error', err);
          statusEl.textContent = 'Error al ejecutar la acción';
        }
      });
    });
  }

  async function reload(){
    const statusEl = document.getElementById('re-status');
    try{
      statusEl.textContent = 'Cargando...';
      const searchInput = document.getElementById('re-search-input');
      const search = searchInput ? searchInput.value.trim() : '';
      const list = await fetchRefunds({ search });
      renderStats(list);
      renderList(list);
      statusEl.textContent = '';
    }catch(err){
      console.error('Failed to load refunds', err);
      statusEl.textContent = 'Error al cargar solicitudes';
    }
  }

  function init(){
    renderLayout();
    // attach search / refresh handlers
    const attachSearchHandlers = () => {
      const input = document.getElementById('re-search-input');
      const btn = document.getElementById('re-search-btn');
      const refresh = document.getElementById('re-refresh-btn');
      if(btn) btn.addEventListener('click', () => reload());
      if(input) input.addEventListener('keydown', (e) => { if(e.key === 'Enter') reload(); });
      if(refresh) refresh.addEventListener('click', () => { if(input) input.value = ''; reload(); });
    };

    // small delay to ensure DOM elements created
    setTimeout(attachSearchHandlers, 30);
    // small delay to allow header injection if present
    setTimeout(reload, 60);
  }

  window.__REEMBOLSOS = Object.assign(window.__REEMBOLSOS || {}, {
    init,
    fetchRefunds,
    approveRefund,
    rejectRefund,
    contactUser,
    configure
  });

  init();
})();
