// Función para obtener comentarios de una tarea
function fetchComments(taskId) {
    fetch('comments.php?task_id=' + taskId)
        .then(response => response.json())
        .then(data => {
            console.log('Comentarios:', data);
            displayComments(data, taskId);
        })
        .catch(error => console.error('Error al obtener comentarios:', error));
}

// Mostrar comentarios en el DOM
function displayComments(comments, taskId) {
    const commentsContainer = document.getElementById('comments-' + taskId);
    commentsContainer.innerHTML = '';

    comments.forEach(comment => {
        const div = document.createElement('div');
        div.className = 'comment-item';
        div.innerHTML = `
            <p>${comment.comment}</p>
            <button onclick="showEditComment(${comment.id}, '${comment.comment}')">Editar</button>
            <button onclick="deleteComment(${comment.id}, ${taskId})">Eliminar</button>
        `;
        commentsContainer.appendChild(div);
    });
}

// Crear un nuevo comentario
function createComment(taskId) {
    const input = document.getElementById('new-comment-' + taskId);
    const commentText = input.value;

    if (commentText.trim() === '') {
        alert('El comentario no puede estar vacío');
        return;
    }

    fetch('comments.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, comment: commentText })
    })
    .then(res => res.json())
    .then(data => {
        if (data.id) {
            input.value = '';
            fetchComments(taskId);
        } else {
            alert('No se pudo crear el comentario');
        }
    });
}

// Mostrar cuadro para editar comentario
function showEditComment(commentId, currentText) {
    const newComment = prompt('Editar comentario:', currentText);
    if (newComment !== null && newComment.trim() !== '') {
        updateComment(commentId, newComment);
    }
}

// Editar comentario
function updateComment(commentId, newText) {
    fetch('comments.php?id=' + commentId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: newText })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || 'Actualizado');
        // Recargar comentarios (deberías tener un `taskId` accesible aquí)
        loadAllComments(); // función personalizada tuya
    });
}

// Eliminar comentario
function deleteComment(commentId, taskId) {
    if (confirm('¿Estás seguro de eliminar este comentario?')) {
        fetch('comments.php?id=' + commentId, {
            method: 'DELETE'
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message || 'Eliminado');
            fetchComments(taskId);
        });
    }
}

// Esta función deberías llamarla desde el HTML al cargar cada tarea
function loadAllComments() {
    // Si tienes múltiples tareas en pantalla:
    const taskElements = document.querySelectorAll('[data-task-id]');
    taskElements.forEach(el => {
        const taskId = el.getAttribute('data-task-id');
        fetchComments(taskId);
    });
}
