const rateLimit = require('express-rate-limit');

// 全局限流：每个 IP 15 分钟内最多 300 次请求，防止滥用拖垮服务
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// 认证接口更严格：每个 IP 15 分钟最多 20 次登录/注册，防暴力破解密码
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' },
});

module.exports = { apiLimiter, authLimiter };
