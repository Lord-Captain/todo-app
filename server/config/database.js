const { Sequelize } = require('sequelize');

// 使用 SQLite，数据库文件将保存为 ./database.sqlite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

module.exports = sequelize;