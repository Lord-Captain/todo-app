// 模型统一出口 + 关联关系定义
const User = require('./User');
const Todo = require('./Todo');

// 一个用户拥有多个任务；删除用户时级联删除其任务（数据库外键行为）
User.hasMany(Todo, { foreignKey: 'userId', onDelete: 'CASCADE' });
Todo.belongsTo(User, { foreignKey: 'userId' });

module.exports = { User, Todo };
