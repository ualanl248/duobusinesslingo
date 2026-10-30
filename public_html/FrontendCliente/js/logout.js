/**
 * Función global para manejar el logout
 */
async function handleLogout() {
    if (!confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        return;
    }

    try {
        const response = await AuthAPI.logout();

        if (response.success || response.status === 'success') { // Aceptar ambos formatos
            // Limpiar tokens JWT y datos de usuario del localStorage
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('gsa_register_pending'); // Limpieza preventiva

            // Redirigir a la página principal de visitante
            window.location.href = '../index.html';
        } else {
            // Incluso si falla el backend, limpiamos localmente para forzar salida
            console.warn('Logout backend falló, forzando limpieza local');
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '../index.html';
        }
    } catch (error) {
        console.error('Error en logout:', error);
        // Forzar limpieza y redirección en caso de error
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../index.html';
    }
}

// Exponer globalmente
window.handleLogout = handleLogout;

// Agregar listener al botón de logout cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', handleLogout);
    }
});
