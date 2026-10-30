// app.js - plain JS clone of App.tsx behavior
const root = document.getElementById('root');

const state = {
  currentView: 'dashboard', // 'dashboard' | 'perfil' | 'foro' | 'pagos' | 'actividades'
  selectedOption: {
    perfil: 'permisos',
    foro: 'eliminar',
    pagos: 'pagos-realizados',
    actividades: 'crear'
  }
};

// Modules mapping to their folder structure and main file
const modulePaths = {
  perfil: { folder: 'Perfil', file: 'perfil.html' },
  foro: { folder: 'Foro', file: 'foro.html' },
  pagos: { folder: 'Pagos', file: 'pagos.html' },
  actividades: { folder: 'Actividades', file: 'actividades.html' }
};

const modules = [
  { id: 'perfil', label: 'Perfil', description: 'Gestiona permisos de profesores y configuración de cuenta', color: '#1773b0' },
  { id: 'foro', label: 'Foro', description: 'Modera mensajes y gestiona anuncios del foro', color: 'oklch(.558 .288 302.321)' },
  { id: 'pagos', label: 'Gestión de Pagos', description: 'Administra pagos, reembolsos y planes de suscripción', color: '#059669' },
  { id: 'actividades', label: 'Actividades', description: 'Crea, modifica y elimina actividades del sistema', color: '#0891b2' },
];

function setView(view) {
  // For modular HTML approach: navigate to separate HTML pages for modules
  if (view === 'dashboard') {
    state.currentView = 'dashboard';
    renderApp();
    return;
  }

  // Navigate to separate HTML file for modular editing with correct capitalization
  const pathInfo = modulePaths[view];
  if (pathInfo) {
    window.location.href = `${pathInfo.folder}/${pathInfo.file}`;
  } else {
    // Fallback common case
    window.location.href = `${view}.html`;
  }
}

function setOption(module, option) {
  state.selectedOption[module] = option;
  renderApp();
}

// SVG icons for each module - matching design image
const moduleIcons = {
  perfil: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user w-7 h-7 text-white" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
  foro: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square w-7 h-7 text-white" aria-hidden="true"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"></path></svg>',
  pagos: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-credit-card w-7 h-7 text-white" aria-hidden="true"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line></svg>',
  actividades: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list w-7 h-7 text-white" aria-hidden="true"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>',
  config: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings w-7 h-7 text-white" aria-hidden="true"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"></path><circle cx="12" cy="12" r="3"></circle></svg>',
  reportes: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text w-7 h-7 text-white" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>'
};

// Render helpers for module content (simplified but faithful to layout and content)
function renderDashboard() {
  return `
  <div class="content-section">
    <div class="dashboard-header">
      <h2>Bienvenido al Panel de Administración</h2>
      <p>Selecciona un módulo para comenzar</p>
    </div>
    <div class="dashboard-grid">
      ${modules.map(m => `
        <div class="module-card" data-module="${m.id}">
          <div class="module-icon-bg" style="background:${m.color}">${moduleIcons[m.id]}</div>
          <h3>${m.label}</h3>
          <p>${m.description}</p>
          <div class="module-link">Acceder <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"><path d="M5 12h14M12 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></div>
        </div>
      `).join('')}
    </div>
  </div>
  `;
}

function renderHeader() {
  const navButtons = [
    { id: 'dashboard', label: 'Inicio' },
    { id: 'perfil', label: 'Perfil' },
    { id: 'foro', label: 'Foro' },
    { id: 'pagos', label: 'Pagos' },
    { id: 'actividades', label: 'Actividades' },
    { id: 'config', label: 'Configuración' },
    { id: 'reportes', label: 'Reportes' }
  ];

  return `
  <header class="header">
    <div class="inner">
      <div class="logo">
        <div class="icon">EA</div>
        <div class="logo-text"><h1>English Academy</h1><div style="font-size:12px;color:rgba(255,255,255,0.85)">Admin Panel</div></div>
      </div>
      <nav class="header-nav">
        ${navButtons.map(nb => `<button class="nav-btn ${state.currentView === nb.id ? 'active' : ''}" data-nav="${nb.id}">${nb.label}</button>`).join('')}
      </nav>
      <div class="user"><div class="user-info"><p>Hola, Admin</p><p style="font-size:12px;color:rgba(255,255,255,0.85)">Administrador</p></div><div class="avatar">A</div></div>
    </div>
  </header>
  `;
}

function renderSidebar(module) {
  const moduleOptions = {
    perfil: [{ id: 'permisos', label: 'Conceder permisos a profesores' }, { id: 'difusion', label: 'Crear y gestionar lista de difusión' }, { id: 'ajustes', label: 'Ajustes generales de la cuenta' }],
    foro: [{ id: 'eliminar', label: 'Eliminar mensajes inapropiados' }, { id: 'banners', label: 'Gestionar banners y anuncios' }],
    pagos: [{ id: 'pagos-realizados', label: 'Ver pagos realizados' }, { id: 'reembolsos', label: 'Reembolsos y cancelaciones' }, { id: 'planes', label: 'Configuración de planes y precios' }],
    config: [{ id: 'idioma', label: 'Modificar idioma' }, { id: 'cookies', label: 'Gestionar cookies y privacidad' }, { id: 'general', label: 'Configuración general' }],
    reportes: [{ id: 'estadisticas', label: 'Estadísticas de uso de la app' }, { id: 'actividad', label: 'Informes de actividad de usuarios' }],
    actividades: [{ id: 'crear', label: 'Crear actividades' }, { id: 'modificar', label: 'Modificar actividades' }, { id: 'eliminar', label: 'Eliminar actividades' }]
  };

  const options = moduleOptions[module] || [];
  return `
  <aside class="sidebar">
    <div class="section-title">Opciones del Módulo</div>
    <div class="sidebar-options">
      ${options.map(o => `<div class="option ${state.selectedOption[module] === o.id ? 'active' : ''}" data-option="${o.id}" data-module="${module}">${o.label}</div>`).join('')}
    </div>
  </aside>
  `;
}

// Content renderers for each module (simplified content taken from component mockups)
function renderPerfil(option) {
  if (option === 'permisos') {
    return `
      <div class="card">
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px"><div style="background:var(--primary);color:white;padding:8px;border-radius:8px">🔒</div><div><h3>Conceder Permisos a Profesores</h3><div class="kv">Gestiona los permisos y accesos de los profesores</div></div></div>
        <div class="card" style="background:#f5f7fb;margin-bottom:12px"><label class="search-label">Buscar profesor</label><div style="display:flex;gap:8px"><input class="search-input" placeholder="Buscar por nombre o email..."/><button class="btn btn-primary">Buscar</button></div></div>
        <div class="permissions-grid">
          ${[1, 2, 3, 4].map(i => `<div class="permission-card"><div class="teacher-header"><img class="teacher-avatar" src="https://picsum.photos/seed/t${i}/80" alt="avatar"/><div class="teacher-info"><h4 class="teacher-name">Profesor ${i}</h4><div class="teacher-email">profesor${i}@englishacademy.com</div></div></div><div class="permissions-section"><label class="permissions-label">Permisos</label><div class="permission-checkbox"><input type="checkbox" ${i % 2 ? 'checked' : ''}/> Gestionar contenido</div><div class="permission-checkbox"><input type="checkbox"/> Moderar foro</div><div class="permission-checkbox"><input type="checkbox" ${i % 2 ? 'checked' : ''}/> Ver estadísticas</div></div><button class="btn btn-primary" style="width:100%">Guardar permisos</button></div>`).join('')}
        </div>
      </div>
    `;
  }
  if (option === 'difusion') {
    return `<div class="card"><h3>Crear y Gestionar Lista de Difusión</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px"><div class="form-card"><label>Nombre de la lista</label><input type="text"/><label>Descripción</label><textarea></textarea><label>Seleccionar destinatarios</label><div class="checkbox-group"><label class="checkbox-item"><input type="checkbox"/> Todos los usuarios</label><label class="checkbox-item"><input type="checkbox" checked/> Solo profesores</label></div><button class="btn btn-primary">Crear lista</button></div><div class="list-card"><div class="list-header"><h3>Listas Existentes</h3></div>${[1, 2, 3].map(n => `<div class="list-item"><h4>Lista de difusión ${n}</h4><div class="list-item-info">${100 * n} destinatarios</div><div class="list-item-buttons"><button class="btn-outline">Editar</button><button class="btn-outline" style="color:#d32f2f;border-color:#d32f2f">Eliminar</button></div></div>`).join('')}</div></div></div>`;
  }
  if (option === 'ajustes') {
    return `<div class="card"><h3>Ajustes Generales de la Cuenta</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px"><div><label>Nombre completo</label><input type="text" value="Admin Name"/></div><div><label>Email</label><input type="email" value="admin@englishacademy.com"/></div><div><label>Teléfono</label><input type="text" value="+34 XXX XXX XXX"/></div><div><label>Contraseña actual</label><input type="password" placeholder="••••••"/></div></div><div style="margin-top:12px"><button class="btn btn-primary">Guardar todos los cambios</button></div></div>`;
  }
  return `<div class="card">Perfil: opción ${option}</div>`;
}

function renderForo(option) {
  if (option === 'eliminar') {
    return `<div class="card"><h3>Eliminar Mensajes Inapropiados</h3><div class="filter-section"><span class="filter-label">Filtrar por:</span><div class="filter-buttons"><button class="btn-filter active">Reportados</button><button class="btn-filter">Todos</button><button class="btn-filter">Últimas 24h</button></div></div><div class="messages-list">${[1, 2, 3, 4].map(i => `<div class="message-card"><div class="message-header"><img class="message-avatar" src="https://picsum.photos/seed/m${i}/64"/><div class="message-header-info"><div class="message-title"><h3>Usuario ${i}</h3><div class="message-date">31/10/2025</div></div><div class="badge badge-flagged">Reportado</div></div></div><div class="message-content">Contenido del mensaje del usuario ejemplo...</div><div class="message-actions"><button class="btn-action btn-action-view">Ver completo</button><button class="btn-action btn-action-delete">Eliminar</button><button class="btn-action btn-action-warn">Advertir</button></div></div>`).join('')}</div><div class="pagination"><button class="pagination-btn">← Anterior</button><button class="pagination-btn active">1</button><button class="pagination-btn">2</button><button class="pagination-btn">Siguiente →</button></div></div>`;
  }
  if (option === 'banners') {
    return `<div class="card"><h3>Gestionar Banners</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div class="form-card"><label>Título</label><input type="text"/><label>Imagen</label><div style="height:120px;border:1px dashed #ddd;border-radius:8px;display:flex;align-items:center;justify-content:center">Click para subir</div><button class="btn btn-primary" style="margin-top:8px">Publicar banner</button></div><div class="list-card">${[1, 2, 3].map(n => `<div class="list-item"><div style="height:72px;background:linear-gradient(90deg,var(--primary) 0%, #3b82f6 100%);border-radius:8px;margin-bottom:8px"></div><h4>Banner ${n}</h4><div class="list-item-buttons"><button class="btn-outline">Editar</button><button class="btn-outline" style="color:#d32f2f;border-color:#d32f2f">Eliminar</button></div></div>`).join('')}</div></div></div>`;
  }
  return `<div class="card">Foro: opción ${option}</div>`;
}

function renderPagos(option) {
  if (option === 'pagos-realizados') {
    return `<div class="card"><h3>Ver Pagos Realizados</h3><div class="card" style="margin-top:12px"><div class="stats-grid">${[1, 2, 3, 4].map((n, i) => `<div class="stat-card"><div class="stat-label">${['Total pagos', 'Ingresos totales', 'Pendientes', 'Fallidos'][i]}</div><div class="stat-value">${[1234, '€45,678', 23, 5][i]}</div></div>`).join('')}</div></div><div class="card" style="margin-top:12px"><div class="table-container">${[1, 2, 3, 4, 5].map(i => `<div class="table-row"><div>#PAY${1000 + i}</div><div>Usuario ${i}</div><div>0${i}/10/2025</div><div>€${(i * 29.99).toFixed(2)}</div><div>${i % 3 === 0 ? 'Completado' : i % 3 === 1 ? 'Pendiente' : 'Fallido'}</div><div><button class="btn-outline">Ver detalles</button></div></div>`).join('')}</div></div><div style="margin-top:12px"><button class="btn btn-primary">Exportar a CSV</button></div></div>`;
  }
  return `<div class="card">Pagos: opción ${option}</div>`;
}

function renderConfiguracion(option) {
  if (option === 'idioma') {
    return `<div class="card"><h3>Modificar Idioma</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px"><div class="card"><h4>Idioma Actual</h4><div style="text-align:center;margin-top:8px;font-size:28px">🇪🇸<div class="kv">Español</div></div></div><div class="card"><h4>Idiomas Disponibles</h4>${['English', 'Français', 'Deutsch', 'Italiano', 'Português'].map(l => `<div style="padding:8px;border:1px solid var(--border);margin-bottom:8px;border-radius:8px;display:flex;justify-content:space-between;align-items:center"><div>${l}</div><button class="btn-outline">Seleccionar</button></div>`).join('')}</div></div><div style="margin-top:12px"><button class="btn btn-primary">Aplicar cambios de idioma</button></div></div>`;
  }
  if (option === 'cookies') {
    return `<div class="card"><h3>Gestionar Cookies</h3><div style="margin-top:12px"><div class="card"><div style="display:flex;justify-content:space-between"><div><strong>Cookies Esenciales</strong><div class="kv">Necesarias para el funcionamiento</div></div><div>Siempre activas</div></div></div><div class="card" style="margin-top:8px"><div style="display:flex;justify-content:space-between"><div><strong>Cookies de Análisis</strong><div class="kv">Ayudan a mejorar el rendimiento</div></div><div><button class="btn-outline">Configurar</button></div></div></div></div></div>`;
  }
  return `<div class="card">Configuración: opción ${option}</div>`;
}

function renderReportes(option) {
  if (option === 'estadisticas') {
    return `<div class="card"><h3>Estadísticas de Uso</h3><div class="stats-grid" style="margin-top:12px">${[1, 2, 3, 4].map(i => `<div class="stat-card"><div class="stat-label">${['Usuarios activos', 'Sesiones totales', 'Duración media', 'Nuevos usuarios'][i - 1]}</div><div class="stat-value">${[3542, 12456, '24 min', 487][i - 1]}</div></div>`).join('')}</div><div style="margin-top:12px" class="card"><h4>Páginas Más Visitadas</h4>${['/dashboard', '/perfil', '/foro', '/pagos', '/reportes'].map((p, idx) => `<div style="display:flex;gap:12px;align-items:center;margin-bottom:8px"><div style="width:120px;background:var(--primary);color:white;padding:6px;border-radius:6px">${p}</div><div style="flex:1;height:12px;background:#eee;border-radius:6px;position:relative"><div style="width:${[35, 23, 20, 15, 7][idx]}%;height:100%;background:linear-gradient(90deg,var(--primary),#3b82f6);border-radius:6px"></div></div><div style="width:80px;text-align:right">${[12543, 8234, 7123, 5432, 2543][idx].toLocaleString()}</div></div>`).join('')}</div></div>`;
  }
  if (option === 'actividad') {
    return `<div class="card"><h3>Informes de Actividad</h3><div style="margin-top:12px" class="card">${[1, 2, 3, 4, 5, 6].map(i => `<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid var(--border)"><div style="display:flex;gap:8px"><div style="width:36px;height:36px;border-radius:50%;background:#ddd"></div><div><div>Usuario ${i}</div><div class="kv">Hace ${i}h</div></div></div><div style="width:80px;text-align:right">${(15 - i * 2)}</div></div>`).join('')}</div></div>`;
  }
  return `<div class="card">Reportes: opción ${option}</div>`;
}

function renderActividades(option) {
  if (option === 'crear') {
    return `<div class="card"><h3>Crear Nueva Actividad</h3><div style="margin-top:12px" class="card"><label>Título</label><input type="text" placeholder="Ej: Present Simple Exercise"/><label>Nivel</label><select><option>A1 - Beginner</option><option>A2 - Elementary</option></select><label>Descripción</label><textarea></textarea><div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end"><button class="btn btn-outline">Cancelar</button><button class="btn btn-primary">Crear Actividad</button></div></div></div>`;
  }
  if (option === 'modificar') {
    return `<div class="card"><h3>Modificar Actividades</h3><div style="margin-top:12px">${[1, 2, 3, 4].map(a => `<div class="list-item"><div style="display:flex;justify-content:space-between"><div><h4>Actividad ${a}</h4><div class="kv">Nivel: A2 | Puntos: ${80 + a * 5}</div></div><button class="btn btn-primary">Editar</button></div></div>`).join('')}</div></div>`;
  }
  if (option === 'eliminar') {
    return `<div class="card"><h3>Eliminar Actividades</h3><div style="margin-top:12px">${[1, 2, 3, 4, 5].map(a => `<div class="list-item"><div style="display:flex;justify-content:space-between"><div><div class="kv">ACT-00${a}</div><h4>Actividad ${a}</h4></div><button class="btn-outline" style="color:#d32f2f;border-color:#d32f2f">Eliminar</button></div></div>`).join('')}</div></div>`;
  }
  return `<div class="card">Actividades: opción ${option}</div>`;
}

function renderModuleContent(module) {
  const option = state.selectedOption[module];
  switch (module) {
    case 'perfil': return renderPerfil(option);
    case 'foro': return renderForo(option);
    case 'pagos': return renderPagos(option);
    case 'config': return renderConfiguracion(option);
    case 'reportes': return renderReportes(option);
    case 'actividades': return renderActividades(option);
    default: return `<div class="card">Módulo ${module}</div>`;
  }
}

// Main render
function renderApp() {
  // The shared header is injected from header.html into the page (see app.html)
  root.innerHTML = `
    <div class="app-body">
      ${state.currentView === 'dashboard' ? '' : renderSidebar(state.currentView)}
      <main class="content">
        ${state.currentView === 'dashboard' ? renderDashboard() : `<div class="content-section">${renderModuleContent(state.currentView)}</div>`}
      </main>
    </div>
    <div class="footer">© 2025 English Academy - Admin Panel</div>
  `;

  // If on dashboard attach module-card click handlers (delegated)
  if (state.currentView === 'dashboard') {
    const grid = document.querySelector('.dashboard-grid');
    if (grid) {
      grid.onclick = function (e) {
        const card = e.target.closest('.module-card');
        if (!card) return;
        setView(card.dataset.module);
      }
    }
  }

  // sidebar options (only exist when not dashboard)
  document.querySelectorAll('.option').forEach(o => o.addEventListener('click', e => {
    const mod = o.dataset.module; const opt = o.dataset.option;
    setOption(mod, opt);
  }));
}

// Initial render
renderApp();

// Expose for debugging
window.__APP = { state, setView, setOption, renderApp };
