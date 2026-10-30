# Duo Business Lingo

Plataforma web para una academia de inglés de negocios: web pública de presentación, prueba de nivel, panel de alumno con ejercicios por niveles y foro, y panel de administración para gestionar contenidos, usuarios y suscripciones.

---
## Modelado el figma

<img width="1212" height="689" alt="image" src="https://github.com/user-attachments/assets/ba1d499c-5a7d-4b14-a386-862dc27bdf5b" />

<img width="692" height="570" alt="image" src="https://github.com/user-attachments/assets/a9c29e54-5599-47e0-b931-37a381a9b835" />

<img width="560" height="630" alt="image" src="https://github.com/user-attachments/assets/19858714-d8a2-4f6a-b85b-4f6748ec5e2c" />

<img width="1213" height="689" alt="image" src="https://github.com/user-attachments/assets/e4a86852-1c56-4df0-998b-5fe37348b70a" />

<img width="932" height="638" alt="image" src="https://github.com/user-attachments/assets/991b8752-098d-45f9-88b9-3cb596f5c52f" />

<img width="786" height="626" alt="image" src="https://github.com/user-attachments/assets/fe89cb74-08dc-4166-99b9-2e8c61f1450b" />

<img width="1212" height="686" alt="image" src="https://github.com/user-attachments/assets/4bc4981f-1d6a-4940-90dd-05c6de7b9649" />


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
