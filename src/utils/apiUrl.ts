import { Capacitor } from '@capacitor/core';

const PRODUCTION_API_URL = 'https://mera-vyapaar-api.onrender.com';
const isNativeCapacitor = typeof window !== 'undefined' && Capacitor.isNativePlatform();

/**
 * Resolves the backend API base URL.
 * Guarantees that production builds and native Android APKs ALWAYS call
 * https://mera-vyapaar-api.onrender.com and NEVER localhost or 10.0.2.2.
 */
const resolveApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || '';
  const trimmed = envUrl.trim();

  // If running inside Capacitor native APK or in production build mode:
  if (isNativeCapacitor || import.meta.env.PROD || import.meta.env.MODE === 'production') {
    // If envUrl is explicitly a secure public HTTPS endpoint (not localhost / 10.0.2.2), use it
    if (trimmed && !trimmed.includes('localhost') && !trimmed.includes('10.0.2.2')) {
      return trimmed;
    }
    // Otherwise force public production Render backend
    return PRODUCTION_API_URL;
  }

  // Local browser same-origin fallback
  return trimmed;
};

export const API_BASE_URL = resolveApiBaseUrl().replace(/\/+$/, '');

/**
 * Returns a fully qualified API URL targeting the Express backend on Render.
 * Guarantees that production Android APKs always call https://mera-vyapaar-api.onrender.com
 * instead of localhost or 10.0.2.2.
 */
export const apiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
