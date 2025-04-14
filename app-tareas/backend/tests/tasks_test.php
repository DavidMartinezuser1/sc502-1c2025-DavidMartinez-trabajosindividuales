<?php
require '../tasks.php';

echo "Creando una tarea\n";
$idTarea = createTask(1,"Aprender PHP", "Practicar y dominar el lenguaje", '2025-12-01');
echo "Tarea Creada: " .  $idTarea;

echo "Obteniendo las tareas del usuario\n";
$tareas = getTasksByUser(1);
if($tareas){
    foreach($tareas as $tarea){
        echo "ID: " . $tarea["id"] . " - Titulo: " . $tarea["title"] . " - Description: " . $tarea["description"];
    }
}

echo "Actualizando una tarea\n";
if(editTask($idTarea,"tarea editada", "tarea editada desde el test",'2025-05-01')){
    echo "Tarea editada \n";
}

echo "Eliminando la tarea\n";
if(deleteTask($idTarea)){
    echo "Tarea eliminada";
}



