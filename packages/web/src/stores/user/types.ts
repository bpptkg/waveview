import { UserDetail } from '../../types/user';

export interface UserStore {
  user: UserDetail | null;
  /**
   * Sets the user data.
   */
  setUser: (user: UserDetail) => void;
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
  /**
   * Returns true if the user has the specified permission.
   */
  hasPermission(permission: string): boolean;
}
