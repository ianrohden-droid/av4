1- Organizador de TarefasUm gerenciador de tarefas/eventos completo feito pra colocar em prática o desenvolvimento de uma aplicação web com Node.js, Express e JavaScript vanilla. Sobre o projetoA ideia do projeto é centralizar tarefas e compromissos do dia a dia de forma simples, permitindo organizar tudo por categorias, datas e prioridades.Diferente de um "To-Do" básico de tela única, aqui foi feito o ciclo completo de um CRUD: a interface se conecta a uma API em Express que cria, lê, atualiza e deleta as tarefas persidindo tudo em um arquivo tarefas.json local.⚙️ O que dá pra fazer➕ Cadastrar: Adiciona tarefas informando título, descrição, data/horário, categoria e nível de prioridade.📌 Listar & Ordenar: Visualiza as tarefas organizadas automaticamente por ordem cronológica.🔍 Filtrar:Por status (todas, pendentes ou concluídas).Por categoria (estudo, trabalho, pessoal, evento, etc.).Checkbox/Status: Marcar e desmarcar tarefas como concluídas a qualquer momento.🗑️ Excluir: Remover tarefas que não são mais necessárias.🛠️ TecnologiasBackend: Node.js, ExpressFrontend: HTML5, CSS3, JavaScript (Vanilla)Armazenamento: JSON (módulo fs do Node)📁 Estrutura de PastasPlaintextorganizador-tarefas/
├── public/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── package.json
├── server.js
└── tarefas.json
2- Como rodar o projetoEntre na pasta e instale as dependências:Bashcd organizador-tarefas
npm install
Inicie o servidor local:Bashnpm start
Acesse no seu navegador:Plaintexthttp://localhost:3000
3- Rotas da APIMétodoRotaDescriçãoGET/tarefasTraz todas as tarefas cadastradasPOST/tarefasCria uma nova tarefaPUT/tarefas/:idAlterna o status (concluída / pendente)DELETE/tarefas/:idRemove uma tarefa pelo ID📄 Exemplo do objeto tarefaJSON{
  "id": "1689230491",
  "titulo": "Entregar relatório",
  "descricao": "Enviar o relatório mensal em PDF por e-mail",
  "data": "2026-08-25",
  "horario": "14:30",
  "categoria": "trabalho",
  "prioridade": "alta",
  "concluida": false
}
