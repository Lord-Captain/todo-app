import { api } from './client';

// 登录 / 注册：成功返回 { user, token }
export const login = (username, password) =>
  api.post('/auth/login', { username, password });

export const register = (username, password) =>
  api.post('/auth/register', { username, password });
