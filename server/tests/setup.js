// 每个测试文件 require 本模块：
// - Jest 为每个测试文件创建独立的模块注册表，所以这里会为每个文件
//   建立全新的内存数据库连接（:memory:），文件之间完全隔离
// - 提供 createUserAndGetToken 辅助函数
const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');

beforeAll(async () => {
  await sequelize.sync({ force: true }); // force: 建全新干净的表
});

afterAll(async () => {
  await sequelize.close();
});

// 测试辅助：注册一个用户并返回 token
async function createUserAndGetToken(username = 'tester', password = 'secret123') {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ username, password });
  return res.body.token;
}

module.exports = { app, createUserAndGetToken };
