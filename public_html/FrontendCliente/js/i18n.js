(function (window) {
  // Simple i18n loader for static JSON files in /js/i18n/
  const availableLangs = ['es', 'en', 'pt'];

  // Asegurar que siempre haya un idioma en localStorage (normalizado)
  let storedLang = localStorage.getItem('gsa_lang');
  if (!storedLang || !availableLangs.includes(storedLang.toLowerCase())) {
    storedLang = 'es';
    localStorage.setItem('gsa_lang', 'es');
  } else {
    storedLang = storedLang.toLowerCase();
    localStorage.setItem('gsa_lang', storedLang); // Normalizar en storage
  }

  const defaultLang = storedLang;
  const translations = {};
  let currentLang = defaultLang;
  let isReady = false; // Bandera para saber si las traducciones están cargadas

  function loadLang(lang) {
    // Normalizar idioma
    lang = (lang || 'es').toLowerCase();
    if (!availableLangs.includes(lang)) {
      lang = 'es';
    }

    if (translations[lang]) {
      isReady = true;
      return Promise.resolve(translations[lang]);
    }

    const url = new URL(`js/i18n/${lang}.json`, document.baseURI).toString();

    return fetch(url).then(r => {
      if (!r.ok) throw new Error(`failed-fetch:${r.status}`);
      return r.json();
    }).then(json => {
      translations[lang] = json;
      isReady = true;
      return json;
    }).catch(err => {
      console.error('Error cargando traducciones para', lang, ':', err);
      // Si falla, intentar cargar español como fallback
      if (lang !== 'es' && !translations['es']) {
        return loadLang('es');
      }
      throw err;
    });
  }


  function t(key, fallback) {
    const dict = translations[currentLang] || translations['es'] || {};
    return (dict[key] !== undefined) ? dict[key] : (fallback || key);
  }

  function init(lang) {
    // Normalizar el idioma
    lang = lang || currentLang || 'es';
    lang = lang.toLowerCase();
    if (!availableLangs.includes(lang)) {
      lang = 'es';
    }
    currentLang = lang;

    return loadLang(currentLang).then(() => {
      localStorage.setItem('gsa_lang', currentLang);
      isReady = true;
      return currentLang;
    }).catch(err => {
      console.error('Error en init i18n:', err);
      isReady = true; // Marcar como listo aunque falle, para no bloquear la app
      return currentLang;
    });
  }

  function setLanguage(lang) {
    // Normalizar el idioma
    lang = (lang || 'es').toLowerCase();
    if (!availableLangs.includes(lang)) {
      return Promise.reject(new Error('lang-not-available'));
    }

    return loadLang(lang).then(() => {
      currentLang = lang;
      localStorage.setItem('gsa_lang', lang);
      // trigger re-render if available
      if (typeof window.renderCurrentScreen === 'function') {
        window.renderCurrentScreen();
      }
      return lang;
    });
  }

  function getLanguage() {
    return currentLang;
  }

  function isInitialized() {
    return isReady;
  }

  window.I18n = {
    init, setLanguage, t, getLanguage, availableLangs, isInitialized
  };

  // Auto-init: load default language (BLOCKING para asegurar que esté listo)
  // Esto carga las traducciones inmediatamente cuando se carga el script
  loadLang(currentLang).catch(err => {
    console.error('Error en auto-init i18n:', err);
  });

})(window);
