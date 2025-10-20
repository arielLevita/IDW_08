document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username'); 
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const togglePassword = document.getElementById('togglePassword');

    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.textContent = type === 'password' ? '🔒' : '👁️';
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const usernameIngresado = usernameInput.value.trim();
        const passwordIngresada = passwordInput.value.trim();

        errorMessage.classList.add('d-none'); 

        try { 
            const response = await fetch('https://dummyjson.com/auth/login', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: usernameIngresado, 
                    password: passwordIngresada
                }),
            });

            const data = await response.json(); 
            console.log('API Response Data:', data);

            if (response.ok) {
                console.log(`Login successful for user: ${data.username}`);
                alert(`¡Ingreso exitoso! Bienvenido, ${data.firstName || data.username}.`);
                window.location.href = 'dashboard.html';
            }
            else {
                console.error('Login failed:', data.message);
                errorMessage.textContent = data.message || "Usuario o contraseña incorrectos."; 
                errorMessage.classList.remove('d-none');
                passwordInput.value = ''; 
            }
        } 
        catch (error) {
            console.error("Error during login request:", error);
            errorMessage.textContent = "Error de conexión o problema con el servidor. Intente más tarde.";
            errorMessage.classList.remove('d-none');
        }
    });
});