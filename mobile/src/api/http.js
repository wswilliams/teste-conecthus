import Constants from 'expo-constants';
import { resolveLocalhostUrl } from '../utils/network';

const configuredApiUrl =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  Constants.manifest?.extra?.apiUrl ||
  'http://localhost:3000/api';

export const API_URL = resolveLocalhostUrl(configuredApiUrl).replace(/\/$/, '');

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorFromPayload(payload) {
  if (!payload) {
    return 'Erro inesperado na API';
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (Array.isArray(payload.message)) {
    return payload.message.join(', ');
  }

  if (payload.message) {
    return String(payload.message);
  }

  if (payload.error) {
    return String(payload.error);
  }

  return 'Erro inesperado na API';
}

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      `Falha de conexao com a API (${API_URL}). Se estiver no celular fisico, confirme o IP da maquina e o backend ativo.`,
    );
  }

  const text = await response.text();
  const payload = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    throw new Error(errorFromPayload(payload));
  }

  return payload;
}
