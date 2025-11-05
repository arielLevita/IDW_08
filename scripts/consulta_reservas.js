const listaReservas = document.getElementById("listaReservas");
const buscarReservas = document.getElementById("buscarReserva");
let data;

async function loadPage() {
    if (localStorage.getItem("data")) {
        data = await getDataFromLS();
    } else {
        data = await getDataFromJSON();
    }
}

loadPage();

async function getDataFromLS() {
    try {
        const data = localStorage.getItem("data");
        return JSON.parse(data);
    } catch (error) {
        console.error(error);
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

function renderReservas(documento) {
    const { obrasSociales, medicos, turnos, especialidades } = data;
    const reservasFiltradas = data.reservas.filter(reserva => reserva.documento === documento);

    listaReservas.innerHTML = "";

    if (reservasFiltradas.length === 0) {
        listaReservas.innerHTML = 'No hay reservas para este paciente';
        return;
    }

    let dFrag = document.createDocumentFragment();
    reservasFiltradas.forEach(reserva => {
        let div = document.createElement("div");
        let turno = turnos.find(turno => reserva.idTurno === turno.idTurno);
        let medico = medicos.find(medico => turno.idMedico === medico.idMedico);
        let especialidad = especialidades.find(especialidad => reserva.idEspecialidad === especialidad.idEspecialidad);
        let obraSocial = obrasSociales.find(obraSocial => reserva.idObraSocial === obraSocial.idObraSocial) || null;

        div.innerHTML = `
            <div class="card shadow" style="width: 18rem;">
                <img src="${medico.imagenMedico}" class="card-img-top" alt="Imagen de ${medico.apellidoMedico}">
                <div class="card-body">
                    <h5 class="card-title">${medico.titulo} ${medico.nombreMedico} ${medico.apellidoMedico}</h5>
                    <p class="card-text">${especialidad.nombreEspecialidad}</p>
                </div>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item"><span class="fw-semibold">Obra Social:</span> ${obraSocial ? obraSocial.nombreObraSocial : "Sin obra Social"}</li>
                    <li class="list-group-item"><span class="fw-semibold">dia:</span> ${turno.dia}</li>
                    <li class="list-group-item"><span class="fw-semibold">Horario:</span> ${turno.hora}</li>
                    <li class="list-group-item"><span class="fw-semibold">Valor de la consulta($):</span> ${reserva.valorConsulta}</li>
                </ul>
                <div class="card-footer d-flex justify-content-center p-0">
                    <button class="btn btn-danger rounded-top-0 w-100 h-100 border-0 bg-danger" onclick="eliminarReserva(${reserva.idReserva}, ${documento})">Cancelar reserva</button>
                </div>
            </div>
        `;
        dFrag.appendChild(div);
    });

    listaReservas.appendChild(dFrag);
}

buscarReservas.addEventListener('submit', e => {
    e.preventDefault();
    const documento = parseInt(documentoPaciente.value.trim());
    renderReservas(documento);
});

function eliminarReserva(idReserva, documento) {
    const { obrasSociales, medicos, turnos, especialidades } = data;
    const reserva = data.reservas.find(reserva => reserva.idReserva == idReserva);
    const turno = turnos.find(turno => reserva.idTurno === turno.idTurno);
    const medico = medicos.find(medico => turno.idMedico === medico.idMedico);
    const especialidad = especialidades.find(especialidad => reserva.idEspecialidad === especialidad.idEspecialidad);
    const obraSocial = obrasSociales.find(obraSocial => reserva.idObraSocial === obraSocial.idObraSocial) || null;

    Swal.fire({
        title: "¿Desea cancelar esta reserva?",
        theme: 'material-ui',
        text: "La cancelación no puede ser revertida.",
        icon: "warning",
        html: `
            <strong>Médico:</strong> ${medico.titulo} ${medico.nombreMedico} ${medico.apellidoMedico}<br>
            <strong>Especialidad:</strong> ${especialidad.nombreEspecialidad}<br>
            <strong>Obra Social:</strong> ${obraSocial ? obraSocial.nombreObraSocial : "Sin obra Social"}<br>
            <strong>dia:</strong> ${turno.dia}<br>
            <strong>Horario:</strong> ${turno.hora}<br>
            <strong>Valor de la consulta($):</strong> ${reserva.valorConsulta}
        `,
        showCancelButton: true,
        confirmButtonColor: "#045a29",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "No, volver"
    }).then((result) => {
        if (result.isConfirmed) {
            data.reservas = data.reservas.filter(reserva => reserva.idReserva !== idReserva);

            const turnoCancelado = data.turnos.find(turno => turno.idTurno === reserva.idTurno);
            if (turnoCancelado) turnoCancelado.disponible = true;

            localStorage.setItem("data", JSON.stringify(data));

            Swal.fire({
                title: "Cancelada!",
                theme: 'material-ui',
                text: "La reserva ha sido cancelada con éxito.",
                icon: "success",
                confirmButtonColor: "#044166"
            });

            renderReservas(documento);
        }
    });
}
