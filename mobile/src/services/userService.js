import { apiRequest } from '../api/http';

export function listUsersForSelect(token) {
  return apiRequest('/users/select', {
    token,
  });
}