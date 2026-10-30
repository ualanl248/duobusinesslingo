// ==================== CONFIGURACIÓN API ====================
const API_BASE = 'https://api.duobusinesslingo.com';
const getToken = () => localStorage.getItem('jwt_token');
const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

// Helper para parsear respuestas de la API
// La API devuelve { status: "ok", data: ... } o { status: "error", error: "..." }
function parseApiResponse(responseJson) {
    if (responseJson.status === 'error') {
        return { success: false, error: responseJson.error || 'Error desconocido' };
    }
    // Si status es 'ok', los datos están en responseJson.data
    const data = responseJson.data;
    // Si data tiene success explícito, usarlo; sino asumir éxito
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        return { success: data.success !== false, ...data };
    }
    return { success: true, data };
}

// ==================== ESTADO GLOBAL ====================
let bloques = [];

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function () {
    loadBloques();
    initCreateForm();
    initSearch();
});

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    let timeout = null;
    
    searchInput.addEventListener('input', function(e) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            loadBloques(e.target.value);
        }, 300); // Debounce de 300ms
    });
}

// ==================== CARGAR BLOQUES ====================
async function loadBloques(search = '') {
    try {
        let url = `${API_BASE}/bloques`;
        if (search) {
            url += `?search=${encodeURIComponent(search)}`;
        }
        
        const response = await fetch(url, {
            headers: authHeaders()
        });
        const responseJson = await response.json();
        

        // La API devuelve { status: "ok", data: [...] }
        // O puede devolver { status: "ok", data: { success: true, bloques: [...] } }
        const apiData = responseJson.data || responseJson;
        
        // Verificar si es un array directo o un objeto con bloques
        if (Array.isArray(apiData)) {
            bloques = apiData;
            renderBloquesTable();
        } else if (apiData.success !== false) {
            bloques = apiData.data || apiData.bloques || apiData || [];
            renderBloquesTable();
        } else {
            console.error('Error al cargar bloques:', apiData.message || apiData.error);
            showMessage('Error al cargar bloques', 'error');
        }
    } catch (error) {
        console.error('Error al cargar bloques:', error);
        showMessage('Error al cargar bloques', 'error');
    }
}

// ==================== RENDERIZAR TABLA ====================
function renderBloquesTable() {
    const container = document.getElementById('bloquesTableContainer');
    
    if (bloques.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 40px 20px;">No hay bloques creados aún. Crea tu primer bloque usando el formulario de arriba.</p>';
        return;
    }
    
    let tableHTML = `
        <div style="overflow-x: auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 80px;">ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Finalidad</th>
                        <th style="width: 150px;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    bloques.forEach(bloque => {
        const truncatedDesc = bloque.descripcion.length > 100 
            ? bloque.descripcion.substring(0, 100) + '...' 
            : bloque.descripcion;
        
        tableHTML += `
            <tr>
                <td style="font-weight: 600; color: #1773b0;">#${bloque.idBloque}</td>
                <td style="font-weight: 600;">${escapeHtml(bloque.nombre)}</td>
                <td style="color: #6b7280;">${escapeHtml(truncatedDesc)}</td>
                <td><span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">${escapeHtml(bloque.finalidad)}</span></td>
                <td>
                    <div style="display: flex; gap: 8px; justify-content: center;">
                        <button class="btn-icon" onclick="openLevelsModal(${bloque.idBloque})" title="Gestionar Niveles">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="20" x2="12" y2="10"></line>
                                <line x1="18" y1="20" x2="18" y2="4"></line>
                                <line x1="6" y1="20" x2="6" y2="16"></line>
                            </svg>
                        </button>
                        <button class="btn-icon" onclick="openEditModal(${bloque.idBloque})" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
                            </svg>
                        </button>
                        <button class="btn-icon btn-icon-danger" onclick="deleteBloque(${bloque.idBloque}, '${escapeHtml(bloque.nombre)}')" title="Eliminar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
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

// ==================== CREAR BLOQUE ====================
function initCreateForm() {
    const form = document.getElementById('createBloqueForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            nombre: document.getElementById('nombre').value.trim(),
            descripcion: document.getElementById('descripcion').value.trim(),
            finalidad: document.getElementById('finalidad').value.trim()
        };
        
        // Validación
        if (!formData.nombre || !formData.descripcion || !formData.finalidad) {
            showMessage('Por favor, completa todos los campos', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/bloques`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(formData)
            });
            
            const responseJson = await response.json();
            const result = parseApiResponse(responseJson);
            
            if (result.success) {
                showMessage('✅ Bloque creado exitosamente', 'success');
                clearForm();
                loadBloques();
            } else {
                showMessage('❌ Error: ' + (result.error || result.message || 'No se pudo crear el bloque'), 'error');
            }
        } catch (error) {
            console.error('Error al crear bloque:', error);
            showMessage('❌ Error al crear el bloque', 'error');
        }
    });
}

function clearForm() {
    document.getElementById('createBloqueForm').reset();
}

// ==================== EDITAR BLOQUE ====================
function openEditModal(idBloque) {
    const bloque = bloques.find(b => b.idBloque == idBloque);
    if (!bloque) {
        showMessage('Bloque no encontrado', 'error');
        return;
    }
    
    document.getElementById('editIdBloque').value = bloque.idBloque;
    document.getElementById('editNombre').value = bloque.nombre;
    document.getElementById('editDescripcion').value = bloque.descripcion;
    document.getElementById('editFinalidad').value = bloque.finalidad;
    
    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    document.getElementById('editBloqueForm').reset();
}

async function submitEdit() {
    const idBloque = document.getElementById('editIdBloque').value;
    const formData = {
        idBloque: parseInt(idBloque),
        nombre: document.getElementById('editNombre').value.trim(),
        descripcion: document.getElementById('editDescripcion').value.trim(),
        finalidad: document.getElementById('editFinalidad').value.trim()
    };
    
    // Validación
    if (!formData.nombre || !formData.descripcion || !formData.finalidad) {
        showMessage('Por favor, completa todos los campos', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/bloques/${formData.idBloque}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(formData)
        });
        
        const responseJson = await response.json();
        const result = parseApiResponse(responseJson);
        
        if (result.success) {
            showMessage('✅ Bloque actualizado exitosamente', 'success');
            closeEditModal();
            loadBloques();
        } else {
            showMessage('❌ Error: ' + (result.error || result.message || 'No se pudo actualizar el bloque'), 'error');
        }
    } catch (error) {
        console.error('Error al actualizar bloque:', error);
        showMessage('❌ Error al actualizar el bloque', 'error');
    }
}

// Cerrar modal al hacer clic fuera
document.getElementById('editModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeEditModal();
    }
});

// ==================== GESTIÓN DE NIVELES ====================
let currentLevels = [];

async function openLevelsModal(idBloque) {
    document.getElementById('currentBloqueId').value = idBloque;
    await loadLevelsForBloque(idBloque);
    document.getElementById('levelsModal').classList.add('active');
}

function closeLevelsModal() {
    document.getElementById('levelsModal').classList.remove('active');
    document.getElementById('newNivelNumber').value = '';
    currentLevels = [];
}

async function loadLevelsForBloque(idBloque) {
    try {
        const response = await fetch(`${API_BASE}/bloques/${idBloque}/niveles`, {
            headers: authHeaders()
        });
        const responseJson = await response.json();
        const result = parseApiResponse(responseJson);
        
        if (result.success) {
            // Los niveles pueden estar en result.data, result.niveles o directamente en result
            currentLevels = result.niveles || result.data || [];
            renderLevelsTable();
        } else {
            console.error('Error al cargar niveles:', result.error);
            currentLevels = [];
            renderLevelsTable();
        }
    } catch (error) {
        console.error('Error al cargar niveles:', error);
        currentLevels = [];
        renderLevelsTable();
    }
}

function renderLevelsTable() {
    const tbody = document.getElementById('levelsTableBody');
    tbody.innerHTML = '';
    
    if (currentLevels.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center; padding: 20px; color: #6b7280;">No hay niveles configurados.</td></tr>';
        return;
    }
    
    currentLevels.forEach(lvl => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>Nivel ${lvl.nivel}</strong></td>
            <td>
                <button class="btn-icon btn-icon-danger" onclick="deleteNivel(${lvl.idNivel})" title="Eliminar Nivel">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function addNivel() {
    const idBloque = document.getElementById('currentBloqueId').value;
    const nivelNum = document.getElementById('newNivelNumber').value;
    
    if (!nivelNum || nivelNum < 1) {
        alert('Por favor ingresa un número de nivel válido');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/niveles`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                idBloque: parseInt(idBloque),
                nivel: parseInt(nivelNum)
            })
        });
        
        const responseJson = await response.json();
        const result = parseApiResponse(responseJson);
        
        if (result.success) {
            document.getElementById('newNivelNumber').value = '';
            await loadLevelsForBloque(idBloque);
        } else {
            alert('Error: ' + (result.error || result.message || 'No se pudo crear el nivel'));
        }
    } catch (error) {
        console.error('Error al crear nivel:', error);
        alert('Error al crear nivel');
    }
}

async function deleteNivel(idNivel) {
    if (!confirm('¿Estás seguro de eliminar este nivel? Se eliminará la asignación de nivel en las actividades correspondientes.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/niveles/${idNivel}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        
        const responseJson = await response.json();
        const result = parseApiResponse(responseJson);
        
        if (result.success) {
            const idBloque = document.getElementById('currentBloqueId').value;
            await loadLevelsForBloque(idBloque);
        } else {
            alert('Error: ' + (result.error || result.message || 'No se pudo eliminar el nivel'));
        }
    } catch (error) {
        console.error('Error al eliminar nivel:', error);
        alert('Error al eliminar nivel');
    }
}

// Cerrar modales al hacer clic fuera
document.getElementById('levelsModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeLevelsModal();
    }
});

// ==================== ELIMINAR BLOQUE ====================
async function deleteBloque(idBloque, nombre) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el bloque "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/bloques/${idBloque}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        
        const responseJson = await response.json();
        const result = parseApiResponse(responseJson);
        
        if (result.success) {
            showMessage('✅ Bloque eliminado exitosamente', 'success');
            loadBloques();
        } else {
            const errorMsg = result.error || result.message || 'No se pudo eliminar el bloque';
            showMessage('❌ ' + errorMsg, 'error');
        }
    } catch (error) {
        console.error('Error al eliminar bloque:', error);
        showMessage('❌ Error de conexión al eliminar el bloque', 'error');
    }
}

// ==================== UTILIDADES ====================
function showMessage(message, type = 'info') {
    alert(message);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
