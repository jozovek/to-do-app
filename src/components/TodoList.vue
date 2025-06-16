<template>
  <div class="todo-list">
    <div class="todo-filters">
      <button 
        v-for="option in filterOptions" 
        :key="option.value"
        @click="currentFilter = option.value"
        :class="{ active: currentFilter === option.value }"
        class="filter-btn"
      >
        {{ option.label }}
      </button>
      
      <button 
        v-if="filteredTodos.length > 0"
        @click="exportAllTodos"
        class="export-btn"
        title="Export all visible tasks to calendar"
      >
        Export All to Calendar
      </button>
    </div>
    
    <div v-if="filteredTodos.length === 0" class="empty-state">
      <p>No tasks found. {{ emptyStateMessage }}</p>
    </div>
    
    <TransitionGroup name="todo-list" tag="div">
      <TodoItem
        v-for="todo in filteredTodos"
        :key="todo.id"
        :todo="todo"
        @toggle-complete="$emit('toggle-complete', $event)"
        @edit-todo="$emit('edit-todo', $event)"
        @remove-todo="$emit('remove-todo', $event)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import TodoItem from './TodoItem.vue';
import { exportTodosAsCalendar } from '../utils/calendarExport';

// Define props
const props = defineProps({
  todos: {
    type: Array,
    required: true
  }
});

// Define emits
const emit = defineEmits(['toggle-complete', 'edit-todo', 'remove-todo']);

// Filter options
const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' }
];

// Current filter
const currentFilter = ref('all');

// Filtered todos based on current filter
const filteredTodos = computed(() => {
  switch (currentFilter.value) {
    case 'active':
      return props.todos.filter(todo => !todo.completed);
    case 'completed':
      return props.todos.filter(todo => todo.completed);
    default:
      return props.todos;
  }
});

// Empty state message based on current filter
const emptyStateMessage = computed(() => {
  switch (currentFilter.value) {
    case 'active':
      return 'All tasks are completed!';
    case 'completed':
      return 'No completed tasks yet.';
    default:
      return 'Add a task to get started!';
  }
});

// Export all visible todos to calendar
const exportAllTodos = () => {
  if (filteredTodos.value.length > 0) {
    exportTodosAsCalendar(filteredTodos.value);
  }
};
</script>

<style scoped>
.todo-list {
  background-color: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.todo-filters {
  display: flex;
  margin-bottom: 1.5rem;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.filter-btn.active {
  background-color: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.filter-btn:hover:not(.active) {
  background-color: #f0f0f0;
}

.export-btn {
  margin-left: auto;
  background-color: #fff8e1;
  border: 1px solid #ffd54f;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}

.export-btn:hover {
  background-color: #ffecb3;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #888;
  font-style: italic;
}

/* List transitions */
.todo-list-enter-active,
.todo-list-leave-active {
  transition: all 0.3s ease;
}

.todo-list-enter-from,
.todo-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.todo-list-move {
  transition: transform 0.3s ease;
}
</style>
