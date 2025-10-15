document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    const MOCK_DATA_URL = 'mockData.json'; 

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
            errorMessage.textContent = "Error interno del sistema. No se pudo cargar la configuración.";
            errorMessage.classList.remove('d-none');
            return [];
        }
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const usuarios = await cargarDatos();
        
        const emailIngresado = emailInput.value.trim();
        const passwordIngresada = passwordInput.value.trim();
        
        errorMessage.classList.add('d-none'); 

        const usuarioEncontrado = usuarios.find(admin => 
            admin.email === emailIngresado && admin.password === passwordIngresada
        );

        if (usuarioEncontrado) {
            console.log(`Bienvenido, ${usuarioEncontrado.name}!`);
            window.location.href = 'dashboard.html';
            alert(`¡Ingreso exitoso! Bienvenido, ${usuarioEncontrado.name}.`);
            loginForm.reset();
        } else {
            errorMessage.textContent = "Usuario o contraseña incorrectos.";
            errorMessage.classList.remove('d-none');
            passwordInput.value = ''; 
        }
    });
});