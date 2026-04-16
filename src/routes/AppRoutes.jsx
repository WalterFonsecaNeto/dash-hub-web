import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppLayout } from '../layouts/AppLayout';
import { CategoriasPage } from '../pages/Categorias/CategoriasPage';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { LoginPage } from '../pages/Login/LoginPage';
import { MovimentacoesPage } from '../pages/Movimentacoes/MovimentacoesPage';
import { PerfilPage } from '../pages/Perfil/PerfilPage';
import { RegisterPage } from '../pages/Register/RegisterPage';
import { ProtectedRoute } from './ProtectedRoute';

function RedirecionamentoPorAutenticacao() {
  const { estaAutenticado } = useAuth();
  return <Navigate to={estaAutenticado ? '/dashboard' : '/login'} replace />;
}

function RotaVisitante({ children }) {
  const { estaAutenticado } = useAuth();

  if (estaAutenticado) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RedirecionamentoPorAutenticacao />} />

        <Route
          path="/login"
          element={(
            <RotaVisitante>
              <LoginPage />
            </RotaVisitante>
          )}
        />

        <Route
          path="/register"
          element={(
            <RotaVisitante>
              <RegisterPage />
            </RotaVisitante>
          )}
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/movimentacoes" element={<MovimentacoesPage />} />
            <Route path="/categorias" element={<CategoriasPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
