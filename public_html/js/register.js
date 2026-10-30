/**
 * =============================================================================
 * REGISTER.JS - Módulo de Registro con Flujo de Assessment
 * =============================================================================
 * 
 * Maneja 4 escenarios:
 * 1. Prueba gratuita → Trial completo → Registro (con bloques)
 * 2. Prueba gratuita → Clic "Crear cuenta" en trial → Registro (con bloques)
 * 3. Registro directo sin assessment → Redirige a assessment → Trial → Registro
 * 4. Registro directo sin assessment → Redirige a assessment → Clic "Crear cuenta" → Registro
 * 
 * =============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
  const submitBtn = document.getElementById("register-submit");

  if (!form) return;

  // =========================================================================
  // SI YA ESTÁ AUTENTICADO → REDIRIGIR A FRONTENDCLIENTE
  // =========================================================================
  if (hasToken()) {
    console.log('[Register] Usuario ya autenticado. Redirigiendo a FrontendCliente...');
    window.location.href = './FrontendCliente/index.html';
    return;
  }

  // =========================================================================
  // PRECARGAR DATOS SI VIENEN DE ASSESSMENT/TRIAL
  // =========================================================================
  const pendingData = JSON.parse(localStorage.getItem('gsa_pending_reg') || 'null');
  if (pendingData) {
    console.log('[Register] Precargando datos guardados:', pendingData);
    if (pendingData.nombre && form.name) form.name.value = pendingData.nombre;
    if (pendingData.email && form.email) form.email.value = pendingData.email;
    if (form.email2) form.email2.value = pendingData.email || '';
    if (pendingData.phone && form.phone) form.phone.value = pendingData.phone;
    // NO precargamos contraseña por seguridad
  }

  // =========================================================================
  // HELPERS PARA ERRORES
  // =========================================================================
  const showError = (fieldId, msg) => {
    const errorEl = document.getElementById(`error-${fieldId}`);
    const inputEl = document.getElementById(`reg-${fieldId}`);
    if (errorEl) errorEl.textContent = msg;
    if (inputEl) inputEl.classList.add('input-error');
  };

  const clearError = (fieldId) => {
    const errorEl = document.getElementById(`error-${fieldId}`);
    const inputEl = document.getElementById(`reg-${fieldId}`);
    if (errorEl) errorEl.textContent = '';
    if (inputEl) inputEl.classList.remove('input-error');
  };

  const clearAllErrors = () => {
    ['name', 'email', 'email2', 'phone', 'pass', 'pass2', 'terms'].forEach(clearError);
  };

  const setLoading = (on) => {
    submitBtn.disabled = on;
    submitBtn.style.opacity = on ? "0.85" : "1";
  };

  // Validación de contraseña: mínimo 8 caracteres, 1 mayúscula, 1 carácter especial
  const validatePassword = (password) => {
    if (password.length < 8) return "Mínimo 8 caracteres";
    if (!/[A-Z]/.test(password)) return "Debe contener al menos una mayúscula";
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/~`]/.test(password)) return "Debe contener al menos un carácter especial";
    return null;
  };

  // Validación de teléfono: opcional, pero si existe debe tener formato válido
  const validatePhone = (phone) => {
    if (!phone) return null; // Es opcional

    // 1. Debe empezar por +
    if (!phone.startsWith('+')) {
      return "Formato inválido. Debe incluir código de país (ej: +34 612...)";
    }

    // 2. Limpieza básica para conteo
    const cleanPhone = phone.replace(/[\s-]/g, '');

    // 3. Validar caracteres permitidos (solo + y dígitos después de limpieza)
    if (!/^\+\d+$/.test(cleanPhone)) {
      return "Caracteres no válidos (solo números, espacios, - y + al inicio)";
    }

    // 4. Estrategias por país
    // España (+34): 9 dígitos
    if (cleanPhone.startsWith('+34')) {
      const number = cleanPhone.substring(3);
      if (number.length !== 9) return "Formato inválido para España (se requieren 9 dígitos)";
      if (!/^[6789]/.test(number)) return "Teléfono español inválido (debe empezar por 6, 7, 8 o 9)";
    }
    // EEUU / Canadá (+1): 10 dígitos
    else if (cleanPhone.startsWith('+1')) {
      const number = cleanPhone.substring(2);
      if (number.length !== 10) return "Formato inválido para EEUU/Canadá (se requieren 10 dígitos)";
    }
    // Reino Unido (+44): 10-11 dígitos (a veces omiten el 0 inicial si incluyen +44, normalmente son 10 tras el 0)
    // Estandar: +44 7xxx xxxxxx (10 digits mobile)
    else if (cleanPhone.startsWith('+44')) {
      const number = cleanPhone.substring(3);
      if (number.length < 10 || number.length > 11) return "Formato inválido para Reino Unido (10-11 dígitos)";
    }
    // Francia (+33): 9 dígitos
    else if (cleanPhone.startsWith('+33')) {
      const number = cleanPhone.substring(3);
      if (number.length !== 9) return "Formato inválido para Francia (se requieren 9 dígitos)";
    }
    // Portugal (+351): 9 dígitos
    else if (cleanPhone.startsWith('+351')) {
      const number = cleanPhone.substring(4);
      if (number.length !== 9) return "Formato inválido para Portugal (se requieren 9 dígitos)";
    }
    // Genérico
    else {
      if (cleanPhone.length < 8 || cleanPhone.length > 16) {
        return "Longitud de teléfono internacional inválida";
      }
    }

    return null;
  };

  // =========================================================================
  // SUBMIT HANDLER
  // =========================================================================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAllErrors();

    const name = form.name?.value?.trim() || "";
    const email = form.email?.value?.trim() || "";
    const email2 = form.email2?.value?.trim() || "";
    const phone = form.phone?.value?.trim() || "";
    const pass = form.password?.value || "";
    const pass2 = form.password2?.value || "";
    const terms = document.getElementById("reg-terms")?.checked === true;

    let hasErrors = false;

    // Validar nombre
    if (!name) {
      showError('name', 'El nombre es obligatorio');
      hasErrors = true;
    }

    // Validar email
    if (!email) {
      showError('email', 'El email es obligatorio');
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('email', 'Introduce un email válido');
      hasErrors = true;
    }

    // Validar confirmación de email (obligatorio)
    if (!email2) {
      showError('email2', 'Confirma tu email');
      hasErrors = true;
    } else if (email2 !== email) {
      showError('email2', 'Los emails no coinciden');
      hasErrors = true;
    }

    // Validar teléfono (si existe)
    if (phone) {
      const phoneError = validatePhone(phone);
      if (phoneError) {
        showError('phone', phoneError);
        hasErrors = true;
      }
    }

    // Validar contraseña
    const passError = validatePassword(pass);
    if (!pass) {
      showError('pass', 'La contraseña es obligatoria');
      hasErrors = true;
    } else if (passError) {
      showError('pass', passError);
      hasErrors = true;
    }

    // Validar confirmación de contraseña (obligatoria)
    if (!pass2) {
      showError('pass2', 'Confirma tu contraseña');
      hasErrors = true;
    } else if (pass2 !== pass) {
      showError('pass2', 'Las contraseñas no coinciden');
      hasErrors = true;
    }

    // Validar términos
    if (!terms) {
      showError('terms', 'Debes aceptar los términos y la política de privacidad');
      hasErrors = true;
    }

    if (hasErrors) return;

    // =========================================================================
    // VERIFICAR SI HAY BLOQUES EN LOCALSTORAGE
    // =========================================================================
    const trialBlocks = JSON.parse(localStorage.getItem('gsa_trial_blocks') || '[]');

    if (trialBlocks.length === 0) {
      // NO hay bloques → Verificar primero si el email ya existe
      setLoading(true);

      try {
        const checkRes = await fetch(apiUrl(`auth/verify-email?email=${encodeURIComponent(email)}`));
        const checkData = await checkRes.json().catch(() => ({}));

        if (checkData.data?.existe) {
          showError('email', 'Este email ya está registrado.');
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('[Register] Error verificando email:', e);
        // Continuar si falla la verificación (el backend lo validará después)
      }

      setLoading(false);

      // Email disponible → Guardar datos del formulario y redirigir a assessment
      console.log('[Register] No hay bloques. Guardando datos y redirigiendo a assessment...');

      localStorage.setItem('gsa_pending_reg', JSON.stringify({
        nombre: name,
        email,
        password: pass,
        phone: phone || '',
        terms,
        timestamp: Date.now()
      }));

      // Redirigir a assessment con parámetro flow=pending_reg
      window.location.href = './assessment.html?flow=pending_reg';
      return;
    }

    // =========================================================================
    // HAY BLOQUES → PROCEDER CON REGISTRO
    // =========================================================================
    setLoading(true);

    // Recoger datos del trial si existen
    const trialData = {
      token: localStorage.getItem('gsa_trial_token'),
      blocks: trialBlocks,
      responses: JSON.parse(localStorage.getItem('gsa_trial_responses') || '[]'),
      assessmentAnswers: JSON.parse(localStorage.getItem('gsa_trial_answers') || '{}')
    };

    try {
      // 1. Registrar usuario
      const res = await fetch(apiUrl('auth/register'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: name,
          email,
          confirmar_email: email,
          contrasena: pass,
          confirmar_contrasena: pass,
          telefono: phone || null,
          trialData: trialData
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || (data.status !== 'ok' && data.status !== 'success')) {
        // Primero buscar errores específicos en data.errors
        if (data.errors && typeof data.errors === 'object') {
          // Mapeo de campos backend → frontend
          const fieldMapping = {
            'email': 'email',
            'nombre': 'name',
            'contrasena': 'pass',
            'confirmar_email': 'email2',
            'confirmar_contrasena': 'pass2'
          };

          for (const [backendField, message] of Object.entries(data.errors)) {
            const frontendField = fieldMapping[backendField] || backendField;
            showError(frontendField, message);
          }
        } else {
          // Fallback al mensaje genérico
          const errorMsg = data.message || data.error || "No se pudo crear la cuenta.";
          document.getElementById('register-alert').textContent = errorMsg;
        }
        setLoading(false);
        return;
      }

      // 2. Guardar token JWT
      if (data.data?.token) {
        saveToken(data.data.token);
        console.log('[Register] Token guardado correctamente');

        // 3. Sincronizar respuestas locales (Offline-First Stats)
        const pendingResponses = JSON.parse(localStorage.getItem('gsa_trial_responses') || '[]');
        if (pendingResponses.length > 0) {
          console.log('[Register] Sincronizando ' + pendingResponses.length + ' respuestas pendientes...');
          try {
            // Mapeo de estructura local a estructura backend
            const payload = pendingResponses.map(r => ({
              idEjercicio: r.questionId,
              respuesta: r.selectedAnswer,
              esCorrecto: r.isCorrect,
              fecha: new Date(r.timestamp).toISOString().slice(0, 19).replace('T', ' ')
            }));

            await fetchAuth('trial/sync', {
              method: 'POST',
              body: JSON.stringify({ answers: payload })
            });
            console.log('[Register] Sincronización completada.');
          } catch (syncErr) {
            console.warn('[Register] Fallo al sincronizar respuestas (no bloqueante):', syncErr);
          }
        }
      }

      // Los bloques ya fueron asignados por el backend durante el registro
      if (data.data?.bloques_asignados?.length > 0) {
        console.log('[Register] Bloques asignados por backend:', data.data.bloques_asignados);
      }

      // 4. Limpiar TODOS los datos temporales de localStorage
      localStorage.removeItem('gsa_trial_token');
      localStorage.removeItem('gsa_trial_blocks');
      localStorage.removeItem('gsa_trial_responses');
      localStorage.removeItem('gsa_trial_answers');
      localStorage.removeItem('gsa_block_catalog');
      localStorage.removeItem('gsa_pending_reg');

      // 5. Redirigir al área de cliente
      console.log('[Register] Registro completado. Redirigiendo a FrontendCliente...');
      window.location.href = "./FrontendCliente/index.html";

    } catch (err) {
      console.error('[Register] Error:', err);
      document.getElementById('register-alert').textContent = "Error de red. Revisa el servidor.";
      setLoading(false);
    }
  });
});
