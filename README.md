# Tiny ERP Automation

Serviço Node.js para automatizar rotinas do [Tiny ERP](https://tiny.com.br) via API v2, com tarefas agendadas (cron) rodando continuamente em servidor.

## Stack

- **Node.js** (>=20 LTS)
- **node-cron** — agendamento de tarefas
- **axios** — cliente HTTP para a API do Tiny
- **winston** — logging estruturado (console + arquivo)
- **dotenv** — variáveis de ambiente

## Estrutura

```
src/
  config/
    env.js        # carrega e valida variáveis de ambiente
    logger.js      # configuração do winston
  services/
    tinyApiClient.js  # cliente genérico da API v2 do Tiny
  jobs/
    exemploPingTiny.js  # modelo de job — copie para criar novos
  scheduler.js     # registra e executa os jobs agendados
  index.js         # ponto de entrada
logs/              # arquivos de log (gerados em runtime, não versionados)
```

## Configuração

1. Copie `.env.example` para `.env` e preencha o token da API:
   ```bash
   cp .env.example .env
   ```
2. Gere o token em: **Tiny ERP > Configurações > API** (aba "Tokens" ou "API v2").

## Instalação e execução local

```bash
npm install
npm start
```

## Criando um novo job

1. Crie um arquivo em `src/jobs/`, seguindo o modelo de `exemploPingTiny.js`:
   ```js
   module.exports = {
     name: 'nome-do-job',
     cronExpression: '0 8 * * *', // todo dia às 8h
     async run() {
       // lógica da rotina, usando tinyApiClient.request(endpoint, params)
     },
   };
   ```
2. Importe e adicione o job à lista em `src/index.js`.
3. Adicione a variável `JOB_<NOME_DO_JOB>_ENABLED=true` no `.env.example` (opcional, mas recomendado para documentar).

Cada job roda de forma isolada: um erro em um job não interrompe os demais nem derruba o processo. O scheduler também evita que duas execuções do mesmo job rodem em paralelo.

## Ligando/desligando jobs individualmente

Cada job pode ser habilitado ou desabilitado via variável de ambiente, sem precisar alterar código:

```bash
# Desliga o job "exemplo-ping-tiny"
JOB_EXEMPLO_PING_TINY_ENABLED=false
```

A variável é derivada do `name` do job: maiúsculo, com `-` e espaços virando `_`, no formato `JOB_<NOME>_ENABLED`. Se a variável não existir no `.env`, o job fica **habilitado por padrão**.

## Deploy em VPS (systemd)

1. Envie o projeto para o servidor (git clone ou scp), instale dependências (`npm ci --omit=dev`) e configure o `.env`.
2. Crie o arquivo de serviço `/etc/systemd/system/tiny-erp-automation.service`:
   ```ini
   [Unit]
   Description=Tiny ERP Automation Service
   After=network.target

   [Service]
   Type=simple
   WorkingDirectory=/caminho/para/tiny-erp-automation
   ExecStart=/usr/bin/node src/index.js
   Restart=on-failure
   RestartSec=10
   User=seu_usuario
   EnvironmentFile=/caminho/para/tiny-erp-automation/.env

   [Install]
   WantedBy=multi-user.target
   ```
3. Ative e inicie o serviço:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable tiny-erp-automation
   sudo systemctl start tiny-erp-automation
   sudo systemctl status tiny-erp-automation
   ```
4. Acompanhe logs em tempo real:
   ```bash
   journalctl -u tiny-erp-automation -f
   # ou
   tail -f logs/app.log
   ```

## Próximos passos

- [ ] Definir a primeira rotina real a ser automatizada
- [ ] Adicionar testes (ex: Jest) para os jobs e para o cliente da API
- [ ] Considerar alertas (ex: e-mail/Slack) em caso de falha recorrente de um job
