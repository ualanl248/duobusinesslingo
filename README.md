# Duo Business Lingo

Plataforma web para una academia de inglés de negocios: web pública de presentación, prueba de nivel, panel de alumno con ejercicios por niveles y foro, y panel de administración para gestionar contenidos, usuarios y suscripciones.

🔗 **Demo:** [duobusinesslingo.com](https://duobusinesslingo.com) <!-- confirma que sigue en línea -->

<!-- Añade aquí 2-3 capturas: landing, panel de alumno y panel de administración -->
<!-- ![Landing](docs/landing.png) -->

---

## Funcionalidades

**Web pública**
- Landing, preguntas frecuentes, planes y reseñas
- Registro, inicio de sesión y recuperación de contraseña por email
- Prueba de nivel inicial (*assessment*) y sesión de prueba gratuita
- Traducción a español, inglés y portugués
- Gestión del consentimiento de cookies

**Panel de alumno**
- Ejercicios tipo test organizados por niveles y bloques, con seguimiento del progreso
- Foro entre alumnos
- Perfil con foto de usuario

**Panel de administración**
- Crear, modificar, eliminar e importar actividades desde JSON
- Gestión de usuarios y permisos
- Moderación del foro y banners
- Planes de suscripción, pagos y reembolsos
- Envío de comunicaciones a los usuarios

---

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend | HTML, CSS y JavaScript (sin frameworks) |
| Backend | API REST en PHP |
| Base de datos | MariaDB / MySQL |
| Autenticación | JWT, contraseñas con bcrypt |
| Despliegue | Hostinger |

---

## Estructura

```
public_html/
├── index.html, login.html, register.html...   # Web pública
├── css/, js/                                   # Estilos y lógica de la web pública
├── FrontendCliente/                            # Panel de alumno
├── Admin/                                      # Panel de administración
│   ├── Actividades/  Perfil/  Foro/  Pagos/
│   └── js/auth-guard.js                        # Control de acceso al panel
└── Scripts/                                    # Esquema de la base de datos (SQL)
```

> El código de la API REST está en [enlace al repo del backend].

---

## Puesta en marcha en local

1. Clona el repositorio y el backend.
2. Crea la base de datos y ejecuta `Scripts/Script6.0.sql` y después `Scripts/ScriptEventos6.0.sql`.
3. Copia `config.example.php` a `config.php` en el backend y rellena tus credenciales (la base de datos se llama `duobusinesslingo`).
4. Sirve `public_html/` con un servidor PHP, por ejemplo:
   ```bash
   php -S localhost:8000 -t public_html
   ```

En local, el frontend usa automáticamente la API en `/api_rest/public/index.php` (ver `js/config.js`).

---

## Seguridad

- Contraseñas almacenadas con bcrypt.
- Autenticación con JWT y revocación de tokens al cerrar sesión.
- Enlaces de recuperación de contraseña de un solo uso.
- Comprobación del rol de administrador en el servidor, no solo en el navegador.

### Revisión de seguridad

Antes de publicar el código hice una revisión del proyecto y corregí:

- **XSS almacenado** en el foro, las reseñas de la portada, los perfiles de usuario y las solicitudes de reembolso. El texto escrito por los usuarios se insertaba en la página con `innerHTML` sin escapar, de modo que un mensaje con código JavaScript se ejecutaba en el navegador de quien lo leyera, incluido el administrador. Como el token de sesión se guarda en `localStorage`, esto permitía robar la sesión. Ahora todo el contenido de usuario se escapa antes de mostrarse y los `onclick` en línea se sustituyeron por atributos `data-*` con un listener.
- **Contraseñas en la consola**: el cambio de contraseña las imprimía en la consola del navegador.
- **Limpieza del repositorio**: volcados de la base de datos, imágenes subidas por usuarios, logs del servidor y archivos de prueba, ahora excluidos con `.gitignore`.

---

## Autoría

[Proyecto individual / Proyecto en equipo para la asignatura X de la Universidad de Almería, con @compañero1 y @compañero2.] Mi parte: [qué hiciste tú].

## Licencia

[MIT](LICENSE)
