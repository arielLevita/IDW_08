# Universidad Nacional de Entre Ríos
## Facultad de Ciencias de la Administración

## Tecnicatura Universitaria en Desarrollo Web
### Cátedra: Introducción al Desarrollo Web
### Trabajo Final Integrador - Grupo: IDW_08

---

## Integrantes del Equipo

- Ariel Levita (@arielLevita)
- Elisa Beltramone (@Elisa-Beltramone)
- Gabriel Osvaldo Roman (@GabrielORoman)
- María Olivares (@MaryOlivares)
- Nerina Bonnin (@NerinaBonnin)
- Walter Cuesta (@wox9000)

---

# Bienestar Integral | Clínica Médica

## Descripcion General
El sistema web busca gestionar las principales operaciones de una clínica médica, incluyendo la administración de usuarios, médicos, reservas de turnos y obras sociales.

## Tecnologías Utilizadas

- **HTML:** Para estructurar el contenido de las páginas.
- **CSS:** Para definir estilos y conectar con los documentos HTML.
- **Bootstrap:** Para agregar responsividad en el sitio web.
- **JavaScript:** Para aportar funcionalidad.
- **localStorage:** Para la persistencia local de datos (CRUD de médicos y turnos) sin necesidad de servidor.
- **Fetch API:** Conexión con recursos externos (API pública DummyJSON).
- **sessionStorage:** Almacenamiento del accessToken y control de sesión del usuario logueado.

---

### Funcionalidades Principales

**Autenticación** 
    - Implementación de inicio de sesión real mediante la API pública de DummyJSON
    - Validación de credenciales y almacenamiento del accessToken en sessionStorage.
    - Protección de las secciones del panel para evitar acceso sin login.
    - Redirección automática a la pantalla de login si no hay usuario autenticado.

**Panel de Administración**
    - Panel de Usuarios que lista los pacientes que realizaron reservas junto con los usuarios de dummyJSON.
    - Listado dinámico con paginación, búsqueda y filtrado por rol y estado.
    - Control de visibilidad de datos sensibles según las buenas prácticas de seguridad.
    - CRUD completo para las entidades:
        * Médicos,
        * Especialidades,
        * Turnos,
        * Obras Sociales,
        * Reservas.

**Manejo de Datos**
    - Lectura de datos a través de fetch() hacia la API externa.
    - Persistencia local con localStorage para datos creados en el front-end.
    - sessionStorage para el control de sesión del usuario autenticado.

---

## Enlaces del Proyecto

-   **Repositorio GitHub:** [https://github.com/arielLevita/IDW_08](https://github.com/arielLevita/IDW_08)
