/**
 * Configuración de API para páginas visitantes
 * Detecta automáticamente el ambiente y usa la URL apropiada
 */

// Configuración por ambiente
const API_CONFIG = {
    production: 'https://api.duobusinesslingo.com',
    development: window.location.origin + '/api_rest/public/index.php'
};

// Detectar ambiente (basado en hostname)
const isProduction =
    window.location.hostname === 'duobusinesslingo.com' ||
    window.location.hostname === 'www.duobusinesslingo.com';

// URL base de API
const API_BASE = isProduction ? API_CONFIG.production : API_CONFIG.development;

/**
 * Helper para construir URLs de API
 * @param {string} endpoint - Endpoint sin / inicial, ej: 'auth/login'
 * @returns {string} URL completa
 */
function apiUrl(endpoint) {
    // Asegurar que endpoint no empiece con /
    endpoint = endpoint.replace(/^\/+/, '');
    return `${API_BASE}/${endpoint}`;
}

/**
 * Helper para hacer peticiones autenticadas
 * @param {string} endpoint 
 * @param {object} options - fetch options
 * @returns {Promise<Response>}
 */
async function fetchAuth(endpoint, options = {}) {
    const token = localStorage.getItem('jwt_token');

    if (!token) {
        throw new Error('No hay token de autenticación');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {})
    };

    return fetch(apiUrl(endpoint), {
        ...options,
        headers
    });
}

/**
 * Guardar token JWT en localStorage
 * @param {string} token 
 */
function saveToken(token) {
    localStorage.setItem('jwt_token', token);
}

/**
 * Eliminar token JWT de localStorage
 */
function clearToken() {
    localStorage.removeItem('jwt_token');
}

/**
 * Verificar si hay un token guardado
 * @returns {boolean}
 */
function hasToken() {
    return !!localStorage.getItem('jwt_token');
}

/**
 * Cerrar sesión automáticamente en páginas visitantes
 * Esto asegura que las páginas públicas (login, register, index) 
 * siempre muestren el estado de "no autenticado"
 */
function clearSessionOnVisitorPages() {
    /* 
    Desactivado para permitir que usuarios autenticados vuelvan a la landing sin perder sesión.
    Si se desea forzar logout en ciertas páginas, hacerlo de forma explícita.
    
    if (hasToken()) {
        console.log('[Config] Cerrando sesión automáticamente en página visitante...');
        clearToken();
    }
    
    window.addEventListener('pageshow', function (event) {
        if (event.persisted && hasToken()) {
            console.log('[Config] Página restaurada de bfcache, cerrando sesión...');
            clearToken();
            window.location.reload();
        }
    });
    */
}

// Log para debug (solo en desarrollo)
if (!isProduction) {
    console.log('[API Config] Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
    console.log('[API Config] API Base URL:', API_BASE);
}
