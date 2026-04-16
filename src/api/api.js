import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5263';
const TOKEN_KEY = import.meta.env.VITE_STORAGE_TOKEN_KEY || 'dashhub:token';
const USER_KEY = import.meta.env.VITE_STORAGE_USER_KEY || 'dashhub:user';

let inscritosCarregamento = [];
let manipuladorErroGlobal = null;
let requisicoesPendentes = 0;

const notificarCarregamento = () => {
  const estaCarregando = requisicoesPendentes > 0;
  inscritosCarregamento.forEach((callback) => callback(estaCarregando));
};

const iniciarCarregamento = () => {
  requisicoesPendentes += 1;
  notificarCarregamento();
};

const pararCarregamento = () => {
  requisicoesPendentes = Math.max(0, requisicoesPendentes - 1);
  notificarCarregamento();
};

const obterMensagemErro = (erro) => {
  const carga = erro?.response?.data;

  if (typeof carga === 'string' && carga.trim()) {
    return carga;
  }

  if (carga?.message) {
    return carga.message;
  }

  if (carga?.erro) {
    return carga.erro;
  }

  if (Array.isArray(carga?.errors)) {
    return carga.errors.join(', ');
  }

  return 'Ocorreu um erro inesperado.';
};

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    iniciarCarregamento();

    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (erro) => {
    pararCarregamento();
    return Promise.reject(erro);
  },
);

api.interceptors.response.use(
  (response) => {
    pararCarregamento();
    return response;
  },
  (erro) => {
    pararCarregamento();

    const status = erro?.response?.status;
    const deveIgnorarToast = erro?.config?.skipErrorToast;

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.dispatchEvent(new Event('auth:unauthorized'));

      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    } else if (!deveIgnorarToast && manipuladorErroGlobal) {
      manipuladorErroGlobal(obterMensagemErro(erro));
    }

    return Promise.reject(erro);
  },
);

export const inscreverCarregamento = (callback) => {
  inscritosCarregamento.push(callback);

  callback(requisicoesPendentes > 0);

  return () => {
    inscritosCarregamento = inscritosCarregamento.filter((item) => item !== callback);
  };
};

export const registrarManipuladorErroGlobal = (callback) => {
  manipuladorErroGlobal = callback;

  return () => {
    manipuladorErroGlobal = null;
  };
};

export const storageKeys = {
  token: TOKEN_KEY,
  user: USER_KEY,
};
