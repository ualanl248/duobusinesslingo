// pagos-realizados.js
// Renders the "Ver Pagos Realizados" view and provides an API-ready structure
(function () {
  const content = document.getElementById('content-area');

  // Sample/mock data — replace fetchPayments() implementation to call your real API
  const mockPayments = Array.from({ length: 5 }).map((_, i) => ({
    id: `#PAY${1001 + i}`,
    user: `Usuario ${i + 1}`,
    date: new Date(2025, 9, i + 1).toISOString().slice(0, 10), // 2025-10-01 ...
    amount: (29.99 * (i + 1)).toFixed(2),
    status: i % 3 === 0 ? 'Pendiente' : i % 3 === 1 ? 'Fallido' : 'Completado'
  }));

  // --- API layer ---
  async function fetchPayments({ search = '', from = null, to = null, page = 1, perPage = 10 } = {}) {
    // Intentar llamar a la API REST nueva
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (from) params.append('dateFrom', from);
      if (to) params.append('dateTo', to);

      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`https://api.duobusinesslingo.com/suscripciones?${params}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar pagos');
      }

      const data = await response.json();
      if (data.status !== 'ok') throw new Error(data.error || 'Error al cargar pagos');

      // Mapear respuesta de API REST a formato esperado
      const items = data.data.map(p => ({
        id: `#${p.idSuscripcion}`,
        user: p.usuario_nombre,
        date: p.fechaInicio,
        amount: p.precio,
        status: p.estado === 'activa' ? 'Completado' : p.estado === 'pendiente' ? 'Pendiente' : 'Completado'
      }));

      return { items, total: items.length };
    } catch (error) {
      console.error('API Error (fetchPayments):', error);

      // Fallback: filter mock data
      let data = mockPayments.map(p => ({ ...p }));
      if (search) {
        const s = search.toLowerCase();
        data = data.filter(d => d.id.toLowerCase().includes(s) || d.user.toLowerCase().includes(s));
      }
      if (from) data = data.filter(d => d.date >= from);
      if (to) data = data.filter(d => d.date <= to);
      const total = data.length;
      const start = (page - 1) * perPage;
      const items = data.slice(start, start + perPage);
      return { items, total };
    }
  }

  // --- Render helpers ---
  function formatCurrency(val) {
    return `€${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function renderLayout() {
    content.innerHTML = `
      <div class="card" style="margin-bottom:16px">
        <h2>Ver Pagos Realizados</h2>
        <div class="filters" style="display:flex;gap:12px;align-items:center;margin-top:12px;flex-wrap:wrap">
          <div style="flex:1;min-width:220px">
            <label class="search-label">Buscar por usuario o ID</label>
            <div style="display:flex;gap:8px;margin-top:6px"><input id="pr-search" class="search-input" placeholder="Buscar..." style="flex:1"/><button id="pr-search-btn" class="btn btn-primary">Buscar</button></div>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <div>
              <label>Fecha desde</label>
              <input id="pr-from" type="date" class="input" />
            </div>
            <div>
              <label>Fecha hasta</label>
              <input id="pr-to" type="date" class="input" />
            </div>
          </div>
        </div>
      </div>

      <div id="pr-stats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px"></div>

      <div class="card">
        <div class="table-container" id="pr-table-container"></div>
      </div>

      <div id="pr-details-container" style="display:none;margin-top:16px"></div>
    `;
  }

  function renderStats(payments) {
    const totalPayments = payments.length;
    const ingresos = payments.reduce((s, p) => s + Number(p.amount), 0);
    const pendientes = payments.filter(p => p.status === 'Pendiente').length;
    const fallidos = payments.filter(p => p.status === 'Fallido').length;

    const statsRoot = document.getElementById('pr-stats');
    statsRoot.innerHTML = `
      <div class="total_pagos" style="background:#ecfdf5;border-radius:8px;padding:18px">
        <div class="stat-label">Total pagos</div>
        <div style="font-size:24px;font-weight:700;margin-top:8px">${totalPayments.toLocaleString()}</div>
      </div>
      <div style="background:#eef2ff;border-radius:8px;padding:18px">
        <div class="stat-label">Ingresos totales</div>
        <div style="font-size:24px;font-weight:700;margin-top:8px">${formatCurrency(ingresos)}</div>
      </div>
      <div style="background:#fff7ed;border-radius:8px;padding:18px">
        <div class="stat-label">Pendientes</div>
        <div style="font-size:24px;font-weight:700;margin-top:8px">${pendientes}</div>
      </div>
      <div style="background:#fff1f2;border-radius:8px;padding:18px">
        <div class="stat-label">Fallidos</div>
        <div style="font-size:24px;font-weight:700;margin-top:8px">${fallidos}</div>
      </div>
    `;
  }

  function renderTable(items) {
    const container = document.getElementById('pr-table-container');
    if (!items || items.length === 0) {
      container.innerHTML = '<div style="padding:20px">No se encontraron pagos.</div>';
      return;
    }

    container.innerHTML = `
      <div style="overflow:auto">
        <table class="table" style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th>ID Pago</th>
              <th>Usuario</th>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(p => `
              <tr>
                <td>${p.id}</td>
                <td>${p.user}</td>
                <td>${new Date(p.date).toLocaleDateString()}</td>
                <td>${formatCurrency(p.amount)}</td>
                <td>${renderStatusBadge(p.status)}</td>
                <td><button class="btn-outline" onclick="showPaymentDetails('${p.id}')">Ver detalles</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderStatusBadge(status) {
    if (status === 'Pendiente') return `<span style="display:inline-block;padding:6px 10px;border-radius:999px;background:#fff7ed;color:#9a5800;font-weight:600">Pendiente</span>`;
    if (status === 'Fallido') return `<span style="display:inline-block;padding:6px 10px;border-radius:999px;background:#fff1f2;color:#9b2c2c;font-weight:600">Fallido</span>`;
    if (status === 'Completado') return `<span style="display:inline-block;padding:6px 10px;border-radius:999px;background:#ecfdf5;color:#027a48;font-weight:600">Completado</span>`;
    return `<span>${status}</span>`;
  }

  async function showPaymentDetails(paymentId) {
    const numericId = paymentId.replace('#', '');
    const detailsContainer = document.getElementById('pr-details-container');

    detailsContainer.style.display = 'block';
    detailsContainer.innerHTML = '<div class="card"><div style="padding:20px">Cargando detalles...</div></div>';

    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`https://api.duobusinesslingo.com/suscripciones/${numericId}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar detalles');
      }

      const data = await response.json();
      if (data.status !== 'ok') {
        throw new Error(data.error || 'Error al cargar detalles');
      }

      // Mapear datos del backend al formato esperado
      const sub = data.data;
      const mappedSub = {
        id: sub.idSuscripcion,
        userName: sub.usuario_nombre,
        userEmail: sub.usuario_email,
        userUsername: sub.usuario_username || sub.usuario_email,
        planName: sub.plan_nombre,
        planPrice: sub.precio,
        planDuration: sub.duracion_dias,
        planDescription: sub.plan_descripcion || '',
        status: sub.estado,
        startDate: sub.fechaInicio,
        endDate: sub.fechaFin
      };

      renderPaymentDetails(mappedSub);
    } catch (error) {
      console.error('Error loading payment details:', error);
      detailsContainer.innerHTML = `<div class="card"><div style="padding:20px;color:#dc3545">Error al cargar los detalles del pago</div></div>`;
    }
  }

  function renderPaymentDetails(sub) {
    const detailsContainer = document.getElementById('pr-details-container');
    const statusMap = {
      'activa': 'Activa',
      'expirada': 'Expirada',
      'cancelada': 'Cancelada',
      'pendiente': 'Pendiente'
    };

    detailsContainer.innerHTML = `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <h3 style="margin:0">Detalles de la Suscripción #${sub.id}</h3>
          <button class="btn-outline" onclick="document.getElementById('pr-details-container').style.display='none'">Cerrar</button>
        </div>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
          <div>
            <h4 style="margin:0 0 12px 0;color:#666;font-size:14px;text-transform:uppercase">Información del Usuario</h4>
            <div style="background:#f8f9fa;padding:16px;border-radius:8px">
              <div style="margin-bottom:8px"><strong>Nombre:</strong> ${sub.userName}</div>
              <div style="margin-bottom:8px"><strong>Email:</strong> ${sub.userEmail}</div>
              <div><strong>Username:</strong> ${sub.userUsername}</div>
            </div>
          </div>
          
          <div>
            <h4 style="margin:0 0 12px 0;color:#666;font-size:14px;text-transform:uppercase">Información del Plan</h4>
            <div style="background:#f8f9fa;padding:16px;border-radius:8px">
              <div style="margin-bottom:8px"><strong>Plan:</strong> ${sub.planName}</div>
              <div style="margin-bottom:8px"><strong>Precio:</strong> ${formatCurrency(sub.planPrice)}</div>
              <div style="margin-bottom:8px"><strong>Duración:</strong> ${sub.planDuration} días</div>
              <div style="margin-top:12px;font-size:13px;color:#666">${sub.planDescription}</div>
            </div>
          </div>
        </div>
        
        <div style="margin-top:20px">
          <h4 style="margin:0 0 12px 0;color:#666;font-size:14px;text-transform:uppercase">Detalles de la Suscripción</h4>
          <div style="background:#f8f9fa;padding:16px;border-radius:8px;display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
            <div>
              <div style="font-size:12px;color:#666;margin-bottom:4px">Estado</div>
              <div style="font-weight:600">${renderStatusBadge(statusMap[sub.status] || sub.status)}</div>
            </div>
            <div>
              <div style="font-size:12px;color:#666;margin-bottom:4px">Fecha de Inicio</div>
              <div style="font-weight:600">${new Date(sub.startDate).toLocaleDateString()}</div>
            </div>
            <div>
              <div style="font-size:12px;color:#666;margin-bottom:4px">Fecha de Fin</div>
              <div style="font-weight:600">${new Date(sub.endDate).toLocaleDateString()}</div>
            </div>
            <div>
              <div style="font-size:12px;color:#666;margin-bottom:4px">ID Suscripción</div>
              <div style="font-weight:600">#${sub.id}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.showPaymentDetails = showPaymentDetails;

  // --- Wiring ---
  async function reload() {
    const search = document.getElementById('pr-search').value.trim();
    const from = document.getElementById('pr-from').value || null;
    const to = document.getElementById('pr-to').value || null;

    const { items, total } = await fetchPayments({ search, from, to, page: 1, perPage: 1000 });
    renderStats(items);
    renderTable(items);
  }

  function attachHandlers() {
    document.getElementById('pr-search-btn').addEventListener('click', reload);
    document.getElementById('pr-search').addEventListener('keydown', (e) => { if (e.key === 'Enter') reload(); });
    document.getElementById('pr-from').addEventListener('change', reload);
    document.getElementById('pr-to').addEventListener('change', reload);
  }

  // Initialize view
  function init() {
    renderLayout();
    attachHandlers();
    setTimeout(reload, 80);
  }

  // Expose a small API for future integration/tests
  window.__PAGOS_REALIZADOS = {
    init,
    fetchPayments
  };

  init();
})();
