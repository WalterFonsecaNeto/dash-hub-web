import { api } from './api';

const obterValor = (objeto, chaves, padrao = null) => {
  for (const chave of chaves) {
    if (objeto?.[chave] !== undefined && objeto?.[chave] !== null) {
      return objeto[chave];
    }
  }

  return padrao;
};

const normalizarMovimentacao = (item = {}) => ({
  id: obterValor(item, ['id', 'Id']),
  descricao: obterValor(item, ['descricao', 'Descricao'], ''),
  valor: Number(obterValor(item, ['valor', 'Valor'], 0)),
  tipo: String(obterValor(item, ['tipo', 'Tipo'], '')).toUpperCase(),
  categoriaId: obterValor(item, ['categoria_id', 'categoriaId', 'CategoriaId']),
  categoriaNome: obterValor(item, ['categoria', 'categoriaNome', 'CategoriaNome'], 'Sem categoria'),
  dataMovimentacao: obterValor(item, ['data_movimentacao', 'dataMovimentacao', 'DataMovimentacao']),
  transacaoId: obterValor(item, ['transacao_id', 'transacaoId', 'TransacaoId']),
  tipoTransacao: String(obterValor(item, ['tipo_transacao', 'tipoTransacao', 'TipoTransacao'], 'UNICA')).toUpperCase(),
  quantidadeParcelas: obterValor(item, ['quantidade_parcelas', 'quantidadeParcelas', 'QuantidadeParcelas']),
  diaVencimento: obterValor(item, ['dia_vencimento', 'diaVencimento', 'DiaVencimento']),
  dataInicio: obterValor(item, ['data_inicio', 'dataInicio', 'DataInicio', 'data_movimentacao', 'dataMovimentacao']),
  dataFim: obterValor(item, ['data_fim', 'dataFim', 'DataFim']),
  statusPagamento: String(obterValor(item, ['status_pagamento', 'statusPagamento', 'StatusPagamento'], 'PENDENTE')).toUpperCase(),
  dataPagamento: obterValor(item, ['data_pagamento', 'dataPagamento', 'DataPagamento']),
});

const analisarLista = (dados) => {
  if (Array.isArray(dados)) {
    return {
      items: dados.map(normalizarMovimentacao),
      paginacao: {
        pagina: 1,
        tamanhoPagina: dados.length,
        totalItens: dados.length,
        totalPaginas: 1,
      },
    };
  }

  const items = obterValor(dados, ['itens', 'Itens', 'items', 'Items'], []);
  return {
    items: items.map(normalizarMovimentacao),
    paginacao: {
      pagina: Number(obterValor(dados, ['pagina', 'Pagina'], 1)),
      tamanhoPagina: Number(obterValor(dados, ['tamanhoPagina', 'TamanhoPagina'], items.length || 10)),
      totalItens: Number(obterValor(dados, ['totalItens', 'TotalItens'], items.length)),
      totalPaginas: Number(obterValor(dados, ['totalPaginas', 'TotalPaginas'], 1)),
    },
  };
};

export const buscarMovimentacoes = async (consulta = {}) => {
  const params = {
    pagina: consulta.pagina ?? 1,
    tamanhoPagina: consulta.tamanhoPagina ?? 10,
    ordenarDesc: consulta.ordenarDesc ?? true,
    Pagina: consulta.pagina ?? 1,
    TamanhoPagina: consulta.tamanhoPagina ?? 10,
    OrdenarDesc: consulta.ordenarDesc ?? true,
  };

  if (consulta.dataInicio) {
    params.dataInicio = consulta.dataInicio;
    params.DataInicio = consulta.dataInicio;
  }

  if (consulta.dataFim) {
    params.dataFim = consulta.dataFim;
    params.DataFim = consulta.dataFim;
  }

  const resposta = await api.get('/movimentacoes', { params });
  return analisarLista(resposta.data);
};

const formatarTipo = (tipo) => String(tipo || '').toLowerCase();

const construirDadosMovimentacao = (dados) => {
  const tipoTransacao = String(dados.tipoTransacao || 'UNICA').toUpperCase();
  const categoriaId = Number(dados.categoriaId);
  const statusPagamento = String(dados.statusPagamento || 'PENDENTE').toUpperCase();
  const dataPagamento = dados.dataPagamento || null;
  const dataMovimentacao = dados.dataMovimentacao || dados.dataInicio;

  const converterDataParaIso = (valorData) => {
    if (!valorData) {
      return null;
    }

    return valorData.length === 10 ? `${valorData}T00:00:00` : valorData;
  };

  const corpo = {
    descricao: dados.descricao,
    valor: Number(dados.valor),
    tipo: formatarTipo(dados.tipo),
    categoriaId,
    tipoTransacao,
    dataMovimentacao,
    dataInicio: dataMovimentacao,
    statusPagamento,
    dataPagamento: converterDataParaIso(dataPagamento),
    Descricao: dados.descricao,
    Valor: Number(dados.valor),
    Tipo: formatarTipo(dados.tipo),
    CategoriaId: categoriaId,
    TipoTransacao: tipoTransacao,
    DataMovimentacao: dataMovimentacao,
    DataInicio: dataMovimentacao,
    StatusPagamento: statusPagamento,
    DataPagamento: converterDataParaIso(dataPagamento),
  };

  if (tipoTransacao === 'PARCELADA' && dados.quantidadeParcelas) {
    corpo.quantidadeParcelas = Number(dados.quantidadeParcelas);
    corpo.QuantidadeParcelas = Number(dados.quantidadeParcelas);
  }

  if (tipoTransacao === 'RECORRENTE' && dados.diaVencimento) {
    corpo.diaVencimento = Number(dados.diaVencimento);
    corpo.DiaVencimento = Number(dados.diaVencimento);
  }

  if (tipoTransacao === 'RECORRENTE' && dados.dataFim) {
    corpo.dataFim = dados.dataFim;
    corpo.DataFim = dados.dataFim;
  }

  return corpo;
};

export const criarMovimentacao = async (dados) => {
  const resposta = await api.post('/movimentacoes', construirDadosMovimentacao(dados));

  return normalizarMovimentacao(resposta.data);
};

export const atualizarMovimentacao = async (id, dados) => {
  const resposta = await api.put(`/movimentacoes/${id}`, construirDadosMovimentacao(dados));

  return normalizarMovimentacao(resposta.data);
};

export const atualizarStatusMovimentacao = async (id, dados) => {
  const statusPagamento = String(dados.statusPagamento || 'PENDENTE').toUpperCase();
  const dataPagamento = dados.dataPagamento || null;
  const converterDataParaIso = (valorData) => {
    if (!valorData) {
      return null;
    }

    return valorData.length === 10 ? `${valorData}T00:00:00` : valorData;
  };

  const resposta = await api.patch(`/movimentacoes/${id}/status`, {
    statusPagamento,
    dataPagamento: converterDataParaIso(dataPagamento),
    StatusPagamento: statusPagamento,
    DataPagamento: converterDataParaIso(dataPagamento),
  });

  return normalizarMovimentacao(resposta.data);
};

export const removerMovimentacao = async (id) => {
  await api.delete(`/movimentacoes/${id}`);
};

export const removerMovimentacoesPorTransacao = async (transacaoId) => {
  await api.delete(`/movimentacoes/transacao/${transacaoId}`);
};
