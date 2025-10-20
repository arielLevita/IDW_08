const auth = JSON.parse(localStorage.getItem("auth"));
if (!auth || !auth.isAdmin) {
    window.location.href = "../index.html";
}

function cerrarSesion() {
    localStorage.removeItem("auth");
    window.location.href = "../index.html";
}

// 
// CRUD MÉDICOS
// 

async function iniciarPagina() {
    try {
        await cargarDatos();
        renderEspecialidades();
        renderObrasSociales();
        renderTable();
    } catch (error) {
        console.log("Error en la carga de la página: ", error)
    }
};

iniciarPagina();

// Cargar datos desde localStorage o mock
async function cargarDatos() {
    if (localStorage.getItem("data")) {
        data = JSON.parse(localStorage.getItem("data"));
    } else {
        const resp = await fetch("mock_data.json");
        data = await resp.json();
        localStorage.setItem("data", JSON.stringify(data));
    }
}

// 🩺 Renderizar tabla de médicos
function renderTable() {
    const tbody = document.getElementById("medicosTable");
    tbody.innerHTML = "";

    data.medicos.forEach(m => {
        const esp = data.especialidades.find(e => e.idEspecialidad === m.idEspecialidad);
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td><img src="${m.imagenMedico}" alt="foto" style="width:60px;height:60px;object-fit:cover;border-radius:50%"></td>
      <td>${m.titulo} ${m.nombreMedico} ${m.apellidoMedico}</td>
      <td>${esp ? esp.nombreEspecialidad : "—"}</td>
      <td>$${m.valorConsulta}</td>
      <td>
        <button class="btn btn-sm btn-warning me-1" onclick="editMedico(${m.idMedico})">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="deleteMedico(${m.idMedico})">Eliminar</button>
      </td>
    `;
        tbody.appendChild(tr);
    });
}

// 🎓 Renderizar select de especialidades
function renderEspecialidades() {
    const select = document.getElementById("idEspecialidad");
    select.innerHTML = '<option value="">Seleccione...</option>';
    data.especialidades.forEach(e => {
        const opt = document.createElement("option");
        opt.value = e.idEspecialidad;
        opt.textContent = e.nombreEspecialidad;
        select.appendChild(opt);
    });
}

// 🏥 Renderizar checkboxes de obras sociales
function renderObrasSociales() {
    const cont = document.getElementById("obrasSocialesContainer");
    cont.innerHTML = "";
    data.obrasSociales.forEach(o => {
        const div = document.createElement("div");
        div.classList.add("form-check");
        div.innerHTML = `
      <input class="form-check-input" type="checkbox" id="obra${o.idObraSocial}" value="${o.idObraSocial}">
      <label class="form-check-label" for="obra${o.idObraSocial}">${o.nombreObraSocial}</label>
    `;
        cont.appendChild(div);
    });
}

// 🧾 Convertir imagen a Base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 🧍‍♂️ Crear o editar médico
document.getElementById("medicoForm").addEventListener("submit", async e => {
    e.preventDefault();

    const id = document.getElementById("medicoId").value || Date.now();
    const titulo = document.getElementById("titulo").value;
    const nombreMedico = document.getElementById("nombreMedico").value;
    const apellidoMedico = document.getElementById("apellidoMedico").value;
    const matricula = parseInt(document.getElementById("matricula").value);
    const valorConsulta = parseFloat(document.getElementById("valorConsulta").value);
    const descripcionMedico = document.getElementById("descripcionMedico").value;
    const idEspecialidad = parseInt(document.getElementById("idEspecialidad").value);

    const obrasSeleccionadas = [...document.querySelectorAll("#obrasSocialesContainer input:checked")]
        .map(c => parseInt(c.value));

    const imagenInput = document.getElementById("imagenMedico");
    let imagenMedico = "";

    if (imagenInput.files[0]) {
        imagenMedico = await toBase64(imagenInput.files[0]);
    } else {
        const existente = data.medicos.find(m => m.idMedico == id);
        imagenMedico = existente ? existente.imagenMedico : "";
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

    const index = data.medicos.findIndex(m => m.idMedico == id);
    if (index > -1) {
        data.medicos[index] = nuevoMedico; // update
    } else {
        data.medicos.push(nuevoMedico); // add
    }

    localStorage.setItem("data", JSON.stringify(data));
    renderTable();
    e.target.reset();
    document.getElementById("medicoId").value = "";
});

// ✏️ Editar médico
function editMedico(id) {
    const m = data.medicos.find(m => m.idMedico == id);
    if (!m) return;

    document.getElementById("medicoId").value = m.idMedico;
    document.getElementById("titulo").value = m.titulo;
    document.getElementById("nombreMedico").value = m.nombreMedico;
    document.getElementById("apellidoMedico").value = m.apellidoMedico;
    document.getElementById("matricula").value = m.matricula;
    document.getElementById("valorConsulta").value = m.valorConsulta;
    document.getElementById("descripcionMedico").value = m.descripcionMedico;
    document.getElementById("idEspecialidad").value = m.idEspecialidad;

    // Obras sociales
    document.querySelectorAll("#obrasSocialesContainer input").forEach(c => {
        c.checked = m.obrasSocialesQueAcepta.includes(parseInt(c.value));
    });
}

// 🗑️ Eliminar médico
function deleteMedico(id) {
    if (confirm("¿Desea eliminar este médico?")) {
        data.medicos = data.medicos.filter(m => m.idMedico != id);
        localStorage.setItem("data", JSON.stringify(data));
        renderTable();
    }
}
