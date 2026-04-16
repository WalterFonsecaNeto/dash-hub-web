import { useState } from 'react';
import { Sparkles, Target, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { Input } from '../../components/UI/Input';
import { useAppFeedback } from '../../hooks/useAppFeedback';
import { useAuth } from '../../hooks/useAuth';
import styles from './RegisterPage.module.css';

export function RegisterPage() {
  const navigate = useNavigate();
  const { registrar } = useAuth();
  const { adicionarToast } = useAppFeedback();

  const [estadoFormulario, setEstadoFormulario] = useState({
    nome: '',
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
      await registrar(estadoFormulario);
      adicionarToast({ type: 'success', message: 'Cadastro concluido. Faça login.' });
      navigate('/login', { replace: true });
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
          <span className={styles.badge}>Nova conta</span>
          <h1 className={styles.brandTitle}>Comece a construir sua rotina financeira.</h1>
          <p className={styles.brandSubtitle}>
            Cadastre-se em poucos segundos e acompanhe sua evolucao com indicadores claros e objetivos.
          </p>

          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <Target size={16} />
              Defina prioridades por categoria
            </li>
            <li className={styles.featureItem}>
              <TrendingUp size={16} />
              Entenda seus habitos com graficos
            </li>
            <li className={styles.featureItem}>
              <Sparkles size={16} />
              Experiencia fluida em desktop e mobile
            </li>
          </ul>
        </section>

        <div className={styles.formCard}>
          <Card>
            <h2 className={styles.title}>Criar cadastro</h2>
            <p className={styles.subtitle}>Preencha seus dados para entrar no DashHub.</p>

            <form className={styles.form} onSubmit={lidarComEnvio}>
              <Input label="Nome" name="nome" value={estadoFormulario.nome} onChange={lidarComMudanca} required />

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
                {submitting ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </form>

            <p className={styles.linkText}>
              Ja possui conta?{' '}
              <Link to="/login" onClick={(event) => lidarComTrocaAutenticacao(event, '/login')}>
                Entrar
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
