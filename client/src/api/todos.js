import { api } from './client';

// 任务列表：分页 + 筛选 + 排序（与服务端 GET /api/todos 的查询参数一一对应）
export const fetchTodos = (filters) =>
  api.get('/todos', filters);

export const createTodo = (data) =>
  api.post('/todos', data);

export const updateTodo = (id, patch) =>
  api.patch(`/todos/${id}`, patch);

export const deleteTodo = (id) =>
  api.delete(`/todos/${id}`);
