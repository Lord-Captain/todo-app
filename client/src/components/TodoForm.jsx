import { useState } from 'react';

const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_LABELS = { low: '低', medium: '中', high: '高' };

// 新建任务表单：支持文本、优先级、截止日期
export default function TodoForm({ onSubmit, submitting }) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    onSubmit({ text: text.trim(), priority, dueDate: dueDate || null });
    setText('');
    setPriority('medium');
    setDueDate('');
  };

  return (
    <form onSubmit={handleSubmit} className="add-form">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="要做什么？"
        className="input"
        maxLength={255}
        autoFocus
      />
      <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input select">
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
        ))}
      </select>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="input date"
      />
      <button type="submit" className="btn" disabled={submitting || !text.trim()}>
        {submitting ? '添加中…' : '添加'}
      </button>
    </form>
  );
}
