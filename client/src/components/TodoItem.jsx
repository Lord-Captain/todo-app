import { useState } from 'react';

const PRIORITY_LABELS = { low: '低', medium: '中', high: '高' };

// 单条任务：勾选切换完成、双击编辑文本、删除
export default function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);

  const commitEdit = () => {
    const next = draft.trim();
    if (next && next !== todo.text) onEdit(next);
    else setDraft(todo.text); // 放弃修改
    setEditing(false);
  };

  const overdue = todo.dueDate && !todo.completed && todo.dueDate < new Date().toISOString().slice(0, 10);

  return (
    <li className={`todo-item ${todo.completed ? 'done' : ''}`}>
      <label className="checkbox-area">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo)}
        />
        {editing ? (
          <input
            className="input edit-input"
            value={draft}
            maxLength={255}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit();
              if (e.key === 'Escape') { setDraft(todo.text); setEditing(false); }
            }}
          />
        ) : (
          <span
            className="todo-text"
            onDoubleClick={() => setEditing(true)}
            title="双击编辑"
          >
            {todo.text}
          </span>
        )}
      </label>

      <div className="todo-meta">
        <span className={`tag priority-${todo.priority}`}>{PRIORITY_LABELS[todo.priority] || '中'}</span>
        {todo.dueDate && (
          <span className={`tag due ${overdue ? 'overdue' : ''}`}>{todo.dueDate}</span>
        )}
        <button onClick={() => onToggle(todo)} className="btn small">
          {todo.completed ? '撤销' : '完成'}
        </button>
        <button onClick={() => onDelete(todo)} className="btn small danger">
          删除
        </button>
      </div>
    </li>
  );
}
