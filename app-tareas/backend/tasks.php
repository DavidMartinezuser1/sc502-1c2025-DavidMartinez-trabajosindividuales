<?php
require('db.php');

function createTask($userId, $title, $description, $dueDate)
{
    global $pdo;
    try {
        $sql = "INSERT INTO tasks (user_id, title, description, due_date) VALUES (:user_id, :title, :description, :due_date)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'user_id' => $userId,
            'title' => $title,
            'description' => $description,
            'due_date' => $dueDate
        ]);
        return $pdo->lastInsertId();
    } catch (Exception $e) {
        echo $e->getMessage();
        return 0;
    }
}

function getTasksByUser($userId)
{
    try {
        global $pdo;
        // Obtener todas las tareas del usuario
        $stmt = $pdo->prepare("SELECT * FROM tasks WHERE user_id = :user_id");
        $stmt->execute(['user_id' => $userId]);
        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Para cada tarea, obtener los comentarios relacionados
        foreach ($tasks as &$task) {
            $taskId = $task['id'];
            $commentStmt = $pdo->prepare("SELECT * FROM comments WHERE task_id = :task_id");
            $commentStmt->execute(['task_id' => $taskId]);
            $comments = $commentStmt->fetchAll(PDO::FETCH_ASSOC);
            $task['comments'] = $comments;
        }

        return $tasks;
    } catch (Exception $ex) {
        echo "Error al obtener las tareas del usuario: " . $ex->getMessage();
        return [];
    }
}

function editTask($id, $title, $description, $dueDate)
{
    global $pdo;
    try {
        $sql = "UPDATE tasks SET title = :title, description = :description, due_date = :due_date WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'title' => $title,
            'description' => $description,
            'due_date' => $dueDate,
            'id' => $id
        ]);
        return $stmt->rowCount() > 0;
    } catch (Exception $e) {
        echo $e->getMessage();
        return false;
    }
}

function deleteTask($id)
{
    global $pdo;
    try {
        $sql = "DELETE FROM tasks WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(["id" => $id]);
        return $stmt->rowCount() > 0;
    } catch (Exception $e) {
        echo $e->getMessage();
        return false;
    }
}

function validateInput($input)
{
    return isset($input['title'], $input['description'], $input['due_date']);
}

$method = $_SERVER['REQUEST_METHOD'];
header('Content-Type: application/json');

function getJsonInput()
{
    return json_decode(file_get_contents("php://input"), associative: true);
}

session_start();

if (isset($_SESSION["user_id"])) {
    try {
        $userId = $_SESSION["user_id"];

        switch ($method) {
            case 'GET':
                $tareas = getTasksByUser($userId);
                echo json_encode($tareas);
                break;

            case 'POST':
                $input = getJsonInput();
                if (validateInput($input)) {
                    $idTask = createTask($userId, $input['title'], $input['description'], $input['due_date']);
                    if ($idTask > 0) {
                        http_response_code(201);
                        echo json_encode(["message" => "Tarea creada exitosamente. Id:" . $idTask]);
                    } else {
                        http_response_code(500);
                        echo json_encode(['error' => "Error general creando la tarea"]);
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(["error" => "Datos insuficientes"]);
                }
                break;

            case 'PUT':
                $input = getJsonInput();
                if (validateInput($input)) {
                    if (editTask($_GET['id'], $input['title'], $input['description'], $input['due_date'])) {
                        http_response_code(201);
                        echo json_encode(['message' => "Tarea actualizada exitosamente"]);
                    } else {
                        http_response_code(500);
                        echo json_encode(['error' => "Error interno al actualizar la tarea"]);
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Datos insuficientes']);
                }
                break;

            case 'DELETE':
                if ($_GET['id']) {
                    if (deleteTask($_GET['id'])) {
                        http_response_code(200);
                        echo json_encode(['message' => "Tarea eliminada exitosamente"]);
                    } else {
                        http_response_code(500);
                        echo json_encode(['error' => "Error interno al eliminar una tarea"]);
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => "Petición inválida"]);
                }
                break;

            default:
                http_response_code(405);
                echo json_encode(["error" => "Método no permitido"]);
        }
    } catch (Exception $exp) {
        http_response_code(500);
        echo json_encode(['error' => "Error al procesar la solicitud"]);
    }
} else {
    http_response_code(401);
    echo json_encode(["error" => "Sesión no activa"]);
}