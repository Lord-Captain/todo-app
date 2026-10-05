const todoService = require('../services/todoService');

// GET /api/todos?page=1&limit=10&status=all|active|completed&sort=createdAt&order=desc
async function listTodos(req, res) {
  const { page, limit, status, sort, order } = req.query;
  const result = await todoService.listTodos(req.user.id, { page, limit, status, sort, order });
  res.json(result);
}

// POST /api/todos
async function createTodo(req, res) {
  const todo = await todoService.createTodo(req.user.id, req.body);
  res.status(201).json(todo);
}

// PATCH /api/todos/:id
async function updateTodo(req, res) {
  const todo = await todoService.updateTodo(req.user.id, req.params.id, req.body);
  res.json(todo);
}

// DELETE /api/todos/:id
async function deleteTodo(req, res) {
  await todoService.deleteTodo(req.user.id, req.params.id);
  res.sendStatus(204);
}

module.exports = { listTodos, createTodo, updateTodo, deleteTodo };
