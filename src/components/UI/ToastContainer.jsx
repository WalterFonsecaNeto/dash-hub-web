import styles from './ToastContainer.module.css';

export function ToastContainer({ toasts, onClose }) {
  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          <span>{toast.message}</span>
          <button type="button" onClick={() => onClose(toast.id)} className={styles.closeButton}>
            x
          </button>
        </div>
      ))}
    </div>
  );
}
