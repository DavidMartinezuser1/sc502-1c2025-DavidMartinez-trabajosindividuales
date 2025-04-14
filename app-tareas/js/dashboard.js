document.addEventListener('DOMContentLoaded', function () {
    const API_URL = "backend/tasks.php";
    let isEditMode = false;
    let edittingId;
    let tasks = [];

    // Cargar tareas
    async function loadTasks() {
        try {
            const response = await fetch(API_URL, { method: 'GET', credentials: 'include' });
            if (response.ok) {
                tasks = await response.json();
                renderTasks(tasks);
            } else {
                if (response.status === 401) {
                    window.location.href = "index.html";
                }
                console.error("Error al obtener tareas");
            }
        } catch (err) {
            console.error("Error de conexión:", err);
        }
    }

    // Renderizar tareas
    function renderTasks() {
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = ''; // Limpiar la lista de tareas
        tasks.forEach(task => {
            let commentsList = '';
            if (task.comments && task.comments.length > 0) {
                commentsList = '<ul class="list-group list-group-flush" id="comments-' + task.id + '">';
                task.comments.forEach(comment => {
                    console.log('Comment:', comment);  // Verifica que los comentarios están llegando
                    commentsList += `
                    <li class="list-group-item">
                        ${comment.description || 'Sin descripción'}
                        <button type="button" class="btn btn-sm btn-link remove-comment" data-taskid="${task.id}" data-commentid="${comment.id}">Remove</button>
                    </li>`;
                });
                commentsList += '</ul>';
            }

            const taskCard = document.createElement('div');
            taskCard.className = 'col-md-4 mb-3';
            taskCard.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${task.title}</h5>
                        <p class="card-text">${task.description}</p>
                        <p class="card-text"><small class="text-muted">Due: ${task.due_date}</small></p>
                        ${commentsList}
                        <button type="button" class="btn btn-sm btn-link add-comment" data-id="${task.id}">Add Comment</button>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-secondary btn-sm edit-task" data-id="${task.id}">Edit</button>
                        <button class="btn btn-danger btn-sm delete-task" data-id="${task.id}">Delete</button>
                    </div>
                </div>
            `;
            taskList.appendChild(taskCard);
        });

        // Asignar eventos a botones
        document.querySelectorAll('.edit-task').forEach(button => button.addEventListener('click', handleEditTask));
        document.querySelectorAll('.delete-task').forEach(button => button.addEventListener('click', handleDeleteTask));
        document.querySelectorAll('.add-comment').forEach(button => button.addEventListener('click', openCommentModal));
        document.querySelectorAll('.remove-comment').forEach(button => button.addEventListener('click', handleRemoveComment));
    }

    // Manejar edición de tarea
    function handleEditTask(event) {
        const taskId = parseInt(event.target.dataset.id);
        const task = tasks.find(t => t.id === taskId);
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-desc').value = task.description;
        document.getElementById('due-date').value = task.due_date;
        isEditMode = true;
        edittingId = taskId;
        const modal = new bootstrap.Modal(document.getElementById("taskModal"));
        modal.show();
    }

    // Manejar eliminación de tarea
    async function handleDeleteTask(event) {
        const id = parseInt(event.target.dataset.id);
        try {
            const response = await fetch(`${API_URL}?id=${id}`, { credentials: 'include', method: 'DELETE' });
            if (response.ok) {
                loadTasks();
            } else {
                console.error("Problema al eliminar la tarea");
            }
        } catch (err) {
            console.error("Error al eliminar la tarea:", err);
        }
    }

    // Abrir modal de comentario
    function openCommentModal(e) {
        document.getElementById("comment-task-id").value = e.target.dataset.id;
        const modal = new bootstrap.Modal(document.getElementById("commentModal"));
        modal.show();
    }

    // Crear comentario
    document.getElementById('comment-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const comment = document.getElementById('task-comment').value;
        const selectedTask = parseInt(document.getElementById('comment-task-id').value);
        createComment(selectedTask, comment);
    });

    // Crear comentario (integración con comments.js)
    function createComment(taskId, commentText) {
        if (commentText.trim() === '') {
            alert('El comentario no puede estar vacío');
            return;
        }

        fetch('backend/comments.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_id: taskId, comment: commentText })
        })
        .then(res => {
            if (!res.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return res.json();
        })
        .then(data => {
            if (data && data.id) {
                loadTasks(); // Recargar tareas para reflejar el nuevo comentario
                const modal = bootstrap.Modal.getInstance(document.getElementById('commentModal'));
                modal.hide();
            } else if (data && data.error) {
                alert('Error del servidor: ' + data.error);
            } else {
                alert('No se pudo crear el comentario. Intenta nuevamente.');
            }
        })
        .catch(error => {
            console.error('Error al crear el comentario:', error);
            alert('Ocurrió un error al crear el comentario.');
        });
    }

    // Eliminar comentario
    function handleRemoveComment(e) {
        const taskId = parseInt(e.target.dataset.taskid);
        const commentId = parseInt(e.target.dataset.commentid);
        if (confirm('¿Estás seguro de eliminar este comentario?')) {
            fetch(`backend/comments.php?id=${commentId}`, {
                method: 'DELETE',
                credentials: 'include'  // Asegúrate de que estás enviando las credenciales si es necesario
            })
            .then(res => res.json())
            .then(data => {
                if (data && data.message) {
                    alert(data.message);  // Mostrar mensaje de confirmación
                    loadTasks();  // Recargar tareas para reflejar la eliminación del comentario
                } else {
                    alert('No se pudo eliminar el comentario.');
                }
            })
            .catch(error => {
                console.error('Error al eliminar el comentario:', error);
                alert('Ocurrió un error al eliminar el comentario.');
            });
        }
    }

    // Formularios de tareas
    document.getElementById('task-form').addEventListener('submit', async function (e) {
        e.preventDefault();

        const title = document.getElementById("task-title").value;
        const description = document.getElementById("task-desc").value;
        const dueDate = document.getElementById("due-date").value;

        const requestPayload = { title, description, due_date: dueDate };

        try {
            if (isEditMode) {
                const response = await fetch(`${API_URL}?id=${edittingId}`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestPayload)
                });
                if (!response.ok) {
                    throw new Error("No se pudo actualizar la tarea");
                }
            } else {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestPayload),
                    credentials: 'include'
                });
                if (!response.ok) {
                    throw new Error("No se pudo agregar la tarea");
                }
            }

            const modal = bootstrap.Modal.getInstance(document.getElementById('taskModal'));
            modal.hide();
            loadTasks();
        } catch (error) {
            console.error(error);
            alert('Error al guardar la tarea. Intenta nuevamente.');
        }
    });

    // Cargar tareas al inicio
    loadTasks();
});
