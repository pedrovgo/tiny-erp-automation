const axios = require('axios');
const config = require('../config/env');
const logger = require('../config/logger');

/**
 * Cliente para a API v2 do Tiny ERP.
 *
 * A API v2 do Tiny segue um padrão próprio (não é REST convencional):
 * - Endpoints terminam em .php (ex: produtos.pesquisa.php)
 * - Parâmetros são enviados via querystring/form, sempre incluindo token e formato=json
 * - O corpo de resposta sempre vem dentro de um envelope `retorno`, com
 *   `status` ("OK" | "Erro") e, em caso de erro, uma lista `erros`.
 *
 * Referência oficial: https://tiny.com.br/api-docs/
 */
class TinyApiClient {
  constructor() {
    this.http = axios.create({
      baseURL: config.tiny.baseUrl,
      timeout: 15000,
    });
  }

  /**
   * Executa uma chamada à API v2 do Tiny.
   * @param {string} endpoint - ex: 'produtos.pesquisa.php'
   * @param {Record<string, string|number>} params - parâmetros específicos do endpoint
   * @returns {Promise<any>} conteúdo de `retorno` já validado
   */
  async request(endpoint, params = {}) {
    const searchParams = new URLSearchParams({
      token: config.tiny.apiToken,
      formato: 'json',
      ...params,
    });

    try {
      const response = await this.http.post(endpoint, searchParams, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const retorno = response.data && response.data.retorno;

      if (!retorno) {
        throw new Error(`Resposta inesperada da API do Tiny para ${endpoint}: ${JSON.stringify(response.data)}`);
      }

      if (retorno.status === 'Erro') {
        const mensagens = (retorno.erros || [])
          .map((e) => e.erro)
          .join('; ') || 'Erro não especificado';
        throw new Error(`Erro retornado pela API do Tiny em ${endpoint}: ${mensagens}`);
      }

      return retorno;
    } catch (error) {
      logger.error(`Falha ao chamar Tiny API [${endpoint}]: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new TinyApiClient();
