import { apiRequest } from '../api/http';

export async function loginWithEmail(email, password) {
  const response = await apiRequest('/users/login', {
    method: 'POST',
    body: { email, password },
  });

  if (!response?.access_token || response.access_token === 'Wrong Credentials') {
    throw new Error('Credenciais invalidas');
  }

  return response.access_token;
}

export function registerUser({ name, username, email, password }) {
  return apiRequest('/users', {
    method: 'POST',
    body: { name, username, email, password },
  });
}
