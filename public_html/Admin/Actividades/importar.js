// ==================== CONFIGURACIÓN API ====================
const API_BASE = "https://api.duobusinesslingo.com";
const getToken = () => localStorage.getItem("jwt_token");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// Helper para parsear respuestas de la API
function parseApiResponse(responseJson) {
  if (responseJson.status === "error") {
    return { success: false, error: responseJson.error || "Error desconocido" };
  }
  const data = responseJson.data;
  if (Array.isArray(data)) {
    return { success: true, data };
  }
  if (data && typeof data === "object") {
    return { success: data.success !== false, ...data };
  }
  return { success: true, data };
}

// ==================== ESTADO GLOBAL ====================
let currentFileData = null;
let bloques = [];

// ==================== INICIALIZACIÓN ====================
document.addEventListener("DOMContentLoaded", function () {
  initDropzone();
  loadBloques();
});

// ==================== CARGAR BLOQUES ====================
async function loadBloques() {
  try {
    const response = await fetch(`${API_BASE}/bloques`, {
      headers: authHeaders(),
    });
    const responseJson = await response.json();
    const result = parseApiResponse(responseJson);

    if (result.success) {
      bloques = result.data || result.bloques || [];
    }
  } catch (error) {
    console.error("Error al cargar bloques:", error);
  }
}

// ==================== PLANTILLA JSON ====================
function downloadTemplate() {
  const template = {
    _instrucciones:
      "Puedes importar un solo bloque o múltiples bloques. Para múltiples bloques, usa el formato 'bloques' (array). Para un solo bloque, usa el formato directo con 'nombreBloque'.",
    _formato_single_bloque:
      "Para un solo bloque, usa: { nombreBloque, descripcion, niveles }",
    _formato_multi_bloque:
      "Para múltiples bloques, usa: { bloques: [ {nombreBloque, niveles}, ... ] }",
    bloques: [
      {
        nombreBloque: "Vocabulario de Negocios",
        descripcion: "Aprende vocabulario esencial para entornos profesionales",
        finalidad: "Business English",
        niveles: {
          1: [
            {
              tipo: "quiz",
              pregunta: "¿Cuál es la traducción de 'meeting'?",
              respuestas: [
                { texto: "Reunión", esCorrecta: true },
                { texto: "Comida", esCorrecta: false },
                { texto: "Descanso", esCorrecta: false },
                { texto: "Trabajo", esCorrecta: false },
              ],
            },
          ],
          2: [
            {
              tipo: "grammar",
              pregunta: "Completa: 'I ___ working on the project yesterday.'",
              respuestas: [
                { texto: "was", esCorrecta: true },
                { texto: "were", esCorrecta: false },
              ],
            },
          ],
        },
      },
      {
        nombreBloque: "Gramática Básica",
        descripcion: "Fundamentos de gramática inglesa",
        finalidad: "Basic English",
        niveles: {
          1: [
            {
              tipo: "grammar",
              pregunta: "Which is correct?",
              respuestas: [
                { texto: "He goes to school", esCorrecta: true },
                { texto: "He go to school", esCorrecta: false },
              ],
            },
          ],
        },
      },
    ],
  };

  const dataStr = JSON.stringify(template, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla_preguntas.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==================== DROPZONE ====================
function initDropzone() {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");

  // Drag & Drop events
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, preventDefaults);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, () => {
      dropzone.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, () => {
      dropzone.classList.remove("dragover");
    });
  });

  dropzone.addEventListener("drop", handleDrop);
  fileInput.addEventListener("change", handleFileSelect);
}

function handleDrop(e) {
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
}

function processFile(file) {
  // Validar tipo de archivo
  if (!file.name.endsWith(".json") && file.type !== "application/json") {
    showError("Por favor, selecciona un archivo JSON válido.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      validateAndPreview(data, file.name);
    } catch (error) {
      showError("El archivo no contiene JSON válido. Verifica el formato.");
    }
  };

  reader.onerror = function () {
    showError("Error al leer el archivo.");
  };

  reader.readAsText(file);
}

// ==================== VALIDACIÓN ====================
function validateAndPreview(data, fileName) {
  hideError();

  // Detectar formato: multi-bloque o single-bloque
  let bloquesAValidar = [];

  if (data.bloques && Array.isArray(data.bloques)) {
    // Formato multi-bloque
    bloquesAValidar = data.bloques;
  } else if (data.nombreBloque) {
    // Formato single-bloque
    bloquesAValidar = [data];
  } else {
    showError(
      'El archivo debe contener "bloques" (array) o "nombreBloque" (texto).'
    );
    return;
  }

  if (bloquesAValidar.length === 0) {
    showError("No se encontraron bloques para importar.");
    return;
  }

  // Validar cada bloque
  let totalPreguntas = 0;
  const errores = [];
  const bloquesValidados = [];

  bloquesAValidar.forEach((bloque, bloqueIdx) => {
    if (!bloque.nombreBloque || typeof bloque.nombreBloque !== "string") {
      errores.push(`Bloque #${bloqueIdx + 1}: falta el campo "nombreBloque".`);
      return;
    }

    if (!bloque.niveles || typeof bloque.niveles !== "object") {
      errores.push(
        `Bloque "${bloque.nombreBloque}": falta el campo "niveles".`
      );
      return;
    }

    let preguntasBloque = 0;
    const nivelesInfo = {};

    for (const [nivel, preguntas] of Object.entries(bloque.niveles)) {
      if (!Array.isArray(preguntas)) {
        errores.push(
          `Bloque "${bloque.nombreBloque}", nivel ${nivel}: debe ser un array de preguntas.`
        );
        continue;
      }

      nivelesInfo[nivel] = preguntas.length;

      preguntas.forEach((pregunta, index) => {
        if (!pregunta.tipo) {
          errores.push(
            `"${bloque.nombreBloque}", nivel ${nivel}, pregunta ${
              index + 1
            }: falta "tipo".`
          );
        }
        if (!pregunta.pregunta) {
          errores.push(
            `"${bloque.nombreBloque}", nivel ${nivel}, pregunta ${
              index + 1
            }: falta "pregunta".`
          );
        }
        if (
          !pregunta.respuestas ||
          !Array.isArray(pregunta.respuestas) ||
          pregunta.respuestas.length < 2
        ) {
          errores.push(
            `"${bloque.nombreBloque}", nivel ${nivel}, pregunta ${
              index + 1
            }: mínimo 2 respuestas.`
          );
        } else {
          const tieneCorrecta = pregunta.respuestas.some(
            (r) => r.esCorrecta === true
          );
          if (!tieneCorrecta) {
            errores.push(
              `"${bloque.nombreBloque}", nivel ${nivel}, pregunta ${
                index + 1
              }: sin respuesta correcta.`
            );
          }
        }
        preguntasBloque++;
      });
    }

    totalPreguntas += preguntasBloque;
    bloquesValidados.push({
      nombreBloque: bloque.nombreBloque,
      descripcion: bloque.descripcion,
      niveles: bloque.niveles,
      nivelesInfo: nivelesInfo,
      totalPreguntas: preguntasBloque,
    });
  });

  if (errores.length > 0) {
    showError(
      "Errores en el archivo:\n• " +
        errores.slice(0, 5).join("\n• ") +
        (errores.length > 5 ? `\n... y ${errores.length - 5} errores más.` : "")
    );
    return;
  }

  if (totalPreguntas === 0) {
    showError("El archivo no contiene ninguna pregunta.");
    return;
  }

  // Guardar datos y mostrar vista previa
  currentFileData = data;
  updateDropzoneSuccess(fileName);

  renderPreview(bloquesValidados, bloquesAValidar.length > 1);
  showImportActions();
}

// ==================== UI UPDATES ====================
function updateDropzoneSuccess(fileName) {
  const dropzone = document.getElementById("dropzone");
  const title = document.getElementById("dropzoneTitle");
  const subtitle = document.getElementById("dropzoneSubtitle");
  const fileNameEl = document.getElementById("fileName");

  dropzone.classList.add("has-file");
  title.textContent = "Archivo cargado correctamente";
  subtitle.style.display = "none";
  fileNameEl.textContent = "📄 " + fileName;
  fileNameEl.style.display = "block";
}

function renderPreview(bloquesValidados, isMultiBloque) {
  const previewSection = document.getElementById("previewSection");
  const previewContent = document.getElementById("previewContent");
  const statBloque = document.getElementById("statBloque");
  const statTotal = document.getElementById("statTotal");

  // Calcular totales
  let totalPreguntas = 0;
  bloquesValidados.forEach(b => totalPreguntas += b.totalPreguntas);

  if (isMultiBloque) {
    // MULTI-BLOQUE: Vista compacta con accordiones
    statBloque.innerHTML = `
      <div style="background: #e3f2fd; padding: 12px; border-radius: 8px; border-left: 4px solid #2196f3; margin-bottom: 12px;">
        <strong style="color: #1976d2;">📦 Importando ${bloquesValidados.length} bloques</strong><br>
        <span style="font-size: 13px; color: #666;">Total: ${totalPreguntas} preguntas</span>
      </div>
    `;

    let html = '<div class="bloques-container" style="display: flex; flex-direction: column; gap: 12px;">';

    bloquesValidados.forEach((bloque, idx) => {
      const bloqueExistente = bloques.find(b => b.nombre.toLowerCase() === bloque.nombreBloque.toLowerCase());
      const badgeStyle = bloqueExistente 
        ? 'background: #fff3cd; color: #f57c00; border-left: 4px solid #ff9800;'
        : 'background: #e8f5e9; color: #2e7d32; border-left: 4px solid #4caf50;';
      const icon = bloqueExistente ? '⚠️' : '🆕';
      const statusText = bloqueExistente ? 'Existente - Se reemplazarán' : 'Nuevo';
      const accordionId = `bloque-accordion-${idx}`;

      html += `
        <div class="bloque-card" style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden; ${badgeStyle}">
          <div onclick="toggleBloque('${accordionId}')" style="padding: 12px; cursor: pointer;">
            <div style="display: flex; justify-content: space-between;">
              <div style="flex: 1;">
                <div style="display: flex; gap: 8px; margin-bottom: 4px;">
                  <strong>${icon} ${escapeHtml(bloque.nombreBloque)}</strong>
                  <span id="${accordionId}-toggle">▼</span>
                </div>
                <div style="font-size: 12px; opacity: 0.8;">
                  ${bloque.totalPreguntas} preguntas • ${Object.keys(bloque.nivelesInfo).length} niveles • ${statusText}
                </div>
              </div>
            </div>
          </div>
          <div id="${accordionId}" style="display: none; border-top: 1px solid rgba(0,0,0,0.1); background: white; padding: 12px; max-height: 300px; overflow-y: auto;">
      `;

      for (const [nivel, preguntas] of Object.entries(bloque.niveles)) {
        if (!Array.isArray(preguntas)) continue;
        html += `
          <div style="margin-bottom: 8px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
            <div style="font-weight: 600; margin-bottom: 4px;">📊 Nivel ${nivel} (${preguntas.length} preguntas)</div>
        `;
        preguntas.slice(0, 3).forEach((p, pIdx) => {
          html += `<div style="font-size: 12px; padding: 4px 0; color: #666;">${pIdx + 1}. ${escapeHtml(p.pregunta).substring(0, 60)}${p.pregunta.length > 60 ? '...' : ''}</div>`;
        });
        if (preguntas.length > 3) {
          html += `<div style="font-size: 11px; padding: 4px 0; color: #999; font-style: italic;">... y ${preguntas.length - 3} más</div>`;
        }
        html += `</div>`;
      }

      html += `</div></div>`;
    });

    html += '</div>';
    previewContent.innerHTML = html;

  } else {
    // SINGLE-BLOQUE: Vista detallada
    const bloque = bloquesValidados[0];
    const bloqueExistente = bloques.find(b => b.nombre.toLowerCase() === bloque.nombreBloque.toLowerCase());

    if (bloqueExistente) {
      statBloque.innerHTML = `
        <div style="background: #fff3cd; padding: 12px; border-radius: 8px; border-left: 4px solid #ff9800; margin-bottom: 12px;">
          <strong style="color: #f57c00;">⚠️ Bloque Existente: ${bloque.nombreBloque}</strong><br>
          <span style="font-size: 13px; color: #666;">Se eliminarán TODAS las preguntas actuales y se reemplazarán con las ${bloque.totalPreguntas} nuevas.</span>
        </div>
      `;
    } else {
      statBloque.innerHTML = `
        <div style="background: #e8f5e9; padding: 12px; border-radius: 8px; border-left: 4px solid #4caf50; margin-bottom: 12px;">
          <strong style="color: #2e7d32;">🆕 Nuevo Bloque: ${bloque.nombreBloque}</strong><br>
          <span style="font-size: 13px; color: #666;">Se creará un bloque nuevo con ${bloque.totalPreguntas} preguntas.</span>
        </div>
      `;
    }

    let html = '';
    for (const [nivel, preguntas] of Object.entries(bloque.niveles)) {
      if (!Array.isArray(preguntas) || preguntas.length === 0) continue;
      html += `
        <div class="level-group">
          <div class="level-title">
            <span>📊 Nivel ${nivel}</span>
            <span class="count">${preguntas.length} preguntas</span>
          </div>
      `;
      preguntas.forEach(pregunta => {
        html += `
          <div class="question-item">
            <div class="type-badge">${pregunta.tipo}</div>
            <div class="question-text">${escapeHtml(pregunta.pregunta)}</div>
            <div class="answers">
        `;
        pregunta.respuestas.forEach(resp => {
          const correctClass = resp.esCorrecta ? 'correct' : '';
          html += `<span class="answer ${correctClass}">${resp.esCorrecta ? '✓ ' : ''}${escapeHtml(resp.texto)}</span>`;
        });
        html += `</div></div>`;
      });
      html += '</div>';
    }
    previewContent.innerHTML = html;
  }

  statTotal.textContent = `Total: ${totalPreguntas} preguntas`;
  previewSection.classList.add("visible");
}

// Función helper para toggle de accordiones
function toggleBloque(id) {
  const content = document.getElementById(id);
  const toggle = document.getElementById(id + '-toggle');
  if (content.style.display === 'none' || content.style.display === '') {
    content.style.display = 'block';
    toggle.textContent = '▲';
  } else {
    content.style.display = 'none';
    toggle.textContent = '▼';
  }
}

function showImportActions() {
  document.getElementById("importActions").style.display = "flex";
}

function hideImportActions() {
  document.getElementById("importActions").style.display = "none";
}

function showError(message) {
  const errorEl = document.getElementById("errorMessage");
  errorEl.textContent = message;
  errorEl.classList.add("visible");
}

function hideError() {
  document.getElementById("errorMessage").classList.remove("visible");
}

function showValidationSuccess(bloquesValidados, isMultiBloque) {
  const successEl = document.getElementById("validationSuccess");
  const detailsEl = document.getElementById("validationDetails");
  
  let message = "";
  let totalPreguntas = 0;
  bloquesValidados.forEach(b => totalPreguntas += b.totalPreguntas);
  
  if (isMultiBloque) {
    message = `Se han validado ${bloquesValidados.length} bloques con un total de ${totalPreguntas} preguntas. `;
    const nuevos = bloquesValidados.filter(b => !bloques.find(bl => bl.nombre.toLowerCase() === b.nombreBloque.toLowerCase())).length;
    const existentes = bloquesValidados.length - nuevos;
    
    if (nuevos > 0 && existentes > 0) {
      message += `Se crearán ${nuevos} nuevos bloques y se reemplazarán ${existentes} existentes.`;
    } else if (nuevos > 0) {
      message += `Se crearán ${nuevos} nuevos bloques.`;
    } else {
      message += `Se reemplazarán ${existentes} bloques existentes.`;
    }
  } else {
    const bloque = bloquesValidados[0];
    const bloqueExistente = bloques.find(b => b.nombre.toLowerCase() === bloque.nombreBloque.toLowerCase());
    
    if (bloqueExistente) {
      message = `Se han validado ${totalPreguntas} preguntas que reemplazarán el bloque "${bloque.nombreBloque}".`;
    } else {
      message = `Se han validado ${totalPreguntas} preguntas para crear el nuevo bloque "${bloque.nombreBloque}".`;
    }
  }
  
  detailsEl.textContent = message;
  successEl.style.display = "block";
}

function hideValidationSuccess() {
  document.getElementById("validationSuccess").style.display = "none";
}

function updateValidationToSuccess(result) {
  const successEl = document.getElementById("validationSuccess");
  const titleEl = successEl.querySelector("h4");
  const detailsEl = document.getElementById("validationDetails");
  
  // Cambiar el título a "Importación completada"
  titleEl.textContent = "✅ Importación completada exitosamente";
  
  let message = "";
  
  if (result.totalBloques && result.totalBloques > 1) {
    message = `Se importaron ${result.totalBloques} bloques con un total de ${result.totalPreguntasImportadas} preguntas.`;
    
    if (result.totalPreguntasEliminadas > 0) {
      message += ` Se eliminaron ${result.totalPreguntasEliminadas} preguntas anteriores.`;
    }
    
    // Detalles por bloque
    if (result.resultados && result.resultados.length > 0) {
      message += "\n\nDetalles: ";
      const detalles = result.resultados.map(r => {
        const icon = r.bloqueExistente ? '⚠️' : '🆕';
        return `${icon} ${r.nombreBloque}: ${r.totalInsertadas} preguntas`;
      });
      message += detalles.join(", ");
    }
  } else {
    if (result.ejerciciosEliminados && result.ejerciciosEliminados > 0) {
      message += `Se eliminaron ${result.ejerciciosEliminados} preguntas anteriores. `;
    }
    
    message += `Se importaron ${result.totalInsertadas || result.totalPreguntasImportadas || 0} preguntas nuevas.`;
    
    if (result.nivelesCreados && result.nivelesCreados > 0) {
      message += ` Se crearon ${result.nivelesCreados} niveles nuevos.`;
    }
  }
  
  detailsEl.textContent = message;
  successEl.style.display = "block";
}


function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function clearFile() {
  currentFileData = null;

  // Reset dropzone
  const dropzone = document.getElementById("dropzone");
  const title = document.getElementById("dropzoneTitle");
  const subtitle = document.getElementById("dropzoneSubtitle");
  const fileNameEl = document.getElementById("fileName");

  dropzone.classList.remove("has-file");
  title.textContent = "Arrastra tu archivo JSON aquí";
  subtitle.style.display = "block";
  fileNameEl.style.display = "none";

  // Reset file input
  document.getElementById("fileInput").value = "";

  // Hide preview and actions
  document.getElementById("previewSection").classList.remove("visible");
  hideImportActions();
  hideError();
  // NO ocultar validationSuccess - debe permanecer visible
  document.getElementById("successMessage").classList.remove("visible");
}

// ==================== IMPORTACIÓN ====================
async function importQuestions() {
  if (!currentFileData) {
    showError("No hay datos para importar.");
    return;
  }

  // Mostrar loading
  document.getElementById("loadingOverlay").classList.add("visible");
  document.getElementById("btnImport").disabled = true;

  try {
    const response = await fetch(`${API_BASE}/ejercicios/bulk`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(currentFileData),
    });

    const responseJson = await response.json();
    const result = parseApiResponse(responseJson);

    if (result.success) {
      // Actualizar el mensaje de validación para mostrar éxito de importación
      updateValidationToSuccess(result);
      
      // Mantener el alert para confirmación
      let confirmMessage = '';
      if (result.totalBloques && result.totalBloques > 1) {
        confirmMessage = `✅ Importación completada exitosamente!\n\n` +
                        `Se importaron ${result.totalBloques} bloques con un total de ${result.totalPreguntasImportadas} preguntas.`;
      } else {
        confirmMessage = `✅ Importación completada exitosamente!\n\n` +
                        `Se importaron ${result.totalInsertadas || result.totalPreguntasImportadas || 0} preguntas.`;
      }
      
      clearFile();
    } else {
      showError(
        "Error al importar: " +
          (result.error || result.message || "Error desconocido")
      );
    }
  } catch (error) {
    console.error("Error:", error);
    showError("Error de conexión al servidor.");
  } finally {
    document.getElementById("loadingOverlay").classList.remove("visible");
    document.getElementById("btnImport").disabled = false;
  }
}

function showSuccess(result) {
  const successEl = document.getElementById("successMessage");
  const detailsEl = document.getElementById("successDetails");

  let details = "";

  // Detectar si es multi-bloque
  if (result.totalBloques && result.totalBloques > 1) {
    details = `✅ Se importaron ${result.totalBloques} bloques con un total de ${result.totalPreguntasImportadas} preguntas.`;
    
    if (result.totalPreguntasEliminadas > 0) {
      details += ` Se eliminaron ${result.totalPreguntasEliminadas} preguntas anteriores.`;
    }

    // Mostrar detalles por bloque
    if (result.resultados && result.resultados.length > 0) {
      details += "\n\nDetalles por bloque:";
      result.resultados.forEach((r, idx) => {
        const icon = r.bloqueExistente ? '⚠️' : '🆕';
        details += `\n${icon} ${r.nombreBloque}: ${r.totalInsertadas} preguntas`;
      });
    }
  } else {
    // Single-bloque
    if (result.ejerciciosEliminados && result.ejerciciosEliminados > 0) {
      details += `Se eliminaron ${result.ejerciciosEliminados} preguntas anteriores. `;
    }

    details += `Se importaron ${result.totalInsertadas || result.totalPreguntasImportadas || 0} preguntas nuevas.`;

    if (result.nivelesCreados && result.nivelesCreados > 0) {
      details += ` Se crearon ${result.nivelesCreados} niveles nuevos.`;
    }
  }

  detailsEl.textContent = details;
  successEl.classList.add("visible");

  // Auto-hide después de 7 segundos
  setTimeout(() => {
    successEl.classList.remove("visible");
  }, 7000);
}

