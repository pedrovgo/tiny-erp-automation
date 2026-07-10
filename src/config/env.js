require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

/**
 * Converte o nome de um job (ex: "exemplo-ping-tiny") na variável de ambiente
 * usada para ligá-lo/desligá-lo (ex: "JOB_EXEMPLO_PING_TINY_ENABLED").
 */
function jobEnvVarName(jobName) {
  const normalized = jobName.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  return `JOB_${normalized}_ENABLED`;
}

/**
 * Indica se um job está habilitado, com base na variável de ambiente
 * JOB_<NOME_DO_JOB>_ENABLED (true/false). Se a variável não existir, o job
 * é considerado habilitado por padrão (opt-out, não opt-in).
 */
function isJobEnabled(jobName) {
  const envVar = jobEnvVarName(jobName);
  const value = process.env[envVar];

  if (value === undefined || value.trim() === '') {
    return true;
  }

  return value.trim().toLowerCase() === 'true';
}

module.exports = {
  tiny: {
    apiToken: process.env.NODE_ENV === 'test' ? 'test-token' : required('TINY_API_TOKEN'),
    baseUrl: process.env.TINY_API_BASE_URL || 'https://api.tiny.com.br/api2',
  },
  logLevel: process.env.LOG_LEVEL || 'info',
  nodeEnv: process.env.NODE_ENV || 'development',
  jobEnvVarName,
  isJobEnabled,
};
