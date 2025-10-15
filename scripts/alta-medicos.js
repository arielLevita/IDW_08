const formAltaMedica = document.getElementById('altaMedica');
const inputNombre = document.getElementById('nombre');
const inputApellido = document.getElementById('apellido');
const inputDireccion = document.getElementById('direccion');
const inputCiudad = document.getElementById('ciudad');
const inputCodigoPostal = document.getElementById('codigoPostal');
const inputTelefono = document.getElementById('telefono');
const inputEmail = document.getElementById('email');
const selectEspecialidad = document.querySelector('select.form-select'); 

function altaMedicos(event){
    event.preventDefault();

    let nombre = inputNombre.value.trim()
    let apellido = inputApellido.value.trim()
    let direccion = inputDireccion.value.trim()
    let ciudad = inputCiudad.value.trim()
    let codigoPostal = inputCodigoPostal.value.trim()
    let telefono = inputTelefono.value.trim()
    let email = inputEmail.value.trim()
    let especialidad = selectEspecialidad.value;

    let obraSocialesChecked = formAltaMedica.querySelectorAll('input[type="checkbox"]:checked').length > 0;

    if (!nombre || !apellido || !direccion || !ciudad || !codigoPostal || !telefono || !email || !especialidad || !obraSocialesChecked){
        alert("Debe completar todos los campos.");
        return;
    }
    alert(nombre + " fue guardado exitosamente");

    formAltaMedica.reset();
    formAltaMedica.classList.remove('was-validated');

}



formAltaMedica.addEventListener('submit', altaMedicos);
