const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('./config/env'); // 尽早加载环境变量

const env = require('./config/env');
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// 只创建 app 不监听端口 —— 这样测试可以用 supertest 直接调用，不需要真正占用端口
const app = express();

app.use(helmet());          // 安全响应头（XSS、嗅探等基础防护）
app.use(cors());            // 允许跨域（开发时前端跑在不同端口）
app.use(morgan('dev', { skip: () => env.nodeEnv === 'test' })); // 测试时不打印访问日志
app.use(express.json());    // 解析 JSON 请求体

// 路由
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/todos', apiLimiter, todoRoutes);

// 兜底：404 + 统一错误处理（必须放在所有路由之后）
app.use(notFound);
app.use(errorHandler);

module.exports = app;
