import React, { useState, useRef, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
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
  Radio,
  Volume2,
  Square
} from 'lucide-react';
import { LedgerEntry, SupportedLanguage, TransactionType } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { parseVernacularVoiceInput } from '../utils/nlpParser';
import { getLocalizedCategory, getLocalizedPartyPrefix, getLocalizedSourceText, getLocalizedDateString } from '../utils/categoryHelper';
import { bhashiniSTTEngine } from '../services/bhashiniSttService';

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

const getNetCashflowTtsSentence = (netCashflow: number, lang: SupportedLanguage): string => {
  const absAmountStr = Math.abs(netCashflow).toLocaleString('en-IN');
  const isNegative = netCashflow < 0;
  const isZero = netCashflow === 0;

  switch (lang) {
    case 'hi':
      if (isZero) return 'आपका इस महीने का शुद्ध नकद प्रवाह शून्य रुपये है।';
      if (isNegative) return `आपका इस महीने का शुद्ध नकद प्रवाह माइनस ${absAmountStr} रुपये है।`;
      return `आपका इस महीने का शुद्ध नकद प्रवाह ${absAmountStr} रुपये है।`;

    case 'mr':
      if (isZero) return 'आपला या महिन्याचा निव्वळ रोख प्रवाह शून्य रुपये आहे.';
      if (isNegative) return `आपला या महिन्याचा निव्वळ रोख प्रवाह उणे ${absAmountStr} रुपये आहे.`;
      return `आपला या महिन्याचा निव्वळ रोख प्रवाह ${absAmountStr} रुपये आहे.`;

    case 'te':
      if (isZero) return 'మీ ఈ నెల నికర నగదు ప్రవాహం సున్నా రూపాయలు.';
      if (isNegative) return `మీ ఈ నెల నికర నగదు ప్రవాహం మైనస్ ${absAmountStr} రూపాయలు.`;
      return `మీ ఈ నెల నికర నగదు ప్రవాహం ${absAmountStr} రూపాయలు.`;

    case 'ta':
      if (isZero) return 'உங்கள் இந்த மாத நிகர பணப்புழக்கம் பூஜ்ஜியம் ரூபாய்.';
      if (isNegative) return `உங்கள் இந்த மாத நிகர பணப்புழக்கம் மைனஸ் ${absAmountStr} ரூபாய்.`;
      return `உங்கள் இந்த மாத நிகர பணப்புழக்கம் ${absAmountStr} ரூபாய்.`;

    case 'bn':
      if (isZero) return 'আপনার এই মাসের নিট নগদ প্রবাহ শূন্য টাকা।';
      if (isNegative) return `আপনার এই মাসের নিট নগদ প্রবাহ মাইনাস ${absAmountStr} টাকা।`;
      return `আপনার এই মাসের নিট নগদ প্রবাহ ${absAmountStr} টাকা।`;

    case 'en':
    default:
      if (isZero) return 'Your current month net cashflow is zero rupees.';
      if (isNegative) return `Your current month net cashflow is minus ${absAmountStr} rupees.`;
      return `Your current month net cashflow is ${absAmountStr} rupees.`;
  }
};

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

  // Text-to-Speech (TTS) State & Lifecycle
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Speech Recognition instance
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

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

  // Cleanup TTS on unmount or language change
  useEffect(() => {
    return () => {
      if (Capacitor.isNativePlatform()) {
        TextToSpeech.stop().catch(() => {});
      } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (isSpeaking) {
      if (Capacitor.isNativePlatform()) {
        TextToSpeech.stop().catch(() => {});
      } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
  }, [currentLang]);

  const handleToggleTts = async () => {
    const isNative = Capacitor.isNativePlatform();

    if (isSpeaking) {
      try {
        if (isNative) {
          await TextToSpeech.stop();
        } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } catch (err) {
        console.warn('TTS stop notice:', err);
      } finally {
        setIsSpeaking(false);
      }
      return;
    }

    const sentence = getNetCashflowTtsSentence(netCashflow, currentLang);
    const bcp47Map: Record<SupportedLanguage, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      bn: 'bn-IN'
    };
    const targetLang = bcp47Map[currentLang] || 'en-IN';

    if (isNative) {
      try {
        await TextToSpeech.stop().catch(() => {});
        setIsSpeaking(true);

        await TextToSpeech.speak({
          text: sentence,
          lang: targetLang,
          rate: 0.95,
          pitch: 1.0,
          volume: 1.0,
          category: 'ambient'
        });
      } catch (err: any) {
        console.warn('Native Android TTS error:', err);
        const engineNotice: Record<SupportedLanguage, string> = {
          en: '⚠️ Native Text-to-Speech voice engine unavailable on this device.',
          hi: '⚠️ आपके डिवाइस पर इस भाषा की टेक्स्ट-टू-स्पीच सेवा उपलब्ध नहीं है।',
          mr: '⚠️ आपल्या डिव्हाइसवर या भाषेची व्हॉईस सेवा उपलब्ध नाही.',
          te: '⚠️ మీ పరికరంలో ఈ భాషకు వాయిస్ ఇంజిన్ అందుబాటులో లేదు.',
          ta: '⚠️ சாதனத்தில் இந்த மொழிக்கான குரல் சேவை இல்லை.',
          bn: '⚠️ আপনার ডিভাইসে এই ভাষার ভয়েস সেবা উপলব্ধ নেই।'
        };
        showToast(engineNotice[currentLang] || engineNotice.en);
      } finally {
        setIsSpeaking(false);
      }
    } else {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        const unsupportedMsg: Record<SupportedLanguage, string> = {
          en: '⚠️ Text-to-Speech is not supported on this browser.',
          hi: '⚠️ इस ब्राउज़र पर टेक्स्ट-टू-स्पीच उपलब्ध नहीं है।',
          mr: '⚠️ या ब्राऊझरवर टेक्स्ट-टू-स्पीच उपलब्ध नाही.',
          te: '⚠️ ఈ బ్రౌజర్‌లో టెక్స్ట్-టు-స్పీచ్ అందుబాటులో లేదు.',
          ta: '⚠️ இந்த உலாவியில் உரை பேச்சு வசதி இல்லை.',
          bn: '⚠️ এই ব্রাউজারে টেক্সট-টু-স্পিচ সমর্থিত নয়।'
        };
        showToast(unsupportedMsg[currentLang] || unsupportedMsg.en);
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = targetLang;
      utterance.rate = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const lowerLang = targetLang.toLowerCase();
      const matchedVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().replace('_', '-') === lowerLang ||
          v.lang.toLowerCase().startsWith(lowerLang.slice(0, 2))
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (e) => {
        console.warn('Browser SpeechSynthesis notice:', e);
        setIsSpeaking(false);
      };

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

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

  // Start voice recording with Digital India Bhashini STT Engine
  const handleToggleVoice = async () => {
    if (isRecording) {
      await stopVoiceAndProcess(recognizedText || '');
      return;
    }

    setIsRecording(true);
    setRecognizedText('');
    setRecordingSeconds(0);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    // Launch Bhashini STT Engine session with targeted vernacular speech recognition
    try {
      await bhashiniSTTEngine.startSession(
        currentLang,
        (interimText) => {
          setRecognizedText(interimText);
        },
        (finalResult) => {
          if (finalResult && finalResult.transcript) {
            setRecognizedText(finalResult.transcript);
          }
        },
        (err) => {
          console.warn('Bhashini STT session notice:', err);
        }
      );
    } catch (e) {
      console.warn('Bhashini engine connection:', e);
    }
  };

  const stopVoiceAndProcess = async (spokenText: string) => {
    if (timerRef.current) clearInterval(timerRef.current);

    setIsRecording(false);

    const bhashiniResult = await bhashiniSTTEngine.stopSession();
    const finalTranscript = (bhashiniResult.transcript || spokenText || recognizedText || '').trim();

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
          : (currentLang === 'en' ? 'Bhashini Voice Entry' : `${t.khataTab} (Bhashini STT)`)
      });

      setIsProcessing(false);
      showToast(parsed.vernacularSummary);
    }, 600);
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-32 min-w-0">
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
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400/90 flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
              <span className="truncate">{t.netCashflow}</span>
              <button
                type="button"
                onClick={handleToggleTts}
                aria-label={isSpeaking ? 'Stop reading net cashflow' : 'Read current month net cashflow aloud'}
                title={isSpeaking ? 'Stop reading' : 'Read aloud'}
                className={`ml-1 inline-flex items-center justify-center p-1.5 rounded-full transition-all shrink-0 ${
                  isSpeaking
                    ? 'bg-emerald-500 text-stone-950 animate-pulse ring-2 ring-emerald-400/50'
                    : 'bg-stone-800/90 text-stone-300 hover:text-white hover:bg-stone-700/90 border border-stone-700/60'
                }`}
              >
                {isSpeaking ? (
                  <Square className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
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
                  className="group bg-stone-900/90 hover:bg-stone-850 border border-stone-800/80 hover:border-stone-700/80 rounded-2xl p-3.5 sm:p-4 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 shadow-sm min-w-0"
                >
                  {/* Entry information */}
                  <div className="flex items-start gap-3 min-w-0 flex-1 w-full">
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
                    <div className="min-w-0 flex-1 w-0 sm:w-auto">
                      <div className="flex items-start gap-2 min-w-0">
                        <p className="text-sm font-bold text-stone-100 leading-5 break-words min-w-0 flex-1">
                          {getLocalizedCategory(entry.category, currentLang)}
                        </p>

                        {/* Sync Status Badge */}
                        {entry.isSynced ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] text-emerald-400/90 font-medium px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 shrink-0"
                            title="Synced to PostgreSQL Cloud"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span className="hidden sm:inline">Synced</span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] text-amber-400/90 font-medium px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 shrink-0"
                            title="Stored in local encrypted Room DB only"
                          >
                            <AlertCircle className="w-3 h-3" />
                            <span className="hidden sm:inline">Room DB</span>
                          </span>
                        )}
                      </div>

                      {localizedSourceText && (
                        <p className="text-xs text-stone-400 italic mt-0.5 break-words leading-5">
                          "{localizedSourceText}"
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-stone-500 font-mono break-words">
                        <span className="break-words">{dateStr}</span>
                        {entry.notes && (
                          <>
                            <span className="shrink-0">•</span>
                            <span className="break-words min-w-0">
                              {getLocalizedPartyPrefix(entry.notes, currentLang)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto sm:flex-shrink-0 border-t border-stone-800/70 sm:border-t-0 pt-2.5 sm:pt-0">
                    <div className="text-left sm:text-right min-w-0">
                      <p
                        className={`text-base sm:text-lg font-bold font-mono whitespace-nowrap ${
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
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 text-stone-500 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition shrink-0"
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
                Bhashini ASR
              </span>
            )}
          </p>
          <p className="text-[11px] text-stone-400 flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Bhashini STT • Digital India (हिंदी • मराठी • తెలుగు • தமிழ் • বাংলা • English)</span>
          </p>
        </div>
      </div>
    </div>
  );
};
