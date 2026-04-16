import { api } from './api';

const obterValor = (objeto, chaves, padrao = null) => {
  for (const chave of chaves) {
    if (objeto?.[chave] !== undefined && objeto?.[chave] !== null) {
      return objeto[chave];
    }
  }

  return padrao;
};

export const buscarUsuarioAtual = async () => {
  try {
    const resposta = await api.get('/usuario/meu');
    const dados = resposta.data ?? {};

    return {
      id: obterValor(dados, ['id', 'Id']),
      nome: obterValor(dados, ['nome', 'Nome'], ''),
      email: obterValor(dados, ['email', 'Email'], ''),
      dataCriacao: obterValor(dados, ['dataCriacao', 'DataCriacao']),
    };
  } catch (erro) {
    if (erro?.response?.status === 404) {
      const resposta = await api.get('/usuario/me');
      const dados = resposta.data ?? {};

      return {
        id: obterValor(dados, ['id', 'Id']),
        nome: obterValor(dados, ['nome', 'Nome'], ''),
        email: obterValor(dados, ['email', 'Email'], ''),
        dataCriacao: obterValor(dados, ['dataCriacao', 'DataCriacao']),
      };
    }

    throw erro;
  }
};
