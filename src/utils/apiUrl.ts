import { Capacitor } from '@capacitor/core';

const isNativeCapacitor = typeof window !== 'undefined' && Capacitor.isNativePlatform();
const defaultApiBaseUrl = isNativeCapacitor ? 'http://10.0.2.2:3000' : '';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl).replace(/\/+$/, '');

/**
 * Returns a fully qualified API URL targeting the Express backend.
 * Automatically handles browser same-origin requests, Android Emulator (10.0.2.2),
 * native Capacitor app builds, and explicit VITE_API_BASE_URL overrides.
 */
export const apiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
