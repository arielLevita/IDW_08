const cardsProfesionales = document.getElementById("profesionales");

async function getDataFromLS() {
    try {
        let data = localStorage.getItem("data");
        data = JSON.parse(data)

        generarCardsMedicos(data);
        return
    } catch (error) {
        console.error(error)
    }
}

getDataFromLS();

function generarCardsMedicos(data) {
    let especialidades = data.especialidades;
    let medicos = data.medicos;

    cardsProfesionales.innerHTML = "";

    if (especialidades.length == 0) {
        cardsProfesionales = `No hay especialidades`;
        return
    }

    let docFrag = document.createDocumentFragment();
    especialidades.forEach((esp, index) => {
        let div = document.createElement("div");
        div.classList.add('accordion-item');
        div.setAttribute('id', esp)

        let medicosEspecialidad = medicos.filter(
            medico => medico.idEspecialidad === esp.idEspecialidad
        );

        let tarjetasHTML = medicosEspecialidad.map(medico => `
            <div class="col">
                <div class="card h-100">
                    <img src="${medico.imagenMedico}" 
                        class="card-img-top" 
                        alt="${medico.titulo} ${medico.nombreMedico} ${medico.apellidoMedico}">
                    <div class="card-body">
                        <h5 class="card-title">${medico.titulo} ${medico.nombreMedico} ${medico.apellidoMedico}</h5>
                        <p class="card-text">${medico.descripcionMedico || ''}</p>
                    </div>
                </div>
            </div>
        `).join('');

        div.innerHTML =
            `<h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target=#collapse-${esp.idEspecialidad} aria-expanded="${index === 0 ? 'true' : 'false'}"
                    aria-controls="collapse-${esp.idEspecialidad}">
                    <h3>${esp.nombreEspecialidad}</h3>
                </button>
            </h2>
            <div id="collapse-${esp.idEspecialidad}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}">
                <div class="accordion-body">
                    <div class="row row-cols-1 row-cols-md-3 g-4">
                        ${tarjetasHTML}
                    </div>
                </div>
            </div>
            `;

        docFrag.appendChild(div);
    });
    cardsProfesionales.appendChild(docFrag);
}