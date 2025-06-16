<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">My Todo List</h1>

      <div v-if="isAuthenticated" class="user-info">
        <span>{{ userEmail }}</span>
        <button @click="logout" class="btn-logout">Logout</button>
      </div>
    </header>

    <main class="app-content">
      <!-- Descriptive text for the application -->
      <div v-if="!isAuthenticated" class="app-description">
        <p>Use this tool to personalize and categorize your sprawling to-do list across work, hobbies and personal life.</p>
      </div>

      <!-- Authentication forms side by side -->
      <div v-if="!isAuthenticated" class="auth-container">
        <RegisterForm />
        <LoginForm @login-success="handleLoginSuccess" />
      </div>

      <!-- Show todo app if authenticated -->
      <div v-else>
        <TodoForm @add-todo="addTodo" />

        <TodoList :todos="todos" @toggle-complete="toggleTodoComplete" @edit-todo="startEditing"
          @remove-todo="removeTodo" />
      </div>
    </main>

    <!-- Edit Modal -->
    <div v-if="isEditing" class="modal-overlay">
      <div class="edit-modal">
        <h2>Edit Task</h2>

        <div class="form-group">
          <label for="editText">Task Description</label>
          <input id="editText" v-model="editForm.text" type="text" required />
        </div>

        <div class="form-group">
          <label for="editCategory">Category</label>
          <select id="editCategory" v-model="editForm.category">
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="errands">Errands</option>
          </select>
        </div>

        <div class="form-group">
          <label for="editDueDate">Due Date</label>
          <input id="editDueDate" v-model="editForm.dueDate" type="date" />
        </div>

        <div class="modal-actions">
          <button @click="cancelEdit" class="btn-cancel">Cancel</button>
          <button @click="saveEdit" class="btn-save">Save Changes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import TodoForm from './components/TodoForm.vue';
import TodoList from './components/TodoList.vue';
import RegisterForm from './components/RegisterForm.vue';
import LoginForm from './components/LoginForm.vue';
import { useTodos } from './composables/useTodos';
import { offlineQueue } from './services/offlineSync';

console.log("App.vue - okay, I'm really giving up");
const isAuthenticated = ref(false);
const userEmail = ref('');

onMounted(() => {
  // Initialize offline queue
  offlineQueue.init();

  // Check if the user is already authenticated
  if (document.cookie.includes('authToken')) {
    isAuthenticated.value = true;
    // Extract user email from cookie
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)authToken\s*=\s*([^;]*).*$)|^.*$/, "$1");
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      userEmail.value = payload.userId;
    } catch (error) {
      console.error("Error decoding token:", error);
      userEmail.value = localStorage.getItem('userEmail') || '';
    }
  }
});

// Logout function
const logout = () => {
  // Clear auth token and user email
  document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  localStorage.removeItem('userEmail');
  isAuthenticated.value = false;
  userEmail.value = '';
  // Force reload to clear state
  window.location.reload();
};

// Handle successful login
const handleLoginSuccess = () => {
  isAuthenticated.value = true;
  // Extract user email from cookie
  const token = document.cookie.replace(/(?:(?:^|.*;\s*)authToken\s*=\s*([^;]*).*$)|^.*$/, "$1");
  try {
    const payloadBase64 = token.split('.')[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);
    userEmail.value = payload.userId;
  } catch (error) {
    console.error("Error decoding token:", error);
    userEmail.value = localStorage.getItem('userEmail') || '';
  };
  loadTodos();
};

// Use the todos composable
const {
  todos,
  addTodo,
  removeTodo,
  toggleTodoComplete,
  updateTodo,
  loadTodos
} = useTodos();

// Editing state
const isEditing = ref(false);

const editingTodoId = ref(null);
const editForm = ref({
  text: '',
  category: '',
  dueDate: ''
});

// Start editing a todo
const startEditing = (id) => {
  const todo = todos.value.find(todo => todo.id === id);
  if (todo) {
    editingTodoId.value = id;
    editForm.value = {
      text: todo.text,
      category: todo.category,
      dueDate: todo.dueDate || ''
    };
    isEditing.value = true;
  }
};

// Save edited todo
const saveEdit = () => {
  if (editingTodoId.value) {
    updateTodo(editingTodoId.value, {
      text: editForm.value.text,
      category: editForm.value.category,
      dueDate: editForm.value.dueDate
    });
    cancelEdit();
  }
};

// Cancel editing
const cancelEdit = () => {
  isEditing.value = false;
  editingTodoId.value = null;
  editForm.value = {
    text: '',
    category: '', 
    dueDate: ''
    
  }; 
};
</script>

<style>
/* Global styles */
:root {
  --primary-color: #4a90e2;
  --secondary-color: #f5f5f5;
  --text-color: #333;
  --border-color: #ddd;
  --success-color: #4caf50;
  --danger-color: #e53935;
  --warning-color: #ffc107;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: #f9f9f9;
}

/* App container */
.app-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Header */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

/* App-title */
.app-title {
  color: var(--primary-color);
  font-size: 2.5rem;
  font-weight: 300;
}

/* User-info */
.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
}

/* Btn-logout */
.btn-logout {
  background-color: #f0f0f0;
  color: #555;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

/* Btn-logout:hover */
.btn-logout:hover {
  background-color: #e0e0e0;
}

/* App-content */
.app-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* App description */
.app-description {
  text-align: center;
  margin-bottom: 2rem;
}

.app-description p {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

/* Auth container for side-by-side layout */
.auth-container {
  display: flex;
  gap: 2rem;
  justify-content: center;
  align-items: flex-start;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Edit-modal */
.edit-modal {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Edit-modal h2 */
.edit-modal h2 {
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}

/* Form-group */
.form-group {
  margin-bottom: 1.5rem;
}

/* Form-group label */
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

/* Form-group input,
.form-group select */
.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

/* Modal-actions */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Btn-cancel,
.btn-save */
.btn-cancel,
.btn-save {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

/* Btn-cancel */
.btn-cancel {
  background-color: #f0f0f0;
  color: #555;
}

/* Btn-cancel:hover */
.btn-cancel:hover {
  background-color: #e0e0e0;
}

/* Btn-save */
.btn-save {
  background-color: var(--primary-color);
  color: white;
}

/* Btn-save:hover */
.btn-save:hover {
  background-color: #3a80d2;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .app-title {
    font-size: 2rem;
  }

  /* Stack auth forms vertically on mobile */
  .auth-container {
    flex-direction: column;
    gap: 1rem;
  }

  /* Edit-modal */
  .edit-modal {
    padding: 1.5rem;
  }
}

@media (max-width: 600px) {
  .app-container {
    padding: 1rem 0.5rem;
  }

  .app-description p {
    font-size: 1rem;
  }
}
</style>
