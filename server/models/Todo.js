const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 任务优先级枚举：低/中/高
const PRIORITIES = ['low', 'medium', 'high'];

// 允许排序的字段白名单，防止用户随意传字段名拼进 SQL
const SORTABLE_FIELDS = ['createdAt', 'dueDate', 'priority', 'text'];

const Todo = sequelize.define('Todo', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Text is required'
      },
      len: {
        args: [1, 255],
        msg: 'Text must be 1-255 characters'
      }
    }
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  priority: {
    type: DataTypes.STRING,
    defaultValue: 'medium',
    validate: {
      isIn: {
        args: [PRIORITIES],
        msg: `Priority must be one of: ${PRIORITIES.join(', ')}`
      }
    }
  },
  dueDate: {
    // 截止日期，可选，只存日期部分（YYYY-MM-DD）
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    // 常用查询路径建索引，加快"查某用户的任务列表"和按状态筛选
    { fields: ['userId'] },
    { fields: ['userId', 'completed'] }
  ]
});

Todo.PRIORITIES = PRIORITIES;
Todo.SORTABLE_FIELDS = SORTABLE_FIELDS;

module.exports = Todo;
