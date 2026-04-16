import { Spinner } from './components/UI/Spinner';
import { ToastContainer } from './components/UI/ToastContainer';
import { AppFeedbackProvider } from './contexts/AppFeedbackProvider';
import { AuthProvider } from './contexts/AuthProvider';
import { useAppFeedback } from './hooks/useAppFeedback';
import { AppRoutes } from './routes/AppRoutes';

function ConteudoApp() {
  const {
    estaCarregando,
    notificacoes,
    removerToast,
  } = useAppFeedback();

  return (
    <>
      <AppRoutes />
      <Spinner visible={estaCarregando} />
      <ToastContainer toasts={notificacoes} onClose={removerToast} />
    </>
  );
}

function App() {
  return (
    <AppFeedbackProvider>
      <AuthProvider>
        <ConteudoApp />
      </AuthProvider>
    </AppFeedbackProvider>
  );
}

export default App;
