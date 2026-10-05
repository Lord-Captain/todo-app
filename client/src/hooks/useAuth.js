import { useContext } from 'react';
import { AuthContext } from '../context/authContext';

// 认证状态 hook：组件里用它读取当前用户 / 登出
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
