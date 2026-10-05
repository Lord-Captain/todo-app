// 端到端 API 冒烟测试：注册 → 登录 → 增删改查 → 分页/筛选 → 越权访问
const BASE = 'http://localhost:3001/api';
let passed = 0, failed = 0;

async function call(method, path, { token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = res.status === 204 ? null : await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function check(name, cond, extra = '') {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name} ${extra}`); }
}

(async () => {
  console.log('1. 注册用户 alice');
  const reg = await call('POST', '/auth/register', { body: { username: 'alice', password: 'secret123' } });
  check('返回 201 + token', reg.status === 201 && !!reg.data.token);

  console.log('2. 重复注册 alice');
  const dup = await call('POST', '/auth/register', { body: { username: 'alice', password: 'secret123' } });
  check('返回 409', dup.status === 409);

  console.log('3. 登录');
  const login = await call('POST', '/auth/login', { body: { username: 'alice', password: 'secret123' } });
  check('返回 200 + token', login.status === 200 && !!login.data.token);
  const token = login.data.token;

  console.log('4. 错误密码登录');
  const bad = await call('POST', '/auth/login', { body: { username: 'alice', password: 'wrongpw1' } });
  check('返回 401', bad.status === 401);

  console.log('5. 无 token 访问 todos');
  const noAuth = await call('GET', '/todos');
  check('返回 401', noAuth.status === 401);

  console.log('6. 创建 12 条任务（不同优先级/日期）');
  for (let i = 1; i <= 12; i++) {
    await call('POST', '/todos', { token, body: { text: `任务 ${i}`, priority: ['low', 'medium', 'high'][i % 3], dueDate: i % 4 === 0 ? '2026-11-01' : null } });
  }
  const list = await call('GET', '/todos?page=1&limit=10', { token });
  check('第 1 页 10 条，total=12，totalPages=2', list.data.todos.length === 10 && list.data.total === 12 && list.data.totalPages === 2);

  console.log('7. 筛选 status=active');
  const active = await call('GET', '/todos?status=active', { token });
  check('12 条未完成', active.data.total === 12);

  console.log('8. 排序 sort=priority');
  const sorted = await call('GET', '/todos?sort=priority&order=asc&limit=3', { token });
  check('按优先级升序（high 在前）', sorted.data.todos.every((t, i, a) => i === 0 || a[i - 1].priority <= t.priority));

  console.log('9. 完成第一条任务');
  const first = sorted.data.todos[0];
  const patch = await call('PATCH', `/todos/${first.id}`, { token, body: { completed: true } });
  check('completed=true', patch.status === 200 && patch.data.completed === true);
  const completedList = await call('GET', '/todos?status=completed', { token });
  check('completed 筛选到 1 条', completedList.data.total === 1);

  console.log('10. 非法参数校验');
  const badPriority = await call('POST', '/todos', { token, body: { text: 'x', priority: 'urgent' } });
  check('非法 priority 返回 400', badPriority.status === 400);
  const badSort = await call('GET', '/todos?sort=password', { token });
  check('非法 sort 返回 400', badSort.status === 400);

  console.log('11. 用户 bob 越权访问 alice 的任务');
  await call('POST', '/auth/register', { body: { username: 'bob', password: 'secret123' } });
  const bobLogin = await call('POST', '/auth/login', { body: { username: 'bob', password: 'secret123' } });
  const cross = await call('PATCH', `/todos/${first.id}`, { token: bobLogin.data.token, body: { completed: false } });
  check('返回 404（数据隔离）', cross.status === 404);

  console.log('12. 删除任务');
  const del = await call('DELETE', `/todos/${first.id}`, { token });
  check('返回 204', del.status === 204);

  console.log('13. 健康检查');
  const health = await fetch('http://localhost:3001/health');
  check('返回 200', health.status === 200);

  console.log(`\n结果: ${passed} 通过, ${failed} 失败`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('脚本异常:', e.message); process.exit(1); });
