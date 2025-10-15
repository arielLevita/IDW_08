document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    // URL simulada para cargar los datos (asumiendo que se cargan desde un archivo local)
    const MOCK_DATA_URL = 'mockData.json'; 

    // Función para cargar los datos simulados
    async function cargarDatos() {
        try {
            const response = await fetch(MOCK_DATA_URL);
            if (!response.ok) {
                throw new Error(`Error al cargar ${MOCK_DATA_URL}: ${response.statusText}`);
            }
            const data = await response.json();
            return data.administradores;
        } catch (error) {
            console.error("Fallo en la carga de datos:", error);
            // Mostrar un mensaje de error genérico si no se pueden cargar los datos
            errorMessage.textContent = "Error interno del sistema. No se pudo cargar la configuración.";
            errorMessage.classList.remove('d-none');
            return []; // Retorna un array vacío si falla la carga
        }
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita el envío tradicional del formulario
        
        const usuarios = await cargarDatos();
        
        const emailIngresado = emailInput.value.trim();
        const passwordIngresada = passwordInput.value.trim();
        
        errorMessage.classList.add('d-none'); // Ocultar mensaje de error al intentar de nuevo

        const usuarioEncontrado = usuarios.find(admin => 
            admin.email === emailIngresado && admin.password === passwordIngresada
        );

        if (usuarioEncontrado) {
            // ¡Éxito! Redirigir o mostrar mensaje de bienvenida
            console.log(`Bienvenido, ${usuarioEncontrado.name}!`);
            window.location.href = 'dashboard.html';
            alert(`¡Ingreso exitoso! Bienvenido, ${usuarioEncontrado.name}.`);
            loginForm.reset(); // Limpiar campos tras el éxito
        } else {
            // Falla la autenticación
            errorMessage.textContent = "Usuario o contraseña incorrectos.";
            errorMessage.classList.remove('d-none');
            passwordInput.value = ''; // Limpiar solo la contraseña por seguridad
        }
    });
});