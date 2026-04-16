import { api } from './api';

const obterValor = (objeto, chaves, padrao = 0) => {
  for (const chave of chaves) {
    if (objeto?.[chave] !== undefined && objeto?.[chave] !== null) {
      return objeto[chave];
    }
  }

  return padrao;
};

export const buscarResumoDashboard = async (consulta = {}) => {
  const params = {};

  if (consulta?.dataInicio) {
    params.dataInicio = consulta.dataInicio;
    params.DataInicio = consulta.dataInicio;
  }

  if (consulta?.dataFim) {
    params.dataFim = consulta.dataFim;
    params.DataFim = consulta.dataFim;
  }

  try {
    const resposta = await api.get('/painel/resumo', { params });
    const dados = resposta.data ?? {};

    return {
      saldo: Number(obterValor(dados, ['saldo', 'Saldo'], 0)),
      totalReceitas: Number(obterValor(dados, ['totalReceitas', 'TotalReceitas'], 0)),
      totalDespesas: Number(obterValor(dados, ['totalDespesas', 'TotalDespesas'], 0)),
    };
  } catch (erro) {
    if (erro?.response?.status === 404) {
      const resposta = await api.get('/dashboard/resumo', { params });
      const dados = resposta.data ?? {};

      return {
        saldo: Number(obterValor(dados, ['saldo', 'Saldo'], 0)),
        totalReceitas: Number(obterValor(dados, ['totalReceitas', 'TotalReceitas'], 0)),
        totalDespesas: Number(obterValor(dados, ['totalDespesas', 'TotalDespesas'], 0)),
      };
    }

    throw erro;
  }
};

export const buscarResumoComparativo = async (mes = null) => {
  const params = {};
  if (mes) {
    params.mes = mes;
    params.Mes = mes;
  }

  const resposta = await api.get('/dashboard/resumo-comparativo', { params });
  return resposta.data;
};

export const buscarUltimasMovimentacoes = async (limite = 10) => {
  const resposta = await api.get('/dashboard/ultimas-movimentacoes', {
    params: { limite, Limite: limite },
  });
  return resposta.data;
};

export const buscarDistribuicaoCategorias = async (mes = null) => {
  const params = {};
  if (mes) {
    params.mes = mes;
    params.Mes = mes;
  }

  const resposta = await api.get('/dashboard/distribuicao-categorias', { params });
  return resposta.data;
};

export const buscarTopCategorias = async (mes = null, limite = 5) => {
  const params = { limite, Limite: limite };
  if (mes) {
    params.mes = mes;
    params.Mes = mes;
  }

  const resposta = await api.get('/dashboard/top-categorias', { params });
  return resposta.data;
};

export const buscarTransacoesAtivas = async () => {
  const resposta = await api.get('/dashboard/transacoes-ativas');
  return resposta.data;
};

export const buscarEvolucao12Meses = async () => {
  const resposta = await api.get('/dashboard/evolucao-12-meses');
  return resposta.data;
};

export const buscarAlertas = async () => {
  const resposta = await api.get('/dashboard/alertas');
  return resposta.data;
};
