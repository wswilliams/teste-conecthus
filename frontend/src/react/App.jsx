import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { createTask, createUser, deleteTask, deleteUser, getCurrentUserIdFromToken, isAuthenticated, listTasks, listUsers, login, logout, updateTask, updateUser } from './api';
import { AuthProvider, useAuth } from './AuthContext';
import { UserSelect } from './UserSelect';
import { TASK_STATUS_OPTIONS } from './types';

function ProtectedRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth();
  if (isLoading) {
    return <div className="loading-shell"><p>Carregando...</p></div>;
  }
  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function LoginPage({ onSuccess, onRegisterClick }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Conecthus</p>
        <h1>Acesse o painel</h1>
        <p className="subtitle">Gerencie login, usuarios e tarefas da API em uma unica interface.</p>
        <form onSubmit={handleSubmit} className="grid gap">
          <label>
            E-mail
            <input required type="email" placeholder="voce@empresa.com" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
          </label>
          <label>
            Senha
            <input required type="password" placeholder="Sua senha" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} />
          </label>
          {error && <p className="error">{error}</p>}
          <button disabled={loading} type="submit" className="btn primary">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <button type="button" className="btn" onClick={onRegisterClick}>
            Criar nova conta
          </button>
        </form>
      </section>
    </main>
  );
}

function RegisterPage({ onSuccess, onBackToLogin }) {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await createUser(form);
      setSuccess('Usuário criado com sucesso! Voltando ao login...');
      setForm({ name: '', username: '', email: '', password: '' });
      setTimeout(() => {
        onBackToLogin?.();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Conecthus</p>
        <h1>Criar nova conta</h1>
        <p className="subtitle">Preencha os dados abaixo para criar uma nova conta.</p>
        <form onSubmit={handleSubmit} className="grid gap">
          <label>
            Nome completo
            <input required type="text" placeholder="Seu nome" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          </label>
          <label>
            Nome de usuário
            <input required type="text" placeholder="seu_usuario" value={form.username} onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))} />
          </label>
          <label>
            E-mail
            <input required type="email" placeholder="voce@empresa.com" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
          </label>
          <label>
            Senha (mínimo 3 caracteres)
            <input required type="password" placeholder="Sua senha" minLength={3} value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} />
          </label>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <button disabled={loading} type="submit" className="btn primary">
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
          <button type="button" className="btn" onClick={onBackToLogin}>
            Voltar ao login
          </button>
        </form>
      </section>
    </main>
  );
}

function AuthGatePage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  return (
    <>
      {showRegister ? (
        <RegisterPage onSuccess={() => { navigate('/auth', { replace: true }); }} onBackToLogin={() => setShowRegister(false)} />
      ) : (
        <LoginPage onSuccess={() => { authLogin(); navigate('/dashboard', { replace: true }); }} onRegisterClick={() => setShowRegister(true)} />
      )}
    </>
  );
}

function RegisterUserForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createUser(form);
      setForm({ name: '', username: '', email: '', password: '' });
      onCreated('Usuario criado com sucesso');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="panel" onSubmit={submit}>
      <div className="panel-header">
        <h2>Novo usuario</h2>
      </div>
      <div className="form-grid">
        <label>
          Nome
          <input required value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
        </label>
        <label>
          Usuario
          <input required value={form.username} onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))} />
        </label>
        <label>
          E-mail
          <input required type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
        </label>
        <label>
          Senha
          <input required type="password" minLength={3} value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} />
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      <button className="btn primary" type="submit" disabled={loading}>
        {loading ? 'Criando...' : 'Criar usuario'}
      </button>
    </form>
  );
}

function UsersCrud() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({ name: '', username: '' });

  const loadUsers = async (nextPage = page, nextFilter = filter) => {
    setLoading(true);
    setError('');
    try {
      const data = await listUsers({ page: nextPage, limit, username: nextFilter.trim() });
      setUsers(data.items || []);
      setTotalPages(data.meta?.totalPages || 1);
      setPage(data.meta?.currentPage || nextPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1, filter);
  }, []);

  const onFilterSubmit = (event) => {
    event.preventDefault();
    loadUsers(1, filter);
  };

  const beginEdit = (user) => {
    setEditingId(user.id);
    setEditingForm({ name: user.name || '', username: user.username || '' });
  };

  const saveEdit = async (id) => {
    try {
      await updateUser(id, editingForm);
      setEditingId(null);
      setMessage('Usuario atualizado com sucesso');
      loadUsers(page, filter);
    } catch (err) {
      setError(err.message);
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm('Deseja realmente excluir este usuario?')) {
      return;
    }
    try {
      await deleteUser(id);
      setMessage('Usuario excluido com sucesso');
      loadUsers(page, filter);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="grid gap-lg">
      <RegisterUserForm onCreated={(msg) => { setMessage(msg); loadUsers(page, filter); }} />

      <div className="panel">
        <div className="panel-header stack-mobile">
          <h2>Usuarios</h2>
          <form className="inline-form" onSubmit={onFilterSubmit}>
            <input placeholder="Filtrar por username" value={filter} onChange={(event) => setFilter(event.target.value)} />
            <button className="btn" type="submit">Filtrar</button>
          </form>
        </div>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Usuario</th>
                <th>E-mail</th>
                <th>Role</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6}>Carregando usuarios...</td>
                </tr>
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={6}>Nenhum usuario encontrado.</td>
                </tr>
              )}
              {!loading &&
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      {editingId === user.id ? (
                        <input value={editingForm.name} onChange={(event) => setEditingForm((prev) => ({ ...prev, name: event.target.value }))} />
                      ) : (
                        user.name
                      )}
                    </td>
                    <td>
                      {editingId === user.id ? (
                        <input value={editingForm.username} onChange={(event) => setEditingForm((prev) => ({ ...prev, username: event.target.value }))} />
                      ) : (
                        user.username
                      )}
                    </td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td className="actions">
                      {editingId === user.id ? (
                        <>
                          <button className="btn primary" type="button" onClick={() => saveEdit(user.id)}>
                            Salvar
                          </button>
                          <button className="btn" type="button" onClick={() => setEditingId(null)}>
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn" type="button" onClick={() => beginEdit(user)}>
                            Editar
                          </button>
                          <button className="btn danger" type="button" onClick={() => removeUser(user.id)}>
                            Excluir
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button className="btn" type="button" disabled={page <= 1} onClick={() => loadUsers(page - 1, filter)}>
            Anterior
          </button>
          <span>
            Pagina {page} de {totalPages}
          </span>
          <button className="btn" type="button" disabled={page >= totalPages} onClick={() => loadUsers(page + 1, filter)}>
            Proxima
          </button>
        </div>
      </div>
    </section>
  );
}

function TasksCrud() {
  const currentUserId = useMemo(() => getCurrentUserIdFromToken(), []);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ status: '', title: '', dateFrom: '', dateTo: '' });
  const [form, setForm] = useState({ title: '', description: '', status: 'PENDING', userId: currentUserId || '' });
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({ title: '', description: '', status: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadTasks = async (nextFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const data = await listTasks(nextFilters);
      setTasks(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const create = async (event) => {
    event.preventDefault();
    setError('');
    if (!Number(form.userId)) {
      setError('Informe um userId valido para criar a task.');
      return;
    }
    try {
      await createTask({ ...form, userId: Number(form.userId) });
      setMessage('Task criada com sucesso');
      setForm({ title: '', description: '', status: 'PENDING', userId: currentUserId || '' });
      loadTasks(filters);
    } catch (err) {
      setError(err.message);
    }
  };

  const applyFilters = (event) => {
    event.preventDefault();
    loadTasks(filters);
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditingForm({ title: task.title || '', description: task.description || '', status: task.status || TASK_STATUS_OPTIONS[0] });
  };

  const saveEdit = async (id) => {
    try {
      await updateTask(id, editingForm);
      setEditingId(null);
      setMessage('Task atualizada com sucesso');
      loadTasks(filters);
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Deseja excluir esta task?')) {
      return;
    }
    try {
      await deleteTask(id);
      setMessage('Task excluida com sucesso');
      loadTasks(filters);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="grid gap-lg">
      <form className="panel" onSubmit={create}>
        <div className="panel-header">
          <h2>Nova task</h2>
        </div>
        <div className="form-grid">
          <label>
            Titulo
            <input required value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
              {TASK_STATUS_OPTIONS.map((option) => (
                <option value={option} key={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <UserSelect value={form.userId} onChange={(userId) => setForm((prev) => ({ ...prev, userId }))} label="Usuário" required />
          <label className="full-width">
            Descricao
            <textarea required rows={3} value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          </label>
        </div>
        <button className="btn primary" type="submit">
          Criar task
        </button>
      </form>

      <div className="panel">
        <div className="panel-header stack-mobile">
          <h2>Tasks</h2>
          <form className="filters" onSubmit={applyFilters}>
            <input placeholder="Titulo" value={filters.title} onChange={(event) => setFilters((prev) => ({ ...prev, title: event.target.value }))} />
            <select value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>
              <option value="">Todos status</option>
              {TASK_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input type="date" value={filters.dateFrom} onChange={(event) => setFilters((prev) => ({ ...prev, dateFrom: event.target.value }))} />
            <input type="date" value={filters.dateTo} onChange={(event) => setFilters((prev) => ({ ...prev, dateTo: event.target.value }))} />
            <button className="btn" type="submit">Aplicar</button>
          </form>
        </div>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Titulo</th>
                <th>Status</th>
                <th>User</th>
                <th>Criada em</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6}>Carregando tasks...</td>
                </tr>
              )}
              {!loading && tasks.length === 0 && (
                <tr>
                  <td colSpan={6}>Nenhuma task encontrada.</td>
                </tr>
              )}
              {!loading &&
                tasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.id}</td>
                    <td>
                      {editingId === task.id ? (
                        <input value={editingForm.title} onChange={(event) => setEditingForm((prev) => ({ ...prev, title: event.target.value }))} />
                      ) : (
                        task.title
                      )}
                    </td>
                    <td>
                      {editingId === task.id ? (
                        <select value={editingForm.status} onChange={(event) => setEditingForm((prev) => ({ ...prev, status: event.target.value }))}>
                          {TASK_STATUS_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        task.status
                      )}
                    </td>
                    <td>{task.userId}</td>
                    <td>{task.createat ? new Date(task.createat).toLocaleString('pt-BR') : '-'}</td>
                    <td className="actions">
                      {editingId === task.id ? (
                        <>
                          <button className="btn primary" type="button" onClick={() => saveEdit(task.id)}>
                            Salvar
                          </button>
                          <button className="btn" type="button" onClick={() => setEditingId(null)}>
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn" type="button" onClick={() => startEdit(task)}>
                            Editar
                          </button>
                          <button className="btn danger" type="button" onClick={() => remove(task.id)}>
                            Excluir
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function DashboardPage() {
  const { logout: logoutAuth } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');

  const handleLogout = () => {
    logoutAuth();
    navigate('/auth', { replace: true });
  };

  return (
    <main className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Painel Administrativo</p>
          <h1>Controle completo da API</h1>
          <p className="subtitle">
            Visualize e gerencie usuarios e tarefas em um layout responsivo para desktop e mobile.
          </p>
        </div>
        <button className="btn danger" type="button" onClick={handleLogout}>
          Sair
        </button>
      </header>

      <nav className="tabs">
        <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          Usuarios
        </button>
        <button className={`tab ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
          Tasks
        </button>
      </nav>

      {activeTab === 'users' ? <UsersCrud /> : <TasksCrud />}
    </main>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthGatePage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
