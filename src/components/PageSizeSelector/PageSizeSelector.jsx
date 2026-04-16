import styles from './PageSizeSelector.module.css';

export function PageSizeSelector({ value, onChange, disabled = false, options = [5, 10, 20], label = 'Itens por pagina' }) {
  return (
    <label className={styles.wrapper}>
      <span className={styles.label}>{label}</span>
      <select className={styles.select} value={value} onChange={(event) => onChange(Number(event.target.value))} disabled={disabled}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
