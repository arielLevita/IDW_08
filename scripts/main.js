async function loadPage() {
    let data;

    if (localStorage.getItem("data")) {
        data = await getDataFromLS();
    } else {
        data = await getDataFromJSON();
    }
}

loadPage()

async function getDataFromLS() {
    try {
        const data = localStorage.getItem("data");
        return JSON.parse(data)
    } catch (error) {
        console.error(error)
    }
}

async function getDataFromJSON() {
    try {
        const response = await fetch("../mockData.json");
        const data = await response.json();
        localStorage.setItem("data", JSON.stringify(data));
        return data;
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', function() {

    const botonSolicitarTurno = document.getElementById('btn-solicitar-turno');

    if (botonSolicitarTurno) {
        botonSolicitarTurno.addEventListener('click', function() {
            // CORRECCIÓN: La ruta debe apuntar a la carpeta 'pages'
            window.location.href = 'pages/turnos.html';
        });
    }

});