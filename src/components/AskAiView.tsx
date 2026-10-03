import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, RefreshCw, CheckCircle2, Mic, MicOff } from 'lucide-react';
import { LedgerEntry, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { bhashiniSTTEngine, BHASHINI_LANG_CODES } from '../services/bhashiniSttService';
import { apiUrl } from '../utils/apiUrl';

interface AskAiViewProps {
  currentLang: SupportedLanguage;
  entries: LedgerEntry[];
  userName?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  modelUsed?: string;
  timestamp: number;
}

const getWelcomeMessage = (lang: SupportedLanguage, name: string) => {
  switch (lang) {
    case 'hi':
      return `नमस्ते ${name}! मैं आपका **व्यापार मित्र एआई** सलाहकार हूँ। आप मुझसे अपने दैनिक खर्चे, मुद्रा ऋण पात्रता (MUDRA), मंडी भाव या व्यवसाय बढ़ाने के बारे में अपनी भाषा में कुछ भी पूछ सकते हैं। आप माइक दबाकर बोल भी सकते हैं (भाषिणी एसटीटी)।`;
    case 'mr':
      return `नमस्कार ${name}! मी आपला **व्यापार मित्र एआय** सल्लागार आहे. आपण मला दैनंदिन जमा-खर्च, मुद्रा कर्ज पात्रता (MUDRA), बाजार भाव किंवा व्यवसाय वाढीबद्दल आपल्या भाषेत काहीही विचारू शकता. आपण माइक दाबून बोलू शकता (भाषिणी एसटीटी).`;
    case 'te':
      return `నమస్కారం ${name}! నేను మీ **వ్యాపార మిత్ర ఏఐ** సలహాదారుని. రోజువారీ ఖాతా ఖర్చులు, ముద్ర రుణ అర్హత (MUDRA), మార్కెట్ ధరలు లేదా వ్యాపార వృద్ధి గురించి మీ సొంత తెలుగు భాషలో అడగవచ్చు. మైక్ నొక్కి మాట్లాడి కూడా అడగవచ్చు (భాషిణి ఎస్టీటీ).`;
    case 'ta':
      return `வணக்கம் ${name}! நான் உங்கள் **வியாபார மித்ரா ஏஐ** ஆலோசகர். உங்கள் தினசரி கணக்கு வரவு செலவு, முத்ரா கடன் தகுதி (MUDRA), மண்டி விலை அல்லது தொழில் வளர்ச்சி பற்றி உங்கள் தமிழ் மொழியிலேயே கேட்கலாம். மைக் அழுத்தி பேசியும் கேட்கலாம் (பாஷினி எஸ்டிடி).`;
    case 'bn':
      return `নমস্কার ${name}! আমি আপনার **ব্যাপার মিত্র এআই** উপদেষ্টা। আপনি আমাকে দৈনন্দিন খরচ, মুদ্রা ঋণ যোগ্যতা (MUDRA), মান্ডি দর বা ব্যবসা বৃদ্ধি সম্পর্কে আপনার নিজের বাংলা ভাষায় যেকোনো প্রশ্ন করতে পারেন। মাইক চেপে মুখে বলেও প্রশ্ন করতে পারেন (ভাষিণী এসটিটি)।`;
    case 'en':
    default:
      return `Namaste ${name}! I am your **Vyapaar Mitra AI** advisor. Ask me anything about your daily ledger, MUDRA loan pre-qualification, APMC mandi rates, or business growth strategies in your selected language. You can also tap the mic to speak using Bhashini STT!`;
  }
};

export const AskAiView: React.FC<AskAiViewProps> = ({ currentLang, entries, userName = 'Entrepreneur' }) => {
  const t = TRANSLATIONS[currentLang];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: getWelcomeMessage(currentLang, userName),
      timestamp: Date.now()
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeModelUsed, setActiveModelUsed] = useState<string>('Gemini AI');

  // Bhashini STT Engine State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioVolume, setAudioVolume] = useState<number>(0);
  const [sttError, setSttError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  const langConfig = BHASHINI_LANG_CODES[currentLang] || BHASHINI_LANG_CODES.en;

  const uiText = {
    hi: {
      advisorTitle: 'व्यापार मित्र एआई सलाहकार',
      advisorSubtitle: 'मुद्रा ऋण, APMC मंडी भाव व नकदी प्रवाह सहायक',
      liveSearch: 'सर्च ग्राउंडिंग सक्रिय',
      bhashiniPill: 'भाषिणी एसटीटी',
      listening: 'भाषिणी एसटीटी सक्रिय: बोलें...',
      placeholder: 'अपना प्रश्न यहां पूछें या माइक दबाकर बोलें...',
      listeningPlaceholder: 'भाषिणी सुन रहा है... कृपया स्पष्ट बोलें',
      send: 'भेजें',
      consulting: 'व्यापार मित्र एआई से परामर्श हो रहा है...',
      networkError: '⚠️ नेटवर्क समस्या। कृपया इंटरनेट कनेक्शन जांचें।',
      speechError: 'माइक्रोफ़ोन सूचना: कृपया स्पष्ट बोलें या अनुमति जांचें'
    },
    mr: {
      advisorTitle: 'व्यापार मित्र एआय सल्लागार',
      advisorSubtitle: 'मुद्रा कर्ज, बाजार समिती भाव व रोख प्रवाह सहायक',
      liveSearch: 'लाईव्ह सर्च सुरू',
      bhashiniPill: 'भाषिणी एसटीटी',
      listening: 'भाषिणी एसटीटी सुरू आहे: बोला...',
      placeholder: 'आपला प्रश्न येथे विचारा किंवा माइक दाबून बोला...',
      listeningPlaceholder: 'भाषिणी ऐकत आहे... कृपया स्पष्ट बोला',
      send: 'पाठवा',
      consulting: 'व्यापार मित्र एआय कडून सल्ला मिळवत आहे...',
      networkError: '⚠️ नेटवर्क त्रुटी. कृपया इंटरनेट कनेक्शन तपासा.',
      speechError: 'मायक्रोफोन सूचना: कृपया स्पष्ट बोला किंवा परवानगी तपासा'
    },
    te: {
      advisorTitle: 'వ్యాపార మిత్ర ఏఐ సలహాదారు',
      advisorSubtitle: 'ముద్ర రుణాలు, మార్కెట్ యార్డ్ ధరలు & నగదు ప్రవాహ సహాయకుడు',
      liveSearch: 'లైవ్ సెర్చ్ యాక్టివ్',
      bhashiniPill: 'భాషిణి ఎస్టీటీ',
      listening: 'భాషిణి ఎస్టీటీ యాక్టివ్: మాట్లాడండి...',
      placeholder: 'మీ ప్రశ్నను ఇక్కడ అడగండి లేదా మాట్లాడండి...',
      listeningPlaceholder: 'భాషిణి వింటోంది... స్పష్టంగా మాట్లాడండి',
      send: 'పంపు',
      consulting: 'వ్యాపార మిత్ర ఏఐ సలహా పొందుతోంది...',
      networkError: '⚠️ నెట్‌వర్క్ సమస్య. దయచేసి ఇంటర్నెట్ కనెక్షన్ తనిఖీ చేయండి.',
      speechError: 'మైక్రోఫోన్ సూచన: దయచేసి స్పష్టంగా మాట్లాడండి'
    },
    ta: {
      advisorTitle: 'வியாபார மித்ரா ஏஐ ஆலோசகர்',
      advisorSubtitle: 'முத்ரா கடன், ஒழுங்குமுறை விற்பனைக்கூடம் & பணப்புழக்க உதவியாளர்',
      liveSearch: 'நேரலை தேடல் இயங்குகிறது',
      bhashiniPill: 'பாஷினி எஸ்டிடி',
      listening: 'பாஷினி எஸ்டிடி இயங்குகிறது: பேசுங்கள்...',
      placeholder: 'உங்கள் கேள்வியை இங்கே கேட்கவும் அல்லது பேசவும்...',
      listeningPlaceholder: 'பாஷினி கேட்கிறது... தெளிவாக பேசவும்',
      send: 'அனுப்பு',
      consulting: 'வியாபார மித்ரா ஏஐ ஆலோசனை பெறுகிறது...',
      networkError: '⚠️ பிணைய சிக்கல். இணைய இணைப்பை சரிபார்க்கவும்.',
      speechError: 'மைக்ரோஃபோன் அறிவிப்பு: தெளிவாக பேசவும்'
    },
    bn: {
      advisorTitle: 'ব্যাপার মিত্র এআই উপদেষ্টা',
      advisorSubtitle: 'মুদ্রা ঋণ, মান্ডি দর ও নগদ প্রবাহ সহায়ক',
      liveSearch: 'লাইভ অনুসন্ধান সক্রিয়',
      bhashiniPill: 'ভাষিণী এসটিটি',
      listening: 'ভাষিণী এসটিটি সক্রিয়: বলুন...',
      placeholder: 'আপনার প্রশ্ন এখানে লিখুন বা মাইক চেপে বলুন...',
      listeningPlaceholder: 'ভাষিণী শুনছে... স্পষ্ট করে বলুন',
      send: 'পাঠান',
      consulting: 'ব্যাপার মিত্র এআই পরামর্শ প্রক্রিয়াধীন...',
      networkError: '⚠️ নেটওয়ার্ক সমস্যা। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করুন।',
      speechError: 'মাইক্রোফোন নোটিশ: অনুগ্রহ করে স্পষ্ট করে বলুন'
    },
    en: {
      advisorTitle: 'Mera Vyapaar AI Advisor',
      advisorSubtitle: 'Vernacular MUDRA, APMC Mandi, and Cashflow Assistant',
      liveSearch: 'Live Search Grounding',
      bhashiniPill: 'Bhashini STT',
      listening: 'Bhashini STT Active: Speak now...',
      placeholder: 'Ask your business, loan or APMC mandi question here or speak...',
      listeningPlaceholder: 'Bhashini is listening... speak clearly',
      send: 'Send',
      consulting: 'Consulting Vyapaar Mitra AI in selected language...',
      networkError: '⚠️ Network connectivity issue. Please check your internet connection.',
      speechError: 'Microphone notice: please speak clearly or check mic permissions'
    }
  }[currentLang] || {
    advisorTitle: 'Mera Vyapaar AI Advisor',
    advisorSubtitle: 'Vernacular MUDRA, APMC Mandi, and Cashflow Assistant',
    liveSearch: 'Live Search Grounding',
    bhashiniPill: 'Bhashini STT',
    listening: 'Bhashini STT Active: Speak now...',
    placeholder: 'Ask your business, loan or APMC mandi question here or speak...',
    listeningPlaceholder: 'Bhashini is listening... speak clearly',
    send: 'Send',
    consulting: 'Consulting Vyapaar Mitra AI in selected language...',
    networkError: '⚠️ Network connectivity issue. Please check your internet connection.',
    speechError: 'Microphone notice: please speak clearly or check mic permissions'
  };

  const quickPrompts = [
    {
      en: 'How do I qualify for PM MUDRA Shishu loan?',
      hi: 'पीएम मुद्रा शिशु ऋण के लिए कैसे पात्र बनें?',
      mr: 'पीएम मुद्रा कर्जासाठी पात्रता कशी मिळवावी?',
      te: 'PM ముద్ర శిశు రుణానికి ఎలా అర్హత పొందాలి?',
      ta: 'PM முத்ரா சிசு கடனுக்கு எவ்வாறு தகுதி பெறுவது?',
      bn: 'কীভাবে PM মুদ্রা শিশু ঋণের যোগ্যতা অর্জন করব?'
    },
    {
      en: 'Analyze my business cashflow health & suggest improvements',
      hi: 'मेरे व्यवसाय के नकदी प्रवाह की जांच करें और सुधार सुझाएं',
      mr: 'माझ्या व्यावसायिक रोख प्रवाहाचे विश्लेषण करा आणि सुधारणा सुचवा',
      te: 'నా వ్యాపార నగదు ప్రవాహాన్ని విశ్లేషించి మెరుగుదలలను సూచించండి',
      ta: 'எனது வணிக பணப்பாய்வை பகுப்பாய்வு செய்து ஆலோசனைகளை வழங்கவும்',
      bn: 'আমার ব্যবসার নগদ প্রবাহ বিশ্লেষণ করুন এবং পরামর্শ দিন'
    },
    {
      en: 'When is the best time to sell my produce in Mandi?',
      hi: 'मंडी में अपनी फसल बेचने का सबसे सही समय कब है?',
      mr: 'बाजार समितीत पीक विकण्याची हीच योग्य वेळ आहे का?',
      te: 'మండీలో నా పంటను విక్రయించడానికి సరైన సమయం ఎప్పుడు?',
      ta: 'மண்டியில் எனது விளைச்சலை விற்க சிறந்த நேரம் எப்போது?',
      bn: 'মান্ডিতে আমার ফসল বিক্রি করার সেরা সময় কখন?'
    },
    {
      en: 'Explain Document Checklist for PMEGP 35% Subsidy',
      hi: 'PMEGP 35% सब्सिडी के लिए आवश्यक दस्तावेजों की सूची बताएं',
      mr: 'PMEGP ३५% अनुदानासाठी आवश्यक कागदपत्रांची यादी द्या',
      te: 'PMEGP 35% సబ్సిడీ కోసం అవసరమైన పత్రాల జాబితాను ఇవ్వండి',
      ta: 'PMEGP 35% மானியத்திற்கான ஆவணங்களின் பட்டியலை வழங்கவும்',
      bn: 'PMEGP ৩৫% ভর্তুকির জন্য প্রয়োজনীয় নথিপত্র কি কী?'
    }
  ];

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [
          {
            id: 'welcome',
            role: 'assistant',
            text: getWelcomeMessage(currentLang, userName),
            timestamp: Date.now()
          }
        ];
      }
      return prev;
    });
  }, [currentLang, userName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      bhashiniSTTEngine.stopSession().catch(() => {});
    };
  }, []);

  const handleToggleBhashiniSTT = async () => {
    setSttError(null);

    if (isRecording) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
      setAudioVolume(0);
      try {
        const result = await bhashiniSTTEngine.stopSession();
        if (result.transcript) {
          setInputPrompt((prev) => (prev ? `${prev} ${result.transcript}` : result.transcript));
        }
      } catch (err: any) {
        console.warn('Error stopping Bhashini STT:', err);
      }
      return;
    }

    setIsRecording(true);
    setRecordingSeconds(0);
    setAudioVolume(10);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    try {
      await bhashiniSTTEngine.startSession(
        currentLang,
        (interim) => {
          if (interim) {
            setInputPrompt(interim);
          }
        },
        (finalResult) => {
          if (finalResult && finalResult.transcript) {
            setInputPrompt(finalResult.transcript);
          }
        },
        (err) => {
          console.warn('Bhashini STT Engine error:', err);
          setSttError(uiText.speechError);
          setIsRecording(false);
          if (timerRef.current) clearInterval(timerRef.current);
        },
        (volume) => {
          setAudioVolume(volume);
        }
      );
    } catch (err: any) {
      console.warn('Could not launch Bhashini STT session:', err);
      setSttError(uiText.speechError);
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSend = async (textToSend?: string) => {
    if (isRecording) {
      await handleToggleBhashiniSTT();
    }

    const prompt = textToSend || inputPrompt;
    if (!prompt.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: prompt,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setIsLoading(true);

    const totalIncome = entries.filter(e => e.transactionType === 'INCOME').reduce((s, e) => s + e.amount, 0);
    const totalExpense = entries.filter(e => e.transactionType === 'EXPENSE').reduce((s, e) => s + e.amount, 0);
    const ledgerSummary = `Total Transactions: ${entries.length}, Total Income: ₹${totalIncome}, Total Expenses: ₹${totalExpense}, Net Cashflow: ₹${totalIncome - totalExpense}`;

    try {
      const response = await fetch(apiUrl('/api/ai/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          language: currentLang,
          ledgerSummary,
          history: messages.slice(-10).map((m) => ({ role: m.role, text: m.text }))
        })
      });

      const data: any = await response.json().catch(() => ({}));
      if (!response.ok || data?.success !== true || typeof data?.reply !== 'string' || !data.reply.trim()) {
        throw new Error(data?.error || `AI request failed (HTTP ${response.status})`);
      }

      const modelUsed = data.modelUsed || 'Gemini AI';
      setActiveModelUsed(modelUsed);
      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        text: data.reply.trim(),
        modelUsed,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('AI Advisor request failed:', err);
      const aiMsg: ChatMessage = {
        id: `msg-error-${Date.now()}`,
        role: 'assistant',
        text: currentLang === 'te'
          ? 'ప్రస్తుతం AI సమాధానం రూపొందించలేకపోయింది. దయచేసి కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.'
          : currentLang === 'hi'
            ? 'अभी AI जवाब नहीं दे सका। कृपया थोड़ी देर बाद फिर कोशिश करें।'
            : currentLang === 'mr'
              ? 'आत्ता AI उत्तर तयार करू शकले नाही. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.'
              : currentLang === 'ta'
                ? 'தற்போது AI பதிலை உருவாக்க முடியவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.'
                : currentLang === 'bn'
                  ? 'এই মুহূর্তে AI উত্তর তৈরি করতে পারেনি। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।'
                  : 'I could not generate an AI response right now. Please try again shortly.',
        modelUsed: 'Service unavailable',
        timestamp: Date.now()
      };
      setActiveModelUsed('Service unavailable');
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100dvh-160px)] min-h-0 p-1.5 sm:p-4">
      {/* Top Banner: Only Brand Logo and Mera Vyapaar AI Advisor */}
      <div className="flex items-center bg-stone-900 border border-stone-800 rounded-2xl px-3 sm:px-5 py-3 mb-2.5 sm:mb-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-emerald-600 to-emerald-400 flex items-center justify-center shrink-0 shadow-md">
            <span className="font-bold text-white text-base font-serif">व्या</span>
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Mera Vyapaar AI Advisor
          </h2>
        </div>
      </div>

      {/* Suggested Quick Prompts in Selected Language */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none">
        {quickPrompts.map((qp, idx) => {
          const promptText = (qp as any)[currentLang] || qp.en;
          return (
            <button
              key={idx}
              onClick={() => handleSend(promptText)}
              className="text-[11px] font-medium bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 rounded-xl px-3 py-1.5 transition shrink-0 cursor-pointer text-left"
            >
              {promptText}
            </button>
          );
        })}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto space-y-3 p-2.5 sm:p-3 bg-stone-950/60 border border-stone-800/80 rounded-2xl mb-3 shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-800 border border-stone-700 text-emerald-400 shadow-md'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none shadow-md'
                    : 'bg-stone-900 border border-stone-800 text-stone-200 rounded-tl-none shadow'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                {msg.modelUsed && !isUser && (
                  <div className="mt-2 pt-1.5 border-t border-stone-800 text-[10px] text-stone-500 font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>{langConfig.label} • {msg.modelUsed}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-800 border border-stone-700 text-emerald-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-2xl px-4 py-3 text-xs text-stone-400 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
              <span>{uiText.consulting}</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* STT Notice / Error if any */}
      {sttError && (
        <div className="text-[11px] text-amber-400 bg-amber-950/40 border border-amber-900/50 rounded-xl px-3 py-1.5 mb-2">
          {sttError}
        </div>
      )}

      {/* Recording Visualizer Bar when Bhashini STT is active */}
      {isRecording && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl px-4 py-2 mb-2 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-xs font-semibold text-rose-300">
              {uiText.listening} ({langConfig.label})
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Equalizer Waveform Indicator */}
            <div className="flex items-end gap-1 h-4">
              <div
                className="w-1 bg-rose-400 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(4, (audioVolume * 0.4))}%` }}
              ></div>
              <div
                className="w-1 bg-rose-400 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(8, (audioVolume * 0.8))}%` }}
              ></div>
              <div
                className="w-1 bg-rose-400 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(6, (audioVolume * 0.6))}%` }}
              ></div>
              <div
                className="w-1 bg-rose-400 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(10, (audioVolume * 1.0))}%` }}
              ></div>
            </div>

            <span className="text-xs font-mono font-bold text-rose-200">
              {formatSeconds(recordingSeconds)}
            </span>
          </div>
        </div>
      )}

      {/* Input Bar with Bhashini STT Microphone & Send */}
      <div className="bg-stone-950 border border-stone-800 rounded-2xl p-2.5 flex items-center gap-2 shadow-lg">
        {/* Bhashini STT Microphone Button (Icon-Only) */}
        <button
          type="button"
          onClick={handleToggleBhashiniSTT}
          title={isRecording ? 'Stop recording' : `Speak in ${langConfig.label} using Bhashini STT Engine`}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0 ${
            isRecording
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950 animate-pulse'
              : 'bg-stone-900 hover:bg-stone-800 text-emerald-400 border border-stone-800 hover:border-emerald-500/50'
          }`}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Input Text Box in Selected Language */}
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isRecording ? uiText.listeningPlaceholder : uiText.placeholder}
          className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
        />

        {/* Localized Send Button */}
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !inputPrompt.trim()}
          className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shrink-0 shadow-lg shadow-emerald-950"
        >
          <span>{uiText.send}</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
