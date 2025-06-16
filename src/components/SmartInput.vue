<template>
  <div class="smart-input">
    <div class="input-container">
      <input 
        v-model="inputText" 
        type="text"
        placeholder="Add task naturally (e.g., 'Buy milk tomorrow', 'Work meeting at 3pm Friday', 'Call dentist for personal appointment')"
        @keyup.enter="parseInput"
        class="smart-input-field"
      />
      <button @click="parseInput" class="btn-parse" :disabled="!inputText.trim()">
        ✨ Parse
      </button>
    </div>
    
    <div v-if="loading" class="parsing-indicator">
      <span class="loading-spinner"></span>
      Analyzing your task...
    </div>
    
    <div v-if="parsedPreview" class="preview-container">
      <h4>Parsed Task:</h4>
      <div class="preview-item">
        <strong>Task:</strong> {{ parsedPreview.text }}
      </div>
      <div class="preview-item">
        <strong>Category:</strong> {{ parsedPreview.category }}
      </div>
      <div class="preview-item" v-if="parsedPreview.dueDate">
        <strong>Due Date:</strong> {{ formatDate(parsedPreview.dueDate) }}
      </div>
      <div class="preview-actions">
        <button @click="confirmParsed" class="btn-confirm">✓ Add Task</button>
        <button @click="clearPreview" class="btn-cancel">✗ Cancel</button>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['parsed']);

const inputText = ref('');
const loading = ref(false);
const error = ref('');
const parsedPreview = ref(null);

// Enhanced client-side parsing with more patterns
const parseClientSide = (text) => {
  const result = {
    text: text.toLowerCase(),
    dueDate: null,
    category: 'personal'
  };
  
  // Extract and remove time-related keywords
  const timePatterns = [
    { pattern: /\btomorrow\b/gi, days: 1 },
    { pattern: /\btoday\b/gi, days: 0 },
    { pattern: /\bnext week\b/gi, days: 7 },
    { pattern: /\bthis week\b/gi, days: 3 },
    { pattern: /\bmonday\b/gi, dayOfWeek: 1 },
    { pattern: /\btuesday\b/gi, dayOfWeek: 2 },
    { pattern: /\bwednesday\b/gi, dayOfWeek: 3 },
    { pattern: /\bthursday\b/gi, dayOfWeek: 4 },
    { pattern: /\bfriday\b/gi, dayOfWeek: 5 },
    { pattern: /\bsaturday\b/gi, dayOfWeek: 6 },
    { pattern: /\bsunday\b/gi, dayOfWeek: 0 }
  ];
  
  for (const timePattern of timePatterns) {
    if (timePattern.pattern.test(result.text)) {
      const date = new Date();
      
      if (timePattern.days !== undefined) {
        date.setDate(date.getDate() + timePattern.days);
      } else if (timePattern.dayOfWeek !== undefined) {
        const currentDay = date.getDay();
        const targetDay = timePattern.dayOfWeek;
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7; // Next occurrence of the day
        date.setDate(date.getDate() + daysToAdd);
      }
      
      result.dueDate = date.toISOString().split('T')[0];
      result.text = result.text.replace(timePattern.pattern, '').trim();
      break; // Only use the first match
    }
  }
  
  // Extract category keywords
  const categoryPatterns = [
    { pattern: /\b(work|office|meeting|project|deadline|boss|colleague|client)\b/gi, category: 'work' },
    { pattern: /\b(errands|shopping|grocery|store|buy|pick up|drop off|bank|post office)\b/gi, category: 'errands' },
    { pattern: /\b(personal|family|friend|doctor|dentist|appointment|call|email)\b/gi, category: 'personal' }
  ];
  
  for (const categoryPattern of categoryPatterns) {
    if (categoryPattern.pattern.test(result.text)) {
      result.category = categoryPattern.category;
      break; // Use the first match
    }
  }
  
  // Clean up the text
  result.text = result.text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
    .replace(/^(for|to|)\s*/i, '') // Remove common prefixes
    .replace(/\s*(task|todo|item)$/i, ''); // Remove common suffixes
  
  // Capitalize first letter
  if (result.text) {
    result.text = result.text.charAt(0).toUpperCase() + result.text.slice(1);
  }
  
  return result;
};

const parseInput = () => {
  if (!inputText.value.trim()) return;
  
  loading.value = true;
  error.value = '';
  parsedPreview.value = null;
  
  try {
    // Simulate a brief delay for parsing effect
    setTimeout(() => {
      const parsed = parseClientSide(inputText.value);
      
      if (!parsed.text) {
        error.value = 'Could not extract a task from your input. Please try rephrasing.';
      } else {
        parsedPreview.value = parsed;
      }
      
      loading.value = false;
    }, 500);
  } catch (err) {
    error.value = 'Failed to parse input';
    console.error(err);
    loading.value = false;
  }
};

const confirmParsed = () => {
  if (parsedPreview.value) {
    emit('parsed', parsedPreview.value);
    clearAll();
  }
};

const clearPreview = () => {
  parsedPreview.value = null;
  error.value = '';
};

const clearAll = () => {
  inputText.value = '';
  parsedPreview.value = null;
  error.value = '';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};
</script>

<style scoped>
.smart-input {
  margin-bottom: 1rem;
}

.input-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.smart-input-field {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.smart-input-field:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.btn-parse {
  background: linear-gradient(135deg, #4a90e2, #357abd);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-parse:hover:not(:disabled) {
  background: linear-gradient(135deg, #357abd, #2a6ba8);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(74, 144, 226, 0.3);
}

.btn-parse:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.parsing-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.preview-container {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.preview-container h4 {
  margin: 0 0 0.75rem 0;
  color: #495057;
  font-size: 1rem;
}

.preview-item {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.preview-item strong {
  color: #495057;
  min-width: 80px;
  display: inline-block;
}

.preview-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-confirm {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-confirm:hover {
  background-color: #218838;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-cancel:hover {
  background-color: #5a6268;
}

.error-message {
  margin-top: 0.5rem;
  color: #dc3545;
  font-size: 0.9rem;
  padding: 0.5rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}
</style>
