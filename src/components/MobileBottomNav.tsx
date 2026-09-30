import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  ScanLine,
  Sparkles,
  TrendingUp,
  Mic,
  MicOff,
  Radio,
  CheckCircle2,
  X,
  RefreshCw,
  Plus
} from 'lucide-react';
import { NavTab } from './HeaderNav';
import { SupportedLanguage, LedgerEntry } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { bhashiniSTTEngine } from '../services/bhashiniSttService';
import { parseVernacularVoiceInput } from '../utils/nlpParser';

interface MobileBottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentLang: SupportedLanguage;
  isAuthenticated: boolean;
  onAddEntry?: (entry: Omit<LedgerEntry, 'id' | 'timestamp' | 'isSynced'>) => void;
  onShowToast?: (msg: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  currentLang,
  isAuthenticated,
  onAddEntry,
  onShowToast
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [showVoiceSheet, setShowVoiceSheet] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  const t = TRANSLATIONS[currentLang];

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      bhashiniSTTEngine.stopSession().catch(() => {});
    };
  }, []);

  if (!isAuthenticated) return null;

  const handleToggleVoice = async () => {
    if (isRecording) {
      await handleStopVoice();
      return;
    }

    setShowVoiceSheet(true);
    setIsRecording(true);
    setRecognizedText('');
    setRecordingSeconds(0);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

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
          console.warn('Bhashini session notice:', err);
        }
      );
    } catch (e) {
      console.warn('Bhashini engine connection error:', e);
    }
  };

  const handleStopVoice = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    try {
      const bhashiniResult = await bhashiniSTTEngine.stopSession();
      const finalTranscript = (bhashiniResult.transcript || recognizedText || '').trim();

      if (!finalTranscript) {
        setIsProcessing(false);
        const noVoiceMsg: Record<SupportedLanguage, string> = {
          en: '⚠️ No speech detected. Please speak clearly into the microphone.',
          hi: '⚠️ कोई आवाज़ नहीं मिली। कृपया माइक्रोफ़ोन में स्पष्ट बोलें।',
          mr: '⚠️ आवाज ऐकू आली नाही. कृपया मायक्रोफोनमध्ये स्पष्ट बोला.',
          te: '⚠️ స్వరం గుర్తించబడలేదు. దయచేసి మైక్రోఫోన్‌లో స్పష్టంగా మాట్లాడండి.',
          ta: '⚠️ குரல் கண்டறியப்படவில்லை. தயவுசெய்து மைக்ரோஃபோனில் தெளிவாகப் பேசவும்.',
          bn: '⚠️ কোনো কথা শনাক্ত হয়নি। অনুগ্রহ করে মাইক্রোফোনে স্পষ্ট করে বলুন।'
        };
        if (onShowToast) onShowToast(noVoiceMsg[currentLang] || noVoiceMsg.en);
        setTimeout(() => setShowVoiceSheet(false), 1200);
        return;
      }

      setIsProcessing(true);
      setRecognizedText(finalTranscript);

      setTimeout(() => {
        const parsed = parseVernacularVoiceInput(finalTranscript, currentLang);
        const partyPrefix =
          currentLang === 'en'
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

        if (onAddEntry) {
          onAddEntry({
            amount: parsed.amount,
            transactionType: parsed.transactionType,
            category: parsed.category,
            sourceText: finalTranscript,
            notes: parsed.customerOrEntity
              ? `${partyPrefix}: ${parsed.customerOrEntity}`
              : (currentLang === 'en' ? 'Bhashini Voice Entry' : `${t.khataTab} (Bhashini STT)`)
          });
        }

        onTabChange('ledger');
        setIsProcessing(false);
        setShowVoiceSheet(false);
        if (onShowToast) {
          onShowToast(parsed.vernacularSummary || `✅ ₹${parsed.amount} saved in Khata!`);
        }
      }, 500);
    } catch (err) {
      setIsRecording(false);
      setIsProcessing(false);
      setShowVoiceSheet(false);
    }
  };

  const handleCancelVoice = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setIsProcessing(false);
    setShowVoiceSheet(false);
    bhashiniSTTEngine.stopSession().catch(() => {});
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const getMicLabel = () => {
    if (isRecording) {
      return currentLang === 'hi' ? 'रोकें' : currentLang === 'te' ? 'ఆపండి' : 'Stop';
    }
    return currentLang === 'hi' ? 'बोलें' : currentLang === 'te' ? 'వాయిస్' : currentLang === 'mr' ? 'बोला' : currentLang === 'ta' ? 'பேசுக' : currentLang === 'bn' ? 'বলুন' : 'Voice';
  };

  const navItems = [
    {
      id: 'ledger' as NavTab,
      label: currentLang === 'hi' ? 'खाता' : currentLang === 'te' ? 'ఖాతా' : currentLang === 'mr' ? 'खाते' : currentLang === 'ta' ? 'கணக்கு' : currentLang === 'bn' ? 'খাতা' : 'Khata',
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      id: 'ocr' as NavTab,
      label: currentLang === 'hi' ? 'बिल स्कैन' : currentLang === 'te' ? 'బిల్ స్కాన్' : currentLang === 'mr' ? 'बिल स्कॅन' : currentLang === 'ta' ? 'ரசீது' : currentLang === 'bn' ? 'বিল স্ক্যান' : 'Scan Bill',
      icon: <ScanLine className="w-5 h-5" />
    },
    {
      id: 'ai' as NavTab,
      label: currentLang === 'hi' ? 'सलाहकार' : currentLang === 'te' ? 'ఏఐ మిత్ర' : currentLang === 'mr' ? 'सल्लागार' : currentLang === 'ta' ? 'ஆலோசகர்' : currentLang === 'bn' ? 'পরামর্শ' : 'AI Advisor',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />
    },
    {
      id: 'credit' as NavTab,
      label: currentLang === 'hi' ? 'क्रेडिट' : currentLang === 'te' ? 'స్కోర్' : currentLang === 'mr' ? 'क्रेडिट' : currentLang === 'ta' ? 'மதிப்பீடு' : currentLang === 'bn' ? 'ক্রেডিট' : 'Credit',
      icon: <TrendingUp className="w-5 h-5" />
    }
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-md border-t border-stone-800 px-1.5 sm:px-2 py-1.5 safe-bottom shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-between relative">
          {/* Khata */}
          <button
            onClick={() => {
              setShowMoreMenu(false);
              onTabChange('ledger');
            }}
            className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 cursor-pointer transition active:scale-95 ${
              activeTab === 'ledger' ? 'text-emerald-400 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[9px] sm:text-[10px] truncate max-w-[4.5rem]">{navItems[0].label}</span>
          </button>

          {/* Scan Bill */}
          <button
            onClick={() => {
              setShowMoreMenu(false);
              onTabChange('ocr');
            }}
            className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 cursor-pointer transition active:scale-95 ${
              activeTab === 'ocr' ? 'text-emerald-400 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ScanLine className="w-5 h-5" />
            <span className="text-[9px] sm:text-[10px] truncate max-w-[4.5rem]">{navItems[1].label}</span>
          </button>

          {/* Center Voice Button */}
          <div className="flex-1 flex flex-col items-center -mt-6">
            <div className="relative flex items-center justify-center">
              {isRecording && (
                <>
                  <div className="absolute w-20 h-20 rounded-full bg-rose-500/20 animate-ping pointer-events-none"></div>
                  <div className="absolute w-16 h-16 rounded-full bg-rose-500/30 animate-pulse pointer-events-none"></div>
                </>
              )}

              <button
                type="button"
                onClick={handleToggleVoice}
                title={isRecording ? 'Stop Recording' : 'Voice Entry (Bhashini)'}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl ring-4 ring-stone-950 transition-all transform active:scale-95 cursor-pointer ${
                  isRecording
                    ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-rose-950/80 scale-105 animate-pulse'
                    : 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-emerald-400 text-white shadow-emerald-950/80 hover:brightness-110'
                }`}
              >
                {isProcessing ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
            <span className={`text-[10px] font-semibold mt-1 ${isRecording ? 'text-rose-400 font-bold animate-pulse' : 'text-emerald-400'}`}>
              {getMicLabel()}
            </span>
          </div>

          {/* AI Advisor */}
          <button
            onClick={() => {
              setShowMoreMenu(false);
              onTabChange('ai');
            }}
            className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 cursor-pointer transition active:scale-95 ${
              activeTab === 'ai' ? 'text-emerald-400 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-[9px] sm:text-[10px] truncate max-w-[4.5rem]">{navItems[2].label}</span>
          </button>

          {/* More */}
          <button
            onClick={() => setShowMoreMenu((prev) => !prev)}
            className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 cursor-pointer transition active:scale-95 ${
              showMoreMenu || ['manual', 'credit', 'mandi', 'schemes'].includes(activeTab)
                ? 'text-emerald-400 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            aria-label="More options"
            aria-expanded={showMoreMenu}
          >
            <Plus className={`w-5 h-5 transition-transform ${showMoreMenu ? 'rotate-45' : ''}`} />
            <span className="text-[9px] sm:text-[10px] truncate max-w-[4.5rem]">
              {currentLang === 'hi' ? 'और' : currentLang === 'te' ? 'మరిన్ని' : currentLang === 'mr' ? 'अधिक' : currentLang === 'ta' ? 'மேலும்' : currentLang === 'bn' ? 'আরও' : 'More'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile More Menu */}
      {showMoreMenu && (
        <div className="lg:hidden fixed inset-x-0 bottom-16 z-40 px-3 pb-2">
          <div className="mx-auto max-w-md rounded-2xl border border-stone-700 bg-stone-900/98 backdrop-blur-xl shadow-2xl p-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onTabChange('manual');
                }}
                className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${
                  activeTab === 'manual'
                    ? 'border-emerald-500/60 bg-emerald-950/60 text-emerald-300'
                    : 'border-stone-800 bg-stone-950 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <Plus className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.manualEntry}</span>
              </button>

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onTabChange('mandi');
                }}
                className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${
                  activeTab === 'mandi'
                    ? 'border-emerald-500/60 bg-emerald-950/60 text-emerald-300'
                    : 'border-stone-800 bg-stone-950 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <span className="text-base shrink-0">🌾</span>
                <span>{t.mandiTab}</span>
              </button>

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onTabChange('schemes');
                }}
                className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${
                  activeTab === 'schemes'
                    ? 'border-emerald-500/60 bg-emerald-950/60 text-emerald-300'
                    : 'border-stone-800 bg-stone-950 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <span className="text-base shrink-0">📄</span>
                <span>{t.schemesTab}</span>
              </button>

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onTabChange('credit');
                }}
                className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${
                  activeTab === 'credit'
                    ? 'border-emerald-500/60 bg-emerald-950/60 text-emerald-300'
                    : 'border-stone-800 bg-stone-950 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.creditTab}</span>
              </button>
            </div>

            <p className="mt-2 px-1 text-[10px] text-stone-500">
              {currentLang === 'en'
                ? 'Mandi Prices includes the live weather & agri advisory.'
                : currentLang === 'hi'
                ? 'मंडी भाव में लाइव मौसम और कृषि सलाह भी शामिल है।'
                : currentLang === 'te'
                ? 'మండి ధరల్లో లైవ్ వాతావరణం మరియు వ్యవసాయ సలహా కూడా ఉన్నాయి.'
                : 'Mandi Prices includes live weather and agri advisory.'}
            </p>
          </div>
        </div>
      )}

      {/* Voice Recording Floating Sheet for Mobile */}
      {showVoiceSheet && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-3 pb-24 animate-in fade-in">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-2xl relative text-center">
            <button
              onClick={handleCancelVoice}
              className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-full hover:bg-stone-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Pulsing Visualizer */}
            <div className="relative w-20 h-20 mx-auto my-3 flex items-center justify-center">
              {isRecording && (
                <>
                  <div className="absolute w-24 h-24 rounded-full bg-rose-500/20 animate-ping"></div>
                  <div className="absolute w-20 h-20 rounded-full bg-rose-500/30 animate-pulse"></div>
                </>
              )}
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span className="text-xs font-mono font-bold text-rose-300">
                {isRecording ? `${t.listening} (${formatSeconds(recordingSeconds)})` : isProcessing ? t.processingVoice : 'Done'}
              </span>
            </div>

            <p className="text-xs text-stone-400 mb-3 px-2">
              {currentLang === 'hi'
                ? 'उदाहरण: "रमेश को ₹500 दिए" या "सुरेश से ₹1200 मिले"'
                : currentLang === 'te'
                ? 'ఉదాహరణ: "రమేష్‌కు ₹500 ఇచ్చాను" లేదా "సురేష్ నుండి ₹1200 వచ్చాయి"'
                : currentLang === 'mr'
                ? 'उदा: "रमेशला ₹500 दिले" किंवा "सुरेशकडून ₹1200 मिळाले"'
                : 'Say e.g.: "Gave 500 to Ramesh" or "Received 1200 from Suresh"'}
            </p>

            {/* Live speech preview */}
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-3 mb-4 min-h-[60px] flex items-center justify-center text-xs text-stone-200">
              {recognizedText ? (
                <span className="font-medium text-emerald-300 italic">"{recognizedText}"</span>
              ) : (
                <span className="text-stone-500 italic">
                  {currentLang === 'hi' ? 'बोलना शुरू करें...' : currentLang === 'te' ? 'మాట్లాడటం ప్రారంభించండి...' : 'Listening to speech...'}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isRecording ? (
                <button
                  type="button"
                  onClick={handleStopVoice}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{currentLang === 'hi' ? 'पूरा हुआ / सहेजें' : currentLang === 'te' ? 'సేవ్ చేయండి' : 'Stop & Save'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>{currentLang === 'hi' ? 'फिर से बोलें' : 'Speak Again'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleCancelVoice}
                className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs transition cursor-pointer"
              >
                {currentLang === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
