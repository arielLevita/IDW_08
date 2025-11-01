const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');
const togglePassword = document.getElementById('togglePassword');

const ADMIN = [
    {
        username: "admin1",
        // Contraseña: admin123
        password: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
        rol: "admin"
    },
    {
        username: "admin2",
        // Contraseña: 12345
        password: "5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5",
        rol: "admin"
    }
];

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameIngresado = usernameInput.value.trim();
    const passwordIngresada = passwordInput.value.trim();

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
            Swal.fire({
                title: "¡Ingreso exitoso!",
                text: `Bienvenido, ${usuario.username}.`,
                icon: "success",
                confirmButtonText: "Continuar",
                confirmButtonColor: "#044166",
            }).then(() => {
                localStorage.setItem("auth", JSON.stringify({
                    username: usuario.username,
                    rol: usuario.rol,
                    isAdmin: usuario.rol === "admin",
                    loginTime: new Date().getTime()
                }));
                window.location.href = 'dashboard.html';
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Usuario y/o contraseña incorrectos",
                confirmButtonText: "Ok",
                confirmButtonColor: "#044166",
            });
        }
    } catch(error) {
        Swal.fire({
                icon: "error",
                title: "Ha ocurrido un error",
                text: "Por favor, haga una captura de pantalla de este error y póngase en contacto con la Clínica.",
                footer: `Error: ${error}`,
                confirmButtonText: "Ok",
                confirmButtonColor: "#044166",
            });
        console.error("Ha ocurrido el siguiente error:", error);
    }
});

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}