const request = require('supertest');
const { app } = require('./setup');
const { User } = require('../models');

describe('Auth API', () => {
  afterEach(async () => {
    await User.destroy({ where: {}, truncate: true }); // 每个用例后清空用户表，保证隔离
  });

  describe('POST /api/auth/register', () => {
    it('注册成功返回 201、用户信息和 token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'alice', password: 'secret123' });

      expect(res.status).toBe(201);
      expect(res.body.user).toMatchObject({ username: 'alice' });
      expect(res.body.user.password).toBeUndefined(); // 不泄露哈希
      expect(typeof res.body.token).toBe('string');
    });

    it('用户名已存在返回 409', async () => {
      await request(app).post('/api/auth/register').send({ username: 'alice', password: 'secret123' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'alice', password: 'secret456' });

      expect(res.status).toBe(409);
    });

    it('密码太短返回 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'alice', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({ username: 'alice', password: 'secret123' });
    });

    it('正确的用户名密码返回 200 和 token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'alice', password: 'secret123' });

      expect(res.status).toBe(200);
      expect(typeof res.body.token).toBe('string');
    });

    it('密码错误返回 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'alice', password: 'wrongpass' });

      expect(res.status).toBe(401);
    });

    it('不存在的用户返回 401 且提示相同（防用户名枚举）', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nobody', password: 'whatever1' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid username or password');
    });
  });
});
