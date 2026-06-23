import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loginWithEmail, registerUser } from '../services/authService';
import { decodeJwt } from '../utils/jwt';

const AuthContext = createContext(null);

const STORAGE_TOKEN_KEY = 'conecthus:token';
const STORAGE_USER_KEY = 'conecthus:user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(STORAGE_TOKEN_KEY),
          AsyncStorage.getItem(STORAGE_USER_KEY),
        ]);

        if (storedToken) {
          setToken(storedToken);
        }

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else if (storedToken) {
          const payload = decodeJwt(storedToken);
          if (payload?.user) {
            setUser(payload.user);
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    bootstrap();
  }, []);

  const login = useCallback(async (email, password) => {
    const accessToken = await loginWithEmail(email, password);
    const payload = decodeJwt(accessToken);
    const tokenUser = payload?.user || null;

    await AsyncStorage.multiSet([
      [STORAGE_TOKEN_KEY, accessToken],
      [STORAGE_USER_KEY, JSON.stringify(tokenUser || {})],
    ]);

    setToken(accessToken);
    setUser(tokenUser);
  }, []);

  const register = useCallback(async (data) => {
    await registerUser(data);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([STORAGE_TOKEN_KEY, STORAGE_USER_KEY]);
    setToken('');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      userId: user?.id,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      logout,
      register,
    }),
    [token, user, isLoading, login, logout, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider');
  }

  return context;
}
