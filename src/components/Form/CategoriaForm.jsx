import { useEffect, useState } from 'react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import styles from './CategoriaForm.module.css';

const estadoPadrao = {
  nome: '',
  tipo: 'RECEITA',
};

export function CategoriaForm({ initialData, onSubmit, onCancel, submitting }) {
  const [estadoFormulario, setEstadoFormulario] = useState(estadoPadrao);

  useEffect(() => {
    if (initialData) {
      setEstadoFormulario({
        nome: initialData.nome ?? '',
        tipo: initialData.tipo ?? 'RECEITA',
      });
      return;
    }

    setEstadoFormulario(estadoPadrao);
  }, [initialData]);

  const atualizarCampo = (event) => {
    const { name, value } = event.target;
    setEstadoFormulario((previous) => ({ ...previous, [name]: value }));
  };

  const lidarComEnvio = (event) => {
    event.preventDefault();
    onSubmit(estadoFormulario);
  };

  return (
    <form className={styles.form} onSubmit={lidarComEnvio}>
      <Input label="Nome" name="nome" value={estadoFormulario.nome} onChange={atualizarCampo} required />

      <label className={styles.field}>
        <span className={styles.label}>Tipo</span>
        <select name="tipo" value={estadoFormulario.tipo} onChange={atualizarCampo} className={styles.select}>
          <option value="RECEITA">RECEITA</option>
          <option value="DESPESA">DESPESA</option>
        </select>
      </label>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</Button>
      </div>
    </form>
  );
}
