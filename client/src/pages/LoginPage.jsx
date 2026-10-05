import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, register } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
// 登录/注册页：同一个表单，用标签切换两种模式
export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const action = mode === 'login' ? login : register;
      const { user, token } = await action(username.trim(), password);
      loginSuccess(token, user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Todo App</h1>
        <div className="status-tabs">
          <button
            type="button"
            className={`tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            登录
          </button>
          <button
            type="button"
            className={`tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            注册
          </button>
        </div>

        <input
          type="text"
          className="input"
          placeholder="用户名（3-30 位字母数字）"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        <input
          type="password"
          className="input"
          placeholder="密码（至少 6 位）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn block" disabled={submitting}>
          {submitting ? '请稍候…' : mode === 'login' ? '登录' : '注册并登录'}
        </button>

        {mode === 'register' && (
          <p className="hint">
            已有账号？
            <Link to="/login" onClick={() => setMode('login')}>直接登录</Link>
          </p>
        )}
      </form>
    </div>
  );
}
