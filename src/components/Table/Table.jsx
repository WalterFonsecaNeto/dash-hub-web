import styles from './Table.module.css';

export function Table({ columns, data, emptyMessage = 'Nenhum registro encontrado.', maxHeight, height }) {
  const estiloContainer = {
    ...(maxHeight ? { maxHeight } : {}),
    ...(height ? { height } : {}),
  };

  return (
    <div className={styles.wrapper} style={estiloContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.emptyCell}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
