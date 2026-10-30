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
let actividades = [];
let selectedBloque = null;
let selectedNivel = null;
let editingActivity = null;
let deletingActivityId = null;
let editRespuestasCount = 0;

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function () {
    init();
});

async function init() {
    await loadBloques();
    setupEventListeners();
}

function setupEventListeners() {
    // Selector de bloques (Filtro)
    document.getElementById('bloqueSelector').addEventListener('change', function(e) {
        const idBloque = e.target.value;
        const nivelContainer = document.getElementById('nivelFilterContainer');
        const nivelSelector = document.getElementById('nivelSelector');
        
        // Reset actividades
        document.getElementById('actividadesSection').style.display = 'none';
        
        if (idBloque) {
            selectedBloque = parseInt(idBloque);
            loadNiveles(selectedBloque, 'nivelSelector'); // Cargar niveles en el filtro
            nivelContainer.style.display = 'block';
        } else {
            selectedBloque = null;
            nivelContainer.style.display = 'none';
            nivelSelector.innerHTML = '<option value="">-- Selecciona un bloque --</option>';
        }
    });

    // Selector de niveles (Filtro)
    document.getElementById('nivelSelector').addEventListener('change', function(e) {
        const idNivel = e.target.value;
        const searchInput = document.getElementById('searchInput'); // Obtener input
        searchInput.value = ''; // Limpiar búsqueda al cambiar nivel

        if (idNivel) {
            selectedNivel = parseInt(idNivel);
            loadActividades(selectedBloque, selectedNivel);
        } else {
            selectedNivel = null;
            document.getElementById('actividadesSection').style.display = 'none';
        }
    });

    // Buscador
    const searchInput = document.getElementById('searchInput');
    let timeout = null;
    searchInput.addEventListener('input', function(e) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const term = e.target.value.trim();
            // Siempre necesitamos bloque y nivel seleccionados
            if (selectedBloque && selectedNivel) {
                 loadActividades(selectedBloque, selectedNivel, term);
            }
        }, 300);
    });
    
    // Tipo de actividad en modal de edición
    document.getElementById('editTipo').addEventListener('change', function(e) {
        toggleRespuestasSection(e.target.value);
    });

    // Bloque en modal de edición (Cargar niveles)
    document.getElementById('editBloque').addEventListener('change', function(e) {
        const idBloque = e.target.value;
        if(idBloque) {
            loadNiveles(idBloque, 'editNivel');
        } else {
            document.getElementById('editNivel').innerHTML = '<option value="">-- Selecciona un bloque primero --</option>';
        }
    });
}

// ==================== CARGAR BLOQUES ====================
async function loadBloques() {
    try {
        const response = await fetch(`${API_BASE}/bloques`, {
            headers: authHeaders()
        });
        const responseJson = await response.json();
        const result = parseApiResponse(responseJson);
        
        if (result.success) {
            bloques = result.data || [];
            renderBloqueSelector();
            renderEditBloqueSelector();
        } else {
            console.error('Error al cargar bloques:', result.error);
            alert('Error al cargar bloques');
        }
    } catch (error) {
        console.error('Error al cargar bloques:', error);
        alert('Error al cargar bloques');
    }
}

// ==================== CARGAR NIVELES ====================
async function loadNiveles(idBloque, targetSelectId, selectedNivelId = null) {
    try {
        const response = await fetch(`${API_BASE}/bloques/${idBloque}/niveles`, {
            headers: authHeaders()
        });
        const responseJson = await response.json();
        const result = parseApiResponse(responseJson);
        
        const select = document.getElementById(targetSelectId);
        select.innerHTML = '<option value="">-- Selecciona un nivel --</option>';
        
        const niveles = result.niveles || result.data || [];
        if (result.success && niveles.length > 0) {
            niveles.forEach(nivel => {
                const option = document.createElement('option');
                option.value = nivel.idNivel;
                option.textContent = `Nivel ${nivel.nivel}`;
                if (selectedNivelId && selectedNivelId == nivel.idNivel) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar niveles:', error);
    }
}


function renderBloqueSelector() {
    const selector = document.getElementById('bloqueSelector');
    selector.innerHTML = '<option value="">-- Selecciona un bloque --</option>';
    
    bloques.forEach(bloque => {
        const option = document.createElement('option');
        option.value = bloque.idBloque;
        option.textContent = `${bloque.nombre} - ${bloque.finalidad}`;
        selector.appendChild(option);
    });
}

function renderEditBloqueSelector() {
    const selector = document.getElementById('editBloque');
    selector.innerHTML = '<option value="">-- Selecciona un bloque --</option>';
    
    bloques.forEach(bloque => {
        const option = document.createElement('option');
        option.value = bloque.idBloque;
        option.textContent = `${bloque.nombre} - ${bloque.finalidad}`;
        selector.appendChild(option);
    });
}

// ==================== CARGAR ACTIVIDADES ====================
async function loadActividades(idBloque, idNivel, search = '') {
    try {
        let url = `${API_BASE}/ejercicios?idBloque=${idBloque}&idNivel=${idNivel}`;
        
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }

        const response = await fetch(url, {
            headers: authHeaders()
        });
        const responseJson = await response.json();
        const result = parseApiResponse(responseJson);
        
        if (result.success) {
            actividades = result.data || [];
            document.getElementById('actividadesSection').style.display = 'block';
            renderActividadesTable();
        } else {
            console.error('Error al cargar actividades:', result.error);
            alert('Error al cargar actividades');
        }
    } catch (error) {
        console.error('Error al cargar actividades:', error);
        alert('Error al cargar actividades');
    }
}

function renderActividadesTable() {
    const container = document.getElementById('actividadesTableContainer');
    
    if (actividades.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 40px 20px;">No hay actividades en este nivel.</p>';
        return;
    }
    
    let tableHTML = `
        <div style="overflow-x: auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 80px;">ID</th>
                        <th style="width: 120px;">Tipo</th>
                        <th>Pregunta</th>
                        <th style="width: 180px;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    actividades.forEach(actividad => {
        const truncatedPregunta = actividad.pregunta.length > 100 
            ? actividad.pregunta.substring(0, 100) + '...' 
            : actividad.pregunta;
        
        const tipoBadge = getTipoBadge(actividad.tipo);
        
        tableHTML += `
            <tr>
                <td style="font-weight: 600; color: #1773b0;">#${actividad.idEjercicio}</td>
                <td>${tipoBadge}</td>
                <td>${escapeHtml(truncatedPregunta)}</td>
                <td>
                    <button class="btn-icon" onclick="editActivity(${actividad.idEjercicio})" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon btn-icon-danger" onclick="deleteActivity(${actividad.idEjercicio})" title="Eliminar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHTML;
}

function getTipoBadge(tipo) {
    const badges = {
        'quiz': '<span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Quiz</span>',
        'grammar': '<span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Gramática</span>',
        'reading': '<span style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Lectura</span>',
        'listening': '<span style="background: #fce7f3; color: #831843; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Listening</span>',
        'writing': '<span style="background: #e0e7ff; color: #3730a3; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Escritura</span>',
        'speaking': '<span style="background: #fed7aa; color: #9a3412; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Speaking</span>'
    };
    return badges[tipo] || tipo;
}

// ==================== EDITAR ACTIVIDAD ====================
async function editActivity(idEjercicio) {
    try {
        const response = await fetch(`${API_BASE}/ejercicios/${idEjercicio}`, {
            headers: authHeaders()
        });
        const responseJson = await response.json();
        const result = parseApiResponse(responseJson);
        
        if (result.success) {
            editingActivity = result.data || result;
            await fillEditModal(editingActivity);
            openEditModal();
        } else {
            alert('Error al cargar detalles de la actividad');
        }
    } catch (error) {
        console.error('Error al cargar actividad:', error);
        alert('Error al cargar actividad');
    }
}

async function fillEditModal(activity) {
    document.getElementById('editIdEjercicio').value = activity.idEjercicio;
    document.getElementById('editTipo').value = activity.tipo;
    document.getElementById('editPregunta').value = activity.pregunta;
    document.getElementById('editBloque').value = activity.idBloque;
    
    // Cargar niveles del bloque y seleccionar el correcto
    if (activity.idBloque) {
        await loadNiveles(activity.idBloque, 'editNivel', activity.idNivel);
    }
    
    // Cargar respuestas si existen
    toggleRespuestasSection(activity.tipo);
    
    if (activity.respuestas && activity.respuestas.length > 0) {
        const respuestasList = document.getElementById('editRespuestasList');
        respuestasList.innerHTML = '';
        editRespuestasCount = 0;
        
        activity.respuestas.forEach(respuesta => {
            addEditRespuestaWithData(respuesta);
        });
    }
}

function toggleRespuestasSection(tipo) {
// ... (mismo código)
    const respuestasSection = document.getElementById('editRespuestasSection');
    const manualNote = document.getElementById('editManualNote');
    
    if (tipo === 'writing' || tipo === 'speaking') {
        respuestasSection.style.display = 'none';
        manualNote.style.display = 'block';
    } else {
        respuestasSection.style.display = 'block';
        manualNote.style.display = 'none';
    }
}

function addEditRespuesta() {
    addEditRespuestaWithData({ idRespuesta: null, texto: '', esCorrecta: 0 });
}

function addEditRespuestaWithData(respuesta) {
// ... (mismo código)
    const respuestasList = document.getElementById('editRespuestasList');
    const index = editRespuestasCount++;
    
    const respuestaDiv = document.createElement('div');
    respuestaDiv.className = 'respuesta-item';
    respuestaDiv.dataset.index = index;
    if (respuesta.idRespuesta) {
        respuestaDiv.dataset.idRespuesta = respuesta.idRespuesta;
    }
    
    respuestaDiv.innerHTML = `
        <input type="text" placeholder="Texto de la respuesta" value="${escapeHtml(respuesta.texto)}" data-field="texto" />
        <label style="display: flex; align-items: center; gap: 6px; white-space: nowrap;">
            <input type="checkbox" ${respuesta.esCorrecta ? 'checked' : ''} data-field="correcta" />
            <span style="font-size: 14px;">Correcta</span>
        </label>
        <button type="button" onclick="removeEditRespuesta(${index})">Eliminar</button>
    `;
    
    respuestasList.appendChild(respuestaDiv);
}

function removeEditRespuesta(index) {
// ... (mismo código)
    const respuesta = document.querySelector(`.respuesta-item[data-index="${index}"]`);
    if (respuesta) {
        respuesta.remove();
    }
}

function collectEditRespuestas() {
// ... (mismo código)
    const respuestas = [];
    const items = document.querySelectorAll('#editRespuestasList .respuesta-item');
    
    items.forEach(item => {
        const idRespuesta = item.dataset.idRespuesta || null;
        const texto = item.querySelector('[data-field="texto"]').value.trim();
        const esCorrecta = item.querySelector('[data-field="correcta"]').checked ? 1 : 0;
        
        if (texto) {
            respuestas.push({
                idRespuesta: idRespuesta ? parseInt(idRespuesta) : null,
                texto,
                esCorrecta
            });
        }
    });
    
    return respuestas;
}

function openEditModal() {
    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    document.getElementById('editActivityForm').reset();
    editingActivity = null;
}

async function submitEdit() {
    const tipo = document.getElementById('editTipo').value;
    const pregunta = document.getElementById('editPregunta').value.trim();
    const idBloque = document.getElementById('editBloque').value;
    const idNivel = document.getElementById('editNivel').value;
    
    if (!pregunta || !idBloque || !idNivel) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }
    
    const formData = {
        idEjercicio: editingActivity.idEjercicio,
        tipo,
        pregunta,
        idBloque: parseInt(idBloque),
        idNivel: parseInt(idNivel)
    };
    
    // Solo incluir respuestas si el tipo las requiere
    if (tipo !== 'writing' && tipo !== 'speaking') {
        const respuestas = collectEditRespuestas();
        
        if (respuestas.length === 0) {
            alert('Debes añadir al menos una respuesta');
            return;
        }
        
        const tieneCorrecta = respuestas.some(r => r.esCorrecta === 1);
        if (!tieneCorrecta) {
            alert('Debes marcar al menos una respuesta como correcta');
            return;
        }
        
        formData.respuestas = respuestas;
    }
    
    try {
        const response = await fetch(`${API_BASE}/ejercicios/${editingActivity.idEjercicio}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(formData)
        });
        
        const responseJson = await response.json();
        const result = parseApiResponse(responseJson);
        
        if (result.success) {
            alert('✅ Actividad actualizada exitosamente');
            closeEditModal();
            loadActividades(selectedBloque, selectedNivel);
        } else {
            alert('❌ Error: ' + (result.error || result.message || 'No se pudo actualizar la actividad'));
        }
    } catch (error) {
        console.error('Error al actualizar actividad:', error);
        alert('❌ Error al actualizar la actividad');
    }
}

// ==================== ELIMINAR ACTIVIDAD ====================
function deleteActivity(idEjercicio) {
    deletingActivityId = idEjercicio;
    const activity = actividades.find(a => a.idEjercicio == idEjercicio);
    
    if (activity) {
        fillDeleteModal(activity);
        openDeleteModal();
    }
}

function fillDeleteModal(activity) {
    document.getElementById('deleteActivityPregunta').textContent = activity.pregunta;
    document.getElementById('deleteActivityTipo').textContent = activity.tipo;
    
    const bloque = bloques.find(b => b.idBloque == activity.idBloque);
    document.getElementById('deleteActivityBloque').textContent = bloque ? bloque.nombre : 'N/A';
}

function openDeleteModal() {
    document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    deletingActivityId = null;
}

async function confirmDelete() {
    if (!deletingActivityId) return;
    
    try {
        const response = await fetch(`${API_BASE}/ejercicios/${deletingActivityId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        
        const responseJson = await response.json();
        const result = parseApiResponse(responseJson);
        
        if (result.success) {
            alert('✅ Actividad eliminada exitosamente');
            closeDeleteModal();
            loadActividades(selectedBloque, selectedNivel);
        } else {
            alert('❌ Error: ' + (result.error || result.message || 'No se pudo eliminar la actividad'));
        }
    } catch (error) {
        console.error('Error al eliminar actividad:', error);
        alert('❌ Error al eliminar la actividad');
    }
}

// Cerrar modales al hacer clic fuera
document.getElementById('editModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeEditModal();
    }
});

document.getElementById('deleteModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeDeleteModal();
    }
});

// ==================== UTILIDADES ====================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
