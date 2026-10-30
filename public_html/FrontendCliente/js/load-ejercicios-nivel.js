
// ============== CARGA DE EJERCICIOS POR NIVEL ==============

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
                pregunta: p.pregunta,
                opciones: p.opciones,
                respuestaCorrectaIndex: p.opciones.findIndex(o => o.esCorrecta)
            }));

            // Actualizar el nivel cargado en window.ejerciciosActuales
            const nivelesActuales = window.ejerciciosActuales || [];
            const nivelIndex = nivelesActuales.findIndex(n => n.id === idNivel);

            if (nivelIndex !== -1) {
                nivelesActuales[nivelIndex].preguntas = preguntasFormateadas;
                nivelesActuales[nivelIndex].preguntasCargadas = true;
            }

            // Navegar a la vista de test (ejercicios del nivel)
            state.testSeleccionado = idNivel;
            state.bloqueSeleccionado = bloqueId;
            state.currentScreen = 'test-detalle';
            renderCurrentScreen();
        }
    } catch (error) {
        console.error('Error cargando ejercicios del nivel:', error);
        alert('Error al cargar los ejercicios del nivel.');
    }
}

// Exponer globalmente
window.loadEjerciciosNivel = loadEjerciciosNivel;
