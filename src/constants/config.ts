export const CONFIG = {
  apiUrl:
    process.env.EXPO_PUBLIC_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? `${window.location.origin}`
      : 'http://localhost:4000'),
  environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development'
};
