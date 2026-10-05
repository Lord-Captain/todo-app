const jwt = require('jsonwebtoken');
const { User } = require('../models');
const env = require('../config/env');
const { ApiError } = require('../middleware/auth');

function generateToken(user) {
  // 签发 JWT：payload 只放 id 和 username（不放敏感信息），并设过期时间
  return jwt.sign(
    { id: user.id, username: user.username },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

async function register({ username, password }) {
  // 唯一性预检查 + 数据库唯一约束双保险（后者在并发时兜底）
  const existing = await User.findOne({ where: { username } });
  if (existing) {
    throw new ApiError('Username already exists', 409);
  }

  const user = await User.create({ username, password }); // beforeSave 钩子自动哈希
  return { user: user.toSafeJSON(), token: generateToken(user) };
}

async function login({ username, password }) {
  const user = await User.findOne({ where: { username } });
  // 用户不存在和密码错误返回同一种提示，避免攻击者借此枚举有效用户名
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError('Invalid username or password', 401);
  }
  return { user: user.toSafeJSON(), token: generateToken(user) };
}

module.exports = { register, login };
