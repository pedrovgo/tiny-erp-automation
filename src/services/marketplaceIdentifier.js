const logger = require('../config/logger');

/**
 * Identifica o marketplace de origem de um pedido a partir do formato do campo
 * `numero_ecommerce` retornado pela API do Tiny.
 *
 * ATENÇÃO: isso é uma heurística baseada em observação de amostras reais, não em
 * documentação oficial do Tiny (o campo `numero_ecommerce` é uma string opaca,
 * sem contrato de formato). Se possível, prefira o campo `pedido.ecommerce.nomeEcommerce`
 * retornado por `pedido.obter.php`, que é explícito e oficial.
 *
 * Use esta função apenas quando não for viável chamar `pedido.obter.php` para
 * cada pedido (ex: quando o volume de chamadas à API for uma restrição).
 *
 * Padrões observados (amostra em 2026-07-10):
 * - Amazon:         702-9766557-8762626   -> \d{3}-\d{7}-\d{7}
 * - Magalu:         LU-1398570080907042   -> LU- seguido de dígitos
 * - Shopee:         260710BJGY8TNE        -> 6 dígitos + 8 alfanuméricos (com letras)
 * - Mercado Livre:  2000013947268041      -> 16 dígitos, só números
 * - TikTok Shop:    584837455155136210    -> 18 dígitos, só números
 */

const PADROES = [
  { marketplace: 'Magalu', regex: /^LU-\d+$/ },
  { marketplace: 'Amazon', regex: /^\d{3}-\d{7}-\d{7}$/ },
  { marketplace: 'Shopee', regex: /^\d{6}(?=[A-Z0-9]*[A-Z])[A-Z0-9]{7,9}$/ },
  { marketplace: 'Mercado Livre', regex: /^\d{15,16}$/ },
  { marketplace: 'TikTok Shop', regex: /^\d{17,19}$/ },
];

/**
 * @param {string} numeroEcommerce - valor do campo `numero_ecommerce` do pedido
 * @returns {string|null} nome do marketplace identificado, ou null se desconhecido
 */
function identificarMarketplace(numeroEcommerce) {
  if (!numeroEcommerce || typeof numeroEcommerce !== 'string') {
    return null;
  }

  const valor = numeroEcommerce.trim();

  const encontrado = PADROES.find(({ regex }) => regex.test(valor));

  if (!encontrado) {
    logger.warn(`Marketplace não identificado para numero_ecommerce="${valor}". Considere revisar os padrões em marketplaceIdentifier.js.`);
    return null;
  }

  return encontrado.marketplace;
}

module.exports = { identificarMarketplace };
