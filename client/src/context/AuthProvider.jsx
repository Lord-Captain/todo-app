import { useState } from 'react';
import { getStoredUser, getToken, saveSession, clearSession } from '../api/client';
import { AuthContext } from './authContext';

// 全局认证状态：任何组件都能读到"当前登录用户"，不用一层层传 props
// 类比 Python 里的全局 session 对象，但配合 React 的响应式更新
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser() || (getToken() ? { username: '' } : null));

  const loginSuccess = (token, user) => {
    saveSession(token, user);
    setUser(user);
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
