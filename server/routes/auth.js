const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const controller = require('../controllers/authController');

const router = express.Router();

// 注册：用户名 3-30 位字母数字，密码至少 6 位
router.post(
  '/register',
  body('username')
    .isAlphanumeric().withMessage('Username can only contain letters and numbers')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
  body('password')
    .isLength({ min: 6, max: 100 }).withMessage('Password must be at least 6 characters'),
  validate,
  controller.register
);

// 登录：只需要非空，具体对错由 authService 判断
router.post(
  '/login',
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
  controller.login
);

module.exports = router;
