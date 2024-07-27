import { getEnvironmentNumber, getEnvironmentString } from './environment';

const GlobalConfig = Object.freeze({
  ENVIRONMENT: getEnvironmentString('NODE_ENV', 'development'),
  IS_TEST: getEnvironmentString('NODE_ENV', 'development') === 'test',
  IS_DEVELOPMENT: getEnvironmentString('NODE_ENV', 'development') === 'development',
  IS_PRODUCTION: getEnvironmentString('NODE_ENV', 'development') === 'production',
  LOGS_ENABLED: getEnvironmentString('LOGS_ENABLED', 'true') === 'true',
  LOGS_FOLDER: getEnvironmentString('LOGS_FOLDER', 'logs'),
  STORE_SESSIONS_IN_CACHE: getEnvironmentString('SESSIONS_STORAGE', 'cache') !== 'db',
  STORE_SESSIONS_IN_DB: getEnvironmentString('SESSIONS_STORAGE', 'cache') === 'db',
  PINO_LOGGER_KEY: 'pino-logger'
});

const DatabaseConfig = Object.freeze({
  DB_TYPE: getEnvironmentString('DB_TYPE', 'postgresql') as any,
  DB_URL: getEnvironmentString('DB_URL'),
  DB_DIRECT_URL: getEnvironmentString('DB_DIRECT_URL')
});

const CacheConfig = Object.freeze({
  CACHE_HOST: getEnvironmentString('CACHE_HOST', 'localhost'),
  CACHE_PORT: getEnvironmentNumber('CACHE_PORT', 6379),
  CACHE_PASSWORD: getEnvironmentString('CACHE_PASSWORD'),
  CACHE_USER: getEnvironmentString('CACHE_USER'),
  CACHE_DB: getEnvironmentNumber('CACHE_DB', 0),
  CACHE_TLS: getEnvironmentString('CACHE_TLS', 'false') === 'true'
});

const LLMConfig = Object.freeze({
  OPENAI_API_KEY: getEnvironmentString('OPENAI_API_KEY'),
  LANGCHAIN_TRACING_V2: getEnvironmentString('LANGCHAIN_TRACING_V2', 'false'),
  LANGCHAIN_ENDPOINT: getEnvironmentString('LANGCHAIN_ENDPOINT', ''),
  LANGCHAIN_API_KEY: getEnvironmentString('LANGCHAIN_API_KEY', ''),
  LANGCHAIN_PROJECT: getEnvironmentString('LANGCHAIN_PROJECT', '')
});

export { CacheConfig, DatabaseConfig, GlobalConfig, LLMConfig };
