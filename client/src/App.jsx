import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import TodosPage from './pages/TodosPage';

// 鉴权守卫：已登录 => 渲染子页面；未登录 => 重定向到 /login
function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <TodosPage />
          </RequireAuth>
        }
      />
      {/* 其他未知路径统一回到首页 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
