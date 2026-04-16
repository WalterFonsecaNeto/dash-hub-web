import { useEffect, useRef, useState } from 'react';
import {
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Tags,
  User,
  Wallet,
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Breadcrumb } from '../components/Breadcrumb/Breadcrumb';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const navigate = useNavigate();
  const { sair } = useAuth();
  const [ehDesktop, setEhDesktop] = useState(() => (typeof window === 'undefined' ? true : window.innerWidth > 900));
  const [menuLateralAberto, setMenuLateralAberto] = useState(() => (typeof window === 'undefined' ? true : window.innerWidth > 900));
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);
  const menuPerfilRef = useRef(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)');

    const sincronizarLayout = () => {
      const desktop = !media.matches;
      setEhDesktop(desktop);
      setMenuLateralAberto(desktop);
    };

    sincronizarLayout();
    media.addEventListener('change', sincronizarLayout);

    return () => {
      media.removeEventListener('change', sincronizarLayout);
    };
  }, []);

  useEffect(() => {
    if (!menuPerfilAberto) {
      return undefined;
    }

    const lidarComCliqueFora = (event) => {
      if (!menuPerfilRef.current?.contains(event.target)) {
        setMenuPerfilAberto(false);
      }
    };

    const lidarComTeclaEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuPerfilAberto(false);
      }
    };

    window.addEventListener('mousedown', lidarComCliqueFora);
    window.addEventListener('keydown', lidarComTeclaEscape);

    return () => {
      window.removeEventListener('mousedown', lidarComCliqueFora);
      window.removeEventListener('keydown', lidarComTeclaEscape);
    };
  }, [menuPerfilAberto]);

  const alternarMenuPerfil = () => {
    setMenuPerfilAberto((previous) => !previous);
  };

  const visualizarPerfil = () => {
    setMenuPerfilAberto(false);
    navigate('/perfil');
  };

  const realizarLogout = () => {
    sair();
    navigate('/login', { replace: true });
  };

  const alternarMenuLateral = () => {
    setMenuLateralAberto((previous) => !previous);
  };

  const fecharMenuLateralNoMobile = () => {
    if (!ehDesktop) {
      setMenuLateralAberto(false);
    }
  };

  return (
    <div className={`${styles.shell} ${!menuLateralAberto ? styles.shellCollapsed : ''}`}>
      {!ehDesktop && menuLateralAberto && <button type="button" className={styles.backdrop} onClick={alternarMenuLateral} aria-label="Fechar menu" />}

      <aside className={`${styles.sidebar} ${menuLateralAberto ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <h1 className={styles.brand}>
          <span className={styles.brandIcon}>
            <Wallet className={styles.brandGlyph} aria-hidden="true" />
            <span className={styles.brandIconText}>DashHub</span>
          </span>
        </h1>

        <nav className={styles.menu}>
          <NavLink to="/dashboard" onClick={fecharMenuLateralNoMobile} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            <span className={styles.itemIcon}><LayoutDashboard className={styles.itemGlyph} aria-hidden="true" /></span>
            <span className={styles.itemLabel}>Dashboard</span>
          </NavLink>
          <NavLink to="/movimentacoes" onClick={fecharMenuLateralNoMobile} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            <span className={styles.itemIcon}><Wallet className={styles.itemGlyph} aria-hidden="true" /></span>
            <span className={styles.itemLabel}>Movimentacoes</span>
          </NavLink>
          <NavLink to="/categorias" onClick={fecharMenuLateralNoMobile} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            <span className={styles.itemIcon}><Tags className={styles.itemGlyph} aria-hidden="true" /></span>
            <span className={styles.itemLabel}>Categorias</span>
          </NavLink>
        </nav>

        <div className={styles.menuFooter}>
          <button type="button" className={styles.sidebarToggleBottom} onClick={alternarMenuLateral} aria-label={menuLateralAberto ? 'Recolher menu' : 'Expandir menu'}>
            {menuLateralAberto ? <ChevronsLeft className={styles.toggleGlyph} aria-hidden="true" /> : <ChevronsRight className={styles.toggleGlyph} aria-hidden="true" />}
          </button>
        </div>
      </aside>

      <div className={styles.contentArea}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            {!ehDesktop && (
              <button type="button" className={styles.menuToggle} onClick={alternarMenuLateral} aria-label={menuLateralAberto ? 'Recolher menu' : 'Expandir menu'}>
                {menuLateralAberto ? <PanelLeftClose className={styles.menuToggleGlyph} aria-hidden="true" /> : <PanelLeftOpen className={styles.menuToggleGlyph} aria-hidden="true" />}
              </button>
            )}

            <Breadcrumb />
          </div>

          <div className={styles.profileMenuWrapper} ref={menuPerfilRef}>
            <button type="button" className={styles.profileButton} onClick={alternarMenuPerfil} aria-label="Ver perfil" aria-expanded={menuPerfilAberto}>
              <User className={styles.menuToggleGlyph} aria-hidden="true" />
            </button>

            {menuPerfilAberto && (
              <div className={styles.profileDropdown} role="dialog" aria-label="Perfil">
                <div className={styles.profileMenuContent}>
                  <button type="button" className={styles.profileActionButton} onClick={visualizarPerfil}>
                    Ver perfil
                  </button>

                  <button type="button" className={`${styles.profileActionButton} ${styles.profileActionDanger}`} onClick={realizarLogout}>
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>

    </div>
  );
}
