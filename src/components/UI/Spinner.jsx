import styles from './Spinner.module.css';

export function Spinner({ visible }) {
  if (!visible) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.spinner} />
    </div>
  );
}
