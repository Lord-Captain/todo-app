// 筛选与排序工具条：状态筛选 + 排序字段 + 排序方向
export default function FilterBar({ status, sort, order, onChange }) {
  return (
    <div className="filter-bar">
      <div className="status-tabs">
        {[
          ['all', '全部'],
          ['active', '未完成'],
          ['completed', '已完成'],
        ].map(([value, label]) => (
          <button
            key={value}
            className={`tab ${status === value ? 'active' : ''}`}
            onClick={() => onChange({ status: value, page: 1 })}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="sort-controls">
        <select
          className="input select"
          value={sort}
          onChange={(e) => onChange({ sort: e.target.value, page: 1 })}
        >
          <option value="createdAt">创建时间</option>
          <option value="dueDate">截止日期</option>
          <option value="priority">优先级</option>
          <option value="text">名称</option>
        </select>
        <button
          className="btn small"
          onClick={() => onChange({ order: order === 'desc' ? 'asc' : 'desc' })}
          title="切换升序/降序"
        >
          {order === 'desc' ? '↓' : '↑'}
        </button>
      </div>
    </div>
  );
}
