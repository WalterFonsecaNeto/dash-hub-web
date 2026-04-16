import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../UI/Button';
import styles from './MonthFilter.module.css';

const ajustarMes = (valorMes, deslocamento) => {
  const [ano, mes] = String(valorMes || '').split('-').map(Number);

  if (!ano || !mes) {
    return valorMes;
  }

  const data = new Date(ano, mes - 1 + deslocamento, 1);
  const proximoAno = data.getFullYear();
  const proximoMes = String(data.getMonth() + 1).padStart(2, '0');

  return `${proximoAno}-${proximoMes}`;
};

export function MonthFilter({ value, onChange, onResetToCurrent, disabled = false }) {
  const irParaMesAnterior = () => {
    onChange(ajustarMes(value, -1));
  };

  const irParaProximoMes = () => {
    onChange(ajustarMes(value, 1));
  };

  return (
    <div className={styles.wrapper}>
      <label className={styles.field}>
        <span className={styles.label}>Selecionar mes</span>
        <div className={styles.monthControl}>
          <button
            type="button"
            className={styles.navButton}
            onClick={irParaMesAnterior}
            disabled={disabled}
            aria-label="Mes anterior"
            title="Mes anterior"
          >
            <ChevronLeft size={16} />
          </button>

          <div className={styles.inputWrap}>
            <input
              className={styles.input}
              type="month"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              disabled={disabled}
            />
          </div>

          <button
            type="button"
            className={styles.navButton}
            onClick={irParaProximoMes}
            disabled={disabled}
            aria-label="Proximo mes"
            title="Proximo mes"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </label>

      <Button variant="secondary" onClick={onResetToCurrent} disabled={disabled}>
        Hoje
      </Button>
    </div>
  );
}
