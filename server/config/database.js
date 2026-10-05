const { Sequelize } = require('sequelize');
const env = require('./env');

// 测试环境使用内存数据库（:memory:），不污染真实数据文件，速度也更快
// 类比 Python 的 sqlite3.connect(':memory:')
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: env.nodeEnv === 'test' ? ':memory:' : env.dbStorage,
  logging: false, // 关闭 SQL 日志，保持控制台整洁
});

module.exports = sequelize;
