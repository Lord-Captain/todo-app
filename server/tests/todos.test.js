const request = require('supertest');
const { app, createUserAndGetToken } = require('./setup');
const { User, Todo } = require('../models');

describe('Todos API', () => {
  let token;
  let authHeader;

  beforeEach(async () => {
    // 每个用例前清空两张表，保证用例之间完全隔离
    await Todo.destroy({ where: {}, truncate: true });
    await User.destroy({ where: {}, truncate: true });
    token = await createUserAndGetToken();
    authHeader = { Authorization: `Bearer ${token}` };
  });

  describe('鉴权', () => {
    it('不带 token 访问返回 401', async () => {
      const res = await request(app).get('/api/todos');
      expect(res.status).toBe(401);
    });

    it('伪造 token 返回 401', async () => {
      const res = await request(app)
        .get('/api/todos')
        .set('Authorization', 'Bearer not-a-real-token');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/todos', () => {
    it('创建成功返回 201', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set(authHeader)
        .send({ text: '写单元测试', priority: 'high' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ text: '写单元测试', priority: 'high', completed: false });
    });

    it('text 为空返回 400', async () => {
      const res = await request(app).post('/api/todos').set(authHeader).send({ text: '' });
      expect(res.status).toBe(400);
    });

    it('非法 priority 返回 400', async () => {
      const res = await request(app).post('/api/todos').set(authHeader).send({ text: 'x', priority: 'urgent' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/todos', () => {
    it('返回分页结构 { todos, total, page, totalPages }', async () => {
      for (let i = 1; i <= 12; i++) {
        await request(app).post('/api/todos').set(authHeader).send({ text: `任务${i}` });
      }

      const res = await request(app).get('/api/todos?page=2&limit=10').set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(12);
      expect(res.body.totalPages).toBe(2);
      expect(res.body.todos).toHaveLength(2);
    });

    it('status=completed 只返回已完成任务', async () => {
      const { body: created } = await request(app).post('/api/todos').set(authHeader).send({ text: '要做的事' });
      await request(app).patch(`/api/todos/${created.id}`).set(authHeader).send({ completed: true });

      const res = await request(app).get('/api/todos?status=completed').set(authHeader);

      expect(res.body.total).toBe(1);
      expect(res.body.todos[0].text).toBe('要做的事');
    });

    it('非法排序字段返回 400', async () => {
      const res = await request(app).get('/api/todos?sort=password').set(authHeader);
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/todos/:id', () => {
    it('更新文本和完成状态', async () => {
      const { body: created } = await request(app).post('/api/todos').set(authHeader).send({ text: '旧文本' });

      const res = await request(app)
        .patch(`/api/todos/${created.id}`)
        .set(authHeader)
        .send({ text: '新文本', completed: true });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ text: '新文本', completed: true });
    });

    it('更新不存在的任务返回 404', async () => {
      const res = await request(app).patch('/api/todos/99999').set(authHeader).send({ completed: true });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('删除成功返回 204', async () => {
      const { body: created } = await request(app).post('/api/todos').set(authHeader).send({ text: '待删除' });

      const res = await request(app).delete(`/api/todos/${created.id}`).set(authHeader);
      expect(res.status).toBe(204);

      const list = await request(app).get('/api/todos').set(authHeader);
      expect(list.body.total).toBe(0);
    });
  });

  describe('数据隔离', () => {
    it('用户 A 无法访问用户 B 的任务', async () => {
      const { body: created } = await request(app).post('/api/todos').set(authHeader).send({ text: 'A 的任务' });

      const tokenB = await createUserAndGetToken('bob', 'secret123');
      const res = await request(app)
        .patch(`/api/todos/${created.id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ completed: true });

      expect(res.status).toBe(404); // 对 B 而言这条任务"不存在"
    });
  });
});
