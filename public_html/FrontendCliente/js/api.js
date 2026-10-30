/**
 * Funciones auxiliares para comunicarse con la API PHP
 * Incluidas en main.js mediante Script tag en el HTML
 */

// Ruta base de la API REST
// Ruta base de la API REST
const API_BASE = '../api_rest/public';

/**
 * Función auxiliar para hacer peticiones fetch
 * Incluye automáticamente el token JWT si está disponible
 */
async function apiFetch(endpoint, options = {}) {
    try {
        const isFormData = options.body instanceof FormData;

        const headers = {
            ...options.headers
        };

        // Solo agregar Content-Type JSON si no es FormData
        // (fetch detecta FormData y pone el boundary automáticamente)
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        // Incluir token JWT si existe (para sincronizar con sesión de visitante)
        const jwtToken = localStorage.getItem('jwt_token');
        if (jwtToken) {
            headers['Authorization'] = `Bearer ${jwtToken}`;
        }

        console.log(`[API Request] ${endpoint}`, 'options: \n', options);
        console.log(`[API Request Headers] ${endpoint}:`, headers);
        const response = await fetch(API_BASE + endpoint, {
            ...options,
            headers: headers,
        });

        console.log(`[API Response Status] ${endpoint}: ${response.status}`);
        let data;
        const text = await response.text();
        console.log(`[API Response Text] ${endpoint}:`, text.substring(0, 200));

        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('Respuesta no es JSON:', text);
            // Si la respuesta no es JSON pero estamos en un 401, probablemente sea un error del servidor o firewall
            // que devuelve HTML, pero aún así deberíamos intentar redirigir si el status es 401
            if (response.status === 401) {
                console.warn('[apiFetch] 401 Unauthorized sin JSON, redirigiendo...');
                window.location.href = 'login.html';
                return null;
            }
            return { success: false, message: `Error del servidor (No-JSON): ${text.substring(0, 50)}`, status: 'error' };
        }

        // Si el backend envía explícitamente requiresLogin o es un 401
        if (data.requiresLogin || response.status === 401) {
            console.log('[apiFetch] Redirigiendo a login (status 401 o requiresLogin)');
            window.location.href = 'login.html';
            return null;
        }

        return data;
    } catch (error) {
        console.error(`[apiFetch ERROR] en ${endpoint}:`, error);
        return {
            success: false,
            message: `Error de conexión: ${error.message || 'No se pudo contactar con el servidor'}`,
            status: 'error'
        };
    }
}

/**
 * API de Autenticación
 */
const AuthAPI = {
    async login(username, password) {
        const res = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: username, password })
        });

        if (res.status === 'ok' && res.data?.token) {
            localStorage.setItem('jwt_token', res.data.token);
        }

        return {
            success: res.status === 'ok',
            message: res.message,
            ...res.data
        };
    },

    async logout() {
        const res = await apiFetch('/auth/logout', {
            method: 'POST'
        });
        localStorage.removeItem('jwt_token');
        return {
            success: res.status === 'ok',
            message: res.message
        };
    }
};

/**
 * API de Bloques
 */
const BloquesAPI = {
    async getBloques() {
        const res = await apiFetch('/bloques/bloques-suscripcion');
        if (!res) {
            console.error('getBloques falló (posible redirección)');
            return { success: false, bloques: [] };
        }
        return {
            success: res.status === 'ok',
            isSuscrito: res.data?.isSuscrito,
            bloques: res.data?.bloques || []
        };
    },

    async getContenidoBloques() {
        const res = await apiFetch('/bloques/progreso-niveles-ejercicios');
        if (!res) return { success: false, bloques: [] };
        return {
            success: res.status === 'ok',
            bloques: res.data?.bloques || []
        };
    },

    async getEjerciciosBloque(idBloque) {
        const res = await apiFetch(`/bloques/filtrar-ejercicios?idBloque=${idBloque}`);
        return {
            success: res.status === 'ok',
            ejercicios: res.data?.ejercicios || []
        };
    },

    async getNiveles(idBloque) {
        const res = await apiFetch(`/bloques/${idBloque}/niveles`);
        return {
            success: res.status === 'ok',
            niveles: res.data?.niveles || []
        };
    },

    async getEjerciciosNivel(idNivel) {
        const res = await apiFetch(`/bloques/filtrar-ejercicios?idNivel=${idNivel}`);
        return {
            success: res.status === 'ok',
            ejercicios: res.data?.ejercicios || []
        };
    },

    async corregirTest(respuestas) {
        const res = await apiFetch('/bloques/corregir', {
            method: 'POST',
            body: JSON.stringify({ respuestas })
        });
        return {
            success: res.status === 'ok',
            ...res.data
        };
    }
};

/**
 * API del Foro
 */
const ForoAPI = {
    async getMensajes() {
        const res = await apiFetch('/foro/mensajes');
        return {
            success: res.status === 'ok',
            mensajes: res.data?.mensajes || []
        };
    },

    async enviarMensaje(mensaje) {
        const res = await apiFetch('/foro/mensajes', {
            method: 'POST',
            body: JSON.stringify({ mensaje })
        });
        return {
            success: res.status === 'ok',
            message: res.message,
            id: res.data?.id
        };
    }
};

/**
 * API de Reseñas
 */
const ResenasAPI = {
    async enviarResena(valoracion, textoOpinion) {
        const res = await apiFetch('/resenas', {
            method: 'POST',
            body: JSON.stringify({ valoracion, textoOpinion })
        });
        return {
            success: res.status === 'ok',
            message: res.message,
            idReseña: res.data?.idReseña
        };
    }
};

/**
 * API de Planes de Suscripción
 */
const PlanesAPI = {
    async getPlanes() {
        const res = await apiFetch('/planes-public');
        return {
            success: res.status === 'ok',
            planes: res.data?.planes || []
        };
    }
};

/**
 * API de Perfil
 */
const PerfilAPI = {
    async getPerfil() {
        console.log('[PerfilAPI] Solicitando perfil...');
        const res = await apiFetch('/usuarios/perfil');
        if (!res) {
            console.warn('[PerfilAPI] No se recibió respuesta (redirección a login?)');
            return { success: false };
        }
        console.log('[PerfilAPI] Respuesta recibida:', res.status);
        return {
            success: res.status === 'ok',
            perfil: res.data?.perfil,
            isSuscrito: res.data?.isSuscrito
        };
    },

    async updateProfile(data) {
        const res = await apiFetch('/usuarios/perfil', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return {
            success: res.status === 'ok',
            message: res.message || res.error
        };
    },

    async updatePassword(currentPassword, newPassword) {
        const res = await apiFetch('/usuarios/password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });
        return {
            success: res.status === 'ok',
            message: res.message || res.error
        };
    },

    async getEstadisticas() {
        const res = await apiFetch('/usuarios/estadisticas');
        if (!res) return { success: false };
        return {
            success: res.status === 'ok',
            estadisticas: res.data
        };
    },

    async getSuscripcion() {
        const res = await apiFetch('/usuarios/suscripcion');
        if (!res) return { success: false };
        return {
            success: res.status === 'ok',
            suscripcion: res.data
        };
    },

    async getPerfilOtroUsuario(username) {
        const res = await apiFetch(`/usuarios/profile/${encodeURIComponent(username)}`);
        return {
            success: res.status === 'ok',
            ...res.data
        };
    },

    async subscribe(planId) {
        const res = await apiFetch('/usuarios/suscripcion', {
            method: 'POST',
            body: JSON.stringify({ planId })
        });
        console.log('[PerfilAPI.subscribe] Response:', res);
        return {
            success: res && res.status === 'ok',
            message: res?.message || res?.error || 'Error desconocido'
        };
    },

    async cancelarSuscripcion() {
        const res = await apiFetch('/usuarios/suscripcion/cancelar', {
            method: 'POST'
        });
        return {
            success: res.status === 'ok',
            message: res.message
        };
    },

    async uploadImagen(formData) {
        const res = await apiFetch('/usuarios/imagen', {
            method: 'POST',
            body: formData
        });
        return {
            success: res.status === 'ok',
            message: res.message,
            url: res.data?.url
        };
    }
};

// Exponer APIs globalmente
window.AuthAPI = AuthAPI;
window.BloquesAPI = BloquesAPI;
window.ForoAPI = ForoAPI;
window.PerfilAPI = PerfilAPI;
window.PlanesAPI = PlanesAPI;
window.ResenasAPI = ResenasAPI;
