# Todo App System Patterns

## System Architecture
The Todo App follows a component-based architecture using Vue.js, with a focus on simplicity and maintainability. The architecture is built around the following principles:

1. **Component-Based Structure**: The UI is broken down into reusable components
2. **Composition API**: State management and logic are implemented using Vue's Composition API
3. **Unidirectional Data Flow**: Data flows from parent to child components
4. **Event-Based Communication**: Child components emit events to communicate with parents
5. **Local Storage Persistence**: Data is persisted in the browser's localStorage

## Key Technical Decisions

### 1. Vue.js + Vite
- **Decision**: Use Vue.js as the frontend framework with Vite as the build tool
- **Rationale**: Vue.js provides a lightweight, component-based approach that's ideal for this application. Vite offers fast development and build times.
- **Implications**: Simplified development experience with hot module replacement and efficient builds

### 2. Composition API for State Management
- **Decision**: Use Vue's Composition API with composables for state management
- **Rationale**: Provides a clean way to organize and reuse logic without the complexity of Vuex
- **Implications**: More maintainable code with clear separation of concerns

### 3. Local Storage for Data Persistence
- **Decision**: Use browser's localStorage for data persistence
- **Rationale**: Simple solution that doesn't require a backend server
- **Implications**: Data is limited to the user's browser and device

### 4. Plain CSS for Styling
- **Decision**: Use plain CSS for styling without additional frameworks
- **Rationale**: Keeps the project simple and lightweight
- **Implications**: More manual styling work but less overhead and dependencies

## Design Patterns in Use

### 1. Composable Pattern
The `useTodos.js` composable encapsulates all todo-related logic and state, making it reusable across components. This follows the composable pattern introduced with Vue's Composition API.

```javascript
// Example of the composable pattern
export function useTodos() {
  const todos = ref([])
  
  // Load from localStorage
  // CRUD operations
  // Filtering logic
  
  return {
    todos,
    addTodo,
    removeTodo,
    // other functions and state
  }
}
```

### 2. Container/Presentational Pattern
- **Container Components**: App.vue manages state and logic
- **Presentational Components**: TodoItem.vue, TodoForm.vue focus on rendering and user interaction

### 3. Event Bus Pattern (Simplified)
Components communicate through events, with child components emitting events that parent components listen for.

```javascript
// Child component emits an event
const emit = defineEmits(['update-todo'])
function handleUpdate() {
  emit('update-todo', todoId, newValue)
}

// Parent component listens for the event
<TodoItem @update-todo="updateTodo" />
```

## Component Relationships

```
App.vue
├── TodoForm.vue
└── TodoList.vue
    └── TodoItem.vue (multiple instances)
```

- **App.vue**: The root component that manages the overall application state using the useTodos composable
- **TodoForm.vue**: Handles task creation and sends new task data to App.vue
- **TodoList.vue**: Receives the list of tasks from App.vue and manages filtering
- **TodoItem.vue**: Receives individual task data and emits events for task updates/deletion

## Critical Implementation Paths

### 1. Task Creation Flow
1. User enters task details in TodoForm
2. TodoForm emits 'add-todo' event with task data
3. App.vue calls addTodo function from useTodos
4. useTodos adds the task to the state and updates localStorage

### 2. Task Update Flow
1. User interacts with TodoItem (checkbox, edit button)
2. TodoItem emits appropriate event (toggle-complete, edit-todo)
3. Event bubbles up to App.vue
4. App.vue calls appropriate function from useTodos
5. useTodos updates the state and localStorage

### 3. Task Filtering Flow
1. User clicks filter button in TodoList
2. TodoList updates its internal filter state
3. TodoList applies filter to the list of tasks received from App.vue
4. Filtered tasks are rendered as TodoItem components
