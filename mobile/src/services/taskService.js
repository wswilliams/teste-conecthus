import { apiRequest } from '../api/http';

export function listTasks(filters = {}) {
  const search = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  const path = query ? `/tasks?${query}` : '/tasks';

  return apiRequest(path);
}

export function getTaskById(id) {
  return apiRequest(`/tasks/${id}`);
}

export function createTask(task) {
  return apiRequest('/tasks', {
    method: 'POST',
    body: task,
  });
}

export function updateTask(id, task) {
  return apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: task,
  });
}

export function deleteTask(id) {
  return apiRequest(`/tasks/${id}`, {
    method: 'DELETE',
  });
}
