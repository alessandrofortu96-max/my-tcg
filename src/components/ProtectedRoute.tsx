import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockAuth } from '@/lib/mockAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!mockAuth.isAuthenticated()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Se non autenticato, non renderizzare nulla (il redirect è in corso)
  if (!mockAuth.isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
