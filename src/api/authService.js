import { api } from './api';

const obterValor = (objeto, chaves, padrao = '') => {
  for (const chave of chaves) {
    if (objeto?.[chave] !== undefined && objeto?.[chave] !== null) {
      return objeto[chave];
    }
  }

  return padrao;
};

const postComRotaAlternativa = async (rotaPrincipal, rotaAlternativa, dados) => {
  try {
    return await api.post(rotaPrincipal, dados);
  } catch (erro) {
    if (erro?.response?.status === 404 && rotaAlternativa) {
      return api.post(rotaAlternativa, dados);
    }

    throw erro;
  }
};

export const solicitarLogin = async (dados) => {
  const resposta = await postComRotaAlternativa('/autenticacao/entrar', '/auth/login', {
    email: dados.email,
    senha: dados.senha,
    Email: dados.email,
    Senha: dados.senha,
  });

  const conteudo = resposta.data ?? {};

  return {
    token: obterValor(conteudo, ['token', 'Token']),
    expiraEm: obterValor(conteudo, ['expiraEm', 'ExpiraEm']),
  };
};

export const solicitarRegistro = async (dados) => {
  await postComRotaAlternativa('/autenticacao/registrar', '/auth/register', {
    nome: dados.nome,
    email: dados.email,
    senha: dados.senha,
    Nome: dados.nome,
    Email: dados.email,
    Senha: dados.senha,
  });
};
