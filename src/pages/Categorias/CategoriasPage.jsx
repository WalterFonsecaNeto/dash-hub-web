import { useCallback, useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  atualizarCategoria,
  buscarCategorias,
  criarCategoria,
  removerCategoria,
} from '../../api/categoriasService';
import { CategoriaForm } from '../../components/Form/CategoriaForm';
import { Modal } from '../../components/Modal/Modal';
import { Table } from '../../components/Table/Table';
import { Button } from '../../components/UI/Button';
import { useAppFeedback } from '../../hooks/useAppFeedback';
import styles from './CategoriasPage.module.css';

export function CategoriasPage() {
  const { adicionarToast } = useAppFeedback();

  const [categorias, setCategorias] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const carregarCategorias = useCallback(async () => {
    const resposta = await buscarCategorias();
    setCategorias(resposta);
    setPaginaAtual(1);
  }, []);

  useEffect(() => {
    carregarCategorias();
  }, [carregarCategorias]);

  const abrirModalCriacao = () => {
    setCategoriaSelecionada(null);
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (categoria) => {
    setCategoriaSelecionada(categoria);
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setCategoriaSelecionada(null);
  };

  const abrirModalExclusao = (categoria) => {
    setCategoriaParaExcluir(categoria);
    setIsDeleteModalOpen(true);
  };

  const fecharModalExclusao = () => {
    if (isDeleting) {
      return;
    }

    setIsDeleteModalOpen(false);
    setCategoriaParaExcluir(null);
  };

  const executarExclusao = async () => {
    if (!categoriaParaExcluir) {
      return;
    }

    setIsDeleting(true);

    try {
      await removerCategoria(categoriaParaExcluir.id);
      adicionarToast({ type: 'success', message: 'Categoria removida com sucesso.' });
      setIsDeleteModalOpen(false);
      setCategoriaParaExcluir(null);
      await carregarCategorias();
    } finally {
      setIsDeleting(false);
    }
  };

  const lidarComExclusao = async (categoria) => {
    abrirModalExclusao(categoria);
  };

  const lidarComEnvio = async (dados) => {
    setIsSubmitting(true);

    try {
      if (categoriaSelecionada) {
        await atualizarCategoria(categoriaSelecionada.id, dados);
        adicionarToast({ type: 'success', message: 'Categoria atualizada.' });
      } else {
        await criarCategoria(dados);
        adicionarToast({ type: 'success', message: 'Categoria criada.' });
      }

      fecharModal();
      await carregarCategorias();
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoriasFiltradas = categorias.filter((categoria) => {
    const termo = filtroTexto.trim().toLowerCase();

    if (!termo) {
      return true;
    }

    return (
      categoria.nome.toLowerCase().includes(termo)
      || categoria.tipo.toLowerCase().includes(termo)
    );
  });

  const totalPaginas = Math.max(1, Math.ceil(categoriasFiltradas.length / itensPorPagina));
  const categoriasPaginadas = categoriasFiltradas.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

  const irParaPagina = (pagina) => {
    if (pagina < 1 || pagina > totalPaginas) {
      return;
    }

    setPaginaAtual(pagina);
  };

  const lidarComMudancaFiltro = (event) => {
    setFiltroTexto(event.target.value);
    setPaginaAtual(1);
  };

  const limparFiltro = () => {
    setFiltroTexto('');
    setPaginaAtual(1);
  };

  const recarregarDadosAtuais = async () => {
    setIsLoading(true);
    try {
      await carregarCategorias();
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'tipo', header: 'Tipo' },
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
          <h2 className={styles.title}>Categorias</h2>
          <p className={styles.description}>Gerencie as categorias de receitas e despesas.</p>
        </div>
        <div className={styles.topActions}>
          <Button variant="secondary" onClick={recarregarDadosAtuais} disabled={isLoading}>Atualizar</Button>
          <Button onClick={abrirModalCriacao}>Nova categoria</Button>
        </div>
      </div>

      <div className={styles.filters}>
        <label className={styles.filterField}>
          <span>Filtrar por nome ou tipo</span>
          <input
            type="text"
            value={filtroTexto}
            onChange={lidarComMudancaFiltro}
            placeholder="Ex: receita, despesa, mercado..."
          />
        </label>

        <div className={styles.filterActions}>
          <Button variant="secondary" onClick={limparFiltro} disabled={!filtroTexto}>
            Limpar
          </Button>
        </div>
      </div>

      <div className={styles.tableArea}>
        <Table
          columns={columns}
          data={categoriasPaginadas}
          emptyMessage="Nenhuma categoria encontrada."
          height={categoriasPaginadas.length ? '100%' : 'auto'}
        />
      </div>

      <div className={styles.pagination}>
        <Button variant="secondary" onClick={() => irParaPagina(paginaAtual - 1)} disabled={paginaAtual <= 1}>
          Anterior
        </Button>

        <span>
          Pagina {paginaAtual} de {totalPaginas} ({categoriasFiltradas.length} itens)
        </span>

        <Button variant="secondary" onClick={() => irParaPagina(paginaAtual + 1)} disabled={paginaAtual >= totalPaginas}>
          Proxima
        </Button>
      </div>

      <Modal title={categoriaSelecionada ? 'Editar categoria' : 'Nova categoria'} isOpen={isModalOpen} onClose={fecharModal}>
        <CategoriaForm
          initialData={categoriaSelecionada}
          onSubmit={lidarComEnvio}
          onCancel={fecharModal}
          submitting={isSubmitting}
        />
      </Modal>

      <Modal title="Confirmar exclusao" isOpen={isDeleteModalOpen} onClose={fecharModalExclusao}>
        <div className={styles.deleteModalContent}>
          <div className={styles.deleteIconWrapper}>
            <AlertCircle className={styles.deleteIcon} aria-hidden="true" />
          </div>

          <p>
            Deseja excluir a categoria
            {' '}
            <strong>{categoriaParaExcluir?.nome || '-'}</strong>
            ?
          </p>

          <p className={styles.deleteHint}>Esta acao nao pode ser desfeita.</p>

          <div className={styles.deleteActions}>
            <Button variant="ghost" onClick={fecharModalExclusao} disabled={isDeleting}>Cancelar</Button>
            <Button variant="danger" onClick={executarExclusao} disabled={isDeleting}>Excluir</Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
