/**
 * Extensión de main.js para cargar datos dinámicamente desde la base de datos
 * Este archivo debe incluirse después de main.js en el HTML
 */

// ============================================
// SOBRE ESCRIBIR generateActividadesContent para usar datos dinámicos
// ============================================

const originalGenerateActividadesContent = generateActividadesContent;

// Variable global para almacenar los bloques cargados
window.bloquesActuales = [];

/**
 * Versión async de generateActividadesContent que carga datos desde la BD
 */
async function loadActividadesContent(isSuscrito) {
    try {
        const response = await BloquesAPI.getBloques();

        if (response.success) {
            // Actualizar estado global
            if (response.isSuscrito !== undefined) {
                state.isSuscrito = response.isSuscrito;
            }

            const bloques = response.bloques.map(b => ({
                id: parseInt(b.idBloque), // Asegurar que es entero
                nombre: b.nombre,
                descripcion: b.descripcion,
                color: 'bg-violet-500', // Restaurado visual original
                icon: 'FileText',       // Restaurado visual original
                totalTests: b.totalTests !== undefined ? parseInt(b.totalTests) : 0,
                completados: b.completados !== undefined ? parseInt(b.completados) : 0
            }));

            window.bloquesActuales = bloques;
            state.bloques = bloques; // Actualizar estado global también

            // Usar la función original pero con los bloques de la BD
            return generateActividadesContentWithData(response.isSuscrito, bloques);
        }
    } catch (error) {
        console.error('Error cargando bloques:', error);
        // Fallback a la versión original con datos estáticos
        return originalGenerateActividadesContent(isSuscrito);
    }
}

/**
 * Versión modificada de generateActividadesContent que acepta bloques como parámetro
 */
function generateActividadesContentWithData(isSuscrito, bloques) {
    const gridClass = isSuscrito ? 'bloques-grid-2-cols' : 'bloques-grid-3-cols';

    const iconSVG = (iconName) => {
        switch (iconName) {
            case 'Lock': return `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
            case 'CheckCircle': return `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M9 11l3 3L22 4"/></svg>`;
            case 'GraduationCap': return `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
            case 'GraduationCapHead': return `<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1773b0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
            case 'BookOpen': return `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;
            case 'FileText': return `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`;
            case 'Award': return `<svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`;
            default: return '';
        }
    };

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

    // Calcular bloques completados (asumiendo que b.totalTests > 0 para evitar falsos positivos)
    const bloquesCompletados = bloques.filter(b => b.totalTests > 0 && b.completados >= b.totalTests).length;
    // Condición para mostrar el botón de reseña: 12 bloques completados (ajustable)
    const showResenaButton = bloquesCompletados >= 12;

    let statusCardHTML = '';

    // Solo mostramos el banner si:
    // 1. NO está suscrito (para mostrar botón de suscribirse)
    // 2. ESTÁ suscrito Y completó 12 bloques (para mostrar botón de reseña)
    if (!isSuscrito || (isSuscrito && showResenaButton)) {
        let statusTitle, statusSubtitle, subscriptionButton, statusIconClass, statusIconSvg;

        if (isSuscrito && showResenaButton) {
            statusTitle = (window.I18n && window.I18n.t) ? window.I18n.t('resena.banner.title') : '¿Has encontrado útiles nuestros tests?';
            statusSubtitle = (window.I18n && window.I18n.t) ? window.I18n.t('resena.banner.subtitle') : 'Déjanos una reseña :)';
            const resenaButtonText = (window.I18n && window.I18n.t) ? window.I18n.t('resena.banner.button') : 'Escribir reseña';
            subscriptionButton = `<button class="btn btn-primary" onclick="window.openResenaModal()">${resenaButtonText}</button>`;
            statusIconClass = 'status-icon-subscribed';
            statusIconSvg = iconSVG('CheckCircle');
        } else {
            statusTitle = (window.I18n && window.I18n.t) ? window.I18n.t('status.title.unsubscribed') : 'Usuario No Suscrito';
            statusSubtitle = (window.I18n && window.I18n.t) ? window.I18n.t('status.subtitle.unsubscribed') : 'Acceso limitado al plan personalizado';
            subscriptionButton = `<a href="#" class="btn btn-primary" onclick="navigateTo('suscripciones'); return false;">${(window.I18n && window.I18n.t) ? window.I18n.t('btn.subscribe') : 'Suscribirse'}</a>`;
            statusIconClass = 'status-icon-locked';
            statusIconSvg = iconSVG('Lock');
        }

        statusCardHTML = `
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
            `;
    }

    const headerInfoText = isSuscrito ? ((window.I18n && window.I18n.t) ? window.I18n.t('actividades.headerInfo.subscribed') : 'Tienes acceso completo a todos los bloques') : ((window.I18n && window.I18n.t) ? window.I18n.t('actividades.headerInfo.unsubscribed') : 'Accede al plan personalizado o suscríbete para más contenido');

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
                    ${statusCardHTML}
                    
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

// ============================================
// SOBREESCRIBIR renderCurrentScreen para cargar datos dinámicamente
// ============================================

const originalRenderCurrentScreen = renderCurrentScreen;

async function renderCurrentScreenAsync() {
    if (!appContainer) return;

    let contentHTML = '';

    switch (state.currentScreen) {
        case 'home':

            appContainer.innerHTML = generateHomeContent();
            attachHomePageListeners();
            break;

        case 'actividades':

            contentHTML = await loadActividadesContent(state.isSuscrito);
            appContainer.innerHTML = contentHTML;
            break;

        case 'foro':

            contentHTML = await loadForoContent();
            appContainer.innerHTML = contentHTML;

            // Autoscroll al final para ver los mensajes más recientes
            setTimeout(() => {
                const mensajesContainer = document.getElementById('foro-mensajes-container');
                if (mensajesContainer) {
                    mensajesContainer.scrollTop = mensajesContainer.scrollHeight;
                }

                // Asegurar que el chat sea visible en la pantalla
                const chatCard = document.querySelector('.foro-chat-card');
                if (chatCard) {
                    chatCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            break;

        case 'perfil':

            contentHTML = await loadPerfilContent();
            appContainer.innerHTML = contentHTML;
            break;

        case 'perfil-otro-usuario':

            contentHTML = await loadPerfilOtroUsuarioContent(state.usuarioSeleccionado);
            appContainer.innerHTML = contentHTML;
            break;

        case 'tests-bloque':


            // Si ya tenemos niveles cargados para este bloque, solo re-renderizar
            const yaEstaCargado = window.ejerciciosActuales &&
                window.ejerciciosActuales.length > 0 &&
                window.ejerciciosActuales[0].idBloque === state.bloqueSeleccionado;

            if (yaEstaCargado) {
                contentHTML = renderVistaTestsBloque(state.bloqueSeleccionado, state.isSuscrito);
            } else {
                contentHTML = await loadTestsBloque(state.bloqueSeleccionado);
            }

            appContainer.innerHTML = contentHTML;
            break;

        default:
            // Usar la función original para el resto
            originalRenderCurrentScreen();
            break;
    }
}

// Reemplazar la función global
window.renderCurrentScreen = renderCurrentScreenAsync;

// ============== FORO DINÁMICO ==============

async function loadForoContent() {
    try {
        const response = await ForoAPI.getMensajes();
        console.log('[loadForoContent] Respuesta:', response);

        if (response && response.success) {
            if (response.mensajes) {
                foroState.mensajes = response.mensajes;
            } else {
                console.warn('[loadForoContent] La respuesta no contiene "mensajes":', response);
                foroState.mensajes = []; // Fallback
            }
            // Actualizar estado de suscripción si viene del backend
            if (response.isSuscrito !== undefined) {
                state.isSuscrito = response.isSuscrito;
            }
        }
    } catch (error) {
        console.error('Error cargando mensajes del foro:', error);
    }

    return generateForoContent();
}

// Modificar handleForoActions para enviar el mensaje a la BD
const originalHandleForoActions = window.handleForoActions;

window.handleForoActions = async function (action, param = null) {
    if (action === 'enviar') {
        if (!state.isSuscrito) {
            mostrarModalSuscripcion();
            return;
        }

        const mensajeInput = document.getElementById('foro-mensaje-input');
        const mensaje = mensajeInput ? mensajeInput.value.trim() : '';

        if (mensaje) {
            try {
                const response = await ForoAPI.enviarMensaje(mensaje);

                if (response.success) {
                    // Limpiar input
                    mensajeInput.value = '';

                    // Recargar mensajes
                    await loadForoContent();
                    appContainer.innerHTML = await loadForoContent();

                    // Autoscroll para ver el nuevo mensaje
                    setTimeout(() => {
                        const mensajesContainer = document.getElementById('foro-mensajes-container');
                        if (mensajesContainer) {
                            mensajesContainer.scrollTop = mensajesContainer.scrollHeight;
                        }
                    }, 0);
                }
            } catch (error) {
                alert('Error al enviar mensaje. Inténtalo de nuevo.');
            }
        }
    } else if (action === 'ver-perfil' && param && param !== 'Tú') {
        // Navegar al perfil del otro usuario
        navigateTo('perfil-otro-usuario', param);
    } else {
        originalHandleForoActions(action, param);
    }
};

// ============== PERFIL DINÁMICO ==============

async function loadPerfilContent() {
    try {
        console.log('[loadPerfilContent] Iniciando carga de datos paralela...');
        const [perfilRes, statsRes, suscripcionRes] = await Promise.all([
            PerfilAPI.getPerfil(),
            PerfilAPI.getEstadisticas(),
            PerfilAPI.getSuscripcion()
        ]);
        console.log('[loadPerfilContent] Carga finalizada:', {
            perfil: perfilRes.success,
            stats: statsRes.success,
            suscripcion: suscripcionRes.success
        });

        // Actualizar datos globales (necesarios para renderPerfilUsuario)
        // Usamos optional chaining y check de existencia para evitar crashes
        if (perfilRes && perfilRes.success) {
            window.datosUsuarioActual = perfilRes.perfil;
            state.currentUser = perfilRes.perfil;
            state.profileLoadError = null;
            if (perfilRes.isSuscrito !== undefined) {
                state.isSuscrito = perfilRes.isSuscrito;
            }
        } else if (perfilRes && !perfilRes.success) {
            state.profileLoadError = perfilRes.message || "Error al cargar datos básicos";
        }

        if (statsRes && statsRes.success) {
            window.estadisticasActuales = statsRes.estadisticas;
        }

        if (suscripcionRes && suscripcionRes.success) {
            window.suscripcionActual = suscripcionRes.suscripcion;
        }

        return renderPerfilUsuario();
    } catch (error) {
        console.error('Error cargando contenido de perfil:', error);
        state.profileLoadError = "Error inesperado en la carga paralela";
        return renderPerfilUsuario();
    }
}

async function loadPerfilOtroUsuarioContent(username) {
    // renderPerfilOtroUsuario ahora es async y carga los datos internamente
    // No necesitamos cargar datos aquí, solo llamar a la función
    return await renderPerfilOtroUsuario(username);
}

// ============== TESTS DINÁMICOS ==============

async function loadTestsBloque(bloqueId) {
    // 1. Asegurar que los bloques están cargados (para metadata del header)
    if (!state.bloques || state.bloques.length === 0 || !state.bloques.find(b => b.id === bloqueId)) {
        try {

            const response = await BloquesAPI.getBloques();
            if (response.success) {
                const bloques = response.bloques.map(b => ({
                    id: parseInt(b.idBloque),
                    nombre: b.nombre,
                    descripcion: b.descripcion,
                    color: 'bg-violet-500',
                    icon: 'FileText',
                    totalTests: b.totalTests !== undefined ? parseInt(b.totalTests) : 0,
                    completados: b.completados !== undefined ? parseInt(b.completados) : 0
                }));
                state.bloques = bloques;
                window.bloquesActuales = bloques;
                window.state = state;
            }
        } catch (error) {
            console.error('Error cargando lista de bloques:', error);
        }
    }

    // 2. Cargar NIVELES del bloque en lugar de ejercicios
    try {
        const response = await BloquesAPI.getNiveles(bloqueId);

        if (response.success && response.niveles) {
            const nivelesBackend = response.niveles;

            // Mapear niveles a formato de "tests"
            const testsGenerados = nivelesBackend.map(nivel => ({
                id: nivel.idNivel,
                nivelNumero: nivel.nivel,
                nombre: `Nivel ${nivel.nivel}`,
                descripcion: `${nivel.totalEjercicios} ejercicio${nivel.totalEjercicios !== 1 ? 's' : ''}`,
                idBloque: nivel.idBloque,
                totalEjercicios: parseInt(nivel.totalEjercicios),
                preguntas: [] // Se cargarán al hacer clic en el nivel
            }));

            // Si no hay niveles, mostrar mensaje
            if (testsGenerados.length === 0) {
                testsGenerados.push({
                    id: 0,
                    nombre: 'Sin niveles',
                    descripcion: 'No hay niveles disponibles para este bloque.',
                    preguntas: []
                });
            }

            window.ejerciciosActuales = testsGenerados;

            // Precargar TODOS los niveles en paralelo para experiencia instantánea
            if (testsGenerados.length > 0 && testsGenerados[0].id > 0) {
                // Crear promesas para cargar todos los niveles en paralelo
                const promesasCarga = testsGenerados.map(async (nivel, index) => {
                    if (nivel.id === 0) return; // Saltar niveles sin ID válido

                    try {
                        const respEjercicios = await BloquesAPI.getEjerciciosNivel(nivel.id);

                        if (respEjercicios.success && respEjercicios.ejercicios) {
                            const preguntasFormateadas = respEjercicios.ejercicios.map(p => ({
                                id: p.idEjercicio,
                                idEjercicio: p.idEjercicio,
                                pregunta: p.pregunta,
                                opciones: p.opciones,
                                respuestaCorrectaIndex: p.opciones.findIndex(o => o.esCorrecta)
                            }));

                            testsGenerados[index].preguntas = preguntasFormateadas;
                            testsGenerados[index].preguntasCargadas = true;
                        }
                    } catch (err) {
                        console.error(`Error precargando nivel ${nivel.nombre}:`, err);
                    }
                });

                // Esperar a que se carguen todos los niveles
                await Promise.all(promesasCarga);
            }
        }
    } catch (error) {
        console.error('Error cargando niveles:', error);
        window.ejerciciosActuales = [{
            id: 0,
            nombre: 'Error',
            descripcion: 'No se pudieron cargar los niveles.',
            preguntas: []
        }];
    }

    return renderVistaTestsBloque(bloqueId, state.isSuscrito);
}

/**
 * Cargar ejercicios de un nivel específico
 * @param {number} idNivel - ID del nivel  
 * @param {number} bloqueId - ID del bloque (para navegación)
 */
async function loadEjerciciosNivel(idNivel, bloqueId) {


    try {
        const response = await BloquesAPI.getEjerciciosNivel(idNivel);

        if (response.success && response.ejercicios) {
            const preguntasBackend = response.ejercicios;

            // Mapear preguntas al formato esperado
            const preguntasFormateadas = preguntasBackend.map(p => ({
                id: p.idEjercicio,
                idEjercicio: p.idEjercicio,
                pregunta: p.pregunta,
                opciones: p.opciones,
                respuestaCorrectaIndex: p.opciones.findIndex(o => o.esCorrecta)
            }));

            // Actualizar el nivel cargado en window.ejerciciosActuales
            const nivelesActuales = window.ejerciciosActuales || [];
            const nivelIndex = nivelesActuales.findIndex(n => n.id === idNivel);



            if (nivelIndex !== -1) {
                // Actualizar las preguntas del nivel
                nivelesActuales[nivelIndex].preguntas = preguntasFormateadas;
                nivelesActuales[nivelIndex].preguntasCargadas = true;

                // Actualizar el testActual en testsState (es global)
                if (window.testsState) {
                    window.testsState.testActual = nivelIndex + 1;
                }

                // Re-renderizar la pantalla completa para mostrar las preguntas

                renderCurrentScreen();
            } else {
                // Nivel no encontrado
            }
        } else {
            // Respuesta inválida
        }
    } catch (error) {
        console.error('Error cargando ejercicios del nivel:', error);
        alert('Error al cargar los ejercicios del nivel. Por favor, revisa la consola.');
    }
}

// Exponer globalmente
window.loadEjerciciosNivel = loadEjerciciosNivel;

// ============== MODAL DE RESEÑA ==============

// Crear HTML del modal dinámicamente
function createResenaModal() {
    if (document.getElementById('resena-modal-overlay')) return;

    const t = (key, fallback) => (window.I18n && window.I18n.t) ? window.I18n.t(key) : fallback;
    const modalHTML = `
            <div id="resena-modal-overlay" class="modal-overlay">
                <div class="resena-modal">
                    <div class="resena-header">
                        <h3 class="resena-title">${t('resena.modal.title', 'Escribir Reseña')}</h3>
                        <button class="close-modal-btn" onclick="window.closeResenaModal()">&times;</button>
                    </div>
                    <div class="resena-body">
                        <p style="text-align: center; color: var(--muted-foreground); margin-bottom: 1rem;">${t('resena.modal.question', '¿Qué te ha parecido el curso?')}</p>
                        <div class="star-rating" id="resena-stars">
                            <button data-value="1" onclick="setRating(1)">★</button>
                            <button data-value="2" onclick="setRating(2)">★</button>
                            <button data-value="3" onclick="setRating(3)">★</button>
                            <button data-value="4" onclick="setRating(4)">★</button>
                            <button data-value="5" onclick="setRating(5)">★</button>
                        </div>
                        <textarea id="resena-texto" class="resena-textarea" placeholder="${t('resena.modal.placeholder', 'Escribe tu opinión aquí... (máx 100 caracteres)')}" maxlength="100"></textarea>
                        <div class="modal-actions">
                            <button class="btn btn-secondary" onclick="window.closeResenaModal()">${t('resena.modal.cancel', 'Cancelar')}</button>
                            <button class="btn btn-primary" onclick="window.submitResena()">${t('resena.modal.submit', 'Enviar Reseña')}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Agregar listeners para hover en estrellas
    const starButtons = document.querySelectorAll('#resena-stars button');
    starButtons.forEach(btn => {
        btn.addEventListener('mouseenter', handleStarHover);
        btn.addEventListener('mouseleave', handleStarLeave);
    });
}

// Variables globales para el modal
window.currentRating = 0;

function handleStarHover(e) {
    const value = parseInt(e.target.dataset.value);
    const buttons = document.querySelectorAll('#resena-stars button');
    buttons.forEach((btn, index) => {
        if (index < value) {
            btn.classList.add('hover');
        } else {
            btn.classList.remove('hover');
        }
    });
}

function handleStarLeave() {
    const buttons = document.querySelectorAll('#resena-stars button');
    buttons.forEach(btn => btn.classList.remove('hover'));
}

window.setRating = function (rating) {
    window.currentRating = rating;
    const buttons = document.querySelectorAll('#resena-stars button');
    buttons.forEach((btn, index) => {
        if (index < rating) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
};

window.openResenaModal = function () {
    createResenaModal(); // Asegurar que existe
    setTimeout(() => {
        const overlay = document.getElementById('resena-modal-overlay');
        if (overlay) overlay.classList.add('active');
        // Reset estado stars
        window.setRating(window.currentRating);
    }, 10);
};

window.closeResenaModal = function () {
    const overlay = document.getElementById('resena-modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        // No removemos el DOM para mantener el estado si lo abren de nuevo (o podríamos resetear)
    }
};

window.submitResena = async function () {
    const t = (key, fallback) => (window.I18n && window.I18n.t) ? window.I18n.t(key) : fallback;
    const texto = document.getElementById('resena-texto').value;
    if (window.currentRating === 0) {
        alert(t('resena.modal.selectRating', 'Por favor, selecciona una valoración.'));
        return;
    }

    try {
        const response = await ResenasAPI.enviarResena(window.currentRating, texto);
        if (response.success) {
            alert(t('resena.modal.success', '¡Gracias por tu reseña!'));
            window.closeResenaModal();
            // Resetear
            window.currentRating = 0;
            document.getElementById('resena-texto').value = '';
            window.setRating(0);
        } else {
            alert('Error: ' + response.message);
        }
    } catch (error) {
        console.error(error);
        alert(t('resena.modal.error', 'Hubo un problema al enviar tu reseña.'));
    }
};

// Inicializar el modal cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    injectReviewStyles();
});

// Inyectar estilos específicos para la reseña (Solución para problemas de caché/codificación)
function injectReviewStyles() {
    if (document.getElementById('review-system-styles')) return;

    const css = `
            /* Polished Review Modal Styles (Injected) */
            .modal-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px);
                display: flex; align-items: center; justify-content: center;
                z-index: 9999; opacity: 0; visibility: hidden; transition: all 0.3s ease;
            }
            .modal-overlay.active { opacity: 1; visibility: visible; }
            .resena-modal {
                background: var(--card, #fff); padding: 2.5rem; border-radius: 12px;
                width: 90%; max-width: 500px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                transform: translateY(20px); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                border: 1px solid var(--border, #e2e8f0);
                position: relative;
            }
            .modal-overlay.active .resena-modal { transform: translateY(0); }
            .resena-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
            .resena-title { margin: 0; font-size: 1.5rem; font-weight: 600; color: var(--primary, #1773b0); }
            .close-modal-btn {
                background: none; border: none; font-size: 2rem; line-height: 1;
                cursor: pointer; color: var(--muted-foreground, #64748b); padding: 0; transition: color 0.2s;
            }
            .close-modal-btn:hover { color: var(--foreground, #000); }
            .star-rating { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; justify-content: center; }
            .star-rating button {
                font-size: 2.5rem; color: #e5e7eb; background: none; border: none !important;
                cursor: pointer; transition: transform 0.1s, color 0.1s; padding: 0;
                line-height: 1; outline: none; appearance: none;
            }
            .star-rating button:hover, .star-rating button.hover { color: #fcd34d; transform: scale(1.1); }
            .star-rating button.active { color: #f59e0b; }
            .resena-textarea {
                width: 100%; height: 120px; padding: 1rem;
                border: 1px solid var(--border, #e5e7eb); border-radius: 0.5rem;
                margin-bottom: 2rem; resize: none; font-family: inherit; font-size: 1rem;
                background-color: var(--input-background, #f8f9fa); color: var(--foreground, #000);
                transition: border-color 0.2s, box-shadow 0.2s;
            }
            .resena-textarea:focus {
                outline: none; border-color: var(--primary, #1773b0);
                box-shadow: 0 0 0 2px rgba(23, 115, 176, 0.2);
            }
            .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; }
            .btn-secondary {
                background-color: var(--muted, #f1f5f9); color: var(--muted-foreground, #64748b);
                padding: 0.5rem 1rem; border-radius: 0.625rem; text-decoration: none;
                font-weight: 500; border: none; transition: background-color 0.2s; cursor: pointer;
            }
            .btn-secondary:hover { background-color: #e2e8f0; color: var(--foreground, #000); }
        `;

    const style = document.createElement('style');
    style.id = 'review-system-styles';
    style.textContent = css;
    document.head.appendChild(style);
}
