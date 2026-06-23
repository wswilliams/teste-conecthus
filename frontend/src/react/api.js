const DEFAULT_API_URL = 'http://localhost:3000/api';
const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
const TOKEN_KEY = 'blog-token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getCurrentUserIdFromToken() {
  const token = getToken();
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);
  return payload?.user?.id || null;
}

export function authHeaders() {
  const token = getToken();
  if (!token) {
    return { 'Content-Type': 'application/json' };
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function parseResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Erro ao processar a requisição');
  }

  return data;
}

export async function login(email, password) {
  const response = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseResponse(response);

  if (!data?.access_token || data.access_token === 'Wrong Credentials') {
    throw new Error('Credenciais inválidas');
  }

  localStorage.setItem(TOKEN_KEY, data.access_token);
  return data;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export async function createUser(payload) {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function listUsers({ page = 1, limit = 10, username = '' } = {}) {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (username) {
    query.set('username', username);
  }

  const response = await fetch(`${API_URL}/users?${query.toString()}`, {
    headers: authHeaders(),
  });
  return parseResponse(response);
}

export async function updateUser(id, payload) {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function deleteUser(id) {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return parseResponse(response);
}

export async function listTasks(filters = {}) {
  const query = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  const url = queryString ? `${API_URL}/tasks?${queryString}` : `${API_URL}/tasks`;
  const response = await fetch(url);
  return parseResponse(response);
}

export async function createTask(payload) {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function updateTask(id, payload) {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function deleteTask(id) {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  return parseResponse(response);
}
