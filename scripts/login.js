const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');
const togglePassword = document.getElementById('togglePassword');

const ADMIN = [{
    username: "admin",
    password: "ac9689e2272427085e35b9d3e3e8bed88cb3434828b43b86fc0596cad4c6e270"
    // La contraseña es "admin1234".
}]

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameIngresado = usernameInput.value.trim();
    const passwordIngresada = passwordInput.value.trim();

    errorMessage.classList.add('d-none');

    try {
        const passHash = await hashPassword(passwordIngresada);
        const usuario = ADMIN.find(admin =>
            admin.username === usernameIngresado && admin.password === passHash
        );

        // * ESTO LO VAMOS A UTILIZAR CUNADO PASEMOS A LA API.
        // const response = await fetch('https://dummyjson.com/auth/login', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         username: usernameIngresado,
        //         password: passwordIngresada
        //     }),
        // });

        // const data = await response.json();
        // console.log('API Response Data:', data.message);

        if (usuario) {
            alert(`¡Ingreso exitoso! Bienvenido, ${usuario.username}.`);
            localStorage.setItem("auth", JSON.stringify({ username, isAdmin: true }));
            window.location.href = 'dashboard.html';
        } else {
            errorMessage.classList.remove('d-none');
            passwordInput.value = '';
        }
    } catch (error) {
        console.error("Ha ocurrido el siguiente error:", error);
    }
});

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    console.log(Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join(""))
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}