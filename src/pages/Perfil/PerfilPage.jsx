import { useAuth } from '../../hooks/useAuth';
import styles from './PerfilPage.module.css';

export function PerfilPage() {
  const { usuario } = useAuth();

  return (
    <section>
      <div className={styles.header}>
        <h2 className={styles.title}>Perfil</h2>
        <p className={styles.subtitle}>Informacoes da sua conta.</p>
      </div>

      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.label}>Nome</span>
          <strong className={styles.value}>{usuario?.nome || 'Sem nome'}</strong>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Email</span>
          <strong className={styles.value}>{usuario?.email || 'Sem email'}</strong>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Membro desde</span>
          <strong className={styles.value}>{usuario?.dataCriacao ? String(usuario.dataCriacao).slice(0, 10) : 'Nao informado'}</strong>
        </div>
      </div>
    </section>
  );
}
