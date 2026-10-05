// 分页条：上一页/页码/下一页
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="btn small"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        上一页
      </button>
      <span className="page-info">第 {page} / {totalPages} 页</span>
      <button
        className="btn small"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        下一页
      </button>
    </div>
  );
}
