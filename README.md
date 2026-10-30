# Duo Business Lingo

Plataforma web para una academia de inglés de negocios: web pública de presentación, prueba de nivel, panel de alumno con ejercicios por niveles y foro, y panel de administración para gestionar contenidos, usuarios y suscripciones.

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
---

## Seguridad

- Contraseñas almacenadas con bcrypt.
- Autenticación con JWT y revocación de tokens al cerrar sesión.
- Enlaces de recuperación de contraseña de un solo uso.
- Comprobación del rol de administrador en el servidor, no solo en el navegador.

---

## Autoría

Proyecto en equipo para la asignatura Tecnologías Web de la Universidad de Almería.

---

## Licencia

[MIT](LICENSE)
