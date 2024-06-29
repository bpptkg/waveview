import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';

export interface RequireAuthProps {
  children: JSX.Element;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const location = useLocation();
  const { token } = useAuthStore();
  return token === null ? <Navigate to="/login" state={{ from: location }} replace /> : children;
};

export default RequireAuth;
