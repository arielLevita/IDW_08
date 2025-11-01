document.addEventListener('DOMContentLoaded', async () => {
    
    const data = await obtenerDatos();
    const selectEspecialidad = document.getElementById('especialidad');
    const selectObraSocial = document.getElementById('obraSocial');
    const selectMedico = document.getElementById('medico');
    const formulario = document.getElementById('turno-form');
    const fechaInput = document.getElementById('fecha');
    const selectHora = document.getElementById('hora');

    data.especialidades.forEach(especialidad => {
        const option = document.createElement('option');
        option.value = especialidad.idEspecialidad;
        option.textContent = especialidad.nombreEspecialidad;
        selectEspecialidad.appendChild(option);
    });

    data.obrasSociales.forEach(os => {
        const option = document.createElement('option');
        option.value = os.idObraSocial;
        option.textContent = os.nombreObraSocial.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        selectObraSocial.appendChild(option);
    });

    selectEspecialidad.addEventListener('change', () => {
        const idEspSeleccionada = parseInt(selectEspecialidad.value);
        
        const medicosFiltrados = data.medicos.filter(medico => medico.idEspecialidad === idEspSeleccionada);
        
        selectMedico.innerHTML = '<option selected disabled value="">Seleccionar...</option>';
        
        medicosFiltrados.forEach(medico => {
            const option = document.createElement('option');
            option.value = medico.idMedico;
            option.textContent = `${medico.titulo} ${medico.nombreMedico} ${medico.apellidoMedico}`;
            selectMedico.appendChild(option);
        });
    });

    selectMedico.addEventListener('change', cargarHorariosDisponibles);
    fechaInput.addEventListener('change', cargarHorariosDisponibles);

    formulario.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const solicitudTurno = {
            id: Date.now(),
            paciente: document.getElementById('nombre').value,
            obraSocial: document.getElementById('obraSocial').options[document.getElementById('obraSocial').selectedIndex].text,
            telefono: document.getElementById('telefono').value,
            email: document.getElementById('email').value,
            idEspecialidad: document.getElementById('especialidad').value,
            idMedico: document.getElementById('medico').value,
            fecha: document.getElementById('fecha').value,
            hora: document.getElementById('hora').value, // <-- AÑADIR ESTA LÍNEA
            motivo: document.getElementById('mensaje').value,
            estado: 'Solicitado'
        };
        
        const solicitudes = JSON.parse(localStorage.getItem('solicitudesDeTurno')) || [];
        solicitudes.push(solicitudTurno);
        localStorage.setItem('solicitudesDeTurno', JSON.stringify(solicitudes));
        
        alert('¡Solicitud de turno enviada con éxito!');
        formulario.reset();
        selectMedico.innerHTML = '<option selected disabled value="">Primero elegí una especialidad</option>';
    });

});

async function obtenerDatos() {
    if (localStorage.getItem("data")) {
        return JSON.parse(localStorage.getItem("data"));
    } else {
        const response = await fetch("../mockData.json"); 
        const data = await response.json();
        localStorage.setItem("data", JSON.stringify(data));
        return data;
    }
}

async function cargarHorariosDisponibles() {
    const data = await obtenerDatos();
    const idMedico = document.getElementById('medico').value;
    const fechaInput = document.getElementById('fecha').value;
    const selectHora = document.getElementById('hora');

    selectHora.innerHTML = '<option selected disabled value="">Seleccionar un horario...</option>';

    if (!idMedico || !fechaInput) {
        return;
    }

    const fechaSeleccionada = new Date(fechaInput + 'T00:00:00');
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const nombreDia = diasSemana[fechaSeleccionada.getUTCDay()];

    const turnosDelMedico = data.turnos.filter(turno => 
        turno.idMedico == idMedico &&
        turno.día === nombreDia &&
        turno.disponible === true
    );

    if (turnosDelMedico.length === 0) {
        selectHora.innerHTML = '<option disabled value="">No hay turnos disponibles</option>';
        return;
    }

    const solicitudes = JSON.parse(localStorage.getItem('solicitudesDeTurno')) || [];
    let horariosAgregados = 0;

    turnosDelMedico.forEach(turno => {
        
        const estaSolicitado = solicitudes.some(sol => 
            sol.idMedico == turno.idMedico &&
            sol.fecha === fechaInput &&
            sol.hora === turno.hora
        );

        if (!estaSolicitado) {
            const option = document.createElement('option');
            option.value = turno.hora;
            option.textContent = turno.hora;
            selectHora.appendChild(option);
            horariosAgregados++;
        }
    });

    if (horariosAgregados === 0) {
         selectHora.innerHTML = '<option disabled value="">No hay turnos disponibles para este día</option>';
    }
}