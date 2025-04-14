document.addEventListener('DOMContentLoaded', function(){
    const form = document.getElementById('loginForm');
    const loginError = document.getElementById('login-error');

    form.addEventListener('submit', async function(e){
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        //envia los datos al servidor usando POST y el HEADER con el formato de dato que se va a enviar
        const response = await fetch('backend/login.php',{
            method: 'POST',
            headers:{
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({email: email, password: password})
        });
        //obtenemos la respuesta del servidor en formato JSON
        const result = await response.json();

        if(response.ok){
            //login exitoso
            window.location.href ='dashboard.html';
        }else{
            loginError.style.display = 'block';
            loginError.textContent = result.error;
        }

        // if(email === 'test@example.com' && password === 'password123'){
        //     window.location.href ='dashboard.html';
        // }else{
        //     loginError.style.display = 'block';
        // }

    });
})