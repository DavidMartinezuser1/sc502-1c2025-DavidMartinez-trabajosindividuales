<?php
require('db.php');

// Crear Comentarios 
function createComments($task_id, $comment)
{
    global $pdo;
    try {
        $sql = 'INSERT INTO comments (task_id, comment) VALUE (:task_id, :comment)';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'task_id' => $task_id,
            'comment' => $comment
        ]);
        return $pdo->lastInsertId();
    } catch (Exception $e) {
        echo $e->getMessage();
        return 0;
    }
}
// conseguir comentarios por id 
function getCommentbytask($task_id)
{
    try {
        global $pdo;
        $stmt = $pdo->prepare('SELECT * FROM comments WHERE task_id = :task_id');
        $stmt->execute(['task_id' => $task_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $ex) {
        echo "Error al obtener las tareas del usuario" . $ex->getMessage();
        return [];
    }
}
// editar comentarios 
function editComment($id, $comment)
{
    global $pdo;
    try {
        $sql = 'UPDATE comments SET comment = :comment WHERE id = :id';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'comment' => $comment,
            'id' => $id
        ]);
        return $stmt->rowCount() > 0;
    } catch (Exception $e) {
        echo $e->getMessage();
        return false;
    }
}

// eliminar comentarios 
function deleteComment($id)
{
    global $pdo;
    try {
        $sql = 'DELETE FROM comments WHERE id = :id';
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;
    } catch (Exception $e) {
        return false;
    }
}

// Verificar que el comentario pertenezca a un usuario
function userOwnsTask($user_id, $task_id)
{
    global $pdo;
    try {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM tasks WHERE id = :task_id AND user_id = :user_id');
        $stmt->execute([
            'task_id' => $task_id,
            'user_id' => $user_id
        ]);
        return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
        return false;
    }
}

// prueba 
function getAllCommentsByUser($user_id)
{
    global $pdo;
    try {
        $stmt = $pdo->prepare('
            SELECT comments.* 
            FROM comments
            INNER JOIN tasks ON comments.task_id = tasks.id
            WHERE tasks.user_id = :user_id
        ');
        $stmt->execute(['user_id' => $user_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        return [];
    }
}



// verificar si el comentario no esta vacio
function validateCommentInput($comment)
{
    // Verifica si el comentario no está vacío
    if (isset($comment) && !empty($comment)) {
        return true;
    }
    return false;
}



$method = $_SERVER['REQUEST_METHOD'];

header('Content-Type: application/json');

function getJsonInput()
{
    return json_decode(file_get_contents("php://input"), associative: true);
}

session_start();
// Verificamos si la sesión está activa
if (isset($_SESSION['user_id'])) {

    $userId = $_SESSION['user_id'];

    switch ($method) {
        case 'GET':
            $task_id = isset($_GET['task_id']) ? $_GET['task_id'] : null;

            if ($task_id) {
                if (userOwnsTask($userId, $task_id)) {
                    $comments = getCommentbytask($task_id);
                    echo json_encode($comments);
                } else {
                    http_response_code(403);
                    echo json_encode(["error" => "No tenés permiso para ver esta tarea"]);
                }
            } else {
                // Si no se manda task_id, traer todos los comentarios del usuario
                $comments = getAllCommentsByUser($userId);
                echo json_encode($comments);
            }
            break;
        case 'POST':
            $input = getJsonInput();
            // Verificamos si recibimos el comentario y el ID de la tarea
            if (isset($input['task_id']) && validateCommentInput($input['comment'])) {
                $taskId = $input['task_id'];
                $commentText = $input['comment'];
                // Verificamos que la tarea pertenezca al usuario que está logueado
                if (userOwnsTask($userId, $taskId)) {
                    $newCommentId = createComments($taskId, $commentText);
                    if ($newCommentId > 0) {
                        http_response_code(201);
                        echo json_encode([
                            "message" => "Comentario creado exitosamente",
                            "id" => $newCommentId
                        ]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["error" => "No se pudo crear el comentario"]);
                    }
                } else {
                    http_response_code(403);
                    echo json_encode(["error" => "No tenés permiso para comentar en esta tarea"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Datos insuficientes"]);
            }
            break;
        case 'PUT';
            // Obtener el comentario que se va a editar
            $input = getJsonInput();

            // Validar que los datos estén completos
            if (isset($input['comment']) && !empty($input['comment']) && isset($_GET['id'])) {
                // Asegurarse de que el ID de la tarea y el ID del comentario sean válidos
                $commentId = $_GET['id']; // El ID del comentario se pasa en la URL (GET)
                $newComment = $input['comment']; // El nuevo comentario es el que viene del cuerpo de la solicitud

                // Llamamos a la función que edita el comentario
                if (editComment($commentId, $newComment)) {
                    http_response_code(200); // OK, se actualizó correctamente
                    echo json_encode(['message' => "Comentario actualizado exitosamente"]);
                } else {
                    http_response_code(500); // Error al actualizar
                    echo json_encode(['error' => "Error interno al actualizar el comentario"]);
                }
            } else {
                http_response_code(400); // Datos insuficientes
                echo json_encode(['error' => 'Datos insuficientes']);
            }
            break;
        case 'DELETE';
            if (isset($_GET['id'])) {
                $id = $_GET['id'];
                if (deleteComment($id)) {
                    http_response_code(200);
                    echo json_encode(['message' => "Comentario eliminado exitosamente"]);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => "Error interno al eliminar el comentario"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(['error' => "Petición inválida, falta el id del comentario"]);
            }
            break;
        default:
            http_response_code(405);
            echo json_encode(["error" => "Método no permitido"]);
    }

} else {
    http_response_code(401);
    echo json_encode(["error" => "Sesión no activa"]);
}