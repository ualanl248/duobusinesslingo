/* =============================================================================
   - Secciones:
     1) Estado global + navegación
     2) Render principal
     3) Home (HTML + listeners + idioma)
     4) Actividades
     5) Foro
     6) Perfil + Suscripciones
     7) Bloques + Tests
   ============================================================================= */

/* =============================================================================
   INDICE DE DATOS A INSERTAR (Hacer CTRL + F "insertar")
    Bloques de actividades
    Mensajes del foro
    Datos del usuario
    Estadísticas del usuaro
    Datos de la suscripción contratada
    Datos de los perfiles de otros usuario del foro
    Contenido de cada bloque
    Ejercicios (preguntas y opciones)
   ============================================================================= */

/// ======================================
// 1. ESTADO DE LA APLICACIÓN (GLOBAL)
// ======================================

const appContainer = document.getElementById('app-container');

const state = {
  currentScreen: 'home', // Pantalla actual (inicia en 'home')
  isSuscrito: false,     // Simulación de estado de suscripción
  bloqueSeleccionado: null,
  usuarioSeleccionado: null,
  currentUser: null, // Datos del usuario logueado
  bloques: [], // Lista de bloques cargados del backend
};

/**
 * Corrige la ruta de imagen para que apunte al directorio correcto.
 * El backend guarda rutas como 'assets/avatars/...' pero el frontend está en FrontendCliente/
 * por lo que necesitamos '../assets/avatars/...' para subir un nivel.
 */
function fixImagePath(url) {
  if (!url) return null;
  // Si ya es una URL absoluta o ya tiene ../, no modificar
  if (url.startsWith('http') || url.startsWith('../') || url.startsWith('/')) {
    return url;
  }
  // Si empieza con 'assets/', añadir '../' para subir un nivel
  if (url.startsWith('assets/')) {
    return '../' + url;
  }
  return url;
}

/**
 * Escapa texto para insertarlo de forma segura en HTML (previene XSS).
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Prepara una ruta de imagen para usarla dentro de url('...') en un atributo style.
 */
function safeCssUrl(url) {
  return escapeHtml(encodeURI(url).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29'));
}

// ======================================
// 2. UTILIDADES DOM Y RENDERIZADO
// ======================================

/**
 * Función que inyecta el HTML de la nueva pantalla.
 * @param {string} screenName - Nombre de la pantalla a cargar.
 * @param {string | number} [param] - Parámetro opcional para usuario o bloque.
 */

// =============================================================================
// 2) NAVEGACIÓN + RENDER
// =============================================================================
// =============================================================================
// 2) NAVEGACIÓN + RENDER
// =============================================================================
function navigateTo(screenName, param = null, addToHistory = true) {


  // 1. Actualizar el estado
  state.currentScreen = screenName;

  // Manejar parámetros según el tipo
  if (typeof param === 'string') {
    state.usuarioSeleccionado = param;
    state.bloqueSeleccionado = null;
  } else if (typeof param === 'number') {
    state.bloqueSeleccionado = param;
    state.usuarioSeleccionado = null;
  }

  // 1.5. Agregar al historial si es necesario
  if (addToHistory) {
    const historyState = { screen: screenName, param: param };
    const urlHash = `#${screenName}`;
    history.pushState(historyState, '', urlHash);
  }

  // 2. Renderizar la nueva pantalla
  renderCurrentScreen();
}

/**
 * Manejador del botón "Atrás" del navegador
 */
window.addEventListener('popstate', (event) => {
  // Si tenemos estado, navegamos a esa pantalla sin añadir nuevo historial
  if (event.state && event.state.screen) {
    navigateTo(event.state.screen, event.state.param, false);
  } else {
    // Si no hay estado (o es null), asumimos que estamos volviendo al inicio
    // "Trampa" para evitar salir de la App si estamos en Home
    // Si la URL actual es root o index.html, forzamos Home
    navigateTo('home', null, false);

    // IMPORTANTE: Bloqueo de salida. 
    // Si el usuario intentó ir atrás desde home y llegó a un estado vacío,
    // re-insertamos 'home' en el historial para "empujarlo" de nuevo hacia adelante.
    // Esto crea el efecto de que "Atrás" no hace nada.
    history.pushState({ screen: 'home' }, '', '#home');
  }
});


/**
 * Función que maneja el clic en una tarjeta de bloque o el botón 'Ver Todos'.
 * Simula la función handleStartActivity del TSX.
 */
function handleStartActivity(bloqueId = null) {


  // Si se proporciona un bloqueId, navegar a los tests de ese bloque
  if (bloqueId && typeof bloqueId === 'number') {

    resetTestsState(); // Resetear estado de tests
    navigateTo('tests-bloque', bloqueId);
  }
  // Si no hay bloqueId, simplemente ir a la vista general de bloques
  // (La lógica de "Suscrito vs No Suscrito" ya se maneja al cargar los bloques)
  else {
    navigateTo('actividades');
  }
}

/**
 * Función para obtener los bloques desde el backend
 */
async function checkUserSession() {
  try {
    const response = await PerfilAPI.getPerfil();
    if (response && response.success) {
      state.currentUser = response.perfil;
      state.isSuscrito = !!response.isSuscrito;
      // Sesión verificada

      // Forzar actualización de UI si fuera necesario (ej. banners)
      // Aunque al ser al inicio, el renderizado posterior usará el estado correcto
    }
  } catch (error) {
    console.warn('No se pudo verificar sesión o usuario no autenticado', error);
  }
}

/**
 * Función para obtener los bloques desde el backend
 */
function fetchBloques() {
  return BloquesAPI.getBloques()
    .then(data => {
      if (data.success) {
        // Actualizar estado de suscripción y lista de bloques
        state.isSuscrito = data.isSuscrito;

        // Mapear los bloques para asegurar que tengan propiedades esperadas por la UI
        // Asignamos iconos aleatorios o por defecto ya que la DB no tiene esa columna
        const iconList = ['BookOpen', 'FileText', 'GraduationCap', 'Award'];
        const colors = ['bg-cyan-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500'];

        state.bloques = data.bloques.map((b, index) => ({
          id: parseInt(b.idBloque),
          nombre: b.nombre,
          descripcion: b.descripcion,
          // Asignar propiedades visuales que faltan en DB (solo si no vienen del backend)
          color: colors[index % colors.length],
          icon: b.icon || iconList[index % iconList.length],
          totalTests: b.totalTests !== undefined ? parseInt(b.totalTests) : 0,
          completados: b.completados !== undefined ? parseInt(b.completados) : 0
        }));


        return state.bloques;
      } else {
        console.error('Error en datos de bloques:', data.message);
        return [];
      }
    })
    .catch(error => {
      console.error('Error fetching bloques:', error);
      return [];
    });
}

/**
 * Función que genera el HTML de la vista Actividades basado en el estado de suscripción.
 * (Contiene el código que me pasaste previamente)
 */

// =============================================================================
// 4) ACTIVIDADES
// =============================================================================
function generateActividadesContent(isSuscrito) {
  // =============================================================================
  // INSERTAR BLOQUES
  // =============================================================================  

  // Usar los bloques cargados en el estado
  const bloques = state.bloques || [];
  const gridClass = isSuscrito ? 'bloques-grid-2-cols' : 'bloques-grid-3-cols';

  // Simular iconos Lucide con SVG 
  const iconSVG = (iconName) => {
    switch (iconName) {
      case 'Lock': return `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
      case 'CheckCircle': return `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M9 11l3 3L22 4"/></svg>`;
      case 'GraduationCap': return `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
      case 'GraduationCapHead': return `<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1773b0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
      case 'BookOpen': return `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;
      case 'FileText': return `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`;
      case 'GraduationCapBloque': return `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
      case 'Award': return `<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`;
      case 'MessageCircle': return `<svg class="w-5 h-5 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A10 10 0 1 0 4.1 3.9l-1.5 6 6 1.5z"/></svg>`;
      case 'Users': return `<svg class="w-8 h-8 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
      default: return '';
    }
  };

  // ===================================
  // Generación del HTML Dinámico
  // ===================================

  let bloquesHTML = bloques.map(bloque => `
        <div class="bloque-card" data-bloque-id="${bloque.id}" onclick="handleStartActivity(${bloque.id})">
            <div class="bloque-card-content">
                <div class="bloque-icon-wrapper ${bloque.color}">
                    ${iconSVG(bloque.icon)}
                </div>
                <div>
                    <h3 class="bloque-title">${bloque.nombre}</h3>
                    <p class="bloque-description">${bloque.descripcion}</p>
                    <a href="#" class="bloque-link" data-screen="tests-bloque" onclick="event.stopPropagation(); handleStartActivity(${bloque.id}); return false;">
                        Acceder al bloque
                        <svg class="bloque-link-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    `).join('');

  const statusIconClass = isSuscrito ? 'status-icon-subscribed' : 'status-icon-locked';
  const statusIconSvg = isSuscrito ? iconSVG('CheckCircle') : iconSVG('Lock');
  const statusTitle = isSuscrito ? ((window.I18n && window.I18n.t) ? window.I18n.t('status.title.subscribed') : 'Usuario Suscrito') : ((window.I18n && window.I18n.t) ? window.I18n.t('status.title.unsubscribed') : 'Usuario No Suscrito');
  const statusSubtitle = isSuscrito ? ((window.I18n && window.I18n.t) ? window.I18n.t('status.subtitle.subscribed') : 'Acceso completo a todos los bloques') : ((window.I18n && window.I18n.t) ? window.I18n.t('status.subtitle.unsubscribed') : 'Acceso limitado al plan personalizado');
  const headerInfoText = isSuscrito ? ((window.I18n && window.I18n.t) ? window.I18n.t('actividades.headerInfo.subscribed') : 'Tienes acceso completo a todos los bloques') : ((window.I18n && window.I18n.t) ? window.I18n.t('actividades.headerInfo.unsubscribed') : 'Accede al plan personalizado o suscríbete para más contenido');

  const subscriptionButton = !isSuscrito ?
    `<a href="#" class="btn btn-primary" onclick="navigateTo('suscripciones'); return false;">${(window.I18n && window.I18n.t) ? window.I18n.t('btn.subscribe') : 'Suscribirse'}</a>` : '';

  const sectionTitle = isSuscrito ? ((window.I18n && window.I18n.t) ? window.I18n.t('section.title.subscribed') : 'Todos los Bloques Disponibles') : ((window.I18n && window.I18n.t) ? window.I18n.t('section.title.unsubscribed') : 'Plan Personalizado');
  const sectionSubtitle = isSuscrito ? ((window.I18n && window.I18n.t) ? window.I18n.t('section.subtitle.subscribed') : 'Como usuario suscrito, puedes acceder a todos los bloques disponibles y realizar los tests correspondientes') : ((window.I18n && window.I18n.t) ? window.I18n.t('section.subtitle.unsubscribed') : 'Accede a una selección limitada de bloques diseñados específicamente para ti');

  const subscriptionBanner = !isSuscrito ? `
      <div class="subscription-banner">
        <div class="banner-content">
          <div class="banner-icon-wrapper">
            ${iconSVG('Award')}
          </div>
          <div class="banner-text-content">
            <h4 class="banner-title">${(window.I18n && window.I18n.t) ? window.I18n.t('subscription.banner.title') : '¿Quieres acceder a más contenido?'}</h4>
            <p class="banner-description">
              ${(window.I18n && window.I18n.t) ? window.I18n.t('subscription.banner.desc') : 'Suscríbete para desbloquear todos los bloques y obtener acceso completo a todo el material de estudio'}
            </p>
            <a href="#" class="btn btn-primary" onclick="navigateTo('suscripciones'); return false;">
              ${(window.I18n && window.I18n.t) ? window.I18n.t('subscription.banner.cta') : 'Ver Planes de Suscripción'}
            </a>
          </div>
        </div>
      </div>
    ` : '';

  return `
        <div id="actividades-view" class="actividades-page-wrapper">
            <div class="actividades-header">
                <div class="actividades-header-content">
                    <button class="btn-back-to-home" onclick="navigateTo('home')">
                        <svg class="btn-back-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
                        </svg>
                        ${(window.I18n && window.I18n.t) ? window.I18n.t('actividades.backBtn') : 'Volver al Inicio'}
                    </button>
                    <div class="header-details">
                        <div class="header-icon-wrapper">
                            ${iconSVG('GraduationCapHead')}
                        </div>
                        <div>
                            <h1 class="header-main-title">${(window.I18n && window.I18n.t) ? window.I18n.t('actividades.title') : 'Actividades'}</h1>
                            <p class="header-info-text">${headerInfoText}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="actividades-content-wrapper">
                <div class="subscription-status-card">
                    <div class="status-content">
                        <div class="status-details">
                            <div class="status-icon-wrapper ${statusIconClass}">
                                ${statusIconSvg}
                            </div>
                            <div>
                                <h3 class="status-title">${statusTitle}</h3>
                                <p class="status-subtitle">${statusSubtitle}</p>
                            </div>
                        </div>
                        ${subscriptionButton}
                    </div>
                </div>
                
                <div class="section-title-wrapper">
                    <h2 class="section-title">${sectionTitle}</h2>
                    <p class="section-subtitle">${sectionSubtitle}</p>
                </div>
                
                <div class="bloques-grid ${gridClass}">
                    ${bloquesHTML}
                </div>
                
                ${subscriptionBanner}
            </div>
        </div>
    `;
}


/**
 * Función central de renderizado (Simulación de renderScreen).
 */


function renderCurrentScreen() {
  if (!appContainer) return;

  let contentHTML = '';

  switch (state.currentScreen) {
    case 'home':

      appContainer.innerHTML = generateHomeContent();
      attachHomePageListeners();
      break;

    case 'actividades':

      // Primero cargamos los bloques y luego renderizamos
      fetchBloques().then(() => {
        contentHTML = generateActividadesContent(state.isSuscrito);
        if (appContainer) appContainer.innerHTML = contentHTML;
      });
      break;

    case 'estadisticas':

      contentHTML = renderEstadisticas();
      appContainer.innerHTML = contentHTML;
      break;

    case 'foro':

      contentHTML = generateForoContent();
      appContainer.innerHTML = contentHTML;
      break;

    case 'perfil':

      contentHTML = renderPerfilUsuario(); // Obtener el HTML
      appContainer.innerHTML = contentHTML;
      break;

    case 'suscripciones':

      renderSuscripciones().then(html => {
        appContainer.innerHTML = html;
      });
      break;

    case 'perfil-otro-usuario':

      contentHTML = renderPerfilOtroUsuario(state.usuarioSeleccionado);
      appContainer.innerHTML = contentHTML;
      break;

    case 'tests-bloque':

      contentHTML = renderVistaTestsBloque(state.bloqueSeleccionado, state.isSuscrito);
      appContainer.innerHTML = contentHTML;
      break;

    case 'vista-bloques':

      fetchBloques().then(() => {
        contentHTML = renderVistaBloques(state.isSuscrito);
        if (appContainer) appContainer.innerHTML = contentHTML;
      });
      break;

    default:
      contentHTML = `<div class="main-content-wrapper"><h2 class="welcome-title">Pantalla ${state.currentScreen} en desarrollo.</h2><p>Volviendo a Home...</p><a href="#" onclick="navigateTo('home'); return false;" class="btn btn-primary">Volver a Home</a></div>`;
      appContainer.innerHTML = contentHTML;
      break;
  }

}
// ======================================
// 3. INICIALIZACIÓN Y MANEJO DE EVENTOS
// ======================================

/**
 * Asigna los listeners de clic a las tarjetas de la Home Page.
 */

// =============================================================================
// 3) HOME: LISTENERS + IDIOMAS
// =============================================================================
function attachHomePageListeners() {
  // 1. Obtener todas las tarjetas de módulo que tienen el atributo data-module
  const moduleCards = document.querySelectorAll('.module-card');

  // 2. Asignar un evento de clic a cada tarjeta
  moduleCards.forEach(card => {
    // Remover listener previo para evitar duplicados
    card.removeEventListener('click', handleCardClick);
    // Asignar nuevo listener
    card.addEventListener('click', handleCardClick);
  });

  // Language selector: ensure it works when home is re-rendered
  const langSel = document.getElementById('lang-selector');
  if (langSel) {
    // set current value from I18n or localStorage
    // Normalizar a minúsculas y validar que sea un idioma disponible
    try {
      const availableLangs = ['es', 'en', 'pt'];
      let rawLang = (window.I18n && window.I18n.getLanguage && window.I18n.getLanguage()) || localStorage.getItem('gsa_lang') || 'es';
      rawLang = (rawLang || 'es').toLowerCase();
      const current = availableLangs.includes(rawLang) ? rawLang : 'es';
      langSel.value = current;
    } catch (e) { }
    langSel.removeEventListener('change', handleLangChange);
    langSel.addEventListener('change', handleLangChange);
  }

  // Logout button: ensure it works when home is re-rendered
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.removeEventListener('click', window.handleLogout);
    btnLogout.addEventListener('click', window.handleLogout);
  }
}

function handleLangChange(e) {
  const lang = e.target.value;
  if (window.I18n && window.I18n.setLanguage) {
    window.I18n.setLanguage(lang).catch(() => {
      localStorage.setItem('gsa_lang', lang);
      location.reload();
    });
  } else {
    localStorage.setItem('gsa_lang', lang);
    location.reload();
  }
}

function handleCardClick(event) {
  event.preventDefault();
  // 'this' en un listener se refiere al elemento que disparó el evento (la tarjeta)
  const screenName = this.getAttribute('data-module');

  // Los nombres de módulo (actividades, foro, perfil) ya coinciden con los nombres de pantalla
  if (screenName) {
    navigateTo(screenName);
  }
}


// Punto de entrada al cargar el DOM
document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar historial:
  // Estrategia de "Doble buffer" para bloquear el botón Atrás en la Home.
  // 1. Reemplazamos el estado actual (que podría ser null o index.html) por 'home'.
  // 2. Empujamos OTRO estado 'home'.
  // Esto hace que si el usuario pulsa Atrás, vuelva al estado 'home' anterior (buffer),
  // y si pulsa de nuevo, el evento popstate (trampa) lo devolverá aquí.
  if (!history.state || history.state.screen !== 'home') {
    history.replaceState({ screen: 'home' }, '', '#home');
    history.pushState({ screen: 'home' }, '', '#home');
  }

  // Inicializar el sistema de traducciones ANTES de renderizar cualquier contenido
  try {
    if (window.I18n && window.I18n.init) {
      await window.I18n.init();
    }
  } catch (e) {
    console.warn('Error inicializando i18n en main.js:', e);
  }

  // Verificar sesión y cargar datos de usuario/suscripción
  await checkUserSession();

  // RE-RENDERIZAR la página Home para aplicar las traducciones cargadas
  // Esto reemplaza el HTML estático con el HTML dinámico traducido
  if (appContainer && state.currentScreen === 'home') {
    appContainer.innerHTML = generateHomeContent();
  }

  // Adjuntar los listeners después de renderizar
  attachHomePageListeners();
});

// ===================================
// DEFINICIÓN DE SVGs (LOGOS)
// ===================================

// 1. Flecha de Volver
const backArrowSVG = `
    <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
    </svg>
`;

// 2. Logo de la CABECERA del Foro (Cuadrado blanco en fondo azul) - ¡RELLENO!
const headerIconSVG = `
    <svg class="w-8 h-8 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
`;

// 3. Icono de "Chat General" (dentro del cuerpo) - ¡CONTORNO!
const messageCircleSVG = `
    <svg class="chat-title-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
`;

/**
 * Función que genera el HTML de la vista principal (Home).
 * Esto es necesario para que el botón "Volver al inicio" funcione correctamente.
 */

// Definición de SVGs utilizados en la Home Page (para asegurar que se rendericen)
const iconSVG = (iconName) => {
  switch (iconName) {
    case 'Target': return `<svg class="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l10 5-10 5-10-5 10-5z"/><path d="M2 12l10 5 10-5"/><path d="M2 17l10 5 10-5"/></svg>`;
    case 'Activity': return `<svg class="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20v-8M12 4v-2M4 12h-2M20 12h-2M18.36 5.64l1.41-1.41M3.64 18.36l1.41-1.41M18.36 18.36l1.41 1.41M3.64 5.64l1.41 1.41"/><circle cx="12" cy="12" r="4"/></svg>`;
    case 'MessageSquare': return `<svg class="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    case 'Users': return `<svg class="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
    case 'ArrowRight': return `<svg class="module-link-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>`;
    default: return '';
  }
};

// Contenido HTML de la página de inicio
function generateHomeContent() {
  // Obtener el idioma actual para marcar la opción correcta como selected
  // Normalizar a minúsculas y validar que sea un idioma disponible
  const availableLangs = ['es', 'en', 'pt'];
  let rawLang = (window.I18n && window.I18n.getLanguage && window.I18n.getLanguage()) || localStorage.getItem('gsa_lang') || 'es';
  rawLang = (rawLang || 'es').toLowerCase();
  const currentLang = availableLangs.includes(rawLang) ? rawLang : 'es';

  return `
        <div id="app-container" class="home-page-container">

        <header class="main-header">
            <div class="main-header-content">
                <div class="logo-icon-wrapper">
                    <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
                        fill="none" stroke="#1773b0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                </div>

                <div class="header-meta">
                    <p class="header-subtitle">${(window.I18n && window.I18n.t) ? window.I18n.t('home.header.subtitle') : 'Panel de Cliente'}</p>
                    <div class="header-controls">
                        <div class="lang-selector-wrapper">
                            <label for="lang-selector" class="lang-label">Idioma</label>
                            <select id="lang-selector" class="lang-selector">
                                <option value="es" ${currentLang === 'es' ? 'selected' : ''}>ES</option>
                                <option value="en" ${currentLang === 'en' ? 'selected' : ''}>EN</option>
                                <option value="pt" ${currentLang === 'pt' ? 'selected' : ''}>PT</option>
                            </select>
                        </div>
                        <button id="btn-logout" class="btn-logout" title="${(window.I18n && window.I18n.t) ? window.I18n.t('home.logout.title') : 'Cerrar sesión'}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            ${(window.I18n && window.I18n.t) ? window.I18n.t('home.logout.text') : 'Salir'}
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <main class="main-content-wrapper">
            <div class="welcome-section">
                <h2 class="welcome-title">${(window.I18n && window.I18n.t) ? window.I18n.t('home.welcome.title') : '¡Bienvenido!'}</h2>
                <p class="welcome-subtitle">${(window.I18n && window.I18n.t) ? window.I18n.t('home.welcome.subtitle') : '¿Qué vas a aprender hoy?'}</p>
            </div>

            <div class="module-grid">

                <div class="module-card group" data-module="actividades">
                    <div class="module-card-content">
                        <div class="module-icon-wrapper module-icon-actividades">
                            <svg class="module-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 12h4l3 8 4-16 3 8h4" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="module-title">${(window.I18n && window.I18n.t) ? window.I18n.t('module.actividades.title') : 'Actividades'}</h3>
                            <p class="module-description">
                                ${(window.I18n && window.I18n.t) ? window.I18n.t('module.actividades.desc') : 'Accede a los bloques y tests del plan personalizado'}
                            </p>
                            <a href="#" class="module-link" data-screen="actividades">
                                ${(window.I18n && window.I18n.t) ? window.I18n.t('btn.access') : 'Acceder'}
                                <svg class="module-link-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                <div class="module-card group" data-module="foro">
                    <div class="module-card-content">
                        <div class="module-icon-wrapper module-icon-foro">
                            <svg class="module-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="module-title">${(window.I18n && window.I18n.t) ? window.I18n.t('module.foro.title') : 'Foro'}</h3>
                            <p class="module-description">
                                ${(window.I18n && window.I18n.t) ? window.I18n.t('module.foro.desc') : 'Participa en conversaciones y consulta perfiles'}
                            </p>
                            <a href="#" class="module-link" data-screen="foro">
                                ${(window.I18n && window.I18n.t) ? window.I18n.t('btn.access') : 'Acceder'}
                                <svg class="module-link-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                <div class="module-card group" data-module="perfil">
                    <div class="module-card-content">
                        <div class="module-icon-wrapper module-icon-perfil">
                            <svg class="module-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="module-title">${(window.I18n && window.I18n.t) ? window.I18n.t('module.perfil.title') : 'Perfil Usuario'}</h3>
                            <p class="module-description">
                                ${(window.I18n && window.I18n.t) ? window.I18n.t('module.perfil.desc') : 'Gestiona tu información personal y suscripción'}
                            </p>
                            <a href="#" class="module-link" data-screen="perfil">
                                ${(window.I18n && window.I18n.t) ? window.I18n.t('btn.access') : 'Acceder'}
                                <svg class="module-link-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <footer class="main-footer">
                <p class="footer-text">
                    ${(window.I18n && window.I18n.t) ? window.I18n.t('home.footer.copyright') : '© 2025 Global Speak Academy. Todos los derechos reservados.'}
                </p>
            </footer>
        </main>
    </div>
    
    `;
}


// =============================================================================
// 5) FORO
// =============================================================================
// =============================================================================
// INSERTAR MENSJAES
// =============================================================================
const foroState = {
  mensajes: [
    {
      id: 1,
      usuario: 'Usuario1',
      mensaje: 'Mensaje',
      tiempo: 'fecha'
    },
    {
      id: 2,
      usuario: 'Usuario2',
      mensaje: 'Mensaje',
      tiempo: 'fecha'
    },
    {
      id: 3,
      usuario: 'Usuario3',
      mensaje: 'Mensaje',
      tiempo: 'fecha'
    }
  ]
};
/**
 * Manejar acciones del foro
 */
function handleForoActions(action, param = null) {
  if (action === 'ver-perfil' && param && param !== 'Tú') {
    // Navegar al perfil del otro usuario
    navigateTo('perfil-otro-usuario', param);
  } else if (action === 'enviar') {
    // Verificar si el usuario está suscrito
    if (!state.isSuscrito) {
      // Mostrar mensaje de que necesita suscripción
      mostrarModalSuscripcion();
      return;
    }

    const mensajeInput = document.getElementById('foro-mensaje-input');
    const mensaje = mensajeInput ? mensajeInput.value.trim() : '';

    if (mensaje) {
      // Agregar el nuevo mensaje
      const nuevoMensaje = {
        id: foroState.mensajes.length + 1,
        usuario: 'Tú',
        mensaje: mensaje,
        tiempo: 'Ahora'
      };
      foroState.mensajes.push(nuevoMensaje);

      // Limpiar el input
      mensajeInput.value = '';

      // Re-renderizar solo la lista de mensajes
      updateForoMessagesDOM();
    }
  }
}

function mostrarModalSuscripcion() {
  // Opción 1: Alert simple
  const confirmar = confirm(
    '🔒 Función Premium\n\n' +
    'Para enviar mensajes en el foro necesitas una suscripción activa.\n\n' +
    '¿Quieres ver los planes de suscripción?'
  );

  if (confirmar) {
    navigateTo('suscripciones');
  }

}


/**
 * Actualizar solo la lista de mensajes sin recargar toda la página
 */
function updateForoMessagesDOM() {
  const mensajesContainer = document.getElementById('foro-mensajes-container');
  if (mensajesContainer) {
    mensajesContainer.innerHTML = generateMensajesHTML(foroState.mensajes);
    // Scroll automático hacia abajo
    mensajesContainer.scrollTop = mensajesContainer.scrollHeight;
  }
}

/**
 * Generar HTML de los mensajes
 */
function generateMensajesHTML(mensajes = []) {
  if (!Array.isArray(mensajes)) {
    console.warn('[generateMensajesHTML] mensajes no es un array:', mensajes);
    return '';
  }
  return mensajes.map((msg) => {
    // Usar nombreCompleto para mostrar y username para navegar
    const nombreMostrar = msg.nombreCompleto || msg.username || 'Anónimo';
    const usernameNavegar = msg.username || nombreMostrar;
    const isSelf = nombreMostrar === 'Tú' || msg.esMio; // Verificar si es el usuario actual

    // Calcular iniciales de forma segura
    const iniciales = nombreMostrar.split(' ').map(n => n[0] || '').join('').substring(0, 2).toUpperCase();
    const cursorClass = isSelf ? '' : 'cursor-pointer';

    const nombreSeguro = escapeHtml(nombreMostrar);
    const usernameSeguro = escapeHtml(usernameNavegar);
    const avatarStyle = msg.url_imagen
      ? `background-image: url('${safeCssUrl(fixImagePath(msg.url_imagen))}'); background-size: cover; background-position: center; color: transparent;`
      : '';

    // El perfil se abre con un listener delegado (ver más abajo), no con onclick inline
    return `
            <div class="foro-mensaje-item">
                <div 
                    class="foro-avatar ${cursorClass}" 
                    ${!isSelf ? `data-ver-perfil="${usernameSeguro}" title="Ver perfil de ${nombreSeguro}"` : ''}
                    style="${avatarStyle}"
                >
                    ${!msg.url_imagen ? escapeHtml(iniciales) : ''}
                </div>
                <div class="foro-mensaje-content">
                    <div class="foro-mensaje-header">
                        <span 
                            class="foro-usuario-nombre ${!isSelf ? 'clickable' : ''}"
                            ${!isSelf ? `data-ver-perfil="${usernameSeguro}"` : ''}
                        >
                            ${nombreSeguro}
                        </span>
                        <span class="foro-mensaje-tiempo">${escapeHtml(msg.tiempo)}</span>
                    </div>
                    <p class="foro-mensaje-texto">${escapeHtml(msg.mensaje)}</p>
                </div>
            </div>
        `;
  }).join('');
}

/**
 * Función principal que genera la vista del Foro
 */
function generateForoContent() {
  const mensajesHTML = generateMensajesHTML(foroState.mensajes);
  const isSuscrito = state.isSuscrito;

  return `
        <div class="foro-page-wrapper">
            
            <!-- Header -->
            <div class="foro-header">
                <div class="foro-header-content">
                    <button class="btn-back-to-home" onclick="navigateTo('home')">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                      <span>${(window.I18n && window.I18n.t) ? window.I18n.t('back.home') : 'Volver al inicio'}</span>
                    </button>
                    
                    <div class="header-details">
                        <div class="header-icon-wrapper">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                        </div>
                        <div>
                            <h1 class="header-main-title">${(window.I18n && window.I18n.t) ? window.I18n.t('module.foro.title') : 'Foro'}</h1>
                            <p class="header-info-text">${(window.I18n && window.I18n.t) ? window.I18n.t('module.foro.desc') : 'Conecta con otros usuarios y comparte experiencias'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido Principal -->
            <div class="foro-content-wrapper">
                
                <!-- Banner de Suscripción (Solo para no suscritos) -->
                ${!isSuscrito ? `
                   
                ` : ''}
                
                <!-- Card del Chat -->
                <div class="foro-chat-card">
                    
                    <!-- Título del Chat -->
                    <div class="foro-chat-header">
                        <svg class="chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                            <line x1="9" y1="9" x2="9.01" y2="9"/>
                            <line x1="15" y1="9" x2="15.01" y2="9"/>
                        </svg>
                        <h3 class="chat-title">${(window.I18n && window.I18n.t) ? window.I18n.t('forum.chat.title') || 'Chat General' : 'Chat General'}</h3>
                        ${!isSuscrito ? '<span class="badge-readonly">' + ((window.I18n && window.I18n.t) ? window.I18n.t('forum.readonly') || 'Solo lectura' : 'Solo lectura') + '</span>' : ''}
                    </div>

                    <!-- Lista de Mensajes -->
                    <div id="foro-mensajes-container" class="foro-mensajes-lista">
                        ${mensajesHTML}
                    </div>

                    <!-- Input para escribir -->
                    <div class="foro-input-section ${!isSuscrito ? 'disabled' : ''}">
                        ${isSuscrito ? `
                            <textarea 
                              id="foro-mensaje-input"
                              class="foro-textarea"
                              placeholder="${(window.I18n && window.I18n.t) ? window.I18n.t('forum.placeholder') || 'Escribe tu mensaje aquí...' : 'Escribe tu mensaje aquí...'}"
                              rows="3"
                            ></textarea>
                            <button 
                              class="btn btn-primary w-full"
                              onclick="handleForoActions('enviar')"
                            >
                              ${(window.I18n && window.I18n.t) ? window.I18n.t('forum.sendButton') || 'Enviar Mensaje' : 'Enviar Mensaje'}
                            </button>
                        ` : `
                            <div class="foro-input-bloqueado">
                                <svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                <div class="texto-bloqueado">
                                    <p class="titulo-bloqueado">${(window.I18n && window.I18n.t) ? window.I18n.t('forum.locked.title') || 'Envío de mensajes bloqueado' : 'Envío de mensajes bloqueado'}</p>
                                      <p class="descripcion-bloqueado">
                                        ${(window.I18n && window.I18n.t) ? window.I18n.t('forum.locked.desc') || 'Necesitas una suscripción activa para participar en el foro' : 'Necesitas una suscripción activa para participar en el foro'}
                                      </p>
                                </div>
                                    <button class="btn btn-primary" onclick="navigateTo('suscripciones')">
                                      ${(window.I18n && window.I18n.t) ? window.I18n.t('btn.subscribe') : 'Suscribirse'}
                                    </button>
                            </div>
                        `}
                    </div>
                </div>

                
            </div>
        </div>
    `;
}
// Exponer funciones globalmente
window.handleForoActions = handleForoActions;

// Clic en avatar o nombre de un mensaje del foro -> abrir perfil
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-ver-perfil]');
  if (el) handleForoActions('ver-perfil', el.dataset.verPerfil);
});
window.updateForoMessagesDOM = updateForoMessagesDOM;



// =============================================================================
// 6) PERFIL + SUSCRIPCIONES
// =============================================================================
/* ========================================================= */
/* Perfil de usuario                     */
/* ========================================================= */

/**
 * Función que inyecta el HTML de la nueva pantalla.
 * @param {string} screenName - Nombre de la pantalla a cargar.
 */

/**
 * Función auxiliar para actualizar las estadísticas en el DOM
 */
function actualizarEstadisticasDOM(stats) {
  // Actualizar estadísticas en la pestaña "Mi Perfil"
  const statValues = document.querySelectorAll('#tab-datos-personales .stat-value');
  if (statValues.length >= 2) {
    statValues[0].textContent = stats.testCompletados;
    statValues[1].textContent = stats.bloquesCompletados;
  }

  // Actualizar estadísticas en la pestaña "Estadísticas"
  const statCardValues = document.querySelectorAll('#tab-estadisticas .stat-card-value');
  if (statCardValues.length >= 4) {
    statCardValues[0].textContent = stats.testCompletados;
    // Usar boquesTotales si existe en el objeto stats (nuestra versión procesada) 
    // o calcularlo si viene crudo del backend
    const total = stats.bloquesTotales || (state.isSuscrito ? (stats.totalBloquesSistema || 12) : (stats.totalBloquesUsuario || 0));
    statCardValues[1].textContent = `${stats.bloquesCompletados}/${total}`;
    statCardValues[2].textContent = stats.mensajesForo;
    statCardValues[3].textContent = `${stats.porcentajeGlobal}%`;
  }

  // Actualizar barra de progreso
  const progressFill = document.querySelector('#tab-estadisticas .progress-fill');
  const progressBadge = document.querySelector('#tab-estadisticas .progress-header .badge');
  if (progressFill) {
    progressFill.style.width = `${stats.porcentajeGlobal}%`;
  }
  if (progressBadge) {
    progressBadge.textContent = `${stats.porcentajeGlobal}%`;
  }

  // Actualizar banner de suscripción (texto dinámico de bloques)
  const suscripcionDetalles = document.querySelector('.suscripcion-detalles');
  if (suscripcionDetalles && !state.isSuscrito) {
    // Solo actualizamos para no suscritos que usan bloquesDesbloqueados dinámicos
    const bloquesDesbloqueados = stats.bloquesDesbloqueados || 0;
    // Nota: Si hay I18n esto sobrescribirá el texto traducido statico si no se maneja
    suscripcionDetalles.textContent = `${bloquesDesbloqueados} bloques personalizados disponibles`;
  }
}

function renderPerfilUsuario() {
  // CAMBIA ESTO A true PARA PROBAR EL ESTADO SUSCRITO
  const isSuscrito = state.isSuscrito || false;

  // Estado inicial
  let isEditing = false;
  let currentTab = 'datos-personales';

  // =============================================================================
  // INSERTAR DATOS DEL USUARIO
  // =============================================================================

  // Si hubo un error cargando el perfil previamente
  if (state.profileLoadError) {
    return `
      <div class="error-container" style="text-align: center; padding: 4rem 2rem;">
        <div class="error-icon" style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <h2 data-i18n="profile.load_error_title">No se pudo cargar el perfil</h2>
        <p data-i18n="profile.load_error_desc" style="color: #666; margin-bottom: 2rem;">${state.profileLoadError}</p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button class="btn primary" onclick="state.profileLoadError = null; renderCurrentScreen();" data-i18n="profile.retry">Reintentar</button>
          <button class="btn outline" onclick="AuthAPI.logout().then(() => window.location.href = '../index.html')" data-i18n="profile.logout">Cerrar sesión</button>
        </div>
      </div>
    `;
  }

  // Si no tenemos datos del usuario, los pedimos y mostramos carga
  if (!state.currentUser) {
    // Si ya hay un proceso de carga en marcha o falló, no reintentar automáticamente aquí
    // para evitar bucles. Debería ser manejado por dynamic-loader o el botón Reintentar.
    if (!state.isFetchingProfile) {
      state.isFetchingProfile = true;
      PerfilAPI.getPerfil()
        .then(response => {
          state.isFetchingProfile = false;
          if (response.success) {
            state.currentUser = response.perfil;
            state.profileLoadError = null;
            if (response.isSuscrito !== undefined) {
              state.isSuscrito = response.isSuscrito;
            }
            renderCurrentScreen(); // Recargar pantalla con datos
          } else {
            console.error("Error cargando perfil:", response.message);
            state.profileLoadError = response.message || "Error desconocido";
            renderCurrentScreen(); // Mostrar estado de error
          }
        })
        .catch(err => {
          state.isFetchingProfile = false;
          console.error(err);
          state.profileLoadError = "Error de conexión";
          renderCurrentScreen();
        });
    }

    return '<div class="loading-container"><div class="spinner"></div><p data-i18n="profile.loading">Cargando perfil...</p></div>';
  }

  let datosUsuario = {
    nombre: state.currentUser.nombre || 'Usuario',
    username: state.currentUser.username || 'user',
    email: state.currentUser.email || '',
    url_imagen: fixImagePath(state.currentUser.url_imagen) || null // Añadir url_imagen (corregida)
  };

  let datosTemporales = { ...datosUsuario };

  // =============================================================================
  // INSERTAR ESTADISTICAS DEL USUARIO
  // =============================================================================

  // Datos por defecto (se actualizarán con datos reales desde la BD)
  let estadisticas = {
    testCompletados: 0,
    bloquesCompletados: 0,
    mensajesForo: 0,
    porcentajeGlobal: 0,
    bloquesTotales: 0,
  };

  // Optimización: Usar datos precargados si existen (dynamic-loader)
  if (window.estadisticasActuales) {
    const stats = window.estadisticasActuales;
    estadisticas = {
      testCompletados: stats.testCompletados || 0,
      bloquesCompletados: stats.bloquesCompletados || 0,
      mensajesForo: stats.mensajesForo || 0,
      porcentajeGlobal: stats.porcentajeGlobal || 0,
      // Usar totales del backend si existen, sino fallback a lógica anterior
      bloquesTotales: state.isSuscrito
        ? (stats.totalBloquesSistema || state.bloques.length || 12)
        : (stats.totalBloquesUsuario || stats.bloquesDesbloqueados || 0)
    };
  } else {
    // Si no hay estadisticasActuales, usamos lo que tengamos en state.bloques como fallback temporal
    estadisticas.bloquesTotales = state.bloques.length || 0;
  }

  // Cargar estadísticas reales desde la base de datos (por si no estaban precargadas o para refrescar)
  PerfilAPI.getEstadisticas()
    .then(response => {
      if (response.success && response.estadisticas) {
        const stats = response.estadisticas;
        // Calcular totales backend
        const totalBackend = state.isSuscrito
          ? (stats.totalBloquesSistema || state.bloques.length || 12)
          : (stats.totalBloquesUsuario || stats.bloquesDesbloqueados || 0);

        estadisticas = {
          testCompletados: stats.testCompletados || 0,
          bloquesCompletados: stats.bloquesCompletados || 0,
          mensajesForo: stats.mensajesForo || 0,
          porcentajeGlobal: stats.porcentajeGlobal || 0,
          bloquesTotales: totalBackend,
        };

        // Actualizar UI con nuevos valores
        actualizarEstadisticasDOM(estadisticas);

        // Guardar para uso futuro en esta sesión
        window.estadisticasActuales = stats;
      }
    })
    .catch(err => console.error("Error cargando estadísticas frescas:", err));

  // Actualizar el DOM con las estadísticas reales
  actualizarEstadisticasDOM(estadisticas);


  // =============================================================================
  // INSERTAR DATOS DE LA SUSCRIPCION QUE TIENE CONTRATADA EL USUARIO (SUSCRITO)
  // =============================================================================
  // Datos por defecto (se actualizarán con datos reales si hay suscripción)
  let datosSuscripcion = {
    plan: 'Plan de 3 Meses Premium',
    precio: '9,99€',
    fechaInicio: 'Cargando...',
    proximaFacturacion: 'Cargando...',
    metodoPago: '•••• •••• •••• 4242',
    tipoTarjeta: 'Visa',
    expiracion: '12/26'
  };

  // Si el usuario está suscrito, cargar datos reales de suscripción
  if (isSuscrito) {
    PerfilAPI.getSuscripcion()
      .then(response => {
        if (response.success && response.suscripcion) {
          const subs = response.suscripcion;
          datosSuscripcion = {
            plan: subs.plan || 'Plan Premium',
            precio: subs.precio ? `${subs.precio}€` : '9,99€',
            fechaInicio: subs.fechaInicio || 'No disponible',
            proximaFacturacion: subs.fechaFin || 'No disponible',
            metodoPago: '•••• •••• •••• 4242',
            tipoTarjeta: 'Visa',
            expiracion: '12/26'
          };

          // Actualizar el DOM con los datos reales
          // Primer detail-box: "Tu suscripción termina" (fechaFin)
          // Segundo detail-box: "Iniciaste tu periodo de suscripción" (fechaInicio)
          const detailBoxes = document.querySelectorAll('#tab-suscripcion .detail-box .detail-value');

          if (detailBoxes.length >= 2) {
            detailBoxes[0].textContent = datosSuscripcion.proximaFacturacion; // Fecha fin (termina)
            detailBoxes[1].textContent = datosSuscripcion.fechaInicio; // Fecha inicio
          }


        }
      })
      .catch(err => console.error('Error cargando suscripción:', err));
  }

  const content = `
    <div class="perfil-container">
      <!-- Header -->
      <div class="perfil-header">
        <div class="perfil-header-content">
          <button class="btn-back" onclick="navigateTo('home')">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            ${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.backBtn') : 'Volver al Inicio'}
          </button>
          <div class="perfil-header-info">
            <div class="perfil-header-icon">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <h1 class="perfil-title">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.title') : 'Mi Perfil'}</h1>
              <p class="perfil-subtitle">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.subtitle') : 'Gestiona tu información personal y configuración'}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido Principal -->
      <div class="perfil-content">
        <!-- Banner de Suscripción -->
        <div class="suscripcion-banner ${isSuscrito ? 'suscrito' : 'no-suscrito'}">
          <div class="suscripcion-info">
            <div class="suscripcion-icon">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${isSuscrito
      ? '<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>'
      : '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
    }
              </svg>
            </div>
            <div>
              <p class="suscripcion-estado">${isSuscrito ? ((window.I18n && window.I18n.t) ? window.I18n.t('perfil.suscripcion.activa') : 'Suscripción Activa - Plan Premium') : ((window.I18n && window.I18n.t) ? window.I18n.t('perfil.suscripcion.inactiva') : 'Plan Gratuito - Acceso Limitado')}</p>
              <p class="suscripcion-detalles">${isSuscrito ? `Acceso completo a ${estadisticas.bloquesTotales} bloques` : ((window.I18n && window.I18n.t) ? window.I18n.t('perfil.suscripcion.detalles.inactiva') : `${estadisticas.bloquesTotales} bloques personalizados disponibles`)}</p>
            </div>
          </div>
          ${isSuscrito
      ? '<span class="badge badge-premium">' + ((window.I18n && window.I18n.t) ? window.I18n.t('perfil.badge.premium') : 'Premium') + '</span>'
      : '<button class="btn-mejorar" onclick="navigateTo(\'suscripciones\')">' + ((window.I18n && window.I18n.t) ? window.I18n.t('perfil.btn.mejorar') : 'Mejorar Plan') + '</button>'
    }
        </div>

        <!-- Tabs -->
        <div class="tabs-container">
          <div class="tabs-list">
            <button class="tab-trigger ${currentTab === 'datos-personales' ? 'active' : ''}" onclick="switchTab('datos-personales')">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.tab.datos') : 'Mi Perfil'}</span>
            </button>
            <button class="tab-trigger ${currentTab === 'estadisticas' ? 'active' : ''}" onclick="switchTab('estadisticas')">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 20V10M12 20V4M6 20v-6"/>
              </svg>
              <span>${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.tab.estadisticas') : 'Estadísticas'}</span>
            </button>
            <button class="tab-trigger ${currentTab === 'suscripcion' ? 'active' : ''}" onclick="switchTab('suscripcion')">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              <span>${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.tab.suscripcion') : 'Suscripción'}</span>
            </button>
          </div>

          <!-- Tab Content: Datos Personales -->
          <div id="tab-datos-personales" class="tab-content ${currentTab === 'datos-personales' ? 'active' : ''}">
            <div class="perfil-card">
              <!-- Foto y Stats -->
              <div class="perfil-avatar-section">
                <div class="perfil-avatar-wrapper">
                  <div class="perfil-avatar" style="${datosUsuario.url_imagen ? `background-image: url('${datosUsuario.url_imagen}'); background-size: cover; background-position: center; color: transparent;` : ''}">
                    ${!datosUsuario.url_imagen ? datosUsuario.nombre.charAt(0) : ''}
                  </div>
                  <!-- Input oculto para subir imagen -->
                  <input type="file" id="file-upload-input" accept="image/png, image/jpeg, image/gif, image/webp" style="display: none;" onchange="handleImageUpload(this)">
                  
                  <button class="btn-camera" type="button" onclick="(function(){ const el = document.getElementById('file-upload-input'); if(el) el.click(); else console.error('Input not found'); })()">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </button>
                </div>
                
                <h2 class="perfil-nombre">${escapeHtml(datosUsuario.nombre)}</h2>
                <p class="perfil-username">${escapeHtml(datosUsuario.username)}</p>
                
                <div class="perfil-stats">
                  <div class="stat-item">
                    <div class="stat-value">${estadisticas.testCompletados}</div>
                    <p class="stat-label">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.stats.tests') : 'Tests'}</p>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">${estadisticas.bloquesCompletados}</div>
                    <p class="stat-label">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.stats.bloques') : 'Bloques'}</p>
                  </div>
                </div>
              </div>

              <div class="separator"></div>

              <!-- Información Personal -->
              <div class="info-personal-header">
                <h3>${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.info.header') : 'Información Personal'}</h3>
                <button id="btn-editar-perfil" class="btn-pill-outline" onclick="window.toggleEditMode()">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  ${(window.I18n && window.I18n.t) ? window.I18n.t('Editar perfil') : 'Editar Perfil'}
                </button>
              </div>

              <!-- Vista Normal -->
              <div id="vista-normal" class="info-personal-grid">
                <div class="info-column">
                  <div class="info-item">
                    <svg class="icon icon-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <div>
                      <p class="info-label">Nombre</p>
                      <p class="info-value">${escapeHtml(datosUsuario.nombre)}</p>
                    </div>
                  </div>
                  <div class="info-item">
                    <svg class="icon icon-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <div>
                      <p class="info-label">Username</p>
                      <p class="info-value">${escapeHtml(datosUsuario.username)}</p>
                    </div>
                  </div>
                  <div class="info-item">
                    <svg class="icon icon-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <div>
                      <p class="info-label">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.label.email') : 'Email'}</p>
                      <p class="info-value">${escapeHtml(datosUsuario.email)}</p>
                    </div>
                  </div>
                </div>
                 <div class="info-column"> 
                   <div class="info-item">
                    <svg class="icon icon-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <div>
                      <p class="info-label">Teléfono (opcional)</p>
                      <p class="info-value">${escapeHtml(state.currentUser.telefono || 'No especificado')}</p>
                    </div>
                  </div>
                  <div class="info-item clickable" onclick="window.openPasswordModal()">
                     <svg class="icon icon-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <div>
                      <p class="info-label">Contraseña</p>
                      <p class="info-value">••••••••</p>
                      <small style="color: var(--primary); font-size: 0.8rem; cursor: pointer;">Cambiar Contraseña</small>
                    </div>
                  </div>
                </div>
              </div>

               <!-- Vista Edición -->
              <div id="vista-edicion" class="perfil-edit-form" style="display: none;">
                 <div class="form-row">
                    <div class="form-group">
                        <label>Nombre de Usuario</label>
                        <input type="text" id="edit-nombre" class="form-input" value="${escapeHtml(datosUsuario.nombre)}">
                    </div>
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" id="edit-username" class="form-input" value="${escapeHtml(datosUsuario.username)}">
                    </div>
                    <div class="form-group">
                        <label>Teléfono (opcional)</label>
                        <input type="tel" id="edit-telefono" class="form-input" value="${escapeHtml(state.currentUser.telefono || '')}" placeholder="+34 600 000 000">
                    </div>
                 </div>


              </div>
            </div>
          </div>

          <!-- Tab Content: Estadísticas - GRID DE 4 COLUMNAS -->
          <div id="tab-estadisticas" class="tab-content ${currentTab === 'estadisticas' ? 'active' : ''}" style="display: none;">
            <div class="perfil-card card-estadisticas">
              <div class="card-header-flex">
                <h3 class="text-primary">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.estadisticas.title') : 'Mis Estadísticas'}</h3>
              </div>

              <div class="stats-grid-4">
                <div class="stat-card">
                  <svg class="icon icon-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 20V10M12 20V4M6 20v-6"/>
                  </svg>
                  <div class="stat-card-value">${estadisticas.testCompletados}</div>
                  <p class="stat-card-label">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.estadisticas.tests') : 'Tests'}</p>
                </div>

                <div class="stat-card">
                  <svg class="icon icon-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                  <div class="stat-card-value">${estadisticas.bloquesCompletados}/${estadisticas.bloquesTotales}</div>
                  <p class="stat-card-label">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.estadisticas.bloques') : 'Bloques'}</p>
                </div>

                <div class="stat-card">
                  <svg class="icon icon-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <div class="stat-card-value">${estadisticas.mensajesForo}</div>
                  <p class="stat-card-label">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.estadisticas.mensajes') : 'Mensajes'}</p>
                </div>

                <div class="stat-card">
                  <svg class="icon icon-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <div class="stat-card-value">${estadisticas.porcentajeGlobal}%</div>
                  <p class="stat-card-label">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.estadisticas.aciertos') : 'Aciertos'}</p>
                </div>
              </div>

              <div class="progress-section">
                <div class="progress-header">
                  <span>${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.progreso') : 'Progreso General'}</span>
                  <span class="badge badge-primary">${estadisticas.porcentajeGlobal}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${estadisticas.porcentajeGlobal}%"></div>
                </div>
              </div>
            </div>

            <!-- Actividad Reciente -->
            <div class="perfil-card mt-6">
              <h3 class="text-primary mb-4">Consejos</h3>
              <div class="actividad-list">
                <div class="actividad-item">
                  <div class="actividad-dot"></div>
                  <div class="actividad-content">
                    <p class="actividad-text">Revisa los fallos al terminar cada bloque</p>
                  </div>
                </div>
                <div class="actividad-item">
                  <div class="actividad-dot opacity-60"></div>
                  <div class="actividad-content">
                    <p class="actividad-text">Pregunta tus dudas en el foro</p>
                  </div>
                </div>
                <div class="actividad-item">
                  <div class="actividad-dot opacity-40"></div>
                  <div class="actividad-content">
                    <p class="actividad-text">Los ejercicios son útiles pero la teoría es básica</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab Content: Suscripción (SIN HISTORIAL DE PAGOS) -->
          <div id="tab-suscripcion" class="tab-content ${currentTab === 'suscripcion' ? 'active' : ''}" style="display: none;">
            <div class="perfil-card">
              <div class="card-title-with-icon">
                <svg class="icon icon-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <h3 class="text-primary">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.suscripcion.title') : 'Detalles de suscripción'}</h3>
              </div>

              ${isSuscrito ? `
                
                <!-- Plan Actual con opción de Cancelar -->
                <div class="suscripcion-details">
                  <div class="detail-box detail-active">
                    <div class="detail-header-with-action">
                      <div>
                        <div class="detail-header">
                          <span class="text-primary font-semibold">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.suscripcion.activa') : 'Suscripción Activa'}</span>
                          <span class="badge badge-primary">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.suscripcion.badge') : 'Activo'}</span>
                        </div>
                        <p class="detail-subtitle">${datosSuscripcion.plan}</p>
                      </div>
                      <button class="btn-cancelar-inline" onclick="confirmarCancelacion()">
                        <svg class="icon icon-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="15" y1="9" x2="9" y2="15"/>
                          <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                        ${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.suscripcion.cancelbtn') : 'Cancelar'}
                      </button>
                    </div>
                </div>
                
                  <!-- Información de Pago -->
                  

                  <div class="detail-box detail-active" style="margin-bottom: 1rem;">
                    <p class="detail-label">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.suscripcion.termina') : 'Tu suscripción termina:'}</p>
                    <p class="detail-value">${datosSuscripcion.proximaFacturacion}</p>
                  </div>

                  <div class="detail-box detail-active">
                    <p class="detail-label">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.suscripcion.iniciou') : 'Iniciaste tu periodo de suscripción:'}</p>
                    <p class="detail-value">${datosSuscripcion.fechaInicio}</p>
                  </div>

                  
                </div>
              ` : `
                <div class="no-suscripcion">
                  <svg class="icon-large icon-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p class="no-suscripcion-title">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.suscripcion.noactive.title') : 'No tienes una suscripción activa'}</p>
                  <p class="no-suscripcion-text">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.suscripcion.noactive.text') : 'Suscríbete para acceder a todo el contenido premium'}</p>
                  <button class="btn-primary-full" onclick="navigateTo('suscripciones')">
                    ${(window.I18n && window.I18n.t) ? window.I18n.t('subscription.banner.cta') : 'Ver Planes de Suscripción'}
                  </button>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación (inicialmente oculto) -->
    <div id="modal-cancelar" class="modal" style="display: none;">
      <div class="modal-overlay" onclick="cerrarModal()"></div>
      <div class="modal-content">
        <h3 class="modal-title">¿Estás completamente seguro?</h3>
        <p class="modal-description">
          Esta acción cancelará tu suscripción premium. Perderás el acceso a todos los bloques y contenido exclusivo. 
          Solo mantendrás acceso al plan personalizado básico.
        </p>
        <div class="modal-actions">
          <button class="btn-outline" onclick="cerrarModal()">No, mantener mi suscripción</button>
          <button class="btn-danger" onclick="cancelarSuscripcion()">Sí, cancelar definitivamente</button>
        </div>
      </div>
    </div>
  `;
  return content;
}

// Función para cambiar de tab en Estadísticas
window.switchEstadisticasTab = function (tabName) {
  // Remover clase active de todos los botónes
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Remover clase active de todos los paneles
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  // Añadir clase active al botón clickeado
  const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  // Añadir clase active al panel correspondiente
  const activePanel = document.getElementById(`tab-${tabName}`);
  if (activePanel) activePanel.classList.add('active');
};

// Funciones globales para el perfil de usuario
window.switchTab = function (tab) {
  // Actualizar tabs activos
  document.querySelectorAll('.tab-trigger').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.remove('active');
    c.style.display = 'none';
  });

  // Activar el tab seleccionado
  const tabButtons = document.querySelectorAll('.tab-trigger');
  const tabContents = document.querySelectorAll('.tab-content');

  if (tab === 'datos-personales') {
    if (tabButtons[0]) tabButtons[0].classList.add('active');
    if (tabContents[0]) {
      tabContents[0].classList.add('active');
      tabContents[0].style.display = 'block';
    }
  } else if (tab === 'estadisticas') {
    if (tabButtons[1]) tabButtons[1].classList.add('active');
    if (tabContents[1]) {
      tabContents[1].classList.add('active');
      tabContents[1].style.display = 'block';
    }
  } else if (tab === 'suscripcion') {
    if (tabButtons[2]) tabButtons[2].classList.add('active');
    if (tabContents[2]) {
      tabContents[2].classList.add('active');
      tabContents[2].style.display = 'block';
    }
  }
};

window.toggleEditMode = function () {
  const vistaNormal = document.getElementById('vista-normal');
  const vistaEdicion = document.getElementById('vista-edicion');
  const btnEditar = document.getElementById('btn-editar-perfil');


  if (vistaNormal && vistaEdicion && btnEditar) {
    if (vistaNormal.style.display === 'none') {
      // Estamos en modo edición, así que el botón actúa como GUARDAR
      window.saveProfileChanges();
    } else {
      // Activar modo edición
      vistaNormal.style.display = 'none';
      vistaEdicion.style.display = 'block';

      // Cambiar botón a Estado "Guardar"
      btnEditar.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        ${(window.I18n && window.I18n.t) ? window.I18n.t('Guardar') : 'Guardar'}
      `;
    }
  }
};

window.confirmarCancelacion = function () {
  const modal = document.getElementById('modal-cancelar');
  if (modal) {
    modal.style.display = 'flex';
  }
};

window.cerrarModal = function () {
  const modal = document.getElementById('modal-cancelar');
  if (modal) {
    modal.style.display = 'none';
  }
};

window.cancelarSuscripcion = async function () {
  try {
    const response = await PerfilAPI.cancelarSuscripcion();

    if (response.success) {
      alert((window.I18n && window.I18n.t) ? window.I18n.t('perfil.suscripcion.cancelled') : 'Suscripción cancelada correctamente.');

      // Actualizar estado global
      state.isSuscrito = false;

      // Cerrar modal
      cerrarModal();

      // Recargar perfil para actualizar vista
      renderCurrentScreen();
    } else {
      alert(response.message || 'Error al cancelar la suscripción');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión al cancelar la suscripción');
  }
};

async function renderSuscripciones() {
  let planSeleccionado = null;
  let planSeleccionadoData = null;
  let mostrarPago = false;
  let planesDisponibles = [];

  // Cargar planes desde la base de datos
  try {
    const response = await PlanesAPI.getPlanes();
    if (response && response.success && response.planes) {
      planesDisponibles = response.planes;
    }
  } catch (error) {
    console.error('Error al cargar planes de suscripción:', error);
  }

  // Función auxiliar para formatear el precio
  const formatearPrecio = (precio) => {
    return parseFloat(precio).toFixed(2).replace('.', ',') + '€';
  };

  // Función auxiliar para obtener el período basado en duración
  const obtenerPeriodo = (duracionDias) => {
    if (duracionDias <= 7) {
      return (window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.perWeek') : 'por semana';
    } else if (duracionDias <= 31) {
      return (window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.perMonth') : 'por mes';
    } else if (duracionDias <= 93) {
      return (window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.per3Months') : 'por tres meses';
    } else if (duracionDias <= 186) {
      return (window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.per6Months') : 'por seis meses';
    } else {
      return (window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.perYear') : 'por año';
    }
  };

  // Función auxiliar para determinar tipo de plan
  const obtenerTipoPlan = (index, total) => {
    if (index === 0 || total === 1) {
      return {
        badge: (window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.basic') : 'Plan Básico',
        badgeClass: 'basico'
      };
    } else {
      return {
        badge: (window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.premium') : 'Plan Premium',
        badgeClass: 'premium'
      };
    }
  };

  // Generar HTML para un plan
  const generarPlanCard = (plan, index) => {
    const tipoPlan = obtenerTipoPlan(index, planesDisponibles.length);
    const isSelected = planSeleccionado === plan.idPlan;
    const mostrarBadgeAhorro = index > 0; // Mostrar badge de ahorro para planes premium

    return `
      <div class="plan-card ${isSelected ? 'selected' : ''}" onclick="seleccionarPlan(${plan.idPlan})">
        ${mostrarBadgeAhorro ? `<span class="badge-ahorro">${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.savings') : 'Mejor Valor'}</span>` : ''}
        
        <div class="plan-header">
          <span class="plan-badge ${tipoPlan.badgeClass}">${tipoPlan.badge}</span>
          <h3 class="plan-nombre">${plan.nombre}</h3>
          <div class="plan-precio">${formatearPrecio(plan.precio)}</div>
          <p class="plan-periodo">${obtenerPeriodo(plan.duracion_dias)}</p>
        </div>

        <div class="plan-features">
          <div class="feature-item">
            <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.feature.blocks') : 'Acceso a todos los bloques'}</span>
          </div>
          <div class="feature-item">
            <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.feature.tests') : 'Acceso a todos los tests'}</span>
          </div>
          <div class="feature-item">
            <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.feature.forum') : 'Participación en el foro'}</span>
          </div>
          ${plan.descripcion ? `
          <div class="feature-item">
            <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>${plan.descripcion}</span>
          </div>
          ` : `
          <div class="feature-item">
            <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.feature.basic') : 'Funciones básicas'}</span>
          </div>
          `}
        </div>

        <button class="btn-seleccionar ${isSelected ? 'selected' : ''}" onclick="event.stopPropagation(); seleccionarPlan(${plan.idPlan})">
          ${isSelected ? ((window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.selectedBtn') : 'Plan Seleccionado') : ((window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.selectBtn') : 'Seleccionar Plan')}
        </button>
      </div>
    `;
  };

  const generarContenido = () => {
    if (!mostrarPago) {
      // Vista de selección de planes
      return `
        <div class="suscripciones-container">
          <!-- Header -->
          <div class="suscripciones-header">
            <button class="btn-volver" onclick="navigateTo('home')">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              ${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.backBtn') : 'Volver al inicio'}
            </button>
            <h1 class="suscripciones-title">${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.title') : 'Planes de Suscripción'}</h1>
            <p class="suscripciones-subtitle">${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.subtitle') : 'Elige el plan que mejor se adapte a tus necesidades'}</p>
          </div>

          <!-- Planes -->
          <div class="planes-grid">
            ${planesDisponibles.length > 0
          ? planesDisponibles.map((plan, index) => generarPlanCard(plan, index)).join('')
          : `<p class="no-planes">${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.noPlanes') : 'No hay planes disponibles en este momento'}</p>`
        }
          </div>

          ${planSeleccionado ? `
            <div class="continuar-pago-container">
              <button class="btn-continuar-pago" onclick="mostrarFormularioPago()">
                ${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.continueBtn') : 'Continuar al Pago'}
              </button>
            </div>
          ` : ''}
        </div>
      `;
    } else {
      // Vista de formulario de pago
      return `
        <div class="suscripciones-container">
          <div class="pago-card">
            <div class="pago-header">
              <svg class="icon-large" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              <h3>${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.payment.title') : 'Completar Pago'}</h3>
            </div>

            <div class="plan-seleccionado-box">
              <div class="plan-info">
                <p class="plan-label">${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.payment.selected') : 'Plan Seleccionado:'} <strong>${planSeleccionadoData ? planSeleccionadoData.nombre : ''}</strong></p>
                <p class="plan-price-small">${planSeleccionadoData ? formatearPrecio(planSeleccionadoData.precio) : ''}</p>
              </div>
              <button class="btn-cambiar" onclick="volverAPlanes()">${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.payment.change') : 'Cambiar'}</button>
            </div>

            <form class="pago-form" onsubmit="procesarPago(event)">
              <div class="form-group">
                <label for="numero-tarjeta">${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.payment.cardNumber') : 'Número de Tarjeta'}</label>
                <input type="text" id="numero-tarjeta" placeholder="1234 5678 9012 3456" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="fecha-exp">${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.payment.expiration') : 'Fecha de Expiración'}</label>
                  <input type="text" id="fecha-exp" placeholder="MM/AA" required>
                </div>
                <div class="form-group">
                  <label for="cvv">${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.payment.cvv') : 'CVV'}</label>
                  <input type="password" id="cvv" placeholder="123" maxlength="3" required>
                </div>
              </div>

              <div class="form-group">
                <label for="titular">${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.payment.holder') : 'Nombre del Titular'}</label>
                <input type="text" id="titular" placeholder="Nombre como aparece en la tarjeta" required>
              </div>

              <div class="form-group">
                <label for="pais">${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.payment.country') : 'País'}</label>
                <select id="pais" required style="width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; background-color: white;">
                  <option value="">Selecciona un país</option>

                    <!-- Países de habla hispana -->
                    <option value="ES">España</option>
                    <option value="MX">México</option>
                    <option value="AR">Argentina</option>
                    <option value="CO">Colombia</option>
                    <option value="PE">Perú</option>
                    <option value="VE">Venezuela</option>
                    <option value="CL">Chile</option>
                    <option value="EC">Ecuador</option>
                    <option value="GT">Guatemala</option>
                    <option value="CU">Cuba</option>
                    <option value="BO">Bolivia</option>
                    <option value="DO">República Dominicana</option>
                    <option value="HN">Honduras</option>
                    <option value="PY">Paraguay</option>
                    <option value="SV">El Salvador</option>
                    <option value="NI">Nicaragua</option>
                    <option value="CR">Costa Rica</option>
                    <option value="PA">Panamá</option>
                    <option value="UY">Uruguay</option>
                    <option value="GQ">Guinea Ecuatorial</option>

                    <!-- Países de habla inglesa -->
                    <option value="US">Estados Unidos</option>
                    <option value="GB">Reino Unido</option>
                    <option value="CA">Canadá</option>
                    <option value="AU">Australia</option>
                    <option value="NZ">Nueva Zelanda</option>
                    <option value="IE">Irlanda</option>
                    <option value="ZA">Sudáfrica</option>
                    <option value="JM">Jamaica</option>
                    <option value="TT">Trinidad y Tobago</option>
                    <option value="BS">Bahamas</option>
                    <option value="BB">Barbados</option>
                    <option value="BZ">Belice</option>
                    <option value="GY">Guyana</option>
                    <option value="GD">Granada</option>
                    <option value="AG">Antigua y Barbuda</option>
                    <option value="LC">Santa Lucía</option>
                    <option value="VC">San Vicente y las Granadinas</option>
                    <option value="KN">San Cristóbal y Nieves</option>
                    <option value="DM">Dominica</option>

                    <!-- Países de habla portuguesa -->
                    <option value="BR">Brasil</option>
                    <option value="PT">Portugal</option>
                    <option value="AO">Angola</option>
                    <option value="MZ">Mozambique</option>
                    <option value="GW">Guinea-Bisáu</option>
                    <option value="TL">Timor Oriental</option>
                    <option value="CV">Cabo Verde</option>
                    <option value="ST">Santo Tomé y Príncipe</option>

                    <!-- Otros países europeos importantes -->
                    <option value="FR">Francia</option>
                    <option value="IT">Italia</option>
                    <option value="DE">Alemania</option>
                </select>
              </div>

              <div class="pago-buttons">
                <button type="button" class="btn-outline-pago" onclick="volverAPlanes()">${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.payment.back') : 'Volver'}</button>
                <button type="submit" class="btn-procesar-pago">${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.payment.process') : 'Procesar Pago'}</button>
              </div>

              <p class="pago-disclaimer">
                ${(window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.payment.disclaimer') : 'Al procesar el pago, aceptas nuestros términos y condiciones'}
              </p>
            </form>
          </div>
        </div>
      `;
    }
  };

  // Funciones globales para manejar la interacción
  window.seleccionarPlan = function (idPlan) {
    planSeleccionado = idPlan;
    planSeleccionadoData = planesDisponibles.find(p => p.idPlan == idPlan);
    // Re-renderizar la página
    appContainer.innerHTML = generarContenido();
  };

  window.mostrarFormularioPago = function () {
    mostrarPago = true;
    // Re-renderizar la página
    appContainer.innerHTML = generarContenido();
  };

  window.volverAPlanes = function () {
    mostrarPago = false;
    // Re-renderizar la página
    appContainer.innerHTML = generarContenido();
  };

  window.procesarPago = function (event) {
    event.preventDefault();

    // Validaciones
    const numTarjeta = document.getElementById('numero-tarjeta').value.replace(/\s/g, '');
    const fechaExp = document.getElementById('fecha-exp').value;
    const cvv = document.getElementById('cvv').value;
    const pais = document.getElementById('pais').value;

    // 1. Validar Tarjeta (16 dígitos)
    if (!/^\d{16}$/.test(numTarjeta)) {
      alert((window.I18n && window.I18n.t) ? window.I18n.t('validation.card.length') : 'El número de tarjeta debe tener exactamente 16 dígitos.');
      return;
    }

    // 2. Validar CVV (3 dígitos)
    if (!/^\d{3}$/.test(cvv)) {
      alert((window.I18n && window.I18n.t) ? window.I18n.t('validation.cvv.length') : 'El CVV debe tener exactamente 3 dígitos.');
      return;
    }

    // 3. Validar Fecha Expiración (No anterior a la actual)
    const [mes, anio] = fechaExp.split('/').map(num => parseInt(num.trim()));
    if (!mes || !anio || mes < 1 || mes > 12) {
      alert((window.I18n && window.I18n.t) ? window.I18n.t('validation.date.format') : 'Formato de fecha inválido. Usa MM/AA.');
      return;
    }

    // Asumimos siglo 2000+
    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear() % 100; // Últimos 2 dígitos
    const mesActual = fechaActual.getMonth() + 1;

    if (anio < anioActual || (anio === anioActual && mes < mesActual)) {
      alert((window.I18n && window.I18n.t) ? window.I18n.t('validation.date.expired') : 'La tarjeta ha expirado.');
      return;
    }

    // 4. Validar País (Selección válida)
    if (!pais) {
      alert((window.I18n && window.I18n.t) ? window.I18n.t('validation.country.required') : 'Por favor selecciona un país válido.');
      return;
    }

    // Simular procesamiento de pago
    const btn = event.target.querySelector('.btn-procesar-pago');
    btn.textContent = 'Procesando...';
    btn.disabled = true;

    setTimeout(async () => {
      // Llamar al backend para registrar suscripción con el ID del plan
      try {
        const response = await PerfilAPI.subscribe(planSeleccionado);
        if (response && response.success) {
          // Actualizar estado de suscripción
          state.isSuscrito = true;

          // Mostrar mensaje de éxito
          alert((window.I18n && window.I18n.t) ? window.I18n.t('suscripciones.payment.success') : '¡Pago procesado con éxito! Bienvenido al plan premium.');

          // Navegar al perfil
          navigateTo('perfil');
        } else {
          alert('Error al registrar la suscripción. Por favor contacta con soporte.');
        }
      } catch (e) {
        console.error(e);
        alert('Error de conexión al procesar la suscripción.');
      }
    }, 1500);

  };

  // Al terminar de definir los handlers internos, devolver el HTML actual
  return generarContenido();
}


async function renderPerfilOtroUsuario(nombreUsuario) {
  // =============================================================================
  // INSERTAR DATOS DE LOS PERFILES DE OTROS USUARIOS DEL FORO 
  // =============================================================================

  // Datos por defecto mientras se cargan los reales
  let usuario = {
    nombre: nombreUsuario,
    username: nombreUsuario,
    fechaRegistro: 'Cargando...',
    mensajes: 0,
    testsCompletados: 0,
    bloquesCompletados: 0,
    porcentajeGlobal: 0,
  };

  // Cargar datos reales desde la base de datos
  try {
    const response = await PerfilAPI.getPerfilOtroUsuario(nombreUsuario);

    if (response.success && response.usuario && response.estadisticas) {
      const user = response.usuario;
      const stats = response.estadisticas;

      usuario = {
        nombre: user.nombre || nombreUsuario,
        username: user.username || nombreUsuario,
        fechaRegistro: user.fechaRegistro || 'No disponible',
        mensajes: stats.mensajesForo || 0,
        testsCompletados: stats.testCompletados || 0,
        bloquesCompletados: stats.bloquesCompletados || 0,
        porcentajeGlobal: stats.porcentajeGlobal || 0,
      };

      // Perfil de otro usuario cargado
    }
  } catch (err) {
    console.error('Error cargando perfil de otro usuario:', err);
  }

  // Calcular iniciales del nombre
  const iniciales = usuario.nombre.split(' ').map(n => n[0] || '').join('').substring(0, 2).toUpperCase();

  const content = `
    <div class="perfil-otro-container">
      <!-- Header -->
      <div class="perfil-otro-header">
        <button class="btn-volver" onclick="navigateTo('foro')">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          ${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.otro.backBtn') : 'Volver al Foro'}
        </button>
        <h1 class="perfil-otro-title">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.otro.title') : 'Perfil de Usuario'}</h1>
        <p class="perfil-otro-subtitle">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.otro.subtitle') : 'Información pública del usuario'}</p>
      </div>

      <!-- Información del Usuario -->
      <div class="perfil-otro-card">
        <div class="usuario-header">
          <div class="usuario-avatar">
            ${escapeHtml(iniciales)}
          </div>
          <div class="usuario-info">
            <h2 class="usuario-nombre">${escapeHtml(usuario.nombre)}</h2>
            <p class="usuario-rol">Usuario</p>
            <span class="usuario-badge">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.otro.memberSince') : 'Miembro desde'} ${escapeHtml(usuario.fechaRegistro)}</span>
          </div>
        </div>

          <div class="estadisticas-grid">
          <div class="stat-box-usuario">
            <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <div class="stat-value-usuario">${usuario.mensajes}</div>
            <p class="stat-label-usuario">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.otro.messages') : 'Mensajes'}</p>
          </div>

          <div class="stat-box-usuario">
            <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
            <div class="stat-value-usuario">${usuario.testsCompletados}</div>
            <p class="stat-label-usuario">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.otro.tests') : 'Tests Completados'}</p>
          </div>

          <div class="stat-box-usuario">
            <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
            </svg>
            <div class="stat-value-usuario">${usuario.bloquesCompletados}</div>
            <p class="stat-label-usuario">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.otro.blocks') : 'Bloques'}</p>
          </div>

          <div class="stat-box-usuario">
            <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <div class="stat-value-usuario">${usuario.porcentajeGlobal}%</div>
            <p class="stat-label-usuario">${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.otro.aciertos') : 'Aciertos'}</p>
          </div>
        </div>
      </div>

      

      

      <!-- botón volver -->
      <button class="btn-volver-full" onclick="navigateTo('foro')">
        ${(window.I18n && window.I18n.t) ? window.I18n.t('perfil.otro.backBtn') : 'Volver al Foro'}
      </button>
    </div>
  `;

  return content;
}


// =============================================================================
// 7) BLOQUES + TESTS
// =============================================================================

// =============================================================================
// INSERTAR CONTENIDO DE CADA BLOQUE INSERTADO ANTERIORMENTE:
// =============================================================================

// Para usuarios suscritos

const bloquesSuscrito = [
  {
    id: 1,
    nombre: 'Bloque 1',
    descripcion: 'Introducción y fundamentos',
    color: 'color-cyan',
    icon: 'BookOpen',
    totalTests: 5,
    completados: 3
  },
  {
    id: 2,
    nombre: 'Bloque 2',
    descripcion: 'Conceptos intermedios',
    color: 'color-violet',
    icon: 'FileText',
    totalTests: 6,
    completados: 2
  },
  {
    id: 3,
    nombre: 'Bloque 3',
    descripcion: 'Técnicas avanzadas',
    color: 'color-primary',
    icon: 'GraduationCap',
    totalTests: 7,
    completados: 0
  },
  {
    id: 4,
    nombre: 'Bloque 4',
    descripcion: 'Práctica especializada',
    color: 'color-amber',
    icon: 'Award',
    totalTests: 8,
    completados: 0
  }
];

// Para usuarios REGISTRADOS NO SUSCRITOS 

const bloquesPersonalizados = [
  {
    id: 1,
    nombre: 'Bloque Personalizado 1',
    descripcion: 'Contenido adaptado a tu nivel',
    color: 'color-cyan',
    icon: 'BookOpen',
    totalTests: 4,
    completados: 2
  },
  {
    id: 2,
    nombre: 'Bloque Personalizado 2',
    descripcion: 'Ejercicios básicos recomendados',
    color: 'color-violet',
    icon: 'FileText',
    totalTests: 4,
    completados: 1
  },
  {
    id: 3,
    nombre: 'Bloque Personalizado 3',
    descripcion: 'Práctica fundamental guiada',
    color: 'color-primary',
    icon: 'GraduationCap',
    totalTests: 3,
    completados: 0
  }
];

// Iconos SVG
const iconosSVG = {
  BookOpen: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  FileText: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  GraduationCap: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  Award: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  CheckCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  ChevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  Lock: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  ArrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`
};

/**
 * Función que genera el HTML de la Vista de Bloques (REDUNDANTE CON LA NUEVA LÓGICA DE ACTIVIDADES, PERO SE MANTIENE POR COMPATIBILIDAD)
 */
function renderVistaBloques(isSuscrito) {
  const bloques = state.bloques || [];

  const totalTests = bloques.reduce((acc, bloque) => acc + bloque.totalTests, 0);
  const totalCompletados = bloques.reduce((acc, bloque) => acc + bloque.completados, 0);
  const progresoGlobal = totalTests > 0 ? (totalCompletados / totalTests) * 100 : 0;

  const bloquesHTML = bloques.map(bloque => {
    const progreso = bloque.totalTests > 0
      ? (bloque.completados / bloque.totalTests) * 100
      : 0;

    let badgeHTML = '';
    if (bloque.completados === bloque.totalTests) {
      badgeHTML = `
  < span class="bloque-badge completado" >
    ${iconosSVG.CheckCircle}
Completado
        </span >
  `;
    } else if (bloque.completados > 0) {
      badgeHTML = `< span class="bloque-badge en-progreso" > En progreso</span > `;
    } else {
      badgeHTML = `< span class="bloque-badge no-iniciado" > No iniciado</span > `;
    }

    return `
  < div class="bloque-card-item" onclick = "handleSeleccionarBloque(${bloque.id})" >
    <div class="bloque-card-inner">
      <div class="bloque-icon-box ${bloque.color}">
        ${iconosSVG[bloque.icon]}
      </div>

      <div class="bloque-content-wrapper">
        <div class="bloque-header-row">
          <div>
            <h3 class="bloque-nombre">${bloque.nombre}</h3>
            <p class="bloque-descripcion">${bloque.descripcion}</p>
          </div>
        </div>

        <div class="bloque-progreso-section">
          <div class="bloque-progreso-header">
            <span class="bloque-progreso-text">${bloque.completados} de ${bloque.totalTests} tests</span>
            <span class="bloque-progreso-percent">${progreso.toFixed(0)}%</span>
          </div>
          <div class="bloque-progress-bar">
            <div class="bloque-progress-fill" style="width: ${progreso}%"></div>
          </div>
        </div>

        <div class="bloque-footer">
          ${badgeHTML}
          <a href="#" class="bloque-ver-tests-link" onclick="event.stopPropagation(); handleSeleccionarBloque(${bloque.id}); return false;">
            Ver tests
            ${iconosSVG.ChevronRight}
          </a>
        </div>
      </div>
    </div>
      </div >
  `;
  }).join('');

  const bannerSuscripcion = !isSuscrito ? `
  < div class="bloques-suscripcion-banner" >
    <div class="banner-flex">
      <div class="banner-icon">
        ${iconosSVG.Lock}
      </div>
      <div class="banner-text">
        <h4 class="banner-title">Desbloquea más contenido</h4>
        <p class="banner-description">
          Suscríbete para acceder a ${bloquesSuscrito.length} bloques con más de ${bloquesSuscrito.reduce((acc, b) => acc + b.totalTests, 0)} tests
        </p>
        <button class="btn btn-primary" onclick="navigateTo('suscripciones')">
          Ver Planes de Suscripción
        </button>
      </div>
    </div>
    </div >
  ` : '';

  return `
  < div class="vista-bloques-container" >
      <div class="vista-bloques-header">
        <div class="vista-bloques-header-content">
          <button class="btn-back-to-home" onclick="navigateTo('actividades')">
            ${iconosSVG.ArrowLeft}
            Volver a Actividades
          </button>
          <div class="vista-bloques-header-details">
            <div class="vista-bloques-header-icon">
              ${iconosSVG.GraduationCap}
            </div>
            <div>
              <h1 class="vista-bloques-header-title">
                ${isSuscrito ? 'Todos los Bloques' : 'Plan Personalizado'}
              </h1>
              <p class="vista-bloques-header-subtitle">
                Selecciona un bloque para acceder a sus tests
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="vista-bloques-content">
        <div class="progreso-global-card">
          <div class="progreso-header">
            <h3>Progreso Global</h3>
            <span class="progreso-badge">${totalCompletados} / ${totalTests} tests completados</span>
          </div>
          <div class="progress-bar-wrapper">
            <div class="progress-bar-inner" style="width: ${progresoGlobal}%"></div>
          </div>
          <p class="progreso-text">${progresoGlobal.toFixed(0)}% del contenido completado</p>
        </div>

        <h2 class="bloques-section-title">
          ${isSuscrito ? 'Bloques Disponibles (4)' : 'Bloques de tu Plan (3)'}
        </h2>

        <div class="bloques-cards-grid">
          ${bloquesHTML}
        </div>

        ${bannerSuscripcion}
      </div>
    </div >
  `;
}

/**
 * Handler para seleccionar un bloque
 */
function handleSeleccionarBloque(bloqueId) {
  resetTestsState();
  navigateTo('tests-bloque', bloqueId);
}

// ======================================
// VISTA DE TESTS DEL BLOQUE
// ======================================

// Estado de los tests
let testsState = {
  testActual: 1,
  respuestas: {},
  correctionResult: null
};

function resetTestsState() {
  testsState = {
    testActual: 1,
    respuestas: {},
    correctionResult: null // Store last correction result
  };
}

// =========================================================================================================================
// INSERTAR EJERCICIOS DE CADA BLOQUE INSERTADO ANTERIORMENTE (mirar id, insertar ejercicios en su bloque correspondientes):
// =========================================================================================================================

const testsData = {
  1: [
    {
      id: 1,
      nombre: 'Test 1: Introducción al inglés',
      descripcion: 'Conceptos básicos del idioma',
      preguntas: [
        {
          id: 1,
          pregunta: 'What is the correct form of the verb "to be" for "I"?',
          opciones: ['am', 'is', 'are', 'be']
        },
        {
          id: 2,
          pregunta: 'How do you say "hola" in English?',
          opciones: ['Goodbye', 'Hello', 'Thanks', 'Please']
        }
      ]
    },
    {
      id: 2,
      nombre: 'Test 2: Pronombres personales',
      descripcion: 'Uso de pronombres básicos',
      preguntas: [
        {
          id: 1,
          pregunta: 'Which pronoun is correct? "___ is a teacher"',
          opciones: ['He', 'They', 'We', 'I']
        }
      ]
    },
    {
      id: 3,
      nombre: 'Test 3: Artículos',
      descripcion: 'Artículos definidos e indefinidos',
      preguntas: []
    },
    {
      id: 4,
      nombre: 'Test 4: Números',
      descripcion: 'Números cardinales y ordinales',
      preguntas: []
    },
    {
      id: 5,
      nombre: 'Test 5: Colores y formas',
      descripcion: 'Vocabulario básico',
      preguntas: []
    }
  ],
  2: [
    { id: 1, nombre: 'Test 1: Presente simple', descripcion: 'Conjugación y uso', preguntas: [] },
    { id: 2, nombre: 'Test 2: Presente continuo', descripcion: 'Acciones en progreso', preguntas: [] },
    { id: 3, nombre: 'Test 3: Pasado simple', descripcion: 'Verbos regulares e irregulares', preguntas: [] },
    { id: 4, nombre: 'Test 4: Futuro', descripcion: 'Will y going to', preguntas: [] },
    { id: 5, nombre: 'Test 5: Preposiciones', descripcion: 'De tiempo y lugar', preguntas: [] },
    { id: 6, nombre: 'Test 6: Comparativos', descripcion: 'Adjetivos comparativos', preguntas: [] }
  ],
  3: [
    { id: 1, nombre: 'Test 1: Presente perfecto', descripcion: 'Usos y estructura', preguntas: [] },
    { id: 2, nombre: 'Test 2: Voz pasiva', descripcion: 'Transformación de oraciones', preguntas: [] },
    { id: 3, nombre: 'Test 3: Condicionales', descripcion: 'Tipos de condicionales', preguntas: [] },
    { id: 4, nombre: 'Test 4: Reported speech', descripcion: 'Estilo indirecto', preguntas: [] },
    { id: 5, nombre: 'Test 5: Modal verbs', descripcion: 'Verbos modales avanzados', preguntas: [] },
    { id: 6, nombre: 'Test 6: Phrasal verbs', descripcion: 'Verbos con preposición', preguntas: [] },
    { id: 7, nombre: 'Test 7: Conectores', descripcion: 'Cohesión textual', preguntas: [] }
  ],
  4: [
    { id: 1, nombre: 'Test 1: Business English', descripcion: 'Vocabulario profesional', preguntas: [] },
    { id: 2, nombre: 'Test 2: Academic writing', descripcion: 'Escritura académica', preguntas: [] },
    { id: 3, nombre: 'Test 3: Idioms', descripcion: 'Expresiones idiomáticas', preguntas: [] },
    { id: 4, nombre: 'Test 4: Advanced grammar', descripcion: 'Gramática compleja', preguntas: [] },
    { id: 5, nombre: 'Test 5: Listening skills', descripcion: 'Comprensión auditiva', preguntas: [] },
    { id: 6, nombre: 'Test 6: Speaking practice', descripcion: 'Práctica oral', preguntas: [] },
    { id: 7, nombre: 'Test 7: Reading comprehension', descripcion: 'Comprensión lectora', preguntas: [] },
    { id: 8, nombre: 'Test 8: Writing tasks', descripcion: 'Tareas de escritura', preguntas: [] }
  ]
};

/**
 * Función que genera el HTML de la Vista de Tests del Bloque
 */
function renderVistaTestsBloque(bloqueId, isSuscrito) {
  const bloques = state.bloques || [];
  const bloque = bloques.find(b => b.id === bloqueId);

  if (!bloque) {
    return `<div class="vista-tests-container"><p>Bloque no encontrado</p></div>`;
  }

  // Usar datos dinámicos si existen, sino fallback a datos estáticos
  const tests = window.ejerciciosActuales && window.ejerciciosActuales.length > 0
    ? window.ejerciciosActuales
    : (testsData[bloqueId] || []);

  const testActualData = tests[testsState.testActual - 1];

  const progreso = bloque.totalTests > 0
    ? (bloque.completados / bloque.totalTests) * 100
    : 0;

  // Generar lista de tests en el sidebar
  const testsListaHTML = tests.map((test, index) => {
    const esActivo = testsState.testActual === (index + 1);
    const tienePreguntas = test.preguntas && test.preguntas.length > 0;

    // Si es un nivel sin preguntas cargadas, usar loadEjerciciosNivel
    const onclickHandler = tienePreguntas
      ? `cambiarTest(${index + 1})`
      : `window.loadEjerciciosNivel(${test.id}, ${bloqueId})`;

    return `
      <div class="test-item ${esActivo ? 'activo' : ''}" onclick="${onclickHandler}">
        <div class="test-item-info">
          <h4>${test.nombre}</h4>
          <p>${test.descripcion}</p>
        </div>
        ${esActivo ? '<span class="test-item-badge">Actual</span>' : ''}
      </div>
    `;
  }).join('');

  // Generar contenido del test actual
  let testContenidoHTML = '';

  if (testActualData && testActualData.preguntas && testActualData.preguntas.length > 0) {
    const preguntasHTML = testActualData.preguntas.map((pregunta, pIndex) => {
      const opcionesHTML = pregunta.opciones.map((opcion, oIndex) => {
        const respuestaKey = `${testsState.testActual} -${pIndex} `;
        const esSeleccionada = testsState.respuestas[respuestaKey] === oIndex;

        let extraStyle = '';
        let extraClass = '';

        // Checking correction result for visual feedback
        if (testsState.correctionResult && testsState.correctionResult.detalles) {
          // Check if this specific option was the one answered
          const opId = typeof opcion === 'object' ? opcion.idRespuesta : null;
          // Find detail that matches this QUESTION and THIS ANSWER (to mark the selected one)
          const detalle = testsState.correctionResult.detalles.find(d =>
            (d.idEjercicio == pregunta.idEjercicio || d.idEjercicio == pregunta.id) &&
            d.idRespuesta == opId
          );

          if (detalle) {
            if (detalle.esCorrecta) {
              extraClass = ' correcta';
              extraStyle = 'background-color: #dcfce7; border-color: #22c55e;';
            } else {
              extraClass = ' incorrecta';
              extraStyle = 'background-color: #fee2e2; border-color: #ef4444;';
            }
          }
        }

        return `
          <div id="opcion-${pIndex}-${oIndex}"
               class="opcion-item ${esSeleccionada ? 'seleccionada' : ''}${extraClass}"
               style="${extraStyle}"
               onclick="seleccionarOpcion(${pIndex}, ${oIndex})">
            <div class="opcion-radio"></div>
            <span class="opcion-texto">${typeof opcion === 'object' ? opcion.texto : opcion}</span>
          </div>
        `;
      }).join('');

      return `
        <div class="pregunta-card">
          <h3 class="pregunta-titulo">Pregunta ${pIndex + 1}: ${pregunta.pregunta}</h3>
          <div class="opciones-lista">
            ${opcionesHTML}
          </div>
        </div>
      `;
    }).join('');

    testContenidoHTML = `
      <div class="test-actual-header">
        <span class="test-actual-badge">Test ${testsState.testActual} de ${tests.length}</span>
        <div class="test-actual-info">
          <h2>${testActualData.nombre}</h2>
          <p>${testActualData.descripcion}</p>
        </div>
      </div>

      <div class="test-preguntas-container">
        ${preguntasHTML}
      </div>

       <!--botón de corrección-->
      <div class="test-actions-footer">
         <button id="btn-corregir" class="btn btn-primary" onclick="corregirTest()">
           Corregir Test
         </button>
         <div id="test-resultado" style="margin-top: 1rem; font-weight: bold; display: none;"></div>
      </div>

      <div class="tests-navigation">
        ${testsState.testActual > 1 ? `
          <button class="btn-test-nav secondary" onclick="cambiarTest(${testsState.testActual - 1})">
            ${iconosSVG.ArrowLeft}
            Test Anterior
          </button>
        ` : '<div></div>'}
        
        ${testsState.testActual < tests.length ? `
          <button class="btn-test-nav primary" onclick="cambiarTest(${testsState.testActual + 1})">
            Siguiente Test
            ${iconosSVG.ChevronRight}
          </button>
        ` : ''}
      </div>
`;
  } else {
    testContenidoHTML = `
      <div class="test-actual-header">
        <span class="test-actual-badge">Test ${testsState.testActual} de ${tests.length}</span>
        <div class="test-actual-info">
          <h2>${testActualData ? testActualData.nombre : 'Test sin nombre'}</h2>
          <p>${testActualData ? testActualData.descripcion : ''}</p>
        </div>
      </div>

      <div style="text-align: center; padding: 3rem; color: #6c757d;">
        <p>Este test aún no tiene preguntas disponibles.</p>
        <p style="margin-top: 1rem; font-size: 0.875rem;">Próximamente se añadirá el contenido.</p>
      </div>

      <div class="tests-navigation">
        ${testsState.testActual > 1 ? `
          <button class="btn-test-nav secondary" onclick="cambiarTest(${testsState.testActual - 1})">
            ${iconosSVG.ArrowLeft}
            Test Anterior
          </button>
        ` : '<div></div>'}
        
        ${testsState.testActual < tests.length ? `
          <button class="btn-test-nav primary" onclick="cambiarTest(${testsState.testActual + 1})">
            Siguiente Test
            ${iconosSVG.ChevronRight}
          </button>
        ` : ''}
      </div>
`;
  }

  return `
    <div class="vista-tests-container">
      <div class="vista-tests-header">
        <div class="vista-tests-header-content">
          <button class="btn-back-to-bloques" onclick="navigateTo('actividades')">
            ${iconosSVG.ArrowLeft}
            Volver a Bloques
          </button>
          <div class="vista-tests-header-info">
            <div class="vista-tests-icon-wrapper">
              ${iconosSVG[bloque.icon]}
            </div>
            <div>
              <h1 class="vista-tests-title">${bloque.nombre}</h1>
              <p class="vista-tests-subtitle">${bloque.descripcion}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="vista-tests-layout">
        <aside class="tests-sidebar">
          <div class="progreso-bloque-card">
            <h3>Progreso del Bloque</h3>
            <div class="progress-bar-wrapper">
              <div class="progress-bar-inner" style="width: ${progreso}%"></div>
            </div>
            <p class="progreso-text">${bloque.completados} / ${bloque.totalTests} tests completados</p>
          </div>

          <div class="tests-lista-card">
            <h3>Tests del Bloque</h3>
            <div class="tests-items-list">
              ${testsListaHTML}
            </div>
          </div>
        </aside>

        <main class="test-content-area">
          ${testContenidoHTML}
        </main>
      </div>
    </div>
  `;
}

/**
 * Cambiar de test
 */
function cambiarTest(nuevoTest) {
  testsState.testActual = nuevoTest;
  renderCurrentScreen();
}

/**
 * Seleccionar opción de respuesta
 */
/**
 * Seleccionar opción de respuesta
 */
function seleccionarOpcion(preguntaIndex, opcionIndex) {
  const respuestaKey = `${testsState.testActual} -${preguntaIndex} `;
  testsState.respuestas[respuestaKey] = opcionIndex;
  renderCurrentScreen();
}

/**
 * Función para corregir el test actual
 */
window.corregirTest = async function () {

  const btn = document.getElementById('btn-corregir');
  const resultDiv = document.getElementById('test-resultado');

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Verificando...';
  }

  // Preparar el payload
  // Necesitamos mapear: { idEjercicio: idRespuestaSeleccionada }
  const respuestasPayload = {};

  // Usar LA MISMA lógica de obtención de datos que renderVistaTestsBloque
  const tests = window.ejerciciosActuales && window.ejerciciosActuales.length > 0
    ? window.ejerciciosActuales
    : (state.bloqueSeleccionado && testsData[state.bloqueSeleccionado] || []);

  // Fallback a datos estáticos si no hay dinámicos
  const testActualData = tests[testsState.testActual - 1];

  if (!testActualData || !testActualData.preguntas) {
    alert("No hay datos de preguntas para corregir.");
    if (btn) { btn.disabled = false; btn.textContent = 'Corregir Test'; }
    return;
  }

  let respuestasCount = 0;

  testActualData.preguntas.forEach((pregunta, pIndex) => {
    const respuestaKey = `${testsState.testActual} -${pIndex} `;
    if (testsState.respuestas.hasOwnProperty(respuestaKey)) {
      const opcionIndex = testsState.respuestas[respuestaKey];
      const opcionSeleccionada = pregunta.opciones[opcionIndex];

      // Si es objeto (desde DB), tiene idRespuesta
      if (typeof opcionSeleccionada === 'object' && opcionSeleccionada.idRespuesta) {
        const idEjercicio = pregunta.idEjercicio || pregunta.id; // Asegurar ID
        respuestasPayload[idEjercicio] = opcionSeleccionada.idRespuesta;
        respuestasCount++;
      }
      // Si es texto simple (mock data), no podemos verificar contra DB real
      else if (typeof opcionSeleccionada === 'string') {
        console.warn("Opción texto (mock):", opcionSeleccionada);
        // Intentar simular ID con índice o hash simple si fuera necesario, 
        // pero para la API se necesita ID real.
        // Simulamos envío dummy idEjercicio -> valor (opción)
        // Esto fallará en backend si espera ID numérico en la tabla
        respuestasCount++; // Contamos para pasar la validación local
      }
      else {
        console.warn("Opción formato inválido:", opcionSeleccionada);
      }
    }
  });

  if (respuestasCount === 0) {
    alert("Por favor selecciona al menos una respuesta.");
    if (btn) { btn.disabled = false; btn.textContent = 'Corregir Test'; }
    return;
  }

  try {
    const data = await BloquesAPI.corregirTest(respuestasPayload);

    if (data.success) {
      // Guardar resultado para pintar colores
      testsState.correctionResult = data;

      // Actualizar datos de bloques (progreso) y refrescar barra de progreso en UI
      fetchBloques().then(() => {
        if (state.currentScreen === 'tests-bloque' && state.bloqueSeleccionado) {
          // Encontrar el bloque actualizado
          const bloque = state.bloques.find(b => b.id === state.bloqueSeleccionado);
          if (bloque) {
            const bar = document.querySelector('.progreso-bloque-card .progress-bar-inner');
            const text = document.querySelector('.progreso-bloque-card .progreso-text');
            if (bar && text && bloque.totalTests > 0) {
              const pct = (bloque.completados / bloque.totalTests) * 100;
              bar.style.width = `${pct}%`;
              text.textContent = `${bloque.completados} / ${bloque.totalTests} tests completados`;
            }
          }
        }
      });

      // Mostrar resumen
      if (resultDiv) {
        resultDiv.style.display = 'block';
        resultDiv.textContent = `Has acertado ${data.aciertos} de ${data.total}.`;
        resultDiv.style.color = data.aciertos === data.total ? '#16a34a' : '#ea580c';
      }

      // Re-renderizar para mostrar colores (feedback visual en opciones)
      // Necesitamos pasar un flag o guardar esto en el state global de tests
      // Para simplificar, llamamos a renderCurrentScreen que ahora leerá testsState.correctionResult
      renderCurrentScreen();

    } else {
      alert("Error al corregir: " + (data.message || "Error desconocido"));
    }

  } catch (error) {
    console.error("Error en la petición:", error);
    alert("Hubo un error de conexión al intentar corregir el test.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Corregir Test';
    }
  }
};




window.handleImageUpload = async function (input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];

    // Validaciones básicas de cliente
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('imagen', file);

    try {
      // Mostrar estado de carga (opcional: podrías poner un spinner en el avatar)
      const avatarEl = document.querySelector('.perfil-avatar');
      if (avatarEl) avatarEl.style.opacity = '0.5';

      const response = await PerfilAPI.uploadImagen(formData);

      if (response.success) {
        // Actualizar URL en estado global
        if (state.currentUser) {
          state.currentUser.url_imagen = fixImagePath(response.url) + '?t=' + new Date().getTime(); // Anti-cache
        }

        // Recargar pantalla para ver cambios
        renderCurrentScreen();

        // Mostrar éxito
        // alert('Imagen actualizada correctamente');
      } else {
        alert(response.message || 'Error al subir la imagen');
        if (avatarEl) avatarEl.style.opacity = '1';
      }
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      alert('Error al subir la imagen: ' + error.message);
      const avatarEl = document.querySelector('.perfil-avatar');
      if (avatarEl) avatarEl.style.opacity = '1';
    }
  }
};

// ============================================

// ============================================
// LOGICA DE EDICION DE PERFIL (Agregada dinamicamente)
// ============================================

window.saveProfileChanges = async function () {
  const newUsername = document.getElementById('edit-username').value.trim();
  const newTelefono = document.getElementById('edit-telefono').value.trim();
  const newNombre = document.getElementById('edit-nombre').value.trim();

  if (!newUsername) {
    alert('El nombre de usuario no puede estar vacío');
    return;
  }

  if (!newNombre) {

    alert('El nombre completo no puede estar vacío');
    return; 
  }
  

  try {
    const response = await PerfilAPI.updateProfile({
      username: newUsername,
      telefono: newTelefono,
        nombre: newNombre,
    });

    if (response.success) {
      alert('Perfil actualizado correctamente');

      // Actualizar estado local
      if (state.currentUser) {
        state.currentUser.username = newUsername;
        state.currentUser.telefono = newTelefono;
      }

      // Recargar vista perfil para mostrar cambios
      renderCurrentScreen();
    } else {
      alert('Error al actualizar: ' + response.message);
    }
  } catch (error) {
    console.error(error);
    alert('Error de conexión al actualizar perfil');
  }
};

// ============================================
// MODAL DE CAMBIO DE CONTRASEÑA
// ============================================

window.openPasswordModal = function () {
  // Verificar si ya existe para no duplicar
  if (document.getElementById('password-modal')) {
    document.getElementById('password-modal').style.display = 'flex';
    // Limpiar errores y campos al reabrir
    document.querySelectorAll('.error-text').forEach(el => el.style.display = 'none');
    ['pwd-current', 'pwd-new', 'pwd-confirm'].forEach(id => document.getElementById(id).value = '');
    return;
  }

  const modalHTML = `
    <div id="password-modal" class="modal" style="display: flex;">
      <div class="modal-overlay" onclick="document.getElementById('password-modal').style.display='none'"></div>
      <div class="modal-content" style="max-width: 400px;">
        <h3 class="modal-title">Cambiar Contraseña</h3>
        
        <div class="form-group" style="margin-bottom: 1rem;">
            <label style="display:block; margin-bottom: 0.5rem; font-weight: 500;">Contraseña Actual</label>
            <input type="password" id="pwd-current" class="form-input" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 6px;">
            <div id="error-pwd-current" class="error-text" style="color: #dc2626; font-size: 0.875rem; margin-top: 0.25rem; display: none;"></div>
        </div>
        
        <div class="form-group" style="margin-bottom: 1rem;">
            <label style="display:block; margin-bottom: 0.5rem; font-weight: 500;">Nueva Contraseña</label>
            <input type="password" id="pwd-new" class="form-input" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 6px;">
            <div id="error-pwd-new" class="error-text" style="color: #dc2626; font-size: 0.875rem; margin-top: 0.25rem; display: none;"></div>
        </div>

        <div class="form-group" style="margin-bottom: 1.5rem;">
            <label style="display:block; margin-bottom: 0.5rem; font-weight: 500;">Confirmar Nueva Contraseña</label>
            <input type="password" id="pwd-confirm" class="form-input" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 6px;">
            <div id="error-pwd-confirm" class="error-text" style="color: #dc2626; font-size: 0.875rem; margin-top: 0.25rem; display: none;"></div>
        </div>

        <div class="modal-actions" style="display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button class="btn-outline" onclick="document.getElementById('password-modal').style.display='none'">Cancelar</button>
          <button class="btn-primary" onclick="window.submitPasswordChange()">Guardar</button>
        </div>
      </div>
    </div>
    `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
};

window.submitPasswordChange = async function () {
  const currentPwd = document.getElementById('pwd-current').value;
  const newPwd = document.getElementById('pwd-new').value;
  const confirmPwd = document.getElementById('pwd-confirm').value;

  // Helpers UI
  const showError = (id, msg) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
    }
  };
  const clearErrors = () => {
    document.querySelectorAll('.error-text').forEach(el => el.style.display = 'none');
  };

  clearErrors();
  let valid = true;

  if (!currentPwd) {
    showError('error-pwd-current', (window.I18n && window.I18n.t) ? window.I18n.t('validation.required') : 'Este campo es obligatorio');
    valid = false;
  }
  if (!newPwd) {
    showError('error-pwd-new', (window.I18n && window.I18n.t) ? window.I18n.t('validation.required') : 'Este campo es obligatorio');
    valid = false;
  }
  if (!confirmPwd) {
    showError('error-pwd-confirm', (window.I18n && window.I18n.t) ? window.I18n.t('validation.required') : 'Este campo es obligatorio');
    valid = false;
  }

  if (!valid) return;

  if (newPwd !== confirmPwd) {
    showError('error-pwd-confirm', (window.I18n && window.I18n.t) ? window.I18n.t('validation.password.match') : 'Las nuevas contraseñas no coinciden');
    return;
  }

  // Reglas de validación estrictas
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(newPwd);
  const hasLowerCase = /[a-z]/.test(newPwd);
  const hasNumbers = /\d/.test(newPwd);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPwd);

  if (newPwd.length < minLength) {
    showError('error-pwd-new', (window.I18n && window.I18n.t) ? window.I18n.t('validation.password.length') : 'Mínimo 8 caracteres');
    return;
  }

  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    showError('error-pwd-new', (window.I18n && window.I18n.t) ? window.I18n.t('validation.password.complexity') : 'Requiere mayúscula, minúscula, número y especial');
    return;
  }

  try {
    const response = await PerfilAPI.updatePassword(currentPwd, newPwd);
    if (response.success) {
      alert((window.I18n && window.I18n.t) ? window.I18n.t('profile.password.success') : 'Contraseña actualizada correctamente');
      document.getElementById('password-modal').style.display = 'none';
      ['pwd-current', 'pwd-new', 'pwd-confirm'].forEach(id => document.getElementById(id).value = '');
    } else {
      const msg = response.message || 'Error desconocido';
      if (msg.includes('permisos') || msg.includes('privileges')) {
        alert('Error de permisos. Asegúrate de estar logueado con tu cuenta personal.');
      } else if (msg.includes('incorrect') || msg.includes('actual')) {
        showError('error-pwd-current', 'La contraseña actual es incorrecta');
      } else {
        alert('Error: ' + msg);
      }
    }
  } catch (error) {
    console.error(error);
    alert('Error al intentar cambiar la contraseña');
  }
};

// Restaurar compatibilidad con dynamic-loader.js
if (typeof generateActividadesContent === 'undefined' && typeof renderVistaBloques !== 'undefined') {
  window.generateActividadesContent = renderVistaBloques;
}
