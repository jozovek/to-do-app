<template>
  <div class="todo-form">
    <h2>Add New Task</h2>
    
    <!-- Smart input option -->
    <div class="input-toggle">
      <button 
        @click="inputMode = 'smart'" 
        :class="{ active: inputMode === 'smart' }"
        class="toggle-btn"
        type="button"
      >
        ✨ Smart Input
      </button>
      <button 
        @click="inputMode = 'standard'" 
        :class="{ active: inputMode === 'standard' }"
        class="toggle-btn"
        type="button"
      >
        📝 Standard Form
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
const inputMode = ref('smart'); // Default to smart input

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
.todo-form {
  background-color: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

input, select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus, select:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.btn-add {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-add:hover {
  background-color: #3a80d2;
}

.btn-add:active {
  background-color: #2a70c2;
}

/* Toggle button styles */
.input-toggle {
  display: flex;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  font-weight: 500;
  font-size: 0.9rem;
}

.toggle-btn.active {
  background-color: #4a90e2;
  color: white;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-btn:hover:not(.active) {
  background-color: #e9ecef;
  color: #495057;
}

.toggle-btn:first-child {
  border-right: 1px solid #dee2e6;
}
</style>
