const { Todo } = require('../models');
const { ApiError } = require('../middleware/auth');

// 允许排序的字段白名单，防止用户随意传字段名拼进 SQL
const SORTABLE_FIELDS = ['createdAt', 'dueDate', 'priority', 'text'];

// 列表：分页 + 按状态筛选 + 排序
// 返回结构 { todos, total, page, totalPages } 让前端能渲染页码
async function listTodos(userId, { page = 1, limit = 10, status = 'all', sort = 'createdAt', order = 'DESC' } = {}) {
  page = Math.max(1, parseInt(page, 10) || 1);
  limit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10)); // 上限 50，防止一次拉全表

  const where = { userId };
  if (status === 'active') where.completed = false;
  if (status === 'completed') where.completed = true;

  if (!SORTABLE_FIELDS.includes(sort)) {
    throw new ApiError(`Sort must be one of: ${SORTABLE_FIELDS.join(', ')}`, 400);
  }
  const orderDir = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const { rows, count } = await Todo.findAndCountAll({
    where,
    order: [[sort, orderDir], ['id', 'DESC']], // 次级排序保证分页稳定
    limit,
    offset: (page - 1) * limit,
  });

  return { todos: rows, total: count, page, totalPages: Math.max(1, Math.ceil(count / limit)) };
}

async function getTodo(userId, id) {
  const todo = await Todo.findOne({ where: { id, userId } }); // 只能查到自己的任务
  if (!todo) throw new ApiError('Todo not found', 404);
  return todo;
}

async function createTodo(userId, { text, priority, dueDate }) {
  return Todo.create({ text, priority: priority || 'medium', dueDate: dueDate || null, userId });
}

async function updateTodo(userId, id, patch) {
  const todo = await getTodo(userId, id);
  const { text, completed, priority, dueDate } = patch;
  return todo.update({
    ...(text !== undefined && { text }),
    ...(completed !== undefined && { completed }),
    ...(priority !== undefined && { priority }),
    ...(dueDate !== undefined && { dueDate }),
  });
}

async function deleteTodo(userId, id) {
  const todo = await getTodo(userId, id);
  await todo.destroy();
}

module.exports = { listTodos, getTodo, createTodo, updateTodo, deleteTodo, SORTABLE_FIELDS };
