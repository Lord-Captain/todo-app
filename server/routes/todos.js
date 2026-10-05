const express = require('express');
const { body, query, param } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const controller = require('../controllers/todoController');
const Todo = require('../models/Todo');

const router = express.Router();

// 本路由下所有接口都需要登录
router.use(requireAuth);

// GET /api/todos — 分页列表
router.get(
  '/',
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
  query('status').optional().isIn(['all', 'active', 'completed']).withMessage('Invalid status'),
  query('sort').optional().isIn(Todo.SORTABLE_FIELDS).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc', 'ASC', 'DESC']).withMessage('Order must be asc or desc'),
  validate,
  controller.listTodos
);

// POST /api/todos — 创建任务
router.post(
  '/',
  body('text')
    .trim()
    .notEmpty().withMessage('Text is required')
    .isLength({ max: 255 }).withMessage('Text must be 1-255 characters'),
  body('priority').optional().isIn(Todo.PRIORITIES).withMessage(`Priority must be one of: ${Todo.PRIORITIES.join(', ')}`),
  body('dueDate').optional({ checkFalsy: true }).isISO8601().withMessage('Due date must be a valid date (YYYY-MM-DD)'),
  validate,
  controller.createTodo
);

// PATCH /api/todos/:id — 部分更新（可改文字/完成状态/优先级/截止日期）
router.patch(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('Id must be a positive integer'),
  body('text').optional().trim().notEmpty().withMessage('Text cannot be empty').isLength({ max: 255 }).withMessage('Text must be 1-255 characters'),
  body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
  body('priority').optional().isIn(Todo.PRIORITIES).withMessage(`Priority must be one of: ${Todo.PRIORITIES.join(', ')}`),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Due date must be a valid date'),
  validate,
  controller.updateTodo
);

// DELETE /api/todos/:id — 删除任务
router.delete(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('Id must be a positive integer'),
  validate,
  controller.deleteTodo
);

module.exports = router;
