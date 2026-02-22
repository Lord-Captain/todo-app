const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

// GET /todos — 获取所有任务
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.findAll();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /todos — 创建新任务
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    
    const todo = await Todo.create({ text });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /todos/:id — 切换完成状态
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findByPk(id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    todo.completed = !todo.completed;
    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /todos/:id — 删除任务
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findByPk(id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    await todo.destroy();
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;