import styles from './Card.module.css';

export function Card({ title, value, tone = 'neutral', children }) {
  return (
    <section className={`${styles.card} ${styles[tone]}`}>
      {title && <h3 className={styles.title}>{title}</h3>}
      {value !== undefined && <p className={styles.value}>{value}</p>}
      {children}
    </section>
  );
}
