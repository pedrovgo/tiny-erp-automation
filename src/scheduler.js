const cron = require('node-cron');
const logger = require('./config/logger');
const { isJobEnabled, jobEnvVarName } = require('./config/env');

/**
 * Registra e agenda todos os jobs da lista.
 * Cada job precisa ter: { name, cronExpression, run() }
 *
 * Cada job pode ser ligado/desligado individualmente via variável de ambiente
 * JOB_<NOME_DO_JOB>_ENABLED=false (veja config/env.js#isJobEnabled). Por padrão,
 * na ausência da variável, o job fica habilitado.
 *
 * Garante que:
 * - Erros dentro de um job não derrubam o processo nem afetam outros jobs
 * - Duas execuções do mesmo job nunca rodam em paralelo (proteção contra jobs lentos)
 */
function scheduleJobs(jobs) {
  jobs.forEach((job) => {
    if (!isJobEnabled(job.name)) {
      logger.info(`Job "${job.name}" desabilitado via ${jobEnvVarName(job.name)}=false. Não será agendado.`);
      return;
    }

    if (!cron.validate(job.cronExpression)) {
      logger.error(`Job "${job.name}" ignorado: cron expression inválida ("${job.cronExpression}")`);
      return;
    }

    let isRunning = false;

    cron.schedule(job.cronExpression, async () => {
      if (isRunning) {
        logger.warn(`Job "${job.name}" ainda em execução; execução agendada foi ignorada para evitar sobreposição.`);
        return;
      }

      isRunning = true;
      const startedAt = Date.now();

      try {
        await job.run();
        const durationMs = Date.now() - startedAt;
        logger.info(`Job "${job.name}" concluído com sucesso em ${durationMs}ms.`);
      } catch (error) {
        logger.error(`Job "${job.name}" falhou: ${error.message}`);
      } finally {
        isRunning = false;
      }
    });

    logger.info(`Job "${job.name}" agendado com cron "${job.cronExpression}".`);
  });
}

module.exports = { scheduleJobs };
