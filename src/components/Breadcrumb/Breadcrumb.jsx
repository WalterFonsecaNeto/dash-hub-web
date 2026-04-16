import { ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

const ROTULOS_ROTA = {
  '/dashboard': 'Dashboard',
  '/movimentacoes': 'Movimentacoes',
  '/categorias': 'Categorias',
  '/perfil': 'Perfil',
};

export function Breadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();

  const caminhoAtual = location.pathname;
  const rotuloCaminho = ROTULOS_ROTA[caminhoAtual] || caminhoAtual;

  const lidarComIrInicio = () => {
    navigate('/dashboard');
  };

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <button type="button" className={styles.link} onClick={lidarComIrInicio}>
        Inicio
      </button>

      <span className={styles.separator}>
        <ChevronRight className={styles.icon} aria-hidden="true" />
      </span>

      <span className={styles.current}>{rotuloCaminho}</span>
    </nav>
  );
}
