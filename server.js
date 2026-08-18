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
  return JSON.parse(conteudo || '[]');
};

const salvarTarefas = (tarefas) => {
  fs.writeFileSync(arquivoTarefas, JSON.stringify(tarefas, null, 2));
};

const validarTarefa = (tarefa) => {
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

app.get('/tarefas', (req, res) => {
  try {
    const tarefas = lerTarefas();
    tarefas.sort((a, b) => new Date(a.data) - new Date(b.data));
    res.json(tarefas);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar tarefas.' });
  }
});

app.post('/tarefas', (req, res) => {
  try {
    const novaTarefa = req.body;
    const erro = validarTarefa(novaTarefa);

    if (erro) {
      return res.status(400).json({ erro });
    }

    const tarefas = lerTarefas();
    const ultimaTarefa = tarefas[tarefas.length - 1];
    const proximoId = ultimaTarefa ? ultimaTarefa.id + 1 : 1;

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
    const { concluida } = req.body;
    const tarefas = lerTarefas();
    const tarefa = tarefas.find((item) => item.id === Number(id));

    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    }

    tarefa.concluida = Boolean(concluida);
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
