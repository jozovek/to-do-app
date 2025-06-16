<template>
  <div class="register-container">
    <h2 class="form-header">New Users</h2>
    <form @submit.prevent="register">
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    <div>
      <label for="register-username">Username:</label>
      <input type="text" id="register-username" v-model="username" required :disabled="isLoading">
    </div>
    <div>
      <label for="register-email">Email:</label>
      <input type="email" id="register-email" v-model="email" required :disabled="isLoading">
    </div>
    <div>
      <label for="register-password">Password:</label>
      <input type="password" id="register-password" v-model="password" required :disabled="isLoading">
    </div>
    <button type="submit" :disabled="isLoading">
      {{ isLoading ? 'Registering...' : 'Register' }}
    </button>
  </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const username = ref('');
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);

const register = async () => {
  if (isLoading.value) return;
  
  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value
      })
    });

    if (response.ok) {
      console.log('Registration successful');
      successMessage.value = 'Registration successful! You can now log in.';
      // Clear form
      username.value = '';
      email.value = '';
      password.value = '';
    } else {
      const errorData = await response.json();
      console.error('Registration failed:', errorData.error);
      errorMessage.value = errorData.error || 'Registration failed';
    }
  } catch (error) {
    console.error('Error during registration:', error);
    errorMessage.value = 'Network error. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.register-container {
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

.success-message {
  background-color: #efe;
  color: #363;
  padding: 0.75rem;
  border: 1px solid #cfc;
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
