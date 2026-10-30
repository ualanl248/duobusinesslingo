
(() => {
  // ========= Helpers =========
  const $ = (id) => document.getElementById(id);
  const safeJson = async (res) => {
    try { return await res.json(); } catch { return null; }
  };
  const safeParse = (raw, fallback = null) => {
    try { return JSON.parse(raw); } catch { return fallback; }
  };

  const BLOCK_CATALOG = [
    { id: 'workplace_pro', name: 'Inglés para el Trabajo', desc: 'Correos, reuniones y vocabulario profesional.', icon: 'W', image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=80' },
    { id: 'travel_ready', name: 'Inglés para Viajar', desc: 'Frases útiles, reservas, emergencias y cultura.', icon: 'T', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80' },
    { id: 'academic_boost', name: 'Inglés Académico', desc: 'Ensayos, abstracts y vocabulario universitario.', icon: 'A', image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80' },
    { id: 'social_conversation', name: 'Club de Conversación', desc: 'Temas cotidianos, slang útil y expresiones naturales.', icon: 'C', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80' },
    { id: 'pronunciation_lab', name: 'Pronunciación y Fluidez', desc: 'Patrones sonoros, ritmo y claridad al hablar.', icon: 'P', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80' },
    { id: 'listening_real', name: 'Listening en la Vida Real', desc: 'Audios diarios, acentos y comprensión rápida.', icon: 'L', image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80' },
    { id: 'writing_clinic', name: 'Writing Profesional', desc: 'Estructura correos y reportes sin errores.', icon: 'E', image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=80' },
    { id: 'reading_focus', name: 'Lectura y Vocabulario', desc: 'Comprensión rápida y ampliación de palabras.', icon: 'R', image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80' },
    { id: 'fast_track', name: 'Ruta Intensiva', desc: 'Plan corto y frecuente para avanzar rápido.', icon: 'F', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80' },
    { id: 'steady_growth', name: 'Hábito Diario', desc: 'Rutina ligera para mantener constancia.', icon: 'H', image: 'https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?auto=format&fit=crop&w=1200&q=80' },
    { id: 'presentations_story', name: 'Presentaciones y Storytelling', desc: 'Estructura ideas y gana seguridad al exponer.', icon: 'S', image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80' },
    { id: 'interview_ready', name: 'Entrevistas y CV', desc: 'Responde preguntas típicas y mejora tu pitch.', icon: 'I', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80' }
  ];
  const BLOCK_ID_MAP = {
    workplace_pro: 1,
    travel_ready: 2,
    academic_boost: 3,
    social_conversation: 4,
    pronunciation_lab: 5,
    listening_real: 6,
    writing_clinic: 7,
    reading_focus: 8,
    fast_track: 9,
    steady_growth: 10,
    presentations_story: 11,
    interview_ready: 12
  };
  const BLOCK_TRANSLATIONS = {
    ES: {}, // Usa default
    EN: {
      workplace_pro: { name: 'English for Work', desc: 'Emails, meetings and professional vocabulary.' },
      travel_ready: { name: 'English for Travel', desc: 'Useful phrases, reservations and emergencies.' },
      academic_boost: { name: 'Academic English', desc: 'Essays, abstracts and university vocabulary.' },
      social_conversation: { name: 'Conversation Club', desc: 'Daily topics, slang and natural expressions.' },
      pronunciation_lab: { name: 'Pronunciation & Flow', desc: 'Sound patterns, rhythm and clarity.' },
      listening_real: { name: 'Real Life Listening', desc: 'Daily audio, accents and quick comprehension.' },
      writing_clinic: { name: 'Professional Writing', desc: 'Structure emails and reports without errors.' },
      reading_focus: { name: 'Reading & Vocabulary', desc: 'Quick comprehension and word expansion.' },
      fast_track: { name: 'Fast Track', desc: 'Short, frequent plan to advance quickly.' },
      steady_growth: { name: 'Daily Habit', desc: 'Light routine to maintain consistency.' },
      presentations_story: { name: 'Presentations', desc: 'Structure ideas and gain confidence.' },
      interview_ready: { name: 'Interviews & CV', desc: 'Answer typical questions and improve your pitch.' }
    },
    PT: {
      workplace_pro: { name: 'Inglês para o Trabalho', desc: 'E-mails, reuniões e vocabulário profissional.' },
      travel_ready: { name: 'Inglês para Viajar', desc: 'Frases úteis, reservas e emergências.' },
      academic_boost: { name: 'Inglês Acadêmico', desc: 'Ensaios, abstracts e vocabulário universitário.' },
      social_conversation: { name: 'Clube de Conversação', desc: 'Tópicos diários, gírias e expressões naturais.' },
      pronunciation_lab: { name: 'Pronúncia e Fluidez', desc: 'Padrões sonoros, ritmo e clareza.' },
      listening_real: { name: 'Listening na Vida Real', desc: 'Áudios diários, sotaques e compreensão rápida.' },
      writing_clinic: { name: 'Writing Profissional', desc: 'Estrutura e-mails e relatórios sem erros.' },
      reading_focus: { name: 'Leitura e Vocabulário', desc: 'Compreensão rápida e expansão de palavras.' },
      fast_track: { name: 'Rota Intensiva', desc: 'Plano curto e frequente para avançar rápido.' },
      steady_growth: { name: 'Hábito Diário', desc: 'Rotina leve para manter a constância.' },
      presentations_story: { name: 'Apresentações', desc: 'Estruture ideias e ganhe segurança.' },
      interview_ready: { name: 'Entrevistas e CV', desc: 'Responda perguntas típicas e melhore seu pitch.' }
    }
  };

  const BLOCK_ID_TO_SLUG = Object.fromEntries(
    Object.entries(BLOCK_ID_MAP).map(([slug, num]) => [String(num), slug])
  );

  const DEMO_QUESTIONS = [
    { question: 'Choose the correct option: "I ___ a student."', options: ['is', 'am', 'are', 'be'], correctIndex: 1, explanation: '"I am" es la forma correcta con "I".' },
    { question: 'Pick a formal greeting for trabajo.', options: ['Hey!', 'Good morning', 'Yo!', 'Hiya'], correctIndex: 1, explanation: '"Good morning" es la opciÇün formal.' },
    { question: 'Select the synonym of "important".', options: ['tiny', 'crucial', 'cheap', 'slow'], correctIndex: 1, explanation: '"crucial" significa importante.' }
  ];

  const getLang = () => {
    // PRIORITY 1: localStorage is the source of truth
    const stored = localStorage.getItem('gsa_lang');
    if (stored) {
      const result = stored.trim().toUpperCase();
      console.log('[getLang] Using localStorage:', result);
      return result;
    }

    // PRIORITY 2: Fallback to global i18n
    if (window.GSA_I18N?.getLanguage) {
      const result = window.GSA_I18N.getLanguage().trim().toUpperCase();
      console.log('[getLang] Using GSA_I18N:', result);
      return result;
    }

    // PRIORITY 3: Default
    console.log('[getLang] Using default: ES');
    return 'ES';
  };

  const UI = {
    ES: {
      recommendation: 'Recomendado para ti',
      otherBlocks: 'Otros bloques disponibles',
      explore: 'Explorar este bloque',
      back: 'Anterior',
      check: 'Comprobar respuesta',
      next: 'Siguiente',
      finish: 'Finalizar bloque',
      pick: 'Elige una opción para continuar',
      loadFail: 'No se pudo cargar tu prueba. Vuelve a iniciar el formulario.',
      noToken: 'No hay sesión de prueba. Vuelve al formulario.',
      qOf: (i, n) => `Ejercicio ${i} de ${n}`,
      correct: '¡Correcto!',
      wrong: 'Respuesta incorrecta.',
      trialLesson: 'Lección de Prueba',
      nextExercise: 'Siguiente ejercicio',
      noQuestions: 'No hay preguntas disponibles para este bloque.',
      noQuestionsDetail: 'No se cargaron preguntas desde el servidor.',
      levelLabels: ['Nivel inicial', 'Nivel intermedio', 'Nivel avanzado', 'Nivel flexible'],
      timeLabels: ['Sesiones cortas', 'Practica regular', 'Estudio intensivo', 'Horario variable'],
      blockOf: (i, n) => `Bloque ${i} de ${n}`,
      checking: 'Comprobando...',
      correctAnswer: (ans) => `Respuesta correcta: "${ans}"`,
      blockCompleted: 'Bloque completado',
      alreadyCompleted: 'Ya has completado este bloque',
    },
    EN: {
      recommendation: 'Recommended for you',
      otherBlocks: 'Other available blocks',
      explore: 'Explore this block',
      back: 'Previous',
      check: 'Check answer',
      next: 'Next',
      finish: 'Finish block',
      pick: 'Pick an option to continue',
      loadFail: 'Could not load your trial. Please restart the form.',
      noToken: 'No trial session found. Please restart the form.',
      qOf: (i, n) => `Exercise ${i} of ${n}`,
      correct: 'Correct!',
      wrong: 'Incorrect answer.',
      trialLesson: 'Trial Lesson',
      nextExercise: 'Next exercise',
      noQuestions: 'No questions available for this block.',
      noQuestionsDetail: 'Questions could not be loaded from server.',
      levelLabels: ['Beginner level', 'Intermediate level', 'Advanced level', 'Flexible level'],
      timeLabels: ['Short sessions', 'Regular practice', 'Intensive study', 'Variable schedule'],
      blockOf: (i, n) => `Block ${i} of ${n}`,
      checking: 'Checking...',
      correctAnswer: (ans) => `Correct answer: "${ans}"`,
      blockCompleted: 'Block completed',
      alreadyCompleted: 'You have already completed this block',
    },
    PT: {
      recommendation: 'Recomendado para você',
      otherBlocks: 'Outros blocos disponíveis',
      explore: 'Explorar este bloco',
      back: 'Antigo',
      check: 'Verificar resposta',
      next: 'Seguinte',
      finish: 'Terminar bloco',
      pick: 'Escolhe uma opção para continuar',
      loadFail: 'Não foi possível carregar o teste. Volte a iniciar o formulário.',
      noToken: 'Não há sessão de teste. Volte ao formulário.',
      qOf: (i, n) => `Exercício ${i} de ${n}`,
      correct: 'Correto!',
      wrong: 'Resposta incorreta.',
      trialLesson: 'Lição de Teste',
      nextExercise: 'Próximo exercício',
      noQuestions: 'Não há perguntas disponíveis para este bloco.',
      noQuestionsDetail: 'As perguntas não puderam ser carregadas do servidor.',
      levelLabels: ['Nível inicial', 'Nível intermediário', 'Nível avançado', 'Nível flexível'],
      timeLabels: ['Sessões curtas', 'Prática regular', 'Estudo intensivo', 'Horário variável'],
      blockOf: (i, n) => `Bloco ${i} de ${n}`,
      checking: 'Verificando...',
      correctAnswer: (ans) => `Resposta correta: "${ans}"`,
      blockCompleted: 'Bloco concluído',
      alreadyCompleted: 'Já concluíste este bloco',
    }
  };

  const ui = () => {
    const lang = getLang();
    const result = UI[lang] || UI.ES;
    console.log('[ui()] Lang:', lang, 'Has translations:', !!UI[lang]);
    return result;
  };
  const AUTO_START = new URLSearchParams(window.location.search).has('autostart');

  // ========= DOM (results-like layout) =========
  const featuredTitle = $('featuredTitle');
  const featuredDesc = $('featuredDesc');
  const featuredImg = $('featuredImg');
  const featuredBtn = $('featuredBtn');
  const featuredMeta = $('featuredMeta');
  const otherBlocksEl = $('otherBlocks');

  const resultsView = $('resultsView');
  const quizView = $('quizView');

  const quizQuestion = $('quizQuestion');
  const optionsWrap = $('optionsWrap');
  const quizProgressLabel = $('quizProgressLabel');
  const quizProgressBar = $('quizProgressBar');
  const quizBlockName = $('quizBlockName');
  const quizSubtitle = $('quizSubtitle');
  const quizLevel = $('quizLevel');
  const quizMeta = $('quizMeta');
  const feedbackOk = $('feedbackOk');
  const feedbackBad = $('feedbackBad');
  const primaryActionBtn = $('primaryActionBtn');
  const backBtn = $('primaryBackBtn');
  // Prevent i18n.js from overriding our custom logic
  if (backBtn) backBtn.removeAttribute('data-i18n');

  // Error message element creation (inline validation)
  const validationErrorMsg = document.createElement('div');
  validationErrorMsg.id = 'trialValidationError';
  validationErrorMsg.style.cssText = 'color: #ef4444; font-weight: 500; text-align: center; margin-top: 12px; display: none;';
  if (optionsWrap) optionsWrap.parentNode.insertBefore(validationErrorMsg, optionsWrap.nextSibling);

  // Si te falta algún ID, no petamos: avisamos en consola.
  const requiredIds = [
    'featuredTitle', 'featuredDesc', 'featuredImg', 'featuredBtn', 'otherBlocks',
    'resultsView', 'quizView', 'quizQuestion', 'optionsWrap',
    'quizProgressLabel', 'quizProgressBar', 'quizBlockName', 'quizSubtitle', 'quizLevel',
    'feedbackOk', 'feedbackBad', 'primaryActionBtn', 'backBtn'
  ];
  requiredIds.forEach(id => { if (!$(id)) console.warn('[trial.js] Falta el elemento con id:', id); });

  // ========= State =========
  const state = {
    trialToken: null,
    blocks: [],          // [{id, title, desc, image, icon, level, questions:[{question, options[], correctIndex, explanation}]}]
    activeBlockIndex: null,
    qIndex: 0,
    selectedIndex: null,
    checked: false,
    correct: 0,
    completed: {}        // { blockId: true }
  };

  // ========= Helpers de bloques =========
  const DEMO_BLOCKS = BLOCK_CATALOG.slice(0, 3).map((b, idx) => ({
    id: b.id,
    title: b.name,
    desc: b.desc,
    image: b.image,
    icon: b.icon || String.fromCharCode(65 + idx),
    level: 'Nivel demo',
    questions: DEMO_QUESTIONS
  }));




  // Muestra un aviso sencillo en pantalla (esquina inferior derecha).
  function showToast(msg) {
    let el = document.getElementById('trialToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'trialToast';
      el.style.cssText = 'position:fixed;bottom:16px;right:16px;padding:12px 16px;background:#111;color:#fff;font-size:14px;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.2);z-index:9999;max-width:280px;line-height:1.4;';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.display = 'block';
    clearTimeout(el._hideTimer || 0);
    el._hideTimer = setTimeout(() => { el.style.display = 'none'; }, 3200);
  }

  // Lee el catálogo guardado en localStorage o devuelve el catálogo estático.
  function loadCatalog() {
    const stored = safeParse(localStorage.getItem('gsa_block_catalog'));
    return Array.isArray(stored) && stored.length ? stored : BLOCK_CATALOG;
  }

  // Construye una etiqueta de nivel/tiempo a partir de metadatos guardados.
  function formatLevel(meta) {
    if (!meta) return '';

    // ALWAYS recalculate from indices using current language
    const levelIdx = Number(meta?.answers?.q2 ?? 0);
    const timeIdx = Number(meta?.answers?.q4 ?? 0);
    const currentUI = ui();
    const lvl = currentUI.levelLabels[levelIdx] || currentUI.levelLabels[0];
    const time = currentUI.timeLabels[timeIdx] || currentUI.timeLabels[0];
    console.log('[formatLevel] levelIdx:', levelIdx, 'timeIdx:', timeIdx, 'Lang:', getLang(), 'Result:', `${lvl} - ${time}`);
    return `${lvl} - ${time}`;
  }

  // Crea un objeto bloque a partir de un id (catálogo) y metadatos guardados.
  function buildBlockFromId(id, meta, idx) {
    const catalog = loadCatalog();

    // Convertir ID numérico a slug si es necesario
    const numId = Number(id);
    const slug = BLOCK_ID_TO_SLUG[String(numId)] || (typeof id === 'string' ? id : null);

    // Buscar en catálogo por ID numérico o por slug
    let base = catalog.find(b => Number(b.id) === numId) ||
      catalog.find(b => String(b.id) === String(id)) ||
      catalog.find(b => String(b.id) === slug) ||
      {};

    // Si no encontramos en catálogo con IDs numéricos, buscar en BLOCK_CATALOG hardcodeado por slug
    if (!base.name && slug) {
      base = BLOCK_CATALOG.find(b => b.id === slug) || base;
    }

    const fallbackImg = catalog[idx % catalog.length]?.image || DEMO_BLOCKS[idx % DEMO_BLOCKS.length]?.image;

    // Apply translations
    const lang = getLang();
    const translations = slug && BLOCK_TRANSLATIONS[lang] && BLOCK_TRANSLATIONS[lang][slug]
      ? BLOCK_TRANSLATIONS[lang][slug]
      : {};

    // Para español, usar el nombre del catálogo hardcodeado si existe
    let finalName = translations.name || base.name || base.title;
    let finalDesc = translations.desc || base.desc || base.description;

    // Si estamos en ES y no hay traducción pero hay slug, usar el BLOCK_CATALOG hardcodeado
    if (lang === 'ES' && slug && (!finalName || finalName.startsWith('Bloque'))) {
      const hardcodedBlock = BLOCK_CATALOG.find(b => b.id === slug);
      if (hardcodedBlock) {
        finalName = hardcodedBlock.name;
        finalDesc = hardcodedBlock.desc;
      }
    }

    return {
      id: base.id || slug || `block_${idx}`,
      apiId: numId || BLOCK_ID_MAP[slug] || id,
      title: finalName || `Bloque ${idx + 1}`,
      desc: finalDesc || '',
      image: base.image || fallbackImg,
      icon: base.icon || (base.name || '').charAt(0) || String.fromCharCode(65 + idx),
      level: formatLevel(meta) || 'Nivel demo',
      questions: Array.isArray(base.questions) ? base.questions : []
    };
  }

  // Carga los IDs de bloques y metadatos almacenados tras el assessment.
  function loadLocalTrial() {
    const ids = safeParse(localStorage.getItem('gsa_trial_blocks'), []);
    const meta = safeParse(localStorage.getItem('gsa_trial_answers'), {});
    if (!Array.isArray(ids) || ids.length === 0) return null;
    return ids.slice(0, 3).map((id, idx) => {
      const block = buildBlockFromId(id, meta, idx);
      // Guardamos solo preguntas de muestra como fallback; dejamos questions vacías para que se dispare fetch.
      block.questions = Array.isArray(block.questions) ? block.questions : [];
      block.sampleQuestions = DEMO_QUESTIONS;
      return block;
    });
  }

  // ========= API / Local =========
  // Carga los bloques asignados desde localStorage usando el catálogo local (BLOCK_CATALOG).
  // NO hace ninguna petición al backend para obtener la info de los bloques.
  async function initTrialMain() {
    // 1. Recuperamos el token y los bloques que assessment.js guardó en localStorage.
    state.trialToken = localStorage.getItem('gsa_trial_token');
    const localBlocks = loadLocalTrial();

    if (localBlocks) {
      state.blocks = localBlocks;
    } else {
      console.warn('[trial.js] No blocks found in localStorage. Redirecting to assessment.');
      alert(ui().noToken);
      window.location.href = './assessment.html';
      return;
    }

    while (state.blocks.length < 3) state.blocks.push(DEMO_BLOCKS[state.blocks.length % DEMO_BLOCKS.length]);

    // FORCE REFRESH: Ensure blocks are translated to the current language before showing
    const meta = safeParse(localStorage.getItem('gsa_trial_answers'), {});
    state.blocks = state.blocks.map((oldB, i) => {
      const fresh = buildBlockFromId(oldB.apiId || oldB.id, meta, i);
      // Keep runtime props (questions, etc) but update display text
      return { ...oldB, title: fresh.title, desc: fresh.desc, level: fresh.level };
    });

    renderResults();
  }

  // Shuffle options helper
  function shuffleOptions(q) {
    if (!q.options || q.options.length < 2) return q;

    const indices = q.options.map((_, i) => i);
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const newOptions = indices.map(i => q.options[i]);
    let newCorrectIndex = null;

    // Remap correctIndex if it exists
    if (q.correctIndex !== null && q.correctIndex !== undefined) {
      newCorrectIndex = indices.indexOf(q.correctIndex);
    }

    return { ...q, options: newOptions, correctIndex: newCorrectIndex };
  }

  // Normaliza una lista cruda de preguntas que viene del backend.
  function normalizeQuestions(rawList) {
    if (!Array.isArray(rawList)) return null;
    return rawList.slice(0, 3).map(q => {
      const normalized = {
        id: q.id ?? q.idEjercicio ?? null,
        question: q.question ?? q.text ?? q.pregunta ?? '',
        options: q.options ?? q.opciones ?? [],
        correctIndex: Number.isFinite(q.correctIndex) ? q.correctIndex : null,
        explanation: q.explanation ?? q.explicacion ?? ''
      };
      return shuffleOptions(normalized);
    });
  }

  // Unico punto que toca el backend: pide preguntas a ./api/trial/questions.php con idBloque.
  async function fetchQuestionsForBlock(blockId) {
    const apiId = BLOCK_ID_MAP[blockId] ?? blockId;
    try {
      // [FUTURE API] const res = await fetch(`/api/trial/questions/${blockId}`, ...);
      const res = await fetch(apiUrl('trial/questions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockId: apiId,
          idBloque: apiId,
          trialToken: state.trialToken || localStorage.getItem('gsa_trial_token')
        })
      });
      const data = await safeJson(res);
      if (!res.ok || !data) return null;
      const list = normalizeQuestions(data.questions || data?.data?.questions);
      return list && list.length ? list : null;
    } catch (err) {
      console.warn('[trial.js] fetchQuestionsForBlock error', err);
      return null;
    }
  }

  async function ensureBlockQuestions(blockId) {
    const idx = state.blocks.findIndex(b => String(b.id) === String(blockId));
    if (idx === -1) return null;
    const current = state.blocks[idx];
    if (Array.isArray(current.questions) && current.questions.length) return current.questions;

    const apiId = current.apiId || BLOCK_ID_MAP[current.id] || BLOCK_ID_MAP[BLOCK_ID_TO_SLUG[String(blockId)]] || blockId;
    const fetched = await fetchQuestionsForBlock(apiId);
    if (fetched) {
      state.blocks[idx] = { ...current, questions: fetched };
      return fetched;
    }

    // NO usar preguntas de demostración - marcar error
    state.lastError = 'No se pudieron cargar preguntas desde el servidor.';
    state.blocks[idx] = { ...current, questions: [] }; // Array vacío en lugar de DEMO_QUESTIONS
    return null; // Retornar null en lugar de preguntas demo
  }

  // ========= Results rendering =========
  // Pinta la vista de resultados con el bloque destacado y los demás.
  function renderResults() {
    if (!resultsView || !quizView) return;

    // REFRESH TRANSLATIONS: Re-build titles/descs
    const catalog = loadCatalog();
    const meta = safeParse(localStorage.getItem('gsa_trial_answers'), {});

    // Update state blocks with fresh translations based on current lang
    state.blocks = state.blocks.map((oldB, i) => {
      // Re-use logic from buildBlockFromId to get fresh text
      const fresh = buildBlockFromId(oldB.apiId || oldB.id, meta, i);
      // Preserve runtime properties (questions, completed, etc)
      return { ...oldB, title: fresh.title, desc: fresh.desc, level: fresh.level };
    });

    const blocks = state.blocks.slice(0, 3);
    const main = blocks[0];
    const rest = blocks.slice(1);

    if (featuredTitle) featuredTitle.textContent = main?.title || '';
    if (featuredDesc) featuredDesc.textContent = main?.desc || '';
    if (featuredImg) {
      featuredImg.src = main?.image || '';
      featuredImg.alt = main?.title || 'Recommended block';
    }

    // Update progress indicator
    if (featuredMeta) {
      const completedCount = state.blocks.filter(b => state.completed[b.id]).length;
      const totalBlocks = state.blocks.length;
      featuredMeta.textContent = `${completedCount}/${totalBlocks}`;
    }

    if (featuredBtn) {
      const isCompleted = state.completed[main.id];
      featuredBtn.textContent = isCompleted ? `✓ ${ui().blockCompleted}` : ui().explore;
      featuredBtn.disabled = isCompleted;
      if (isCompleted) {
        featuredBtn.style.opacity = '0.6';
        featuredBtn.style.cursor = 'not-allowed';
      }
      featuredBtn.onclick = () => startBlockById(main.id);
    }

    if (otherBlocksEl) {
      otherBlocksEl.innerHTML = '';
      rest.forEach((b) => {
        const isCompleted = state.completed[b.id];
        const card = document.createElement('div');
        card.className = 'block-card';
        card.innerHTML = `
          <div class="block-icon">${b.icon || 'A'}</div>
          <h4 style="font-size:18px;margin:0 0 8px;font-weight:800;">${b.title || ''}</h4>
          <p style="margin:0 0 16px;color:var(--muted);line-height:1.6;font-size:14px;">${b.desc || ''}</p>
          <button class="btn-pill btn-outline" type="button" data-block="${b.id}" ${isCompleted ? 'disabled' : ''}>
            ${isCompleted ? `✓ ${ui().blockCompleted}` : ui().explore}
          </button>
        `;
        if (isCompleted) {
          const btn = card.querySelector('button');
          btn.style.opacity = '0.6';
          btn.style.cursor = 'not-allowed';
        }
        otherBlocksEl.appendChild(card);
      });

      otherBlocksEl.querySelectorAll('button[data-block]:not([disabled])').forEach((btn) => {
        btn.addEventListener('click', () => startBlockById(btn.getAttribute('data-block')));
      });
    }

    // Mostrar results / ocultar quiz
    resultsView.style.display = '';
    quizView.style.display = 'none';

    // Si quieres entrar directo al quiz para probar (añade ?autostart a la URL)
    if (AUTO_START && blocks[0]?.id) {
      startBlockById(blocks[0].id);
    }
  }

  // ========= Quiz =========
  // Inicia un bloque: asegura preguntas y resetea estado de quiz.
  async function startBlockById(blockId) {
    const idx = state.blocks.findIndex(b => String(b.id) === String(blockId));
    if (idx === -1) return;

    // Check if block is already completed
    if (state.completed[blockId]) {
      alert(ui().alreadyCompleted);
      return;
    }

    state.lastError = null;
    const qs = await ensureBlockQuestions(blockId);
    if (!qs || !qs.length) {
      alert(state.lastError || 'No se pudieron cargar preguntas para este bloque.');
      return;
    }

    state.activeBlockIndex = idx;
    state.qIndex = 0;
    state.selectedIndex = null;
    state.checked = false;
    state.correct = 0;

    // re-asigna preguntas normalizadas por si el backend no trae sampleQuestions
    state.blocks[idx].questions = qs;
    showToast(`Preguntas cargadas: ${qs.length}`);

    showQuiz();
    renderQuiz();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Muestra solo la vista de quiz.
  function showQuiz() {
    if (!resultsView || !quizView) return;
    resultsView.style.display = 'none';
    quizView.style.display = 'block';

    // Force text update
    if (backBtn) backBtn.textContent = ui().back;
  }

  // Vuelve a la vista de resultados.
  function showResults() {
    if (!resultsView || !quizView) return;
    quizView.style.display = 'none';
    resultsView.style.display = 'block';
  }

  // Devuelve el bloque activo actual.
  function getActiveBlock() {
    return state.blocks[state.activeBlockIndex] || null;
  }

  function renderQuiz() {
    const b = getActiveBlock();
    if (!b) { showResults(); return; }

    const questions = b.questions || [];
    if (!questions || !questions.length) {
      if (quizQuestion) quizQuestion.textContent = ui().noQuestions;
      if (optionsWrap) optionsWrap.innerHTML = `<div style="padding:12px;color:#b91c1c;">${ui().noQuestionsDetail}</div>`;
      return;
    }
    const q = questions[state.qIndex];

    const total = questions.length;
    const current = state.qIndex + 1;

    // Recalculate level with current language
    const meta = safeParse(localStorage.getItem('gsa_trial_answers'), {});
    const freshLevel = formatLevel(meta);
    console.log('[renderQuiz] b.level (old):', b.level, 'freshLevel (new):', freshLevel);

    // Header quiz
    if (quizBlockName) quizBlockName.textContent = `${ui().trialLesson} - ${freshLevel || b.level || 'Nivel 1'}`;
    if (quizSubtitle) quizSubtitle.innerHTML = `<strong>${b.title}</strong><br>${freshLevel || b.level || 'Nivel 1'}`;
    if (quizLevel) quizLevel.textContent = '';

    // Meta info: "Bloque X de Y · Pregunta X de Y"
    const blockIndex = state.activeBlockIndex + 1;
    const totalBlocks = state.blocks.length;
    if (quizMeta) {
      const metaText = `${ui().blockOf(blockIndex, totalBlocks)} · ${ui().qOf(current, total)}`;
      console.log('[renderQuiz] quizMeta text:', metaText);
      quizMeta.textContent = metaText;
    }

    if (quizProgressLabel) quizProgressLabel.textContent = ui().qOf(current, total);
    if (quizProgressBar) quizProgressBar.style.width = `${Math.round((current / total) * 100)}%`;

    // Reset feedback & validation error
    if (feedbackOk) { feedbackOk.textContent = ''; feedbackOk.style.display = 'none'; }
    if (feedbackBad) { feedbackBad.textContent = ''; feedbackBad.style.display = 'none'; }
    if (validationErrorMsg) { validationErrorMsg.style.display = 'none'; }

    // Question
    if (quizQuestion) quizQuestion.textContent = q?.question || '';

    // Options (New Structure)
    if (optionsWrap) {
      optionsWrap.innerHTML = '';
      (q?.options || []).forEach((opt, i) => {
        const row = document.createElement('div');
        // Usamos option-row, y si está seleccionado (y aun no chequeado), is-selected
        row.className = 'option-row' + (state.selectedIndex === i ? ' is-selected' : '');

        row.innerHTML = `
          <div class="option-circle"></div>
          <div class="option-label">${opt}</div>
        `;

        row.addEventListener('click', () => {
          if (state.checked) return; // Bloquear si ya contestó
          state.selectedIndex = i;
          if (validationErrorMsg) validationErrorMsg.style.display = 'none';
          renderQuiz();
        });
        optionsWrap.appendChild(row);
      });
    }

    // Buttons logic: si ya validó (checked=true), el botón debe decir "Siguiente" y estar activo
    if (primaryActionBtn) {
      if (state.checked) {
        const last = state.qIndex >= questions.length - 1;
        primaryActionBtn.textContent = last ? ui().finish : ui().nextExercise;
        primaryActionBtn.disabled = false;
      } else {
        primaryActionBtn.textContent = ui().check;
        primaryActionBtn.disabled = false;
      }
    }

    // Botón "Anterior" (backBtn)
    if (backBtn) {
      if (state.qIndex === 0) {
        backBtn.style.display = 'none';
      } else {
        backBtn.style.display = 'inline-block';
        backBtn.textContent = ui().back;
        backBtn.onclick = () => {
          if (state.qIndex > 0) {
            state.qIndex--;
            state.selectedIndex = null;
            state.checked = false;
            // Limpia feedback
            if (feedbackOk) feedbackOk.style.display = 'none';
            if (feedbackBad) feedbackBad.style.display = 'none';
            renderQuiz();
          }
        };
      }
    }
  }


  async function checkAnswer() {
    const b = getActiveBlock();
    if (!b) return;

    const questions = b.questions || [];
    const q = questions[state.qIndex];

    if (state.selectedIndex == null) {
      if (validationErrorMsg) {
        validationErrorMsg.textContent = ui().pick;
        validationErrorMsg.style.display = 'block';
      } else {
        alert(ui().pick);
      }
      return;
    }

    // Deshabilita botón para evitar doble click
    if (primaryActionBtn) {
      primaryActionBtn.textContent = ui().checking;
      primaryActionBtn.disabled = true;
    }

    const selectedText = q.options[state.selectedIndex];

    // Llamada a la API
    let isCorrect = false;
    let explanation = '';
    let correctSolutionText = '';

    if (q.id) {
      try {
        // [FUTURE API] const res = await fetch("/api/trial/check", ...);
        const res = await fetch(apiUrl('trial/check'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idEjercicio: q.id, respuesta: selectedText })
        });
        const data = await safeJson(res);

        console.log('[trial.js DEBUG] API Response:', data);

        // api_rest devuelve { status: 'ok', data: { correct, correctAnswer, message } }
        if (data && data.status === 'ok' && data.data) {
          isCorrect = !!data.data.correct;
          explanation = data.data.message || '';
          correctSolutionText = data.data.correctAnswer;
          console.log('[trial.js DEBUG] Parsed - isCorrect:', isCorrect, 'correctAnswer:', correctSolutionText);
        } else {
          console.error('[trial.js DEBUG] API response invalid:', data);
          explanation = 'Error al verificar respuesta.';
        }
      } catch (err) {
        console.error(err);
        explanation = 'Error de conexión.';
      }
    } else {
      isCorrect = (state.selectedIndex === q.correctIndex);
      explanation = q.explanation || '';
      if (!isCorrect) correctSolutionText = q.options[q.correctIndex];
    }

    state.checked = true;
    if (isCorrect) state.correct += 1;

    // Guardar respuesta en localStorage para consolidar al registro
    const responseData = {
      blockId: b.apiId || b.id || BLOCK_ID_MAP[b.id] || b.id,
      questionId: q.id,
      selectedAnswer: selectedText,
      isCorrect: isCorrect,
      correctAnswer: isCorrect ? null : correctSolutionText,
      timestamp: Date.now()
    };
    const storedResponses = JSON.parse(localStorage.getItem('gsa_trial_responses') || '[]');
    storedResponses.push(responseData);
    localStorage.setItem('gsa_trial_responses', JSON.stringify(storedResponses));

    // Actualizar UI Options:
    const allRows = optionsWrap.querySelectorAll('.option-row');

    // Marcar la seleccionada
    if (allRows[state.selectedIndex]) {
      allRows[state.selectedIndex].classList.remove('is-selected');
      allRows[state.selectedIndex].classList.add(isCorrect ? 'is-correct' : 'is-wrong');
    }

    // Si falló, buscar la correcta y marcarla en verde
    if (!isCorrect && correctSolutionText) {
      allRows.forEach(row => {
        if (row.querySelector('.option-label')?.textContent.trim() === correctSolutionText.trim()) {
          row.classList.add('is-correct');
        }
      });
    }

    // Feedback Text
    if (feedbackOk && feedbackBad) {
      if (isCorrect) {
        feedbackOk.textContent = ui().correct;
        feedbackOk.style.display = 'none'; // Diseño minimalista: solo opción verde. O block si quieres texto.
        feedbackBad.style.display = 'none';
      } else {
        // Mostrar caja roja con la corrección
        console.log('[trial.js] Respuesta incorrecta. correctSolutionText:', correctSolutionText, 'explanation:', explanation);
        const feedbackText = correctSolutionText ? ui().correctAnswer(correctSolutionText) : (explanation || ui().wrong);
        feedbackBad.textContent = feedbackText;
        feedbackBad.style.display = 'block';
        feedbackOk.style.display = 'none';
      }
    }

    // Reactivar botón para Siguiente
    if (primaryActionBtn) {
      primaryActionBtn.disabled = false;
      const last = state.qIndex >= questions.length - 1;
      primaryActionBtn.textContent = last ? ui().finish : ui().nextExercise;
    }
  }

  function nextOrFinish() {
    const b = getActiveBlock();
    if (!b) return;

    const questions = b.questions || [];
    const last = state.qIndex >= questions.length - 1;

    if (!state.checked) {
      checkAnswer();
      return;
    }

    if (!last) {
      state.qIndex += 1;
      state.selectedIndex = null;
      state.checked = false;
      renderQuiz();
      return;
    }

    // finish block
    state.completed[b.id] = true;
    state.scores = state.scores || {};
    state.scores[b.id] = state.correct;

    // Check if all done
    const allDone = state.blocks.every(bl => state.completed[bl.id]);

    showResults();
    renderResults();

    if (allDone) {
      const totalCorrect = state.blocks.reduce((acc, bl) => acc + (state.scores[bl.id] || 0), 0);
      const totalQuestions = state.blocks.reduce((acc, bl) => {
        const list = (bl.questions && bl.questions.length) ? bl.questions
          : (bl.sampleQuestions || DEMO_QUESTIONS);
        return acc + list.length;
      }, 0);

      // Guardar estadísticas en localStorage para cuando se registre
      localStorage.setItem('gsa_trial_stats', JSON.stringify({
        totalCorrect,
        totalQuestions,
        completedAt: Date.now()
      }));

      // Si ya está autenticado → ir directo a FrontendCliente
      if (typeof hasToken === 'function' && hasToken()) {
        console.log('[Trial] Usuario autenticado. Redirigiendo a FrontendCliente...');
        window.location.href = './FrontendCliente/index.html';
        return;
      }

      // Mostrar modal de felicitación (para usuarios no autenticados)
      const modal = document.getElementById('completionModal');
      const sumText = document.getElementById('summaryText');

      if (modal) {
        if (sumText) sumText.textContent = `Respondiste correctamente ${totalCorrect} de ${totalQuestions} preguntas.`;
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
      }
    }
  }

  // ========= Wire events =========
  if (primaryActionBtn) {
    primaryActionBtn.addEventListener('click', () => nextOrFinish());
  }



  // BOTÓN "Volver a bloques" del header del quiz
  const backToBlocksBtn = document.getElementById('backToBlocksBtn');
  if (backToBlocksBtn) {
    backToBlocksBtn.addEventListener('click', () => {
      showResults();
      renderResults();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Si cambia idioma: solo refrescamos textos UI (no preguntas del quiz)
  document.addEventListener('i18n:changed', () => {
    if (resultsView && resultsView.style.display !== 'none') renderResults();
    if (quizView && quizView.style.display !== 'none') renderQuiz();
  });

  // ========= Update UI for Pending Registration =========
  const updatePendingUi = () => {
    const pendingRegRaw = localStorage.getItem('gsa_pending_reg');
    if (pendingRegRaw) {
      console.log('[Trial] Detectado registro pendiente. Actualizando textos UI y eventos...');
      const pendingReg = JSON.parse(pendingRegRaw);

      const handleDirectRegistration = async (e) => {
        e.preventDefault();
        const btn = e.currentTarget;
        const originalText = btn.textContent;
        btn.textContent = 'Registrando...';
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.7';

        try {
          // Preparar datos para registro final
          const trialData = {
            token: localStorage.getItem('gsa_trial_token'),
            blocks: JSON.parse(localStorage.getItem('gsa_trial_blocks') || '[]'),
            responses: JSON.parse(localStorage.getItem('gsa_trial_responses') || '[]'),
            assessmentAnswers: JSON.parse(localStorage.getItem('gsa_trial_answers') || '{}')
          };

          const payload = {
            nombre: pendingReg.nombre || pendingReg.name,
            email: pendingReg.email,
            confirmar_email: pendingReg.email,
            contrasena: pendingReg.password,
            confirmar_contrasena: pendingReg.password,
            username: pendingReg.email.split('@')[0],
            telefono: pendingReg.phone || '',
            trialData: trialData
          };

          const apiUrl = window.CONFIG?.API_BASE_URL
            ? window.CONFIG.API_BASE_URL + '/auth/register'
            : 'https://api.duobusinesslingo.com/auth/register';

          console.log('[Trial] Enviando registro directo a', apiUrl);

          const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const data = await res.json();

          if (res.ok && (data.status === 'ok' || data.status === 'success')) {
            // Login exitoso
            if (data.data?.token) {
              saveToken(data.data.token);

              // --- SYNC RESPUESTAS ---
              const pendingResponses = JSON.parse(localStorage.getItem('gsa_trial_responses') || '[]');
              if (pendingResponses.length > 0) {
                try {
                  const apiSyncUrl = window.CONFIG?.API_BASE_URL
                    ? window.CONFIG.API_BASE_URL + '/trial/sync'
                    : 'https://api.duobusinesslingo.com/trial/sync';

                  const payloadSync = pendingResponses.map(r => ({
                    idEjercicio: r.questionId,
                    respuesta: r.selectedAnswer,
                    esCorrecto: r.isCorrect,
                    fecha: new Date(r.timestamp).toISOString().slice(0, 19).replace('T', ' ')
                  }));

                  await fetch(apiSyncUrl, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${data.data.token}`
                    },
                    body: JSON.stringify({ answers: payloadSync })
                  });
                  console.log('[Trial->Register] Sync completado.');
                } catch (e) { console.warn('Sync failed', e); }
              }
              // -----------------------
            }

            // Limpiar datos
            localStorage.removeItem('gsa_pending_reg');
            localStorage.removeItem('gsa_trial_token');
            localStorage.removeItem('gsa_trial_blocks');
            localStorage.removeItem('gsa_trial_responses');
            localStorage.removeItem('gsa_trial_answers');
            localStorage.removeItem('gsa_block_catalog');

            // Redirigir
            console.log('[Trial] Registro exitoso. Redirigiendo...');
            window.location.href = './FrontendCliente/index.html';
          } else {
            alert('Error en el registro: ' + (data.message || 'Inténtalo de nuevo.'));
            btn.textContent = originalText;
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';

            // Si falla el registro por duplicado u otro error grave, redirigimos al form para corregir
            if (data.code === 422 || res.status === 422) {
              window.location.href = './register.html?error=' + encodeURIComponent(data.message);
            }
          }

        } catch (err) {
          console.error('[Trial] Error registro directo:', err);
          alert('Error de conexión. Redirigiendo al formulario...');
          window.location.href = './register.html';
        }
      };

      // 1. Botón principal de guardar progreso (en Results View)
      const ctaLinks = document.querySelectorAll('.results-cta a');
      ctaLinks.forEach(link => {
        if (link.getAttribute('href').includes('register.html')) {
          link.textContent = 'Comienza ya';
          link.addEventListener('click', handleDirectRegistration);
        }
      });

      // 2. Botón del modal de finalización
      const modalLinks = document.querySelectorAll('#completionModal .modal-actions a');
      modalLinks.forEach(link => {
        if (link.getAttribute('href').includes('register.html')) {
          link.textContent = 'Empieza ya';
          link.addEventListener('click', handleDirectRegistration);
        }
      });
    }
  };

  // ========= Init =========
  updatePendingUi();
  initTrialMain();
})();
