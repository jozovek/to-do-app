import { todoService } from '../services/api';
import { authService } from '../services/api';

/**
 * Migrates todos from localStorage to the database
 * This is called when a user logs in and has todos in localStorage
 */
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
    
    console.log(`Migrating ${localTodos.length} todos to the database...`);
    
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
