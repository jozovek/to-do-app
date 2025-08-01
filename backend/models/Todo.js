const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'errands'],
    default: 'personal'
  },
  dueDate: Date,
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Todo', TodoSchema);
