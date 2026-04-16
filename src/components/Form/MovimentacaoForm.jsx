import { useEffect, useState } from 'react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import styles from './MovimentacaoForm.module.css';

const estadoPadrao = {
  descricao: '',
  valor: '',
  tipo: 'RECEITA',
  categoriaId: '',
  tipoTransacao: 'UNICA',
  quantidadeParcelas: '',
  diaVencimento: '',
  dataInicio: '',
  dataFim: '',
  statusPagamento: 'PENDENTE',
  dataPagamento: '',
};

const formatarParaDatetimeLocal = (valor) => {
  if (!valor) {
    return '';
  }

  const texto = String(valor);

  if (texto.length >= 16) {
    return texto.slice(0, 16);
  }

  if (texto.length === 10) {
    return `${texto}T00:00`;
  }

  return texto;
};

export function MovimentacaoForm({ initialData, categorias, onSubmit, onCancel, submitting }) {
  const [estadoFormulario, setEstadoFormulario] = useState(estadoPadrao);

  const categoriasFiltradasPorTipo = categorias.filter((categoria) => {
    return String(categoria.tipo || '').toUpperCase() === String(estadoFormulario.tipo || '').toUpperCase();
  });

  useEffect(() => {
    if (initialData) {
      setEstadoFormulario({
        descricao: initialData.descricao ?? '',
        valor: initialData.valor ?? '',
        tipo: initialData.tipo ?? 'RECEITA',
        categoriaId: initialData.categoriaId ? String(initialData.categoriaId) : '',
        tipoTransacao: initialData.tipoTransacao ?? 'UNICA',
        quantidadeParcelas: initialData.quantidadeParcelas ? String(initialData.quantidadeParcelas) : '',
        diaVencimento: initialData.diaVencimento ? String(initialData.diaVencimento) : '',
        dataInicio: (initialData.dataInicio || initialData.dataMovimentacao)
          ? String(initialData.dataInicio || initialData.dataMovimentacao).slice(0, 10)
          : '',
        dataFim: initialData.dataFim
          ? String(initialData.dataFim).slice(0, 10)
          : '',
        statusPagamento: initialData.statusPagamento ?? 'PENDENTE',
        dataPagamento: formatarParaDatetimeLocal(initialData.dataPagamento),
      });
      return;
    }

    setEstadoFormulario(estadoPadrao);
  }, [initialData]);

  useEffect(() => {
    if (!estadoFormulario.categoriaId) {
      return;
    }

    const categoriaAindaValida = categoriasFiltradasPorTipo.some(
      (categoria) => String(categoria.id) === String(estadoFormulario.categoriaId),
    );

    if (!categoriaAindaValida) {
      setEstadoFormulario((previous) => ({ ...previous, categoriaId: '' }));
    }
  }, [categoriasFiltradasPorTipo, estadoFormulario.categoriaId]);

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
      <Input
        label="Descricao"
        name="descricao"
        value={estadoFormulario.descricao}
        onChange={atualizarCampo}
        required
      />
      <Input
        label="Valor"
        name="valor"
        type="number"
        min="0"
        step="0.01"
        value={estadoFormulario.valor}
        onChange={atualizarCampo}
        required
      />

      <label className={styles.field}>
        <span className={styles.label}>Tipo</span>
        <select name="tipo" value={estadoFormulario.tipo} onChange={atualizarCampo} className={styles.select}>
          <option value="RECEITA">RECEITA</option>
          <option value="DESPESA">DESPESA</option>
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Categoria</span>
        <select
          name="categoriaId"
          value={estadoFormulario.categoriaId}
          onChange={atualizarCampo}
          className={styles.select}
          required
        >
          <option value="">Selecione...</option>
          {categoriasFiltradasPorTipo.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome} ({categoria.tipo})
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Tipo de transacao</span>
        <select name="tipoTransacao" value={estadoFormulario.tipoTransacao} onChange={atualizarCampo} className={styles.select}>
          <option value="UNICA">UNICA</option>
          <option value="PARCELADA">PARCELADA</option>
          <option value="RECORRENTE">RECORRENTE</option>
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Status de pagamento</span>
        <select name="statusPagamento" value={estadoFormulario.statusPagamento} onChange={atualizarCampo} className={styles.select}>
          <option value="PENDENTE">PENDENTE</option>
          <option value="PAGO">PAGO</option>
          <option value="ATRASADO">ATRASADO</option>
          <option value="CANCELADO">CANCELADO</option>
        </select>
      </label>

      <Input
        label="Data de pagamento (opcional)"
        name="dataPagamento"
        type="datetime-local"
        value={estadoFormulario.dataPagamento}
        onChange={atualizarCampo}
      />

      {estadoFormulario.tipoTransacao === 'PARCELADA' && (
        <Input
          label="Quantidade de parcelas"
          name="quantidadeParcelas"
          type="number"
          min="2"
          step="1"
          value={estadoFormulario.quantidadeParcelas}
          onChange={atualizarCampo}
          required
        />
      )}

      {estadoFormulario.tipoTransacao === 'RECORRENTE' && (
        <div className={styles.gridFields}>
          <Input
            label="Dia de vencimento"
            name="diaVencimento"
            type="number"
            min="1"
            max="31"
            step="1"
            value={estadoFormulario.diaVencimento}
            onChange={atualizarCampo}
            required
          />

          <Input
            label="Data fim (opcional)"
            name="dataFim"
            type="date"
            value={estadoFormulario.dataFim}
            onChange={atualizarCampo}
          />
        </div>
      )}

      <Input
        label="Data inicio"
        name="dataInicio"
        type="date"
        value={estadoFormulario.dataInicio}
        onChange={atualizarCampo}
        required
      />

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</Button>
      </div>
    </form>
  );
}
