<template>
  <div class="todo-item" :class="{ 'completed': todo.completed }">
    <div class="todo-content">
      <input 
        type="checkbox" 
        :checked="todo.completed" 
        @change="toggleComplete"
        class="todo-checkbox"
      />
      
      <div class="todo-details">
        <div class="todo-text">{{ todo.text }}</div>
        
        <div class="todo-meta">
          <span class="todo-category" :class="todo.category">
            {{ todo.category }}
          </span>
          
          <span v-if="todo.dueDate" class="todo-due-date">
            Due: {{ formatDate(todo.dueDate) }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="todo-actions">
      <button @click="exportTodo" class="btn-export" title="Export to Calendar">
        📅
      </button>
      <button @click="$emit('edit-todo', todo.id)" class="btn-edit">
        Edit
      </button>
      <button @click="$emit('remove-todo', todo.id)" class="btn-delete">
        Delete
      </button>
    </div>
  </div>
</template>

<script setup>
import { exportTodoAsCalendar } from '../utils/calendarExport';

// Define props
const props = defineProps({
  todo: {
    type: Object,
    required: true
  }
});

// Define emits
const emit = defineEmits(['toggle-complete', 'edit-todo', 'remove-todo']);

// Toggle completion status
const toggleComplete = () => {
  emit('toggle-complete', props.todo.id);
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Export todo to calendar
const exportTodo = () => {
  exportTodoAsCalendar(props.todo);
};
</script>

<style scoped>
.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s, opacity 0.2s;
}

.todo-item.completed {
  background-color: #f9f9f9;
  opacity: 0.7;
}

.todo-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.todo-checkbox {
  margin-right: 1rem;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.todo-details {
  flex: 1;
}

.todo-text {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.completed .todo-text {
  text-decoration: line-through;
  color: #888;
}

.todo-meta {
  display: flex;
  font-size: 0.85rem;
  color: #666;
}

.todo-category {
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  margin-right: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.todo-category.work {
  background-color: #e1f5fe;
  color: #0288d1;
}

.todo-category.personal {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.todo-category.errands {
  background-color: #e8f5e9;
  color: #388e3c;
}

.todo-due-date {
  display: flex;
  align-items: center;
}

.todo-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit, .btn-delete, .btn-export {
  padding: 0.4rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-edit {
  background-color: #f0f0f0;
  color: #555;
}

.btn-edit:hover {
  background-color: #e0e0e0;
}

.btn-delete {
  background-color: #ffebee;
  color: #e53935;
}

.btn-delete:hover {
  background-color: #ffcdd2;
}

.btn-export {
  background-color: #fff8e1;
  font-size: 1.2rem;
  padding: 0.25rem 0.5rem;
}

.btn-export:hover {
  background-color: #ffecb3;
}
</style>
