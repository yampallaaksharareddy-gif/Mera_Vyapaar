import { CreditScoreResult, LedgerEntry, SupportedLanguage } from '../types';

/**
 * Concrete Algorithmic Scoring mirroring CalculateAlternativeCreditScoreUseCase.kt
 * Provides real-time recalculation as entries are added or modified.
 */
export function calculateAlternativeCreditScore(
  entries: LedgerEntry[],
  shgMeetingAttendanceRatio: number = 0.95,
  hasAadhaarVerified: boolean = true,
  lang: SupportedLanguage = 'en'
): CreditScoreResult {
  if (entries.length < 5) {
    const coldStartInsights: Record<SupportedLanguage, string[]> = {
      en: [
        '🛡️ Cold Start Social Verification Mode Active: Your profile is currently anchored to Verified Aadhaar KYC & SHG Peer Trust.',
        'Record 5+ daily sales transactions to transition from Social Baseline Mode to full Cash-Flow Underwriting.'
      ],
      hi: [
        '🛡️ कोल्ड स्टार्ट सामाजिक सत्यापन मोड सक्रिय: आपकी प्रोफाइल वर्तमान में सत्यापित आधार KYC और SHG साख पर आधारित है।',
        'पूर्ण नकदी प्रवाह मूल्यांकन के लिए 5+ दैनिक बिक्री लेनदेन दर्ज करें।'
      ],
      mr: [
        '🛡️ कोल्ड स्टार्ट सामाजिक पडताळणी मोड सक्रिय: तुमचे प्रोफाइल सध्या सत्यापित आधार KYC आणि SHG साखवर आधारित आहे.',
        'पूर्ण रोख प्रवाह मूल्यांकनासाठी ५+ दैनंदिन विक्री व्यवहार नोंदवा.'
      ],
      te: [
        '🛡️ కోల్డ్ స్టార్ట్ సోషల్ వెరిఫికేషన్ మోడ్ సక్రియంగా ఉంది: మీ ప్రొఫైల్ ప్రస్తుతం ధృవీకరించబడిన ఆధార్ మరియు SHG విశ్వసనీయతపై ఆధారపడి ఉంటుంది.',
        'పూర్తి నగదు ప్రవాహ అంచనా కోసం 5+ రోజువారీ అమ్మకాలను నమోదు చేయండి.'
      ],
      ta: [
        '🛡️ கோல்டு ஸ்டார்ட் சமூக சரிபார்ப்பு முறை செயலில் உள்ளது.',
        'முழுமையான மதிப்பீட்டிற்கு 5+ தினசரி விற்பனை பரிவர்த்தனைகளைப் பதிவு செய்யவும்.'
      ],
      bn: [
        '🛡️ কোল্ড স্টার্ট সামাজিক যাচাইকরণ মোড সক্রিয় রয়েছে।',
        'সম্পূর্ণ মূল্যায়নের জন্য ৫+ দৈনিক বিক্রয় লেনদেন রেকর্ড করুন।'
      ]
    };

    return {
      totalScore: 510,
      tier: 'FAIR',
      cashFlowConsistencyScore: 90,
      profitMarginScore: 80,
      transactionFrequencyScore: 70,
      seasonalityBufferScore: 80,
      shgTrustFactorScore: 130,
      eligibleSchemes: ['PM MUDRA Shishu Starter (Up to ₹50,000)', 'PM SVANidhi Micro Credit'],
      maxRecommendedLoan: 25000,
      riskRating: 'MODERATE',
      insights: coldStartInsights[lang] || coldStartInsights.en
    };
  }

  const incomeEntries = entries.filter((e) => e.transactionType === 'INCOME');
  const expenseEntries = entries.filter((e) => e.transactionType === 'EXPENSE');

  const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = expenseEntries.reduce((sum, e) => sum + e.amount, 0);
  const netCashFlow = totalIncome - totalExpense;

  // 1. Daily Inflow Consistency (Coefficient of Variation)
  const dailyInflowsMap: Record<string, number> = {};
  incomeEntries.forEach((e) => {
    const dayKey = new Date(e.timestamp).toISOString().split('T')[0];
    dailyInflowsMap[dayKey] = (dailyInflowsMap[dayKey] || 0) + e.amount;
  });

  const dailyAmounts = Object.values(dailyInflowsMap);
  let consistencyRatio = 0.4;
  if (dailyAmounts.length > 1) {
    const mean = dailyAmounts.reduce((a, b) => a + b, 0) / dailyAmounts.length;
    const variance =
      dailyAmounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dailyAmounts.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? stdDev / mean : 1.0;
    consistencyRatio = Math.max(0, Math.min(1.0, 1.0 - cv * 0.4));
  } else if (dailyAmounts.length === 1) {
    consistencyRatio = 0.6;
  }
  const cashFlowConsistencyScore = Math.round(consistencyRatio * 250);

  // 2. Profit Margin Scoring (Max 200)
  const profitMargin = totalIncome > 0 ? netCashFlow / totalIncome : 0;
  let profitMarginScore = 40;
  if (profitMargin >= 0.35) profitMarginScore = 200;
  else if (profitMargin >= 0.25) profitMarginScore = 175;
  else if (profitMargin >= 0.15) profitMarginScore = 140;
  else if (profitMargin >= 0.05) profitMarginScore = 100;
  else if (profitMargin > 0) profitMarginScore = 70;

  // 3. Transaction Frequency & Operational Velocity (Max 150)
  const timestamps = entries.map((e) => e.timestamp);
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const daySpan = Math.max(1, Math.round((maxTime - minTime) / (1000 * 60 * 60 * 24)) + 1);
  const activeDays = new Set(entries.map((e) => new Date(e.timestamp).toDateString())).size;
  const activityRatio = Math.min(1.0, activeDays / Math.max(1, Math.min(daySpan, 30)));
  const transactionFrequencyScore = Math.min(
    150,
    Math.round(activityRatio * 100 + Math.min(entries.length * 3, 50))
  );

  // 4. Seasonality & Working Capital Buffer (Max 150)
  const monthlyAvgExpense = daySpan >= 30 ? (totalExpense / daySpan) * 30 : Math.max(1, totalExpense);
  const bufferMonths = monthlyAvgExpense > 0 ? Math.max(0, netCashFlow / monthlyAvgExpense) : 1;
  let seasonalityBufferScore = 40;
  if (bufferMonths >= 2.5) seasonalityBufferScore = 150;
  else if (bufferMonths >= 1.5) seasonalityBufferScore = 125;
  else if (bufferMonths >= 1.0) seasonalityBufferScore = 100;
  else if (bufferMonths >= 0.5) seasonalityBufferScore = 70;

  // 5. SHG Peer Trust Factor (Max 150)
  const shgTrustFactorScore = Math.min(
    150,
    Math.round(shgMeetingAttendanceRatio * 100 + (hasAadhaarVerified ? 50 : 20))
  );

  // Overall Score Calculation (Scale to 300 - 900)
  const rawWeightedPoints =
    cashFlowConsistencyScore * 0.28 +
    profitMarginScore * 0.22 +
    transactionFrequencyScore * 0.17 +
    seasonalityBufferScore * 0.17 +
    shgTrustFactorScore * 0.16;

  const totalScore = Math.min(900, Math.max(300, Math.round(300 + rawWeightedPoints * (600 / 185))));

  let tier: CreditScoreResult['tier'] = 'NEEDS_IMPROVEMENT';
  let riskRating: CreditScoreResult['riskRating'] = 'HIGH';

  if (totalScore >= 750) {
    tier = 'EXCELLENT';
    riskRating = 'LOW';
  } else if (totalScore >= 670) {
    tier = 'GOOD';
    riskRating = 'LOW';
  } else if (totalScore >= 580) {
    tier = 'FAIR';
    riskRating = 'MODERATE';
  }

  // Scheme eligibility & max loan calculations
  const eligibleSchemes: string[] = [];
  let maxLoan = 25000;

  if (totalScore >= 720 && totalIncome >= 50000) {
    eligibleSchemes.push('PM MUDRA Tarun (Up to ₹10 Lakhs, 8.5% Interest)');
    eligibleSchemes.push('PMEGP Scheme (Up to ₹25 Lakhs with 25-35% Govt Subsidy)');
    maxLoan = Math.min(1000000, Math.max(200000, netCashFlow * 4));
  } else if (totalScore >= 620 && totalIncome >= 25000) {
    eligibleSchemes.push('PM MUDRA Kishore (Up to ₹5 Lakhs, No Collateral)');
    eligibleSchemes.push('NABARD SHG-Bank Linkage Credit (Subsidized)');
    maxLoan = Math.min(500000, Math.max(75000, netCashFlow * 3));
  } else if (totalScore >= 500) {
    eligibleSchemes.push('PM MUDRA Shishu (Up to ₹50,000 Working Capital)');
    eligibleSchemes.push('PM SVANidhi Micro Credit (₹20,000 Second Tranche)');
    maxLoan = Math.min(50000, Math.max(20000, netCashFlow * 2));
  } else {
    eligibleSchemes.push('PM SVANidhi Starter Tranche (₹10,000)');
    maxLoan = 15000;
  }

  // Localized insights dictionary
  const marginPct = (profitMargin * 100).toFixed(0);
  const insights: string[] = [];

  if (lang === 'hi') {
    if (cashFlowConsistencyScore >= 180) {
      insights.push('✅ मजबूत दैनिक नकदी प्रवाह: बैंक बिना गिरवी (Collateral-Free) तुरंत स्वीकृति देंगे।');
    } else {
      insights.push('⚠️ अनियमित दैनिक आमदनी: सप्ताह में कम से कम 5 दिन प्रविष्टियां दर्ज करने से स्कोर 45 अंक बढ़ेगा।');
    }

    if (profitMargin >= 0.20) {
      insights.push(`✅ 20%+ ऑपरेटिंग मार्जिन (${marginPct}%): PMEGP में 25% पूंजीगत सब्सिडी के लिए पात्र।`);
    } else {
      insights.push('💡 सुझाव: गैर-ज़रूरी छोटे खर्चों को कम करके शुद्ध लाभ मार्जिन 15% से ऊपर ले जाएं।');
    }

    if (shgMeetingAttendanceRatio >= 0.90) {
      insights.push('✅ स्वयंसहायता समूह (SHG) में उच्च साख: नाबार्ड सामूहिक ऋण गारंटी का सीधा लाभ मिलेगा।');
    }
  } else if (lang === 'mr') {
    if (cashFlowConsistencyScore >= 180) {
      insights.push('✅ मजबूत दैनिक रोख प्रवाह: बँका विनातारण (Collateral-Free) त्वरित मंजुरी देतील.');
    } else {
      insights.push('⚠️ अनियमित दैनिक उत्पन्न: आठवड्यात किमान ५ दिवस नोंदी केल्यास स्कोअर ४५ गुणांनी वाढेल.');
    }

    if (profitMargin >= 0.20) {
      insights.push(`✅ २०%+ ऑपरेटिंग मार्जिन (${marginPct}%): PMEGP अंतर्गत २५% भांडवली अनुदानासाठी पात्र.`);
    } else {
      insights.push('💡 सूचना: अनावश्यक खर्च कमी करून निव्वळ नफा मार्जिन १५% पेक्षा जास्त करा.');
    }

    if (shgMeetingAttendanceRatio >= 0.90) {
      insights.push('✅ बचत गटात (SHG) उच्च पत: नाबार्ड सामूहिक कर्ज हमीचा थेट लाभ मिळेल.');
    }
  } else if (lang === 'te') {
    if (cashFlowConsistencyScore >= 180) {
      insights.push('✅ బలమైన రోజువారీ నగదు ప్రవాహం: బ్యాంకులు ఎటువంటి పూచీకత్తు లేకుండా తక్షణమే ఆమోదిస్తాయి.');
    } else {
      insights.push('⚠️ సక్రమంగా లేని రోజువారీ ఆదాయం: వారానికి కనీసం 5 రోజులు ఎంట్రీలు నమోదు చేస్తే స్కోరు 45 పాయింట్లు పెరుగుతుంది.');
    }

    if (profitMargin >= 0.20) {
      insights.push(`✅ 20%+ ఆపరేటింగ్ మార్జిన్ (${marginPct}%): PMEGP లో 25% మూలధన రాయితీకి అర్హత.`);
    } else {
      insights.push('💡 సలహా: అనవసరపు ఖర్చులను తగ్గించి నికర లాభ మార్జిన్‌ను 15% కంటే పెంచండి.');
    }

    if (shgMeetingAttendanceRatio >= 0.90) {
      insights.push('✅ స్వయం సహాయక బృందం (SHG) లో ఉన్నత విశ్వసనీయత: నాబార్డ్ గ్రూప్ లోన్ గ్యారెంటీ ప్రయోజనం అందుబాటులో ఉంటుంది.');
    }
  } else if (lang === 'ta') {
    if (cashFlowConsistencyScore >= 180) {
      insights.push('✅ வலுவான தினசரி பணப்புழக்கம்: வங்கிகள் பிணையமின்றி உடனடியாக கடன் ஒப்புதல் வழங்கும்.');
    } else {
      insights.push('⚠️ ஒழுங்கற்ற தினசரி வருமானம்: வாரத்திற்கு குறைந்தபட்சம் 5 நாட்கள் பதிவிட்டால் ஸ்கோர் 45 புள்ளிகள் உயரும்.');
    }

    if (profitMargin >= 0.20) {
      insights.push(`✅ 20%+ இயக்க வரம்பு (${marginPct}%): PMEGP திட்டத்தில் 25% மானியத்திற்கு தகுதியுடையவர்.`);
    } else {
      insights.push('💡 ஆலோசனை: தேவையற்ற செலவுகளைக் குறைத்து நிகர லாபத்தை 15% க்கு மேல் உயர்த்தவும்.');
    }

    if (shgMeetingAttendanceRatio >= 0.90) {
      insights.push('✅ மகளிர் சுயஉதவி குழு (SHG) நற்பெயர்: நபார்டு குழு கடன் உத்தரவாதத்தின் நேரடி பலன் கிடைக்கும்.');
    }
  } else if (lang === 'bn') {
    if (cashFlowConsistencyScore >= 180) {
      insights.push('✅ শক্তিশালী দৈনিক নগদ প্রবাহ: ব্যাংক জামানতহীন অবিলম্বে ঋণ অনুমোদন করবে।');
    } else {
      insights.push('⚠️ অনিয়মিত দৈনিক আয়: সপ্তাহে অন্তত ৫ দিন এন্ট্রি রেকর্ড করলে স্কোর ৪৫ পয়েন্ট বাড়বে।');
    }

    if (profitMargin >= 0.20) {
      insights.push(`✅ ২০%+ অপারেটিং মার্জিন (${marginPct}%): PMEGP-তে ২৫% মূলধন ভর্তুকির জন্য যোগ্য।`);
    } else {
      insights.push('💡 পরামর্শ: অপ্রয়োজনীয় খরচ কমিয়ে নিট লাভের মার্জিন ১৫% এর উপরে তুলুন।');
    }

    if (shgMeetingAttendanceRatio >= 0.90) {
      insights.push('✅ স্বনির্ভর গোষ্ঠীতে (SHG) উচ্চ আস্থা: নাবার্ড দলগত ঋণ গ্যারান্টির সুবিধা প্রযোজ্য।');
    }
  } else {
    // English (Default)
    if (cashFlowConsistencyScore >= 180) {
      insights.push('✅ Strong Daily Cash Flow: Banks offer instant zero-collateral pre-approvals.');
    } else {
      insights.push('⚠️ Irregular Daily Inflows: Logging entries at least 5 days a week will boost your score by 45 points.');
    }

    if (profitMargin >= 0.20) {
      insights.push(`✅ 20%+ Operating Margin (${marginPct}%): Eligible for 25% capital subsidy under PMEGP.`);
    } else {
      insights.push('💡 Recommendation: Reduce non-essential expenses to lift net operating profit margin above 15%.');
    }

    if (shgMeetingAttendanceRatio >= 0.90) {
      insights.push('✅ High SHG Peer Trust Factor: Direct qualification for NABARD group loan guarantees.');
    }
  }

  return {
    totalScore,
    tier,
    cashFlowConsistencyScore,
    profitMarginScore,
    transactionFrequencyScore,
    seasonalityBufferScore,
    shgTrustFactorScore,
    eligibleSchemes,
    maxRecommendedLoan: Math.round(maxLoan),
    riskRating,
    insights
  };
}
