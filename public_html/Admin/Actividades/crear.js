// ==================== CONFIGURACIÓN API ====================
const API_BASE = 'https://api.duobusinesslingo.com';
const getToken = () => localStorage.getItem('jwt_token');
const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

// Helper para parsear respuestas de la API
function parseApiResponse(responseJson) {
    if (responseJson.status === 'error') {
        return { success: false, error: responseJson.error || 'Error desconocido' };
    }
    const data = responseJson.data;
    if (Array.isArray(data)) {
        return { success: true, data };
    }
    if (data && typeof data === 'object') {
        return { success: data.success !== false, ...data };
    }
    return { success: true, data };
}

// ==================== ESTADO GLOBAL ====================
let bloques = [];
let currentActivityType = '';
let respuestasCount = 0;

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function () {
    loadBloques();
    loadRecentActivities();
    initActivityTypeButtons();
    
    // Listener para cargar niveles cuando cambia el bloque
    document.getElementById('idBloque').addEventListener('change', function() {
        const idBloque = this.value;
        const nivelContainer = document.getElementById('nivelContainer');
        const nivelSelect = document.getElementById('idNivel');
        
        if (idBloque) {
            loadNiveles(idBloque);
            nivelContainer.style.display = 'block';
        } else {
            nivelSelect.innerHTML = '<option value="">-- Selecciona un bloque primero --</option>';
            nivelContainer.style.display = 'none';
        }
    });
});

// ==================== CARGAR BLOQUES ====================
async function loadBloques() {
    try {
        const response = await fetch(`${API_BASE}/bloques`, {
            headers: authHeaders()
        });
        const responseJson = await response.json();
        const result = parseApiResponse(responseJson);
        
        if (result.success) {
            bloques = result.data || result.bloques || [];
            populateBloqueSelect();
        } else {
            console.error('Error al cargar bloques:', result.error);
        }
    } catch (error) {
        console.error('Error al cargar bloques:', error);
    }
}

function populateBloqueSelect() {
    const select = document.getElementById('idBloque');
    select.innerHTML = '<option value="">Seleccionar bloque...</option>';
    
    bloques.forEach(bloque => {
        const option = document.createElement('option');
        option.value = bloque.idBloque;
        option.textContent = `${bloque.nombre} - ${bloque.finalidad || ''}`;
        select.appendChild(option);
    });
}

// ==================== CARGAR NIVELES ====================
async function loadNiveles(idBloque) {
    try {
        const response = await fetch(`${API_BASE}/bloques/${idBloque}/niveles`, {
            headers: authHeaders()
        });
        const responseJson = await response.json();
        const result = parseApiResponse(responseJson);
        
        const select = document.getElementById('idNivel');
        select.innerHTML = '<option value="">Selecciona un nivel...</option>';
        
        const niveles = result.niveles || result.data || [];
        if (result.success && niveles.length > 0) {
            niveles.forEach(nivel => {
                const option = document.createElement('option');
                option.value = nivel.idNivel;
                option.textContent = `Nivel ${nivel.nivel}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar niveles:', error);
    }
}

// ==================== BOTONES DE TIPO DE ACTIVIDAD ====================
function initActivityTypeButtons() {
    document.querySelectorAll('.activity-type-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const type = this.dataset.type;
            openModalForType(type);
        });
    });
}

// ==================== ABRIR MODAL POR TIPO ====================
function openModalForType(type) {
    currentActivityType = type;
    
    // Configurar título e icono del modal
    const icons = {
        'quiz': '📝',
        'grammar': '📚',
        'reading': '📖',
        'listening': '🎧',
        'writing': '✍️',
        'speaking': '🗣️'
    };
    
    const titles = {
        'quiz': 'Crear Quiz',
        'grammar': 'Crear Actividad de Gramática',
        'reading': 'Crear Actividad de Lectura',
        'listening': 'Crear Actividad de Listening',
        'writing': 'Crear Actividad de Escritura',
        'speaking': 'Crear Actividad de Speaking'
    };
    
    document.getElementById('modalIcon').textContent = icons[type] || '📝';
    document.getElementById('modalTitleText').textContent = titles[type] || 'Crear Actividad';
    document.getElementById('activityType').value = type;
    
    // Resetear formulario
    document.getElementById('activityForm').reset();
    document.getElementById('activityType').value = type;
    
    // Resetear niveles UI
    document.getElementById('nivelContainer').style.display = 'none';
    document.getElementById('idNivel').innerHTML = '<option value="">-- Selecciona un bloque primero --</option>';
    
    // Mostrar/ocultar secciones según el tipo
    const respuestasSection = document.getElementById('respuestasSection');
    const manualNote = document.getElementById('manualNote');
    
    if (type === 'quiz' || type === 'grammar' || type === 'reading' || type === 'listening') {
        // Tipos con respuestas múltiples
        respuestasSection.style.display = 'block';
        manualNote.style.display = 'none';
        
        // Inicializar con 2 respuestas por defecto
        document.getElementById('respuestasList').innerHTML = '';
        respuestasCount = 0;
        addRespuesta();
        addRespuesta();
    } else {
        // Writing y Speaking (evaluación manual)
        respuestasSection.style.display = 'none';
        manualNote.style.display = 'block';
    }
    
    // Mostrar modal
    document.getElementById('activityModal').classList.add('active');
}

// ==================== CERRAR MODAL ====================
function closeModal() {
    document.getElementById('activityModal').classList.remove('active');
    document.getElementById('activityForm').reset();
    document.getElementById('respuestasList').innerHTML = '';
    respuestasCount = 0;
}

// Cerrar modal al hacer clic fuera
document.getElementById('activityModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// ==================== GESTIÓN DE RESPUESTAS ====================
function addRespuesta() {
    respuestasCount++;
    const respuestasList = document.getElementById('respuestasList');
    
    const respuestaItem = document.createElement('div');
    respuestaItem.className = 'respuesta-item';
    respuestaItem.dataset.id = respuestasCount;
    respuestaItem.innerHTML = `
        <input type="text" placeholder="Texto de la respuesta..." required>
        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; white-space: nowrap;">
            <input type="checkbox">
            <span style="font-size: 13px; color: #374151;">Correcta</span>
        </label>
        <button type="button" onclick="removeRespuesta(${respuestasCount})">🗑️</button>
    `;
    
    respuestasList.appendChild(respuestaItem);
}

function removeRespuesta(id) {
    const respuestasList = document.getElementById('respuestasList');
    const items = respuestasList.querySelectorAll('.respuesta-item');
    
    // No permitir eliminar si solo quedan 2 respuestas
    if (items.length <= 2) {
        alert('Debe haber al menos 2 respuestas');
        return;
    }
    
    const item = respuestasList.querySelector(`[data-id="${id}"]`);
    if (item) {
        item.remove();
    }
}

// ==================== VALIDACIÓN ====================
function validateForm() {
    const pregunta = document.getElementById('pregunta').value.trim();
    const idBloque = document.getElementById('idBloque').value;
    const idNivel = document.getElementById('idNivel').value;
    
    if (!pregunta) {
        alert('Por favor, ingresa la pregunta o enunciado');
        return false;
    }
    
    if (!idBloque) {
        alert('Por favor, selecciona un bloque');
        return false;
    }

    if (!idNivel) {
        alert('Por favor, selecciona un nivel');
        return false;
    }
    
    // Validar respuestas si es necesario
    if (currentActivityType === 'quiz' || currentActivityType === 'grammar' || 
        currentActivityType === 'reading' || currentActivityType === 'listening') {
        
        const respuestaItems = document.querySelectorAll('.respuesta-item');
        
        if (respuestaItems.length < 2) {
            alert('Debe haber al menos 2 respuestas');
            return false;
        }
        
        let hasCorrect = false;
        let allFilled = true;
        
        respuestaItems.forEach(item => {
            const texto = item.querySelector('input[type="text"]').value.trim();
            const esCorrecta = item.querySelector('input[type="checkbox"]').checked;
            
            if (!texto) {
                allFilled = false;
            }
            
            if (esCorrecta) {
                hasCorrect = true;
            }
        });
        
        if (!allFilled) {
            alert('Por favor, completa todas las respuestas');
            return false;
        }
        
        if (!hasCorrect) {
            alert('Debe haber al menos una respuesta correcta');
            return false;
        }
    }
    
    return true;
}

// ==================== ENVIAR ACTIVIDAD ====================
async function submitActivity() {
    if (!validateForm()) {
        return;
    }
    
    const pregunta = document.getElementById('pregunta').value.trim();
    const idBloque = document.getElementById('idBloque').value;
    const idNivel = document.getElementById('idNivel').value;
    
    // Construir objeto de datos
    const activityData = {
        tipo: currentActivityType,
        pregunta: pregunta,
        idBloque: parseInt(idBloque),
        idNivel: parseInt(idNivel),
        respuestas: []
    };
    
    // Añadir respuestas si aplica
    if (currentActivityType === 'quiz' || currentActivityType === 'grammar' || 
        currentActivityType === 'reading' || currentActivityType === 'listening') {
        
        const respuestaItems = document.querySelectorAll('.respuesta-item');
        respuestaItems.forEach(item => {
            const texto = item.querySelector('input[type="text"]').value.trim();
            const esCorrecta = item.querySelector('input[type="checkbox"]').checked;
            
            activityData.respuestas.push({
                texto: texto,
                esCorrecto: esCorrecta
            });
        });
    } else {
        // Para writing y speaking, añadir una respuesta vacía (requerido por la API)
        activityData.respuestas.push({
            texto: 'Evaluación manual',
            esCorrecto: true
        });
    }
    
    // Enviar a la API
    try {
        const response = await fetch(`${API_BASE}/ejercicios`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(activityData)
        });
        
        const responseJson = await response.json();
        const result = parseApiResponse(responseJson);
        
        if (result.success) {
            alert('✅ Actividad creada exitosamente');
            closeModal();
            loadRecentActivities();
        } else {
            alert('❌ Error: ' + (result.error || result.message || 'No se pudo crear la actividad'));
        }
    } catch (error) {
        console.error('Error al crear actividad:', error);
        alert('❌ Error al crear la actividad. Por favor, intenta de nuevo.');
    }
}

// ==================== CARGAR ACTIVIDADES RECIENTES ====================
async function loadRecentActivities() {
    try {
        const response = await fetch(`${API_BASE}/ejercicios`, {
            headers: authHeaders()
        });
        const responseJson = await response.json();
        const result = parseApiResponse(responseJson);
        
        if (result.success) {
            const activities = result.data || [];
            renderActivitiesList(activities.slice(0, 5));
        }
    } catch (error) {
        console.error('Error al cargar actividades:', error);
    }
}

function renderActivitiesList(activities) {
    const listContainer = document.querySelector('.activities-list');
    if (!listContainer) return;
    
    if (activities.length === 0) {
        listContainer.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 20px;">No hay actividades creadas aún</p>';
        return;
    }
    
    listContainer.innerHTML = '';
    
    activities.forEach(activity => {
        const activityEl = document.createElement('div');
        activityEl.className = 'activity-item';
        activityEl.style.cssText = 'padding: 16px; background: white; border: 1px solid #e5e7eb; border-radius: 8px;';
        
        const truncatedPregunta = activity.pregunta.length > 80 
            ? activity.pregunta.substring(0, 80) + '...' 
            : activity.pregunta;
        
        activityEl.innerHTML = `
            <div style="flex: 1;">
                <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${truncatedPregunta}</div>
                <div style="font-size: 13px; color: #6b7280;">
                    <span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-weight: 500;">${activity.tipo}</span>
                    <span style="margin-left: 8px;">Bloque: ${activity.nombre_bloque || 'N/A'}</span>
                    ${activity.estudiantes_asignados ? `<span style="margin-left: 8px;">👥 ${activity.estudiantes_asignados} estudiantes</span>` : ''}
                </div>
            </div>
        `;
        listContainer.appendChild(activityEl);
    });
}
