import { GovernmentScheme, LedgerEntry, MandiItem } from '../types';

export const INITIAL_LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: 'entry-1',
    amount: 1450,
    transactionType: 'INCOME',
    category: 'डेयरी व पशुपालन / Milk & Dairy',
    timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    isSynced: true,
    sourceText: 'दूध डेयरी से 1450 रुपये की आमदनी मिली',
    notes: 'अमूल संकलन केंद्र - 45 लीटर गाय का दूध'
  },
  {
    id: 'entry-2',
    amount: 420,
    transactionType: 'EXPENSE',
    category: 'कृषि इनपुट व खाद / Seeds & Fertilizers',
    timestamp: Date.now() - 1000 * 60 * 60 * 7, // 7 hours ago
    isSynced: true,
    sourceText: 'इफ्को से 420 रुपये की यूरिया खाद ली',
    notes: 'IFFCO खाद बोरी 45kg'
  },
  {
    id: 'entry-3',
    amount: 3200,
    transactionType: 'INCOME',
    category: 'किराना दुकान / Grocery & Provisions',
    timestamp: Date.now() - 1000 * 60 * 60 * 26, // yesterday
    isSynced: true,
    sourceText: 'दुकान से 3200 रुपये का गल्ला बिक्री',
    notes: 'साप्ताहिक बाजार बिक्री'
  },
  {
    id: 'entry-4',
    amount: 2800,
    transactionType: 'INCOME',
    category: 'हस्तशिल्प व हथकरघा / Artisan & Handloom',
    timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
    isSynced: false, // stored in local Room DB only
    sourceText: 'बनारसी साड़ी बुनाई की 2800 मजदूरी प्राप्त हुई',
    notes: 'SHG हथकरघा क्लस्टर अग्रिम'
  },
  {
    id: 'entry-5',
    amount: 850,
    transactionType: 'EXPENSE',
    category: 'परिवहन व ईंधन / Fuel & Logistics',
    timestamp: Date.now() - 1000 * 60 * 60 * 68,
    isSynced: false,
    sourceText: 'ऑटो रिक्शा भाड़ा और माल ढुलाई 850 रुपये',
    notes: 'मंडी से माल लाने का भाड़ा'
  },
  {
    id: 'entry-6',
    amount: 7600,
    transactionType: 'INCOME',
    category: 'कृषि उपज व मंडी / Agri Produce & Mandi',
    timestamp: Date.now() - 1000 * 60 * 60 * 96,
    isSynced: true,
    sourceText: 'मंडी में 4 बोरी गेहूं बेचकर 7600 रुपये मिले',
    notes: 'APMC खन्ना मंडी तुलाई'
  }
];

export const MANDI_MARKET_DATA: MandiItem[] = [
  {
    id: 'mandi-1',
    commodity: 'Wheat (Sharbati / Lokwan)',
    commodityHi: 'गेहूं (शरबती / लोकवन)',
    commodityNames: {
      en: 'Wheat (Sharbati / Lokwan)',
      hi: 'गेहूं (शरबती / लोकवन)',
      mr: 'गहू (शरबती / लोकवन)',
      te: 'గోధుమలు (శర్బతీ / లోక్వాన్)',
      ta: 'கோதுமை (சர்பதி)',
      bn: 'গম (শরবতী / লোকওয়ান)'
    },
    market: 'Khanna Mandi',
    state: 'Punjab',
    modalPrice: 2475,
    minPrice: 2350,
    maxPrice: 2620,
    changePercent: 2.4,
    trend: 'UP',
    advisoryNote: 'Prices rising due to festive procurement. Holding grain for 10 days recommended for ₹120/Q higher realization.',
    advisoryNoteHi: 'त्योहारी मांग के कारण कीमतें बढ़ रही हैं। 10 दिन रुककर बेचने पर ₹120/क्विंटल अधिक मिल सकता है।',
    advisoryNotes: {
      en: 'Prices rising due to festive demand. Holding stock for 10 days can fetch ₹120/quintal more.',
      hi: 'त्योहारी मांग के कारण कीमतें बढ़ रही हैं। 10 दिन रुककर बेचने पर ₹120/क्विंटल अधिक मिल सकता है।',
      mr: 'सणासुदीच्या मागणीमुळे भाव वाढत आहेत. १० दिवस थांबून विकल्यास प्रति क्विंटल ₹१२० अधिक मिळू शकतात.',
      te: 'పండుగ డిమాండ్ కారణంగా ధరలు పెరుగుతున్నాయి. 10 రోజులు వేచి ఉండి విక్రయిస్తే క్వింటాల్‌కు ₹120 అధికంగా లభించవచ్చు.',
      ta: 'பண்டிகை கால தேவையின் காரணமாக விலை உயர்கிறது. 10 நாட்கள் வைத்திருந்து விற்றால் குவிண்டாலுக்கு ₹120 வரை கூடுதலாக கிடைக்கும்.',
      bn: 'উৎসবের চাহিদার কারণে দাম বাড়ছে। ১০ দিন মজুত রেখে বিক্রি করলে কুইন্টাল প্রতি ₹১২০ বেশি পাওয়া যেতে পারে।'
    },
    arrivalVolume: 'High (4,800 Bags/Day)',
    arrivalVolumes: {
      en: 'High (4,800 Bags/Day)',
      hi: 'उच्च (4,800 बोरी/दिन)',
      mr: 'जास्त (४,८०० गोणी/दिवस)',
      te: 'ఎక్కువ (4,800 బస్తాలు/రోజు)',
      ta: 'அதிகம் (4,800 பைகள்/நாள்)',
      bn: 'উচ্চ (৪,৮০০ ব্যাগ/দিন)'
    },
    buyerDemand: 'Very Strong (Flour Millers)',
    buyerDemands: {
      en: 'Very Strong (Flour Millers)',
      hi: 'अत्यधिक मजबूत (आटा मिलें सक्रिय)',
      mr: 'अत्यंत मजबूत (पीठ गिरण्या सक्रिय)',
      te: 'చాలా బలంగా ఉంది (పిండి మిల్లులు)',
      ta: 'மிகவும் வலுவானது (மாவு ஆலைகள்)',
      bn: 'খুব শক্তিশালী (ময়দা মিল সক্রিয়)'
    },
    recommendedStrategy: 'Hold 3-5 days for price bounce',
    recommendedStrategies: {
      en: 'Hold 3-5 days for price bounce',
      hi: '3-5 दिन माल रोककर अधिक दाम पर बेचें',
      mr: '३-५ दिवस माल रोखून चांगल्या भावात विका',
      te: 'ధర పెరిగే వరకు 3-5 రోజులు వేచి ఉండండి',
      ta: 'விலை உயர 3-5 நாட்கள் காத்திருந்து விற்கவும்',
      bn: 'দর বৃদ্ধির জন্য ৩-৫ দিন ধরে রাখুন'
    }
  },
  {
    id: 'mandi-2',
    commodity: 'Onion (Red Nashik)',
    commodityHi: 'लाल प्याज (नासिक)',
    commodityNames: {
      en: 'Onion (Red Nashik)',
      hi: 'लाल प्याज (नासिक)',
      mr: 'लाल कांदा (नाशिक)',
      te: 'ఎర్ర ఉల్లిపాయ (నాసిక్)',
      ta: 'சிவப்பு வெங்காயம் (நாசிக்)',
      bn: 'লাল পেঁয়াজ (নাসিক)'
    },
    market: 'Lasalgaon APMC',
    state: 'Maharashtra',
    modalPrice: 2150,
    minPrice: 1800,
    maxPrice: 2480,
    changePercent: -1.8,
    trend: 'DOWN',
    advisoryNote: 'Fresh rabi arrivals increasing. Sell high-moisture stock immediately to prevent rotting.',
    advisoryNoteHi: 'मंडी में नई आवक बढ़ रही है। गीला प्याज तुरंत बेचें, सुखाया हुआ ग्रेड-A प्याज रोक सकते हैं।',
    advisoryNotes: {
      en: 'Fresh market arrivals increasing. Sell wet stock immediately; hold dried Grade-A onion.',
      hi: 'मंडी में नई आवक बढ़ रही है। गीला प्याज तुरंत बेचें, सुखाया हुआ ग्रेड-A प्याज रोक सकते हैं।',
      mr: 'मंडईत नवीन आवक वाढत आहे. ओला कांदा लगेच विका, वाळवलेला ग्रेड-A कांदा रोखून ठेवू शकता.',
      te: 'మార్కెట్లో కొత్త రాబడులు పెరుగుతున్నాయి. తడి ఉల్లిపాయలను వెంటనే విక్రయించండి, ఆరిన గ్రేడ్-A ఉల్లిపాయలను నిల్వ ఉంచవచ్చు.',
      ta: 'சந்தையில் புதிய வரத்து அதிகரிக்கிறது. ஈரப்பதம் உள்ளதை உடனே விற்கவும், உலர்ந்த தரம்-A வெங்காயத்தை இருப்பு வைக்கலாம்.',
      bn: 'মান্ডিতে নতুন সরবরাহ বাড়ছে। ভেজা পেঁয়াজ দ্রুত বিক্রি করুন, শুকনো গ্রেড-এ পেঁয়াজ ধরে রাখতে পারেন।'
    },
    arrivalVolume: 'Heavy (18,500 Quintals/Day)',
    arrivalVolumes: {
      en: 'Heavy (18,500 Quintals/Day)',
      hi: 'भारी आवक (18,500 क्विंटल/दिन)',
      mr: 'मोठी आवक (१८,५०० क्विंटल/दिवस)',
      te: 'భారీగా ఉంది (18,500 క్వింటాళ్లు/రోజు)',
      ta: 'அதிக வரத்து (18,500 குவிண்டால்/நாள்)',
      bn: 'ব্যাপক আমদানি (১৮,৫০০ কুইন্টাল/দিন)'
    },
    buyerDemand: 'Moderate (Export Window Awaited)',
    buyerDemands: {
      en: 'Moderate (Export Window Awaited)',
      hi: 'मध्यम (निर्यात नीति की प्रतीक्षा)',
      mr: 'मध्यम (निर्यात धोरणाची प्रतीक्षा)',
      te: 'మధ్యస్థం (ఎగుమతి కోసం వేచి చూస్తున్నారు)',
      ta: 'மிதமானது (ஏற்றுமதி கொள்கை எதிர்பார்ப்பு)',
      bn: 'মাঝারি (রপ্তানি উইন্ডোর অপেক্ষা)'
    },
    recommendedStrategy: 'Store in ventilated godown for 10-14 days',
    recommendedStrategies: {
      en: 'Store in ventilated godown for 10-14 days',
      hi: 'हवादार गोदाम में 10-14 दिन भंडारण करें',
      mr: 'हवेशीर चाळीत १०-१४ दिवस साठवून ठेवा',
      te: 'గాలి తగిలే గిడ్డంగిలో 10-14 రోజులు నిల్వ చేయండి',
      ta: 'காற்றோட்டமான கிடங்கில் 10-14 நாட்கள் சேமிக்கவும்',
      bn: '১০-১৪ দিন বায়ুচলাচলযুক্ত গুদামে মজুত রাখুন'
    }
  },
  {
    id: 'mandi-3',
    commodity: 'Soyabean (Yellow)',
    commodityHi: 'सोयाबीन (पीला)',
    commodityNames: {
      en: 'Soyabean (Yellow)',
      hi: 'सोयाबीन (पीला)',
      mr: 'सोयाबीन (पिवळा)',
      te: 'సోయాబీన్ (పసుపు)',
      ta: 'சோயாபீன் (மஞ்சள்)',
      bn: 'সয়াবিন (হলুদ)'
    },
    market: 'Indore APMC',
    state: 'Madhya Pradesh',
    modalPrice: 4720,
    minPrice: 4400,
    maxPrice: 4950,
    changePercent: 3.1,
    trend: 'UP',
    advisoryNote: 'Oil mill buying aggressive. Strong demand support at ₹4,650.',
    advisoryNoteHi: 'ऑयल मिलों की जोरदार खरीद जारी है। 4650 रुपये पर मजबूत सहारा है।',
    advisoryNotes: {
      en: 'Aggressive buying by oil crushing mills. Strong price support at ₹4,650.',
      hi: 'ऑयल मिलों की जोरदार खरीद जारी है। 4650 रुपये पर मजबूत सहारा है।',
      mr: 'तेल गिरण्यांची जोरदार खरेदी सुरू आहे. ₹४,६५० वर चांगला आधार आहे.',
      te: 'ఆయిల్ మిల్లుల నుండి భారీ కొనుగోళ్లు జరుగుతున్నాయి. ₹4,650 వద్ద బలమైన డిమాండ్ మద్దతు ఉంది.',
      ta: 'எண்ணெய் ஆலைகளின் கொள்முதல் தீவிரம். ₹4,650 விலையில் வலுவான ஆதரவு உள்ளது.',
      bn: 'তেল কলগুলোর ব্যাপক ক্রয় চলছে। ৪,৬৫০ টাকায় শক্তিশালী সমর্থন রয়েছে।'
    },
    arrivalVolume: 'Heavy (6,400 Bags/Day)',
    arrivalVolumes: {
      en: 'Heavy (6,400 Bags/Day)',
      hi: 'भारी आवक (6,400 बोरी/दिन)',
      mr: 'मोठी आवक (६,४०० गोणी/दिवस)',
      te: 'భారీగా ఉంది (6,400 బస్తాలు/రోజు)',
      ta: 'அதிக வரத்து (6,400 பைகள்/நாள்)',
      bn: 'ব্যাপক আমদানি (৬,৪০০ ব্যাগ/দিন)'
    },
    buyerDemand: 'High (Solvent Plants Active)',
    buyerDemands: {
      en: 'High (Solvent Plants Active)',
      hi: 'तेज (सॉल्वेंट प्लांट सक्रिय)',
      mr: 'चांगली मागणी (सॉल्व्हंट प्लांट्स सक्रिय)',
      te: 'ఎక్కువగా ఉంది (సాల్వెంట్ ప్లాంట్లు)',
      ta: 'அதிகம் (ஆலைகள் சுறுசுறுப்பு)',
      bn: 'উচ্চ (সলভেন্ট প্ল্যান্ট সক্রিয়)'
    },
    recommendedStrategy: 'Dry moisture and sell next week',
    recommendedStrategies: {
      en: 'Dry moisture and sell next week',
      hi: 'नमी सुखाकर अगले हफ्ते मंडी में लाएं',
      mr: 'ओलावा वाळवून पुढील आठवड्यात विका',
      te: 'తేమ ఆరబెట్టి వచ్చే వారం విక్రయించండి',
      ta: 'ஈரப்பதத்தை உலர்த்தி அடுத்த வாரம் விற்கவும்',
      bn: 'আর্দ্রতা শুকিয়ে আগামী সপ্তাহে বিক্রি করুন'
    }
  },
  {
    id: 'mandi-4',
    commodity: 'Cotton (Medium Staple)',
    commodityHi: 'कपास / रुई',
    commodityNames: {
      en: 'Cotton (Medium Staple)',
      hi: 'कपास / रुई',
      mr: 'कापूस (मध्यम धागा)',
      te: 'పత్తి (మీడియం స్టేపుల్)',
      ta: 'பருத்தி (நடுத்தர இழை)',
      bn: 'তুলা (মাঝারি আঁশ)'
    },
    market: 'Surat / Rajkot APMC',
    state: 'Gujarat',
    modalPrice: 7180,
    minPrice: 6800,
    maxPrice: 7450,
    changePercent: 0.5,
    trend: 'STABLE',
    advisoryNote: 'CCI procurement centers active. Keep moisture below 8% for MSP bonus.',
    advisoryNoteHi: 'CCI सरकारी खरीद केंद्र सक्रिय हैं। MSP बोनस पाने के लिए नमी 8% से कम रखें।',
    advisoryNotes: {
      en: 'CCI government procurement centers active. Keep moisture below 8% to receive full MSP bonus.',
      hi: 'CCI सरकारी खरीद केंद्र सक्रिय हैं। MSP बोनस पाने के लिए नमी 8% से कम रखें।',
      mr: 'CCI शासकीय खरेदी केंद्र सुरू आहेत. हमीभाव बोनस मिळवण्यासाठी आर्द्रता ८% पेक्षा कमी ठेवा.',
      te: 'CCI ప్రభుత్వ కొనుగోలు కేంద్రాలు క్రియాశీలంగా ఉన్నాయి. పూర్తి మద్దతు ధర కోసం తేమను 8% లోపు ఉంచండి.',
      ta: 'CCI அரசு கொள்முதல் நிலையங்கள் செயல்படுகின்றன. முழு குறைந்தபட்ச ஆதரவு விலைக்கு ஈரப்பதத்தை 8% க்குள் பராமரிக்கவும்.',
      bn: 'সিসিআই সরকারি ক্রয় কেন্দ্র সক্রিয়। সম্পূর্ণ এমএসপি বোনাস পেতে আর্দ্রতা ৮% এর নিচে রাখুন।'
    },
    arrivalVolume: 'Normal (1,800 Bales/Day)',
    arrivalVolumes: {
      en: 'Normal (1,800 Bales/Day)',
      hi: 'सामान्य (1,800 गांठ/दिन)',
      mr: 'मध्यम (१,८०० गाठी/दिवस)',
      te: 'సాధారణం (1,800 బేళ్లు/రోజు)',
      ta: 'சாதாரணமானது (1,800 கட்டுகள்/நாள்)',
      bn: 'স্বাভাবিক (১,৮০০ বেল/দিন)'
    },
    buyerDemand: 'Active (CCI & Private Ginners)',
    buyerDemands: {
      en: 'Active (CCI & Private Ginners)',
      hi: 'सक्रिय (सीसीआई व निजी जिनर्स)',
      mr: 'सक्रिय (सीसीआय आणि खाजगी जिनर्स)',
      te: 'చురుగ్గా ఉంది (సీసీఐ & ప్రైవేట్ జిన్నర్లు)',
      ta: 'செயலில் உள்ளது (CCI & தனியார் ஆலைகள்)',
      bn: 'সক্রিয় (সিসিআই ও ব্যক্তিমালিকানাধীন মিল)'
    },
    recommendedStrategy: 'Sell at MSP procurement center',
    recommendedStrategies: {
      en: 'Sell at MSP procurement center',
      hi: 'नजदीकी एमएसपी खरीद केंद्र पर बेचें',
      mr: 'जवळच्या हमीभाव खरेदी केंद्रावर विक्री करा',
      te: 'మద్దతు ధర కొనుగోలు కేంద్రంలో విక్రయించండి',
      ta: 'குறைந்தபட்ச ஆதரவு விலை மையத்தில் விற்கவும்',
      bn: 'এমএসপি সরকারি কেন্দ্রে বিক্রি করুন'
    }
  },
  {
    id: 'mandi-5',
    commodity: 'Mustard / Sarson',
    commodityHi: 'सरसों / राई',
    commodityNames: {
      en: 'Mustard / Sarson',
      hi: 'सरसों / राई',
      mr: 'मोहरी / सरसो',
      te: 'ఆవాలు / సరసోం',
      ta: 'கடுகு',
      bn: 'সরিষা / রাই'
    },
    market: 'Alwar APMC',
    state: 'Rajasthan',
    modalPrice: 5350,
    minPrice: 5100,
    maxPrice: 5600,
    changePercent: 1.6,
    trend: 'UP',
    advisoryNote: 'Crushers paying premium for oil content above 41%.',
    advisoryNoteHi: '41% से अधिक तेल वाली सरसों पर तेल मिलें 150 रुपये का प्रीमियम दे रही हैं।',
    advisoryNotes: {
      en: 'Oil mills offering ₹150 premium on high oil content (>41%) mustard.',
      hi: '41% से अधिक तेल वाली सरसों पर तेल मिलें 150 रुपये का प्रीमियम दे रही हैं।',
      mr: '४१% पेक्षा जास्त तेल असलेल्या मोहरीला तेल गिरण्या ₹१५० चा जादा दर देत आहेत.',
      te: '41% కంటే ఎక్కువ నూనె శాతం ఉన్న ఆవాలకు మిల్లులు ₹150 ప్రీమియం ధర చెల్లిస్తున్నాయి.',
      ta: '41% க்கும் அதிகமான எண்ணெய் சத்து கொண்ட கடுகிற்கு ஆலைகள் ₹150 கூடுதல் விலை வழங்குகின்றன.',
      bn: '৪১% এর বেশি তেলযুক্ত সরিষার জন্য তেল কলগুলো ১৫০ টাকা অতিরিক্ত দিচ্ছে।'
    },
    arrivalVolume: 'Moderate (2,900 Bags/Day)',
    arrivalVolumes: {
      en: 'Moderate (2,900 Bags/Day)',
      hi: 'मध्यम (2,900 बोरी/दिन)',
      mr: 'मध्यम (२,९०० गोणी/दिवस)',
      te: 'మధ్యస్థం (2,900 బస్తాలు/రోజు)',
      ta: 'மிதமானது (2,900 பைகள்/நாள்)',
      bn: 'মাঝারি (২,৯০০ ব্যাগ/দিন)'
    },
    buyerDemand: 'Strong (Crushers Active)',
    buyerDemands: {
      en: 'Strong (Crushers Active)',
      hi: 'मजबूत (तेल मिलें सक्रिय)',
      mr: 'चांगली (तेल गिरण्या सक्रिय)',
      te: 'బలంగా ఉంది (ఆయిల్ మిల్లులు)',
      ta: 'வலுவானது (எண்ணெய் ஆலைகள்)',
      bn: 'দৃঢ় (তেল মিল সক্রিয়)'
    },
    recommendedStrategy: 'Hold stock for 5-7 days',
    recommendedStrategies: {
      en: 'Hold stock for 5-7 days',
      hi: '5-7 दिन माल रोककर रखें',
      mr: '५-७ दिवस माल रोखून ठेवा',
      te: '5-7 రోజులు వేచి ఉండి విక్రయించండి',
      ta: '5-7 நாட்கள் நிறுத்தி விற்கவும்',
      bn: '৫-৭ দিন মজুত রাখুন'
    }
  },
  {
    id: 'mandi-ginger',
    commodity: 'Ginger (Fresh Green / Adrak)',
    commodityHi: 'अदरक (ताज़ा हरी अदरक)',
    commodityNames: {
      en: 'Ginger (Fresh Green / Adrak)',
      hi: 'अदरक (ताज़ा हरी अदरक)',
      mr: 'आले (ताजे आले)',
      te: 'అల్లం (తాజా పచ్చి అల్లం)',
      ta: 'இஞ்சி (பச்சை இஞ்சி)',
      bn: 'আদা (কাঁচা আদা)'
    },
    market: 'Wayanad / Azadpur APMC',
    state: 'Kerala / Delhi',
    modalPrice: 6850,
    minPrice: 6200,
    maxPrice: 7400,
    changePercent: 4.8,
    trend: 'UP',
    advisoryNote: 'Cold weather demand strong across north Indian terminal markets. Grade clean rhizomes for ₹400/Q premium.',
    advisoryNoteHi: 'उत्तरी मंडियों में सर्दियों की मांग मजबूत। अच्छी तरह धोकर व छांटकर बेचने पर ₹400/क्विंटल अधिक दाम मिल रहे हैं।',
    advisoryNotes: {
      en: 'High consumption demand across metropolitan markets. Grade and sell within 5 days for peak realization.',
      hi: 'उत्तरी मंडियों में सर्दियों की मांग मजबूत। अच्छी तरह धोकर व छांटकर बेचने पर ₹400/क्विंटल अधिक दाम मिल रहे हैं।',
      mr: 'थंडीच्या दिवसांत आल्याला मोठी मागणी. स्वच्छ करून प्रतवारी केल्यास ₹४०० प्रति क्विंटल जादा भाव मिळतो.',
      te: 'మెట్రో నగరాల్లో అల్లానికి భారీ డిమాండ్ ఉంది. గ్రేడింగ్ చేసి 5 రోజుల్లో విక్రయిస్తే గరిష్ట లాభం లభిస్తుంది.',
      ta: 'குளிர் காலத்தில் இஞ்சிக்கு அதிக தேவை உள்ளது. தரம் பிரித்து விற்றால் குவிண்டாலுக்கு ₹400 வரை கூடுதல் லாபம் கிடைக்கும்.',
      bn: 'শীতের চাহিদায় আদার দাম চাঙ্গা। পরিষ্কার করে গ্রেডিং করলে কুইন্টাল প্রতি ৪০০ টাকা বেশি লাভ পাবেন।'
    },
    arrivalVolume: 'Moderate (1,450 Quintals/Day)',
    arrivalVolumes: {
      en: 'Moderate (1,450 Quintals/Day)',
      hi: 'मध्यम (1,450 क्विंटल/दिन)',
      mr: 'मध्यम (१,४५० क्विंटल/दिवस)',
      te: 'మధ్యస్థం (1,450 క్వింటాళ్లు/రోజు)',
      ta: 'மிதமானது (1,450 குவிண்டால்/நாள்)',
      bn: 'মাঝারি (১,৪৫০ কুইন্টাল/দিন)'
    },
    buyerDemand: 'Very Strong (Spice Traders & Retail)',
    buyerDemands: {
      en: 'Very Strong (Spice Traders & Retail)',
      hi: 'अत्यधिक मजबूत (मसाला व्यापारी व रिटेल)',
      mr: 'अत्यंत मजबूत (मसाले व्यापारी व किरकोळ)',
      te: 'చాలా బలంగా ఉంది (మసాలా వ్యాపారులు)',
      ta: 'மிகவும் வலுவானது (மசாலா வியாபாரிகள்)',
      bn: 'খুব শক্তিশালী (মশলা ব্যবসায়ী ও পাইকারি)'
    },
    recommendedStrategy: 'Wash, grade rhizomes and sell within 3-5 days',
    recommendedStrategies: {
      en: 'Wash, grade rhizomes and sell within 3-5 days',
      hi: 'अदरक धोकर, छांटकर 3-5 दिन में मंडी में बेचें',
      mr: 'आले स्वच्छ धुवून, प्रतवारी करून ३-५ दिवसांत विका',
      te: 'శుభ్రం చేసి గ్రేడింగ్ చేసి 3-5 రోజుల్లో అమ్మండి',
      ta: 'கழுவி தரம் பிரித்து 3-5 நாட்களில் விற்கவும்',
      bn: 'পরিষ্কার করে ৩-৫ দিনের মধ্যে বাজারে বিক্রি করুন'
    }
  },
  {
    id: 'mandi-garlic',
    commodity: 'Garlic (Desi / Ooty Special)',
    commodityHi: 'लहसुन (देसी / ऊटी स्पेशल)',
    commodityNames: {
      en: 'Garlic (Desi / Ooty Special)',
      hi: 'लहसुन (देसी / ऊटी स्पेशल)',
      mr: 'लसूण (देशी / उटी)',
      te: 'వెల్లుల్లి (నాటు / ఊటీ)',
      ta: 'பூண்டு (ஊட்டி சிறப்பு)',
      bn: 'রসুন (দেশি / উটি)'
    },
    market: 'Mandsaur / Kota APMC',
    state: 'Madhya Pradesh / Rajasthan',
    modalPrice: 12400,
    minPrice: 10800,
    maxPrice: 14200,
    changePercent: 5.2,
    trend: 'UP',
    advisoryNote: 'Export orders and spice processor demand driving strong upside. Sun dry to 8% moisture before dispatch.',
    advisoryNoteHi: 'निर्यात मांग व मसाला कंपनियों की खरीद से लहसुन में जोरदार उछाल। धूप में सुखाकर ग्रेड-A माल ₹14,000+ पर बेचें।',
    advisoryNotes: {
      en: 'Spice processors and export demand active. Sun-dry stock to preserve bulb firmness for top price.',
      hi: 'निर्यात मांग व मसाला कंपनियों की खरीद से लहसुन में जोरदार उछाल। धूप में सुखाकर ग्रेड-A माल ₹14,000+ पर बेचें।',
      mr: 'मसाला कंपन्यांकडून मोठी खरेदी. लसूण उन्हात सुकवून प्रतवारी केल्यास ₹१४,०००+ भाव मिळतो.',
      te: 'ఎగుమతి ఆర్డర్లు మరియు మసాలా ప్రాసెసింగ్ కంపెనీల నుండి భారీ డిమాండ్. ఆరబెట్టి అమ్మితే గరిష్ట ధర లభిస్తుంది.',
      ta: 'ஏற்றுமதி தேவையும் மசாலா ஆலைகளின் கொள்முதலும் அதிகரித்துள்ளது. உலர்த்தி விற்றால் அதிக விலை கிடைக்கும்.',
      bn: 'রপ্তানি ও প্রক্রিয়াকরণ চাহিদায় রসুনের দাম ঊর্ধ্বমুখী। রোদে শুকিয়ে গ্রেড-এ বিক্রি করুন।'
    },
    arrivalVolume: 'Heavy (3,600 Bags/Day)',
    arrivalVolumes: {
      en: 'Heavy (3,600 Bags/Day)',
      hi: 'भारी आवक (3,600 बोरी/दिन)',
      mr: 'मोठी आवक (३,६०० गोणी/दिवस)',
      te: 'భారీగా ఉంది (3,600 బస్తాలు/రోజు)',
      ta: 'அதிக வரத்து (3,600 பைகள்/நாள்)',
      bn: 'ব্যাপক আমদানি (৩,৬০০ ব্যাগ/দিন)'
    },
    buyerDemand: 'Aggressive (Exporters & Masala Brands)',
    buyerDemands: {
      en: 'Aggressive (Exporters & Masala Brands)',
      hi: 'तेज (निर्यातक व मसाला ब्रांड्स सक्रिय)',
      mr: 'आक्रमक (निर्यातक व मसाले ब्रँड्स)',
      te: 'చాలా ఎక్కువ (ఎగుమతిదారులు & బ్రాండ్లు)',
      ta: 'தீவிரம் (ஏற்றுமதியாளர்கள் & பிராண்டுகள்)',
      bn: 'আগ্রাসী (রপ্তানিকারক ও মশলা কোম্পানি)'
    },
    recommendedStrategy: 'Sun dry bulbs and hold for premium lots',
    recommendedStrategies: {
      en: 'Sun dry bulbs and hold for premium lots',
      hi: 'धूप में सुखाकर बड़े गट्टे रोककर ऊंचे दाम पर बेचें',
      mr: 'उन्हात वाळवून मोठे गड्डे चांगल्या भावात विका',
      te: 'ఆరబెట్టి పెద్ద సైజు వెల్లుల్లిని ఎక్కువ ధరకు అమ్మండి',
      ta: 'உலர்த்தி தரமான பூண்டை அதிக விலைக்கு விற்கவும்',
      bn: 'রোদে শুকিয়ে ভালো গ্রেড ধরে রেখে বেশি দামে বিক্রি করুন'
    }
  },
  {
    id: 'mandi-turmeric',
    commodity: 'Turmeric (Finger / Nizamabad)',
    commodityHi: 'हल्दी (साबुत गांठ / निज़ामाबाद)',
    commodityNames: {
      en: 'Turmeric (Finger / Nizamabad)',
      hi: 'हल्दी (साबुत गांठ / निज़ामाबाद)',
      mr: 'हळद (सांगली / निजामाबाद)',
      te: 'పసుపు (కొమ్ము / నిజామాబాద్)',
      ta: 'மஞ்சள் (ஈரோடு / விரலி மஞ்சள்)',
      bn: 'হলুদ (আস্ত হলুদ गांठ)'
    },
    market: 'Nizamabad / Erode APMC',
    state: 'Telangana / Tamil Nadu',
    modalPrice: 13800,
    minPrice: 12200,
    maxPrice: 15400,
    changePercent: 3.6,
    trend: 'UP',
    advisoryNote: 'Curcumin-rich varieties fetching high premiums. Direct delivery to processing hubs recommended.',
    advisoryNoteHi: 'उच्च करक्यूमिन वाली हल्दी पर ₹1,200 का बोनस। वायदा बाजार में मजबूती के चलते माल रोककर बेचें।',
    advisoryNotes: {
      en: 'Strong domestic pharmaceutical and culinary demand. Holding polished fingers for 15 days is beneficial.',
      hi: 'उच्च करक्यूमिन वाली हल्दी पर ₹1,200 का बोनस। वायदा बाजार में मजबूती के चलते माल रोककर बेचें।',
      mr: 'औषधी कंपन्यांकडून हळदीला मोठी मागणी. पॉलिश केलेली हळद १५ दिवस थांबून विकल्यास जादा नफा.',
      te: 'ఔషధ కంపెనీల నుండి పసుపుకు మంచి డిమాండ్ ఉంది. పాలిష్ చేసిన పసుపును 15 రోజులు ఆగి అమ్మితే ఎక్కువ లాభం.',
      ta: 'மருந்து மற்றும் உணவு தேவை அதிகரித்துள்ளது. பாலிஷ் செய்த விரலி மஞ்சளை 15 நாட்கள் நிறுத்தி விற்றால் கூடுதல் லாபம்.',
      bn: 'ওষুধ কোম্পানি ও রান্নাঘরে হলুদের ব্যাপক চাহিদা। পালিশ করা হলুদ ১৫ দিন রেখে বিক্রি করলে বেশি লাভ।'
    },
    arrivalVolume: 'Moderate (2,100 Bags/Day)',
    arrivalVolumes: {
      en: 'Moderate (2,100 Bags/Day)',
      hi: 'मध्यम (2,100 बोरी/दिन)',
      mr: 'मध्यम (२,१०० गोणी/दिवस)',
      te: 'మధ్యస్థం (2,100 బస్తాలు/రోజు)',
      ta: 'மிதமானது (2,100 பைகள்/நாள்)',
      bn: 'মাঝারি (২,১০০ ব্যাগ/দিন)'
    },
    buyerDemand: 'High (Pharma & Extraction Units)',
    buyerDemands: {
      en: 'High (Pharma & Extraction Units)',
      hi: 'मजबूत (फार्मा व एक्सट्रैक्शन यूनिट्स)',
      mr: 'चांगली (फार्मा कंपन्या सक्रिय)',
      te: 'ఎక్కువ (ఫార్మా & ఎక్స్‌ట్రాక్షన్ యూనిట్లు)',
      ta: 'அதிகம் (மருந்து தயாரிப்பு ஆலைகள்)',
      bn: 'উচ্চ (ফার্মা ও নির্যাস কারখানা)'
    },
    recommendedStrategy: 'Polish finger turmeric and hold for price peak',
    recommendedStrategies: {
      en: 'Polish finger turmeric and hold for price peak',
      hi: 'हल्दी पॉलिश कराकर 10-15 दिन बाद बेचें',
      mr: 'हळद पॉलिश करून १०-१५ दिवसांनंतर विका',
      te: 'పసుపు కొమ్ములను పాలిష్ చేసి 10-15 రోజుల తర్వాత విక్రయించండి',
      ta: 'விரலி மஞ்சளை பாலிஷ் செய்து 10-15 நாட்களுக்குப் பின் விற்கவும்',
      bn: 'পালিশ করে ১০-১৫ দিন পর বিক্রি করুন'
    }
  },
  {
    id: 'mandi-apple',
    commodity: 'Apple (Royal Delicious)',
    commodityHi: 'सेब (रॉयल डिलीशियस)',
    commodityNames: {
      en: 'Apple (Royal Delicious)',
      hi: 'सेब (रॉयल डिलीशियस)',
      mr: 'सफरचंद (रॉयल डेलिशिअस)',
      te: 'యాపిల్ (రాయల్ డెలిషియస్)',
      ta: 'ஆப்பிள் (ராயல் டெலிசியஸ்)',
      bn: 'আপেল (রয়্যাল ডেলিশিয়াস)'
    },
    market: 'Shimla / Sopore / Azadpur',
    state: 'Himachal Pradesh / J&K',
    modalPrice: 8600,
    minPrice: 7200,
    maxPrice: 9800,
    changePercent: 2.1,
    trend: 'UP',
    advisoryNote: 'Cold CA storage fruit in high demand across Delhi, Mumbai and Bangalore markets.',
    advisoryNoteHi: 'सीए कोल्ड स्टोरेज सेब की महानगरीय मंडियों में जबर्दस्त मांग। ट्रे पैकिंग में ग्रेडिंग करके भेजें।',
    advisoryNotes: {
      en: 'CA cold store stock in tight supply. Grade into uniform count boxes for highest auction realization.',
      hi: 'सीए कोल्ड स्टोरेज सेब की महानगरीय मंडियों में जबर्दस्त मांग। ट्रे पैकिंग में ग्रेडिंग करके भेजें।',
      mr: 'कोल्ड स्टोअरेजमधील सफरचंदांना महानगरांमध्ये मोठी मागणी. ट्रे पॅकिंगमध्ये प्रतवारी करून विका.',
      te: 'కోల్డ్ స్టోరేజ్ యాపిల్స్‌కు మార్కెట్లో అధిక డిమాండ్ ఉంది. బాక్సుల్లో గ్రేడింగ్ చేసి అమ్మితే ఎక్కువ ధర వస్తుంది.',
      ta: 'கோல்ட் ஸ்டோரேஜ் ஆப்பிள்களுக்கு நகரங்களில் அதிக தேவை. பெட்டிகளில் பேக் செய்து விற்றால் அதிக லாபம்.',
      bn: 'কোল্ড স্টোরেজের আপেলের ব্যাপক চাহিদা। ট্রে প্যাকিং করে গ্রেডিং করে পাঠালে সর্বোচ্চ দাম পাবেন।'
    },
    arrivalVolume: 'Steady (5,200 Boxes/Day)',
    arrivalVolumes: {
      en: 'Steady (5,200 Boxes/Day)',
      hi: 'स्थिर (5,200 बॉक्स/दिन)',
      mr: 'स्थिर (५,२०० बॉक्सेस/दिवस)',
      te: 'స్థిరంగా ఉంది (5,200 బాక్సులు/రోజు)',
      ta: 'நிலையானது (5,200 பெட்டிகள்/நாள்)',
      bn: 'স্থির (৫,২০০ বক্স/দিন)'
    },
    buyerDemand: 'Very Strong (Wholesale Fruit Traded)',
    buyerDemands: {
      en: 'Very Strong (Wholesale Fruit Traded)',
      hi: 'अत्यधिक मजबूत (फल थोक व्यापारी)',
      mr: 'अत्यंत मजबूत (फळ व्यापारी)',
      te: 'చాలా బలంగా ఉంది (హోల్‌సేల్ వ్యాపారులు)',
      ta: 'மிகவும் வலுவானது (மொத்த பழ வியாபாரிகள்)',
      bn: 'খুব শক্তিশালী (পাইকারি ফল ব্যবসায়ী)'
    },
    recommendedStrategy: 'Graded tray packing with CA storage release',
    recommendedStrategies: {
      en: 'Graded tray packing with CA storage release',
      hi: 'ट्रे पैकिंग करके कोल्ड स्टोरेज से चरणबद्ध निकालें',
      mr: 'ट्रे पॅकिंग करून टप्प्याटप्प्याने विक्री करा',
      te: 'ట్రే ప్యాకింగ్ చేసి దశలవారీగా విక్రయించండి',
      ta: 'ட்ரே பேக்கிங் செய்து படிப்படியாக விற்கவும்',
      bn: 'ট্রে প্যাকিং করে ধাপে ধাপে বাজারে ছাড়ুন'
    }
  },
  {
    id: 'mandi-chilli',
    commodity: 'Red Chilli (Guntur / Teja)',
    commodityHi: 'लाल मिर्च (गुंटूर / तेजा)',
    commodityNames: {
      en: 'Red Chilli (Guntur / Teja)',
      hi: 'लाल मिर्च (गुंटूर / तेजा)',
      mr: 'लाल मिरची (गुंटूर / तेजा)',
      te: 'ఎర్ర మిరపకాయలు (గుంటూరు / తేజ)',
      ta: 'சிவப்பு மிளகாய் (குண்டூர் / தேஜா)',
      bn: 'শুকনো লাল লঙ্কা (গুন্টুর / তেজা)'
    },
    market: 'Guntur / Khammam APMC',
    state: 'Andhra Pradesh / Telangana',
    modalPrice: 19500,
    minPrice: 17500,
    maxPrice: 21800,
    changePercent: 4.2,
    trend: 'UP',
    advisoryNote: 'Oleoresin extractors and export shipments to China and SE Asia active. Keep color value above 120 ASTA.',
    advisoryNoteHi: 'चीन व दक्षिण-पूर्व एशिया निर्यात व एक्सट्रैक्शन यूनिट्स की भारी खरीद। अच्छी सुखी तीखी मिर्च ₹20,000+ पर बिक रही है।',
    advisoryNotes: {
      en: 'Export shipments and masala industries buying aggressively. Maintain moisture under 10% for premium tier.',
      hi: 'चीन व दक्षिण-पूर्व एशिया निर्यात व एक्सट्रैक्शन यूनिट्स की भारी खरीद। अच्छी सुखी तीखी मिर्च ₹20,000+ पर बिक रही है।',
      mr: 'निर्यात आणि मसाला कंपन्यांची मोठी खरेदी. १०% पेक्षा कमी ओलावा असल्यास २०,०००+ भाव मिळतो.',
      te: 'ఎగుమతులు మరియు మసాలా పరిశ్రమల నుండి భారీ కొనుగోళ్లు. తేమ 10% కంటే తక్కువ ఉంటే అత్యధిక ధర లభిస్తుంది.',
      ta: 'ஏற்றுமதி மற்றும் மசாலா நிறுவனங்களின் கொள்முதல் தீவிரம். ஈரப்பதம் 10% குறைவாக இருந்தால் அதிக விலை கிடைக்கும்.',
      bn: 'রপ্তানি ও মশলা শিল্পের ব্যাপক ক্রয়। আর্দ্রতা ১০% এর কম রাখলে ২০,০০০+ টাকা দর পাবেন।'
    },
    arrivalVolume: 'Heavy (12,000 Bags/Day)',
    arrivalVolumes: {
      en: 'Heavy (12,000 Bags/Day)',
      hi: 'भारी आवक (12,000 बोरी/दिन)',
      mr: 'मोठी आवक (१२,००० गोणी/दिवस)',
      te: 'భారీగా ఉంది (12,000 బస్తాలు/రోజు)',
      ta: 'அதிக வரத்து (12,000 பைகள்/நாள்)',
      bn: 'ব্যাপক আমদানি (১২,০০০ ব্যাগ/দিন)'
    },
    buyerDemand: 'Very High (Exporters & Oleoresin Plants)',
    buyerDemands: {
      en: 'Very High (Exporters & Oleoresin Plants)',
      hi: 'अत्यधिक तेज (निर्यातक व प्लांट सक्रिय)',
      mr: 'अत्यंत जास्त (निर्यातक सक्रिय)',
      te: 'చాలా ఎక్కువ (ఎగుమతిదారులు & పరిశ్రమలు)',
      ta: 'மிக அதிகம் (ஏற்றுமதி ஆலைகள்)',
      bn: 'অত্যন্ত উচ্চ (রপ্তানিকারক ও প্ল্যান্ট)'
    },
    recommendedStrategy: 'Maintain uniform deep red color and sell in lots',
    recommendedStrategies: {
      en: 'Maintain uniform deep red color and sell in lots',
      hi: 'गहरे लाल रंग की सूखी मिर्च लॉट बनाकर मंडी में लाएं',
      mr: 'गडद लाल रंगाची वाळलेली मिरची टप्प्याटप्प्याने विका',
      te: 'మంచి ఎరుపు రంగు ఉన్న మిరపకాయలను లాట్లుగా అమ్మండి',
      ta: 'நல்ல சிவப்பு நிறமுள்ள மிளகாயை பிரித்து விற்கவும்',
      bn: 'গাঢ় লাল রঙের শুকনো লঙ্কা লটে ভাগ করে বিক্রি করুন'
    }
  },
  {
    id: 'mandi-paddy',
    commodity: 'Paddy / Basmati (PB 1509 / 1121)',
    commodityHi: 'धान / बासमती (PB 1509 / 1121)',
    commodityNames: {
      en: 'Paddy / Basmati (PB 1509 / 1121)',
      hi: 'धान / बासमती (PB 1509 / 1121)',
      mr: 'धान / बासमती भात (१५०९ / ११२१)',
      te: 'వరి / బాస్మతి (PB 1509 / 1121)',
      ta: 'நெல் / பாசுமதி (PB 1509 / 1121)',
      bn: 'ধান / বাসমতী (PB 1509 / 1121)'
    },
    market: 'Karnal / Taraori APMC',
    state: 'Haryana / Punjab',
    modalPrice: 3850,
    minPrice: 3500,
    maxPrice: 4200,
    changePercent: 1.8,
    trend: 'UP',
    advisoryNote: 'Middle East export demand steady for Basmati varieties. Moisture must be <= 14% at weighbridge.',
    advisoryNoteHi: 'खाड़ी देशों को बासमती चावल निर्यात मांग मजबूत। मंडी में तुलाई के समय नमी 14% से कम रखने पर पूरा दाम।',
    advisoryNotes: {
      en: 'Rice millers active for export consignments. Drying grain before arrival ensures ₹150/Q extra realization.',
      hi: 'खाड़ी देशों को बासमती चावल निर्यात मांग मजबूत। मंडी में तुलाई के समय नमी 14% से कम रखने पर पूरा दाम।',
      mr: 'तांदूळ गिरण्यांकडून बासमतीला मोठी मागणी. ओलावा १४% पेक्षा कमी ठेवल्यास ₹१५० जादा भाव मिळतो.',
      te: 'ఎగుమతి కోసం రైస్ మిల్లులు చురుగ్గా కొనుగోలు చేస్తున్నాయి. తేమ 14% లోపు ఉంటే క్వింటాల్‌కు ₹150 అదనపు ధర లభిస్తుంది.',
      ta: 'ஏற்றுமதிக்காக அரிசி ஆலைகள் தீவிரமாக கொள்முதல் செய்கின்றன. ஈரப்பதம் 14% குறைவாக இருந்தால் கூடுதல் விலை கிடைக்கும்.',
      bn: 'চাল কলগুলো বাসমতীর জন্য সক্রিয়। আর্দ্রতা ১৪% এর কম থাকলে কুইন্টাল প্রতি ১৫০ টাকা বেশি।'
    },
    arrivalVolume: 'High (8,500 Bags/Day)',
    arrivalVolumes: {
      en: 'High (8,500 Bags/Day)',
      hi: 'उच्च (8,500 बोरी/दिन)',
      mr: 'जास्त (८,५०० गोणी/दिवस)',
      te: 'ఎక్కువ (8,500 బస్తాలు/రోజు)',
      ta: 'அதிகம் (8,500 பைகள்/நாள்)',
      bn: 'উচ্চ (৮,৫০০ ব্যাগ/দিন)'
    },
    buyerDemand: 'Strong (Rice Millers & Exporters)',
    buyerDemands: {
      en: 'Strong (Rice Millers & Exporters)',
      hi: 'मजबूत (राइस मिलर्स व निर्यातक)',
      mr: 'चांगली (राईस मिलर्स सक्रिय)',
      te: 'బలంగా ఉంది (రైస్ మిల్లులు & ఎగుమతిదారులు)',
      ta: 'வலுவானது (அரிசி ஆலைகள் & ஏற்றுமதியாளர்கள்)',
      bn: 'দৃঢ় (চাল কল ও রপ্তানিকারক)'
    },
    recommendedStrategy: 'Dry moisture below 14% before entering mandi yard',
    recommendedStrategies: {
      en: 'Dry moisture below 14% before entering mandi yard',
      hi: 'मंडी लाने से पहले नमी 14% से कम सुखा लें',
      mr: 'बाजारात आणण्यापूर्वी ओलावा १४% पेक्षा कमी करा',
      te: 'మార్కెట్‌కు తెచ్చే ముందు తేమను 14% లోపు ఆరబెట్టండి',
      ta: 'சந்தைக்கு கொண்டு வரும் முன் ஈரப்பதத்தை 14% க்குள் உலர்த்தவும்',
      bn: 'মান্ডিতে আনার আগে আর্দ্রতা ১৪% এর নিচে শুকিয়ে নিন'
    }
  },
  {
    id: 'mandi-tomato',
    commodity: 'Tomato (Hybrid / Local)',
    commodityHi: 'टमाटर (हाइब्रिड / देसी)',
    commodityNames: {
      en: 'Tomato (Hybrid / Local)',
      hi: 'टमाटर (हाइब्रिड / देसी)',
      mr: 'टोमॅटो (हायब्रिड / देशी)',
      te: 'టమోటా (హైబ్రిడ్ / లోకల్)',
      ta: 'தக்காளி (ஹைப்ரிட்)',
      bn: 'টমেটো (হাইব্রিড)'
    },
    market: 'Kolar / Madanapalle APMC',
    state: 'Karnataka / Andhra Pradesh',
    modalPrice: 1450,
    minPrice: 1100,
    maxPrice: 1750,
    changePercent: 6.8,
    trend: 'UP',
    advisoryNote: 'Inter-state dispatch demand surging. Grade into firm red crates for ₹120/box extra value.',
    advisoryNoteHi: 'अंतर्राज्यीय मांग में 15% की वृद्धि। ग्रेडिंग करके क्रेट में बेचने पर ₹120 प्रति क्रेट अधिक।',
    advisoryNotes: {
      en: 'Strong dispatch demand from southern consumption centers. Pack in standard crates for top auction rate.',
      hi: 'अंतर्राज्यीय मांग में 15% की वृद्धि। ग्रेडिंग करके क्रेट में बेचने पर ₹120 प्रति क्रेट अधिक।',
      mr: 'परराज्यातील मागणी वाढली आहे. क्रेटमध्ये प्रतवारी करून विकल्यास जादा नफा.',
      te: 'పక్క రాష్ట్రాల నుండి మంచి డిమాండ్ ఉంది. గ్రేడింగ్ చేసి విక్రయిస్తే బాక్సుకు ₹120 అదనపు లాభం.',
      ta: 'வெளிமாநில தேவை அதிகரித்துள்ளது. கிரேடிங் செய்து விற்றால் பெட்டிக்கு ₹120 கூடுதல் லாபம்.',
      bn: 'আন্তঃরাজ্য চাহিদা বেড়েছে। গ্রেডিং করে ক্র্যাটে বিক্রি করলে প্রতি বক্সে ১২০ টাকা বেশি।'
    },
    arrivalVolume: 'Moderate (4,200 Crates/Day)',
    arrivalVolumes: {
      en: 'Moderate (4,200 Crates/Day)',
      hi: 'मध्यम (4,200 क्रेट/दिन)',
      mr: 'मध्यम (४,२०० क्रेट्स/दिवस)',
      te: 'మధ్యస్థం (4,200 క్రేట్లు/రోజు)',
      ta: 'மிதமானது (4,200 பெட்டிகள்/நாள்)',
      bn: 'মাঝারি (৪,২০০ ক্র্যাট/দিন)'
    },
    buyerDemand: 'Very High (Inter-state transit)',
    buyerDemands: {
      en: 'Very High (Inter-state transit)',
      hi: 'अत्यधिक तेज (अंतर्राज्यीय व्यापारी)',
      mr: 'खूप जास्त (आंतरराज्य व्यापारी)',
      te: 'చాలా ఎక్కువ (అంతర్రాష్ట్ర వ్యాపారులు)',
      ta: 'மிக அதிகம் (வெளிமாநில வியாபாரிகள்)',
      bn: 'খুব উচ্চ (আন্তঃরাজ্য ব্যবসায়ী)'
    },
    recommendedStrategy: 'Grade by ripeness and dispatch in crates',
    recommendedStrategies: {
      en: 'Grade by ripeness and dispatch in crates',
      hi: 'पके व अधपके फल छांटकर क्रेट में भेजें',
      mr: 'पिकलेले आणि कच्चे टोमॅटो वेगळे करून क्रेटमध्ये पाठवा',
      te: 'పండిన మరియు దోర కాయలను గ్రేడింగ్ చేసి క్రేట్లలో తరలించండి',
      ta: 'பழுத்த காய்களை தரம் பிரித்து பெட்டிகளில் அனுப்பவும்',
      bn: 'পাকা ও কাঁচা ফল গ্রেডিং করে ক্র্যাটে পাঠান'
    }
  }
];

export const GOVERNMENT_SCHEMES_DATA: GovernmentScheme[] = [
  {
    id: 'scheme-mudra-shishu',
    name: 'PM MUDRA Yojana (Shishu Loan)',
    nameVernacular: 'प्रधानमंत्री मुद्रा योजना (शिशु ऋण)',
    category: 'MUDRA',
    maxAmount: 50000,
    subsidyRate: 'Nil (0% Collateral)',
    interestRate: '8.5% - 10.5%',
    targetBeneficiaries: 'Grocery shops, tea stalls, tailors, vegetable vendors, artisans',
    eligibilityConditions: [
      'Minimum age 18 years',
      'No prior bank defaults or NPAs',
      'Aadhaar card & local proof of micro-business',
      'Daily ledger sales proof (Mera Vyapaar Room DB valid)'
    ],
    requiredDocuments: [
      'Aadhaar Card & PAN Card',
      'Bank passbook statement (last 6 months)',
      'Shop / workplace photo',
      'Mera Vyapaar digital cashflow statement'
    ],
    status: 'ELIGIBLE',
    names: {
      en: 'PM MUDRA Yojana (Shishu Loan)',
      hi: 'प्रधानमंत्री मुद्रा योजना (शिशु ऋण)',
      mr: 'प्रधानमंत्री मुद्रा योजना (शिशू कर्ज)',
      te: 'ప్రధాన మంత్రి ముద్ర యోజన (శిశు రుణం)',
      ta: 'பிரதமர் முத்ரா திட்டம் (சிசு கடன்)',
      bn: 'প্রধানমন্ত্রী মুদ্রা যোজনা (শিশু ঋণ)'
    },
    targets: {
      en: 'Grocery stores, tea stalls, tailors, fruit/vegetable vendors, small artisans',
      hi: 'किराना दुकान, चाय-नाश्ता, दर्जी, सब्जी विक्रेता, हस्तशिल्पी',
      mr: 'किराणा दुकान, चहा स्टॉल, शिंपी, भाजीपाला विक्रेते, कारागीर',
      te: 'కిరాణా దుకాణాలు, టీ స్టాళ్లు, టైలర్లు, కూరగాయల విక్రేతలు, చేతివృత్తుల కళాకారులు',
      ta: 'மளிகை கடைகள், தேநீர் கடைகள், தையல்காரர்கள், காய்கறி விற்பனையாளர்கள், கைவினைஞர்கள்',
      bn: 'মুদি দোকান, চায়ের স্টল, দর্জি, সবজি বিক্রেতা, ছোট হস্তশিল্পী'
    },
    subsidies: {
      en: 'Nil (100% Collateral-Free Credit Guarantee)',
      hi: 'शून्य बंधक (100% गैर-जमानती क्रेडिट गारंटी)',
      mr: 'विनातारण (१००% हमी योजना)',
      te: 'పూచీకత్తు లేని రుణం (100% గ్యారెంటీ)',
      ta: 'பிணையற்ற கடன் (100% உத்தரவாதம்)',
      bn: 'জামানতমুক্ত ঋণ (১০০% ক্রেডিট গ্যারান্টি)'
    },
    eligibilities: {
      en: [
        'Minimum age 18 years',
        'No prior bank loan defaults or NPAs',
        'Aadhaar card & proof of micro-enterprise',
        'Active daily sales records (Mera Vyapaar ledger accepted)'
      ],
      hi: [
        'न्यूनतम आयु 18 वर्ष',
        'कोई पिछला बैंक डिफॉल्ट न हो',
        'आधार कार्ड व स्थानीय व्यापार प्रमाण',
        'दैनिक बिक्री खाता (मेरा व्यापार बहीखाता मान्य)'
      ],
      mr: [
        'किमान वय १८ वर्षे पूर्ण',
        'बँकेचा कोणताही जुना डिफॉल्ट नसावा',
        'आधार कार्ड आणि स्थानिक व्यवसाय पुरावा',
        'दैनंदिन विक्री नोंद (मेरा व्यापार खातेवही मान्य)'
      ],
      te: [
        'కనీస వయస్సు 18 సంవత్సరాలు',
        'ఎటువంటి బ్యాంక్ డిఫాల్ట్ రికార్డు ఉండకూడదు',
        'ఆధార్ కార్డు & స్థానిక వ్యాపార రుజువు',
        'రోజువారీ అమ్మకాల రికార్డు (మేరా వ్యాపార ఖాతా చెల్లుతుంది)'
      ],
      ta: [
        'குறைந்தபட்ச வயது 18 ஆண்டுகள்',
        'முந்தைய வங்கி கடன் பாக்கிகள் இருக்கக்கூடாது',
        'ஆதார் அட்டை & உள்ளூர் தொழில் சான்று',
        'தினசரி விற்பனை கணக்கு பதிவு (Mera Vyapaar செல்லுபடியாகும்)'
      ],
      bn: [
        'নূন্যতম বয়স ১৮ বছর',
        'কোনো পূর্ববর্তী ব্যাংক ঋণ খেলাপি না থাকা',
        'আধার কার্ড এবং স্থানীয় ব্যবসার প্রমাণ',
        'দৈনিক বিক্রির রেকর্ড (মেরা ব্যাপার খাতা গ্রহণযোগ্য)'
      ]
    },
    documents: {
      en: [
        'Aadhaar Card & PAN Card',
        'Bank Passbook / Statement (last 6 months)',
        'Shop / stall photograph',
        'Mera Vyapaar digital certified cashflow statement'
      ],
      hi: [
        'आधार कार्ड व पैन कार्ड',
        'बैंक पासबुक (पिछले 6 माह)',
        'दुकान / कार्यस्थल की तस्वीर',
        'मेरा व्यापार डिजिटल कैशफ्लो सारांश'
      ],
      mr: [
        'आधार कार्ड आणि पॅन कार्ड',
        'बँक पासबुक (मागील ६ महिने)',
        'दुकानाचे / कामाच्या जागेचे छायाचित्र',
        'मेरा व्यापार डिजिटल कॅशफ्लो प्रमाणपत्र'
      ],
      te: [
        'ఆధార్ కార్డు & పాన్ కార్డు',
        'బ్యాంక్ పాస్‌బుక్ (గత 6 నెలలు)',
        'దుకాణం / వ్యాపార ప్రదేశం ఫోటో',
        'మేరా వ్యాపార డిజిటల్ క్యాష్‌ఫ్లో సర్టిఫికేట్'
      ],
      ta: [
        'ஆதார் அட்டை & பான் அட்டை',
        'வங்கி கணக்கு புத்தகம் (கடந்த 6 மாதங்கள்)',
        'கடை / பணியிட புகைப்படம்',
        'Mera Vyapaar டிஜிட்டல் பணப்புழக்க சான்றிதழ்'
      ],
      bn: [
        'আধার কার্ড এবং প্যান কার্ড',
        'ব্যাংক পাসবুক (বিগত ৬ মাসের)',
        'দোকান বা কর্মস্থলের ছবি',
        'মেরা ব্যাপার ডিজিটাল ক্যাশফ্লো সার্টিফিকেট'
      ]
    }
  },
  {
    id: 'scheme-mudra-kishore',
    name: 'PM MUDRA Yojana (Kishore Loan)',
    nameVernacular: 'प्रधानमंत्री मुद्रा योजना (किशोर ऋण)',
    category: 'MUDRA',
    maxAmount: 500000,
    subsidyRate: 'Nil (CGTMSE Guarantee)',
    interestRate: '9.2% - 11.5%',
    targetBeneficiaries: 'Dairy expansion, small workshops, handloom clusters, mini flour mills',
    eligibilityConditions: [
      'Minimum 6 months continuous business cashflow',
      'Monthly turnover ₹30,000+',
      'Alternative credit score 620+'
    ],
    requiredDocuments: [
      'Udyam Registration Certificate',
      '1 year bank statement',
      'Machinery / inventory quotation'
    ],
    status: 'ELIGIBLE',
    names: {
      en: 'PM MUDRA Yojana (Kishore Loan)',
      hi: 'प्रधानमंत्री मुद्रा योजना (किशोर ऋण)',
      mr: 'प्रधानमंत्री मुद्रा योजना (किशोर कर्ज)',
      te: 'ప్రధాన మంత్రి ముద్ర యోజన (కిషోర్ రుణం)',
      ta: 'பிரதமர் முத்ரா திட்டம் (கிஷோர் கடன்)',
      bn: 'প্রধানমন্ত্রী মুদ্রা যোজনা (কিশোর ঋণ)'
    },
    targets: {
      en: 'Dairy farm expansion, small repair workshops, handloom units, mini flour mills',
      hi: 'डेयरी विस्तार, छोटे वर्कशॉप, हथकरघा क्लस्टर, मिनी आटा चक्की',
      mr: 'डेअरी व्यवसाय, वर्कशॉप, हातमाग युनिट्स, गिरणी व्यवसाय',
      te: 'పాడి పరిశ్రమ విస్తరణ, చిన్న వర్క్‌షాప్‌లు, చేనేత యూనిట్లు, పిండి గిర్నీలు',
      ta: 'பால் பண்ணை விரிவாக்கம், பட்டறைகள், கைத்தறி நெசவு, மாவு ஆலைகள்',
      bn: 'দুগ্ধ খামার সম্প্রসারণ, ছোট ওয়ার্কশপ, তাঁত শিল্প, মিনি ময়দা কল'
    },
    subsidies: {
      en: 'CGTMSE Credit Guarantee Coverage',
      hi: 'CGTMSE क्रेडिट गारंटी सुरक्षा',
      mr: 'CGTMSE कर्ज हमी कवच',
      te: 'CGTMSE క్రెడిట్ గ్యారెంటీ కవరేజ్',
      ta: 'CGTMSE கடன் உத்தரவாத பாதுகாப்பு',
      bn: 'CGTMSE ক্রেডিট গ্যারান্টি সুরক্ষা'
    },
    eligibilities: {
      en: [
        'Minimum 6 months proven continuous business cashflow',
        'Monthly turnover of ₹30,000+',
        'Alternative credit score 620+'
      ],
      hi: [
        'न्यूनतम 6 माह का निरंतर व्यावसायिक नकदी प्रवाह',
        'मासिक टर्नओवर ₹30,000+',
        'वैकल्पिक क्रेडिट स्कोर 620+'
      ],
      mr: [
        'किमान ६ महिन्यांचा व्यवसाय रोख प्रवाह',
        'मासिक उलाढाल ₹३०,०००+',
        'पर्यायी क्रेडिट स्कोअर ६२०+'
      ],
      te: [
        'కనీసం 6 నెలల నిరంతర వ్యాపార నగదు ప్రవాహం',
        'నెలవారీ టర్నోవర్ ₹30,000+',
        'ప్రత్యామ్నాయ క్రెడిట్ స్కోరు 620+'
      ],
      ta: [
        'குறைந்தபட்சம் 6 மாத தொடர்ச்சியான பணப்புழக்கம்',
        'மாதாந்திர வர்த்தகம் ₹30,000+',
        'மாற்று கிரெடிட் ஸ்கோர் 620+'
      ],
      bn: [
        'ন্যূনতম ৬ মাসের নিরবচ্ছিন্ন ব্যবসায়িক নগদ প্রবাহ',
        'মাসিক টার্নওভার ₹৩০,০০০+',
        'বিকল্প ক্রেডিট স্কোর ৬২০+'
      ]
    },
    documents: {
      en: [
        'Udyam Registration Certificate',
        '1-year Bank Account Statement',
        'Machinery / raw material quotation',
        'Mera Vyapaar Cashflow Analytics Report'
      ],
      hi: [
        'उद्यम रजिस्ट्रेशन (Udyam)',
        '1 वर्ष का बैंक स्टेटमेंट',
        'मशीनरी / सामग्री कोटेशन',
        'मेरा व्यापार कैशफ्लो रिपोर्ट'
      ],
      mr: [
        'उद्यम नोंदणी प्रमाणपत्र (Udyam)',
        '१ वर्षाचे बँक विवरण',
        'मशिनरी / साहित्याचे कोटेशन',
        'मेरा व्यापार कॅशफ्लो अहवाल'
      ],
      te: [
        'ఉద్యమ్ రిజిస్ట్రేషన్ సర్టిఫికేట్',
        '1 సంవత్సరం బ్యాంక్ స్టేట్‌మెంట్',
        'యంత్రాలు / ముడి సరుకుల కొటేషన్',
        'మేరా వ్యాపార క్యాష్‌ఫ్లో నివేదిక'
      ],
      ta: [
        'உத்யம் பதிவு சான்றிதழ்',
        '1 ஆண்டு வங்கி கணக்கு அறிக்கை',
        'இயந்திரங்கள் / பொருட்கள் விலைப்பட்டியல்',
        'Mera Vyapaar பணப்புழக்க அறிக்கை'
      ],
      bn: [
        'উদ্যম রেজিস্ট্রেশন সার্টিফিকেট',
        '১ বছরের ব্যাংক স্টেটমেন্ট',
        'যন্ত্রপাতি বা কাঁচামালের কোটেশন',
        'মেরা ব্যাপার ক্যাশফ্লো রিপোর্ট'
      ]
    }
  },
  {
    id: 'scheme-pmegp',
    name: 'PMEGP (Prime Minister Employment Generation Programme)',
    nameVernacular: 'प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP)',
    category: 'PMEGP',
    maxAmount: 2500000,
    subsidyRate: '25% - 35% Govt Subsidy (Rural & Special Category)',
    interestRate: '10.0% - 12.0%',
    targetBeneficiaries: 'Rural manufacturing, food processing, woodwork, agro-processing units',
    eligibilityConditions: [
      '8th class pass (for projects above ₹10 Lakhs)',
      'New enterprise in rural area qualifies for 35% capital subsidy',
      'Beneficiary promoter contribution only 5% - 10%'
    ],
    requiredDocuments: [
      'Detailed Project Report (DPR)',
      'Category / Caste certificate (for subsidy)',
      'Educational certificate',
      'Gram Panchayat No-Objection Certificate (NOC)'
    ],
    status: 'PARTIALLY_ELIGIBLE',
    names: {
      en: 'PMEGP (Prime Minister Employment Generation)',
      hi: 'प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP)',
      mr: 'पंतप्रधान रोजगार निर्मिती कार्यक्रम (PMEGP)',
      te: 'ప్రధాన మంత్రి ఉపాధి కల్పన పథకం (PMEGP)',
      ta: 'பிரதமர் வேலைவாய்ப்பு உருவாக்க திட்டம் (PMEGP)',
      bn: 'প্রধানমন্ত্রী কর্মসংস্থান সৃষ্টি কর্মসূচি (PMEGP)'
    },
    targets: {
      en: 'Rural manufacturing, food processing, woodwork & agro-processing enterprises',
      hi: 'ग्रामीण निर्माण, खाद्य प्रसंस्करण, लकड़ी शिल्प, एग्रो-प्रोसेसिंग इकाइयां',
      mr: 'ग्रामीण उत्पादन, अन्न प्रक्रिया, लाकूडकाम, कृषी प्रक्रिया उद्योग',
      te: 'గ్రామీణ తయారీ రంగం, ఆహార శుద్ధి పరిశ్రమలు, చెక్క పనులు, వ్యవసాయ ఆధారిత యూనిట్లు',
      ta: 'கிராமப்புற உற்பத்தி, உணவு பதப்படுத்துதல், கைவினைப் பொருட்கள், வேளாண் சார்ந்த தொழில்கள்',
      bn: 'গ্রামীণ উৎপাদন, খাদ্য প্রক্রিয়াকরণ, কাষ্ঠশিল্প এবং কৃষিভিত্তিক প্রক্রিয়াকরণ ইউনিট'
    },
    subsidies: {
      en: '25% - 35% Capital Subsidy (Rural & Special Category)',
      hi: '25% - 35% सरकारी पूंजीगत सब्सिडी (ग्रामीण व विशेष वर्ग)',
      mr: '२५% - ३५% सरकारी भांडवली अनुदान (ग्रामीण भाग)',
      te: '25% - 35% ప్రభుత్వ మూలధన సబ్సిడీ (గ్రామీణ ప్రాంతాలు)',
      ta: '25% - 35% அரசு மூலதன மானியம் (கிராமப்புறம்)',
      bn: '২৫% - ৩৫% সরকারি মূলধন ভর্তুকি (গ্রামীণ এলাকা)'
    },
    eligibilities: {
      en: [
        '8th standard pass certificate (for projects above ₹10 Lakhs)',
        'Setting up a new project in rural areas for 35% subsidy',
        'Beneficiary own promoter equity only 5% - 10%'
      ],
      hi: [
        '8वीं कक्षा उत्तीर्ण (₹10 लाख से ऊपर परियोजना हेतु)',
        'ग्रामीण क्षेत्र में स्थापित नवीन इकाई (35% सब्सिडी)',
        'स्वयं का अंशदान केवल 5% - 10%'
      ],
      mr: [
        'किमान ८ वी उत्तीर्ण (₹१० लाखांवरील प्रकल्पांसाठी)',
        'ग्रामीण भागात नवीन प्रकल्प (३५% अनुदान)',
        'स्वतःचे भांडवल योगदान फक्त ५% - १०%'
      ],
      te: [
        '8వ తరగతి ఉత్తీర్ణత (₹10 లక్షలకు పైబడిన ప్రాజెక్టులకు)',
        'గ్రామీణ ప్రాంతంలో కొత్త యూనిట్ ఏర్పాటుకు 35% సబ్సిడీ',
        'సొంత వాటా కేవలం 5% - 10% మాత్రమే'
      ],
      ta: [
        '8 ஆம் வகுப்பு தேர்ச்சி (₹10 லட்சத்திற்கு மேற்பட்ட திட்டங்களுக்கு)',
        'கிராமப்புறங்களில் புதிய திட்டம் தொடங்கினால் 35% மானியம்',
        'சொந்த முதலீடு 5% - 10% மட்டுமே'
      ],
      bn: [
        '৮ম শ্রেণি উত্তীর্ণ (₹১০ লক্ষের ওপর প্রকল্পের জন্য)',
        'গ্রামীণ এলাকায় নতুন ইউনিট স্থাপনে ৩৫% ভর্তুকি',
        'নিজস্ব মূলধন মাত্র ৫% - ১০%'
      ]
    },
    documents: {
      en: [
        'Detailed Project Report (DPR)',
        'Category / Caste certificate (for subsidy)',
        'Educational qualification certificate',
        'Gram Panchayat No-Objection Certificate (NOC)'
      ],
      hi: [
        'DPR (विस्तृत परियोजना रिपोर्ट)',
        'जाति / वर्ग प्रमाण पत्र (सब्सिडी हेतु)',
        'शैक्षणिक प्रमाण पत्र',
        'ग्राम पंचायत NOC'
      ],
      mr: [
        'विस्तृत प्रकल्प अहवाल (DPR)',
        'जात / संवर्ग प्रमाणपत्र (अनुदानासाठी)',
        'शैक्षणिक प्रमाणपत्र',
        'ग्रामपंचायत ना-हरकत प्रमाणपत्र (NOC)'
      ],
      te: [
        'సమగ్ర ప్రాజెక్ట్ నివేదిక (DPR)',
        'కుల / వర్గ ధృవీకరణ పత్రం (సబ్సిడీ కోసం)',
        'విద్యార్హత ధృవీకరణ పత్రం',
        'గ్రామ పంచాయతీ నిరభ్యంతర పత్రం (NOC)'
      ],
      ta: [
        'விரிவான திட்ட அறிக்கை (DPR)',
        'சாதி / பிரிவு சான்றிதழ் (மானியத்திற்கு)',
        'கல்வி சான்றிதழ்',
        'கிராம பஞ்சாயத்து தடையின்மை சான்றிதழ் (NOC)'
      ],
      bn: [
        'বিস্তারিত প্রকল্প রিপোর্ট (DPR)',
        'শ্রেণী / জাতিগত শংসাপত্র (ভর্তুকির জন্য)',
        'শিক্ষাগত যোগ্যতার শংসাপত্র',
        'গ্রাম পঞ্চায়েত অনাপত্তি পত্র (NOC)'
      ]
    }
  },
  {
    id: 'scheme-svanidhi',
    name: 'PM SVANidhi (Street Vendors AtmaNirbhar Nidhi)',
    nameVernacular: 'पीएम स्वनिधि (स्ट्रीट वेंडर आत्मनिर्भर निधि)',
    category: 'PM_SVANIDHI',
    maxAmount: 50000,
    subsidyRate: '7% Interest Subsidy (Cashback on Digital Txns)',
    interestRate: '7.0% Effective Rate',
    targetBeneficiaries: 'Hawkers, weekly market vendors, cart operators, small service providers',
    eligibilityConditions: [
      'Vending in urban or peri-urban localities',
      'Timely repayment unlocks next tranche (₹10,000 -> ₹20,000 -> ₹50,000)'
    ],
    requiredDocuments: [
      'Aadhaar-linked bank account passbook',
      'Vending Certificate of Vending (COV) or Letter of Recommendation (LOR)'
    ],
    status: 'ELIGIBLE',
    names: {
      en: 'PM SVANidhi (Street Vendors Scheme)',
      hi: 'पीएम स्वनिधि (स्ट्रीट वेंडर आत्मनिर्भर निधि)',
      mr: 'पीएम स्वनिधी (फेरीवाले आत्मनिर्भर निधी)',
      te: 'ప్రధాన మంత్రి స్వనిధి (వీధి వ్యాపారుల పథకం)',
      ta: 'பிரதமர் ஸ்வநிதி (தெருவோர வியாபாரிகள் திட்டம்)',
      bn: 'পিএম স্বনিধি (পথ বিক্রেতা স্বনির্ভর তহবিল)'
    },
    targets: {
      en: 'Hawkers, weekly haat vendors, handcart operators, roadside food stalls',
      hi: 'फेरीवाले, साप्ताहिक हाट विक्रेता, ठेला चालक, कारीगर',
      mr: 'फेरीवाले, आठवडी बाजार विक्रेते, हातगाडी चालक, छोटे व्यावसायिक',
      te: 'వీధి వ్యాపారులు, సంతల విక్రేతలు, తోపుడు బండ్ల వ్యాపారులు, చిన్న దుకాణాలు',
      ta: 'தெருவோர வியாபாரிகள், வாராந்திர சந்தை விற்பனையாளர்கள், தள்ளுவண்டி வியாபாரிகள்',
      bn: 'হকার, সাপ্তাহিক বাজারের বিক্রেতা, ঠেলাগাড়ি চালক, ক্ষুদ্র কারিগর'
    },
    subsidies: {
      en: '7% Annual Interest Subsidy + Monthly Digital Cashback',
      hi: '7% वार्षिक ब्याज अनुदान + मासिक डिजिटल कैशबैक',
      mr: '७% वार्षिक व्याज परतावा + डिजिटल कॅशबॅक',
      te: '7% వార్షిక వడ్డీ రాయితీ + డిజిటల్ క్యాష్‌బ్యాక్',
      ta: '7% ஆண்டு வட்டி மானியம் + டிஜிட்டல் கேஷ்பேக்',
      bn: '৭% বার্ষিক সুদের ভর্তুকি + মাসিক ডিজিটাল ক্যাশব্যাক'
    },
    eligibilities: {
      en: [
        'Engaged in street vending in urban/peri-urban jurisdiction',
        'Timely repayment unlocks subsequent tranches (₹10k -> ₹20k -> ₹50k)'
      ],
      hi: [
        'नगरीय या अर्ध-नगरीय क्षेत्र में वेंडिंग',
        'समय पर पुनर्भुगतान पर अगली किस्त (10k -> 20k -> 50k)'
      ],
      mr: [
        'शहरी किंवा उपनगरीय भागात व्यवसाय असणे',
        'वेळेवर कर्ज फेडल्यास पुढील मोठा हप्ता (१० हजार -> २० हजार -> ५० हजार)'
      ],
      te: [
        'పట్టణ లేదా పరిసర ప్రాంతాల్లో వీధి వ్యాపారం చేయడం',
        'సకాలంలో తిరిగి చెల్లిస్తే తదుపరి విడత రుణం (₹10వేలు -> ₹20వేలు -> ₹50వేలు)'
      ],
      ta: [
        'நகர்ப்புறம் அல்லது புறநகர்ப் பகுதிகளில் தொழில் செய்தல்',
        'சரியான நேரத்தில் திரும்பச் செலுத்தினால் அடுத்த கட்ட கடன் (₹10,000 -> ₹20,000 -> ₹50,000)'
      ],
      bn: [
        'শহর বা উপনগরীয় অঞ্চলে ফুটপাতে ব্যবসা করা',
        'সময়মতো পরিশোধ করলে পরবর্তী কিস্তি বরাদ্দ (১০ হাজার -> ২০ হাজার -> ৫০ হাজার)'
      ]
    },
    documents: {
      en: [
        'Aadhaar-linked Bank Savings Account Passbook',
        'Vending Identity Card or Letter of Recommendation (LOR)'
      ],
      hi: [
        'आधार से लिंक बैंक खाता पासबुक',
        'वेंडिंग पहचान पत्र या LOR (लेटर ऑफ रेकमेंडेशन)'
      ],
      mr: [
        'आधार लिंक असलेले बँक खाते पासबुक',
        'फेरीवाला ओळखपत्र किंवा शिफारस पत्र (LOR)'
      ],
      te: [
        'ఆధార్ అనుసంధాన బ్యాంక్ ఖాతా పాస్‌బుక్',
        'వెండింగ్ గుర్తింపు కార్డు లేదా సిఫార్సు లేఖ (LOR)'
      ],
      ta: [
        'ஆதாருடன் இணைக்கப்பட்ட வங்கி கணக்கு புத்தகம்',
        'வியாபார அடையாள அட்டை அல்லது பரிந்துரை கடிதம் (LOR)'
      ],
      bn: [
        'আধার লিঙ্কযুক্ত ব্যাংক অ্যাকাউন্ট পাসবুক',
        'ভেন্ডিং পরিচয়পত্র অথবা সুপারিশপত্র (LOR)'
      ]
    }
  },
  {
    id: 'scheme-nabard-shg',
    name: 'NABARD SHG-Bank Linkage Scheme',
    nameVernacular: 'नाबार्ड स्वयंसहायता समूह (SHG) बैंक लिंकेज',
    category: 'NABARD',
    maxAmount: 1000000,
    subsidyRate: 'Concessional Interest Subvention (4% - 7%)',
    interestRate: '7.0% (Prompt repayment gets 3% subvention)',
    targetBeneficiaries: 'Women SHG groups, stitching clusters, dairy co-ops, village artisans',
    eligibilityConditions: [
      'Minimum 6 months active Self Help Group record',
      'Regular peer savings meetings & adherence to Pancha Sutras',
      'Group bank savings account with clean ledger history'
    ],
    requiredDocuments: [
      'SHG Resolution & Meeting Minute Book',
      'Member list with Aadhaar numbers',
      'SHG Bank Account Passbook & Mera Vyapaar Ledger Summary'
    ],
    status: 'ELIGIBLE',
    names: {
      en: 'NABARD SHG-Bank Linkage Scheme',
      hi: 'नाबार्ड स्वयंसहायता समूह (SHG) बैंक लिंकेज',
      mr: 'नाबार्ड बचत गट (SHG) बँक लिंकेज',
      te: 'నాబార్డ్ స్వయం సహాయక బృందం (SHG) బ్యాంక్ లింకేజ్',
      ta: 'நபார்டு மகளிர் சுயஉதவி குழு (SHG) வங்கி இணைப்பு',
      bn: 'নাবার্ড স্বনির্ভর গোষ্ঠী (SHG) ব্যাংক লিঙ্কেজ'
    },
    targets: {
      en: 'Women SHG groups, stitching clusters, dairy co-operatives, rural artisans',
      hi: 'महिला SHG समूह, सिलाई क्लस्टर, पशुपालन व दुग्ध सहकारी, ग्रामीण कारीगर',
      mr: 'महिला बचत गट, शिलाई क्लस्टर्स, दुग्ध व्यवसाय सहकारी संस्था',
      te: 'మహిళా స్వయం సహాయక బృందాలు, కుట్టు యూనిట్లు, పాడి పరిశ్రమ సహకార సంఘాలు',
      ta: 'மகளிர் சுயஉதவி குழுக்கள், தையல் தொழிலகங்கள், பால் கூட்டுறவு சங்கங்கள்',
      bn: 'মহিলা স্বনির্ভর গোষ্ঠী, সেলাই ক্লাস্টার, দুগ্ধ সমবায় সমিতি'
    },
    subsidies: {
      en: 'Interest Subvention reducing net rate down to 4% - 7%',
      hi: 'ब्याज अनुदान से प्रभावी दर 4% - 7% तक सस्ती',
      mr: 'व्याज सवलतीमुळे निव्वळ दर ४% - ७% पर्यंत कमी',
      te: 'వడ్డీ రాయితీతో నికర రేటు 4% - 7% కు తగ్గుతుంది',
      ta: 'வட்டி மானியம் மூலம் நிகர வட்டி 4% - 7% ஆக குறைகிறது',
      bn: 'সুদ ভর্তুকির কারণে কার্যকর সুদের হার ৪% - ৭%'
    },
    eligibilities: {
      en: [
        'Minimum 6 months active verified SHG track record',
        'Regular peer savings meetings & strict Pancha Sutra compliance',
        'Group bank savings account with transparent transaction history'
      ],
      hi: [
        'न्यूनतम 6 माह पुराना सक्रिय समूह',
        'नियमित बैठकें व पंचसूत्र का पालन',
        'सामूहिक बचत खाता व पारदर्शी खाता'
      ],
      mr: [
        'किमान ६ महिने सक्रिय असलेला बचत गट',
        'नियमित बैठका आणि पंचसूत्रीचे पालन',
        'गटाचे संयुक्त बँक खाते आणि पारदर्शक हिशोब'
      ],
      te: [
        'కనీసం 6 నెలల చురుకైన SHG రికార్డు',
        'క్రమం తప్పని పొదుపు సమావేశాలు & పంచసూత్రాల నిర్వహణ',
        'సమూహ బ్యాంక్ ఖాతా మరియు పారదర్శక రికార్డులు'
      ],
      ta: [
        'குறைந்தபட்சம் 6 மாதங்கள் செயல்படும் சுயஉதவி குழு',
        'தவறாமல் கூட்டங்கள் நடத்துதல் மற்றும் பஞ்ச சூத்திரங்களை பின்பற்றுதல்',
        'குழுவின் சேமிப்பு வங்கி கணக்கு'
      ],
      bn: [
        'ন্যূনতম ৬ মাসের সক্রিয় স্বনির্ভর দল',
        'নিয়মিত সঞ্চয় সভা এবং পঞ্চসূত্রের নিয়ম পালন',
        'দলের যৌথ ব্যাংক সঞ্চয় হিসাব'
      ]
    },
    documents: {
      en: [
        'SHG Group Resolution & Meeting Register',
        'List of members with Aadhaar numbers',
        'SHG Bank Account Passbook & Mera Vyapaar statement'
      ],
      hi: [
        'समूह प्रस्ताव व कार्यवाही पंजी',
        'सदस्यों की सूची व आधार नंबर',
        'समूह बचत खाता पासबुक व मेरा व्यापार सारांश'
      ],
      mr: [
        'बचत गट ठराव आणि कामकाज नोंदवही',
        'सदस्यांची यादी आणि आधार क्रमांक',
        'बचत गट बँक पासबुक आणि मेरा व्यापार प्रमाणपत्र'
      ],
      te: [
        'SHG తీర్మానం మరియు సమావేశాల రిజిస్టర్',
        'ఆధార్ నంబర్లతో కూడిన సభ్యుల జాబితా',
        'SHG బ్యాంక్ పాస్‌బుక్ & మేరా వ్యాపార నివేదిక'
      ],
      ta: [
        'சுயஉதவி குழு தீர்மானம் மற்றும் கூட்ட பதிவு புத்தகம்',
        'ஆதார் எண்களுடன் கூடிய உறுப்பினர்களின் பட்டியல்',
        'குழு வங்கி கணக்கு புத்தகம் & Mera Vyapaar அறிக்கை'
      ],
      bn: [
        'স্বনির্ভর দলের রেজোলিউশন এবং মিটিং খাতা',
        'আধার নম্বর সহ সদস্যদের তালিকা',
        'দলের ব্যাংক পাসবুক এবং মেরা ব্যাপার রিপোর্ট'
      ]
    }
  }
];
