/**
 * Utility for exporting todo items to iCalendar (.ics) format
 * This allows users to import their tasks into calendar applications
 */

/**
 * Generate an iCalendar file for a single todo item
 * @param {Object} todo - The todo item to export
 * @returns {string} - The iCalendar file content
 */
export function generateICalendarForTodo(todo) {
  // Format date for iCalendar (yyyyMMddTHHmmssZ)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '');
  };

  // Create a unique identifier for the event
  const uid = `todo-${todo.id}@todoapp`;
  
  // Format the due date if it exists
  const dueDate = todo.dueDate ? formatDate(todo.dueDate) : formatDate(new Date().toISOString());
  
  // Create the event summary (title)
  const summary = todo.text;
  
  // Add category as description
  const description = `Category: ${todo.category || 'None'}`;
  
  // Generate the iCalendar content
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TodoApp//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDate(new Date().toISOString())}`,
    `DTSTART:${dueDate}`,
    `DTEND:${dueDate}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  
  return icsContent;
}

/**
 * Export a todo item as an iCalendar file
 * @param {Object} todo - The todo item to export
 */
export function exportTodoAsCalendar(todo) {
  // Generate the iCalendar content
  const icsContent = generateICalendarForTodo(todo);
  
  // Create a filename for the download
  const filename = `todo-${todo.id}.ics`;
  
  // Create a Blob with the iCalendar content
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  
  // Create a download link and trigger the download
  downloadFile(blob, filename);
}

/**
 * Export multiple todo items as a single iCalendar file
 * @param {Array} todos - The todo items to export
 */
export function exportTodosAsCalendar(todos) {
  // Start the iCalendar file
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TodoApp//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ].join('\r\n');
  
  // Format date for iCalendar
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '');
  };
  
  // Add each todo as an event
  todos.forEach(todo => {
    const uid = `todo-${todo.id}@todoapp`;
    const dueDate = todo.dueDate ? formatDate(todo.dueDate) : formatDate(new Date().toISOString());
    const summary = todo.text;
    const description = `Category: ${todo.category || 'None'}`;
    
    icsContent += '\r\n' + [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatDate(new Date().toISOString())}`,
      `DTSTART:${dueDate}`,
      `DTEND:${dueDate}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT'
    ].join('\r\n');
  });
  
  // End the iCalendar file
  icsContent += '\r\nEND:VCALENDAR';
  
  // Create a filename for the download
  const filename = `todos-${Date.now()}.ics`;
  
  // Create a Blob with the iCalendar content
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  
  // Create a download link and trigger the download
  downloadFile(blob, filename);
}

/**
 * Helper function to download a file
 * @param {Blob} blob - The file content as a Blob
 * @param {string} filename - The name of the file
 */
function downloadFile(blob, filename) {
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Create a download link
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Append the link to the document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Release the URL object
  URL.revokeObjectURL(url);
}
