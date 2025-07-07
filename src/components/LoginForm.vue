<template>
  <div class="login-container">
    <h2 class="form-header">Returning Users</h2>
    <form @submit.prevent="login">
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    <div>
      <label for="login-email">Email:</label>
      <input type="email" id="login-email" v-model="email" required :disabled="isLoading">
    </div>
    <div>
      <label for="login-password">Password:</label>
      <input type="password" id="login-password" v-model="password" required :disabled="isLoading">
    </div>
    <button type="submit" :disabled="isLoading">
      {{ isLoading ? 'Logging in...' : 'Login' }}
    </button>
  </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['login-success']);

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const login = async () => {
  if (isLoading.value) return;
  
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || '/api'  // Production: use environment variable or fallback to relative path
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    });

    if (response.ok) {
      console.log('Login successful');
      // Store user email in localStorage for reference
      localStorage.setItem('userEmail', email.value);
      // Emit login success event to parent component
      emit('login-success');
    } else {
      const errorData = await response.json();
      console.error('Login failed:', errorData.error);
      errorMessage.value = errorData.error || 'Login failed';
    }
  } catch (error) {
    console.error('Error during login:', error);
    errorMessage.value = 'Network error. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  flex: 1;
  max-width: 400px;
}

.form-header {
  text-align: center;
  color: #4a90e2;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 500;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem;
  border: 1px solid #fcc;
  border-radius: 4px;
  margin-bottom: 1rem;
}

form {
  width: 100%;
  margin: 0;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

form div {
  margin-bottom: 1rem;
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

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #3a80d2;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
