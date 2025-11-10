const auth = JSON.parse(localStorage.getItem("auth"));
if (!auth || !auth.esAdmin) {
    window.location.href = "../index.html";
}

function cerrarSesion() {
    localStorage.removeItem("auth");
    window.location.href = "../index.html";
}

async function iniciarPagina() {
    try {
        await cargarDatos();
        generarOpcionesEspecialidades();
        generarCheckboxesObrasSociales();
        generarTablaMedicos();
        generarTablaEspecialidades();
        generarTablaObrasSociales();
        generarMedicoSelect();
        generarTablaUsuarios();
        generarTablaReservas();
        generarSelectsReservas();
    } catch (error) {
        console.log("Error en la carga de la página: ", error)
    }
};

iniciarPagina();

async function cargarDatos() {
    if (localStorage.getItem("data")) {
        data = JSON.parse(localStorage.getItem("data"));
    } else {
        const response = await fetch("../mockData.json");
        data = await response.json();
        localStorage.setItem("data", JSON.stringify(data));
    }
}

/* -------------------------- */
/* ------ CRUD Médicos ------ */
/* -------------------------- */

function generarTablaMedicos() {
    const tbody = document.getElementById("tablaMedicos").querySelector("tbody");
    tbody.innerHTML = "";

    data.medicos.forEach(medico => {
        const especialidad = data.especialidades.find(especialidad => especialidad.idEspecialidad === medico.idEspecialidad);
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><img src="${medico.imagenMedico}" alt="foto de ${medico.apellidoMedico}"></td>
            <td>${medico.titulo} ${medico.nombreMedico} ${medico.apellidoMedico}</td>
            <td>${especialidad ? especialidad.nombreEspecialidad : "—"}</td>
            <td>$${medico.valorConsulta}</td>
            <td>
                <button class="btn btn-sm btn-editar fw-semibold me-1" onclick="editarMedico(${medico.idMedico})">Editar</button>
                <button class="btn btn-sm btn-eliminar fw-semibold" onclick="eliminarMedico(${medico.idMedico})">Eliminar</button>
            </td>
            `;
        tbody.appendChild(tr);
    });
}

function generarOpcionesEspecialidades() {
    const select = document.getElementById("idEspecialidadMedico");
    select.innerHTML = '<option value="">Seleccione...</option>';
    data.especialidades.forEach(especialidad => {
        const option = document.createElement("option");
        option.value = especialidad.idEspecialidad;
        option.textContent = especialidad.nombreEspecialidad;
        select.appendChild(option);
    });
}

function generarCheckboxesObrasSociales() {
    const container = document.getElementById("obrasSocialesContainer");
    container.innerHTML = "";
    data.obrasSociales.forEach(os => {
        const div = document.createElement("div");
        div.classList.add("form-check");
        div.innerHTML = `
            <input class="form-check-input" type="checkbox" id="obra${os.idObraSocial}" value="${os.idObraSocial}">
            <label class="form-check-label text-uppercase" for="obra${os.idObraSocial}">${os.nombreObraSocial}</label>
            `;
        container.appendChild(div);
    });
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function generarTurnosParaMedico(idMedico) {
    const dias = ["lunes", "martes", "miercoles", "jueves", "viernes"];
    const turnos = [];

    let idTurno = data.turnos.length > 0
        ? Math.max(...data.turnos.map(t => t.idTurno)) + 1
        : 1;

    dias.forEach(dia => {
        for (let hora = 9; hora <= 12; hora++) {
            for (let minutos of [0, 30]) {
                const horaStr = `${hora.toString().padStart(2, "0")}:${minutos === 0 ? "00" : "30"}`;
                turnos.push({
                    idTurno: idTurno++,
                    idMedico,
                    dia: dia,
                    hora: horaStr,
                    disponible: true
                });
            }
        }
    });

    return turnos;
}

document.getElementById("medicoForm").addEventListener("submit", async e => {
    e.preventDefault();

    const id = document.getElementById("idMedico").value || Date.now();
    const titulo = document.getElementById("titulo").value;
    const nombreMedico = document.getElementById("nombreMedico").value;
    const apellidoMedico = document.getElementById("apellidoMedico").value;
    const matricula = parseInt(document.getElementById("matricula").value);
    const valorConsulta = parseFloat(document.getElementById("valorConsulta").value);
    const descripcionMedico = document.getElementById("descripcionMedico").value;
    const idEspecialidad = parseInt(document.getElementById("idEspecialidadMedico").value);

    const obrasSeleccionadas = [...document.querySelectorAll("#obrasSocialesContainer input:checked")]
        .map(checked => parseInt(checked.value));

    const imagenInput = document.getElementById("imagenMedico");
    let imagenMedico = "";

    if (imagenInput.files[0]) {
        imagenMedico = await toBase64(imagenInput.files[0]);
    } else {
        const existente = data.medicos.find(medico => medico.idMedico == id);
        imagenMedico = existente ? existente.imagenMedico : "";
    }

    if (!matricula || !apellidoMedico || !nombreMedico || !idEspecialidad || !descripcionMedico || !valorConsulta) {
        Swal.fire({
            title: "Advertencia",
            theme: 'material-ui',
            text: "Debe completar todos los campos.",
            icon: "warning",
            confirmButtonColor: "#044166"
        });
        return;
    }

    const nuevoMedico = {
        idMedico: parseInt(id),
        matricula,
        titulo,
        apellidoMedico,
        nombreMedico,
        idEspecialidad,
        descripcionMedico,
        obrasSocialesQueAcepta: obrasSeleccionadas,
        imagenMedico,
        valorConsulta
    };

    const index = data.medicos.findIndex(medico => medico.idMedico == id);
    if (index > -1) {
        data.medicos[index] = nuevoMedico;
    } else {
        data.medicos.push(nuevoMedico);

        const nuevosTurnos = generarTurnosParaMedico(nuevoMedico.idMedico);
        if (!data.turnos) data.turnos = [];
        data.turnos.push(...nuevosTurnos);
    }

    localStorage.setItem("data", JSON.stringify(data));
    Swal.fire({
        title: "Guardado!",
        theme: 'material-ui',
        text: "El registro ha sido modificado con éxito",
        icon: "success",
        confirmButtonColor: "#044166"
    }).then(() => {
        e.target.reset();
        document.getElementById("idMedico").value = "";
        iniciarPagina();
    });
});

function editarMedico(id) {
    const medico = data.medicos.find(medico => medico.idMedico == id);
    if (!medico) return;

    document.getElementById("idMedico").value = medico.idMedico;
    document.getElementById("titulo").value = medico.titulo;
    document.getElementById("nombreMedico").value = medico.nombreMedico;
    document.getElementById("apellidoMedico").value = medico.apellidoMedico;
    document.getElementById("matricula").value = medico.matricula;
    document.getElementById("valorConsulta").value = medico.valorConsulta;
    document.getElementById("descripcionMedico").value = medico.descripcionMedico;
    document.getElementById("idEspecialidadMedico").value = medico.idEspecialidad;

    document.querySelectorAll("#obrasSocialesContainer input").forEach(checkbox => {
        checkbox.checked = medico.obrasSocialesQueAcepta.includes(parseInt(checkbox.value));
    });
}

function eliminarMedico(id) {
    Swal.fire({
        title: "¿Desea eliminar este médico?",
        theme: 'material-ui',
        text: "La eliminación no puede ser revertida.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#045a29",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "No, cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            if (data.turnos && Array.isArray(data.turnos)) {
                data.turnos = data.turnos.map(turno => {
                    if (turno.idMedico == id) {
                        return { ...turno, disponible: false };
                    }
                    return turno;
                });
            }

            if (data.reservas && Array.isArray(data.reservas)) {
                data.reservas = data.reservas.filter(reserva => reserva.idMedico != id);
            }

            data.medicos = data.medicos.filter(medico => medico.idMedico != id);
            localStorage.setItem("data", JSON.stringify(data));

            Swal.fire({
                title: "Eliminado!",
                theme: 'material-ui',
                text: "El médico ha sido eliminado con éxito.",
                icon: "success",
                confirmButtonColor: "#044166"
            });

            iniciarPagina();
        }
    });
}


/* --------------------------- */
/* --- CRUD Especialidades --- */
/* --------------------------- */

function generarTablaEspecialidades() {
    const tbody = document.getElementById("tablaEspecialidades").querySelector("tbody");
    tbody.innerHTML = "";

    data.especialidades.forEach((especialidad, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${especialidad.nombreEspecialidad}</td>
            <td>
                <button class="btn btn-sm btn-editar fw-semibold me-1" onclick="editarEspecialidad(${especialidad.idEspecialidad})">Editar</button>
                <button class="btn btn-sm btn-eliminar fw-semibold" onclick="eliminarEspecialidad(${especialidad.idEspecialidad})">Eliminar</button>
            </td>
            `;
        tbody.appendChild(tr);
    });
}

document.getElementById("especialidadesForm").addEventListener("submit", e => {
    e.preventDefault();

    const idEspecialidad = document.getElementById("idEspecialidad").value
        ? parseInt(document.getElementById("idEspecialidad").value)
        : Date.now();
    const nombreEspecialidad = document.getElementById("nombreEspecialidad").value.trim();

    if (!nombreEspecialidad) {
        Swal.fire({
            title: "Advertencia",
            theme: 'material-ui',
            text: "Debe ingresar un nombre para la especialidad.",
            icon: "warning",
            confirmButtonColor: "#044166"
        });
        return;
    }

    const index = data.especialidades.findIndex(especialidad => especialidad.idEspecialidad === idEspecialidad);

    if (index > -1) {
        data.especialidades[index].nombreEspecialidad = nombreEspecialidad;
    } else {
        data.especialidades.push({ idEspecialidad, nombreEspecialidad });
    }

    localStorage.setItem("data", JSON.stringify(data));

    e.target.reset();
    document.getElementById("idEspecialidad").value = "";

    Swal.fire({
        title: "Guardado!",
        theme: 'material-ui',
        text: "El registro ha sido modificado con éxito",
        icon: "success",
        confirmButtonColor: "#044166"
    });
    iniciarPagina();
});

function editarEspecialidad(idEspecialidad) {
    const especialidad = data.especialidades.find(especialidades => especialidades.idEspecialidad === idEspecialidad);
    if (!especialidad) return;

    document.getElementById("idEspecialidad").value = especialidad.idEspecialidad;
    document.getElementById("nombreEspecialidad").value = especialidad.nombreEspecialidad;
}

function eliminarEspecialidad(idEspecialidad) {
    Swal.fire({
        title: "¿Desea eliminar esta especialidad?",
        theme: 'material-ui',
        text: "La eliminación no puede ser revertida.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#045a29",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "No, cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            data.especialidades = data.especialidades.filter(especialidad => especialidad.idEspecialidad !== idEspecialidad);

            let medicosAfectados = 0;
            data.medicos.forEach(medico => {
                if (medico.idEspecialidad === idEspecialidad) {
                    medico.idEspecialidad = 0;
                    medicosAfectados++;
                }
            });

            localStorage.setItem("data", JSON.stringify(data));

            if (medicosAfectados > 0) {
                Swal.fire({
                    title: "Advertencia",
                    theme: 'material-ui',
                    text: `La especialidad fue eliminada. ${medicosAfectados} médico(s) quedaron sin especialidad asignada.`,
                    icon: "warning",
                    confirmButtonColor: "#044166"
                });
            }

            Swal.fire({
                title: "Eliminada!",
                theme: 'material-ui',
                text: "La especialidad ha sido eliminada con éxito.",
                icon: "success",
                confirmButtonColor: "#044166"
            });

            iniciarPagina();
        }
    });
};


/* --------------------------- */
/* ------- CRUD Turnos ------- */
/* --------------------------- */

const tablaTurnos = document.getElementById("tablaTurnos").querySelector("tbody");
const btnGuardar = document.getElementById("guardarCambios");
const dias = ["lunes", "martes", "miercoles", "jueves", "viernes"];

function generarMedicoSelect() {
    data.medicos.forEach(medico => {
        const option = document.createElement("option");
        option.value = medico.idMedico;
        option.textContent = `${medico.titulo} ${medico.nombreMedico} ${medico.apellidoMedico}`;
        medicoSelect.appendChild(option);
    });
};

document.getElementById("medicoSelect").addEventListener("change", () => {
    const idMedico = parseInt(medicoSelect.value);
    if (!idMedico) {
        tablaTurnos.innerHTML = "";
        btnGuardar.disabled = true;
        return;
    }

    const turnosMedico = data.turnos.filter(turno => turno.idMedico === idMedico);

    if (turnosMedico.length === 0) {
        tablaTurnos.innerHTML = `
            <tr><td colspan="6" class="text-muted">No hay turnos registrados para este médico.</td></tr>
            `;
        btnGuardar.disabled = true;
        return;
    }

    generarTablaTurnos(turnosMedico);
    btnGuardar.disabled = false;

    btnGuardar.onclick = () => guardarCambios(idMedico);
});

function generarTablaTurnos(turnosMedico) {
    tablaTurnos.innerHTML = "";

    const horarios = [...new Set(turnosMedico.map(turno => turno.hora))].sort();

    horarios.forEach(hora => {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td><strong>${hora}</strong></td>`;

        dias.forEach(dia => {
            const turno = turnosMedico.find(turno => turno.dia === dia && turno.hora === hora);
            const disponible = turno ? turno.disponible : false;

            const celda = document.createElement("td");
            celda.innerHTML = `
                <div class="form-check form-switch d-flex justify-content-center pt-2">
                <input
                    class="form-check-input turno-switch"
                    type="checkbox"
                    data-dia="${dia}"
                    data-hora="${hora}"
                    ${disponible ? "checked" : ""}
                >
                </div>
            `;
            fila.appendChild(celda);
        });

        tablaTurnos.appendChild(fila);
    });

    document.querySelectorAll(".turno-switch").forEach(input => {
        input.addEventListener("change", e => {
            const dia = e.target.dataset.dia;
            const hora = e.target.dataset.hora;
            const idMedico = parseInt(medicoSelect.value);

            const turno = data.turnos.find(turno => turno.idMedico === idMedico && turno.dia === dia && turno.hora === hora);
            if (turno) {
                turno.disponible = e.target.checked;
            }
        });
    });
}

function guardarCambios(idMedico) {
    localStorage.setItem("data", JSON.stringify(data));
    Swal.fire({
        title: "Los cambios se guardaron correctamente.",
        theme: 'material-ui',
        icon: "success",
        confirmButtonColor: "#044166"
    });
}


/* --------------------------- */
/* --- CRUD Obras Sociales --- */
/* --------------------------- */

function generarTablaObrasSociales() {
    const tbody = document.getElementById("tablaObrasSociales").querySelector("tbody");
    tbody.innerHTML = "";
    data.obrasSociales.forEach((os) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${os.nombreObraSocial}</td>
            <td>${os.descuento}</td>
            <td>
                <button class="btn btn-sm btn-editar fw-semibold me-1" onclick="editarObraSocial(${os.idObraSocial})">Editar</button>
                <button class="btn btn-sm btn-eliminar fw-semibold" onclick="eliminarObraSocial(${os.idObraSocial})">Eliminar</button>
            </td>
            `;
        tbody.appendChild(tr);
    });
}

document.getElementById("obrasSocialesForm").addEventListener("submit", e => {
    e.preventDefault();

    const idObraSocial = document.getElementById("idObraSocial").value
        ? parseInt(document.getElementById("idObraSocial").value)
        : Date.now();
    const nombreObraSocial = document.getElementById("nombreObraSocial").value.trim();
    const descripcionObraSocial = document.getElementById("descripcionObraSocial").value.trim();
    const descuento = document.getElementById("descuento").value.trim();

    if (!nombreObraSocial) {
        Swal.fire({
            title: "Advertencia",
            theme: 'material-ui',
            text: "Debe ingresar un nombre para la Obra Social.",
            icon: "warning",
            confirmButtonColor: "#044166"
        });
        return;
    }

    const index = data.obrasSociales.findIndex(os => os.idObraSocial === idObraSocial);

    if (index > -1) {
        data.obrasSociales[index].nombreObraSocial = nombreObraSocial;
        data.obrasSociales[index].descripcionObraSocial = descripcionObraSocial;
        data.obrasSociales[index].descuento = descuento;
    } else {
        data.obrasSociales.push({ idObraSocial, nombreObraSocial, descripcionObraSocial, descuento });
    }

    localStorage.setItem("data", JSON.stringify(data));

    e.target.reset();
    document.getElementById("idObraSocial").value = "";

    Swal.fire({
        title: "Guardado!",
        theme: 'material-ui',
        text: "El registro ha sido modificado con éxito",
        icon: "success",
        confirmButtonColor: "#044166"
    });
    iniciarPagina();
});

function editarObraSocial(idObraSocial) {
    const obraSocial = data.obrasSociales.find(os => os.idObraSocial === idObraSocial);
    if (!obraSocial) return;

    document.getElementById("idObraSocial").value = obraSocial.idObraSocial;
    document.getElementById("nombreObraSocial").value = obraSocial.nombreObraSocial;
    document.getElementById("descripcionObraSocial").value = obraSocial.descripcionObraSocial;
    document.getElementById("descuento").value = obraSocial.descuento;
}

function eliminarObraSocial(idObraSocial) {
    Swal.fire({
        title: "¿Desea eliminar esta Obra Social?",
        theme: 'material-ui',
        text: "La eliminación no puede ser revertida.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#045a29",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "No, cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            data.medicos.forEach(medico => {
                let osIndex = medico.obrasSocialesQueAcepta.indexOf(idObraSocial);
                if (osIndex > -1) {
                    medico.obrasSocialesQueAcepta.splice(osIndex, 1);
                }
            });

            data.reservas.forEach(reserva => {
                if (reserva.idObraSocial == idObraSocial) {
                    const medico = data.medicos.find(medico => medico.idMedico == reserva.idMedico);
                    if (medico) {
                        reserva.valorConsulta = medico.valorConsulta;
                        reserva.idObraSocial = "";
                    }
                }
            });

            data.obrasSociales = data.obrasSociales.filter(os => os.idObraSocial !== idObraSocial);

            localStorage.setItem("data", JSON.stringify(data));

            Swal.fire({
                title: "Eliminada!",
                theme: 'material-ui',
                text: "La obra social ha sido eliminada con éxito.",
                icon: "success",
                confirmButtonColor: "#044166"
            });

            iniciarPagina();
        }
    });

};

/* --------------------------- */
/* --- CRUD Reservas --- */
/* --------------------------- */


function generarTablaReservas() {
    const tbody = document.getElementById("tablaReservas").querySelector("tbody");
    tbody.innerHTML = "";

    data.reservas.forEach((reserva) => {
        const especialidad = data.especialidades.find(
            (e) => e.idEspecialidad == reserva.idEspecialidad
        );

        const nombreEspecialidad = especialidad.nombreEspecialidad

        const medicos = data.medicos.find(
            (e) => e.idMedico == reserva.idMedico
        );

        const nombreMedico = `${medicos.apellidoMedico} ${medicos.nombreMedico}`

        const obraSocial = data.obrasSociales.find(
            (e) => e.idObraSocial == reserva.idObraSocial
        );
        const nombreOS = obraSocial ? obraSocial.nombreObraSocial : "Sin obra social";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${reserva.idReserva}</td>
            <td>${reserva.documento}</td>
            <td>${reserva.nombrePaciente}</td>
            <td>${reserva.telefonoPaciente}</td>
            <td>${reserva.emailPaciente}</td>
            <td>${reserva.idTurno}</td>
            <td>${nombreEspecialidad}</td>
            <td>${nombreMedico}</td>
            <td>${nombreOS}</td>
            <td>$ ${reserva.valorConsulta}</td>
            <td>
                <button class="btn btn-sm btn-editar fw-semibold me-1" onclick="editarReserva(${reserva.idReserva})">Editar</button>
                <button class="btn btn-sm btn-eliminar fw-semibold" onclick="eliminarReserva(${reserva.idReserva})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById("reservasForm").addEventListener("submit", e => {
    e.preventDefault();

    const idReservas = document.getElementById("idReservas").value
        ? parseInt(document.getElementById("idReservas").value)
        : Date.now();
    const idTurno = document.getElementById("idTurnoReservas").value.trim();
    const nombrePaciente = document.getElementById("nombrePaciente").value.trim();
    const documento = document.getElementById("documento").value.trim();
    const telefono = document.getElementById("idTelefono").value.trim();
    const emailPaciente = document.getElementById("idMail").value.trim();
    const idObraSocial = document.getElementById("idObraSocialReservas").value.trim();
    const idEspecialidad = document.getElementById("idEspecialidadReservas").value.trim();
    const idMedico = document.getElementById("idMedicoReservas").value.trim();

    if (!nombrePaciente) {
        Swal.fire({
            title: "Advertencia",
            theme: 'material-ui',
            text: "Debe ingresar un nombre para la reserva.",
            icon: "warning",
            confirmButtonColor: "#044166"
        });
        return;
    }

    const medicoConsultar = data.medicos.find(
        (e) => e.idMedico == idMedico
    );
    const descuentoConsultar = data.obrasSociales.find(
        (e) => e.idObraSocial == idObraSocial
    );
    const valorConsulta = medicoConsultar && descuentoConsultar 
        ? (1 - descuentoConsultar.descuento / 100) * medicoConsultar.valorConsulta
        : 0;

    const index = data.reservas.findIndex(reserva => reserva.idReserva === idReservas);

    if (index > -1) {
        data.reservas[index].documento = documento;
        data.reservas[index].nombrePaciente = nombrePaciente;
        data.reservas[index].telefonoPaciente = telefono;
        data.reservas[index].emailPaciente = emailPaciente;
        data.reservas[index].idObraSocial = idObraSocialReservas;
        data.reservas[index].idEspecialidad = idEspecialidadReservas;
        data.reservas[index].idMedico = idMedicoReservas;
        data.reservas[index].valorConsulta = valorConsulta;

    } else {
       
        data.reservas.push({ idReservas, idTurno, documento, nombrePaciente, telefono, emailPaciente, idObraSocial, idEspecialidad, idMedico, valorConsulta });
    }

    localStorage.setItem("data", JSON.stringify(data));

    e.target.reset();
    document.getElementById("idReservas").value = "";

    Swal.fire({
        title: "Guardado!",
        theme: 'material-ui',
        text: "El registro ha sido modificado con éxito",
        icon: "success",
        confirmButtonColor: "#044166"
    });
    iniciarPagina();
});


function generarSelectsReservas() {
    // --- Especialidades ---
    const selectEspecialidad = document.getElementById("idEspecialidadReservas");
    if (selectEspecialidad) {
        selectEspecialidad.innerHTML = '<option value="">Seleccione...</option>';
        data.especialidades.forEach(especialidad => {
            const option = document.createElement("option");
            option.value = especialidad.idEspecialidad;
            option.textContent = especialidad.nombreEspecialidad;
            selectEspecialidad.appendChild(option);
        });

        selectEspecialidad.addEventListener("change", () => {
            const especialidadId = selectEspecialidad.value;
            actualizarMedicos(especialidadId);
        });
    }

    // --- Médicos ---
    const selectMedico = document.getElementById("idMedicoReservas");
    if (selectMedico) {
        selectMedico.innerHTML = '<option value="">Seleccione...</option>';
    }

    // --- Obra Social ---
    const selectObraSocial = document.getElementById("idObraSocialReservas");
    if (selectObraSocial) {
        selectObraSocial.innerHTML = '<option value="">Seleccione...</option>';
        data.obrasSociales.forEach(os => {
            const option = document.createElement("option");
            option.value = os.idObraSocial;
            option.textContent = os.nombreObraSocial;
            selectObraSocial.appendChild(option);
        });
    }
}

function actualizarMedicos(especialidadId) {
    const selectMedico = document.getElementById("idMedicoReservas");
    selectMedico.innerHTML = '<option value="">Seleccione...</option>';

    data.medicos
        .filter(medico => medico.idEspecialidad == especialidadId)
        .forEach(medico => {
            const option = document.createElement("option");
            option.value = medico.idMedico;
            option.textContent = `${medico.titulo} ${medico.nombreMedico} ${medico.apellidoMedico}`;
            selectMedico.appendChild(option);
        });
}


function editarReserva(idReserva) {
    const reserva = data.reservas.find(reserva => reserva.idReserva === idReserva);
    if (!reserva) return;

    document.getElementById("idReservas").value = reserva.idReserva;
    document.getElementById("idTurnoReservas").value = reserva.idTurno;
    document.getElementById("nombrePaciente").value = reserva.nombrePaciente;
    document.getElementById("documento").value = reserva.documento;
    document.getElementById("idTelefono").value = reserva.telefonoPaciente;
    document.getElementById("idMail").value = reserva.emailPaciente;
    document.getElementById("idObraSocialReservas").value = reserva.idObraSocial;
    document.getElementById("idEspecialidadReservas").value = reserva.idEspecialidad;
    document.getElementById("idMedicoReservas").value = reserva.idMedico;

}

function eliminarReserva(idReserva) {
    Swal.fire({
        title: "¿Desea eliminar esta reserva?",
        theme: 'material-ui',
        text: "La eliminación no puede ser revertida.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#045a29",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "No, cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            const reservaAEliminar = data.reservas.find((reserva) => reserva.idReserva == idReserva);

            if (reservaAEliminar) {
                const turno = data.turnos.find((turno) => turno.idTurno == reservaAEliminar.idTurno);
                if (turno) turno.disponible = true;

                data.reservas = data.reservas.filter(reserva => reserva.idReserva !== idReserva);

                localStorage.setItem("data", JSON.stringify(data));

                Swal.fire({
                    title: "Eliminada!",
                    theme: 'material-ui',
                    text: "La reserva ha sido eliminada con éxito.",
                    icon: "success",
                    confirmButtonColor: "#044166"
                });

                iniciarPagina();
            }
        }
    });
}
/* --------------------------- */
/* ---  Usuarios --- */
/* --------------------------- */


async function generarTablaUsuarios() {
    const tbody = document.getElementById("tablaUsuarios").querySelector("tbody");
    tbody.innerHTML = "";

    const duplicado = new Set();

    data.reservas.forEach((reserva) => {
        if (duplicado.has(reserva.documento)) return;
        duplicado.add(reserva.documento);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${reserva.documento}</td>
            <td>${reserva.nombrePaciente}</td>
            <td>${reserva.telefonoPaciente}</td>
            <td>${reserva.emailPaciente}</td>
            <td>Paciente</td>
        `;
        tbody.appendChild(tr);
    });


    const res = await fetch("https://dummyjson.com/users");
    const usuariosDummy = await res.json();

    usuariosDummy.users.forEach((user) => {

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.phone}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
        `;
        tbody.appendChild(tr);
    });
}