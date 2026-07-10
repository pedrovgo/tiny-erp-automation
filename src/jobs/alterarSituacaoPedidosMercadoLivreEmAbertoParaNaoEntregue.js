const logger = require('../config/logger');
const tinyApiClient = require('../services/tinyApiClient');
const { identificarMarketplace } = require('../services/marketplaceIdentifier');

/**
 * Busca pedidos com situação "em aberto" no Tiny, filtra apenas os que vieram do
 * Mercado Livre (via heurística de `numero_ecommerce`, ver marketplaceIdentifier.js)
 * para posterior atualização para a situação "não entregue".
 *
 * TODO: implementar a etapa de atualização da situação do pedido (ex: via
 * pedido.atualizar.situacao.php), após validar a filtragem por marketplace.
 */
module.exports = {
  name: 'alterar-situacao-pedidos-mercado-livre-em-aberto-para-nao-entregue',

  // TEMPORÁRIO: roda a cada 1 minuto, só para teste. Ajuste depois (ex: '*/15 * * * *').
  cronExpression: '*/5 * * * *',

  async run() {
    logger.info('[alterar-situacao-pedidos-mercado-livre-em-aberto-para-nao-entregue] Iniciando execução...');

    const retornoPedidos = await tinyApiClient.request('pedidos.pesquisa.php', {
      situacao: 'aberto',
    });

    const pedidos = (retornoPedidos.pedidos || []).map((item) => item.pedido);

    const pedidosMercadoLivre = pedidos.filter(
      (pedido) => identificarMarketplace(pedido.numero_ecommerce) === 'Mercado Livre'
    );

    logger.info(
      `[alterar-situacao-pedidos-mercado-livre-em-aberto-para-nao-entregue] ${pedidos.length} pedido(s) em aberto encontrado(s), ${pedidosMercadoLivre.length} do Mercado Livre.`
    );

    for (const pedido of pedidosMercadoLivre) {
      const retornoSituacao = await tinyApiClient.request('pedido.alterar.situacao', {
        id: pedido.id,
        situacao: 'nao_entregue',
      });

      logger.info(
        `[alterar-situacao-pedidos-mercado-livre-em-aberto-para-nao-entregue] Pedido ${pedido.id} alterado para "não entregue". Retorno: ${JSON.stringify(
          retornoSituacao
        )}`
      );
    }

    logger.info(
      `[alterar-situacao-pedidos-mercado-livre-em-aberto-para-nao-entregue] Execução finalizada.`
    );
  },
};
