// Espera a que el contenido del DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    // Función asíncrona para obtener los datos (de localStorage o JSON)
    async function getData() {
        // Intenta obtener los datos de localStorage primero
        const localData = localStorage.getItem("data");
        if (localData) {
            return JSON.parse(localData);
        }

        // Si no están en localStorage, los busca en el archivo JSON
        try {
            const response = await fetch("mockData.json");
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de datos.');
            }
            const data = await response.json();
            // Guarda los datos en localStorage para futuras visitas
            localStorage.setItem("data", JSON.stringify(data));
            return data;
        } catch (error) {
            console.error("Error al obtener los datos:", error);
            return null;
        }
    }

    // Agrega un evento 'submit' al formulario de login
    loginForm.addEventListener('submit', async (event) => {
        // Previene el comportamiento por defecto del formulario (recargar la página)
        event.preventDefault();

        // Oculta cualquier mensaje de error previo
        errorMessage.classList.add('d-none');

        // Obtiene los valores ingresados por el usuario
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Obtiene todos los datos de la aplicación
        const data = await getData();

        if (!data || !data.administradores) {
            errorMessage.textContent = 'Error: No se pudieron verificar las credenciales.';
            errorMessage.classList.remove('d-none');
            return;
        }

        // Busca si existe un administrador con el email y contraseña ingresados
        const adminEncontrado = data.administradores.find(admin => admin.email === email && admin.password === password);

        // Si se encuentra el administrador...
        if (adminEncontrado) {
            // Guarda información de sesión en sessionStorage (se borra al cerrar la pestaña)
            sessionStorage.setItem('adminUser', JSON.stringify({ email: adminEncontrado.email }));
            // Redirige al panel de administración
            window.location.href = 'adminDashboard.html';
        } else {
            // Si no se encuentra, muestra un mensaje de error
            errorMessage.textContent = 'Usuario o contraseña incorrectos.';
            errorMessage.classList.remove('d-none');
        }
    });
});