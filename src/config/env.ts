/**
 * 环境变量配置
 * 支持 Cloudflare Pages、Vercel 等托管平台的变量读取
 */

export interface EnvConfig {
  // AI服务配置
  aiApiEndpoint: string;
  aiApiKey: string;
  aiModel: string;
  aiMaxTokens: number;
  aiTemperature: number;
  
  // Jina AI配置
  jinaApiKey: string;
  
  // 应用配置
  appTitle: string;
  appDescription: string;
  
  // 环境信息
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * 获取环境变量，支持多种托管平台
 */
function getEnvVar(key: string, defaultValue: string = ''): string {
  // 优先从 Vite 环境变量读取
  if (import.meta.env[key]) {
    return import.meta.env[key];
  }
  
  // 支持 Cloudflare Pages 环境变量
  if (typeof window !== 'undefined' && (window as any).ENV && (window as any).ENV[key]) {
    return (window as any).ENV[key];
  }
  
  // 支持 Vercel 环境变量
  if (typeof window !== 'undefined' && (window as any).process?.env?.[key]) {
    return (window as any).process.env[key];
  }
  
  return defaultValue;
}

/**
 * 获取数字类型的环境变量
 */
function getEnvNumber(key: string, defaultValue: number): number {
  const value = getEnvVar(key);
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * 获取布尔类型的环境变量
 */
function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = getEnvVar(key);
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
}

/**
 * 环境配置
 */
export const envConfig: EnvConfig = {
  // AI服务配置
  aiApiEndpoint: getEnvVar('VITE_AI_API_ENDPOINT', 'https://api.openai.com/v1/chat/completions'),
  aiApiKey: getEnvVar('VITE_AI_API_KEY', ''),
  aiModel: getEnvVar('VITE_AI_MODEL', 'gpt-3.5-turbo'),
  aiMaxTokens: getEnvNumber('VITE_AI_MAX_TOKENS', 2000),
  aiTemperature: getEnvNumber('VITE_AI_TEMPERATURE', 0.7),
  
  // Jina AI配置
  jinaApiKey: getEnvVar('VITE_JINA_API_KEY', ''),
  
  // 应用配置
  appTitle: getEnvVar('VITE_APP_TITLE', 'Static Nav'),
  appDescription: getEnvVar('VITE_APP_DESCRIPTION', '静态导航网站管理工具'),
  
  // 环境信息
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

/**
 * 检查AI配置是否完整
 */
export function isAIConfigValid(): boolean {
  return !!(envConfig.aiApiEndpoint && envConfig.aiApiKey);
}

/**
 * 获取AI配置状态信息
 */
export function getAIConfigStatus(): {
  isValid: boolean;
  hasEndpoint: boolean;
  hasApiKey: boolean;
  message: string;
} {
  const hasEndpoint = !!envConfig.aiApiEndpoint;
  const hasApiKey = !!envConfig.aiApiKey;
  const isValid = hasEndpoint && hasApiKey;
  
  let message = '';
  if (!hasEndpoint) {
    message = 'AI API端点未配置';
  } else if (!hasApiKey) {
    message = 'AI API密钥未配置';
  } else {
    message = 'AI配置完整';
  }
  
  return {
    isValid,
    hasEndpoint,
    hasApiKey,
    message
  };
}

/**
 * 在开发环境下打印配置信息（不包含敏感信息）
 */
if (envConfig.isDevelopment) {
  console.log('🔧 环境配置:', {
    aiApiEndpoint: envConfig.aiApiEndpoint,
    aiModel: envConfig.aiModel,
    aiMaxTokens: envConfig.aiMaxTokens,
    aiTemperature: envConfig.aiTemperature,
    appTitle: envConfig.appTitle,
    hasApiKey: !!envConfig.aiApiKey,
    hasJinaApiKey: !!envConfig.jinaApiKey,
    isDevelopment: envConfig.isDevelopment,
    isProduction: envConfig.isProduction,
  });
  
  // 调试环境变量读取
  console.log('🔍 环境变量调试:', {
    'VITE_AI_API_ENDPOINT': import.meta.env.VITE_AI_API_ENDPOINT,
    'VITE_AI_API_KEY': import.meta.env.VITE_AI_API_KEY ? 'Set' : 'Not set',
    'VITE_AI_MODEL': import.meta.env.VITE_AI_MODEL,
    'VITE_AI_MAX_TOKENS': import.meta.env.VITE_AI_MAX_TOKENS,
    'VITE_AI_TEMPERATURE': import.meta.env.VITE_AI_TEMPERATURE,
    'VITE_JINA_API_KEY': import.meta.env.VITE_JINA_API_KEY ? 'Set' : 'Not set',
  });
}
