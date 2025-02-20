// definimos el array
let productoElectronico = [];
let Manual = [];
let exclusivo = [];

// funcion de guardar productos
function guardar() {
    let palabra = document.getElementById('palabra').value;
    let precio1 = parseInt(document.getElementById('precio1').value);
    let category = document.getElementById('category').value;

    // Validar que "precio1" sea un número válido
    if (isNaN(precio1)) {
        alert("Por favor, ingrese un número válido en el precio.");
        return;
    }

    // Validar que el campo "palabra" no esté vacío
    if (palabra.trim() === "") {
        alert("Por favor, ingrese el nombre del producto.");
        return;
    }

    // Validar que la categoría sea válida
    if (category !== 'Electronica' && category !== 'Manual' && category !== 'Exclusivo') {
        alert("Por favor, seleccione una categoría válida.");
        return;
    }

    // Crear el objeto para el producto
    let producto = {
        nombre: palabra,
        precio: precio1,
        categoria: category
    };

    // este switch lo usaremos para verificar cual selecciono el usuario aqui se agrega los objetos con un push 
    switch (category) {
        case 'Electronica':
            productoElectronico.push(producto); // se agrega a su array
            break;
        case 'Manual':
            Manual.push(producto);
            break;
        case 'Exclusivo':
            exclusivo.push(producto);
            break;
        default:
            alert("La operación seleccionada no existe o no está manejada");
    }
}

// funcion para buscar juguetes por categoria 
function buscar() {
    let category = document.getElementById('category').value;
    let productos = [];

    switch (category) {
        case 'Electronica':
            productos = productoElectronico;
            break;
        case 'Manual':
            productos = Manual;
            break;
        case 'Exclusivo':
            productos = exclusivo;
            break;
        default:
            alert("La categoría seleccionada no existe o no está manejada");
            return;
    }

    let mensaje = "Productos en la categoría " + category + ":\n";
    for (let index = 0; index < productos.length; index++) {
        mensaje += productos[index].nombre + "\n";
    }
    alert(mensaje);
}

function eliminar() {
    let palabra = document.getElementById('palabra').value;
    let category = document.getElementById('category').value;
    let productos = [];

    // Seleccionar el array correspondiente a la categoría
    switch (category) {
        case 'Electronica':
            productos = productoElectronico;
            break;
        case 'Manual':
            productos = Manual;
            break;
        case 'Exclusivo':
            productos = exclusivo;
            break;
        default:
            alert("La categoría seleccionada no existe o no está manejada");
            return;
    }

    // Buscar el índice del producto a eliminar
    let indice = -1;
    for (let i = 0; i < productos.length; i++) {
        if (productos[i].nombre === palabra) {
            indice = i;
            break; // Salir del bucle cuando se encuentra el producto
        }
    }

    // Si se encontró el producto, eliminarlo
    if (indice !== -1) {
        productos.splice(indice, 1); // Eliminar el producto en el índice encontrado
        alert("Producto '" + palabra + "' eliminado correctamente.");
    } else {
        alert("No se encontró el producto '" + palabra + "' en la categoría '" + category + "'.");
    }
}