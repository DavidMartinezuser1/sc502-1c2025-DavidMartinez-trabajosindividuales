function calculate() {
    let num1 = parseInt(document.getElementById('num1').value);
    let operation = document.getElementById('operation').value;
    let result = 0.0; 

    if (isNaN(num1)) { 
        alert("Por favor, ingrese un número válido.");
        return;
    }

    switch (operation) {
        case 'Empleador':
            result = num1 * 0.2667;
            result = num1 - result;
            break;
        case 'Trabajador':
            result = num1 * 0.1067;
            result = num1 - result;
            break;
        default:
            alert("La operación seleccionada no existe o no está manejada");
            result = 0;
    }

    document.getElementById('result').innerText = result;
}