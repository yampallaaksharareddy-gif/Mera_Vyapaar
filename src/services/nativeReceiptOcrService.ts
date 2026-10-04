import { registerPlugin } from '@capacitor/core';

export interface ReceiptOcrPlugin {
  scan(options: {
    image: string;
    language: string;
  }): Promise<{
    success: boolean;
    text?: string;
    engine?: string;
    language?: string;
    languageSupported?: boolean;
    error?: string;
  }>;
}

export const ReceiptOcr = registerPlugin<ReceiptOcrPlugin>('ReceiptOcr');

export async function runNativeReceiptOcr(
  image: string,
  language: string
): Promise<{
  success: boolean;
  text?: string;
  engine?: string;
  languageSupported?: boolean;
  error?: string;
}> {
  return ReceiptOcr.scan({ image, language });
}
