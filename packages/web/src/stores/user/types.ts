import { User } from '../../types/user';

export interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  fetchUser: () => Promise<void>;
  isAdmin(): boolean;
  isSuperuser(): boolean;
}
