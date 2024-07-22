import * as dotEnvConfig from 'dotenv-defaults/config';
import * as dotenvExpand from 'dotenv-expand';

dotenvExpand.expand(dotEnvConfig);

const getEnvironmentString = (key: string, defaultValue?: string): string => {
  const v = process.env[String(key)];
  if (!v) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is required`);
  }
  return v;
};

const getEnvironmentNumber = (key: string, defaultValue?: number): number => {
  const v = process.env[String(key)];
  if (!v) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is required`);
  }
  return Number(v);
};

export { getEnvironmentNumber, getEnvironmentString };
