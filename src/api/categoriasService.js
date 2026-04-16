import { api } from './api';

const obterValor = (objeto, chaves, padrao = null) => {
  for (const chave of chaves) {
    if (objeto?.[chave] !== undefined && objeto?.[chave] !== null) {
      return objeto[chave];
    }
  }

  return padrao;
};

const normalizarCategoria = (item = {}) => ({
  id: obterValor(item, ['id', 'Id']),
  nome: obterValor(item, ['nome', 'Nome'], ''),
  tipo: String(obterValor(item, ['tipo', 'Tipo'], '')).toUpperCase(),
});

const analisarLista = (dados) => {
  if (Array.isArray(dados)) {
    return dados.map(normalizarCategoria);
  }

  const itens = obterValor(dados, ['itens', 'Itens', 'items', 'Items'], []);
  return itens.map(normalizarCategoria);
};

export const buscarCategorias = async () => {
  const resposta = await api.get('/categorias');
  return analisarLista(resposta.data);
};

const formatarTipo = (tipo) => String(tipo || '').toLowerCase();

export const criarCategoria = async (dados) => {
  const resposta = await api.post('/categorias', {
    nome: dados.nome,
    tipo: formatarTipo(dados.tipo),
    Nome: dados.nome,
    Tipo: formatarTipo(dados.tipo),
  });

  return normalizarCategoria(resposta.data);
};

export const atualizarCategoria = async (id, dados) => {
  const resposta = await api.put(`/categorias/${id}`, {
    nome: dados.nome,
    tipo: formatarTipo(dados.tipo),
    Nome: dados.nome,
    Tipo: formatarTipo(dados.tipo),
  });

  return normalizarCategoria(resposta.data);
};

export const removerCategoria = async (id) => {
  await api.delete(`/categorias/${id}`);
};
