const { validationResult } = require('express-validator');
const { ApiError } = require('./auth');

// 把 express-validator 收集到的所有校验错误合并成一条消息
function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const message = errors.array().map(e => e.msg).join('; ');
  next(new ApiError(message, 400));
}

module.exports = validate;
