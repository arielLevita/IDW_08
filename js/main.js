document.addEventListener('DOMContentLoaded', function() {

    const botonSolicitarTurno = document.getElementById('btn-solicitar-turno');

    if (botonSolicitarTurno) {
        botonSolicitarTurno.addEventListener('click', function() {
            window.location.href = 'turnos.html';
        });
    }

});