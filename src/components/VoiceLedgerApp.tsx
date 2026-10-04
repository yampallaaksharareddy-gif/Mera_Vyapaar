import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Sparkles,
  Radio
} from 'lucide-react';
import { LedgerEntry, SupportedLanguage, TransactionType } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { parseVernacularVoiceInput } from '../utils/nlpParser';
import { getLocalizedCategory, getLocalizedPartyPrefix, getLocalizedSourceText, getLocalizedDateString } from '../utils/categoryHelper';

interface VoiceLedgerAppProps {
  entries: LedgerEntry[];
  onAddEntry: (entry: Omit<LedgerEntry, 'id' | 'timestamp' | 'isSynced'>) => void;
  onDeleteEntry: (id: string) => void;
  onSyncAll: () => void;
  currentLang: SupportedLanguage;
  isOnline: boolean;
  creditScore: number;
  onOpenCreditModal: () => void;
}

export const VoiceLedgerApp: React.FC<VoiceLedgerAppProps> = ({
  entries,
  onAddEntry,
  onDeleteEntry,
  onSyncAll,
  currentLang,
  isOnline,
  creditScore,
  onOpenCreditModal
}) => {
  const t = TRANSLATIONS[currentLang];
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Speech Recognition instance
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try { recognitionRef.current?.stop(); } catch (_) {}
  }, []);

  const getSpeakingPromptHint = (lang: SupportedLanguage) => {
    switch (lang) {
      case 'en': return 'Say e.g. "Milk sale 1200 rupees income"';
      case 'hi': return 'बोलें जैसे "दूध 1200 रु आमदनी"';
      case 'mr': return 'बोला उदा. "दूध १२०० रु उत्पन्न"';
      case 'te': return 'మాట్లాడండి ఉదా: "పాలు 1200 రూ ఆదాయం"';
      case 'ta': return 'பேசவும் எ.கா: "பால் 1200 ரூ வரவு"';
      case 'bn': return 'বলুন যেমন "দুধ ১২০০ টাকা আয়"';
      default: return 'Say e.g. "Milk sale 1200 rupees income"';
    }
  };

  // Filter current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const currentMonthEntries = entries.filter((e) => e.timestamp >= startOfMonth);

  const totalIncome = currentMonthEntries
    .filter((e) => e.transactionType === 'INCOME')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = currentMonthEntries
    .filter((e) => e.transactionType === 'EXPENSE')
    .reduce((sum, e) => sum + e.amount, 0);

  const netCashflow = totalIncome - totalExpense;
  const unsyncedCount = entries.filter((e) => !e.isSynced).length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Start voice recording with the Android/Web Speech Recognition API.
  const handleToggleVoice = async () => {
    if (isRecording) {
      await stopVoiceAndProcess(recognizedText || '');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast(currentLang === 'hi' ? 'माइक्रोफ़ोन वॉइस इनपुट उपलब्ध नहीं है।' : 'Voice input is not available on this device.');
      return;
    }

    const speechLangs: Record<SupportedLanguage, string> = { hi: 'hi-IN', mr: 'mr-IN', te: 'te-IN', ta: 'ta-IN', bn: 'bn-IN', en: 'en-IN' };
    const recognition = new SpeechRecognition();
    recognition.lang = speechLangs[currentLang] || 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsRecording(true);
      setRecognizedText('');
      setRecordingSeconds(0);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setRecordingSeconds((prev) => prev + 1), 1000);
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0]?.transcript || '';
      }
      if (transcript.trim()) setRecognizedText(transcript.trim());
    };

    recognition.onerror = (event: any) => {
      console.warn('Voice input error:', event?.error || event);
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      recognitionRef.current = null;
      showToast(currentLang === 'hi' ? 'माइक्रोफ़ोन सूचना: कृपया स्पष्ट बोलें।' : 'Microphone notice: please speak clearly.');
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn('Voice input could not start:', e);
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      recognitionRef.current = null;
    }
  };

  const stopVoiceAndProcess = async (spokenText: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    try { recognitionRef.current?.stop(); } catch (_) {}
    recognitionRef.current = null;
    setIsRecording(false);

    const finalTranscript = (spokenText || recognizedText || '').trim();

    if (!finalTranscript) {
      setIsProcessing(false);
      setRecognizedText(null);
      const noVoiceMsg: Record<SupportedLanguage, string> = {
        en: '⚠️ No speech detected. Please speak clearly into the microphone.',
        hi: '⚠️ कोई आवाज़ नहीं मिली। कृपया माइक्रोफ़ोन में स्पष्ट बोलें।',
        mr: '⚠️ आवाज ऐकू आली नाही. कृपया मायक्रोफोनमध्ये स्पष्ट बोला.',
        te: '⚠️ స్వరం గుర్తించబడలేదు. దయచేసి మైక్రోఫోన్‌లో స్పష్టంగా మాట్లాడండి.',
        ta: '⚠️ குரல் கண்டறியப்படவில்லை. தயவுசெய்து மைக்ரோஃபோனில் தெளிவாகப் பேசவும்.',
        bn: '⚠️ কোনো কথা শনাক্ত হয়নি। অনুগ্রহ করে মাইক্রোফোনে স্পষ্ট করে বলুন।'
      };
      showToast(noVoiceMsg[currentLang] || noVoiceMsg.en);
      return;
    }

    setIsProcessing(true);
    setRecognizedText(finalTranscript);

    setTimeout(() => {
      const parsed = parseVernacularVoiceInput(finalTranscript, currentLang);
      const partyPrefix = currentLang === 'en'
        ? 'Party / Customer'
        : currentLang === 'te'
        ? 'కస్టమర్ / వ్యాపారి'
        : currentLang === 'mr'
        ? 'ग्राहक / व्यापारी'
        : currentLang === 'ta'
        ? 'வாடிக்கையாளர் / வர்த்தகர்'
        : currentLang === 'bn'
        ? 'গ্রাহক / ব্যবসায়ী'
        : 'ग्राहक / व्यापारी';

      onAddEntry({
        amount: parsed.amount,
        transactionType: parsed.transactionType,
        category: parsed.category,
        sourceText: finalTranscript,
        notes: parsed.customerOrEntity
          ? `${partyPrefix}: ${parsed.customerOrEntity}`
          : (currentLang === 'en' ? 'Voice Entry' : t.khataTab)
      });

      setIsProcessing(false);
      showToast(parsed.vernacularSummary);
    }, 600);
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-32">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900 border border-emerald-500/60 text-emerald-200 px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-sm font-medium animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP DASHBOARD BANNER - Net Cashflow in Large Typography */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-950 via-stone-900 to-emerald-950/70 border border-stone-800 shadow-2xl p-6 sm:p-8 mb-6">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400/90 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {t.netCashflow}
            </span>
          </div>

          {/* Large Typography Net Cashflow Amount */}
          <div className="my-2">
            <div
              className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-sans ${
                netCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(netCashflow)}
            </div>
            <p className="text-xs text-stone-400 mt-1 font-medium">
              {t.currentMonth} • {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Breakdown Cards: Total Income & Total Expense */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {/* Total Income */}
            <div className="bg-emerald-950/40 border border-emerald-900/60 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-emerald-300/80 font-medium">{t.incomeLabel}</p>
                  <p className="text-xl font-bold text-emerald-100 font-mono">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
              </div>
              <span className="text-xs text-emerald-400/70 font-mono font-medium">
                {currentMonthEntries.filter((e) => e.transactionType === 'INCOME').length} {t.income}
              </span>
            </div>

            {/* Total Expense */}
            <div className="bg-rose-950/40 border border-rose-900/60 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-rose-300/80 font-medium">{t.expenseLabel}</p>
                  <p className="text-xl font-bold text-rose-100 font-mono">
                    {formatCurrency(totalExpense)}
                  </p>
                </div>
              </div>
              <span className="text-xs text-rose-400/70 font-mono font-medium">
                {currentMonthEntries.filter((e) => e.transactionType === 'EXPENSE').length} {t.expense}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECENT TRANSACTIONS LIST FROM ROOM DB */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-stone-300 flex items-center gap-2">
            <span>{t.recentTransactions}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 font-mono">
              {entries.length}
            </span>
          </h2>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-12 bg-stone-900/40 rounded-3xl border border-stone-800/80 p-8">
            <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center mx-auto mb-3 text-stone-400">
              <Mic className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-stone-200 mb-1">🌾 {t.emptyKhataTitle}</h3>
            <p className="text-xs text-stone-400 max-w-md mx-auto">
              {t.emptyKhataDesc}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {entries.map((entry) => {
              const isIncome = entry.transactionType === 'INCOME';
              const dateStr = getLocalizedDateString(entry.timestamp, currentLang);
              const localizedSourceText = getLocalizedSourceText(entry.sourceText, currentLang);

              return (
                <div
                  key={entry.id}
                  className="group bg-stone-900/90 hover:bg-stone-850 border border-stone-800/80 hover:border-stone-700/80 rounded-2xl p-4 transition-all flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Direction Icon */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center ${
                        isIncome
                          ? 'bg-emerald-950/80 border border-emerald-700/50 text-emerald-400'
                          : 'bg-rose-950/80 border border-rose-700/50 text-rose-400'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-stone-100 truncate">
                          {getLocalizedCategory(entry.category, currentLang)}
                        </p>
                        {/* Sync Status Badge */}
                        {entry.isSynced ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] text-emerald-400/90 font-medium px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-800/40"
                            title="Synced to PostgreSQL Cloud"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span className="hidden sm:inline">Synced</span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] text-amber-400/90 font-medium px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-800/40"
                            title="Stored in local encrypted Room DB only"
                          >
                            <AlertCircle className="w-3 h-3" />
                            <span>Room DB</span>
                          </span>
                        )}
                      </div>

                      {localizedSourceText && (
                        <p className="text-xs text-stone-400 italic truncate max-w-sm sm:max-w-md">
                          "{localizedSourceText}"
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500 font-mono">
                        <span>{dateStr}</span>
                        {entry.notes && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-xs">
                              {getLocalizedPartyPrefix(entry.notes, currentLang)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p
                        className={`text-base sm:text-lg font-bold font-mono ${
                          isIncome ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isIncome ? '+ ' : '- '}
                        {formatCurrency(entry.amount)}
                      </p>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">
                        {isIncome ? t.income : t.expense}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-stone-500 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. DYNAMIC PULSE-ANIMATED VOICE RECORDING MIC BUTTON BAR (Docked Bottom on Desktop) */}
      <div className="hidden lg:block fixed bottom-0 left-0 right-0 z-30 bg-stone-950/95 border-t border-stone-800 backdrop-blur-md py-3 px-4 shadow-2xl">
        <div className="max-w-md mx-auto flex flex-col items-center">
          {/* Active speech feedback preview */}
          {(isRecording || isProcessing || recognizedText) && (
            <div className="mb-2 w-full text-center">
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full border ${
                  isRecording
                    ? 'bg-rose-950/70 border-rose-800 text-rose-300 animate-pulse'
                    : isProcessing
                    ? 'bg-amber-950/70 border-amber-800 text-amber-300'
                    : 'bg-stone-800 border-stone-700 text-stone-300'
                }`}
              >
                {isProcessing
                  ? t.processingVoice
                  : isRecording
                  ? `${t.listening} (${recordingSeconds}s)... ${getSpeakingPromptHint(currentLang)}`
                  : recognizedText}
              </span>
            </div>
          )}

          {/* Pulse Button Container */}
          <div className="relative flex items-center justify-center my-1">
            {/* Pulsing Radial Waves (Active while recording) */}
            {isRecording && (
              <>
                <div className="absolute w-24 h-24 rounded-full bg-rose-500/20 animate-ping pointer-events-none"></div>
                <div className="absolute w-20 h-20 rounded-full bg-rose-500/30 animate-pulse pointer-events-none"></div>
              </>
            )}

            {/* Main Interactive Mic Button */}
            <button
              onClick={handleToggleVoice}
              disabled={isProcessing}
              className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-95 ${
                isRecording
                  ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-rose-900/50 scale-110'
                  : 'bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-emerald-950/60 hover:scale-105'
              }`}
              title={isRecording ? 'Stop recording' : 'Tap to speak'}
            >
              {isProcessing ? (
                <RefreshCw className="w-7 h-7 animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-7 h-7" />
              ) : (
                <Mic className="w-7 h-7" />
              )}
            </button>
          </div>

          <p className="text-xs font-semibold text-stone-300 mt-1.5 flex items-center gap-1.5">
            <span>{isRecording ? t.tapToStop : t.tapToRecord}</span>
            {isRecording && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/20 text-[10px] text-rose-300 font-mono">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                Voice input
              </span>
            )}
          </p>
          <p className="text-[11px] text-stone-400 flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Voice input • Android/Web Speech (हिंदी • मराठी • తెలుగు • தமிழ் • বাংলা • English)</span>
          </p>
        </div>
      </div>
    </div>
  );
};
