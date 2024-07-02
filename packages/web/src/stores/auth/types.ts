export interface JwtToken {
  access: string;
  refresh: string;
}

export interface AuthStore {
  token: JwtToken | null;
  setToken: (token: JwtToken) => void;
  clearToken: () => void;
}
