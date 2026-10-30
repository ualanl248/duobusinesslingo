(() => {
  const STORAGE_KEY = 'gsa_lang';
  const DEFAULT_LANG = 'ES';

  const LANG_TO_HTML = { ES: 'es', EN: 'en', PT: 'pt' };

  const I18N = {
    ES: {
      'meta.title': 'Global Speak Academy',

      'nav.home_aria': 'Inicio',
      'nav.about': 'Sobre nosotros',
      'nav.faq': 'FAQ',
      'nav.login': 'Iniciar sesión',
      'nav.register': 'Registrarse',
      'nav.menu_aria': 'Menú',

      'footer.tagline': 'Tu academia online para dominar el inglés con lecciones personalizadas.',
      'footer.platform': 'Plataforma',
      'footer.features': 'Características',
      'footer.pricing': 'Precios',
      'footer.testimonials': 'Testimonios',
      'footer.company': 'Empresa',
      'footer.about': 'Sobre nosotros',
      'footer.blog': 'Blog',
      'footer.contact': 'Contacto',
      'footer.legal': 'Legal',
      'footer.privacy': 'Privacidad',
      'footer.terms': 'Términos',
      'footer.cookies': 'Cookies',
      'footer.copyright': '© 2025 Global Speak Academy. Todos los derechos reservados.',

      'hero.title': 'Domina el inglés con<br><span class="accent">Global Speak Academy</span>',
      'hero.subtitle': 'Aprende inglés de manera interactiva y efectiva. Lecciones y ejercicios personalizados y seguimiento en tiempo real de tu progreso.',
      'hero.cta_primary': 'Comenzar prueba gratuita',
      'hero.cta_secondary': 'Ver planes',
      'hero.no_card': 'Sin tarjeta de crédito',
      'hero.cancel_anytime': 'Cancela cuando quieras',
      'hero.image_alt': 'Persona estudiando en portátil con taza de café',

      'why.image_alt': 'Persona estudiando en portátil',
      'why.title': '¿Por qué elegir Global Speak Academy?',
      'why.f1_title': 'Aprendizaje gamificado',
      'why.f1_desc': 'Sistema de puntos, rachas y logros que te mantienen motivado. Convierte el aprendizaje en un juego adictivo.',
      'why.f2_title': 'Contenido personalizado',
      'why.f2_desc': 'Algoritmo adaptativo que ajusta el nivel y los ejercicios según tu progreso y áreas de mejora.',
      'why.f3_title': 'Aprende a tu ritmo',
      'why.f3_desc': 'Acceso 24/7 desde cualquier dispositivo. Solo necesitas 15 minutos al día para ver resultados.',

      'reviews.title': 'Lo que dicen nuestros estudiantes',
      'reviews.subtitle': 'Más de 50,000 estudiantes han mejorado su inglés con Global Speak Academy',
      'reviews.r1': '"Global Speak Academy cambió completamente mi forma de aprender. Las lecciones son tan entretenidas que no siento que estoy estudiando. En 3 meses pasé de A2 a B1."',
      'reviews.r2': '"Los ejercicios de pronunciación con IA son increíbles. Puedo practicar speaking sin vergüenza y recibo feedback instantáneo. Súper recomendado."',
      'reviews.r3': '"Perfecta como complemento a mis clases presenciales. El sistema de repetición espaciada realmente funciona para retener vocabulario nuevo."',
      'reviews.r4': '"Llevo 6 meses y mi confianza al hablar inglés ha aumentado enormemente. Las conversaciones simuladas me prepararon para situaciones reales. ¡Gracias Global Speak!"',
      'about.meta.title': 'Quiénes somos | Global Speak Academy',

      'about.hero.titlePrefix': 'Sobre',
      'about.hero.titleAccent': 'GSA',
      'about.hero.missionTitle': 'Nuestra Misión',
      'about.hero.missionP1': 'Democratizar el aprendizaje del inglés mediante una plataforma interactiva, accesible y basada en la ciencia del aprendizaje.',
      'about.hero.missionP2': 'Somos una plataforma nueva pensada para estudiantes de habla hispana, inglesa y portuguesa, con una experiencia adaptada a cada idioma desde el primer día. Nuestro objetivo es ayudarte a avanzar con claridad y constancia, ya sea para viajar, trabajar o estudiar en el extranjero.',
      'about.hero.imageAlt': 'Estudiante feliz levantando el pulgar',

      'about.method.title': 'Nuestra Metodología',
      'about.method.items.spaced.title': 'Repetición Espaciada',
      'about.method.items.spaced.desc': 'Sistema basado en algoritmos que optimiza la retención de vocabulario a largo plazo.',
      'about.method.items.active.title': 'Práctica Activa',
      'about.method.items.active.desc': 'Aprende haciendo: ejercicios interactivos de speaking, writing, listening y reading.',
      'about.method.items.feedback.title': 'Feedback Inmediato',
      'about.method.items.feedback.desc': 'Correcciones instantáneas con explicaciones detalladas para acelerar tu aprendizaje.',

      'about.contact.title': 'Ponte en contacto',
      'about.contact.subtext': 'Estamos aquí para ayudarte. Escríbenos y resolveremos tus dudas.',
      'about.contact.labels.email': 'Email',
      'about.contact.labels.phone': 'Teléfono',
      'about.contact.labels.location': 'Ubicación',
      'about.contact.labels.hours': 'Horario de atención',
      'about.contact.values.location': 'Málaga, España',
      'about.contact.values.hours': 'Lun - Vie: 9:00 - 18:00',
      'about.contact.backHome': 'Volver al inicio',

      'faq.meta.title': 'Preguntas frecuentes | Global Speak Academy',
      'faq.hero.title': 'Preguntas Frecuentes',
      'faq.hero.subtitle': 'Todo lo que necesitas saber sobre Global Speak Academy.',
      'faq.q1': '¿Cómo funciona la plataforma?',
      'faq.a1': 'Global Speak Academy utiliza un sistema de lecciones interactivas gamificadas con vocabulario, gramática, listening y speaking. Nuestro algoritmo adaptativo ajusta el contenido según tu nivel y progreso para que aprendas de forma efectiva.',
      'faq.q2': '¿Necesito experiencia previa en inglés?',
      'faq.a2': 'No es necesario. Ofrecemos contenido desde A1 hasta C2. Al crear tu cuenta harás una prueba de nivel de 5 minutos que personaliza tu experiencia desde el primer día.',
      'faq.q3': '¿Cuánto tiempo debo dedicar cada día?',
      'faq.a3': 'Recomendamos entre 15 y 30 minutos diarios. La práctica breve y constante es más efectiva; las rachas y recordatorios te ayudarán a mantener la consistencia.',
      'faq.q4': '¿Puedo usar la plataforma en móvil?',
      'faq.a4': 'Sí, es 100% responsive y funciona en smartphone, tablet, laptop u ordenador. Puedes cambiar de dispositivo sin perder progreso gracias a la sincronización en la nube.',
      'faq.q5': '¿Qué incluye la prueba gratuita?',
      'faq.a5': 'La prueba gratuita permite acceder a 3 bloques de contenido con ejercicios variados en cada uno de ellos. Esto le permitirá explorar distintas áreas de aprendizaje antes de decidir si desea continuar con un plan de suscripción. No se requiere tarjeta de crédito para comenzar.',
      'faq.q6': '¿Puedo cancelar mi suscripción en cualquier momento?',
      'faq.a6': 'Por supuesto. Sin permanencia ni penalizaciones. Puedes cancelar desde tu panel con un clic y mantienes acceso hasta fin de periodo.',

      'faq.contact.prompt': '¿No encuentras la respuesta que buscas?',
      'faq.contact.cta': 'Contacta con nosotros',
      'faq.backHome': 'Volver al inicio',
      'privacy.meta.title': 'Política de Privacidad | Global Speak Academy',
      'privacy.title': 'Política de Privacidad',
      'privacy.lead': 'En Global Speak Academy cumplimos con el RGPD y la LOPDGDD. Aquí te explicamos qué datos recogemos, para qué los usamos y cómo puedes ejercer tus derechos.',
      'privacy.s1.title': 'Responsable y contacto',
      'privacy.s1.body': 'Responsable: Global Speak Academy<br>Correo: <a href="mailto:contacto@duobusinesslingo.com">contacto@duobusinesslingo.com</a>',
      'privacy.s2.title': 'Datos que tratamos',
      'privacy.s2.li1': 'Datos de cuenta: nombre, email, idioma, contraseña cifrada.',
      'privacy.s2.li2': 'Uso de la plataforma: progreso, lecciones completadas, respuestas a ejercicios.',
      'privacy.s2.li3': 'Datos de pago (si aplica): gestionados por el proveedor de pagos, no almacenamos tarjeta completa.',
      'privacy.s2.li4': 'Soporte y comunicaciones: mensajes y tickets que nos envíes.',
      'privacy.s3.title': 'Finalidades y base jurídica',
      'privacy.s3.li1': 'Prestar el servicio y gestionar tu cuenta (ejecución del contrato).',
      'privacy.s3.li2': 'Mejorar la plataforma con analítica agregada (interés legítimo o consentimiento según cookies).',
      'privacy.s3.li3': 'Comunicaciones sobre el servicio; marketing solo con tu consentimiento.',
      'privacy.s3.li4': 'Facturación y cumplimiento legal (obligación legal).',
      'privacy.s4.title': 'Cesiones y transferencias',
      'privacy.s4.body': 'Compartimos datos solo con proveedores que actúan como encargados (hosting, analítica, pagos, soporte) bajo contratos RGPD. Si hay transferencias fuera del EEE, se aplican cláusulas contractuales tipo o garantías equivalentes.',
      'privacy.s5.title': 'Plazos de conservación',
      'privacy.s5.body': 'Conservamos tus datos mientras tengas cuenta activa. Datos de facturación se guardan según requisitos fiscales. Al cancelar, anonimizamos o eliminamos lo que no sea necesario conservar por obligación legal.',
      'privacy.s6.title': 'Tus derechos',
      'privacy.s6.body': 'Puedes ejercer acceso, rectificación, supresión, oposición, limitación, portabilidad y retirar consentimientos escribiendo a <a href="mailto:contacto@duobusinesslingo.com">contacto@duobusinesslingo.com</a>. También puedes reclamar ante la AEPD si lo consideras necesario.',
      'privacy.s7.title': 'Seguridad',
      'privacy.s7.body': 'Aplicamos cifrado en tránsito (HTTPS), control de accesos y almacenamiento cifrado de contraseñas. Revisamos periódicamente nuestras medidas técnicas y organizativas.',

      'terms.meta.title': 'Términos y Condiciones | Global Speak Academy',
      'terms.title': 'Términos y Condiciones',
      'terms.lead': 'Regulan el uso de la plataforma Global Speak Academy. Léelos antes de usar el servicio.',
      'terms.s1.title': 'Objeto del servicio',
      'terms.s1.body': 'Plataforma de aprendizaje de inglés con lecciones interactivas, ejercicios gamificados, seguimiento de progreso y certificados digitales.',
      'terms.s2.title': 'Registro y cuenta',
      'terms.s2.li1': 'Debes aportar datos veraces y mantener tu contraseña segura.',
      'terms.s2.li2': 'Edad mínima: 16 años o autorización paterna.',
      'terms.s2.li3': 'Podemos suspender cuentas por uso indebido o incumplimiento.',
      'terms.s3.title': 'Uso aceptable',
      'terms.s3.li1': 'No se permite compartir credenciales, copiar o redistribuir contenidos sin autorización.',
      'terms.s3.li2': 'No uses la plataforma para fines ilícitos ni para intentar acceder a sistemas de terceros.',
      'terms.s4.title': 'Suscripciones y cancelación',
      'terms.s4.body': 'Los planes de pago se renuevan periódicamente según la modalidad elegida. Puedes cancelar en cualquier momento desde tu panel; mantendrás el acceso hasta el final del periodo ya abonado. Precios y condiciones pueden actualizarse previa notificación.',
      'terms.s5.title': 'Propiedad intelectual',
      'terms.s5.body': 'Los contenidos, diseño y software son propiedad de Global Speak Academy o licenciantes. Te otorgamos una licencia limitada, no exclusiva e intransferible para usar la plataforma según estos términos.',
      'terms.s6.title': 'Responsabilidad',
      'terms.s6.body': 'La plataforma se ofrece “tal cual”. No garantizamos resultados específicos; no somos responsables por interrupciones ajenas, pérdida de datos por causas externas o uso indebido. En la medida legal, nuestra responsabilidad se limita al importe abonado en los últimos 12 meses.',
      'terms.s7.title': 'Ley aplicable y jurisdicción',
      'terms.s7.body': 'Se aplicará la legislación española. Cualquier controversia se someterá a los juzgados de Madrid, salvo normas imperativas de consumidores.',
      'terms.s8.title': 'Cambios',
      'terms.s8.body': 'Podemos actualizar estos términos. Notificaremos cambios relevantes y, si continúas usando el servicio, se considerarán aceptados.',

      'cookies.meta.title': 'Política de Cookies | Global Speak Academy',
      'cookies.title': 'Política de Cookies',
      'cookies.lead': 'Explica cómo y para qué usamos cookies y tecnologías similares en Global Speak Academy.',
      'cookies.s1.title': '¿Qué son las cookies?',
      'cookies.s1.body': 'Son pequeños archivos que se almacenan en tu dispositivo para recordar preferencias, mejorar el rendimiento y medir el uso de la web.',
      'cookies.s2.title': 'Qué cookies usamos',
      'cookies.s2.li1': 'Necesarias: inicio de sesión, seguridad, preferencia de idioma.',
      'cookies.s2.li2': 'Analítica: medir uso y rendimiento (se requiere tu consentimiento si son de terceros).',
      'cookies.s2.li3': 'Funcionales: recordar ajustes de interfaz y progreso.',
      'cookies.s3.title': 'Gestión y desactivación',
      'cookies.s3.body': 'Puedes aceptar o rechazar cookies no esenciales desde el banner/panel cuando lo mostremos. También puedes eliminarlas o bloquearlas desde la configuración de tu navegador. Ten en cuenta que las necesarias son imprescindibles para el funcionamiento básico.',
      'cookies.s4.title': 'Transferencias y terceros',
      'cookies.s4.body': 'Si usamos proveedores de analítica o servicios que impliquen transferencias fuera del EEE, aplicamos cláusulas contractuales tipo u otras garantías adecuadas.',
      'cookies.s5.title': 'Actualizaciones',
      'cookies.s5.body': 'Podemos actualizar esta política para reflejar cambios en las cookies usadas o en la normativa. Indicaremos la fecha de la última revisión.',

      'login.meta.title': 'Iniciar sesión | Global Speak Academy',
      'login.panel.title': 'Bienvenido de vuelta',
      'login.panel.text': 'Continúa tu camino hacia el dominio del inglés. Tu progreso te está esperando.',
      'login.tip.label': '<span aria-hidden="true">💡</span> Consejo del día',
      'login.tip.quote': '"La consistencia es clave. Solo 15 minutos diarios pueden marcar una gran diferencia en tu aprendizaje."',

      'login.card.title': 'Iniciar sesión',
      'login.card.subtitle': 'Accede a tu cuenta de Global Speak Academy',
      'login.form.email': 'Email',
      'login.form.email_ph': 'tu@email.com',
      'login.form.password': 'Contraseña',
      'login.form.password_ph': 'Tu contraseña',
      'login.form.remember': 'Recordarme',
      'login.form.forgot': '¿Olvidaste tu contraseña?',
      'login.form.submit': 'Iniciar sesión',
      'login.divider.or': 'o',
      'login.actions.create': 'Crear cuenta nueva',
      'login.actions.back': 'Volver al inicio',

      'nav.logout': 'Salir',

      'cookie.title': 'Cookies',
      'cookie.desc': 'Usamos cookies necesarias para el funcionamiento del sitio y, con tu permiso, cookies para mejorar la experiencia.',
      'cookie.more': 'Más información',
      'cookie.reject': 'Rechazar',
      'cookie.accept': 'Aceptar',

      'register.meta.title': 'Registro | Global Speak Academy',
      'register.panel.title': 'Únete a Global Speak Academy',
      'register.panel.subtitle': 'Comienza tu viaje hacia el dominio del inglés con miles de estudiantes en todo el mundo',
      'register.b1': 'Lecciones interactivas desde nivel A1',
      'register.b2': 'Algoritmo adaptativo que ajusta el contenido a tu nivel',
      'register.b3': 'Acceso multiplataforma: estudia desde cualquier dispositivo',
      'register.tip.label': '🎁 Oferta de bienvenida',
      'register.tip.text': 'Regístrate hoy y accede gratis a 3 bloques de contenido. Sin compromiso, sin tarjeta. ¡Empieza ahora!',

      'register.card.title': 'Crea tu cuenta',
      'register.card.subtitle': 'Completa tus datos para comenzar',

      'register.form.name': 'Nombre completo',
      'register.form.name_ph': 'Ej: María García',
      'register.form.email': 'Email',
      'register.form.email_ph': 'tu@email.com',
      'register.form.email2': 'Confirmar email',
      'register.form.email2_ph': 'Vuelve a escribir tu email',
      'register.form.pass': 'Contraseña',
      'register.form.pass_ph': 'Crea una contraseña segura',
      'register.form.pass2': 'Confirmar contraseña',
      'register.form.pass2_ph': 'Vuelve a escribir tu contraseña',
      'register.form.terms': 'Acepto los <a href="./terms.html">términos y condiciones</a> y la <a href="./privacy.html">política de privacidad</a>',
      'register.form.submit': 'Crear cuenta',

      'register.alt.text': '¿Ya tienes cuenta?',
      'register.alt.link': 'Inicia sesión',
      'register.back': 'Volver al inicio',

      'recover.meta.title': 'Nueva contraseña | Global Speak Academy',
      'recover.title': 'Crear nueva contraseña',
      'recover.subtitle': 'Crea una contraseña fuerte para tu cuenta.',
      'recover.new.label': 'Nueva contraseña',
      'recover.new.placeholder': 'Mínimo 8 caracteres',
      'recover.confirm.label': 'Confirmar contraseña',
      'recover.confirm.placeholder': 'Confirma tu contraseña',
      'recover.submit': 'Cambiar contraseña',
      'recover.back': '← Volver a iniciar sesión',

      'recoverEmail.meta.title': 'Recuperar contraseña | Global Speak Academy',
      'recoverEmail.title': '¿Olvidaste tu contraseña?',
      'recoverEmail.subtitle': 'Escribe tu email y te enviaremos un enlace para crear una nueva contraseña.',
      'recoverEmail.email.label': 'Email',
      'recoverEmail.email.placeholder': 'tu@email.com',
      'recoverEmail.submit': 'Enviar enlace',
      'recoverEmail.back': '← Volver a iniciar sesión',

      'assessment.meta.title': 'Evaluación rápida | Global Speak Academy',
      'assessment.loading': 'Cargando...',
      'assessment.progress.question_word': 'Pregunta',
      'assessment.progress.of': 'de',
      'assessment.progress.completed_word': 'completado',
      'assessment.btn.prev': 'Anterior',
      'assessment.btn.next': 'Siguiente',
      'assessment.cancel': 'Cancelar evaluación',

      'trial.meta.title': 'Prueba | Global Speak Academy',
      'trial.intro.title': 'Prueba personalizada',
      'trial.intro.subtitle': 'Te hemos asignado 3 bloques. Harás 3 preguntas de cada uno (9 en total).',
      'trial.badge': 'Tu prueba (9 preguntas)',
      'trial.hero.title': '3 bloques asignados',
      'trial.hero.desc': 'Harás 9 preguntas y después podrás desbloquear el resto creando tu cuenta.',
      'trial.btn.start': 'Empezar',
      'trial.blocks.title': 'Bloques asignados',
      'trial.back_assessment': 'Volver al assessment',
      'trial.btn.back': 'Anterior',
      'trial.hint': 'Al completar la prueba te pediremos crear una cuenta para acceder al resto de preguntas de estos bloques.',
      'trial.modal.title': '¡Prueba completada!',
      'trial.modal.later': 'Ahora no',
      'trial.modal.register': 'Crear cuenta gratis',
      'trial.modal.login': 'Ya tengo cuenta',

      'trial.results.title': '¡Evaluación completada!',
      'trial.results.subtitle': 'Basándonos en tus respuestas, hemos seleccionado tus bloques ideales.',
      'trial.results.badge': 'Recomendado para ti',
      'trial.results.explore': 'Explorar este bloque',
      'trial.results.other_blocks': 'Otros bloques disponibles',
      'trial.results.save_progress': 'Crear cuenta para guardar progreso',
      'trial.results.back_home': 'Volver al inicio',
      'trial.quiz.back_to_blocks': '← Volver a bloques',



    },

    EN: {
      'meta.title': 'Global Speak Academy',

      'nav.home_aria': 'Home',
      'nav.about': 'About us',
      'nav.faq': 'FAQ',
      'nav.login': 'Log in',
      'nav.register': 'Sign up',
      'nav.menu_aria': 'Menu',

      'footer.tagline': 'Your online academy to master English with personalized lessons.',
      'footer.platform': 'Platform',
      'footer.features': 'Features',
      'footer.pricing': 'Pricing',
      'footer.testimonials': 'Testimonials',
      'footer.company': 'Company',
      'footer.about': 'About us',
      'footer.blog': 'Blog',
      'footer.contact': 'Contact',
      'footer.legal': 'Legal',
      'footer.privacy': 'Privacy',
      'footer.terms': 'Terms',
      'footer.cookies': 'Cookies',
      'footer.copyright': '© 2025 Global Speak Academy. All rights reserved.',

      'hero.title': 'Master English with<br><span class="accent">Global Speak Academy</span>',
      'hero.subtitle': 'Learn English interactively and effectively. Personalized lessons and exercises, plus real-time progress tracking.',
      'hero.cta_primary': 'Start free trial',
      'hero.cta_secondary': 'See plans',
      'hero.no_card': 'No credit card required',
      'hero.cancel_anytime': 'Cancel anytime',
      'hero.image_alt': 'Person studying on a laptop with a cup of coffee',

      'why.image_alt': 'Person studying on a laptop',
      'why.title': 'Why choose Global Speak Academy?',
      'why.f1_title': 'Gamified learning',
      'why.f1_desc': 'Points, streaks, and achievements that keep you motivated. Turn learning into an addictive game.',
      'why.f2_title': 'Personalized content',
      'why.f2_desc': 'An adaptive algorithm adjusts your level and exercises based on your progress and improvement areas.',
      'why.f3_title': 'Learn at your pace',
      'why.f3_desc': '24/7 access from any device. You only need 15 minutes a day to see results.',

      'reviews.title': 'What our students say',
      'reviews.subtitle': 'Over 50,000 students have improved their English with Global Speak Academy',
      'reviews.r1': '"Global Speak Academy completely changed the way I learn. The lessons are so engaging that it doesn’t feel like studying. In 3 months I went from A2 to B1."',
      'reviews.r2': '"The AI pronunciation exercises are amazing. I can practice speaking without embarrassment and get instant feedback. Highly recommended."',
      'reviews.r3': '"Perfect as a complement to my in-person classes. The spaced repetition system really works for retaining new vocabulary."',
      'reviews.r4': '"I’ve been using it for 6 months and my confidence speaking English has grown a lot. The simulated conversations prepared me for real-life situations. Thanks, Global Speak!"',

      'about.meta.title': 'About us | Global Speak Academy',
      'about.hero.titlePrefix': 'About',
      'about.hero.titleAccent': 'GSA',
      'about.hero.missionTitle': 'Our Mission',
      'about.hero.missionP1': 'To democratize English learning through an interactive, accessible platform based on learning science.',
      'about.hero.missionP2': 'We are a new platform designed for Spanish, English, and Portuguese-speaking students, with an experience tailored to each language from day one. Our goal is to help you progress with clarity and consistency, whether to travel, work, or study abroad.',
      'about.hero.imageAlt': 'Happy student giving a thumbs up',

      'about.method.title': 'Our Methodology',
      'about.method.items.spaced.title': 'Spaced Repetition',
      'about.method.items.spaced.desc': 'An algorithm-based system that improves long-term vocabulary retention.',
      'about.method.items.active.title': 'Active Practice',
      'about.method.items.active.desc': 'Learn by doing: interactive speaking, writing, listening, and reading exercises.',
      'about.method.items.feedback.title': 'Instant Feedback',
      'about.method.items.feedback.desc': 'Instant corrections with clear explanations to speed up your learning.',

      'about.contact.title': 'Get in touch',
      'about.contact.subtext': 'We’re here to help. Message us and we’ll answer your questions.',
      'about.contact.labels.email': 'Email',
      'about.contact.labels.phone': 'Phone',
      'about.contact.labels.location': 'Location',
      'about.contact.labels.hours': 'Support hours',
      'about.contact.values.location': 'Málaga, Spain',
      'about.contact.values.hours': 'Mon - Fri: 9:00 - 18:00',
      'about.contact.backHome': 'Back to home',

      'faq.meta.title': 'Frequently asked questions | Global Speak Academy',
      'faq.hero.title': 'Frequently Asked Questions',
      'faq.hero.subtitle': 'Everything you need to know about Global Speak Academy.',

      'faq.q1': 'How does the platform work?',
      'faq.a1': 'Global Speak Academy uses gamified interactive lessons covering vocabulary, grammar, listening, and speaking. Our adaptive algorithm adjusts content based on your level and progress so you learn effectively.',
      'faq.q2': 'Do I need prior English experience?',
      'faq.a2': 'No. We offer content from A1 to C2. When you create your account, you’ll take a 5-minute placement test that personalizes your experience from day one.',
      'faq.q3': 'How much time should I spend each day?',
      'faq.a3': 'We recommend 15–30 minutes daily. Short, consistent practice works best; streaks and reminders help you stay consistent.',
      'faq.q4': 'Can I use the platform on mobile?',
      'faq.a4': 'Yes—it\'s fully responsive and works on phone, tablet, laptop, or desktop. You can switch devices without losing progress thanks to cloud sync.',
      'faq.q5': 'What’s included in the free trial?',
      'faq.a5': 'The free trial grants access to 3 content blocks, each featuring a variety of exercises. This allows you to explore different learning areas before deciding whether to continue with a subscription plan. No credit card is required to get started.',
      'faq.q6': 'Can I cancel my subscription anytime?',
      'faq.a6': 'Absolutely. No commitment or penalties. Cancel from your dashboard in one click and keep access until the end of your billing period.',
      'faq.contact.prompt': "Can't find the answer you're looking for?",
      'faq.contact.cta': 'Contact us',
      'faq.backHome': 'Back to home',

      'privacy.meta.title': 'Privacy Policy | Global Speak Academy',
      'privacy.title': 'Privacy Policy',
      'privacy.lead': 'At Global Speak Academy we comply with GDPR and applicable data protection laws. Here we explain what data we collect, why we use it, and how you can exercise your rights.',
      'privacy.s1.title': 'Data controller and contact',
      'privacy.s1.body': 'Controller: Global Speak Academy<br>Email: <a href="mailto:contacto@duobusinesslingo.com">contacto@duobusinesslingo.com</a>',
      'privacy.s2.title': 'Data we process',
      'privacy.s2.li1': 'Account data: name, email, language preference, encrypted password.',
      'privacy.s2.li2': 'Platform usage: progress, completed lessons, exercise answers.',
      'privacy.s2.li3': 'Payment data (if applicable): handled by our payment provider; we do not store full card details.',
      'privacy.s2.li4': 'Support and communications: messages and tickets you send us.',
      'privacy.s3.title': 'Purpose and legal basis',
      'privacy.s3.li1': 'Provide the service and manage your account (performance of a contract).',
      'privacy.s3.li2': 'Improve the platform using aggregated analytics (legitimate interest or consent depending on cookies).',
      'privacy.s3.li3': 'Service-related communications; marketing only with your consent.',
      'privacy.s3.li4': 'Billing and legal compliance (legal obligation).',
      'privacy.s4.title': 'Sharing and international transfers',
      'privacy.s4.body': 'We only share data with service providers acting as processors (hosting, analytics, payments, support) under GDPR-compliant agreements. If data is transferred outside the EEA, we use Standard Contractual Clauses or equivalent safeguards.',
      'privacy.s5.title': 'Data retention',
      'privacy.s5.body': 'We keep your data while your account remains active. Billing data is retained as required by tax and accounting rules. When you cancel, we delete or anonymize data that we are not required to keep.',
      'privacy.s6.title': 'Your rights',
      'privacy.s6.body': 'You can exercise your rights of access, rectification, erasure, objection, restriction, portability, and withdraw consent by emailing <a href="mailto:contacto@duobusinesslingo.com">contacto@duobusinesslingo.com</a>. You may also file a complaint with your local data protection authority.',
      'privacy.s7.title': 'Security',
      'privacy.s7.body': 'We use encryption in transit (HTTPS), access controls, and secure password storage. We regularly review and update our technical and organizational security measures.',

      'terms.meta.title': 'Terms & Conditions | Global Speak Academy',
      'terms.title': 'Terms & Conditions',
      'terms.lead': 'These terms govern your use of the Global Speak Academy platform. Please read them carefully before using the service.',
      'terms.s1.title': 'Service overview',
      'terms.s1.body': 'An English-learning platform with interactive lessons, gamified exercises, progress tracking, and digital certificates.',
      'terms.s2.title': 'Registration and account',
      'terms.s2.li1': 'You must provide accurate information and keep your password secure.',
      'terms.s2.li2': 'Minimum age: 16, or parental/guardian consent.',
      'terms.s2.li3': 'We may suspend accounts for misuse or breach of these terms.',
      'terms.s3.title': 'Acceptable use',
      'terms.s3.li1': 'You may not share credentials or copy, redistribute, or resell content without permission.',
      'terms.s3.li2': 'Do not use the platform for unlawful purposes or attempt to access third-party systems.',
      'terms.s4.title': 'Subscriptions and cancellation',
      'terms.s4.body': 'Paid plans renew automatically according to the billing cycle you choose. You can cancel anytime from your dashboard; access remains until the end of the paid period. Prices and conditions may be updated with prior notice.',
      'terms.s5.title': 'Intellectual property',
      'terms.s5.body': 'All content, design, and software are owned by Global Speak Academy or its licensors. You are granted a limited, non-exclusive, non-transferable license to use the platform under these terms.',
      'terms.s6.title': 'Liability',
      'terms.s6.body': 'The platform is provided “as is”. We do not guarantee specific results and are not liable for third-party outages, external causes of data loss, or misuse. Where permitted by law, our liability is limited to the amount you paid in the last 12 months.',
      'terms.s7.title': 'Governing law and jurisdiction',
      'terms.s7.body': 'Spanish law applies. Any disputes will be submitted to the courts of Madrid, except where mandatory consumer rules provide otherwise.',
      'terms.s8.title': 'Changes',
      'terms.s8.body': 'We may update these terms. We will notify you of material changes; continued use of the service means you accept the updated terms.',

      'cookies.meta.title': 'Cookie Policy | Global Speak Academy',
      'cookies.title': 'Cookie Policy',
      'cookies.lead': 'This policy explains how and why we use cookies and similar technologies on Global Speak Academy.',
      'cookies.s1.title': 'What are cookies?',
      'cookies.s1.body': 'Cookies are small files stored on your device to remember preferences, improve performance, and understand how the website is used.',
      'cookies.s2.title': 'Cookies we use',
      'cookies.s2.li1': 'Essential: login, security, and language preference.',
      'cookies.s2.li2': 'Analytics: measure usage and performance (your consent may be required for third-party analytics cookies).',
      'cookies.s2.li3': 'Functional: remember interface settings and progress.',
      'cookies.s3.title': 'Managing and disabling cookies',
      'cookies.s3.body': 'You can accept or reject non-essential cookies from our banner/settings when available. You can also delete or block cookies in your browser settings. Please note that essential cookies are required for basic functionality.',
      'cookies.s4.title': 'Third parties and transfers',
      'cookies.s4.body': 'If we use analytics providers or services that involve transfers outside the EEA, we apply Standard Contractual Clauses or other appropriate safeguards.',
      'cookies.s5.title': 'Updates',
      'cookies.s5.body': 'We may update this policy to reflect changes in the cookies we use or in applicable regulations. We will indicate the date of the latest revision.',

      'login.meta.title': 'Log in | Global Speak Academy',
      'login.panel.title': 'Welcome back',
      'login.panel.text': 'Keep moving toward English mastery. Your progress is waiting for you.',
      'login.tip.label': '<span aria-hidden="true">💡</span> Tip of the day',
      'login.tip.quote': '"Consistency is key. Just 15 minutes a day can make a big difference in your learning."',

      'login.card.title': 'Log in',
      'login.card.subtitle': 'Access your Global Speak Academy account',
      'login.form.email': 'Email',
      'login.form.email_ph': 'you@email.com',
      'login.form.password': 'Password',
      'login.form.password_ph': 'Your password',
      'login.form.remember': 'Remember me',
      'login.form.forgot': 'Forgot your password?',
      'login.form.submit': 'Log in',
      'login.divider.or': 'or',
      'login.actions.create': 'Create a new account',
      'login.actions.back': 'Back to home',

      'nav.logout': 'Log out',
      'cookie.title': 'Cookies',
      'cookie.desc': 'We use essential cookies to run the site and, with your permission, cookies to improve your experience.',
      'cookie.more': 'Learn more',
      'cookie.reject': 'Reject',
      'cookie.accept': 'Accept',

      'register.meta.title': 'Sign up | Global Speak Academy',
      'register.panel.title': 'Join Global Speak Academy',
      'register.panel.subtitle': 'Start your journey to English mastery with thousands of students worldwide',
      'register.b1': 'Interactive lessons starting from A1',
      'register.b2': 'Adaptive algorithm that adjusts content to your level',
      'register.b3': 'Multiplatform access: study from any device',
      'register.tip.label': '🎁 Welcome offer',
      'register.tip.text': 'Sign up today and get free access to 3 content blocks. No commitment, no card required. Start now!',

      'register.card.title': 'Create your account',
      'register.card.subtitle': 'Fill in your details to get started',

      'register.form.name': 'Full name',
      'register.form.name_ph': 'e.g., Maria Garcia',
      'register.form.email': 'Email',
      'register.form.email_ph': 'you@email.com',
      'register.form.email2': 'Confirm email',
      'register.form.email2_ph': 'Type your email again',
      'register.form.pass': 'Password',
      'register.form.pass_ph': 'Create a secure password',
      'register.form.pass2': 'Confirm password',
      'register.form.pass2_ph': 'Type your password again',
      'register.form.terms': 'I agree to the <a href="./terms.html">terms & conditions</a> and the <a href="./privacy.html">privacy policy</a>',
      'register.form.submit': 'Create account',

      'register.alt.text': 'Already have an account?',
      'register.alt.link': 'Log in',
      'register.back': 'Back to home',

      'recover.meta.title': 'New password | Global Speak Academy',
      'recover.title': 'Set a new password',
      'recover.subtitle': 'Choose a strong password for your account.',
      'recover.new.label': 'New password',
      'recover.new.placeholder': 'At least 8 characters',
      'recover.confirm.label': 'Confirm password',
      'recover.confirm.placeholder': 'Confirm your password',
      'recover.submit': 'Update password',
      'recover.back': '← Back to log in',

      'recoverEmail.meta.title': 'Reset password | Global Speak Academy',
      'recoverEmail.title': 'Forgot your password?',
      'recoverEmail.subtitle': 'Enter your email and we’ll send you a link to set a new password.',
      'recoverEmail.email.label': 'Email',
      'recoverEmail.email.placeholder': 'you@email.com',
      'recoverEmail.submit': 'Send link',
      'recoverEmail.back': '← Back to log in',

      'assessment.meta.title': 'Quick assessment | Global Speak Academy',
      'assessment.loading': 'Loading...',
      'assessment.progress.question_word': 'Question',
      'assessment.progress.of': 'of',
      'assessment.progress.completed_word': 'completed',
      'assessment.btn.prev': 'Back',
      'assessment.btn.next': 'Next',
      'assessment.cancel': 'Cancel assessment',

      'trial.meta.title': 'Trial | Global Speak Academy',
      'trial.intro.title': 'Personalized trial',
      'trial.intro.subtitle': 'We assigned you 3 blocks. You’ll answer 3 questions from each (9 total).',
      'trial.badge': 'Your trial (9 questions)',
      'trial.hero.title': '3 blocks assigned',
      'trial.hero.desc': 'You’ll answer 9 questions and then unlock the rest by creating an account.',
      'trial.btn.start': 'Start',
      'trial.blocks.title': 'Assigned blocks',
      'trial.back_assessment': 'Back to assessment',
      'trial.btn.back': 'Previous',
      'trial.hint': 'After finishing the trial, we’ll ask you to create an account to access the remaining questions from these blocks.',
      'trial.modal.title': 'Trial completed!',
      'trial.modal.later': 'Not now',
      'trial.modal.register': 'Create free account',
      'trial.modal.login': 'I already have an account',

      'trial.results.title': 'Assessment completed!',
      'trial.results.subtitle': 'Based on your answers, we selected your ideal blocks.',
      'trial.results.badge': 'Recommended for you',
      'trial.results.explore': 'Explore this block',
      'trial.results.other_blocks': 'Other available blocks',
      'trial.results.save_progress': 'Create an account to save progress',
      'trial.results.back_home': 'Back to home',
      'trial.quiz.back_to_blocks': '← Back to blocks',







    },

    PT: {
      'meta.title': 'Global Speak Academy',

      'nav.home_aria': 'Início',
      'nav.about': 'Sobre nós',
      'nav.faq': 'FAQ',
      'nav.login': 'Entrar',
      'nav.register': 'Registar',
      'nav.menu_aria': 'Menu',

      'footer.tagline': 'A sua academia online para dominar inglês com lições personalizadas.',
      'footer.platform': 'Plataforma',
      'footer.features': 'Funcionalidades',
      'footer.pricing': 'Preços',
      'footer.testimonials': 'Testemunhos',
      'footer.company': 'Empresa',
      'footer.about': 'Sobre nós',
      'footer.blog': 'Blog',
      'footer.contact': 'Contacto',
      'footer.legal': 'Legal',
      'footer.privacy': 'Privacidade',
      'footer.terms': 'Termos',
      'footer.cookies': 'Cookies',
      'footer.copyright': '© 2025 Global Speak Academy. Todos os direitos reservados.',

      'hero.title': 'Domine o inglês com<br><span class="accent">Global Speak Academy</span>',
      'hero.subtitle': 'Aprenda inglês de forma interativa e eficaz. Lições e exercícios personalizados e acompanhamento do seu progresso em tempo real.',
      'hero.cta_primary': 'Começar teste grátis',
      'hero.cta_secondary': 'Ver planos',
      'hero.no_card': 'Sem cartão de crédito',
      'hero.cancel_anytime': 'Cancele quando quiser',
      'hero.image_alt': 'Pessoa a estudar num portátil com uma chávena de café',

      'why.image_alt': 'Pessoa a estudar num portátil',
      'why.title': 'Por que escolher a Global Speak Academy?',
      'why.f1_title': 'Aprendizagem gamificada',
      'why.f1_desc': 'Sistema de pontos, sequências e conquistas que o mantém motivado. Transforme o estudo num jogo viciante.',
      'why.f2_title': 'Conteúdo personalizado',
      'why.f2_desc': 'Algoritmo adaptativo que ajusta o nível e os exercícios consoante o seu progresso e áreas de melhoria.',
      'why.f3_title': 'Aprenda ao seu ritmo',
      'why.f3_desc': 'Acesso 24/7 em qualquer dispositivo. Só precisa de 15 minutos por dia para ver resultados.',

      'reviews.title': 'O que dizem os nossos alunos',
      'reviews.subtitle': 'Mais de 50.000 alunos melhoraram o seu inglês com a Global Speak Academy',
      'reviews.r1': '"A Global Speak Academy mudou completamente a minha forma de aprender. As lições são tão divertidas que não parece que estou a estudar. Em 3 meses passei de A2 para B1."',
      'reviews.r2': '"Os exercícios de pronúncia com IA são incríveis. Posso praticar speaking sem vergonha e recebo feedback instantâneo. Recomendo muito."',
      'reviews.r3': '"Perfeita como complemento às minhas aulas presenciais. O sistema de repetição espaçada funciona mesmo para reter novo vocabulário."',
      'reviews.r4': '"Uso há 6 meses e a minha confiança a falar inglês aumentou muito. As conversas simuladas prepararam-me para situações reais. Obrigado, Global Speak!"',

      'about.meta.title': 'Sobre nós | Global Speak Academy',
      'about.hero.titlePrefix': 'Sobre',
      'about.hero.titleAccent': 'GSA',
      'about.hero.missionTitle': 'A Nossa Missão',
      'about.hero.missionP1': 'Democratizar a aprendizagem de inglês através de uma plataforma interativa, acessível e baseada na ciência da aprendizagem.',
      'about.hero.missionP2': 'Somos uma plataforma nova pensada para estudantes de língua espanhola, inglesa e portuguesa, com uma experiência adaptada a cada idioma desde o primeiro dia. O nosso objetivo é ajudá-lo a progredir com clareza e consistência, seja para viajar, trabalhar ou estudar no estrangeiro.',
      'about.hero.imageAlt': 'Aluno feliz a fazer sinal de positivo',

      'about.method.title': 'A Nossa Metodologia',
      'about.method.items.spaced.title': 'Repetição Espaçada',
      'about.method.items.spaced.desc': 'Sistema baseado em algoritmos que melhora a retenção de vocabulário a longo prazo.',
      'about.method.items.active.title': 'Prática Ativa',
      'about.method.items.active.desc': 'Aprenda fazendo: exercícios interativos de speaking, writing, listening e reading.',
      'about.method.items.feedback.title': 'Feedback Imediato',
      'about.method.items.feedback.desc': 'Correções instantâneas com explicações claras para acelerar a aprendizagem.',

      'about.contact.title': 'Entre em contacto',
      'about.contact.subtext': 'Estamos aqui para ajudar. Escreva-nos e esclarecemos as suas dúvidas.',
      'about.contact.labels.email': 'Email',
      'about.contact.labels.phone': 'Telefone',
      'about.contact.labels.location': 'Localização',
      'about.contact.labels.hours': 'Horário de atendimento',
      'about.contact.values.location': 'Málaga, Espanha',
      'about.contact.values.hours': 'Seg - Sex: 9:00 - 18:00',
      'about.contact.backHome': 'Voltar ao início',

      'faq.meta.title': 'Perguntas frequentes | Global Speak Academy',
      'faq.hero.title': 'Perguntas Frequentes',
      'faq.hero.subtitle': 'Tudo o que precisa de saber sobre a Global Speak Academy.',

      'faq.q1': 'Como funciona a plataforma?',
      'faq.a1': 'A Global Speak Academy utiliza lições interativas gamificadas com vocabulário, gramática, listening e speaking. O nosso algoritmo adaptativo ajusta o conteúdo ao seu nível e progresso para que aprenda de forma eficaz.',
      'faq.q2': 'Preciso de experiência prévia em inglês?',
      'faq.a2': 'Não. Oferecemos conteúdo de A1 a C2. Ao criar a sua conta fará um teste de nível de 5 minutos que personaliza a sua experiência desde o primeiro dia.',
      'faq.q3': 'Quanto tempo devo dedicar por dia?',
      'faq.a3': 'Recomendamos 15 a 30 minutos diários. A prática curta e consistente é mais eficaz; as sequências e lembretes ajudam a manter a consistência.',
      'faq.q4': 'Posso usar a plataforma no telemóvel?',
      'faq.a4': 'Sim, é 100% responsiva e funciona em smartphone, tablet, portátil ou computador. Pode mudar de dispositivo sem perder progresso graças à sincronização na nuvem.',
      'faq.q5': 'O que inclui o teste grátis?',
      'faq.a5': 'O teste gratuito permite aceder a 3 blocos de conteúdo com exercícios variados em cada um deles. Isto permite-lhe explorar diferentes áreas de aprendizagem antes de decidir se deseja continuar com um plano de subscrição. Não é necessário cartão de crédito para começar.',
      'faq.q6': 'Posso cancelar a subscrição a qualquer momento?',
      'faq.a6': 'Claro. Sem fidelização nem penalizações. Pode cancelar no painel com um clique e mantém o acesso até ao fim do período.',
      'faq.contact.prompt': 'Não encontra a resposta que procura?',
      'faq.contact.cta': 'Contacte-nos',
      'faq.backHome': 'Voltar ao início',

      'privacy.meta.title': 'Política de Privacidade | Global Speak Academy',
      'privacy.title': 'Política de Privacidade',
      'privacy.lead': 'Na Global Speak Academy cumprimos o RGPD e a legislação aplicável de proteção de dados. Aqui explicamos que dados recolhemos, para que os usamos e como pode exercer os seus direitos.',
      'privacy.s1.title': 'Responsável pelo tratamento e contacto',
      'privacy.s1.body': 'Responsável: Global Speak Academy<br>Email: <a href="mailto:contacto@duobusinesslingo.com">contacto@duobusinesslingo.com</a>',
      'privacy.s2.title': 'Dados que tratamos',
      'privacy.s2.li1': 'Dados da conta: nome, email, preferência de idioma, palavra-passe encriptada.',
      'privacy.s2.li2': 'Utilização da plataforma: progresso, lições concluídas, respostas aos exercícios.',
      'privacy.s2.li3': 'Dados de pagamento (se aplicável): geridos pelo fornecedor de pagamentos; não guardamos os dados completos do cartão.',
      'privacy.s2.li4': 'Suporte e comunicações: mensagens e pedidos de apoio que nos enviar.',
      'privacy.s3.title': 'Finalidades e base legal',
      'privacy.s3.li1': 'Prestar o serviço e gerir a sua conta (execução do contrato).',
      'privacy.s3.li2': 'Melhorar a plataforma com análises agregadas (interesse legítimo ou consentimento, consoante as cookies).',
      'privacy.s3.li3': 'Comunicações relacionadas com o serviço; marketing apenas com o seu consentimento.',
      'privacy.s3.li4': 'Faturação e cumprimento de obrigações legais (obrigação legal).',
      'privacy.s4.title': 'Partilhas e transferências internacionais',
      'privacy.s4.body': 'Partilhamos dados apenas com prestadores de serviços que atuam como subcontratantes (alojamento, analítica, pagamentos, suporte), ao abrigo de acordos compatíveis com o RGPD. Se existirem transferências para fora do EEE, aplicamos Cláusulas Contratuais-Tipo ou salvaguardas equivalentes.',
      'privacy.s5.title': 'Conservação dos dados',
      'privacy.s5.body': 'Conservamos os seus dados enquanto a sua conta estiver ativa. Os dados de faturação são guardados pelo período exigido por regras fiscais e contabilísticas. Ao cancelar, eliminamos ou anonimizamos os dados que não sejamos obrigados a manter.',
      'privacy.s6.title': 'Os seus direitos',
      'privacy.s6.body': 'Pode exercer os direitos de acesso, retificação, apagamento, oposição, limitação, portabilidade e retirar consentimentos, enviando um email para <a href="mailto:contacto@duobusinesslingo.com">contacto@duobusinesslingo.com</a>. Também pode apresentar reclamação junto da autoridade de controlo competente.',
      'privacy.s7.title': 'Segurança',
      'privacy.s7.body': 'Usamos encriptação em trânsito (HTTPS), controlo de acessos e armazenamento seguro de palavras-passe. Revemos e atualizamos regularmente as nossas medidas técnicas e organizativas.',

      'terms.meta.title': 'Termos e Condições | Global Speak Academy',
      'terms.title': 'Termos e Condições',
      'terms.lead': 'Estes termos regulam a utilização da plataforma Global Speak Academy. Leia-os com atenção antes de usar o serviço.',
      'terms.s1.title': 'Descrição do serviço',
      'terms.s1.body': 'Plataforma de aprendizagem de inglês com lições interativas, exercícios gamificados, acompanhamento de progresso e certificados digitais.',
      'terms.s2.title': 'Registo e conta',
      'terms.s2.li1': 'Deve fornecer informações corretas e manter a sua palavra-passe segura.',
      'terms.s2.li2': 'Idade mínima: 16 anos, ou consentimento dos pais/tutor.',
      'terms.s2.li3': 'Podemos suspender contas em caso de utilização indevida ou violação destes termos.',
      'terms.s3.title': 'Utilização aceitável',
      'terms.s3.li1': 'Não é permitido partilhar credenciais nem copiar, redistribuir ou revender conteúdos sem autorização.',
      'terms.s3.li2': 'Não use a plataforma para fins ilícitos nem tente aceder a sistemas de terceiros.',
      'terms.s4.title': 'Subscrições e cancelamento',
      'terms.s4.body': 'Os planos pagos renovam automaticamente de acordo com o ciclo de faturação escolhido. Pode cancelar a qualquer momento no seu painel; o acesso mantém-se até ao final do período já pago. Preços e condições podem ser atualizados mediante aviso prévio.',
      'terms.s5.title': 'Propriedade intelectual',
      'terms.s5.body': 'Os conteúdos, o design e o software pertencem à Global Speak Academy ou aos seus licenciadores. É-lhe concedida uma licença limitada, não exclusiva e intransmissível para usar a plataforma nos termos deste acordo.',
      'terms.s6.title': 'Responsabilidade',
      'terms.s6.body': 'A plataforma é disponibilizada “tal como está”. Não garantimos resultados específicos e não nos responsabilizamos por indisponibilidades de terceiros, perdas de dados por causas externas ou uso indevido. Quando permitido por lei, a nossa responsabilidade limita-se ao valor pago nos últimos 12 meses.',
      'terms.s7.title': 'Lei aplicável e jurisdição',
      'terms.s7.body': 'Aplica-se a lei espanhola. Qualquer litígio será submetido aos tribunais de Madrid, salvo normas imperativas de proteção do consumidor.',
      'terms.s8.title': 'Alterações',
      'terms.s8.body': 'Podemos atualizar estes termos. Avisaremos sobre alterações relevantes; a continuação da utilização do serviço significa que aceita a versão atualizada.',

      'cookies.meta.title': 'Política de Cookies | Global Speak Academy',
      'cookies.title': 'Política de Cookies',
      'cookies.lead': 'Esta política explica como e porquê usamos cookies e tecnologias semelhantes na Global Speak Academy.',
      'cookies.s1.title': 'O que são cookies?',
      'cookies.s1.body': 'Cookies são pequenos ficheiros guardados no seu dispositivo para memorizar preferências, melhorar o desempenho e perceber como o site é utilizado.',
      'cookies.s2.title': 'Cookies que usamos',
      'cookies.s2.li1': 'Essenciais: início de sessão, segurança e preferência de idioma.',
      'cookies.s2.li2': 'Analítica: medir utilização e desempenho (pode ser necessário consentimento para cookies de terceiros).',
      'cookies.s2.li3': 'Funcionais: memorizar definições da interface e o progresso.',
      'cookies.s3.title': 'Gerir e desativar cookies',
      'cookies.s3.body': 'Pode aceitar ou rejeitar cookies não essenciais no banner/painel de definições quando disponível. Também pode apagar ou bloquear cookies nas definições do seu navegador. Note que as cookies essenciais são necessárias para o funcionamento básico.',
      'cookies.s4.title': 'Terceiros e transferências',
      'cookies.s4.body': 'Se utilizarmos fornecedores de analítica ou serviços que impliquem transferências para fora do EEE, aplicamos Cláusulas Contratuais-Tipo ou outras salvaguardas adequadas.',
      'cookies.s5.title': 'Atualizações',
      'cookies.s5.body': 'Podemos atualizar esta política para refletir alterações nas cookies utilizadas ou na legislação aplicável. Indicaremos a data da última revisão.',

      'login.meta.title': 'Iniciar sessão | Global Speak Academy',
      'login.panel.title': 'Bem-vindo de volta',
      'login.panel.text': 'Continue o seu caminho rumo ao domínio do inglês. O seu progresso está à sua espera.',
      'login.tip.label': '<span aria-hidden="true">💡</span> Dica do dia',
      'login.tip.quote': '"A consistência é essencial. Apenas 15 minutos por dia podem fazer uma grande diferença na sua aprendizagem."',

      'login.card.title': 'Iniciar sessão',
      'login.card.subtitle': 'Aceda à sua conta da Global Speak Academy',
      'login.form.email': 'Email',
      'login.form.email_ph': 'o_seu@email.com',
      'login.form.password': 'Palavra-passe',
      'login.form.password_ph': 'A sua palavra-passe',
      'login.form.remember': 'Lembrar-me',
      'login.form.forgot': 'Esqueceu-se da palavra-passe?',
      'login.form.submit': 'Iniciar sessão',
      'login.divider.or': 'ou',
      'login.actions.create': 'Criar nova conta',
      'login.actions.back': 'Voltar ao início',

      'nav.logout': 'Sair',

      'cookie.title': 'Cookies',
      'cookie.desc': 'Usamos cookies essenciais para o funcionamento do site e, com a sua permissão, cookies para melhorar a sua experiência.',
      'cookie.more': 'Saber mais',
      'cookie.reject': 'Rejeitar',
      'cookie.accept': 'Aceitar',

      'register.meta.title': 'Registo | Global Speak Academy',
      'register.panel.title': 'Junte-se à Global Speak Academy',
      'register.panel.subtitle': 'Comece a sua jornada rumo ao domínio do inglês com milhares de alunos em todo o mundo',
      'register.b1': 'Lições interativas a partir do nível A1',
      'register.b2': 'Algoritmo adaptativo que ajusta o conteúdo ao seu nível',
      'register.b3': 'Acesso multiplataforma: estude a partir de qualquer dispositivo',
      'register.tip.label': '🎁 Oferta de boas-vindas',
      'register.tip.text': 'Registe-se hoje e aceda gratuitamente a 3 blocos de conteúdo. Sem compromisso, sem cartão. Comece já!',

      'register.card.title': 'Crie a sua conta',
      'register.card.subtitle': 'Preencha os seus dados para começar',

      'register.form.name': 'Nome completo',
      'register.form.name_ph': 'Ex.: Maria Garcia',
      'register.form.email': 'Email',
      'register.form.email_ph': 'o_seu@email.com',
      'register.form.email2': 'Confirmar email',
      'register.form.email2_ph': 'Volte a escrever o seu email',
      'register.form.pass': 'Palavra-passe',
      'register.form.pass_ph': 'Crie uma palavra-passe segura',
      'register.form.pass2': 'Confirmar palavra-passe',
      'register.form.pass2_ph': 'Volte a escrever a sua palavra-passe',
      'register.form.terms': 'Aceito os <a href="./terms.html">termos e condições</a> e a <a href="./privacy.html">política de privacidade</a>',
      'register.form.submit': 'Criar conta',

      'register.alt.text': 'Já tem conta?',
      'register.alt.link': 'Iniciar sessão',
      'register.back': 'Voltar ao início',

      'recover.meta.title': 'Nova palavra-passe | Global Speak Academy',
      'recover.title': 'Definir nova palavra-passe',
      'recover.subtitle': 'Crie uma palavra-passe forte para a sua conta.',
      'recover.new.label': 'Nova palavra-passe',
      'recover.new.placeholder': 'Mínimo de 8 caracteres',
      'recover.confirm.label': 'Confirmar palavra-passe',
      'recover.confirm.placeholder': 'Confirme a sua palavra-passe',
      'recover.submit': 'Alterar palavra-passe',
      'recover.back': '← Voltar ao início de sessão',

      'recoverEmail.meta.title': 'Recuperar palavra-passe | Global Speak Academy',
      'recoverEmail.title': 'Esqueceu-se da palavra-passe?',
      'recoverEmail.subtitle': 'Indique o seu email e enviaremos um link para definir uma nova palavra-passe.',
      'recoverEmail.email.label': 'Email',
      'recoverEmail.email.placeholder': 'o_seu@email.com',
      'recoverEmail.submit': 'Enviar link',
      'recoverEmail.back': '← Voltar ao início de sessão',

      'assessment.meta.title': 'Avaliação rápida | Global Speak Academy',
      'assessment.loading': 'A carregar...',
      'assessment.progress.question_word': 'Pergunta',
      'assessment.progress.of': 'de',
      'assessment.progress.completed_word': 'concluído',
      'assessment.btn.prev': 'Anterior',
      'assessment.btn.next': 'Seguinte',
      'assessment.cancel': 'Cancelar avaliação',

      'trial.meta.title': 'Teste | Global Speak Academy',
      'trial.intro.title': 'Teste personalizado',
      'trial.intro.subtitle': 'Atribuímos-te 3 blocos. Vais responder a 3 perguntas de cada (9 no total).',
      'trial.badge': 'O teu teste (9 perguntas)',
      'trial.hero.title': '3 blocos atribuídos',
      'trial.hero.desc': 'Vais responder a 9 perguntas e depois desbloquear o resto ao criares uma conta.',
      'trial.btn.start': 'Começar',
      'trial.blocks.title': 'Blocos atribuídos',
      'trial.back_assessment': 'Voltar à avaliação',
      'trial.btn.back': 'Anterior',
      'trial.hint': 'Ao terminares o teste, vamos pedir-te para criares uma conta para acederes às restantes perguntas destes blocos.',
      'trial.modal.title': 'Teste concluído!',
      'trial.modal.later': 'Agora não',
      'trial.modal.register': 'Criar conta grátis',
      'trial.modal.login': 'Já tenho conta',

      'trial.results.title': 'Avaliação concluída!',
      'trial.results.subtitle': 'Com base nas tuas respostas, selecionámos os blocos ideais para ti.',
      'trial.results.badge': 'Recomendação para você',
      'trial.results.explore': 'Explorar este bloco',
      'trial.results.other_blocks': 'Outros blocos disponíveis',
      'trial.results.save_progress': 'Criar conta para guardar progresso',
      'trial.results.back_home': 'Voltar ao início',
      'trial.quiz.back_to_blocks': '← Voltar aos blocos',




    }
  };

  let currentLang = getInitialLang();
  // IMPORTANT: Persist immediately so other scripts (like trial.js) can read it even before initI18n runs.
  localStorage.setItem(STORAGE_KEY, currentLang);

  function normalizeLang(raw) {
    if (!raw) return null;
    const v = String(raw).trim().toUpperCase();
    if (v.startsWith('ES')) return 'ES';
    if (v.startsWith('EN')) return 'EN';
    if (v.startsWith('PT')) return 'PT';
    return null;
  }

  function getInitialLang() {
    const stored = normalizeLang(localStorage.getItem(STORAGE_KEY));
    if (stored) return stored;

    const nav = normalizeLang(navigator.language || navigator.userLanguage);
    if (nav) return nav;

    // Fallback by locale
    const nl = (navigator.language || '').toLowerCase();
    if (nl.startsWith('es')) return 'ES';
    if (nl.startsWith('pt')) return 'PT';
    return DEFAULT_LANG;
  }

  function t(key) {
    return I18N[currentLang]?.[key] ?? I18N[DEFAULT_LANG]?.[key] ?? null;
  }

  function translateIn(scope = document) {
    scope.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val != null) el.textContent = val;
    });

    scope.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      const val = t(key);
      if (val != null) el.innerHTML = val;
    });

    scope.querySelectorAll('[data-i18n-alt]').forEach((el) => {
      const key = el.getAttribute('data-i18n-alt');
      const val = t(key);
      if (val != null) el.setAttribute('alt', val);
    });

    scope.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = t(key);
      if (val != null) el.setAttribute('placeholder', val);
    });

    scope.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria-label');
      const val = t(key);
      if (val != null) el.setAttribute('aria-label', val);
    });
  }

  function setHtmlLang() {
    document.documentElement.setAttribute('lang', LANG_TO_HTML[currentLang] || 'es');
  }

  function setTriggerText() {
    const trigger = document.querySelector('.lang-dropdown .lang');
    if (trigger) trigger.textContent = `${currentLang} ▾`;
  }

  function setActiveButton() {
    const menu = document.querySelector('.lang-dropdown .lang-menu');
    if (!menu) return;
    menu.querySelectorAll('button[data-lang]').forEach((btn) => {
      btn.classList.toggle('active', normalizeLang(btn.dataset.lang) === currentLang);
    });
  }
  function closeLangDropdown() {
    const wrap = document.querySelector('.lang-dropdown');
    if (!wrap) return;

    // Cierra por clases típicas
    wrap.classList.remove('open', 'is-open', 'active');

    const menu = wrap.querySelector('.lang-menu');
    if (menu) menu.classList.remove('open', 'is-open', 'active');

    // Accesibilidad
    const trigger = wrap.querySelector('.lang');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }


  function wireLanguageMenu() {
    const menu = document.querySelector('.lang-dropdown .lang-menu');
    if (!menu || menu.dataset.wired === '1') return;
    menu.dataset.wired = '1';

    menu.querySelectorAll('button[data-lang]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setLanguage(btn.dataset.lang);
        closeLangDropdown(); // ✅ se oculta al pulsar
      });
    });
  }

  function setLanguage(lang) {
    const normalized = normalizeLang(lang) || DEFAULT_LANG;
    currentLang = normalized;
    localStorage.setItem(STORAGE_KEY, currentLang);

    setHtmlLang();
    setActiveButton();
    setTriggerText();
    translateIn(document);

    document.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang: currentLang } }));
  }

  function initI18n() {
    // currentLang already set at top level
    setHtmlLang();

    // Translate what is already in the DOM
    translateIn(document);

    // When header/footer arrive, translate them too + wire language menu
    document.addEventListener('layout:loaded', () => {
      wireLanguageMenu();
      setActiveButton();
      setTriggerText();
      translateIn(document);
    });

    // If header already exists (no injection)
    wireLanguageMenu();
    setActiveButton();
    setTriggerText();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
  } else {
    initI18n();
  }

  // Optional global API
  window.GSA_I18N = {
    setLanguage,
    getLanguage: () => currentLang
  };
})();
