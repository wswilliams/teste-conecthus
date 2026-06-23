import { useCallback, useEffect, useRef, useState } from 'react';
import { listUsers } from './api';

export function UserSelect({ value, onChange, label = 'Usuário', required = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimer = useRef(null);
  const containerRef = useRef(null);

  const loadUsers = useCallback(
    async (query = '', pageNum = 1) => {
      setLoading(true);
      setError('');
      try {
        const data = await listUsers({
          page: pageNum,
          limit: 10,
          username: query.trim(),
        });
        setUsers(data.items || []);
        setTotalPages(data.meta?.totalPages || 1);
        setPage(data.meta?.currentPage || pageNum);
      } catch (err) {
        setError(err.message);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
    setHasSearched(true);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      loadUsers(query, 1);
    }, 300);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery('');
    setIsOpen(false);
    onChange(user.id);
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadUsers(searchQuery, nextPage);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      loadUsers(searchQuery, prevPage);
    }
  };

  const handleClear = () => {
    setSelectedUser(null);
    setSearchQuery('');
    onChange(null);
    setIsOpen(false);
  };

  useEffect(() => {
    if (value && !selectedUser) {
      const matchingUser = users.find((u) => u.id === value);
      if (matchingUser) {
        setSelectedUser(matchingUser);
      }
    }
  }, [value, users, selectedUser]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && !hasSearched) {
      loadUsers('', 1);
    }
  }, [isOpen, hasSearched, loadUsers]);

  return (
    <div className="user-select-wrapper" ref={containerRef}>
      <label>
        {label}
        {required && <span className="required">*</span>}
      </label>

      <div className="user-select-input-container">
        <input
          type="text"
          placeholder={selectedUser ? selectedUser.name : 'Buscar usuário...'}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="user-select-input"
        />

        {selectedUser && !searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="user-select-clear-btn"
            title="Limpar seleção"
          >
            ✕
          </button>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {isOpen && (
        <div className="user-select-dropdown">
          {loading && !users.length ? (
            <div className="user-select-loading">Carregando usuários...</div>
          ) : users.length === 0 ? (
            <div className="user-select-empty">
              {hasSearched
                ? 'Nenhum usuário encontrado'
                : 'Comece a digitar para buscar'}
            </div>
          ) : (
            <>
              <div className="user-select-list">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`user-select-item ${
                      selectedUser?.id === user.id ? 'selected' : ''
                    }`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="user-select-item-name">{user.name}</div>
                    <div className="user-select-item-email">{user.email}</div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="user-select-pagination">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={page === 1 || loading}
                    className="user-select-page-btn"
                  >
                    ← Anterior
                  </button>
                  <span className="user-select-page-info">
                    {page} de {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={page >= totalPages || loading}
                    className="user-select-page-btn"
                  >
                    Próxima →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {selectedUser && !searchQuery && (
        <div className="user-select-selected">
          <strong>Selecionado:</strong> {selectedUser.name} ({selectedUser.email})
        </div>
      )}
    </div>
  );
}
