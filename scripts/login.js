const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');
const togglePassword = document.getElementById('togglePassword');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameIngresado = usernameInput.value.trim();
    const passwordIngresada = passwordInput.value.trim();

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

        const res = await fetch("https://dummyjson.com/users");
        const usuariosDummy = await res.json();
        const adminsDummy = usuariosDummy.users.filter(usuario => usuario.role == "admin");
        const esAdmin = adminsDummy.some(admin => admin.username === data.username);

        if (response.ok && data.accessToken && esAdmin) {
            Swal.fire({
                title: "¡Ingreso exitoso!",
                theme: 'material-ui',
                text: `Bienvenido, ${usernameIngresado}.`,
                icon: "success",
                confirmButtonText: "Continuar",
                confirmButtonColor: "#044166",
            }).then(() => {
                sessionStorage.setItem("accessToken", JSON.stringify({
                    id: data.id,
                    usuario: data.username,
                    email: data.email,
                    nombre: `${data.firstName} ${data.lastName}`,
                    token: data.accessToken,
                    refreshToken: data.refreshToken,
                    loginTime: new Date().getTime(),
                    esAdmin: true
                }));
                window.location.href = 'dashboard.html';
            });
        } else if (response.ok && data.accessToken && !esAdmin) {
            Swal.fire({
                title: "Oops...",
                theme: 'material-ui',
                text: "El usuario no es Administrador",
                icon: "error",
                confirmButtonColor: "#044166",
            });
        } else {
            Swal.fire({
                title: "Oops...",
                theme: 'material-ui',
                text: "Usuario y/o contraseña incorrectos",
                icon: "error",
                confirmButtonColor: "#044166",
            });
        }
    } catch (error) {
        Swal.fire({
            title: "Ha ocurrido un error",
            theme: 'material-ui',
            text: "Por favor, haga una captura de pantalla de este error y póngase en contacto con la Clínica.",
            icon: "error",
            footer: `Error: ${error}`,
            confirmButtonColor: "#044166",
        });
        console.error("Ha ocurrido el siguiente error:", error);
    }
});
