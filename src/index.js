const logger = require('./config/logger');
const { scheduleJobs } = require('./scheduler');

const exemploPingTiny = require('./jobs/exemploPingTiny');
const alterarSituacaoPedidosMercadoLivreEmAbertoParaNaoEntregue = require('./jobs/alterarSituacaoPedidosMercadoLivreEmAbertoParaNaoEntregue');

// Registre aqui todos os jobs que devem ser agendados.
// Basta criar um novo arquivo em src/jobs/ seguindo o modelo de exemploPingTiny.js
// e adicioná-lo a esta lista.
const jobs = [
  exemploPingTiny,
  alterarSituacaoPedidosMercadoLivreEmAbertoParaNaoEntregue,
];

function main() {
  logger.info('Iniciando serviço de automação Tiny ERP...');
  scheduleJobs(jobs);
  logger.info(`${jobs.length} job(s) agendado(s). Serviço em execução.`);
}

process.on('SIGTERM', () => {
  logger.info('Recebido SIGTERM. Encerrando serviço...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Recebido SIGINT. Encerrando serviço...');
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Rejeição de Promise não tratada: ${reason}`);
});

main();
