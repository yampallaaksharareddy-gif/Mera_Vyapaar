import React, { useState, useMemo } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  CheckCircle2,
  User,
  Tag,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { LedgerEntry, SupportedLanguage, TransactionType } from '../types';
import { TRANSLATIONS } from '../constants/translations';

interface ManualEntryViewProps {
  currentLang: SupportedLanguage;
  onAddEntry: (entry: Omit<LedgerEntry, 'id' | 'timestamp' | 'isSynced'>) => void;
  onNavigateToLedger: () => void;
}

interface LocalizedCategory {
  id: string;
  icon: string;
  names: Record<SupportedLanguage, string>;
}

const CATEGORIES: LocalizedCategory[] = [
  {
    id: 'grocery',
    icon: '🛒',
    names: {
      en: 'Grocery Store',
      hi: 'किराना दुकान',
      mr: 'किराणा दुकान',
      te: 'కిరాణా దుకాణం',
      ta: 'மளிகைக் கடை',
      bn: 'মুদি দোকান'
    }
  },
  {
    id: 'dairy',
    icon: '🥛',
    names: {
      en: 'Milk & Dairy',
      hi: 'डेयरी व दूध',
      mr: 'दूध व डेअरी',
      te: 'పాలు & డెయిరీ',
      ta: 'பால் & பண்ணை',
      bn: 'দুধ ও দুগ্ধজাত'
    }
  },
  {
    id: 'seeds',
    icon: '🌱',
    names: {
      en: 'Seeds & Fertilizers',
      hi: 'कृषि इनपुट व खाद-बीज',
      mr: 'बियाणे व खते',
      te: 'విత్తనాలు & ఎరువులు',
      ta: 'விதைகள் & உரங்கள்',
      bn: 'বীজ ও সার'
    }
  },
  {
    id: 'mandi',
    icon: '🌾',
    names: {
      en: 'Agri Produce & Mandi',
      hi: 'कृषि उपज व मंडी',
      mr: 'कृषी उत्पन्न व मंडी',
      te: 'వ్యవసాయ ఉత్పత్తులు & మండీ',
      ta: 'வேளாண் விளைபொருள் & மண்டி',
      bn: 'কৃষি পণ্য ও মান্ডি'
    }
  },
  {
    id: 'artisan',
    icon: '🧵',
    names: {
      en: 'Artisan & Handloom',
      hi: 'हस्तशिल्प व हथकरघा',
      mr: 'हस्तकला व हातमाग',
      te: 'చేతివృత్తులు & చేనేత',
      ta: 'கைவினை & கைத்தறி',
      bn: 'হস্তশিল্প ও তাঁত'
    }
  },
  {
    id: 'transport',
    icon: '🚚',
    names: {
      en: 'Fuel & Logistics',
      hi: 'परिवहन व ईंधन',
      mr: 'वाहतूक व इंधन',
      te: 'రవాణా & ఇంధనం',
      ta: 'போக்குவரத்து & எரிபொருள்',
      bn: 'পরিবহন ও জ্বালানি'
    }
  },
  {
    id: 'labor',
    icon: '👷',
    names: {
      en: 'Labor & Wages',
      hi: 'श्रमिक व मजदूरी',
      mr: 'कामगार व मजुरी',
      te: 'కూలీ & వేతనాలు',
      ta: 'கூலி & தொழிலாளர்',
      bn: 'শ্রমিক ও মজুরি'
    }
  },
  {
    id: 'wholesale',
    icon: '📦',
    names: {
      en: 'Wholesale Stock',
      hi: 'थोक खरीद-फरोख्त',
      mr: 'घाऊक खरेदी-विक्री',
      te: 'హోల్‌సేల్ సరుకు',
      ta: 'மொத்த விற்பனை சரக்கு',
      bn: 'পাইকারি স্টক'
    }
  },
  {
    id: 'equipment',
    icon: '🔧',
    names: {
      en: 'Machinery & Repairs',
      hi: 'उपकरण व मरम्मत',
      mr: 'यंत्रसामग्री व दुरुस्ती',
      te: 'యంత్రాలు & మరమ్మతులు',
      ta: 'இயந்திரங்கள் & பழுது',
      bn: 'যন্ত্রপাতি ও মেরামত'
    }
  },
  {
    id: 'misc',
    icon: '📝',
    names: {
      en: 'Miscellaneous',
      hi: 'विविध खर्च',
      mr: 'इतर खर्च',
      te: 'ఇతర ఖర్చులు',
      ta: 'இதர செலவுகள்',
      bn: 'অন্যান্য খরচ'
    }
  }
];

const PAYMENT_LABELS: Record<SupportedLanguage, { cash: string; upi: string; credit: string; partyLabel: string; partyPlaceholder: string; notesPlaceholder: string }> = {
  en: {
    cash: '💵 Cash',
    upi: '📱 UPI',
    credit: '📋 Udhaar / Credit',
    partyLabel: 'Customer / Party Name',
    partyPlaceholder: 'e.g. Ramesh Kumar, City Mart',
    notesPlaceholder: 'e.g. 2 bags of seeds, Invoice #42...'
  },
  hi: {
    cash: '💵 नकद',
    upi: '📱 UPI',
    credit: '📋 उधार',
    partyLabel: 'ग्राहक / व्यापारी का नाम',
    partyPlaceholder: 'उदा. रमेश जी, शर्मा खाद भंडार',
    notesPlaceholder: 'उदा. 2 बोरी डीएपी खाद, 10 लीटर दूध...'
  },
  mr: {
    cash: '💵 रोख',
    upi: '📱 UPI',
    credit: '📋 उधारी',
    partyLabel: 'ग्राहक / व्यापारी नाव',
    partyPlaceholder: 'उदा. रमेश पाटील, कृषी केंद्र',
    notesPlaceholder: 'उदा. १० लिटर दूध, बिल क्र. ४२...'
  },
  te: {
    cash: '💵 నగదు',
    upi: '📱 UPI',
    credit: '📋 అప్పు / ఉధార్',
    partyLabel: 'కస్టమర్ / వ్యాపారి పేరు',
    partyPlaceholder: 'ఉదా. రమేష్ కుమార్, కిరాణా',
    notesPlaceholder: 'ఉదా. విత్తనాలు, బిల్లు #42...'
  },
  ta: {
    cash: '💵 ரொக்கம்',
    upi: '📱 UPI',
    credit: '📋 கடன்',
    partyLabel: 'வாடிக்கையாளர் / வர்த்தகர் பெயர்',
    partyPlaceholder: 'உதா. ரமேஷ் குமார்',
    notesPlaceholder: 'உதா. ரசீது #42, பொருட்கள்...'
  },
  bn: {
    cash: '💵 নগদ',
    upi: '📱 UPI',
    credit: '📋 বাকি / ধার',
    partyLabel: 'গ্রাহক / ব্যবসায়ীর নাম',
    partyPlaceholder: 'যেমন: রমেশ কুমার',
    notesPlaceholder: 'যেমন: বিল নং ৪২, বীজ ইত্যাদি...'
  }
};

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000, 10000];

export const ManualEntryView: React.FC<ManualEntryViewProps> = ({
  currentLang,
  onAddEntry,
  onNavigateToLedger
}) => {
  const t = TRANSLATIONS[currentLang];
  const langConfig = PAYMENT_LABELS[currentLang] || PAYMENT_LABELS.en;

  // Selected category by category ID
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(CATEGORIES[0].id);
  const [transactionType, setTransactionType] = useState<TransactionType>('INCOME');
  const [amount, setAmount] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'UDHAAR_CREDIT'>('CASH');
  const [isSuccess, setIsSuccess] = useState(false);

  const localizedCategories = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      id: cat.id,
      icon: cat.icon,
      name: cat.names[currentLang] || cat.names.en
    }));
  }, [currentLang]);

  const handleQuickAmount = (val: number) => {
    const currentVal = parseFloat(amount) || 0;
    setAmount(String(currentVal + val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const matchedCategory = CATEGORIES.find((c) => c.id === selectedCategoryId);
    const categoryName = matchedCategory ? (matchedCategory.names[currentLang] || matchedCategory.names.en) : 'General';

    let compiledNotes = notes.trim();
    if (customerName.trim()) {
      compiledNotes = `${langConfig.partyLabel}: ${customerName.trim()} ${compiledNotes ? `• ${compiledNotes}` : ''}`;
    }
    if (paymentMode !== 'CASH') {
      const modeLabel = paymentMode === 'UPI' ? 'UPI' : (currentLang === 'hi' ? 'उधार' : 'Credit');
      compiledNotes = `${compiledNotes} [${modeLabel}]`.trim();
    }

    onAddEntry({
      amount: parsedAmount,
      transactionType,
      category: categoryName,
      notes: compiledNotes || undefined,
      sourceText: `${t.manualEntry} • ${transactionType === 'INCOME' ? t.income : t.expense}`
    });

    setIsSuccess(true);
    setTimeout(() => {
      setAmount('');
      setCustomerName('');
      setNotes('');
      setIsSuccess(false);
      onNavigateToLedger();
    }, 1200);
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-28 min-w-0">
      {/* Header card */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border border-stone-800 p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shrink-0">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg sm:text-lg sm:text-xl font-bold text-stone-100 tracking-tight">
            {t.manualEntry}
          </h2>
        </div>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">
                {currentLang === 'hi'
                  ? 'प्रविष्टि सफलतापूर्वक सहेजी गई!'
                  : 'Entry saved successfully to local Room DB!'}
              </p>
              <p className="text-xs text-emerald-300/80">
                {currentLang === 'hi'
                  ? 'खाता अपडेट हो रहा है...'
                  : 'Redirecting to ledger view...'}
              </p>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
        </div>
      )}

      {/* Manual Entry Form */}
      <form onSubmit={handleSubmit} className="space-y-5 bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* 1. Transaction Type Toggle */}
        <div>
          <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block mb-2">
            {t.transactionTypeLabel} *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTransactionType('INCOME')}
              className={`py-3 px-4 rounded-2xl text-sm font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                transactionType === 'INCOME'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-500/40'
                  : 'bg-stone-950/70 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-white">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <span>+ {t.income}</span>
            </button>

            <button
              type="button"
              onClick={() => setTransactionType('EXPENSE')}
              className={`py-3 px-4 rounded-2xl text-sm font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                transactionType === 'EXPENSE'
                  ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-950/60 ring-2 ring-rose-500/40'
                  : 'bg-stone-950/70 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-white">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span>- {t.expense}</span>
            </button>
          </div>
        </div>

        {/* 2. Amount Input & Quick Chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">
              {t.amount} *
            </label>
            {amount && (
              <button
                type="button"
                onClick={() => setAmount('')}
                className="text-[11px] text-stone-400 hover:text-stone-200 underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold font-mono text-stone-400">
              ₹
            </span>
            <input
              type="number"
              required
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-stone-950 border border-stone-700 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-3.5 text-stone-100 font-mono text-2xl sm:text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition"
            />
          </div>

          {/* Quick Amount Chips */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {QUICK_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAmount(val)}
                className="px-2.5 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono font-medium border border-stone-700/80 transition cursor-pointer"
              >
                +₹{val}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Category Select (Localized exclusively in selected language) */}
        <div>
          <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.category} *</span>
          </label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full bg-stone-950 border border-stone-700 rounded-2xl px-4 py-3 text-stone-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 font-medium cursor-pointer"
          >
            {localizedCategories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-stone-900 text-stone-100 py-1">
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Payment Mode & Customer / Party Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>{langConfig.partyLabel}</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={langConfig.partyPlaceholder}
              className="w-full bg-stone-950 border border-stone-700 rounded-2xl px-4 py-3 text-stone-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block mb-2">
              {currentLang === 'hi' ? 'भुगतान का प्रकार' : currentLang === 'mr' ? 'पेमेंट प्रकार' : currentLang === 'te' ? 'చెల్లింపు విధానం' : currentLang === 'ta' ? 'பணம் செலுத்தும் முறை' : currentLang === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Mode'}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentMode('CASH')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                  paymentMode === 'CASH'
                    ? 'bg-amber-600/30 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-800'
                }`}
              >
                {langConfig.cash}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('UPI')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                  paymentMode === 'UPI'
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-semibold'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-800'
                }`}
              >
                {langConfig.upi}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('UDHAAR_CREDIT')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer truncate ${
                  paymentMode === 'UDHAAR_CREDIT'
                    ? 'bg-purple-600/30 border-purple-500 text-purple-300 font-semibold'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-800'
                }`}
              >
                {langConfig.credit}
              </button>
            </div>
          </div>
        </div>

        {/* 5. Additional Notes */}
        <div>
          <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-stone-400" />
            <span>{t.notes}</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={langConfig.notesPlaceholder}
            className="w-full bg-stone-950 border border-stone-700 rounded-2xl px-4 py-3 text-stone-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        {/* Submit Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-800">
          <button
            type="button"
            onClick={onNavigateToLedger}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 text-xs font-semibold transition cursor-pointer"
          >
            ← {currentLang === 'hi' ? 'वापस बहीखाता पर जाएं' : currentLang === 'mr' ? 'खातेवहीकडे परत' : currentLang === 'te' ? 'ఖాతాకు తిరిగి వెళ్లండి' : currentLang === 'ta' ? 'கணக்கிற்குத் திரும்பு' : currentLang === 'bn' ? 'খাতায় ফিরে যান' : 'Back to Ledger'}
          </button>

          <button
            type="submit"
            disabled={!amount || isSuccess}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              !amount || isSuccess
                ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                : transactionType === 'INCOME'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/80 active:scale-98'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/80 active:scale-98'
            }`}
          >
            <span>{t.save}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
