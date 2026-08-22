const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const arquivoTarefas = path.join(__dirname, 'tarefas.json');

const categoriasValidas = ['Estudo', 'Trabalho', 'Pessoal', 'Evento', 'Outro'];
const prioridadesValidas = ['Baixa', 'Média', 'Alta'];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const lerTarefas = () => {
  const conteudo = fs.readFileSync(arquivoTarefas, 'utf-8');
  const tarefas = JSON.parse(conteudo || '[]');
  return Array.isArray(tarefas) ? tarefas : [];
};

const salvarTarefas = (tarefas) => {
  fs.writeFileSync(arquivoTarefas, JSON.stringify(tarefas, null, 2));
};

const validarTarefa = (tarefa = {}) => {
  const { titulo, data, categoria, prioridade } = tarefa;

  if (!titulo || !titulo.trim()) {
    return 'Título é obrigatório.';
  }

  if (!data) {
    return 'Data é obrigatória.';
  }

  if (!categoria || !categoriasValidas.includes(categoria)) {
    return 'Categoria inválida.';
  }

  if (!prioridade || !prioridadesValidas.includes(prioridade)) {
    return 'Prioridade inválida.';
  }

  return null;
};

const ordenarTarefas = (lista) => {
  return [...lista].sort((a, b) => {
    const dataA = new Date(`${a.data}T${a.horario || '00:00'}`);
    const dataB = new Date(`${b.data}T${b.horario || '00:00'}`);
    return dataA - dataB;
  });
};

app.get('/tarefas', (req, res) => {
  try {
    const tarefas = ordenarTarefas(lerTarefas());
    res.json(tarefas);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar tarefas.' });
  }
});

app.post('/tarefas', (req, res) => {
  try {
    const novaTarefa = req.body || {};
    const erro = validarTarefa(novaTarefa);

    if (erro) {
      return res.status(400).json({ erro });
    }

    const tarefas = lerTarefas();
    const proximoId = tarefas.reduce((maior, tarefa) => Math.max(maior, Number(tarefa.id) || 0), 0) + 1;

    const tarefaSalva = {
      id: proximoId,
      titulo: novaTarefa.titulo.trim(),
      descricao: novaTarefa.descricao ? novaTarefa.descricao.trim() : '',
      data: novaTarefa.data,
      horario: novaTarefa.horario || '',
      categoria: novaTarefa.categoria,
      prioridade: novaTarefa.prioridade,
      concluida: false,
    };

    tarefas.push(tarefaSalva);
    salvarTarefas(tarefas);

    return res.status(201).json(tarefaSalva);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao salvar tarefa.' });
  }
});

app.put('/tarefas/:id', (req, res) => {
  try {
    const { id } = req.params;
    const tarefas = lerTarefas();
    const tarefa = tarefas.find((item) => item.id === Number(id));

    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    }

    tarefa.concluida = Boolean(req.body?.concluida);
    salvarTarefas(tarefas);

    return res.json(tarefa);
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao atualizar tarefa.' });
  }
});

app.delete('/tarefas/:id', (req, res) => {
  try {
    const { id } = req.params;
    const tarefas = lerTarefas();
    const indice = tarefas.findIndex((item) => item.id === Number(id));

    if (indice === -1) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    }

    tarefas.splice(indice, 1);
    salvarTarefas(tarefas);

    return res.json({ mensagem: 'Tarefa excluída com sucesso.' });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao excluir tarefa.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
