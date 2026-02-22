const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sequelize = require('./config/database');
const todoRoutes = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// 路由
app.use('/todos', todoRoutes);

// 健康检查
app.get('/', (req, res) => {
  res.json({ message: 'Todo API is running!' });
});

// 同步数据库并启动服务器
const startServer = async () => {
  try {
    await sequelize.sync(); // 首次运行会自动创建表
    console.log('✅ Database synced');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();