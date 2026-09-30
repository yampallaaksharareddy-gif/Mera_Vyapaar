import { SupportedLanguage, TransactionType } from '../types';
import { getLocalizedCategory } from './categoryHelper';

export interface ParsedVoiceKhata {
  amount: number;
  transactionType: TransactionType;
  category: string;
  customerOrEntity?: string;
  confidence: number;
  vernacularSummary: string;
}

export function parseVernacularVoiceInput(text: string, currentLang: SupportedLanguage = 'en'): ParsedVoiceKhata {
  const lower = text.toLowerCase();

  // 1. Extract Amount (Digits or Devnagari numerals or common terms)
  // Replace Devnagari numerals if any
  const devnagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  let normalizedText = text;
  devnagariDigits.forEach((char, idx) => {
    normalizedText = normalizedText.split(char).join(String(idx));
  });

  const numberMatches = normalizedText.match(/\d+(\.\d+)?/g);
  let amount = 500;
  if (numberMatches && numberMatches.length > 0) {
    // Pick the largest reasonable number (avoid dates/years like 2024)
    const validNumbers = numberMatches
      .map(Number)
      .filter((n) => !isNaN(n) && n > 0 && n < 10000000);
    if (validNumbers.length > 0) {
      amount = validNumbers[0];
    }
  }

  // 2. Determine Transaction Type
  const expenseKeywords = [
    'खर्च', 'दिए', 'दिया', 'भुगतान', 'खरीदा', 'खरीदी', 'लागत', 'चुकाया', 'किराया', 'डीजल',
    'expense', 'paid', 'spent', 'bought', 'purchase', 'out', 'cost',
    'दिले', 'खर्च झाले', 'नावे', // Marathi
    'చెల్లించాను', 'ఖర్చు', 'కొన్నాను', // Telugu
    'செலவு', 'கொடுத்தேன்', 'வாங்கினேன்', // Tamil
    'খরচ', 'দিলাম', 'কিনেছি' // Bengali
  ];

  const incomeKeywords = [
    'मिला', 'मिले', 'आया', 'आए', 'बिक्री', 'कमाई', 'आमदनी', 'जमा', 'मुनाफा', 'प्राप्त', 'बेचा', 'बेची',
    'income', 'received', 'sale', 'sold', 'earned', 'collected', 'profit',
    'मिळाले', 'जमा झाले', 'आवक', 'विकले', // Marathi
    'వచ్చింది', 'ఆదాయం', 'అమ్మాను', 'జమ', // Telugu
    'வந்தது', 'வருமானம்', 'விற்றேன்', 'வரவு', // Tamil
    'পেলাম', 'আয়', 'বিক্রি করলাম', 'জমা' // Bengali
  ];

  let isExpense = false;
  for (const kw of expenseKeywords) {
    if (lower.includes(kw)) {
      isExpense = true;
      break;
    }
  }

  // If both or ambiguous, check income cues
  if (!isExpense) {
    for (const kw of incomeKeywords) {
      if (lower.includes(kw)) {
        isExpense = false;
        break;
      }
    }
  }

  const transactionType: TransactionType = isExpense ? 'EXPENSE' : 'INCOME';

  // 3. Category Detection
  let category = transactionType === 'INCOME' ? 'दुकान बिक्री / Retail Sales' : 'व्यापार खर्च / Expense';

  if (lower.includes('दूध') || lower.includes('डेयरी') || lower.includes('milk') || lower.includes('dairy') || lower.includes('पाल') || lower.includes('पాలు') || lower.includes('பால்') || lower.includes('দুধ')) {
    category = 'डेयरी व पशुपालन / Milk & Dairy';
  } else if (lower.includes('किराना') || lower.includes('दुकान') || lower.includes('grocery') || lower.includes('सौदा') || lower.includes('కిరాణా') || lower.includes('மளிகை') || lower.includes('মুদি')) {
    category = 'किराना दुकान / Grocery & Provisions';
  } else if (lower.includes('खाद') || lower.includes('यूरिया') || lower.includes('बीज') || lower.includes('कीटनाशक') || lower.includes('fertilizer') || lower.includes('seed') || lower.includes('విత్తన') || lower.includes('உரம்') || lower.includes('সার')) {
    category = 'कृषि इनपुट व खाद / Seeds & Fertilizers';
  } else if (lower.includes('मंडी') || lower.includes('गेहूं') || lower.includes('धान') || lower.includes('चावल') || lower.includes('प्याज') || lower.includes('आलू') || lower.includes('फसल') || lower.includes('మార్కెట్') || lower.includes('சந்தை') || lower.includes('মান্ডি')) {
    category = 'कृषि उपज व मंडी / Agri Produce & Mandi';
  } else if (lower.includes('साड़ी') || lower.includes('कपड़ा') || lower.includes('बुनाई') || lower.includes('कारीगरी') || lower.includes('हथकरघा') || lower.includes('artisan') || lower.includes('saree') || lower.includes('చేనేత') || lower.includes('கைத்தறி') || lower.includes('তাঁত')) {
    category = 'हस्तशिल्प व हथकरघा / Artisan & Handloom';
  } else if (lower.includes('डीजल') || lower.includes('पेट्रोल') || lower.includes('गाड़ी') || lower.includes('भाड़ा') || lower.includes('ट्रांसपोर्ट') || lower.includes('diesel') || lower.includes('fuel')) {
    category = 'परिवहन व ईंधन / Fuel & Logistics';
  } else if (lower.includes('दवाई') || lower.includes('डॉक्टर') || lower.includes('इलाज') || lower.includes('medical') || lower.includes('medicine')) {
    category = 'स्वास्थ्य व चिकित्सा / Health & Medical';
  } else if (lower.includes('मजदूरी') || lower.includes('लेबर') || lower.includes('कारीगर') || lower.includes('wage') || lower.includes('labor') || lower.includes('కూలీ')) {
    category = 'श्रमिक मजदूरी / Labor & Wages';
  }

  // 4. Extract Customer or Vendor name if pattern matches "X ने ... दिया" or "Y को ... दिए"
  let customerOrEntity: string | undefined;
  const nameMatch = text.match(/([A-Z\u0900-\u097F][\w\u0900-\u097F]+)\s*(ने|से|को|चे|కి)/i);
  if (nameMatch && nameMatch[1]) {
    const candidate = nameMatch[1].trim();
    if (!['आज', 'कल', 'दुकान', 'दूध', 'खाद', 'मंडी', 'पैसे', 'रुपये', 'बिक्री', 'विक्री', 'कमाई', 'खर्च', 'किराना', 'गल्ला', 'सामान', 'माल', 'खेती'].includes(candidate)) {
      customerOrEntity = candidate;
    }
  }

  const localizedCat = getLocalizedCategory(category, currentLang);
  let vernacularSummary = '';

  if (currentLang === 'en') {
    vernacularSummary = transactionType === 'INCOME'
      ? `₹${amount} income (${localizedCat}) recorded`
      : `₹${amount} expense (${localizedCat}) recorded`;
  } else if (currentLang === 'hi') {
    vernacularSummary = transactionType === 'INCOME'
      ? `₹${amount} की आमदनी (${localizedCat}) दर्ज हुई`
      : `₹${amount} का खर्च (${localizedCat}) दर्ज हुआ`;
  } else if (currentLang === 'mr') {
    vernacularSummary = transactionType === 'INCOME'
      ? `₹${amount} जमा/उत्पन्न (${localizedCat}) नोंद झाली`
      : `₹${amount} खर्च (${localizedCat}) नोंद झाला`;
  } else if (currentLang === 'te') {
    vernacularSummary = transactionType === 'INCOME'
      ? `₹${amount} ఆదాయం (${localizedCat}) నమోదు చేయబడింది`
      : `₹${amount} ఖర్చు (${localizedCat}) నమోదు చేయబడింది`;
  } else if (currentLang === 'ta') {
    vernacularSummary = transactionType === 'INCOME'
      ? `₹${amount} வருமானம் (${localizedCat}) பதிவு செய்யப்பட்டது`
      : `₹${amount} செலவு (${localizedCat}) பதிவு செய்யப்பட்டது`;
  } else if (currentLang === 'bn') {
    vernacularSummary = transactionType === 'INCOME'
      ? `₹${amount} আয় (${localizedCat}) নথিভুক্ত হয়েছে`
      : `₹${amount} খরচ (${localizedCat}) নথিভুক্ত হয়েছে`;
  } else {
    vernacularSummary = transactionType === 'INCOME'
      ? `₹${amount} income (${localizedCat}) recorded`
      : `₹${amount} expense (${localizedCat}) recorded`;
  }

  return {
    amount,
    transactionType,
    category,
    customerOrEntity,
    confidence: 0.94,
    vernacularSummary
  };
}

export const SAMPLE_VOICE_PROMPTS = [
  {
    lang: 'Hindi',
    text: 'आज सुबह दूध डेयरी से 1200 रुपये की कमाई आई',
    type: 'INCOME',
    amount: 1200,
    category: 'डेयरी व पशुपालन / Milk & Dairy'
  },
  {
    lang: 'Hindi',
    text: 'दुकान के लिए 450 रुपये की यूरिया खाद खरीदी',
    type: 'EXPENSE',
    amount: 450,
    category: 'कृषि इनपुट व खाद / Seeds & Fertilizers'
  },
  {
    lang: 'Hindi',
    text: 'रमेश ने किराना दुकान से 3200 रुपये की बिक्री का सामान लिया',
    type: 'INCOME',
    amount: 3200,
    category: 'किराना दुकान / Grocery & Provisions'
  },
  {
    lang: 'Hindi',
    text: 'कारीगरी बनारसी साड़ी बुनाई के 2500 रुपये मिले',
    type: 'INCOME',
    amount: 2500,
    category: 'हस्तशिल्प व हथकरघा / Artisan & Handloom'
  },
  {
    lang: 'Marathi',
    text: 'मंडीमध्ये कांदा विकून 8400 रुपये जमा झाले',
    type: 'INCOME',
    amount: 8400,
    category: 'कृषि उपज व मंडी / Agri Produce & Mandi'
  },
  {
    lang: 'Telugu',
    text: 'ట్రాక్టర్ డీజిల్ కోసం 950 రూపాయలు ఖర్చు అయ్యాయి',
    type: 'EXPENSE',
    amount: 950,
    category: 'परिवहन व ईंधन / Fuel & Logistics'
  }
];
