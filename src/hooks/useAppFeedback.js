import { useContext } from 'react';
import { AppFeedbackContext } from '../contexts/appFeedbackContext';

export const useAppFeedback = () => {
  const contexto = useContext(AppFeedbackContext);

  if (!contexto) {
    throw new Error('useAppFeedback deve ser usado dentro do AppFeedbackProvider.');
  }

  return contexto;
};
