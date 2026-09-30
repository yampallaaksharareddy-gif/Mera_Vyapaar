import { SupportedLanguage, TransactionType } from '../types';

export interface CategoryDefinition {
  id: string;
  names: Record<SupportedLanguage, string>;
}

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    id: 'grocery',
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
    id: 'machinery',
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
    id: 'health',
    names: {
      en: 'Health & Medical',
      hi: 'स्वास्थ्य व चिकित्सा',
      mr: 'आरोग्य व औषधे',
      te: 'ఆరోగ్యం & వైద్యం',
      ta: 'மருத்துவம் & சுகாதாரம்',
      bn: 'স্বাস্থ্য ও চিকিৎসা'
    }
  },
  {
    id: 'sales',
    names: {
      en: 'Retail Sales',
      hi: 'दुकान बिक्री',
      mr: 'दुकान विक्री',
      te: 'రిటైల్ అమ్మకాలు',
      ta: 'சில்லறை விற்பனை',
      bn: 'খুচরা বিক্রি'
    }
  },
  {
    id: 'misc',
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

export function getLocalizedCategory(rawCategory: string, lang: SupportedLanguage): string {
  if (!rawCategory) return lang === 'en' ? 'General' : 'सामान्य';

  const lower = rawCategory.toLowerCase();

  // Match against keywords
  if (lower.includes('किराना') || lower.includes('grocery') || lower.includes('provisions') || lower.includes('కిరాణా') || lower.includes('மளிகை') || lower.includes('মুদি')) {
    return CATEGORY_DEFINITIONS.find((c) => c.id === 'grocery')?.names[lang] || 'Grocery Store';
  }
  if (lower.includes('दूध') || lower.includes('डेयरी') || lower.includes('dairy') || lower.includes('milk') || lower.includes('पशुपालन') || lower.includes('పాలు') || lower.includes('பால்') || lower.includes('দুধ')) {
    return CATEGORY_DEFINITIONS.find((c) => c.id === 'dairy')?.names[lang] || 'Milk & Dairy';
  }
  if (lower.includes('खाद') || lower.includes('बीज') || lower.includes('fertilizer') || lower.includes('seed') || lower.includes('यूरिया') || lower.includes('విత్తనాలు') || lower.includes('விதைகள்') || lower.includes('বীজ')) {
    return CATEGORY_DEFINITIONS.find((c) => c.id === 'seeds')?.names[lang] || 'Seeds & Fertilizers';
  }
  if (lower.includes('मंडी') || lower.includes('उपज') || lower.includes('mandi') || lower.includes('agri') || lower.includes('produce') || lower.includes('व्यవసాయ') || lower.includes('வேளாண்') || lower.includes('মান্ডি')) {
    return CATEGORY_DEFINITIONS.find((c) => c.id === 'mandi')?.names[lang] || 'Agri Produce & Mandi';
  }
  if (lower.includes('हस्तशिल्प') || lower.includes('हथकरघा') || lower.includes('artisan') || lower.includes('handloom') || lower.includes('साड़ी') || lower.includes('చేనేత') || lower.includes('கைத்தறி') || lower.includes('তাঁত')) {
    return CATEGORY_DEFINITIONS.find((c) => c.id === 'artisan')?.names[lang] || 'Artisan & Handloom';
  }
  if (lower.includes('परिवहन') || lower.includes('ईंधन') || lower.includes('fuel') || lower.includes('logistics') || lower.includes('भाड़ा') || lower.includes('वाहतूक') || lower.includes('రవాణా') || lower.includes('போக்குவரத்து') || lower.includes('পরিবহন')) {
    return CATEGORY_DEFINITIONS.find((c) => c.id === 'transport')?.names[lang] || 'Fuel & Logistics';
  }
  if (lower.includes('मजदूरी') || lower.includes('श्रमिक') || lower.includes('labor') || lower.includes('wage') || lower.includes('कामगार') || lower.includes('కూలీ') || lower.includes('கூலி') || lower.includes('মজুরি')) {
    return CATEGORY_DEFINITIONS.find((c) => c.id === 'labor')?.names[lang] || 'Labor & Wages';
  }
  if (lower.includes('थोक') || lower.includes('wholesale') || lower.includes('stock') || lower.includes('घाऊक') || lower.includes('హోల్‌సేల్') || lower.includes('மொத்த') || lower.includes('পাইকারি')) {
    return CATEGORY_DEFINITIONS.find((c) => c.id === 'wholesale')?.names[lang] || 'Wholesale Stock';
  }
  if (lower.includes('उपकरण') || lower.includes('मरम्मत') || lower.includes('machinery') || lower.includes('repairs') || lower.includes('यंत्र') || lower.includes('యంత్రాలు') || lower.includes('இயந்திரங்கள்') || lower.includes('যন্ত্রপাতি')) {
    return CATEGORY_DEFINITIONS.find((c) => c.id === 'machinery')?.names[lang] || 'Machinery & Repairs';
  }
  if (lower.includes('स्वास्थ्य') || lower.includes('medical') || lower.includes('health') || lower.includes('दवाई')) {
    return CATEGORY_DEFINITIONS.find((c) => c.id === 'health')?.names[lang] || 'Health & Medical';
  }
  if (lower.includes('बिक्री') || lower.includes('sale') || lower.includes('retail') || lower.includes('विक्री')) {
    return CATEGORY_DEFINITIONS.find((c) => c.id === 'sales')?.names[lang] || 'Retail Sales';
  }

  // If already pure single language or slash-split, extract the part corresponding to current language
  if (rawCategory.includes('/')) {
    const parts = rawCategory.split('/').map((s) => s.trim());
    if (lang === 'en' && parts.length > 1) {
      return parts[1];
    }
    return parts[0];
  }

  return rawCategory;
}

// Translations dictionary for transcript & sample voice phrases
const KNOWN_PHRASE_TRANSLATIONS: Record<string, Record<SupportedLanguage, string>> = {
  'आज किराना बिक्री से 1600 रुपये मिले': {
    en: 'Received ₹1600 from grocery sales today',
    hi: 'आज किराना बिक्री से 1600 रुपये मिले',
    mr: 'आज किराणा विक्रीतून 1600 रुपये मिळाले',
    te: 'ఈరోజు కిరాణా అమ్మకాల ద్వారా ₹1600 వచ్చాయి',
    ta: 'இன்று மளிகை விற்பனை மூலம் ₹1600 கிடைத்தது',
    bn: 'আজ মুদি বিক্রি থেকে ১৬০০ টাকা পাওয়া গেছে'
  },
  'दूध डेयरी से 1450 रुपये की आमदनी मिली': {
    en: 'Received ₹1450 income from dairy milk sale',
    hi: 'दूध डेयरी से 1450 रुपये की आमदनी मिली',
    mr: 'दूध डेअरीतून 1450 रुपयांचे उत्पन्न मिळाले',
    te: 'పాల డెయిరీ నుండి ₹1450 ఆదాయం వచ్చింది',
    ta: 'பால் பண்ணையிலிருந்து ₹1450 வருமானம் வந்தது',
    bn: 'দুধ ডেয়ারি থেকে ১৪৫০ টাকা আয় হয়েছে'
  },
  'इफ्को से 420 रुपये की यूरिया खाद ली': {
    en: 'Bought ₹420 urea fertilizer from IFFCO',
    hi: 'इफ्को से 420 रुपये की यूरिया खाद ली',
    mr: 'इफ्कोकडून 420 रुपयांचे युरिया खत घेतले',
    te: 'ఇఫ్కో నుండి ₹420 యూరియా ఎరువులు కొన్నాను',
    ta: 'இப்கோவிலிருந்து ₹420 யூரியா உரம் வாங்கப்பட்டது',
    bn: 'ইফকো থেকে ৪২০ টাকার ইউরিয়া সার কেনা হয়েছে'
  },
  'दुकान से 3200 रुपये का गल्ला बिक्री': {
    en: '₹3200 retail sales collected from shop register',
    hi: 'दुकान से 3200 रुपये का गल्ला बिक्री',
    mr: 'दुकानातील गल्ल्यातून 3200 रुपयांची विक्री',
    te: 'దుకాణం నుండి ₹3200 నగదు అమ్మకాలు జరిగాయి',
    ta: 'கடையிலிருந்து ₹3200 விற்பனை வசூலானது',
    bn: 'দোকান থেকে ৩২০০০ টাকা গাল্লা বিক্রি হয়েছে'
  },
  'बनारसी साड़ी बुनाई की 2800 मजदूरी प्राप्त हुई': {
    en: 'Received ₹2800 wages for Banarasi saree weaving',
    hi: 'बनारसी साड़ी बुनाई की 2800 मजदूरी प्राप्त हुई',
    mr: 'बनारसी साडी विणकामाची 2800 मजुरी मिळाली',
    te: 'బనారసి చీర నేత కూలీ ₹2800 అందింది',
    ta: 'பனாரசி புடவை நெசவு கூலி ₹2800 பெறப்பட்டது',
    bn: 'বেনারসি শাড়ি বোনার মজুরি ২৮০০ টাকা পাওয়া গেছে'
  },
  'ऑटो रिक्शा भाड़ा और माल ढुलाई 850 रुपये': {
    en: 'Auto rickshaw fare & goods transport ₹850',
    hi: 'ऑटो रिक्शा भाड़ा और माल ढुलाई 850 रुपये',
    mr: 'रिक्षा भाडे आणि माल वाहतूक 850 रुपये',
    te: 'ఆటో రవాణా మరియు సరుకు రవాణా ₹850',
    ta: 'ஆட்டோ வாடகை மற்றும் சரக்கு போக்குவரத்து ₹850',
    bn: 'অটো রিকশা ভাড়া ও মালামাল পরিবহন ৮৫০ টাকা'
  },
  'मंडी में 4 बोरी गेहूं बेचकर 7600 रुपये मिले': {
    en: 'Sold 4 bags of wheat at mandi for ₹7600',
    hi: 'मंडी में 4 बोरी गेहूं बेचकर 7600 रुपये मिले',
    mr: 'मंडईत 4 पोती गहू विकून 7600 रुपये मिळाले',
    te: 'మండీలో 4 బస్తాల గోధుమలు అమ్మి ₹7600 పొందాను',
    ta: 'மண்டியில் 4 மூட்டை கோதுமை விற்று ₹7600 கிடைத்தது',
    bn: 'মান্ডিতে ৪ বস্তা গম বিক্রি করে ৭৬০০ টাকা পাওয়া গেছে'
  },
  'आज सुबह दूध डेयरी से 1200 रुपये की कमाई आई': {
    en: '₹1200 earned this morning from dairy milk collection',
    hi: 'आज सुबह दूध डेयरी से 1200 रुपये की कमाई आई',
    mr: 'आज सकाळी दूध डेअरीतून 1200 रुपयांची कमाई झाली',
    te: 'ఈ ఉదయం పాల డెయిరీ నుండి ₹1200 సంపాదన వచ్చింది',
    ta: 'இன்று காலை பால் பண்ணையிலிருந்து ₹1200 வருவாய் வந்தது',
    bn: 'আজ সকালে দুধ ডেয়ারি থেকে ১২০০ টাকা উপার্জন হয়েছে'
  },
  'दुकान के लिए 450 रुपये की यूरिया खाद खरीदी': {
    en: 'Purchased ₹450 urea fertilizer for shop inventory',
    hi: 'दुकान के लिए 450 रुपये की यूरिया खाद खरीदी',
    mr: 'दुकानासाठी 450 रुपयांचे युरिया खत खरेदी केले',
    te: 'దుకాణం కోసం ₹450 యూరియా ఎరువులు కొన్నాను',
    ta: 'கடைக்காக ₹450 யூரியா உரம் வாங்கப்பட்டது',
    bn: 'দোকানের জন্য ৪৫০ টাকার ইউরিয়া সার কেনা হয়েছে'
  },
  'रमेश ने किराना दुकान से 3200 रुपये की बिक्री का सामान लिया': {
    en: 'Ramesh bought ₹3200 grocery goods from store',
    hi: 'रमेश ने किराना दुकान से 3200 रुपये की बिक्री का सामान लिया',
    mr: 'रमेशने किराणा दुकानातून 3200 रुपयांचे सामान खरेदी केले',
    te: 'రమేష్ కిరాణా దుకాణం నుండి ₹3200 సరుకులు తీసుకున్నారు',
    ta: 'ரமேஷ் மளிகைக் கடையிலிருந்து ₹3200 பொருட்கள் வாங்கினார்',
    bn: 'রমেশ মুদি দোকান থেকে ৩২০০ টাকার পণ্য কিনেছেন'
  },
  'कारीगरी बनारसी साड़ी बुनाई के 2500 रुपये मिले': {
    en: 'Received ₹2500 for artisan Banarasi saree work',
    hi: 'कारीगरी बनारसी साड़ी बुनाई के 2500 रुपये मिले',
    mr: 'बनारसी साडी कारागिरीचे 2500 रुपये मिळाले',
    te: 'చేనేత బనారసి చీర పనికి ₹2500 వచ్చాయి',
    ta: 'பனாரசி புடவை கைவினை வேலைக்கு ₹2500 கிடைத்தது',
    bn: 'বেনারসি শাড়ি বুননের কারুকার্যের ২৫০০ টাকা পাওয়া গেছে'
  },
  'मंडीमध्ये कांदा विकून 8400 रुपये जमा झाले': {
    en: 'Deposited ₹8400 after selling onions in mandi',
    hi: 'मंडी में प्याज बेचकर 8400 रुपये जमा हुए',
    mr: 'मंडीमध्ये कांदा विकून 8400 रुपये जमा झाले',
    te: 'మండీలో ఉల్లిపాయలు అమ్మి ₹8400 జమ అయ్యాయి',
    ta: 'மண்டியில் வெங்காயம் விற்று ₹8400 வரவு வைக்கப்பட்டது',
    bn: 'মান্ডিতে পেঁয়াজ বিক্রি করে ৮৪০০ টাকা জমা হয়েছে'
  },
  'ట్రాక్టర్ డీజిల్ కోసం 950 రూపాయలు ఖర్చు అయ్యాయి': {
    en: 'Spent ₹950 on diesel fuel for tractor',
    hi: 'ट्रैक्टर डीजल के लिए 950 रुपये खर्च हुए',
    mr: 'ट्रॅक्टर डिझेलसाठी 950 रुपये खर्च झाले',
    te: 'ట్రాక్టర్ డీజిల్ కోసం 950 రూపాయలు ఖర్చు అయ్యాయి',
    ta: 'டிராக்டர் டீசலுக்காக ₹950 செலவிடப்பட்டது',
    bn: 'ট্রাক্টর ডিজেলের জন্য ৯৫০ টাকা খরচ হয়েছে'
  }
};

export function getLocalizedSourceText(text: string | undefined, lang: SupportedLanguage): string | undefined {
  if (!text) return undefined;

  const trimmed = text.trim();
  if (KNOWN_PHRASE_TRANSLATIONS[trimmed]) {
    return KNOWN_PHRASE_TRANSLATIONS[trimmed][lang] || KNOWN_PHRASE_TRANSLATIONS[trimmed].en;
  }

  // If manual entry label
  if (text.includes('Manual Entry') || text.includes('हस्तलिखित') || text.includes('मॅन्युअल नोंद')) {
    if (lang === 'hi') return 'हस्तलिखित प्रविष्टि';
    if (lang === 'mr') return 'मॅन्युअल नोंद';
    if (lang === 'te') return 'మాన్యువల్ ఎంట్రీ';
    if (lang === 'ta') return 'கைமுறை பதிவு';
    if (lang === 'bn') return 'ম্যানুয়াল এন্ট্রি';
    return 'Manual Entry';
  }

  return text;
}

export function getLocalizedPartyPrefix(notes: string | undefined, lang: SupportedLanguage): string | undefined {
  if (!notes) return undefined;

  const partyPrefixes: Record<SupportedLanguage, string> = {
    en: 'Party / Customer:',
    hi: 'ग्राहक / व्यापारी:',
    mr: 'ग्राहक / व्यापारी:',
    te: 'కస్టమర్ / వ్యాపారి:',
    ta: 'வாடிக்கையாளர் / வர்த்தகர்:',
    bn: 'গ্রাহক / ব্যবসায়ী:'
  };

  let result = notes;

  // Replace any existing customer/party prefix with active language prefix
  result = result.replace(
    /(Party \/ Customer|ग्राहक \/ व्यापारी|Customer \/ Party|ग्राहक \/ व्यापारी का नाम):/gi,
    partyPrefixes[lang]
  );

  // Translate specific party or note terms when in English
  if (lang === 'en') {
    result = result
      .replace(/ग्राहक \/ व्यापारी:\s*बिक्री/g, 'Counter Sales')
      .replace(/Party \/ Customer:\s*बिक्री/g, 'Party / Customer: Counter Sales')
      .replace(/अमूल संकलन केंद्र - 45 लीटर गाय का दूध/g, 'Amul Collection Center - 45L Cow Milk')
      .replace(/IFFCO खाद बोरी 45kg/g, 'IFFCO Fertilizer Bag 45kg')
      .replace(/साप्ताहिक बाजार बिक्री/g, 'Weekly Market Sales')
      .replace(/SHG हथकरघा क्लस्टर अग्रिम/g, 'SHG Handloom Cluster Advance')
      .replace(/मंडी से माल लाने का भाड़ा/g, 'Freight charge from mandi')
      .replace(/APMC खन्ना मंडी तुलाई/g, 'APMC Khanna Mandi Weighment');
  } else if (lang === 'hi') {
    result = result
      .replace(/Party \/ Customer:\s*Counter Sales/g, 'ग्राहक / व्यापारी: गल्ला बिक्री')
      .replace(/Party \/ Customer:\s*बिक्री/g, 'ग्राहक / व्यापारी: गल्ला बिक्री');
  }

  // Payment mode tags
  result = result
    .replace(/(💵 Cash|💵 नकद|💵 रोख|💵 నగదు|💵 ரொக்கம்|💵 নগদ)/g, lang === 'hi' ? '💵 नकद' : lang === 'mr' ? '💵 रोख' : lang === 'te' ? '💵 నగదు' : '💵 Cash')
    .replace(/(📋 Udhaar \/ Credit|📋 उधार|📋 उधारी|📋 అప్పు \/ ఉధార్|📋 கடன்|📋 বাকি \/ ধার)/g, lang === 'hi' ? '📋 उधार' : lang === 'mr' ? '📋 उधारी' : lang === 'te' ? '📋 అప్పు' : '📋 Credit');

  return result;
}

export function getLocalizedDateString(timestamp: number, _lang?: SupportedLanguage): string {
  // Always format date, month, and time in English irrespective of selected UI language
  return new Date(timestamp).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}
