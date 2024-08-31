export interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
}

export interface UserDetail extends User {
  email: string;
  phone_number: string;
  bio: string;
  date_joined: string;
  is_staff: boolean;
  is_superuser: boolean;
  permissions: string[];
}
