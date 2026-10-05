const app = require('./app');
const sequelize = require('./config/database');
require('./models'); // 加载模型，建立 User/Todo 关联
const env = require('./config/env');

const startServer = async () => {
  try {
    // 建立模型关联后同步表结构（首次运行自动建表）
    await sequelize.sync();
    console.log('✅ Database synced');

    const server = app.listen(env.port, () => {
      console.log(`🚀 Server running on http://localhost:${env.port}`);
    });

    // 优雅停机：收到终止信号时先停止接收新请求，处理完存量请求再关数据库
    // 避免请求处理到一半被切断导致数据不一致
    const shutdown = async (signal) => {
      console.log(`\n${signal} received, shutting down gracefully...`);
      server.close(async () => {
        await sequelize.close();
        console.log('✅ Closed server and database connection');
        process.exit(0);
      });
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
