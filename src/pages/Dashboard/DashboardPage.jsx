import { useCallback, useEffect, useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  buscarResumoComparativo,
  buscarUltimasMovimentacoes,
  buscarDistribuicaoCategorias,
  buscarEvolucao12Meses,
  buscarTransacoesAtivas,
  buscarAlertas,
} from '../../api/dashboardService';
import { Button } from '../../components/UI/Button';
import { useAppFeedback } from '../../hooks/useAppFeedback';
import { formatarData, formatarMoeda } from '../../hooks/useFormatters';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from './DashboardPage.module.css';

const COLORS = ['#0c5f93', '#1b8b83', '#d7263d', '#f4a300', '#6c757d', '#ff6b6b'];
const COR_FATIA_OUTRAS = '#9aa7b6';
const LIMIAR_PERCENTUAL_AGRUPAMENTO = 3;

const obterMesAtualReferencia = () => {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  return `${hoje.getFullYear()}-${mes}`;
};

const formatarReferenciaMesAno = (valorMes) => {
  const [ano, mes] = String(valorMes || '').split('-');

  if (!ano || !mes) {
    return '-';
  }

  return `${mes}/${ano}`;
};

const obterEtiquetaStatus = (statusPagamento) => String(statusPagamento || 'PENDENTE').toUpperCase();

const obterEstiloStatus = (statusPagamento) => {
  switch (String(statusPagamento || 'PENDENTE').toUpperCase()) {
    case 'PAGO':
      return { background: '#e9f8f0', color: '#1f8a70', border: '1px solid #cfeede' };
    case 'ATRASADO':
      return { background: '#fff0f3', color: '#c61f3a', border: '1px solid #f2c3cf' };
    case 'CANCELADO':
      return { background: '#eef2f7', color: '#5f6f82', border: '1px solid #d8e1ec' };
    default:
      return { background: '#fff7e6', color: '#9c6b00', border: '1px solid #f4d28a' };
  }
};

const TooltipDistribuicao = ({ active, payload }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;

  if (!item) {
    return null;
  }

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #d9e3ef', borderRadius: 10, padding: '0.55rem 0.7rem' }}>
      <p style={{ margin: 0, color: '#12263a', fontWeight: 700 }}>{item.categoria}</p>
      <p style={{ margin: '0.2rem 0 0', color: '#4f6580' }}>{formatarMoeda(item.valor)} ({item.percentual.toFixed(1)}%)</p>
    </div>
  );
};

export function DashboardPage() {
  const { adicionarToast } = useAppFeedback();

  const [isLoading, setIsLoading] = useState(true);
  const [resumoComparativo, setResumoComparativo] = useState(null);
  const [ultimasMovimentacoes, setUltimasMovimentacoes] = useState([]);
  const [distribuicaoCategorias, setDistribuicaoCategorias] = useState([]);
  const [evolucao12Meses, setEvolucao12Meses] = useState([]);
  const [transacoesAtivas, setTransacoesAtivas] = useState([]);
  const [alertas, setAlertas] = useState(null);
  const [filtroAnoMovimentacoes, setFiltroAnoMovimentacoes] = useState('TODOS');
  const [mesReferenciaDistribuicao] = useState(() => obterMesAtualReferencia());

  const carregarDadosDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        comparativo,
        ultimas,
        distribuicao,
        evolucao,
        transacoes,
        alertasData,
      ] = await Promise.all([
        buscarResumoComparativo(),
        buscarUltimasMovimentacoes(100),
        buscarDistribuicaoCategorias(mesReferenciaDistribuicao),
        buscarEvolucao12Meses(),
        buscarTransacoesAtivas(),
        buscarAlertas(),
      ]);

      setResumoComparativo(comparativo);
      setUltimasMovimentacoes(Array.isArray(ultimas) ? ultimas : []);
      setDistribuicaoCategorias(Array.isArray(distribuicao) ? distribuicao : []);
      setEvolucao12Meses(Array.isArray(evolucao) ? evolucao : []);
      setTransacoesAtivas(Array.isArray(transacoes) ? transacoes : []);
      setAlertas(alertasData);
    } catch {
      adicionarToast({ type: 'error', message: 'Erro ao carregar dados do dashboard.' });
    } finally {
      setIsLoading(false);
    }
  }, [adicionarToast, mesReferenciaDistribuicao]);

  useEffect(() => {
    carregarDadosDashboard();
  }, [carregarDadosDashboard]);

  const anosDisponiveisMovimentacoes = useMemo(() => {
    const anos = ultimasMovimentacoes
      .map((mov) => new Date(mov.dataMovimentacao).getFullYear())
      .filter((ano) => Number.isFinite(ano) && ano > 1900);

    return [...new Set(anos)].sort((a, b) => b - a);
  }, [ultimasMovimentacoes]);

  const movimentacoesFiltradas = useMemo(() => {
    if (filtroAnoMovimentacoes === 'TODOS') {
      return ultimasMovimentacoes;
    }

    const anoSelecionado = Number(filtroAnoMovimentacoes);

    return ultimasMovimentacoes.filter((mov) => {
      const anoMovimentacao = new Date(mov.dataMovimentacao).getFullYear();
      return anoMovimentacao === anoSelecionado;
    });
  }, [filtroAnoMovimentacoes, ultimasMovimentacoes]);

  const distribuicaoDetalhada = useMemo(() => {
    const total = distribuicaoCategorias.reduce((acumulado, item) => acumulado + Number(item.valor || 0), 0);

    if (!total) {
      return [];
    }

    return distribuicaoCategorias
      .map((item, index) => {
        const valor = Number(item.valor || 0);

        return {
          ...item,
          valor,
          percentual: (valor / total) * 100,
          cor: COLORS[index % COLORS.length],
        };
      })
      .sort((a, b) => b.valor - a.valor);
  }, [distribuicaoCategorias]);

  const distribuicaoParaGrafico = useMemo(() => {
    if (!distribuicaoDetalhada.length) {
      return [];
    }

    const fatiasPrincipais = distribuicaoDetalhada.filter(
      (item) => item.percentual >= LIMIAR_PERCENTUAL_AGRUPAMENTO,
    );

    const fatiasPequenas = distribuicaoDetalhada.filter(
      (item) => item.percentual < LIMIAR_PERCENTUAL_AGRUPAMENTO,
    );

    if (!fatiasPequenas.length) {
      return fatiasPrincipais;
    }

    const totalOutras = fatiasPequenas.reduce((acumulado, item) => acumulado + item.valor, 0);
    const percentualOutras = fatiasPequenas.reduce((acumulado, item) => acumulado + item.percentual, 0);

    return [
      ...fatiasPrincipais,
      {
        categoria: 'Outras',
        valor: totalOutras,
        percentual: percentualOutras,
        cor: COR_FATIA_OUTRAS,
      },
    ];
  }, [distribuicaoDetalhada]);

  const totalDespesasDistribuicao = useMemo(() => {
    return distribuicaoDetalhada.reduce((acumulado, item) => acumulado + item.valor, 0);
  }, [distribuicaoDetalhada]);

  const maiorCategoriaDistribuicao = distribuicaoDetalhada[0] ?? null;

  const concentracaoTop3 = useMemo(() => {
    if (!totalDespesasDistribuicao) {
      return 0;
    }

    const totalTop3 = distribuicaoDetalhada
      .slice(0, 3)
      .reduce((acumulado, item) => acumulado + item.valor, 0);

    return (totalTop3 / totalDespesasDistribuicao) * 100;
  }, [distribuicaoDetalhada, totalDespesasDistribuicao]);

  if (isLoading) {
    return (
      <section className={styles.page}>
        <p className={styles.loadingText}>Carregando dashboard...</p>
      </section>
    );
  }

  const variacaoSaldo = resumoComparativo?.variacao?.saldoPercentual ?? 0;
  const isSaldoPositivo = variacaoSaldo >= 0;

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Dashboard</h2>
          <p className={styles.subtitle}>Visão geral da sua situação financeira.</p>
        </div>
        <Button variant="secondary" onClick={carregarDadosDashboard}>Atualizar</Button>
      </div>

      {/* Resumo Comparativo */}
      {resumoComparativo && (
        <div className={styles.summarySection}>
          <h3 className={styles.sectionTitle}>Resumo Financeiro</h3>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>Saldo</span>
                <span className={`${styles.variacao} ${isSaldoPositivo ? styles.variacaoPositiva : styles.variacaoNegativa}`}>
                  {isSaldoPositivo ? '+' : ''}{variacaoSaldo.toFixed(1)}%
                </span>
              </div>
              <p className={styles.cardValue}>{formatarMoeda(resumoComparativo.mesAtual.saldo)}</p>
              <p className={styles.cardCompare}>Mês anterior: {formatarMoeda(resumoComparativo.mesAnterior.saldo)}</p>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>Receitas</span>
                <span className={styles.variacao} style={{ color: '#1f8a70' }}>
                  +{(resumoComparativo.variacao.receitasPercentual ?? 0).toFixed(1)}%
                </span>
              </div>
              <p className={styles.cardValue}>{formatarMoeda(resumoComparativo.mesAtual.totalReceitas)}</p>
              <p className={styles.cardCompare}>Mês anterior: {formatarMoeda(resumoComparativo.mesAnterior.totalReceitas)}</p>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>Despesas</span>
                <span className={styles.variacao} style={{ color: '#d7263d' }}>
                  +{(resumoComparativo.variacao.despesasPercentual ?? 0).toFixed(1)}%
                </span>
              </div>
              <p className={styles.cardValue}>{formatarMoeda(resumoComparativo.mesAtual.totalDespesas)}</p>
              <p className={styles.cardCompare}>Mês anterior: {formatarMoeda(resumoComparativo.mesAnterior.totalDespesas)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className={styles.chartsGrid}>
        {/* Gráfico de Evolução 12 Meses */}
        {evolucao12Meses.length > 0 && (
          <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>Evolução de Saldo (12 Meses)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucao12Meses} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7ecf3" />
                <XAxis dataKey="mes" stroke="#627a95" style={{ fontSize: '0.85rem' }} />
                <YAxis stroke="#627a95" style={{ fontSize: '0.85rem' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d9e3ef',
                    borderRadius: '10px',
                  }}
                  formatter={(value) => formatarMoeda(value)}
                />
                <Line
                  type="monotone"
                  dataKey="saldo"
                  stroke="#1b8b83"
                  strokeWidth={3}
                  dot={{ fill: '#1b8b83', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráfico de Pizza - Distribuição de Categorias */}
        {distribuicaoCategorias.length > 0 && (
          <div className={`${styles.chartContainer} ${styles.chartContainerDistribuicao}`}>
            <div className={styles.chartHeaderRich}>
              <div>
                <h3 className={styles.chartTitle}>Distribuição de Despesas</h3>
                <p className={styles.chartSubtitle}>Total no período: {formatarMoeda(totalDespesasDistribuicao)}</p>
                <p className={styles.chartPeriodoInfo}>Referência: {formatarReferenciaMesAno(mesReferenciaDistribuicao)}</p>
              </div>

              {maiorCategoriaDistribuicao && (
                <p className={styles.highlightText}>
                  Maior categoria: <strong>{maiorCategoriaDistribuicao.categoria}</strong> ({maiorCategoriaDistribuicao.percentual.toFixed(1)}%)
                </p>
              )}
            </div>

            <div className={styles.quickStats}>
              <span className={styles.statPill}>Categorias: {distribuicaoDetalhada.length}</span>
              <span className={styles.statPill}>Concentração Top 3: {concentracaoTop3.toFixed(1)}%</span>
            </div>

            <div className={styles.distribuicaoLayout}>
              <div className={styles.distribuicaoChartArea}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distribuicaoParaGrafico}
                      cx="43%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={96}
                      paddingAngle={2}
                      dataKey="valor"
                      label={({ percent }) => (percent >= 0.04 ? `${(percent * 100).toFixed(0)}%` : '')}
                      labelLine={false}
                    >
                      {distribuicaoParaGrafico.map((item) => (
                        <Cell key={item.categoria} fill={item.cor} />
                      ))}
                    </Pie>
                    <Tooltip content={<TooltipDistribuicao />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className={styles.distribuicaoLista}>
                {distribuicaoDetalhada.map((item, index) => (
                  <div key={item.categoria} className={styles.distribuicaoItem}>
                    <span className={styles.distribuicaoLegenda}>
                      <span className={styles.distribuicaoPosicao}>{index + 1}</span>
                      <span className={styles.distribuicaoCor} style={{ backgroundColor: item.cor }} />
                      {item.categoria}
                    </span>
                    <span className={styles.distribuicaoValores}>
                      <strong>{formatarMoeda(item.valor)}</strong>
                      <small>{item.percentual.toFixed(1)}%</small>
                    </span>
                    <div className={styles.distribuicaoBarraFundo}>
                      <div className={styles.distribuicaoBarra} style={{ width: `${Math.max(item.percentual, 2)}%`, backgroundColor: item.cor }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Últimas Movimentações */}
      {ultimasMovimentacoes.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Últimas Movimentações</h3>

            <label className={styles.inlineFilter}>
              <span>Ano</span>
              <select
                className={styles.filterSelect}
                value={filtroAnoMovimentacoes}
                onChange={(event) => setFiltroAnoMovimentacoes(event.target.value)}
              >
                <option value="TODOS">Todos</option>
                {anosDisponiveisMovimentacoes.map((ano) => (
                  <option key={ano} value={String(ano)}>{ano}</option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.movementList}>
            {movimentacoesFiltradas.map((mov) => (
              <div key={mov.id} className={styles.movementItem}>
                <div className={styles.movementInfo}>
                  <p className={styles.movementDesc}>{mov.descricao}</p>
                  <p className={styles.movementCategory}>{mov.categoriaNome}</p>
                  <span style={{ ...obterEstiloStatus(mov.statusPagamento), display: 'inline-flex', padding: '0.16rem 0.52rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, marginTop: '0.3rem', width: 'fit-content' }}>
                    {obterEtiquetaStatus(mov.statusPagamento)}
                  </span>
                </div>
                <div className={styles.movementRight}>
                  <p className={`${styles.movementValue} ${mov.tipo === 'RECEITA' ? styles.receita : styles.despesa}`}>
                    {mov.tipo === 'RECEITA' ? '+' : '-'}{formatarMoeda(mov.valor)}
                  </p>
                  <p className={styles.movementDate}>{formatarData(mov.dataMovimentacao)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transações Ativas */}
      {transacoesAtivas.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Transações Ativas</h3>
          <div className={styles.transactionList}>
            {transacoesAtivas.map((transacao) => (
              <div key={transacao.id} className={styles.transactionItem}>
                <div className={styles.transactionIcon}>
                  <TrendingUp size={20} color="#1b8b83" />
                </div>
                <div className={styles.transactionInfo}>
                  <p className={styles.transactionDesc}>{transacao.descricao}</p>
                  <p className={styles.transactionType}>{transacao.tipoTransacao}</p>
                  <span style={{ ...obterEstiloStatus(transacao.statusPagamento), display: 'inline-flex', padding: '0.16rem 0.52rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, marginTop: '0.3rem', width: 'fit-content' }}>
                    {obterEtiquetaStatus(transacao.statusPagamento)}
                  </span>
                </div>
                <div className={styles.transactionRight}>
                  <p className={styles.transactionValue}>{formatarMoeda(transacao.valor)}</p>
                  {transacao.parcelasRestantes && (
                    <p className={styles.transactionDetails}>
                      {transacao.parcelaAtual}/{transacao.totalParcelas}
                    </p>
                  )}
                  {transacao.diaVencimento && (
                    <p className={styles.transactionDetails}>Vence todo dia {transacao.diaVencimento} do mes</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alertas */}
      {alertas && (
        <>
          {alertas.vencenHoje?.length > 0 && (
            <div className={`${styles.alertSection} ${styles.alertDanger}`}>
              <h3 className={styles.alertTitle}>⚠️ Vence Hoje</h3>
              <ul className={styles.alertList}>
                {alertas.vencenHoje.map((item, idx) => (
                  <li key={idx} className={styles.alertItem}>
                    {item.descricao} - {formatarData(item.dataVencimento)}
                    {' '}
                    <span style={{ ...obterEstiloStatus(item.statusPagamento), display: 'inline-flex', padding: '0.12rem 0.45rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, marginLeft: '0.35rem' }}>
                      {obterEtiquetaStatus(item.statusPagamento)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {alertas.vencemProximos7dias?.length > 0 && (
            <div className={`${styles.alertSection} ${styles.alertWarning}`}>
              <h3 className={styles.alertTitle}>📌 Próximos 7 Dias</h3>
              <ul className={styles.alertList}>
                {alertas.vencemProximos7dias.map((item, idx) => (
                  <li key={idx} className={styles.alertItem}>
                    {item.descricao} - {formatarData(item.dataVencimento)}
                    {' '}
                    <span style={{ ...obterEstiloStatus(item.statusPagamento), display: 'inline-flex', padding: '0.12rem 0.45rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, marginLeft: '0.35rem' }}>
                      {obterEtiquetaStatus(item.statusPagamento)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {alertas.emAtraso?.length > 0 && (
            <div className={`${styles.alertSection} ${styles.alertDanger}`}>
              <h3 className={styles.alertTitle}>❌ Em Atraso</h3>
              <ul className={styles.alertList}>
                {alertas.emAtraso.map((item, idx) => (
                  <li key={idx} className={styles.alertItem}>
                    {item.descricao} - {formatarData(item.dataVencimento)}
                    {' '}
                    <span style={{ ...obterEstiloStatus(item.statusPagamento), display: 'inline-flex', padding: '0.12rem 0.45rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, marginLeft: '0.35rem' }}>
                      {obterEtiquetaStatus(item.statusPagamento)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
