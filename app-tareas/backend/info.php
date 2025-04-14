<?php
echo "Dirección IP del cliente: " . $_SERVER['REMOTE_ADDR'] . "<br>";
echo "Puerto del cliente: " . $_SERVER['REMOTE_PORT'] . "<br>";
echo "Nombre del servidor: " . $_SERVER['SERVER_NAME'] . "<br>";
echo "Método de solicitud: " . $_SERVER['REQUEST_METHOD'] . "<br>";
echo "URI de la solicitud: " . $_SERVER['REQUEST_URI'] . "<br>";
echo "Navegador del cliente: " . $_SERVER['HTTP_USER_AGENT'] . "<br>";
