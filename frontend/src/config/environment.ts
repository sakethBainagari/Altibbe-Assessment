// Environment configuration for different deployment stages
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://altibbe-assessment-finalproject.vercel.app/api' : 'http://localhost:5000/api'),
  aiServiceUrl: import.meta.env.VITE_AI_SERVICE_URL || 'https://altibbe-assessment-production.up.railway.app',
  environment: import.meta.env.MODE || 'development',
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV
};

export default config;
