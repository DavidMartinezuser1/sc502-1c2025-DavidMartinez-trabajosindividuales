<?php
require('db.php');

function login($username, $password)
{
    global $pdo;

    $sql = 'Select * from users where username = :username';
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC); //retorna los datos como un array asociativo

    if ($user) {
        if (password_verify($password, $user['password'])) {
            session_start();
            $_SESSION['user_id'] = $user["id"];
            return true;
        }
    }
    return false;
}

//guardar el tipo de solicitud.
$method = $_SERVER["REQUEST_METHOD"];

if ($method == 'POST') {
    if (isset($_POST['email']) && isset($_POST['password'])) {
        //logica para manejar el post. los datos van a llegar en formato "formulario" no en JSON
        $username = $_POST['email'];
        $password = $_POST['password'];
        if (login($username, $password)) {
            http_response_code(200);
            echo json_encode(["message" => "Login exitoso"]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => "Usuario o password incorrecto"]);
        }
    }else{
        http_response_code(400);
        echo json_encode(["error" => "email y password son requeridos"]);
    }
} else {
    http_response_code(response_code: 405);//metodo no permitido
    echo json_encode(["error" => "Metodo no permitido"]);
}