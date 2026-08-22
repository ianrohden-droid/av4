const form = document.getElementById('form-tarefa');
const listaTarefas = document.getElementById('lista-tarefas');
const filtroStatus = document.getElementById('filtro-status');
const filtroCategoria = document.getElementById('filtro-categoria');
const contadorTarefas = document.getElementById('contador-tarefas');

let tarefas = [];

const formatarData = (data) => {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-').map(Number);
  if (!ano || !mes || !dia) return data;

  const dataLocal = new Date(ano, mes - 1, dia);
  return dataLocal.toLocaleDateString('pt-BR');
};

const formatarHorario = (horario) => {
  if (!horario) return '';
  return horario.slice(0, 5);
};

const statusTexto = (concluida) => (concluida ? 'Concluída' : 'Pendente');

const prioridadeClass = (prioridade) => {
  if (prioridade === 'Alta') return 'alta';
  if (prioridade === 'Média') return 'media';
  return 'baixa';
};

const getDataHora = (tarefa) => {
  const horario = tarefa.horario || '00:00';
  return new Date(`${tarefa.data}T${horario}`);
};

const renderizarResumo = () => {
  const total = tarefas.length;
  const pendentes = tarefas.filter((tarefa) => !tarefa.concluida).length;
  const concluidas = tarefas.filter((tarefa) => tarefa.concluida).length;

  contadorTarefas.innerHTML = `
    <span><strong>${total}</strong> total</span>
    <span><strong>${pendentes}</strong> pendentes</span>
    <span><strong>${concluidas}</strong> concluídas</span>
  `;
};

const renderizarTarefas = () => {
  const statusSelecionado = filtroStatus.value;
  const categoriaSelecionada = filtroCategoria.value;

  let tarefasFiltradas = [...tarefas];

  if (statusSelecionado === 'Pendentes') {
    tarefasFiltradas = tarefasFiltradas.filter((tarefa) => !tarefa.concluida);
  } else if (statusSelecionado === 'Concluídas') {
    tarefasFiltradas = tarefasFiltradas.filter((tarefa) => tarefa.concluida);
  }

  if (categoriaSelecionada !== 'Todas') {
    tarefasFiltradas = tarefasFiltradas.filter((tarefa) => tarefa.categoria === categoriaSelecionada);
  }

  tarefasFiltradas.sort((a, b) => getDataHora(a) - getDataHora(b));

  if (tarefasFiltradas.length === 0) {
    listaTarefas.innerHTML = '<div class="empty-state">Nenhuma tarefa encontrada para esse filtro.</div>';
    return;
  }

  listaTarefas.innerHTML = tarefasFiltradas
    .map(
      (tarefa) => `
        <article class="tarefa ${tarefa.concluida ? 'concluida' : ''}">
          <div class="tarefa-header">
            <div>
              <p class="categoria-chip">${tarefa.categoria}</p>
              <h3 class="titulo">${tarefa.titulo}</h3>
            </div>
            <span class="badge ${prioridadeClass(tarefa.prioridade)}">${tarefa.prioridade}</span>
          </div>

          <p class="meta">📅 ${formatarData(tarefa.data)}${formatarHorario(tarefa.horario) ? ` • ⏰ ${formatarHorario(tarefa.horario)}` : ''}</p>
          <p class="meta">📝 ${tarefa.descricao || 'Sem descrição'}</p>
          <p class="status ${tarefa.concluida ? 'concluida' : 'pendente'}">Status: ${statusTexto(tarefa.concluida)}</p>

          <div class="actions">
            <button class="action-btn concluir" data-id="${tarefa.id}">${tarefa.concluida ? 'Reabrir' : 'Concluir'}</button>
            <button class="action-btn excluir" data-id="${tarefa.id}">Excluir</button>
          </div>
        </article>
      `
    )
    .join('');
};

const carregarTarefas = async () => {
  try {
    const resposta = await fetch('/tarefas');
    const dados = await resposta.json();
    tarefas = Array.isArray(dados) ? dados : [];
    renderizarResumo();
    renderizarTarefas();
  } catch (error) {
    console.error('Erro ao carregar tarefas:', error);
    listaTarefas.innerHTML = '<div class="empty-state">Erro ao carregar tarefas.</div>';
  }
};

const mostrarMensagem = (mensagem, tipo = 'sucesso') => {
  const toast = document.getElementById('toast');
  toast.textContent = mensagem;
  toast.className = `toast ${tipo} show`;

  setTimeout(() => {
    toast.className = 'toast';
  }, 2400);
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const tarefa = {
    titulo: document.getElementById('titulo').value.trim(),
    descricao: document.getElementById('descricao').value.trim(),
    data: document.getElementById('data').value,
    horario: document.getElementById('horario').value,
    categoria: document.getElementById('categoria').value,
    prioridade: document.getElementById('prioridade').value,
  };

  try {
    const resposta = await fetch('/tarefas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tarefa),
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(resultado.erro || 'Erro ao cadastrar tarefa');
    }

    form.reset();
    mostrarMensagem('Tarefa adicionada com sucesso!');
    carregarTarefas();
  } catch (error) {
    mostrarMensagem(error.message, 'erro');
  }
});

listaTarefas.addEventListener('click', async (event) => {
  const botao = event.target.closest('button');
  if (!botao) return;

  const id = Number(botao.dataset.id);
  if (!id) return;

  try {
    if (botao.classList.contains('concluir')) {
      const tarefa = tarefas.find((item) => item.id === id);
      if (!tarefa) return;

      const resposta = await fetch(`/tarefas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ concluida: !tarefa.concluida }),
      });

      const resultado = await resposta.json();
      if (!resposta.ok) {
        throw new Error(resultado.erro || 'Erro ao alterar tarefa');
      }

      mostrarMensagem(`Tarefa ${!tarefa.concluida ? 'concluída' : 'reaberta'}!`);
    }

    if (botao.classList.contains('excluir')) {
      const confirmar = window.confirm('Deseja realmente excluir esta tarefa?');
      if (!confirmar) return;

      const resposta = await fetch(`/tarefas/${id}`, {
        method: 'DELETE',
      });

      const resultado = await resposta.json();
      if (!resposta.ok) {
        throw new Error(resultado.erro || 'Erro ao excluir tarefa');
      }

      mostrarMensagem('Tarefa excluída com sucesso!');
    }

    carregarTarefas();
  } catch (error) {
    mostrarMensagem(error.message, 'erro');
  }
});

filtroStatus.addEventListener('change', renderizarTarefas);
filtroCategoria.addEventListener('change', renderizarTarefas);

carregarTarefas();
