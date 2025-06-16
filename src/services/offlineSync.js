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
