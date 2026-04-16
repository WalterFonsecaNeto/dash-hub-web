# Dash Hub Web

Frontend React + Vite para o sistema financeiro Dash Hub, integrado com API .NET usando JWT.

## Requisitos

- Node.js 20+
- API rodando em `http://localhost:5000`

## Configuracao

Arquivo de ambiente:

`.env`

```env
VITE_API_URL=http://localhost:5000
```

## Rodando o projeto

```bash
npm install
npm run dev
```

## Build e qualidade

```bash
npm run lint
npm run build
```

## Funcionalidades

- Autenticacao JWT com rotas protegidas
- Dashboard com resumo financeiro
- CRUD de categorias
- CRUD de movimentacoes
- Filtro por periodo em movimentacoes (data inicio e data fim)
- Paginacao real em movimentacoes (API-driven)
- Loading global e toast global para sucesso/erro
- Confirmacao antes de exclusao

## Estrutura

`src/api` - cliente Axios, interceptors e servicos por dominio

`src/contexts` - estado global de autenticacao e feedback

`src/pages` - telas principais

`src/components` - componentes reutilizaveis

`src/layouts` e `src/routes` - layout e roteamento
