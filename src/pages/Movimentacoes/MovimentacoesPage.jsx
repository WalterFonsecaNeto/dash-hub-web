import { useCallback, useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  atualizarMovimentacao,
  atualizarStatusMovimentacao,
  buscarMovimentacoes,
  criarMovimentacao,
  removerMovimentacao,
  removerMovimentacoesPorTransacao,
} from '../../api/movimentacoesService';
import { buscarResumoDashboard } from '../../api/dashboardService';
import { buscarCategorias } from '../../api/categoriasService';
import { MovimentacaoForm } from '../../components/Form/MovimentacaoForm';
import { MonthFilter } from '../../components/MonthFilter/MonthFilter';
import { Modal } from '../../components/Modal/Modal';
import { Table } from '../../components/Table/Table';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { useAppFeedback } from '../../hooks/useAppFeedback';
import { formatarData, formatarMoeda } from '../../hooks/useFormatters';
import styles from './MovimentacoesPage.module.css';

const obterMesAtual = () => {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  return `${hoje.getFullYear()}-${mes}`;
};

const obterIntervaloDatasPorMes = (valorMes) => {
  const [ano, mes] = String(valorMes || '').split('-').map(Number);

  if (!ano || !mes) {
    return {
      dataInicio: '',
      dataFim: '',
    };
  }

  const ultimoDia = new Date(ano, mes, 0).getDate();

  return {
    dataInicio: `${valorMes}-01`,
    dataFim: `${valorMes}-${String(ultimoDia).padStart(2, '0')}`,
  };
};

const ehMesAtual = (valorMes) => valorMes === obterMesAtual();

const obterConsultaPeriodoPorMes = (valorMes) => {
  if (!valorMes || ehMesAtual(valorMes)) {
    return {};
  }

  return obterIntervaloDatasPorMes(valorMes);
};

const obterClasseStatusPagamento = (statusPagamento) => {
  switch (String(statusPagamento || 'PENDENTE').toUpperCase()) {
    case 'PAGO':
      return styles.statusPago;
    case 'ATRASADO':
      return styles.statusAtrasado;
    case 'CANCELADO':
      return styles.statusCancelado;
    default:
      return styles.statusPendente;
  }
};

const obterRotuloStatusPagamento = (statusPagamento) => String(statusPagamento || 'PENDENTE').toUpperCase();

export function MovimentacoesPage() {
  const { adicionarToast } = useAppFeedback();

  const [resumo, setResumo] = useState({
    saldo: 0,
    totalReceitas: 0,
    totalDespesas: 0,
  });
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mesSelecionado, setMesSelecionado] = useState(obterMesAtual());
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    tamanhoPagina: 10,
    totalItens: 0,
    totalPaginas: 1,
  });
  const [movimentacaoSelecionada, setMovimentacaoSelecionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [movimentacaoParaExcluir, setMovimentacaoParaExcluir] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMonthLoading, setIsMonthLoading] = useState(false);
  const [movimentacaoComStatusAtualizando, setMovimentacaoComStatusAtualizando] = useState(null);

  const carregarDados = useCallback(async (consulta = {}) => {
    const mes = consulta.month ?? mesSelecionado;
    const consultaPeriodo = obterConsultaPeriodoPorMes(mes);

    const consultaFinal = {
      ...consultaPeriodo,
      pagina: consulta.pagina ?? 1,
      tamanhoPagina: consulta.tamanhoPagina ?? paginacao.tamanhoPagina,
      ordenarDesc: true,
    };

    setIsMonthLoading(true);

    try {
      const [respostaMovimentacoes, respostaCategorias, respostaResumo] = await Promise.all([
        buscarMovimentacoes(consultaFinal),
        buscarCategorias(),
        buscarResumoDashboard(consultaPeriodo),
      ]);

      setMovimentacoes(respostaMovimentacoes.items);
      setPaginacao(respostaMovimentacoes.paginacao);
      setCategorias(respostaCategorias);
      setResumo(respostaResumo);
    } finally {
      setIsMonthLoading(false);
    }
  }, [mesSelecionado, paginacao.tamanhoPagina]);

  useEffect(() => {
    carregarDados({ month: mesSelecionado, pagina: 1 });
  }, [carregarDados, mesSelecionado]);

  const lidarComMudancaMes = (valorMes) => {
    setMesSelecionado(valorMes);
    setPaginacao((previous) => ({ ...previous, pagina: 1 }));
  };

  const resetarParaMesAtual = () => {
    setMesSelecionado(obterMesAtual());
    setPaginacao((previous) => ({ ...previous, pagina: 1 }));
  };

  const recarregarDadosAtuais = async () => {
    await carregarDados({ month: mesSelecionado, pagina: paginacao.pagina });
  };

  const irParaPagina = (pagina) => {
    if (pagina < 1 || pagina > paginacao.totalPaginas) {
      return;
    }

    carregarDados({ month: mesSelecionado, pagina });
  };

  const abrirModalCriacao = () => {
    setMovimentacaoSelecionada(null);
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (movimentacao) => {
    setMovimentacaoSelecionada(movimentacao);
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setMovimentacaoSelecionada(null);
  };

  const abrirModalExclusao = (movimentacao) => {
    setMovimentacaoParaExcluir(movimentacao);
    setIsDeleteModalOpen(true);
  };

  const fecharModalExclusao = () => {
    if (isDeleting) {
      return;
    }

    setIsDeleteModalOpen(false);
    setMovimentacaoParaExcluir(null);
  };

  const executarExclusao = async (acao) => {
    if (!movimentacaoParaExcluir) {
      return;
    }

    setIsDeleting(true);

    try {
      if (acao === 'transacao') {
        await removerMovimentacoesPorTransacao(movimentacaoParaExcluir.transacaoId);
        adicionarToast({ type: 'success', message: 'Transacao e movimentacoes vinculadas removidas com sucesso.' });
      } else {
        await removerMovimentacao(movimentacaoParaExcluir.id);
        adicionarToast({ type: 'success', message: 'Movimentacao removida com sucesso.' });
      }

      setIsDeleteModalOpen(false);
      setMovimentacaoParaExcluir(null);
      await carregarDados({ month: mesSelecionado, pagina: paginacao.pagina });
    } finally {
      setIsDeleting(false);
    }
  };

  const lidarComExclusao = async (movimentacao) => {
    abrirModalExclusao(movimentacao);
  };

  const lidarComEnvio = async (dados) => {
    setIsSubmitting(true);

    try {
      if (movimentacaoSelecionada) {
        await atualizarMovimentacao(movimentacaoSelecionada.id, dados);
        adicionarToast({ type: 'success', message: 'Movimentacao atualizada.' });
      } else {
        await criarMovimentacao(dados);
        adicionarToast({ type: 'success', message: 'Movimentacao criada.' });
      }

      fecharModal();
      await carregarDados({ month: mesSelecionado, pagina: paginacao.pagina });
    } finally {
      setIsSubmitting(false);
    }
  };

  const atualizarStatusDaMovimentacao = async (movimentacao, novoStatus) => {
    if (!movimentacao?.id) {
      return;
    }

    setMovimentacaoComStatusAtualizando(movimentacao.id);

    try {
      await atualizarStatusMovimentacao(movimentacao.id, {
        statusPagamento: novoStatus,
        // Deixa o backend definir a data oficial (UtcNow) para evitar divergencia de fuso.
        dataPagamento: null,
      });

      adicionarToast({ type: 'success', message: `Status alterado para ${novoStatus}.` });
      await carregarDados({ month: mesSelecionado, pagina: paginacao.pagina });
    } finally {
      setMovimentacaoComStatusAtualizando(null);
    }
  };

  const columns = [
    {
      key: 'descricao',
      header: 'Descricao',
      render: (row) => {
        const showBadge = Boolean(row.transacaoId) && row.tipoTransacao !== 'UNICA';
        const isParcelada = row.tipoTransacao === 'PARCELADA';

        return (
          <div className={styles.descriptionCell}>
            <span>{row.descricao}</span>
            {showBadge && (
              <span className={`${styles.badge} ${isParcelada ? styles.badgeParcelada : styles.badgeRecorrente}`}>
                {isParcelada ? 'Parcelado' : 'Recorrente'}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'valor',
      header: 'Valor',
      render: (row) => <span className={row.tipo === 'RECEITA' ? styles.receita : styles.despesa}>{formatarMoeda(row.valor)}</span>,
    },
    { key: 'tipo', header: 'Tipo' },
    { key: 'categoriaNome', header: 'Categoria' },
    {
      key: 'statusPagamento',
      header: 'Status',
      render: (row) => (
        <div className={styles.statusControl}>
          <span className={`${styles.statusBadge} ${obterClasseStatusPagamento(row.statusPagamento)}`}>
            {obterRotuloStatusPagamento(row.statusPagamento)}
          </span>

          <select
            className={styles.statusSelect}
            value={obterRotuloStatusPagamento(row.statusPagamento)}
            onChange={(event) => atualizarStatusDaMovimentacao(row, event.target.value)}
            disabled={movimentacaoComStatusAtualizando === row.id}
          >
            <option value="PENDENTE">PENDENTE</option>
            <option value="PAGO">PAGO</option>
            <option value="ATRASADO">ATRASADO</option>
            <option value="CANCELADO">CANCELADO</option>
          </select>
        </div>
      ),
    },
    {
      key: 'dataMovimentacao',
      header: 'Data',
      render: (row) => formatarData(row.dataMovimentacao),
    },
    {
      key: 'acoes',
      header: 'Acoes',
      render: (row) => (
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => abrirModalEdicao(row)}>Editar</Button>
          <Button variant="danger" onClick={() => lidarComExclusao(row)}>Excluir</Button>
        </div>
      ),
    },
  ];

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Movimentações</h2>
          <p className={styles.subtitle}>Gerencie suas receitas e despesas aqui.</p>
        </div>

        <div className={styles.topActions}>
          <MonthFilter
            value={mesSelecionado}
            onChange={lidarComMudancaMes}
            onResetToCurrent={resetarParaMesAtual}
            disabled={isMonthLoading}
          />

          <Button variant="secondary" onClick={recarregarDadosAtuais} disabled={isMonthLoading}>Atualizar</Button>
          <Button onClick={abrirModalCriacao}>+ Nova movimentacao</Button>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <Card title="Saldo" value={formatarMoeda(resumo.saldo)} tone={resumo.saldo >= 0 ? 'success' : 'danger'} />
        <Card title="Receitas" value={formatarMoeda(resumo.totalReceitas)} tone="success" />
        <Card title="Despesas" value={formatarMoeda(resumo.totalDespesas)} tone="danger" />
      </div>

      <div className={styles.tableArea}>
        {isMonthLoading && <p className={styles.monthStatus}>Carregando movimentacoes do mes...</p>}
        <Table
          columns={columns}
          data={movimentacoes}
          emptyMessage="Sem dados para o mes selecionado."
          height={movimentacoes.length ? '100%' : 'auto'}
        />
      </div>

      <div className={styles.pagination}>
        <Button variant="secondary" onClick={() => irParaPagina(paginacao.pagina - 1)} disabled={paginacao.pagina <= 1}>
          Anterior
        </Button>
        <span>
          Pagina {paginacao.pagina} de {paginacao.totalPaginas} ({paginacao.totalItens} itens)
        </span>
        <Button
          variant="secondary"
          onClick={() => irParaPagina(paginacao.pagina + 1)}
          disabled={paginacao.pagina >= paginacao.totalPaginas}
        >
          Proxima
        </Button>
      </div>

      <Modal
        title={movimentacaoSelecionada ? 'Editar movimentacao' : 'Nova movimentacao'}
        isOpen={isModalOpen}
        onClose={fecharModal}
      >
        <MovimentacaoForm
          initialData={movimentacaoSelecionada}
          categorias={categorias}
          onSubmit={lidarComEnvio}
          onCancel={fecharModal}
          submitting={isSubmitting}
        />
      </Modal>

      <Modal
        title="Confirmar exclusao"
        isOpen={isDeleteModalOpen}
        onClose={fecharModalExclusao}
      >
        <div className={styles.deleteModalContent}>
          <div className={styles.deleteIconWrapper}>
            <AlertCircle className={styles.deleteIcon} aria-hidden="true" />
          </div>

          <p>
            Deseja excluir a movimentacao
            {' '}
            <strong>{movimentacaoParaExcluir?.descricao || '-'}</strong>
            ?
          </p>

          {movimentacaoParaExcluir?.transacaoId ? (
            <p className={styles.deleteHint}>
              Esta movimentacao pertence a uma transacao vinculada. Voce pode excluir apenas este lancamento ou apagar a transacao e todos os vinculos.
            </p>
          ) : (
            <p className={styles.deleteHint}>Esta acao nao pode ser desfeita.</p>
          )}

          <div className={styles.deleteActions}>
            <Button variant="ghost" onClick={fecharModalExclusao} disabled={isDeleting}>Cancelar</Button>
            <Button variant="danger" onClick={() => executarExclusao('single')} disabled={isDeleting}>
              Excluir
            </Button>
            <Button
              variant="secondary"
              onClick={() => executarExclusao('transacao')}
              disabled={isDeleting || !movimentacaoParaExcluir?.transacaoId}
            >
              Excluir com vinculos
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
