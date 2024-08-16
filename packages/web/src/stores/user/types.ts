import { User } from '../../types/user';

export interface UserStore {
  user: User | null;
  /**
   * Sets the user data.
   */
  setUser: (user: User) => void;
  /**
   * Fetches the user data from the API. It should be called after the user has
   * logged in.
   */
  fetchUser: () => Promise<void>;
  /**
   * Returns true if the user is an admin.
   */
  isAdmin(): boolean;
  /**
   * Returns true if the user is a superuser.
   */
  isSuperuser(): boolean;
}
