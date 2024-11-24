

const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new To-Do
router.post('/', authMiddleware, todoController.createTodo);

// Get all To-Dos
router.get('/', authMiddleware, todoController.getTodos);

// Get a single To-Do by ID
router.get('/:id', authMiddleware, todoController.getTodoById);

// Update a To-Do
router.put('/:id', authMiddleware, todoController.updateTodo);

// Delete a To-Do
router.delete('/:id', authMiddleware, todoController.deleteTodo);

module.exports = router;

