const auth = JSON.parse(localStorage.getItem("auth"));
if (!auth || !auth.isAdmin) {
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
        generarMedicoSelect();
    } catch (error) {
        console.log("Error en la carga de la página: ", error)
    }
};

iniciarPagina();

async function cargarDatos() {
    if (localStorage.getItem("data")) {
        data = JSON.parse(localStorage.getItem("data"));
    } else {
        const response = await fetch("mock_data.json");
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
    const select = document.getElementById("idEspecialidad");
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
    const dias = ["lunes", "martes", "miércoles", "jueves", "viernes"];
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
                    día: dia,
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
    const idEspecialidad = parseInt(document.getElementById("idEspecialidad").value);

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
            text: "Debe completar todos los campos.",
            icon: "warning"
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
    document.getElementById("idEspecialidad").value = medico.idEspecialidad;

    document.querySelectorAll("#obrasSocialesContainer input").forEach(checkbox => {
        checkbox.checked = medico.obrasSocialesQueAcepta.includes(parseInt(checkbox.value));
    });
}

function eliminarMedico(id) {
    Swal.fire({
        title: "¿Desea eliminar este médico?",
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

            data.medicos = data.medicos.filter(medico => medico.idMedico != id);
            localStorage.setItem("data", JSON.stringify(data));

            Swal.fire({
                title: "Eliminado!",
                text: "El médico ha sido eliminado con éxito.",
                icon: "success"
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
            text: "Debe ingresar un nombre para la especialidad.",
            icon: "warning"
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

    iniciarPagina();
}

function eliminarEspecialidad(idEspecialidad) {
    Swal.fire({
        title: "¿Desea eliminar esta especialidad?",
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
                    text: `La especialidad fue eliminada. ${medicosAfectados} médico(s) quedaron sin especialidad asignada.`,
                    icon: "warning"
                });
            }
            
            Swal.fire({
                title: "Eliminada!",
                text: "La especialidad ha sido eliminada con éxito.",
                icon: "success"
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

const dias = ["lunes", "martes", "miércoles", "jueves", "viernes"];

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
            const turno = turnosMedico.find(turno => turno.día === dia && turno.hora === hora);
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

            const turno = data.turnos.find(turno => turno.idMedico === idMedico && turno.día === dia && turno.hora === hora);
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
        icon: "success"
    });
}

