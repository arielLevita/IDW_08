document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email'); 
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    const DUMMYJSON_LOGIN_URL = 'https://dummyjson.com/auth/login';

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const usernameIngresado = emailInput.value.trim();
        const passwordIngresada = passwordInput.value.trim();

        errorMessage.classList.add('d-none'); 

        try {
            
            const response = await fetch(DUMMYJSON_LOGIN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: usernameIngresado, 
                    password: passwordIngresada
                })
            });

            if (response.ok) {
                const userData = await response.json(); 
                console.log(`Login successful for user: ${userData.username}`);
                console.log('User data:', userData); 
               
                window.location.href = 'dashboard.html'; 
                
                alert(`¡Ingreso exitoso! Bienvenido, ${userData.firstName || userData.username}.`);
                loginForm.reset();
            } else {
                
                const errorData = await response.json();
                console.error('Login failed:', errorData.message);
                errorMessage.textContent = errorData.message || "Usuario o contraseña incorrectos."; 
                errorMessage.classList.remove('d-none');
                passwordInput.value = ''; 
            }
        } catch (error) {
            
            console.error("Error during login request:", error);
            errorMessage.textContent = "Error de conexión o problema con el servidor. Intente más tarde.";
            errorMessage.classList.remove('d-none');
        }
    });
});