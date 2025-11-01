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
        const response = await fetch("../mock_data/mockData.json"); 
        const data = await response.json();
        localStorage.setItem("data", JSON.stringify(data));
        return data;
    }
}