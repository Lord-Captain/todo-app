const jwt = require('jsonwebtoken');
const env = require('../config/env');

// 自定义业务错误：服务层抛出它，统一错误处理器识别状态码
// 类比 Python: class ApiError(Exception): def __init__(self, msg, status)
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// JWT 鉴权中间件：解析 Authorization: Bearer <token>
// 类比：进入办公楼的门禁卡刷卡，卡（token）有效才放行，并把身份挂在 req.user 上
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.id, username: payload.username };
    next();
  } catch (err) {
    // token 过期或被篡改都会走到这里
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { ApiError, requireAuth };
