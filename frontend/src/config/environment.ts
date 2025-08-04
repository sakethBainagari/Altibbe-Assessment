// Environment configuration for different deployment stages
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  aiServiceUrl: import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5001',
  environment: import.meta.env.MODE || 'development',
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV
};

export default config;
