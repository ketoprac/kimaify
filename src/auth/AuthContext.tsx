import { createContext, useCallback, useEffect, useReducer, type ReactNode } from 'react';
import { getUserInfo } from '../api/users';
import type { UserInfo } from '../types';

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; token: string; user: UserInfo }
  | { type: 'LOGIN_FAILURE'; error: string }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_TOKEN'; token: string };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { token: action.token, user: action.user, loading: false, error: null };
    case 'LOGIN_FAILURE':
      return { token: null, user: null, loading: false, error: action.error };
    case 'LOGOUT':
      return { token: null, user: null, loading: false, error: null };
    case 'RESTORE_TOKEN':
      return { ...state, token: action.token };
    default:
      return state;
  }
}

export interface AuthContextValue extends AuthState {
  login: (token: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'kimaify_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    token: null,
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      getUserInfo(saved)
        .then((user) => {
          dispatch({ type: 'LOGIN_SUCCESS', token: saved, user });
        })
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
          dispatch({ type: 'LOGIN_FAILURE', error: 'Token expired or invalid' });
        });
    } else {
      dispatch({ type: 'LOGIN_FAILURE', error: '' });
    }
  }, []);

  const login = useCallback(async (token: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const user = await getUserInfo(token);
      localStorage.setItem(TOKEN_KEY, token);
      dispatch({ type: 'LOGIN_SUCCESS', token, user });
    } catch {
      dispatch({ type: 'LOGIN_FAILURE', error: 'Your Kimai token is invalid or expired. Please sign in again.' });
      throw new Error('Invalid token');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    dispatch({ type: 'LOGOUT' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
