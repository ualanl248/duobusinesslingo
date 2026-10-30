/**
 * Assessment Form - Versión 2.0 con APIs Dinámicas
 * 
 * Carga preguntas desde /api/assessment/preguntas.php
 * Calcula bloques desde /api/assessment/calcular.php
 * Soporta selección múltiple según configuración
 */
(() => {
  const STORAGE_KEY = 'gsa_lang';

  // Catálogo de bloques (se usará como fallback o para catálogo local)
  const BLOCK_CATALOG = [
    { id: 1, name: 'Inglés para el Trabajo', desc: 'Correos, reuniones y vocabulario profesional.' },
    { id: 2, name: 'Inglés para Viajar', desc: 'Frases útiles, reservas, emergencias y cultura.' },
    { id: 3, name: 'Inglés Académico', desc: 'Ensayos, abstracts y vocabulario universitario.' },
    { id: 4, name: 'Club de Conversación', desc: 'Temas cotidianos, slang útil y expresiones naturales.' },
    { id: 5, name: 'Pronunciación y Fluidez', desc: 'Patrones sonoros, ritmo y claridad al hablar.' },
    { id: 6, name: 'Listening en la Vida Real', desc: 'Audios diarios, acentos y comprensión rápida.' },
    { id: 7, name: 'Writing Profesional', desc: 'Estructura correos y reportes sin errores.' },
    { id: 8, name: 'Lectura y Vocabulario', desc: 'Comprensión rápida y ampliación de palabras.' },
    { id: 9, name: 'Ruta Intensiva', desc: 'Plan corto y frecuente para avanzar rápido.' },
    { id: 10, name: 'Hábito Diario', desc: 'Rutina ligera para mantener constancia.' },
    { id: 11, name: 'Presentaciones y Storytelling', desc: 'Estructura ideas y gana seguridad al exponer.' },
    { id: 12, name: 'Entrevistas y CV', desc: 'Responde preguntas típicas y mejora tu pitch.' }
  ];

  // Iconos para las opciones
  const OPTION_ICONS = {
    '💼': '💼', '✈️': '✈️', '🎓': '🎓', '✨': '✨',
    '🌱': '🌱', '📊': '📊', '🏆': '🏆', '❓': '❓',
    '📧': '📧', '☀️': '☀️', '📽️': '📽️', '👥': '👥',
    '⏱️': '⏱️', '⌛': '⌛', '📅': '📅', '🔀': '🔀',
    '🎙️': '🎙️', '👂': '👂', '✏️': '✏️', '📖': '📖'
  };

  // Textos de UI por idioma
  const UI = {
    ES: {
      next: 'Siguiente',
      prev: 'Anterior',
      start: 'Empezar prueba',
      loading: 'Cargando...',
      loadingBtn: 'Cargando...',
      alertPick: 'Selecciona una opción para continuar',
      alertPickMultiple: 'Selecciona al menos una opción',
      alertStartFail: 'No se pudo iniciar la prueba',
      multipleHint: 'Puedes seleccionar varias opciones'
    },
    EN: {
      next: 'Next',
      prev: 'Back',
      start: 'Start trial',
      loading: 'Loading...',
      loadingBtn: 'Loading...',
      alertPick: 'Pick an option to continue',
      alertPickMultiple: 'Pick at least one option',
      alertStartFail: 'Could not start the trial',
      multipleHint: 'You can select multiple options'
    },
    PT: {
      next: 'Seguinte',
      prev: 'Anterior',
      start: 'Iniciar teste',
      loading: 'A carregar...',
      loadingBtn: 'A carregar...',
      alertPick: 'Escolhe uma opção para continuar',
      alertPickMultiple: 'Escolhe pelo menos uma opção',
      alertStartFail: 'Não foi possível iniciar o teste',
      multipleHint: 'Podes selecionar várias opções'
    }
  };

  // -- Estado de la Aplicación --
  const state = {
    step: 0,
    answers: {},       // { questionId: [opcionId1, opcionId2] } o { questionId: opcionId }
    questions: [],     // Cargadas desde API
    loading: true,
    error: null
  };

  // -- Referencias DOM (IDs en camelCase como en assessment.html) --
  const progressBar = document.getElementById('progressBar');
  const stepLabel = document.getElementById('stepLabel');
  const totalSteps = document.getElementById('totalSteps');
  const percentValue = document.getElementById('percentValue');
  const questionTitle = document.getElementById('questionTitle');
  const optionsList = document.getElementById('optionsList');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  // -- Helpers de Idioma --
  function normalizeLang(raw) {
    if (!raw) return null;
    const v = String(raw).trim().toUpperCase();
    if (v.startsWith('ES')) return 'ES';
    if (v.startsWith('EN')) return 'EN';
    if (v.startsWith('PT')) return 'PT';
    return null;
  }

  const getLang = () => {
    const stored = normalizeLang(localStorage.getItem(STORAGE_KEY));
    if (stored) return stored;
    const api = normalizeLang(window.GSA_I18N?.getLanguage?.());
    if (api) return api;
    return 'ES';
  };

  const getLangCode = () => getLang().toLowerCase();
  function ui() { return UI[getLang()] || UI.ES; }

  // -- Cargar Preguntas desde API --
  async function loadQuestions() {
    state.loading = true;
    state.error = null;
    renderLoading();

    try {
      const lang = getLangCode();
      const res = await fetch(apiUrl(`assessment/preguntas?lang=${lang}`));
      const data = await res.json();

      // api_rest devuelve { status: 'ok', data: { preguntas: [...] } }
      if (data.status === 'ok' && Array.isArray(data.data?.preguntas)) {
        state.questions = data.data.preguntas;
        state.loading = false;
        render();
      } else {
        throw new Error(data.message || data.error || 'Error loading questions');
      }
    } catch (err) {
      console.error('Error loading questions:', err);
      state.error = err.message;
      state.loading = false;
      renderError();
    }
  }

  // -- Calcular Bloques desde API --
  async function calculateBlocks() {
    // Recoger todos los IDs de opciones seleccionadas
    const selectedOptionIds = [];

    for (const q of state.questions) {
      const answer = state.answers[q.id];
      if (Array.isArray(answer)) {
        selectedOptionIds.push(...answer);
      } else if (typeof answer === 'number') {
        selectedOptionIds.push(answer);
      }
    }

    if (selectedOptionIds.length === 0) {
      console.warn('No options selected, using fallback');
      return [1, 2, 3]; // Fallback
    }

    try {
      const res = await fetch(apiUrl('assessment/calcular'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opciones: selectedOptionIds })
      });
      const data = await res.json();

      // api_rest devuelve { status: 'ok', data: { bloques: [...] } }
      if (data.status === 'ok' && Array.isArray(data.data?.bloques)) {
        return data.data.bloques.map(b => b.id_bloque || b.id);
      } else {
        throw new Error(data.message || data.error || 'Error calculating blocks');
      }
    } catch (err) {
      console.error('Error calculating blocks:', err);
      return [1, 2, 3]; // Fallback
    }
  }

  // -- Renderizado de Estados --
  function renderLoading() {
    if (questionTitle) questionTitle.textContent = ui().loading;
    if (optionsList) optionsList.innerHTML = '<p style="text-align:center;color:#666;">⏳ ' + ui().loading + '</p>';
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) { nextBtn.textContent = ui().loadingBtn; nextBtn.disabled = true; }
  }

  function renderError() {
    if (questionTitle) questionTitle.textContent = '⚠️ Error';
    if (optionsList) optionsList.innerHTML = `<p style="text-align:center;color:#ef4444;">${state.error}</p>`;
    if (nextBtn) { nextBtn.textContent = 'Reintentar'; nextBtn.disabled = false; }
    nextBtn?.addEventListener('click', loadQuestions, { once: true });
  }

  // -- Mensaje de Error Inline --
  const errorMsg = document.createElement('div');
  errorMsg.style.cssText = 'color: #ef4444; margin-bottom: 16px; font-weight: 500; display: none; text-align: center;';
  if (optionsList?.parentNode) {
    optionsList.parentNode.insertBefore(errorMsg, optionsList.nextSibling);
  }

  // -- Renderizado Principal --
  function render() {
    if (state.loading) return renderLoading();
    if (state.error) return renderError();

    renderProgress();
    renderQuestion();
  }

  function renderProgress() {
    const total = state.questions.length;
    if (totalSteps) totalSteps.textContent = String(total);

    const pct = Math.round(((state.step + 1) / total) * 100);
    if (stepLabel) stepLabel.textContent = String(state.step + 1);
    if (percentValue) percentValue.textContent = pct + '%';
    if (progressBar) progressBar.style.width = pct + '%';
  }

  function renderQuestion() {
    errorMsg.style.display = 'none';

    const q = state.questions[state.step];
    if (!q) return;

    // Título de la pregunta
    if (questionTitle) {
      // Forzar actualización si hay texto, fallback a string vacío
      const titulo = q.texto || '';
      if (questionTitle.textContent !== titulo) {
        questionTitle.textContent = titulo;
      }
      // Debug
      // console.log('[Render] Título actualizado a:', titulo);
    }

    // Indicador de selección múltiple
    const isMultiple = q.permite_multiple;

    // Helper para iconos (Fallback básico si falla BBDD)
    const getFallbackIcon = (text) => {
      const t = (text || '').toLowerCase();
      // Solo mantenemos categorías muy generales como última red de seguridad
      if (t.includes('viaj') || t.includes('travel') || t.includes('turis')) return '✈️';
      if (t.includes('trabaj') || t.includes('work') || t.includes('job')) return '�';
      if (t.includes('acad') || t.includes('estud') || t.includes('school')) return '🎓';
      if (t.includes('convers') || t.includes('speak') || t.includes('talk')) return '💬';
      return '';
    };

    // Limpiar y renderizar opciones
    if (optionsList) {
      optionsList.innerHTML = '';

      // Añadir hint si es múltiple
      if (isMultiple) {
        const hint = document.createElement('p');
        hint.className = 'multiple-hint';
        hint.style.cssText = 'text-align: center; color: #6366f1; font-size: 0.9em; margin-bottom: 24px;';
        hint.textContent = '✓ ' + ui().multipleHint;
        optionsList.appendChild(hint);
      }

      (q.opciones || []).forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';

        // Determinar si está seleccionada
        const currentAnswer = state.answers[q.id];
        let isSelected = false;

        if (isMultiple) {
          isSelected = Array.isArray(currentAnswer) && currentAnswer.includes(opt.id);
        } else {
          isSelected = currentAnswer === opt.id;
        }

        // Determinar icono
        // Prioridad TOTAL al icono que viene de BBDD.
        // Solo usamos fallback si es null o '?' (por si acaso).
        let iconChar = opt.icono;
        if (!iconChar || iconChar === '?' || iconChar.trim() === '') {
          iconChar = getFallbackIcon(opt.texto);
        }

        btn.className = 'option' + (isSelected ? ' selected' : '');
        btn.innerHTML = `
          <div class="option-icon">${iconChar}</div>
          <div class="option-text">${opt.texto}</div>
          <div class="option-check">${isSelected ? '✓' : ''}</div>
        `;

        btn.addEventListener('click', () => {
          if (isMultiple) {
            // Toggle en array
            let arr = Array.isArray(state.answers[q.id]) ? [...state.answers[q.id]] : [];
            if (arr.includes(opt.id)) {
              arr = arr.filter(id => id !== opt.id);
            } else {
              arr.push(opt.id);
            }
            state.answers[q.id] = arr;
          } else {
            // Solo una opción
            state.answers[q.id] = opt.id;
          }
          errorMsg.style.display = 'none';
          renderQuestion();
        });

        optionsList.appendChild(btn);
      });
    }

    // Botones de navegación
    if (prevBtn) prevBtn.style.display = state.step === 0 ? 'none' : 'inline-flex';
    if (nextBtn) {
      nextBtn.textContent = state.step < state.questions.length - 1 ? ui().next : ui().start;
      nextBtn.disabled = false;
    }
    if (prevBtn) prevBtn.textContent = ui().prev;
  }

  // -- Validación --
  function validateCurrentStep() {
    const q = state.questions[state.step];
    if (!q) return false;

    const answer = state.answers[q.id];

    if (q.permite_multiple) {
      // Al menos una opción seleccionada
      if (!Array.isArray(answer) || answer.length === 0) {
        errorMsg.textContent = ui().alertPickMultiple;
        errorMsg.style.display = 'block';
        return false;
      }
    } else {
      // Una opción seleccionada
      if (answer === undefined || answer === null) {
        errorMsg.textContent = ui().alertPick;
        errorMsg.style.display = 'block';
        return false;
      }
    }
    return true;
  }

  // -- Finalizar Assessment --
  async function startTrial() {
    if (nextBtn) { nextBtn.textContent = ui().loadingBtn; nextBtn.disabled = true; }

    try {
      // Calcular bloques desde API
      const selectedBlocks = await calculateBlocks();

      if (!Array.isArray(selectedBlocks) || selectedBlocks.length === 0) {
        throw new Error('No blocks returned');
      }

      const trialToken = `local-${Date.now()}`;
      const meta = {
        answers: state.answers,
        timestamp: Date.now()
      };

      // Guardar en localStorage para el trial y registro
      localStorage.setItem('gsa_trial_token', trialToken);
      localStorage.setItem('gsa_trial_blocks', JSON.stringify(selectedBlocks));
      localStorage.setItem('gsa_trial_answers', JSON.stringify(meta));
      localStorage.setItem('gsa_block_catalog', JSON.stringify(BLOCK_CATALOG));

      // *** Verificar si el usuario viene del registro ***
      const urlParams = new URLSearchParams(window.location.search);
      const fromRegister = urlParams.get('from') === 'register' || urlParams.get('flow') === 'pending_reg';

      if (fromRegister) {
        // Usuario viene del formulario de registro (pero NO está logueado aún)
        // Los bloques ya están guardados en localStorage
        // Redirigir a trial.html para que complete la prueba
        console.log('[Assessment] Usuario viene de registro. Redirigiendo a trial...');
        window.location.href = './trial.html';
        return;
      }

      // Flujo normal para visitantes: redirigir al trial
      window.location.href = './trial.html';

    } catch (err) {
      console.error('startTrial error:', err);
      if (nextBtn) { nextBtn.textContent = ui().start; nextBtn.disabled = false; }
      errorMsg.textContent = ui().alertStartFail;
      errorMsg.style.display = 'block';
    }
  }

  // -- Event Listeners --
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (state.step > 0) {
        state.step -= 1;
        render();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', async () => {
      if (state.loading) return;

      if (!validateCurrentStep()) return;

      if (state.step < state.questions.length - 1) {
        state.step += 1;
        render();
      } else {
        await startTrial();
      }
    });
  }

  // Escucha cambios de idioma
  document.addEventListener('i18n:changed', () => {
    // Recargar preguntas en nuevo idioma
    loadQuestions();
  });

  // -- Inicialización --
  loadQuestions();
})();
