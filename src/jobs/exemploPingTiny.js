const logger = require('../config/logger');
const tinyApiClient = require('../services/tinyApiClient');

/**
 * Job de exemplo: apenas valida que a conexão com a API do Tiny está funcionando,
 * pesquisando a lista de produtos (endpoint leve e comum a todas as contas).
 *
 * Sirva-se deste arquivo como modelo para criar novos jobs em src/jobs/.
 * Cada job deve exportar: { name, cronExpression, run() }
 */
module.exports = {
  name: 'exemplo-ping-tiny',

  // TEMPORÁRIO: roda a cada 1 minuto, só para teste. Ajuste para '0 * * * *' (1x/hora) depois.
  cronExpression: '* * * * *',

  async run() {
    logger.info('[exemplo-ping-tiny] Iniciando execução...');

    const retorno = await tinyApiClient.request('produtos.pesquisa.php', {
      pesquisa: '',
    });

    const total = retorno.produtos ? retorno.produtos.length : 0;
    logger.info(`[exemplo-ping-tiny] Conexão OK. ${total} produto(s) retornado(s) na página atual.`);
  },
};
