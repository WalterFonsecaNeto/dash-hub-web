import { useState } from 'react';
import { ChartNoAxesCombined, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { Input } from '../../components/UI/Input';
import { useAppFeedback } from '../../hooks/useAppFeedback';
import { useAuth } from '../../hooks/useAuth';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { entrar } = useAuth();
  const { adicionarToast } = useAppFeedback();

  const [estadoFormulario, setEstadoFormulario] = useState({
    email: '',
    senha: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const lidarComMudanca = (event) => {
    const { name, value } = event.target;
    setEstadoFormulario((previous) => ({ ...previous, [name]: value }));
  };

  const lidarComEnvio = async (event) => {
    event.preventDefault();

    setSubmitting(true);

    try {
      await entrar(estadoFormulario);
      adicionarToast({ type: 'success', message: 'Login realizado com sucesso.' });
      navigate('/dashboard', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const lidarComTrocaAutenticacao = (event, destino) => {
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.altKey
      || event.ctrlKey
      || event.shiftKey
    ) {
      return;
    }

    event.preventDefault();

    if (typeof document !== 'undefined' && typeof document.startViewTransition === 'function') {
      document.startViewTransition(() => {
        navigate(destino);
      });
      return;
    }

    navigate(destino);
  };

  return (
    <div className={styles.page}>
      <span className={`${styles.orb} ${styles.orbOne}`} aria-hidden="true" />
      <span className={`${styles.orb} ${styles.orbTwo}`} aria-hidden="true" />
      <span className={`${styles.orb} ${styles.orbThree}`} aria-hidden="true" />

      <div className={styles.layout}>
        <section className={styles.brandPanel}>
          <span className={styles.badge}>DashHub</span>
          <h1 className={styles.brandTitle}>Financas organizadas com clareza e ritmo.</h1>
          <p className={styles.brandSubtitle}>
            Tenha uma visão completa de receitas, despesas e recorrencias em uma experiencia simples e elegante.
          </p>

          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <ChartNoAxesCombined size={16} />
              Dashboard com leitura rapida
            </li>
            <li className={styles.featureItem}>
              <ShieldCheck size={16} />
              Dados protegidos e acesso seguro
            </li>
            <li className={styles.featureItem}>
              <LockKeyhole size={16} />
              Controle total das suas movimentacoes
            </li>
          </ul>
        </section>

        <div className={styles.formCard}>
          <Card>
            <h2 className={styles.title}>Entrar</h2>
            <p className={styles.subtitle}>Acesse seu painel financeiro.</p>

            <form className={styles.form} onSubmit={lidarComEnvio}>
              <Input
                label="Email"
                name="email"
                type="email"
                value={estadoFormulario.email}
                onChange={lidarComMudanca}
                required
              />

              <Input
                label="Senha"
                name="senha"
                type="password"
                value={estadoFormulario.senha}
                onChange={lidarComMudanca}
                required
              />

              <Button type="submit" fullWidth disabled={submitting}>
                {submitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <p className={styles.linkText}>
              Nao tem conta?{' '}
              <Link to="/register" onClick={(event) => lidarComTrocaAutenticacao(event, '/register')}>
                Criar cadastro
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
