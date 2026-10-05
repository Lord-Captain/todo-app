import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from '../api/todos';
import { useAuth } from '../hooks/useAuth';
import TodoForm from '../components/TodoForm';
import TodoItem from '../components/TodoItem';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';

// 列表查询的缓存 key：筛选条件变化 => key 变化 => 自动重新请求
function todosKey(filters) {
  return ['todos', filters];
}

export default function TodosPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({ page: 1, limit: 10, status: 'all', sort: 'createdAt', order: 'desc' });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: todosKey(filters),
    queryFn: () => fetchTodos(filters),
  });

  // 通用辅助：成功后让相关列表缓存失效，触发重新拉取最新数据
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  };

  const addMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: invalidate,
  });

  const editMutation = useMutation({
    mutationFn: ({ id, patch }) => updateTodo(id, patch),
    onSuccess: invalidate,
  });

  // 乐观更新：先直接改本地缓存让界面"秒变"，请求失败再回滚
  // 类比：先在便利贴上划掉待办，回头发现记错了再贴回去
  const toggleMutation = useMutation({
    mutationFn: (todo) => updateTodo(todo.id, { completed: !todo.completed }),
    onMutate: async (todo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previous = queryClient.getQueryData(todosKey(filters));
      queryClient.setQueryData(todosKey(filters), (old) => ({
        ...old,
        todos: old.todos.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t)),
      }));
      return { previous };
    },
    onError: (err, todo, context) => {
      if (context?.previous) queryClient.setQueryData(todosKey(filters), context.previous);
    },
    onSettled: invalidate, // 无论成败，最终以服务器数据为准
  });

  const deleteMutation = useMutation({
    mutationFn: (todo) => deleteTodo(todo.id),
    onMutate: async (todo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previous = queryClient.getQueryData(todosKey(filters));
      queryClient.setQueryData(todosKey(filters), (old) => ({
        ...old,
        todos: old.todos.filter((t) => t.id !== todo.id),
        total: old.total - 1,
      }));
      return { previous };
    },
    onError: (err, todo, context) => {
      if (context?.previous) queryClient.setQueryData(todosKey(filters), context.previous);
    },
    onSettled: invalidate,
  });

  const updateFilters = (patch) => setFilters((f) => ({ ...f, ...patch }));

  return (
    <div className="container">
      <header className="header">
        <h1>我的待办</h1>
        <div className="user-area">
          <span>{user?.username}</span>
          <button className="btn small" onClick={logout}>退出</button>
        </div>
      </header>

      <TodoForm onSubmit={(data) => addMutation.mutate(data)} submitting={addMutation.isPending} />

      <FilterBar
        status={filters.status}
        sort={filters.sort}
        order={filters.order}
        onChange={updateFilters}
      />

      {isLoading ? (
        <p className="hint">加载中…</p>
      ) : isError ? (
        <p className="error-text">{error.message}，请刷新重试</p>
      ) : (
        <>
          {addMutation.isError && (
            <p className="error-text">添加失败：{addMutation.error.message}</p>
          )}
          {editMutation.isError && (
            <p className="error-text">编辑失败：{editMutation.error.message}</p>
          )}
          <ul className="todo-list">
            {data.todos.length === 0 ? (
              <p className="hint">还没有任务，添加一条吧！</p>
            ) : (
              data.todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleMutation.mutate}
                  onDelete={deleteMutation.mutate}
                  onEdit={(text) => editMutation.mutate({ id: todo.id, patch: { text } })}
                />
              ))
            )}
          </ul>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={(page) => updateFilters({ page })}
          />
        </>
      )}
    </div>
  );
}
