const selectEspecialidad = document.getElementById('especialidad');
const selectObraSocial = document.getElementById('obraSocial');
const selectMedico = document.getElementById('medico');
const formulario = document.getElementById('reserva-form');
const fechaInput = document.getElementById('fecha');
const selectHora = document.getElementById('hora');

let data;

async function cargarPagina() {
    try {
        data = await obtenerDatos();
        generarSelectEspecialidades();
        generarSelectObrasSociales();
        inicializarEventos();
    } catch (error) {
        console.error("Error al cargar la página:", error);
    }
}

cargarPagina();

function generarSelectEspecialidades() {
    data.especialidades.forEach(especialidad => {
        const option = document.createElement('option');
        option.value = especialidad.idEspecialidad;
        option.textContent = especialidad.nombreEspecialidad;
        selectEspecialidad.appendChild(option);
    });
}

function generarSelectObrasSociales() {
    data.obrasSociales.forEach(os => {
        const option = document.createElement('option');
        option.value = os.idObraSocial;
        option.textContent = os.nombreObraSocial
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
        selectObraSocial.appendChild(option);
    });
}

function inicializarEventos() {
    selectEspecialidad.addEventListener('change', generarSelectMedicos);
    selectMedico.addEventListener('change', cargarHorariosDisponibles);
    fechaInput.addEventListener('change', cargarHorariosDisponibles);
    formulario.addEventListener('submit', manejarEnvioFormulario);
}

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

function cargarHorariosDisponibles() {
    const idMedico = selectMedico.value;
    const diaSeleccionado = fechaInput.value;

    selectHora.innerHTML = '<option selected disabled value="">Seleccionar un horario...</option>';

    generarSelectHorarios(idMedico, diaSeleccionado);
}

function generarSelectMedicos() {
    const idEspSeleccionada = parseInt(selectEspecialidad.value);
    const medicosFiltrados = data.medicos.filter(
        medico => medico.idEspecialidad === idEspSeleccionada
    );

    selectMedico.innerHTML = '<option selected disabled value="">Seleccionar...</option>';

    medicosFiltrados.forEach(medico => {
        const option = document.createElement('option');
        option.value = medico.idMedico;
        option.textContent = `${medico.titulo} ${medico.nombreMedico} ${medico.apellidoMedico}`;
        selectMedico.appendChild(option);
    });
}

function generarSelectHorarios(idMedico, diaSeleccionado) {
    let turnosPorDia = data.turnos.filter(turno => turno.idMedico == parseInt(idMedico) && turno.dia == diaSeleccionado)

    turnosPorDia.forEach(turno => {
        const option = document.createElement('option');
        option.value = turno.hora;
        option.textContent = turno.hora;
        if (!turno.disponible) {
            option.disabled = true;
        }
        selectHora.appendChild(option);
    });
}

function manejarEnvioFormulario(event) {
    event.preventDefault();

    const diaSeleccionado = fechaInput.value;
    const horaSeleccionada = selectHora.value;

    const turnoSeleccionado = data.turnos.find(turno => turno.dia == diaSeleccionado && turno.hora == horaSeleccionada);

    const medicoSeleccionado = data.medicos.find(medico => medico.idMedico == selectMedico.value);
    const obraSocialSeleccionada = data.obrasSociales.find(os => os.idObraSocial == selectObraSocial.value);

    let valorReserva;
    if (medicoSeleccionado.obrasSocialesQueAcepta.includes(obraSocialSeleccionada.idObraSocial)) {
        valorReserva = medicoSeleccionado.valorConsulta * (1 - obraSocialSeleccionada.descuento / 100);
    } else {
        valorReserva = medicoSeleccionado.valorConsulta;
    }

    Swal.fire({
        title: "¿Desea confirmar la reserva?",
        text: `El valor estimado de la consulta es: $${valorReserva.toFixed(2)}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#045a29",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, confirmar",
        cancelButtonText: "No, cancelar"
    }).then((result) => {
        if (result.isConfirmed) {

            const solicitudReserva = {
                idReserva: Date.now(),
                documento: document.getElementById('documento').value,
                nombrePaciente: document.getElementById('nombrePaciente').value,
                telefonoPaciente: document.getElementById('telefono').value,
                emailPaciente: document.getElementById('email').value,
                idTurno: turnoSeleccionado.idTurno,
                idEspecialidad: parseInt(selectEspecialidad.value),
                idMedico: medicoSeleccionado.idMedico,
                idObraSocial: obraSocialSeleccionada.idObraSocial,
                motivoReserva: document.getElementById('mensaje').value,
                valorConsulta: valorReserva
            };

            if (!data.reservas) data.reservas = [];
            data.reservas.push(solicitudReserva);

            turnoSeleccionado.disponible = false;

            localStorage.setItem("data", JSON.stringify(data));

            Swal.fire({
                title: "Reserva enviada",
                text: "¡Tu solicitud fue enviada con éxito!",
                icon: "success",
                confirmButtonColor: "#045a29"
            }).then(() => {
                window.scrollTo(0, 0);
            });
        }
    });
}
