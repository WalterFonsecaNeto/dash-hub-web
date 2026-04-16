import { useCallback, useEffect, useMemo, useState } from 'react';
import { inscreverCarregamento, registrarManipuladorErroGlobal } from '../api/api';
import { AppFeedbackContext } from './appFeedbackContext';

export function AppFeedbackProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const removerToast = useCallback((id) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const adicionarToast = useCallback(({ type = 'success', message }) => {
    const id = Date.now() + Math.random();

    setToasts((previous) => [...previous, { id, type, message }]);

    window.setTimeout(() => {
      removerToast(id);
    }, 3500);
  }, [removerToast]);

  useEffect(() => {
    const cancelarInscricaoCarregamento = inscreverCarregamento(setIsLoading);
    const cancelarInscricaoErro = registrarManipuladorErroGlobal((message) => {
      adicionarToast({ type: 'error', message });
    });

    return () => {
      cancelarInscricaoCarregamento();
      cancelarInscricaoErro();
    };
  }, [adicionarToast]);

  const value = useMemo(() => ({
    estaCarregando: isLoading,
    notificacoes: toasts,
    adicionarToast,
    removerToast,
  }), [adicionarToast, isLoading, removerToast, toasts]);

  return (
    <AppFeedbackContext.Provider value={value}>
      {children}
    </AppFeedbackContext.Provider>
  );
}
