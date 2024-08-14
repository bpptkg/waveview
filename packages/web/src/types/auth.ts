export interface JwtToken {
  access: string;
  refresh: string;
}

export interface AuthCredentials {
  username: string;
  password: string;
}
