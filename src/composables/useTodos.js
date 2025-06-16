import { ref, watchEffect, onMounted } from 'vue';
import { todoService, authService } from '../services/api';
import { migrateLocalStorageToDatabase } from '../utils/migration';
import { offlineQueue } from '../services/offlineSync';

/**
 * Composable for managing todo items
 * Handles CRUD operations with API and localStorage persistence
 */
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
      console.error('Failed to load todos:', err);
      error.value = 'Failed to load todos';
    } finally {
      loading.value = false;
    }
  };
  
  // Save todos to localStorage as backup when not authenticated
  watchEffect(() => {
    if (!authService.isAuthenticated()) {
      localStorage.setItem('todos', JSON.stringify(todos.value));
    }
  });
  
  // Add a new todo
  const addTodo = async (todoText, category, dueDate) => {
    if (!todoText.trim()) return;

    const newTodo = {
      text: todoText,
      completed: false,
      category,
      dueDate,
      createdAt: new Date().toISOString()
    };

    if (navigator.onLine && authService.isAuthenticated()) {
      try {
        // Add to API
        const savedTodo = await todoService.createTodo(newTodo);
        todos.value.push(savedTodo);
      } catch (err) {
        console.error('Failed to add todo:', err);
        error.value = 'Failed to add todo';
      }
    } else {
      // Queue the operation
      offlineQueue.addOperation('create', newTodo);
      // Add to local state with generated ID
      newTodo.id = Date.now();
      todos.value.push(newTodo);
    }
  };
  
  // Remove a todo by id
  const removeTodo = async (id) => {
    if (navigator.onLine && authService.isAuthenticated()) {
      try {
        // Remove from API
        await todoService.deleteTodo(id);
      } catch (err) {
        console.error('Failed to remove todo:', err);
        error.value = 'Failed to remove todo';
      }
    } else {
      offlineQueue.addOperation('delete', { id });
    }
    
    // Remove from local state
    todos.value = todos.value.filter(todo => todo.id !== id);
  };
  
  // Toggle todo completion status
  const toggleTodoComplete = async (id) => {
    const todo = todos.value.find(todo => todo.id === id);
    if (!todo) return;

    // Update local state immediately
    todo.completed = !todo.completed;

    if (navigator.onLine && authService.isAuthenticated()) {
      try {
        // Update in API
        await todoService.updateTodo(id, { completed: todo.completed });
      } catch (err) {
        // Revert on error
        todo.completed = !todo.completed;
        console.error('Failed to update todo:', err);
        error.value = 'Failed to update todo';
      }
    } else {
      offlineQueue.addOperation('update', { id, updates: { completed: todo.completed } });
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
      console.error('Failed to update todo:', err);
      error.value = 'Failed to update todo';
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
