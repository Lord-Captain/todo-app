import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3001/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);

  // 获取所有任务
  const fetchTodos = async () => {
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error('Failed to fetch todos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputValue })
      });
      const newTodo = await res.json();
      setTodos([...todos, newTodo]);
      setInputValue('');
    } catch (err) {
      console.error('Failed to add todo', err);
    }
  };

  const toggleTodo = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'PATCH' });
      const updatedTodo = await res.json();
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
    } catch (err) {
      console.error('Failed to toggle todo', err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete todo', err);
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1>My Todo App</h1>
      <form onSubmit={addTodo} className="add-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a new task"
          className="input"
        />
        <button type="submit" className="btn">Add</button>
      </form>

      <ul className="todo-list">
        {todos.length === 0 ? (
          <p>No tasks yet. Add one!</p>
        ) : (
          todos.map(todo => (
            <li key={todo.id} className="todo-item">
              <span
                style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
              >
                {todo.text}
              </span>
              <div>
                <button onClick={() => toggleTodo(todo.id)} className="btn small">
                  {todo.completed ? 'Undo' : 'Done'}
                </button>
                <button onClick={() => deleteTodo(todo.id)} className="btn small danger">
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default App;