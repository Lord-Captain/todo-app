const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const env = require('../config/env');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: {
        args: [3, 30],
        msg: 'Username must be 3-30 characters'
      },
      isAlphanumeric: {
        msg: 'Username can only contain letters and numbers'
      }
    }
  },
  password: {
    // 只存储哈希值，永不存明文（类比 Python 的 hashlib/bcrypt 用法）
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [6, 100],
        msg: 'Password must be at least 6 characters'
      }
    }
  }
}, {
  timestamps: true
});

// 保存前自动哈希密码（只有密码发生变化时才重新哈希）
User.beforeSave(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, env.bcryptRounds);
  }
});

// 对外输出时剥离密码哈希，防止泄露
User.prototype.toSafeJSON = function () {
  const values = { ...this.toJSON() };
  delete values.password;
  return values;
};

// 校验明文密码是否与哈希匹配（登录时用）
User.prototype.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = User;
