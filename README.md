# Todo App

A Vue.js-based todo application with database integration and AI-powered features.

## Implementation Progress

| Feature | Status | Description |
|---------|--------|-------------|
| ✅ Basic Todo App | Complete | Vue.js app with localStorage persistence |
| ✅ MongoDB Integration | Complete | Backend server with MongoDB database |
| ✅ Authentication | Complete | Email-based authentication with magic links |
| ✅ Multi-device Sync | Complete | Todos stored in database and accessible from any device |
| ✅ Natural Language Input | Complete | Parse natural language to extract task details |
| ✅ Offline Support | Complete | Queue operations when offline and sync when online |
| ⬜ Collaboration | Parking Lot | Share todo lists with other users |
| ⬜ Smart Notifications | Parking Lot | AI-powered reminders for tasks |
| ⬜ Task Dependencies | Parking Lot | Create relationships between tasks |

## How to Run the App

1. **Start the backend server**:
   ```
   cd backend
   npm run dev
   ```
   Server will run on http://localhost:3000

2. **Start the frontend**:

   ```
   npm run dev
   ```
   Frontend will run on http://localhost:5173

3. **Login process**:
   - Enter your email and click "Send Magic Link"
   - Check the backend terminal for the magic link
   - Copy and paste the link in your browser

## Project Overview

This todo app allows users to manage their tasks effectively with features like:

- Create, read, update, and delete tasks
- Mark tasks as complete
- Filter tasks (All, Active, Completed)
- Categorize tasks (work, personal, errands)
- Set due dates for tasks
- Export tasks to calendar format (.ics)
- Database persistence for multi-device sync
- Simple email-based authentication
- Natural language input for tasks

## Implementation Guide

This guide outlines the steps to enhance the todo app with database integration and AI features.

### 1. Database Integration with Simple Authentication

#### Backend Setup (Express + MongoDB)

```javascript
// server.js - Main server file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { sendMagicLink } = require('./utils/email');
const todoRoutes = require('./routes/todos');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app');

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;
  
  // Generate a login token
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  // Send magic link email
  await sendMagicLink(email, token);
  
  res.json({ message: 'Magic link sent to your email' });
});

app.get('/api/auth/verify', (req, res) => {
  const { token } = req.query;
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Create a long-lived token for the user
    const authToken = jwt.sign({ email: decoded.email }, process.env.JWT_SECRET, { 
      expiresIn: '30d' 
    });
    
    res.json({ token: authToken, email: decoded.email });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Todo routes (protected by authentication)
app.use('/api/todos', authenticate, todoRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### Todo Model and Routes

```javascript
// models/Todo.js
const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'errands'],
    default: 'personal'
  },
  dueDate: Date,
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Todo', TodoSchema);

// routes/todos.js
const express = require('express');
const Todo = require('../models/Todo');
const router = express.Router();

// Get all todos for the authenticated user
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find({ userEmail: req.user.email });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new todo
router.post('/', async (req, res) => {
  try {
    const todo = new Todo({
      ...req.body,
      userEmail: req.user.email
    });
    
    const savedTodo = await todo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a todo
router.put('/:id', async (req, res) => {
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userEmail: req.user.email },
      req.body,
      { new: true }
    );
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json(todo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a todo
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ 
      _id: req.params.id, 
      userEmail: req.user.email 
    });
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json({ message: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

#### Frontend API Service

```javascript
// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(email) {
    const response = await api.post('/auth/login', { email });
    return response.data;
  },
  
  async verifyToken(token) {
    const response = await api.get(`/auth/verify?token=${token}`);
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('userEmail', response.data.email);
    return response.data;
  },
  
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
  },
  
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }
};

export const todoService = {
  async getAllTodos() {
    const response = await api.get('/todos');
    return response.data;
  },
  
  async createTodo(todo) {
    const response = await api.post('/todos', todo);
    return response.data;
  },
  
  async updateTodo(id, updates) {
    const response = await api.put(`/todos/${id}`, updates);
    return response.data;
  },
  
  async deleteTodo(id) {
    const response = await api.delete(`/todos/${id}`);
    return response.data;
  }
};
```

#### Data Migration Utility

```javascript
// src/utils/migration.js
import { todoService } from '../services/api';
import { authService } from '../services/api';

export async function migrateLocalStorageToDatabase() {
  // Only run if authenticated and migration not already done
  if (!authService.isAuthenticated() || localStorage.getItem('migrationComplete')) {
    return;
  }
  
  try {
    // Get todos from localStorage
    const localTodos = JSON.parse(localStorage.getItem('todos')) || [];
    
    if (localTodos.length === 0) {
      // No todos to migrate
      localStorage.setItem('migrationComplete', 'true');
      return;
    }
    
    // Upload each todo to the database
    const promises = localTodos.map(todo => {
      // Remove the id as the database will generate a new one
      const { id, ...todoData } = todo;
      return todoService.createTodo(todoData);
    });
    
    await Promise.all(promises);
    
    // Mark migration as complete
    localStorage.setItem('migrationComplete', 'true');
    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}
```

#### Updated Todo Composable

```javascript
// src/composables/useTodos.js
import { ref, watchEffect, onMounted } from 'vue';
import { todoService } from '../services/api';
import { authService } from '../services/api';
import { migrateLocalStorageToDatabase } from '../utils/migration';

export function useTodos() {
  // State
  const todos = ref([]);
  const loading = ref(false);
  const error = ref(null);
  
  // Load todos from API or localStorage
  const loadTodos = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      if (authService.isAuthenticated()) {
        // Load from API if authenticated
        const data = await todoService.getAllTodos();
        todos.value = data;
      } else {
        // Fall back to localStorage
        const savedTodos = localStorage.getItem('todos');
        if (savedTodos) {
          todos.value = JSON.parse(savedTodos);
        }
      }
    } catch (err) {
      error.value = 'Failed to load todos';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };
  
  // Save todos to localStorage as backup
  watchEffect(() => {
    if (!authService.isAuthenticated()) {
      localStorage.setItem('todos', JSON.stringify(todos.value));
    }
  });
  
  // Add a new todo
  const addTodo = async (todoText, category, dueDate) => {
    const newTodo = {
      text: todoText,
      completed: false,
      category,
      dueDate,
      createdAt: new Date().toISOString()
    };
    
    try {
      if (authService.isAuthenticated()) {
        // Add to API
        const savedTodo = await todoService.createTodo(newTodo);
        todos.value.push(savedTodo);
      } else {
        // Add to local state with generated ID
        newTodo.id = Date.now();
        todos.value.push(newTodo);
      }
    } catch (err) {
      error.value = 'Failed to add todo';
      console.error(err);
    }
  };
  
  // Remove a todo by id
  const removeTodo = async (id) => {
    try {
      if (authService.isAuthenticated()) {
        // Remove from API
        await todoService.deleteTodo(id);
      }
      
      // Remove from local state
      todos.value = todos.value.filter(todo => todo.id !== id);
    } catch (err) {
      error.value = 'Failed to remove todo';
      console.error(err);
    }
  };
  
  // Toggle todo completion status
  const toggleTodoComplete = async (id) => {
    const todo = todos.value.find(todo => todo.id === id);
    if (!todo) return;
    
    try {
      // Update local state
      todo.completed = !todo.completed;
      
      if (authService.isAuthenticated()) {
        // Update in API
        await todoService.updateTodo(id, { completed: todo.completed });
      }
    } catch (err) {
      // Revert on error
      todo.completed = !todo.completed;
      error.value = 'Failed to update todo';
      console.error(err);
    }
  };
  
  // Update a todo
  const updateTodo = async (id, updates) => {
    const index = todos.value.findIndex(todo => todo.id === id);
    if (index === -1) return;
    
    try {
      // Update local state
      todos.value[index] = { ...todos.value[index], ...updates };
      
      if (authService.isAuthenticated()) {
        // Update in API
        await todoService.updateTodo(id, updates);
      }
    } catch (err) {
      error.value = 'Failed to update todo';
      console.error(err);
    }
  };
  
  // Filter todos by status
  const getFilteredTodos = (filter) => {
    switch (filter) {
      case 'active':
        return todos.value.filter(todo => !todo.completed);
      case 'completed':
        return todos.value.filter(todo => todo.completed);
      default:
        return todos.value;
    }
  };
  
  // Initialize
  onMounted(async () => {
    await loadTodos();
    
    // Migrate localStorage data to database if needed
    if (authService.isAuthenticated()) {
      await migrateLocalStorageToDatabase();
    }
  });
  
  return {
    todos,
    loading,
    error,
    addTodo,
    removeTodo,
    toggleTodoComplete,
    updateTodo,
    getFilteredTodos,
    loadTodos
  };
}
```

### 2. Simple Login Component

```vue
<!-- src/components/LoginForm.vue -->
<template>
  <div class="login-form">
    <h2>Sign In to Sync Your Todos</h2>
    
    <div v-if="step === 'email'">
      <p>Enter your email to receive a magic link:</p>
      <form @submit.prevent="sendMagicLink">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            placeholder="your@email.com" 
            required
          />
        </div>
        
        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? 'Sending...' : 'Send Magic Link' }}
        </button>
      </form>
    </div>
    
    <div v-else-if="step === 'confirmation'">
      <p>Magic link sent! Check your email and click the link to sign in.</p>
      <button @click="step = 'email'" class="btn-secondary">
        Try Again
      </button>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { authService } from '../services/api';

const emit = defineEmits(['login-success']);

const email = ref('');
const step = ref('email');
const loading = ref(false);
const error = ref('');

const sendMagicLink = async () => {
  if (!email.value) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    await authService.login(email.value);
    step.value = 'confirmation';
  } catch (err) {
    error.value = 'Failed to send magic link. Please try again.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-form {
  background-color: #f5f5f5;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  margin: 0 auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
}

p {
  margin-bottom: 1.5rem;
  color: #555;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.btn-login {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
}

.btn-login:disabled {
  background-color: #a0c4e8;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #555;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
}

.error-message {
  color: #e53935;
  margin-top: 1rem;
  font-size: 0.9rem;
}
</style>
```

### 3. Updated App.vue with Auth State

```vue
<!-- src/App.vue -->
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
      <!-- Show login form if not authenticated -->
      <LoginForm 
        v-if="!isAuthenticated" 
        @login-success="handleLoginSuccess" 
      />
      
      <!-- Show todo app if authenticated or offline mode -->
      <div v-else>
        <TodoForm @add-todo="addTodo" />
        
        <TodoList 
          :todos="todos"
          @toggle-complete="toggleTodoComplete"
          @edit-todo="startEditing"
          @remove-todo="removeTodo"
        />
      </div>
    </main>
    
    <!-- Edit Modal (unchanged) -->
    <div v-if="isEditing" class="modal-overlay">
      <!-- ... existing modal code ... -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import TodoForm from './components/TodoForm.vue';
import TodoList from './components/TodoList.vue';
import LoginForm from './components/LoginForm.vue';
import { useTodos } from './composables/useTodos';
import { authService } from './services/api';

// Check for authentication token in URL (for magic link)
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    // Verify the token
    authService.verifyToken(token)
      .then(() => {
        // Remove token from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        // Reload todos
        loadTodos();
      })
      .catch(err => {
        console.error('Invalid token:', err);
      });
  }
});

// Auth state
const isAuthenticated = computed(() => authService.isAuthenticated());
const userEmail = computed(() => localStorage.getItem('userEmail'));

// Logout function
const logout = () => {
  authService.logout();
  // Force reload to clear state
  window.location.reload();
};

// Handle successful login
const handleLoginSuccess = () => {
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

// Editing state (unchanged)
const isEditing = ref(false);
const editingTodoId = ref(null);
const editForm = ref({
  text: '',
  category: '',
  dueDate: ''
});

// Start editing a todo (unchanged)
const startEditing = (id) => {
  // ... existing code ...
};

// Save edited todo (unchanged)
const saveEdit = () => {
  // ... existing code ...
};

// Cancel editing (unchanged)
const cancelEdit = () => {
  // ... existing code ...
};
</script>

<style>
/* Add these styles to your existing CSS */

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.btn-logout {
  background-color: #f0f0f0;
  color: #555;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn-logout:hover {
  background-color: #e0e0e0;
}
</style>
```

### 4. Offline Support (Basic Version)

```javascript
// src/services/offlineSync.js
import { todoService } from './api';

export const offlineQueue = {
  queue: [],
  
  // Add an operation to the queue
  addOperation(operation, data) {
    this.queue.push({ operation, data, timestamp: Date.now() });
    this.saveQueue();
  },
  
  // Save queue to localStorage
  saveQueue() {
    localStorage.setItem('offlineQueue', JSON.stringify(this.queue));
  },
  
  // Load queue from localStorage
  loadQueue() {
    const saved = localStorage.getItem('offlineQueue');
    if (saved) {
      this.queue = JSON.parse(saved);
    }
  },
  
  // Process all queued operations
  async processQueue() {
    if (!navigator.onLine || this.queue.length === 0) return;
    
    const currentQueue = [...this.queue];
    this.queue = [];
    this.saveQueue();
    
    for (const item of currentQueue) {
      try {
        switch (item.operation) {
          case 'create':
            await todoService.createTodo(item.data);
            break;
          case 'update':
            await todoService.updateTodo(item.data.id, item.data.updates);
            break;
          case 'delete':
            await todoService.deleteTodo(item.data.id);
            break;
        }
      } catch (error) {
        console.error('Failed to process offline operation:', error);
        // Put back in queue
        this.queue.push(item);
        this.saveQueue();
      }
    }
  },
  
  // Initialize
  init() {
    this.loadQueue();
    
    // Process queue when coming online
    window.addEventListener('online', () => {
      this.processQueue();
    });
    
    // Check periodically
    setInterval(() => {
      if (navigator.onLine) {
        this.processQueue();
      }
    }, 60000); // Check every minute
  }
};
```

### 5. Natural Language Input (Basic Version)

```vue
<!-- src/components/SmartInput.vue -->
<template>
  <div class="smart-input">
    <div class="input-container">
      <input 
        v-model="inputText" 
        type="text"
        placeholder="Add task naturally (e.g., 'Buy milk tomorrow')"
        @keyup.enter="parseInput"
      />
      <button @click="parseInput" class="btn-parse">
        ✨ Parse
      </button>
    </div>
    
    <div v-if="loading" class="parsing-indicator">
      Analyzing your task...
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps(['onParse']);
const emit = defineEmits(['parsed']);

const inputText = ref('');
const loading = ref(false);
const error = ref('');

// Simple client-side parsing
const parseClientSide = (text) => {
  const result = {
    text: text,
    dueDate: null,
    category: 'personal'
  };
  
  // Extract date keywords
  if (text.includes('tomorrow')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    result.dueDate = tomorrow.toISOString().split('T')[0];
    result.text = result.text.replace('tomorrow', '').trim();
  } else if (text.includes('today')) {
    const today = new Date();
    result.dueDate = today.toISOString().split('T')[0];
    result.text = result.text.replace('today', '').trim();
  }
  
  // Extract category keywords
  if (text.includes('work')) {
    result.category = 'work';
    result.text = result.text.replace('work', '').trim();
  } else if (text.includes('errands')) {
    result.category = 'errands';
    result.text = result.text.replace('errands', '').trim();
  }
  
  return result;
};

const parseInput = () => {
  if (!inputText.value) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    // For now, just use simple client-side parsing
    // This can be replaced with API call to NLP service later
    const parsed = parseClientSide(inputText.value);
    
    // Emit the parsed result
    emit('parsed', parsed);
    
    // Clear input
    inputText.value = '';
  } catch (err) {
    error.value = 'Failed to parse input';
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.smart-input {
  margin-bottom: 1rem;
}

.input-container {
  display: flex;
  gap: 0.5rem;
}

input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.btn-parse {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.parsing-indicator {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}

.error-message {
  margin-top: 0.5rem;
  color: #e53935;
  font-size: 0.9rem;
}
</style>
```

### 6. Updated TodoForm with Smart Input

```vue
<!-- src/components/TodoForm.vue -->
<template>
  <div class="todo-form">
    <h2>Add New Task</h2>
    
    <!-- Smart input option -->
    <div class="input-toggle">
      <button 
        @click="inputMode = 'smart'" 
        :class="{ active: inputMode === 'smart' }"
        class="toggle-btn"
      >
        Smart Input
      </button>
      <button 
        @click="inputMode = 'standard'" 
        :class="{ active: inputMode === 'standard' }"
        class="toggle-btn"
      >
        Standard Form
      </button>
    </div>
    
    <!-- Smart input -->
    <SmartInput 
      v-if="inputMode === 'smart'"
      @parsed="handleParsed"
    />
    
    <!-- Standard form -->
    <form v-else @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="todoText">Task Description</label>
        <input 
          id="todoText"
          v-model="todoText" 
          type="text" 
          placeholder="What needs to be done?" 
          required
        />
      </div>
      
      <div class="form-group">
        <label for="category">Category</label>
        <select id="category" v-model="category">
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="errands">Errands</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="dueDate">Due Date</label>
        <input 
          id="dueDate"
          v-model="dueDate" 
          type="date" 
        />
      </div>
      
      <button type="submit" class="btn-add">Add Task</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import SmartInput from './SmartInput.vue';

// Define emits
const emit = defineEmits(['add-todo']);

// Form state
const todoText = ref('');
const category = ref('personal');
const dueDate = ref('');
const inputMode = ref('standard'); // 'standard' or 'smart'

// Handle form submission
const handleSubmit = () => {
  // Emit event with form data
  emit('add-todo', todoText.value, category.value, dueDate.value);
  
  // Reset form
  todoText.value = '';
  dueDate.value = '';
  // Keep the category as is for convenience
};

// Handle parsed input from SmartInput
const handleParsed = (parsed) => {
  // Update form fields with parsed data
  todoText.value = parsed.text;
  category.value = parsed.category || 'personal';
  dueDate.value = parsed.dueDate || '';
  
  // Submit the form
  handleSubmit();
};
</script>

<style scoped>
/* Add these styles to your existing CSS */

.input-toggle {
  display: flex;
  margin-bottom: 1rem;
  border-radius: 4px;
  overflow: hidden;
}

.toggle-btn {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.2s;
}

.toggle-btn.active {
  background-color: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.toggle-btn:first-child {
  border-right: none;
  border-radius: 4px 0 0 4px;
}

.toggle-btn:last-child {
  border-radius: 0 4px 4px 0;
}
</style>
```

## Deployment Instructions

### Backend Deployment (Vercel Serverless)

1. Create a `vercel.json` file in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

2. Deploy with Vercel CLI:

```bash
npm install -g vercel
vercel login
vercel
```

### MongoDB Atlas Setup

1. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (the free tier is sufficient)
3. Set up database access with a username and password
4. Configure network access to allow connections from anywhere
5. Get your connection string from the "Connect" button
6. Add the connection string to your environment variables

### Frontend Deployment (Netlify)

1. Build your Vue app for production:

```bash
npm run build
```

2. Deploy the `dist` folder to Netlify:
   - Sign up for a Netlify account
   - Drag and drop the `dist` folder to Netlify's upload area
   - Or connect your GitHub repository for continuous deployment

## Future Enhancements

### Parking Lot for Later Features

1. **WebSockets for Real-time Updates**
   - Implement Socket.io for real-time collaboration
   - Enable instant updates across devices

2. **Smart Notifications System**
   - Add push notifications for task reminders
   - Use AI to determine optimal reminder times

3. **Task Dependencies and Sub-tasks**
   - Enhance data model to support task relationships
   - Allow breaking down big tasks into smaller pieces

4. **Advanced AI Integration**
   - Connect to OpenAI or other AI services for smarter task suggestions
   - Implement priority prediction based on user patterns

5. **Progressive Web App (PWA)**
   - Make the app installable on devices
   - Enhance offline capabilities
