import { useContext } from 'react';
import { AuthContext } from '../contexts/authContext';

export const useAuth = () => {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro do AuthProvider.');
  }

  return contexto;
};
