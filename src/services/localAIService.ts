import { registerPlugin } from '@capacitor/core';

interface LocalAIPlugin {
  isModelAvailable(): Promise<{ available: boolean; sizeBytes: number }>;
  downloadModel(): Promise<{ success: boolean; path?: string; sizeBytes?: number }>;
  generate(options: { prompt: string }): Promise<{ success: boolean; reply?: string; model?: string; error?: string }>;
  addListener(
    eventName: 'modelDownloadProgress',
    listenerFunc: (event: { downloadedBytes: number; totalBytes: number; percent: number }) => void
  ): Promise<{ remove: () => Promise<void> }>;
}

const LocalAI = registerPlugin<LocalAIPlugin>('LocalAI');

export interface LocalAIGenerateInput {
  prompt: string;
  language: string;
  ledgerSummary: string;
  history: Array<{ role: 'user' | 'assistant'; text: string }>;
}

export const LOCAL_AI_MODEL = 'Qwen3 1.7B (on-device)';

const languageNames: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  mr: 'Marathi',
  te: 'Telugu',
  ta: 'Tamil',
  bn: 'Bengali'
};

const buildLocalPrompt = ({
  prompt,
  language,
  ledgerSummary,
  history
}: LocalAIGenerateInput): string => {
  const languageName = languageNames[language] || 'English';
  const recentHistory = history
    .slice(-8)
    .map((message) => `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.text}`)
    .join('\n');

  return [
    'You are Mera Vyapaar Offline AI, a helpful small-business assistant for Indian entrepreneurs.',
    `Reply in ${languageName}. Use the user's selected language naturally; do not translate it into English unless asked.`,
    'You are running fully offline. Do not claim live market prices, current government information, web searches, or real-time data.',
    'Use the ledger summary when it helps answer the question.',
    'Be concise, practical, and honest about uncertainty.',
    '',
    `Ledger summary: ${ledgerSummary}`,
    '',
    recentHistory ? `Recent conversation:\n${recentHistory}\n` : '',
    `Current user question: ${prompt}`
  ].join('\n');
};

export async function isLocalAIAvailable(): Promise<boolean> {
  try {
    const result = await LocalAI.isModelAvailable();
    return Boolean(result?.available);
  } catch {
    return false;
  }
}

export async function downloadLocalAIModel(
  onProgress?: (percent: number) => void
): Promise<void> {
  let listener: { remove: () => Promise<void> } | undefined;

  try {
    if (onProgress) {
      listener = await LocalAI.addListener('modelDownloadProgress', (event) => {
        onProgress(Math.max(0, Math.min(100, Number(event.percent) || 0)));
      });
    }

    const result = await LocalAI.downloadModel();
    if (!result?.success) {
      throw new Error('Offline AI model download failed');
    }
  } finally {
    if (listener) {
      await listener.remove().catch(() => {});
    }
  }
}

export async function generateLocalAI(
  input: LocalAIGenerateInput,
  onDownloadProgress?: (percent: number) => void
): Promise<{ reply: string; model: string }> {
  if (!(await isLocalAIAvailable())) {
    await downloadLocalAIModel(onDownloadProgress);
  }

  const result = await LocalAI.generate({
    prompt: buildLocalPrompt(input)
  });

  if (!result?.success || !result.reply?.trim()) {
    throw new Error(result?.error || 'Offline AI could not generate a response');
  }

  return {
    reply: result.reply.trim(),
    model: result.model || LOCAL_AI_MODEL
  };
}
