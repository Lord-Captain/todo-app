// 集中管理环境变量：所有配置从这一个入口读取，避免散落在各处
// 类比 Python：相当于把 os.environ 的读取统一放到一个 settings.py 里
require('dotenv').config({ quiet: true });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3001,
  dbStorage: process.env.DB_STORAGE || './database.sqlite',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
};

if (env.nodeEnv === 'production' && env.jwtSecret === 'dev-only-secret-change-me') {
  // 生产环境绝不能使用默认密钥，直接拒绝启动（快速失败）
  throw new Error('JWT_SECRET must be set in production');
}

module.exports = env;
