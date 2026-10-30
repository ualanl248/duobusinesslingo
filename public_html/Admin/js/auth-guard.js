/**
 * Admin Auth Guard
 * 
 * Protege las páginas de Admin verificando:
 * 1. Que el usuario esté autenticado (tiene sesión activa)
 * 2. Que el usuario sea administrador (esAdmin = 1)
 * 
 * Este script es completamente autónomo y detecta automáticamente
 * su ubicación para usar las rutas correctas.
 */
(function () {
    'use strict';

    // =========================================================================
    // DETECCIÓN AUTOMÁTICA DE RUTAS
    // =========================================================================

    /**
     * Detecta la profundidad de la carpeta actual para construir rutas relativas
     * Ejemplos:
     * - /Admin/app.html -> profundidad 0 -> '../'
     * - /Admin/Actividades/crear.html -> profundidad 1 -> '../../'
     */
    function detectPathDepth() {
        const path = window.location.pathname;
        // Contar cuántas carpetas hay después de /Admin/
        const adminIndex = path.toLowerCase().indexOf('/admin/');
        if (adminIndex === -1) return '../'; // Fallback

        const afterAdmin = path.substring(adminIndex + 7); // 7 = length of '/admin/'
        const segments = afterAdmin.split('/').filter(s => s && !s.includes('.html'));

        // Por cada carpeta después de Admin, necesitamos un '../' adicional
        const depth = segments.length;
        return '../'.repeat(depth + 1);
    }

    const basePath = detectPathDepth();
    const CHECK_AUTH_URL = basePath + 'api-admin/auth/check-status.php';

    // Login siempre está en la raíz del proyecto
    const LOGIN_URL = '/login.html';

    // =========================================================================
    // FUNCIONES DE REDIRECCIÓN
    // =========================================================================

    /**
     * Redirige al login preservando la URL actual para volver después
     */
    function redirectToLogin(reason) {
        console.warn('[Auth Guard] Acceso denegado:', reason);

        // Guardar la URL actual para redireccionar después del login
        const currentUrl = window.location.pathname + window.location.search + window.location.hash;
        const redirectParam = encodeURIComponent(currentUrl);

        window.location.href = LOGIN_URL + '?redirect=' + redirectParam;
    }

    // =========================================================================
    // VERIFICACIÓN DE AUTENTICACIÓN
    // =========================================================================

    /**
     * Verifica el token JWT del usuario
     */
    async function checkAdminSession() {
        try {
            // 1. Obtener el token JWT del localStorage
            const token = localStorage.getItem('jwt_token');

            if (!token) {
                console.warn('[Auth Guard] No se encontró token JWT');
                redirectToLogin('No autenticado - No hay token de sesión');
                return;
            }

            // 2. Decodificar el payload del JWT (sin verificar firma, solo para leer datos)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));

                // 3. Verificar si el token expiró
                const now = Math.floor(Date.now() / 1000);
                if (payload.exp && payload.exp < now) {
                    console.warn('[Auth Guard] Token expirado');
                    localStorage.removeItem('jwt_token');
                    redirectToLogin('Sesión expirada - Por favor inicia sesión nuevamente');
                    return;
                }

                // 4. Verificar que el usuario sea admin
                if (!payload.data || !payload.data.esAdmin) {
                    console.warn('[Auth Guard] Usuario no es admin');
                    redirectToLogin('Usuario no tiene permisos de administrador');
                    return;
                }


                // Disparar evento personalizado
                document.dispatchEvent(new CustomEvent('admin:authenticated', {
                    detail: {
                        email: payload.data.email,
                        id: payload.data.id,
                        esAdmin: payload.data.esAdmin
                    }
                }));

                // Hacer visible el contenido
                if (document.body) {
                    document.body.style.visibility = 'visible';
                    document.body.style.opacity = '1';
                }

            } catch (decodeError) {
                console.error('[Auth Guard] Error al decodificar token:', decodeError);
                localStorage.removeItem('jwt_token');
                redirectToLogin('Token inválido - Por favor inicia sesión nuevamente');
                return;
            }

        } catch (error) {
            console.error('[Auth Guard] Error al verificar autenticación:', error);
            redirectToLogin('Error del sistema al verificar autenticación');
        }
    }

    // =========================================================================
    // PREVENCIÓN DE FLASH DE CONTENIDO (OPCIONAL)
    // =========================================================================

    /**
     * Oculta el body temporalmente para evitar que se vea contenido
     * antes de verificar la autenticación
     * 
     * NOTA: Comentado por defecto para evitar pantallas en blanco si falla JS
     */
    function hideBodyUntilAuth() {
        if (document.body && !window.location.pathname.includes('login.html')) {
            document.body.style.visibility = 'hidden';
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.2s ease-in';
        }
    }

    // Descomentar la siguiente línea si quieres ocultar el contenido hasta verificar auth
    // hideBodyUntilAuth();

    // =========================================================================
    // EJECUCIÓN
    // =========================================================================

    // Ejecutar verificación cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAdminSession);
    } else {
        // DOM ya está listo, ejecutar inmediatamente
        checkAdminSession();
    }

})();
