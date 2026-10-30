// Función auxiliar para inyectar datos del perfil en el DOM
function inyectarDatosPerfil() {
    // Inyectando datos en el DOM...

    // Inyectar datos del usuario
    if (window.datosUsuarioActual) {
        const nombreInput = document.getElementById('nombre');
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');

        if (nombreInput) nombreInput.value = window.datosUsuarioActual.nombre || '';
        if (usernameInput) usernameInput.value = window.datosUsuarioActual.username || '';
        if (emailInput) emailInput.value = window.datosUsuarioActual.email || '';

        // Datos de usuario inyectados
    }

    // Inyectar estadísticas
    if (window.estadisticasActuales) {
        const stats = window.estadisticasActuales;

        // Buscar todos los elementos con clase stat-value y actualizarlos
        const statValues = document.querySelectorAll('.stat-value');
        if (statValues.length >= 4) {
            statValues[0].textContent = stats.testCompletados || 0;
            statValues[1].textContent = stats.bloquesCompletados || 0;
            statValues[2].textContent = stats.mensajesForo || 0;
            statValues[3].textContent = (stats.porcentajeGlobal || 0) + '%';
        }

        // Estadísticas inyectadas
    }

    // Inyectar datos de suscripción
    if (window.suscripcionActual) {
        const planInput = document.getElementById('plan');
        const precioInput = document.getElementById('precio');
        const fechaInicioInput = document.getElementById('fecha-inicio');
        const fechaFinInput = document.getElementById('fecha-fin');

        if (planInput) planInput.value = window.suscripcionActual.plan || '';
        if (precioInput) precioInput.value = (window.suscripcionActual.precio || '') + '€';
        if (fechaInicioInput) fechaInicioInput.value = window.suscripcionActual.fechaInicio || '';
        if (fechaFinInput) fechaFinInput.value = window.suscripcionActual.fechaFin || '';

        // Datos de suscripción inyectados
    }
}

// Exponer globalmente
window.inyectarDatosPerfil = inyectarDatosPerfil;
