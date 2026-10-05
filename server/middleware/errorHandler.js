const { ValidationError, UniqueConstraintError } = require('sequelize');
const env = require('../config/env');
const { ApiError } = require('./auth');

// 404：请求了不存在的路由
function notFound(req, res, next) {
  next(new ApiError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

// 统一错误处理：全应用所有未捕获的错误最后都汇聚到这里
// 好处：路由代码里不用重复写 try/catch，错误响应格式保持一致
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Sequelize 模型校验失败（如字段超长）→ 400
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.errors.map(e => e.message).join('; ') });
  }
  // 唯一约束冲突（如用户名已存在）→ 409
  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({ error: 'Username already exists' });
  }
  // 自定义业务错误（带状态码）
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // 未知错误：服务器内部问题。生产环境不暴露细节（防信息泄露），只记日志
  console.error('Unexpected error:', err);
  const message = env.nodeEnv === 'production' ? 'Internal server error' : err.message;
  res.status(500).json({ error: message });
}

module.exports = { notFound, errorHandler };
