import { AuthCredentials, JwtToken } from '../../types/auth';

export interface AuthStore {
  token: JwtToken | null;
  setToken: (token: JwtToken) => void;
  clearToken: () => void;
  fetchToken: (credentials: AuthCredentials) => Promise<void>;
  refreshToken: () => Promise<void>;
  blacklistToken: () => Promise<void>;
  hasToken: () => boolean;
}
