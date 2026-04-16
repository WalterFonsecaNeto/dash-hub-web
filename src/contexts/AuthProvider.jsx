import { useCallback, useEffect, useMemo, useState } from 'react';
import { solicitarLogin, solicitarRegistro } from '../api/authService';
import { storageKeys } from '../api/api';
import { buscarUsuarioAtual } from '../api/usuarioService';
import { AuthContext } from './authContext';

const analisarUsuarioArmazenado = () => {
  const valorBruto = localStorage.getItem(storageKeys.user);

  if (!valorBruto) {
    return null;
  }

  try {
    return JSON.parse(valorBruto);
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(storageKeys.token));
  const [user, setUser] = useState(analisarUsuarioArmazenado());

  const logout = useCallback(() => {
    localStorage.removeItem(storageKeys.token);
    localStorage.removeItem(storageKeys.user);
    setToken(null);
    setUser(null);
  }, []);

  const carregarUsuarioAtual = useCallback(async () => {
    if (!localStorage.getItem(storageKeys.token)) {
      return null;
    }

    const usuarioAtual = await buscarUsuarioAtual();
    setUser(usuarioAtual);
    localStorage.setItem(storageKeys.user, JSON.stringify(usuarioAtual));

    return usuarioAtual;
  }, []);

  const login = useCallback(async (payload) => {
    const dados = await solicitarLogin(payload);

    localStorage.setItem(storageKeys.token, dados.token);
    setToken(dados.token);

    await carregarUsuarioAtual();

    return dados;
  }, [carregarUsuarioAtual]);

  const register = useCallback(async (payload) => {
    await solicitarRegistro(payload);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', onUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', onUnauthorized);
    };
  }, [logout]);

  useEffect(() => {
    if (token && !user) {
      carregarUsuarioAtual().catch(() => {
        logout();
      });
    }
  }, [carregarUsuarioAtual, logout, token, user]);

  const value = useMemo(() => ({
    token,
    usuario: user,
    estaAutenticado: Boolean(token),
    entrar: login,
    sair: logout,
    registrar: register,
  }), [login, logout, register, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
