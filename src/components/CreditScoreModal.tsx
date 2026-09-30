import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Award,
  ChevronRight,
  ArrowRight,
  Sliders,
  Sparkles,
  Lock,
  Building2
} from 'lucide-react';
import { CreditScoreResult, LedgerEntry, SupportedLanguage } from '../types';
import { calculateAlternativeCreditScore } from '../utils/creditScorer';
import { TRANSLATIONS } from '../constants/translations';

interface CreditScoreModalProps {
  entries: LedgerEntry[];
  currentLang: SupportedLanguage;
  onClose?: () => void;
  onOpenSchemes?: () => void;
  inline?: boolean;
}

export const CreditScoreModal: React.FC<CreditScoreModalProps> = ({
  entries,
  currentLang,
  onClose,
  onOpenSchemes,
  inline = false
}) => {
  const t = TRANSLATIONS[currentLang];
  const [shgAttendance, setShgAttendance] = useState(0.95);
  const [aadhaarVerified, setAadhaarVerified] = useState(true);

  // Recalculate credit score with current slider parameters
  const scoreResult: CreditScoreResult = calculateAlternativeCreditScore(
    entries,
    shgAttendance,
    aadhaarVerified,
    currentLang
  );

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-emerald-400 border-emerald-500';
    if (score >= 670) return 'text-teal-400 border-teal-500';
    if (score >= 580) return 'text-amber-400 border-amber-500';
    return 'text-rose-400 border-rose-500';
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const i18n = {
    hi: {
      title: 'वैकल्पिक क्रेडिट स्कोर',
      subtitle: 'पारंपरिक CIBIL के बिना, दैनिक नकद प्रवाह व SHG साख के आधार पर गैर-जमानती ऋण मूल्यांकन',
      points: '/ 900 अंक',
      tier: 'श्रेणी',
      eligibleCredit: 'अनुशंसित ऋण क्षमता (MUDRA)',
      zeroCollateral: 'मुद्रा योजना व स्थानीय ग्रामीण बैंकों द्वारा बिना किसी बंधक (Zero Collateral) के उपलब्ध',
      riskRating: 'जोखिम रेटिंग',
      mudraEligible: 'MUDRA शिशु / किशोर पात्र',
      pillarsTitle: 'स्कोरिंग घटक विश्लेषण',
      p1Title: '1. नकद प्रवाह स्थिरता',
      p1Desc: 'दैनिक आमदनी का विचरण गुणांक (Cash Flow Stability)',
      p2Title: '2. परिचालन लाभ मार्जिन',
      p2Desc: 'शुद्ध आय / कुल बिक्री अनुपात',
      p3Title: '3. लेनदेन आवृत्ति',
      p3Desc: 'माह में सक्रिय कामकाजी दिनों का अनुपात',
      p4Title: '4. मौसमी कार्यशील पूंजी बफर',
      p4Desc: 'मानसून व मंदी के महीनों के लिए सुरक्षा बफर',
      p5Title: '5. स्वयंसहायता समूह (SHG) सामाजिक साख',
      p5Desc: 'SHG बैठक उपस्थिति व सामूहिक बचत साख',
      simTitle: 'पैरामीटर सिम्युलेटर (Live Score Simulation)',
      shgAtt: 'SHG बैठक उपस्थिति अनुपात:',
      aadhaarBio: 'आधार व उद्यम (Udyam) बायोमेट्रिक सत्यापित (+50 अंक)',
      matchedSchemes: 'पात्र सरकारी ऋण योजनाएं (Directly Matched Schemes)',
      viewDetails: 'आवेदन विवरण',
      adviceTitle: '💡 वित्तीय सलाह व स्कोर सुधार सुझाव:',
      close: 'बंद करें'
    },
    mr: {
      title: 'पर्यायी क्रेडिट स्कोअर',
      subtitle: 'पारंपारिक CIBIL शिवाय, दैनंदिन रोख प्रवाह आणि SHG पत आधारे विनातारण कर्ज मूल्यांकन',
      points: '/ ९०० गुण',
      tier: 'श्रेणी',
      eligibleCredit: 'पात्र सूक्ष्म कर्ज क्षमता (MUDRA)',
      zeroCollateral: 'मुद्रा योजना व स्थानिक ग्रामीण बँकांकडून विनातारण (Zero Collateral) उपलब्ध',
      riskRating: 'जोखीम रेटिंग',
      mudraEligible: 'MUDRA शिशु / किशोर पात्र',
      pillarsTitle: 'स्कोअरिंग घटक विश्लेषण',
      p1Title: '१. रोख प्रवाह स्थिरता',
      p1Desc: 'दैनंदिन उत्पन्नाचे सातत्य व स्थिरता',
      p2Title: '२. नफा मार्जिन',
      p2Desc: 'निव्वळ नफा / एकूण विक्री प्रमाण',
      p3Title: '३. व्यवहार वारंवारता',
      p3Desc: 'महिन्यातील सक्रिय व्यावसायिक दिवसांचे प्रमाण',
      p4Title: '४. हंगामी खेळते भांडवल बफर',
      p4Desc: 'पावसाळा व मंदीच्या काळासाठी भांडवल सुरक्षा',
      p5Title: '५. बचत गट (SHG) सामाजिक पत',
      p5Desc: 'बचत गट बैठका उपस्थिती आणि बचत पत',
      simTitle: 'पॅरामीटर सिम्युलेटर (Live Simulation)',
      shgAtt: 'SHG बैठक उपस्थिती प्रमाण:',
      aadhaarBio: 'आधार आणि उद्यम बायोमेट्रिक सत्यापित (+५० गुण)',
      matchedSchemes: 'पात्र शासकीय कर्ज योजना',
      viewDetails: 'अर्ज तपशील',
      adviceTitle: '💡 आर्थिक सल्ला आणि स्कोअर सुधारणा सूचना:',
      close: 'बंद करा'
    },
    te: {
      title: 'ప్రత్యామ్నాయ క్రెడిట్ స్కోరు',
      subtitle: 'CIBIL లేకుండా, రోజువారీ నగదు ప్రవాహం మరియు స్వయం సహాయక బృందం (SHG) ఆధారంగా పూచీకత్తు లేని రుణ మూల్యాంకనం',
      points: '/ 900 పాయింట్లు',
      tier: 'శ్రేణి',
      eligibleCredit: 'అర్హత కలిగిన సూక్ష్మ రుణం (MUDRA)',
      zeroCollateral: 'ముద్ర యోజన ద్వారా ఎటువంటి పూచీకత్తు లేకుండా లభించే రుణం',
      riskRating: 'రిస్క్ రేటింగ్',
      mudraEligible: 'ముద్ర శిశు / కిషోర్ అర్హత',
      pillarsTitle: 'స్కోరింగ్ అంశాల విశ్లేషణ',
      p1Title: '1. నగదు ప్రవాహ స్థిరత్వం',
      p1Desc: 'రోజువారీ ఆదాయ స్థిరత్వం',
      p2Title: '2. లాభాల మార్జిన్',
      p2Desc: 'నికర లాభం / అమ్మకాల నిష్పత్తి',
      p3Title: '3. లావాదేవీల ఫ్రీక్వెన్సీ',
      p3Desc: 'నెలలో వ్యాపార క్రియాశీల రోజుల సంఖ్య',
      p4Title: '4. సీజనల్ మూలధన బఫర్',
      p4Desc: 'అవసర సమయాల్లో నిధుల లభ్యత',
      p5Title: '5. SHG సామాజిక విశ్వసనీయత',
      p5Desc: 'SHG సమావేశాల హాజరు మరియు పొదుపు క్రమశిక్షణ',
      simTitle: 'లైవ్ స్కోర్ సిమ్యులేటర్',
      shgAtt: 'SHG సమావేశ హాజరు నిష్పత్తి:',
      aadhaarBio: 'ఆధార్ & ఉద్యమ్ బయోమెట్రిక్ ధృవీకరించబడింది (+50 పాయింట్లు)',
      matchedSchemes: 'అర్హత కలిగిన ప్రభుత్వ పథకాలు',
      viewDetails: 'దరఖాస్తు వివరాలు',
      adviceTitle: '💡 ఆర్థిక సలహాలు & స్కోరు మెరుగుదల చిట్కాలు:',
      close: 'మూసివేయి'
    },
    ta: {
      title: 'மாற்று கிரெடிட் ஸ்கோர்',
      subtitle: 'CIBIL இன்றி, தினசரி பணப்புழக்கம் மற்றும் மகளிர் சுயஉதவிக்குழு (SHG) நற்பெயரின் அடிப்படையில் பிணையமில்லா கடன் மதிப்பீடு',
      points: '/ 900 புள்ளிகள்',
      tier: 'பிரிவு',
      eligibleCredit: 'பரிந்துரைக்கப்பட்ட நுண்கடன் வரம்பு (MUDRA)',
      zeroCollateral: 'முத்ரா திட்டம் மூலம் பிணையமின்றி வழங்கப்படும் கடன்',
      riskRating: 'ஆபத்து மதிப்பீடு',
      mudraEligible: 'MUDRA சிஷு / கிஷோர் தகுதி',
      pillarsTitle: 'மதிப்பீட்டு காரணிகள்',
      p1Title: '1. பணப்புழக்க நிலைத்தன்மை',
      p1Desc: 'தினசரி வருவாய் நிலைத்தன்மை',
      p2Title: '2. நிகர லாப விகிதம்',
      p2Desc: 'லாப வரம்பு / விற்பனை விகிதம்',
      p3Title: '3. பரிவர்த்தனை வேகம்',
      p3Desc: 'மாதத்தில் செயலில் உள்ள நாட்கள்',
      p4Title: '4. பருவகால கையிருப்பு பாதுகாப்பு',
      p4Desc: 'மந்தமான காலங்களுக்கான பாதுகாப்பு நிதி',
      p5Title: '5. மகளிர் குழு (SHG) சமூக நம்பிக்கை',
      p5Desc: 'குழு கூட்டம் வருகை மற்றும் சேமிப்பு ஒழுங்கு',
      simTitle: 'நேரலை அளவுரு சிமுலேட்டர்',
      shgAtt: 'SHG கூட்ட வருகை விகிதம்:',
      aadhaarBio: 'ஆதார் & உத்யம் சரிபார்க்கப்பட்டது (+50 புள்ளிகள்)',
      matchedSchemes: 'தகுதியான அரசு கடன் திட்டங்கள்',
      viewDetails: 'விவரங்களை காண்க',
      adviceTitle: '💡 நிதி ஆலோசனை & ஸ்கோர் மேம்பாட்டு குறிப்புகள்:',
      close: 'மூடு'
    },
    bn: {
      title: 'বিকল্প ক্রেডিট স্কোর',
      subtitle: 'প্রথাগত CIBIL ছাড়া, দৈনিক নগদ প্রবাহ ও স্বনির্ভর গোষ্ঠীর (SHG) ওপর ভিত্তি করে জামানতহীন ঋণ মূল্যায়ন',
      points: '/ ৯০০ পয়েন্ট',
      tier: 'বিভাগ',
      eligibleCredit: 'অনুমোদিত ক্ষুদ্র ঋণ সক্ষমতা (MUDRA)',
      zeroCollateral: 'মুদ্রা যোজনা ও গ্রামীণ ব্যাংকের মাধ্যমে বন্ধকহীন লোন',
      riskRating: 'ঝুঁকি রেটিং',
      mudraEligible: 'MUDRA শিশু / কিশোর যোগ্য',
      pillarsTitle: 'স্কোরিং ফ্যাক্টর বিশ্লেষণ',
      p1Title: '১. নগদ প্রবাহের স্থায়িত্ব',
      p1Desc: 'দৈনিক আয়ের ধারাবাহিকতা',
      p2Title: '২. মুনাফা মার্জিন',
      p2Desc: 'নেট লাভ / মোট বিক্রয় অনুপাত',
      p3Title: '৩. লেনদেনের পুনরাবৃত্তি',
      p3Desc: 'মাসে সক্রিয় কাজের দিনগুলির অনুপাত',
      p4Title: '৪. মৌসুমী মূলধন সুরক্ষা বাফার',
      p4Desc: 'বর্ষা ও মন্দা সময়ের আর্থিক সুরক্ষা',
      p5Title: '৫. স্বনির্ভর গোষ্ঠী (SHG) সামাজিক আস্থা',
      p5Desc: 'SHG বৈঠক উপস্থিতি ও যৌথ সঞ্চয় রেকর্ড',
      simTitle: 'প্যারামিটার সিমুলেটর (Live Score Simulation)',
      shgAtt: 'SHG বৈঠকের উপস্থিতি অনুপাত:',
      aadhaarBio: 'আধার ও উদ্যোগ (Udyam) বায়োমেট্রিক যাচাইকৃত (+৫০ পয়েন্ট)',
      matchedSchemes: 'যোগ্য সরকারি ঋণ প্রকল্পসমূহ',
      viewDetails: 'আবেদনের বিবরণ',
      adviceTitle: '💡 আর্থিক পরামর্শ ও স্কোর বৃদ্ধির টিপস:',
      close: 'বন্ধ করুন'
    },
    en: {
      title: 'Alternative Credit Score',
      subtitle: 'Zero-collateral micro-credit scoring powered by daily cashflow velocity & SHG social collateral',
      points: '/ 900 points',
      tier: 'Tier',
      eligibleCredit: 'Eligible Micro-Credit (MUDRA)',
      zeroCollateral: 'Available without collateral via MUDRA & regional rural banks (RRB)',
      riskRating: 'Risk Rating',
      mudraEligible: 'MUDRA Shishu / Kishore Eligible',
      pillarsTitle: 'Algorithmic Scoring Pillars',
      p1Title: '1. Cash-Flow Consistency',
      p1Desc: 'Coefficient of variation in daily receipts',
      p2Title: '2. Operating Profit Margin',
      p2Desc: 'Net operating surplus to turnover ratio',
      p3Title: '3. Ledger Velocity',
      p3Desc: 'Ratio of active transaction business days',
      p4Title: '4. Seasonality Working Capital Buffer',
      p4Desc: 'Liquidity runway for lean monsoon periods',
      p5Title: '5. SHG Social Capital Factor',
      p5Desc: 'Peer meeting attendance and group savings',
      simTitle: 'Live Score Simulator',
      shgAtt: 'SHG Meeting Attendance Ratio:',
      aadhaarBio: 'Aadhaar & Udyam Biometrically Verified (+50 pts)',
      matchedSchemes: 'Directly Matched Government Credit Schemes',
      viewDetails: 'Application Details',
      adviceTitle: '💡 Financial Advisory & Score Improvement:',
      close: 'Close'
    }
  }[currentLang] || {
    title: 'Alternative Credit Score',
    subtitle: 'Zero-collateral micro-credit scoring powered by daily cashflow velocity & SHG social collateral',
    points: '/ 900 points',
    tier: 'Tier',
    eligibleCredit: 'Eligible Micro-Credit (MUDRA)',
    zeroCollateral: 'Available without collateral via MUDRA & regional rural banks (RRB)',
    riskRating: 'Risk Rating',
    mudraEligible: 'MUDRA Shishu / Kishore Eligible',
    pillarsTitle: 'Algorithmic Scoring Pillars',
    p1Title: '1. Cash-Flow Consistency',
    p1Desc: 'Coefficient of variation in daily receipts',
    p2Title: '2. Operating Profit Margin',
    p2Desc: 'Net operating surplus to turnover ratio',
    p3Title: '3. Ledger Velocity',
    p3Desc: 'Ratio of active transaction business days',
    p4Title: '4. Seasonality Working Capital Buffer',
    p4Desc: 'Liquidity runway for lean monsoon periods',
    p5Title: '5. SHG Social Capital Factor',
    p5Desc: 'Peer meeting attendance and group savings',
    simTitle: 'Live Score Simulator',
    shgAtt: 'SHG Meeting Attendance Ratio:',
    aadhaarBio: 'Aadhaar & Udyam Biometrically Verified (+50 pts)',
    matchedSchemes: 'Directly Matched Government Credit Schemes',
    viewDetails: 'Application Details',
    adviceTitle: '💡 Financial Advisory & Score Improvement:',
    close: 'Close'
  };

  const content = (
    <div className={`bg-stone-900 border border-stone-800 rounded-3xl w-full ${inline ? '' : 'max-w-3xl shadow-2xl my-6'} overflow-hidden`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-emerald-950 p-4 sm:p-6 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>{i18n.title}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                Cashflow-Backed
              </span>
            </h3>
            <p className="text-xs text-stone-400">
              {i18n.subtitle}
            </p>
          </div>
        </div>
        {!inline && onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Main Score Display Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-center bg-stone-950/80 rounded-2xl p-6 border border-stone-800">
            {/* Score Ring Gauge */}
            <div className="flex flex-col items-center justify-center text-center">
              <div
                className={`w-36 h-36 rounded-full border-8 flex flex-col items-center justify-center shadow-lg ${getScoreColor(
                  scoreResult.totalScore
                )}`}
              >
                <span className="text-4xl font-extrabold font-mono text-white">
                  {scoreResult.totalScore}
                </span>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-stone-400">
                  {i18n.points}
                </span>
              </div>
              <div className="mt-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-800 text-stone-200 border border-stone-700">
                  {i18n.tier}: {scoreResult.tier}
                </span>
              </div>
            </div>

            {/* Assessment Summary */}
            <div className="md:col-span-2 space-y-3">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  {i18n.eligibleCredit}
                </span>
                <div className="text-3xl font-extrabold text-white font-mono mt-0.5">
                  {formatCurrency(scoreResult.maxRecommendedLoan)}
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  {i18n.zeroCollateral}
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {i18n.riskRating}: {scoreResult.riskRating}
                </span>
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-stone-300">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  {scoreResult.eligibleSchemes[0] || i18n.mudraEligible}
                </span>
              </div>
            </div>
          </div>

          {/* 5 Algorithmic Scoring Factors Breakdown */}
          <div>
            <h4 className="text-sm font-bold text-stone-200 mb-3 flex items-center justify-between">
              <span>{i18n.pillarsTitle}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Cash-Flow Consistency */}
              <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-3.5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-stone-300">
                    {i18n.p1Title}
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {scoreResult.cashFlowConsistencyScore} / 250
                  </span>
                </div>
                <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(scoreResult.cashFlowConsistencyScore / 250) * 100}%`
                    }}
                  ></div>
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5">
                  {i18n.p1Desc}
                </p>
              </div>

              {/* 2. Profit Margin */}
              <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-3.5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-stone-300">
                    {i18n.p2Title}
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {scoreResult.profitMarginScore} / 200
                  </span>
                </div>
                <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(scoreResult.profitMarginScore / 200) * 100}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5">
                  {i18n.p2Desc}
                </p>
              </div>

              {/* 3. Transaction Frequency */}
              <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-3.5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-stone-300">
                    {i18n.p3Title}
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {scoreResult.transactionFrequencyScore} / 150
                  </span>
                </div>
                <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(scoreResult.transactionFrequencyScore / 150) * 100}%`
                    }}
                  ></div>
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5">
                  {i18n.p3Desc}
                </p>
              </div>

              {/* 4. Seasonality Buffer */}
              <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-3.5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-stone-300">
                    {i18n.p4Title}
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {scoreResult.seasonalityBufferScore} / 150
                  </span>
                </div>
                <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(scoreResult.seasonalityBufferScore / 150) * 100}%`
                    }}
                  ></div>
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5">
                  {i18n.p4Desc}
                </p>
              </div>

              {/* 5. SHG Trust Factor */}
              <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-3.5 sm:col-span-2">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-stone-300">
                    {i18n.p5Title}
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {scoreResult.shgTrustFactorScore} / 150
                  </span>
                </div>
                <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(scoreResult.shgTrustFactorScore / 150) * 100}%`
                    }}
                  ></div>
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5">
                  {i18n.p5Desc}
                </p>
              </div>
            </div>
          </div>

          {/* AI Insights & Actionable Advice */}
          <div className="space-y-3">
            <div className="bg-stone-800/50 rounded-xl p-3.5 space-y-1.5 text-xs text-stone-300">
              <p className="font-semibold text-amber-300 text-[11px] uppercase tracking-wider">
                {i18n.adviceTitle}
              </p>
              {scoreResult.insights.map((insight, idx) => (
                <p key={idx} className="leading-relaxed">
                  {insight}
                </p>
              ))}

              <div className="pt-2 border-t border-stone-700/60 mt-2 flex justify-end">
                <a
                  href="https://www.jansamarth.in/home?loan_type=MUDRA&category=MSME&source=graminkhata"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 underline cursor-pointer"
                >
                  <span>Check Scheme Eligibility on Jan Samarth Engine →</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-950 p-4 border-t border-stone-800 flex items-center justify-end">
          {onClose && (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
            >
              {inline ? `← ${t.khataTab || 'Khata'}` : i18n.close}
            </button>
          )}
        </div>
      </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
      {content}
    </div>
  );
};
