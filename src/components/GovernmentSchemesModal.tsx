import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Landmark,
  FileSpreadsheet,
  ExternalLink,
  Sliders,
  Copy,
  Check,
  FileText,
  RefreshCw,
  Globe,
  Radio
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { apiUrl } from '../utils/apiUrl';
import { CustomerProfile } from './CustomerProfileModal';

export type GenderType = 'female' | 'male' | 'other';
export type SocialCategoryType = 'general' | 'obc' | 'sc' | 'st' | 'minority';
export type LocationType = 'rural' | 'urban' | 'semi-urban';
export type BusinessSectorType =
  | 'all'
  | 'agri_allied'
  | 'food_processing'
  | 'retail_shop'
  | 'street_vendor'
  | 'handloom_artisan'
  | 'manufacturing_small'
  | 'services'
  | 'dairy_livestock';

export interface ApplicantProfile {
  gender: GenderType;
  socialCategory: SocialCategoryType;
  locationType: LocationType;
  state: string;
  businessSector: BusinessSectorType;
  businessAgeMonths: number;
  monthlyRevenue: number;
  desiredLoanAmount: number;
  hasUdyam: boolean;
  creditScore: number;
}

interface SchemeEvaluation {
  isEligible: boolean;
  isPartiallyEligible: boolean;
  matchScore: number;
  calculatedSubsidyPercent: number;
  calculatedSubsidyAmount: number;
  collateralFree: boolean;
  matchedReasons: string[];
  unmetReasons: string[];
  recommendedAction: string;
}

interface LocalizedSchemeText {
  name: string;
  description: string;
  targetAudience: string;
  baseSubsidyText: string;
  interestRate: string;
  requiredDocs: string[];
}

interface SchemeDefinition {
  id: string;
  portal: 'Jan Samarth' | 'KVIC / PMEGP' | 'PM SVANidhi Portal' | 'PM Vishwakarma' | 'NABARD';
  portalUrl: string;
  categoryType: 'mudra' | 'pmegp' | 'street_vendor' | 'artisan' | 'food_processing' | 'women_sc_st' | 'agriculture';
  minLoan: number;
  maxLoan: number;
  localized: Record<SupportedLanguage, LocalizedSchemeText>;
  evaluate: (profile: ApplicantProfile, lang: SupportedLanguage) => SchemeEvaluation;
}

const UI_TRANSLATIONS: Record<
  SupportedLanguage,
  {
    title: string;
    subtitle: string;
    badge: string;
    showProfile: string;
    hideProfile: string;
    profileTitle: string;
    profileSubtext: string;
    kpiMatched: string;
    kpiMaxSubsidy: string;
    kpiCredit: string;
    kpiProfile: string;
    genderLabel: string;
    femaleOpt: string;
    maleOpt: string;
    otherOpt: string;
    socialCatLabel: string;
    generalOpt: string;
    obcOpt: string;
    scOpt: string;
    stOpt: string;
    minorityOpt: string;
    locationLabel: string;
    ruralOpt: string;
    semiUrbanOpt: string;
    urbanOpt: string;
    stateLabel: string;
    sectorLabel: string;
    secAgri: string;
    secFood: string;
    secHandloom: string;
    secStreet: string;
    secRetail: string;
    secDairy: string;
    secMfg: string;
    secServices: string;
    loanLabel: string;
    catAll: string;
    catMudra: string;
    catPmegp: string;
    catStreet: string;
    catArtisan: string;
    catFood: string;
    catWomenScSt: string;
    catAgri: string;
    eligibleTag: string;
    partiallyEligibleTag: string;
    ineligibleTag: string;
    sanctionRange: string;
    subsidyBenefit: string;
    interestRate: string;
    collateralRequired: string;
    collateralNo: string;
    collateralYes: string;
    matchedReasonsTitle: string;
    showMore: (count: number) => string;
    showLess: string;
    reqDocsTitle: string;
    recTitle: string;
    targetTitle: string;
    applyBtn: (portal: string) => string;
    modalTitle: (portal: string) => string;
    modalSub: (portal: string) => string;
    summaryTitle: string;
    applicantLabel: string;
    dossierDocsTitle: string;
    cancelBtn: string;
    generateDossierBtn: (portal: string) => string;
    successTitle: string;
    successDesc: (portal: string) => string;
    openOfficialPortalBtn: (portal: string) => string;
    dossierRefLabel: string;
    dossierStatusReady: string;
    portalRedirectNote: (portal: string) => string;
    copyDossierBtn: string;
    dossierCopied: string;
    liveSyncTitle: string;
    liveSyncBadge: string;
    syncingBtn: string;
    syncNowBtn: string;
    lastSyncLabel: string;
    verifiedPolicySource: string;
    policyHighlightsTitle: string;
    backToKhata: string;
    close: string;
  }
> = {
  hi: {
    title: 'सरकारी योजना एवं सब्सिडी मैचिंग इंजन',
    subtitle: 'आपके प्रोफ़ाइल (लिंग, स्थान, जाति वर्ग, व्यापार व बहीखाता) के आधार पर सटीक पात्रता व सब्सिडी गणना',
    badge: 'जन समर्थ पोर्टल एकीकृत',
    showProfile: 'प्रोफ़ाइल नियम बदलें',
    hideProfile: 'प्रोफ़ाइल छुपाएं',
    profileTitle: 'लाइव योजना मिलान प्रोफ़ाइल (Jan Samarth Matcher)',
    profileSubtext: 'इन विकल्पों को बदलने पर सभी योजनाओं की सब्सिडी स्वतः पुनः परिकलित होती है',
    kpiMatched: 'पात्र सरकारी योजनाएं',
    kpiMaxSubsidy: 'अधिकतम उपलब्ध पूंजीगत सब्सिडी',
    kpiCredit: 'सक्रिय क्रेडिट मूल्यांकन',
    kpiProfile: 'स्थान व व्यापार प्रोफ़ाइल',
    genderLabel: 'लिंग',
    femaleOpt: 'महिला (35% PMEGP / स्टैंड-अप)',
    maleOpt: 'पुरुष',
    otherOpt: 'अन्य / ट्रांसजेंडर',
    socialCatLabel: 'सामाजिक श्रेणी',
    generalOpt: 'सामान्य (General)',
    obcOpt: 'ओबीसी (OBC विशेष श्रेणी)',
    scOpt: 'अनुसूचित जाति (SC)',
    stOpt: 'अनुसूचित जनजाति (ST)',
    minorityOpt: 'अल्पसंख्यक (Minority)',
    locationLabel: 'स्थान प्रकार',
    ruralOpt: 'ग्रामीण (35% अधिकतम सब्सिडी)',
    semiUrbanOpt: 'अर्ध-शहरी (Semi-Urban)',
    urbanOpt: 'शहरी (25% अधिकतम सब्सिडी)',
    stateLabel: 'राज्य',
    sectorLabel: 'व्यापार / गतिविधि क्षेत्र',
    secAgri: 'कृषि एवं संबद्ध / खाद-बीज',
    secFood: 'खाद्य प्रसंस्करण / चक्की / तेल मिल',
    secHandloom: 'हथकरघा व दस्तकारी (विश्वकर्मा)',
    secStreet: 'स्ट्रीट वेंडर / ठेला / पटरी (स्वनिधि)',
    secRetail: 'किराना दुकान / खुदरा व्यापार',
    secDairy: 'डेयरी व पशुपालन',
    secMfg: 'लघु विनिर्माण / कारखाना',
    secServices: 'सेवाएं / मरम्मत की दुकान',
    loanLabel: 'वांछित ऋण राशि',
    catAll: 'सभी योजनाएं',
    catMudra: 'मुद्रा योजना (शिशु व किशोर)',
    catPmegp: 'PMEGP (35% तक सब्सिडी)',
    catStreet: 'पीएम स्वनिधि (स्ट्रीट वेंडर)',
    catArtisan: 'पीएम विश्वकर्मा (कारीगर)',
    catFood: 'PMFME (खाद्य प्रसंस्करण)',
    catWomenScSt: 'स्टैंड-अप इंडिया (महिला/SC/ST)',
    catAgri: 'नाबार्ड SHG लिंकेज',
    eligibleTag: 'पात्र (Eligible)',
    partiallyEligibleTag: 'आंशिक पात्र (Partially Eligible)',
    ineligibleTag: 'अपात्र (Ineligible)',
    sanctionRange: 'ऋण स्वीकृति सीमा',
    subsidyBenefit: 'सरकारी सब्सिडी / लाभ',
    interestRate: 'वार्षिक ब्याज दर',
    collateralRequired: 'जमानत / बंधक आवश्यक?',
    collateralNo: 'नहीं (100% बंधक-मुक्त)',
    collateralYes: 'सामान्य एमएसएमई मार्जिन',
    matchedReasonsTitle: 'सत्यापित पात्रता एवं नियम मिलान:',
    showMore: (count) => `+ ${count} अन्य शर्तें एवं दस्तावेज देखें`,
    showLess: 'कम दिखाएं',
    reqDocsTitle: 'आवश्यक दस्तावेज:',
    recTitle: 'विशेष परामर्श: ',
    targetTitle: 'लक्षित लाभार्थी:',
    applyBtn: (portal) => `${portal} पर आवेदन करें`,
    modalTitle: (portal) => `${portal} डिजिटल आवेदन गेटवे`,
    modalSub: (portal) => `${portal} ऋण एवं सब्सिडी डोजियर पैकेजिंग`,
    summaryTitle: 'आवेदक प्रोफाइल सारांश:',
    applicantLabel: 'आवेदक:',
    dossierDocsTitle: 'डोजियर हेतु संलग्न दस्तावेज:',
    cancelBtn: 'रद्द करें',
    generateDossierBtn: (portal) => `${portal} डिजिटल डोजियर तैयार करें`,
    successTitle: 'डिजिटल डोजियर सफलतापूर्वक तैयार!',
    successDesc: (portal) => `आपकी बहीखाता रिपोर्ट और क्रेडिट स्कोर को ${portal} हेतु पैकेज कर दिया गया है।`,
    openOfficialPortalBtn: (portal) => `${portal} आधिकारिक पोर्टल खोलें एवं आवेदन करें`,
    dossierRefLabel: 'डोजियर संदर्भ संख्या',
    dossierStatusReady: 'दस्तावेज एवं बहीखाता विवरण संलग्न',
    portalRedirectNote: (portal) => `आपका डिजिटल डोजियर पैकेज तैयार है। अब ${portal} की आधिकारिक वेबसाइट पर जाकर आवेदन पूरा करें।`,
    copyDossierBtn: 'पूर्ण डोजियर विवरण कॉपी करें',
    dossierCopied: 'डोजियर कॉपी हो गया!',
    liveSyncTitle: 'सरकारी योजना नीति लाइव सिंक',
    liveSyncBadge: 'डीएफएस व जन समर्थ खुला पोर्टल',
    syncNowBtn: 'सरकारी पोर्टल से लाइव सिंक करें',
    syncingBtn: 'सिंक हो रहा है...',
    lastSyncLabel: 'अंतिम नीति सत्यापन',
    verifiedPolicySource: 'आधिकारिक गजट व सर्कुलर डेटा',
    policyHighlightsTitle: 'लाइव सरकारी सर्कुलर अपडेट:',
    backToKhata: '← बहीखाता पर लौटें',
    close: 'बंद करें'
  },
  mr: {
    title: 'सरकारी योजना व सबसिडी मॅचिंग इंजिन',
    subtitle: 'तुमचे प्रोफाइल (लिंग, पत्ता, जात प्रवर्ग आणि बहीखाता रोख प्रवाह) नुसार अचूक पात्रता व सबसिडी गणना',
    badge: 'जन समर्थ पोर्टल एकात्मिक',
    showProfile: 'प्रोफाइल नियम बदला',
    hideProfile: 'प्रोफाइल लपवा',
    profileTitle: 'थेट योजना पडताळणी प्रोफाइल (Jan Samarth Matcher)',
    profileSubtext: 'पर्याय बदलल्यास सर्व योजनांची सबसिडी तात्काळ पुन्हा मोजली जाते',
    kpiMatched: 'पात्र सरकारी योजना',
    kpiMaxSubsidy: 'कमाल उपलब्ध भांडवली सबसिडी',
    kpiCredit: 'सक्रिय क्रेडिट मूल्यांकन',
    kpiProfile: 'स्थान व व्यवसाय प्रोफाइल',
    genderLabel: 'लिंग',
    femaleOpt: 'महिला (35% PMEGP / स्टँड-अप)',
    maleOpt: 'पुरुष',
    otherOpt: 'इतर / तृतीयपंथी',
    socialCatLabel: 'सामाजिक प्रवर्ग',
    generalOpt: 'खुला प्रवर्ग (General)',
    obcOpt: 'इतर मागासवर्गीय (OBC)',
    scOpt: 'अनुसूचित जाती (SC)',
    stOpt: 'अनुसूचित जमाती (ST)',
    minorityOpt: 'अल्पसंख्याक (Minority)',
    locationLabel: 'स्थान',
    ruralOpt: 'ग्रामीण (35% कमाल सबसिडी)',
    semiUrbanOpt: 'निमशहरी (Semi-Urban)',
    urbanOpt: 'शहरी (25% कमाल सबसिडी)',
    stateLabel: 'राज्य',
    sectorLabel: 'व्यवसाय क्षेत्र',
    secAgri: 'कृषी व संलग्न / खते-बियाणे',
    secFood: 'अन्न प्रक्रिया / गिरणी / तेल गिरणी',
    secHandloom: 'हातमाग व कारागीर (विश्वकर्मा)',
    secStreet: 'फेरीवाले / हातगाडी (स्वनिधी)',
    secRetail: 'किराणा दुकान / किरकोळ व्यापार',
    secDairy: 'डेअरी व पशुपालन',
    secMfg: 'लघु उद्योग / उत्पादन',
    secServices: 'सेवा / दुरुस्ती दुकान',
    loanLabel: 'कर्ज मागणी रक्कम',
    catAll: 'सर्व योजना',
    catMudra: 'मुद्रा योजना (शिशू व किशोर)',
    catPmegp: 'PMEGP (35% पर्यंत सबसिडी)',
    catStreet: 'पीएम स्वनिधी (फेरीवाले)',
    catArtisan: 'पीएम विश्वकर्मा (कारागीर)',
    catFood: 'PMFME (अन्न प्रक्रिया)',
    catWomenScSt: 'स्टँड-अप इंडिया (महिला/SC/ST)',
    catAgri: 'नाबार्ड SHG लिंकेज',
    eligibleTag: 'पात्र (Eligible)',
    partiallyEligibleTag: 'अंशतः पात्र (Partially Eligible)',
    ineligibleTag: 'अपात्र (Ineligible)',
    sanctionRange: 'कर्ज मर्यादा',
    subsidyBenefit: 'सरकारी सबसिडी / लाभ',
    interestRate: 'वार्षिक व्याजदर',
    collateralRequired: 'तारण / जामीन आवश्यक?',
    collateralNo: 'नाही (100% विनातारण)',
    collateralYes: 'नियमित MSME मार्जिन',
    matchedReasonsTitle: 'तपासलेली पात्रता व नियम:',
    showMore: (count) => `+ ${count} अधिक अटी व कागदपत्रे पहा`,
    showLess: 'कमी दाखवा',
    reqDocsTitle: 'आवश्यक कागदपत्रे:',
    recTitle: 'सल्ला: ',
    targetTitle: 'लक्षित लाभार्थी:',
    applyBtn: (portal) => `${portal} वर अर्ज करा`,
    modalTitle: (portal) => `${portal} डिजिटल अर्ज गेटवे`,
    modalSub: (portal) => `${portal} कर्ज व सबसिडी फाइल निर्मिती`,
    summaryTitle: 'अर्जदार तपशील:',
    applicantLabel: 'अर्जदार:',
    dossierDocsTitle: 'फाइलसाठी कागदपत्रे:',
    cancelBtn: 'रद्द करा',
    generateDossierBtn: (portal) => `${portal} डिजिटल फाइल तयार करा`,
    successTitle: 'डिजिटल फाइल यशस्वीरित्या तयार!',
    successDesc: (portal) => `तुमचा बहीखाता अहवाल आणि क्रेडिट स्कोअर ${portal} साठी तयार झाला आहे.`,
    openOfficialPortalBtn: (portal) => `${portal} अधिकृत पोर्टल उघडा आणि अर्ज करा`,
    dossierRefLabel: 'फाइल संदर्भ क्रमांक',
    dossierStatusReady: 'कागदपत्रे आणि खातेवही अहवाल संलग्न',
    portalRedirectNote: (portal) => `तुमची डिजिटल फाइल तयार आहे. आता ${portal} च्या अधिकृत संकेतस्थळावर जाऊन अर्ज पूर्ण करा.`,
    copyDossierBtn: 'संपूर्ण फाइल तपशील कॉपी करा',
    dossierCopied: 'फाइल कॉपी झाली!',
    liveSyncTitle: 'सरकारी योजना थेट सिंक',
    liveSyncBadge: 'DFS व जन समर्थ अधिकृत पोर्टल',
    syncNowBtn: 'सरकारी पोर्टलवरून थेट सिंक करा',
    syncingBtn: 'सिंक होत आहे...',
    lastSyncLabel: 'शेवटची पडताळणी',
    verifiedPolicySource: 'अधिकृत सरकारी परिपत्रक',
    policyHighlightsTitle: 'थेट सरकारी परिपत्रक अपडेट:',
    backToKhata: '← खातेवहीवर परत जा',
    close: 'बंद करा'
  },
  te: {
    title: 'ప్రభుత్వ పథకాలు & రాయితీ మ్యాచింగ్ ఇంజిన్',
    subtitle: 'మీ ప్రొఫైల్ (లింగం, ప్రాంతం, సామాజిక వర్గం, వ్యాపార రంగం) ఆధారంగా కచ్చితమైన అర్హత మరియు సబ్సిడీ లెక్కింపు',
    badge: 'జన్ సమర్థ్ పోర్టల్ అనుసంధానం',
    showProfile: 'ప్రొఫైల్ మార్చండి',
    hideProfile: 'ప్రొఫైల్ దాచండి',
    profileTitle: 'లైవ్ పథకం సరిపోలిక ప్రొఫైల్ (Jan Samarth Matcher)',
    profileSubtext: 'ఈ వివరాలు మార్చగానే అన్ని పథకాల సబ్సిడీలు తక్షణమే తిరిగి లెక్కించబడతాయి',
    kpiMatched: 'అర్హత కలిగిన ప్రభుత్వ పథకాలు',
    kpiMaxSubsidy: 'గరిష్ట అందుబాటులో ఉన్న మూలధన సబ్సిడీ',
    kpiCredit: 'క్రియాశీల క్రెడిట్ స్కోరు',
    kpiProfile: 'ప్రాంతం & రంగ ప్రొఫైల్',
    genderLabel: 'లింగం',
    femaleOpt: 'మహిళ (35% PMEGP / స్టాండ్-అప్)',
    maleOpt: 'పురుషుడు',
    otherOpt: 'ఇతర',
    socialCatLabel: 'సామాజిక వర్గం',
    generalOpt: 'జనరల్ (General)',
    obcOpt: 'బీసీ (OBC ప్రత్యేక వర్గం)',
    scOpt: 'ఎస్సీ (SC)',
    stOpt: 'ఎస్టీ (ST)',
    minorityOpt: 'మైనారిటీ (Minority)',
    locationLabel: 'ప్రాంతం',
    ruralOpt: 'గ్రామీణ (35% గరిష్ట సబ్సిడీ)',
    semiUrbanOpt: 'సెమీ-అర్బన్ (Semi-Urban)',
    urbanOpt: 'పట్టణ (25% గరిష్ట సబ్సిడీ)',
    stateLabel: 'రాష్ట్రం',
    sectorLabel: 'వ్యాపార రంగం / వృత్తి',
    secAgri: 'వ్యవసాయం & అనుబంధ / ఎరువులు-విత్తనాలు',
    secFood: 'ఫుడ్ ప్రాసెసింగ్ / పిండి మిల్లు / ఆయిల్ మిల్లు',
    secHandloom: 'చేనేత & చేతివృత్తులు (విశ్వకర్మ)',
    secStreet: 'వీధి వ్యాపారులు / తోపుడు బండ్లు (స్వనిధి)',
    secRetail: 'కిరాణా దుకాణం / రిటైల్ వ్యాపారం',
    secDairy: 'డైరీ & పాడి పరిశ్రమ',
    secMfg: 'చిన్న తరహా తయారీ పరిశ్రమ',
    secServices: 'సేవలు / రిపేర్ సెంటర్',
    loanLabel: 'కావలసిన రుణ మొత్తం',
    catAll: 'అన్ని పథకాలు',
    catMudra: 'ముద్రా యోజన (శిశు & కిశోర్)',
    catPmegp: 'PMEGP (35% వరకు సబ్సిడీ)',
    catStreet: 'పీఎం స్వనిధి (వీధి వ్యాపారులు)',
    catArtisan: 'పీఎం విశ్వకర్మ (చేతివృత్తులు)',
    catFood: 'PMFME (ఫుడ్ ప్రాసెసింగ్)',
    catWomenScSt: 'స్టాండ్-అప్ ఇండియా (మహిళలు/SC/ST)',
    catAgri: 'నాబార్డ్ SHG లింకేజ్',
    eligibleTag: 'అర్హులు (Eligible)',
    partiallyEligibleTag: 'పాక్షిక అర్హత (Partially Eligible)',
    ineligibleTag: 'అనర్హులు (Ineligible)',
    sanctionRange: 'రుణ పరిమితి',
    subsidyBenefit: 'ప్రభుత్వ సబ్సిడీ / ప్రయోజనం',
    interestRate: 'వార్షిక వడ్డీ రేటు',
    collateralRequired: 'తనఖా / పూచీకత్తు అవసరమా?',
    collateralNo: 'అవసరం లేదు (100% షూరిటీ లేని రుణం)',
    collateralYes: 'సాధారణ MSME మార్జిన్',
    matchedReasonsTitle: 'సరిపోలిన అర్హత కారణాలు:',
    showMore: (count) => `+ మరిన్ని ${count} నిబంధనలు & పత్రాలు చూడండి`,
    showLess: 'తక్కువ చూపించు',
    reqDocsTitle: 'కావలసిన పత్రాలు:',
    recTitle: 'సిఫార్సు: ',
    targetTitle: 'లబ్ధిదారులు:',
    applyBtn: (portal) => `${portal} లో దరఖాస్తు చేసుకోండి`,
    modalTitle: (portal) => `${portal} డిజిటల్ అప్లికేషన్ గేట్‌వే`,
    modalSub: (portal) => `${portal} రుణం & సబ్సిడీ దస్త్రం తయారీ`,
    summaryTitle: 'దరఖాస్తుదారు సారాంశం:',
    applicantLabel: 'దరఖాస్తుదారు:',
    dossierDocsTitle: 'అవసరమైన పత్రాలు:',
    cancelBtn: 'రద్దు చేయండి',
    generateDossierBtn: (portal) => `${portal} దస్త్రం సిద్ధం చేయండి`,
    successTitle: 'డిజిటల్ దస్త్రం సిద్ధమైంది!',
    successDesc: (portal) => `మీ ఖాటా నివేదిక మరియు క్రెడిట్ స్కోరు ${portal} దరఖాస్తుకు సిద్ధంగా ఉన్నాయి.`,
    openOfficialPortalBtn: (portal) => `${portal} అధికారిక పోర్టల్‌ను తెరవండి`,
    dossierRefLabel: 'దస్త్రం రిఫరెన్స్ సంఖ్య',
    dossierStatusReady: 'ఖాతా వివరాలు & క్రెడిట్ స్కోరు జతచేయబడ్డాయి',
    portalRedirectNote: (portal) => `మీ డిజిటల్ దస్త్రం సిద్ధమైంది. దరఖాస్తును పూర్తి చేయడానికి ${portal} అధికారిక వెబ్‌సైట్‌కు వెళ్ళండి.`,
    copyDossierBtn: 'పూర్తి దస్త్రం వివరాలను కాపీ చేయండి',
    dossierCopied: 'దస్త్రం కాపీ చేయబడింది!',
    liveSyncTitle: 'ప్రభుత్వ పథకాల లైవ్ సింక్',
    liveSyncBadge: 'DFS & జన్ సమర్థ్ ఓపెన్ పోర్టల్',
    syncNowBtn: 'పోర్టల్ నుండి లైవ్ సింక్ చేయండి',
    syncingBtn: 'సింక్ అవుతోంది...',
    lastSyncLabel: 'చివరి ధృవీకరణ',
    verifiedPolicySource: 'అధికారిక గెజిట్ & సర్క్యులర్',
    policyHighlightsTitle: 'లైవ్ ప్రభుత్వ సర్క్యులర్ అప్‌డేట్‌లు:',
    backToKhata: '← ఖాతాకు తిరిగి వెళ్లండి',
    close: 'మూసివేయి'
  },
  ta: {
    title: 'அரசு திட்டங்கள் & மானிய பொருத்தம் இயந்திரம்',
    subtitle: 'உங்கள் சுயவிவரம் (பாலினம், இடம், சமூக பிரிவு, தொழில்) அடிப்படையில் தகுதி மற்றும் மானிய கணக்கீடு',
    badge: 'ஜன் சமர்த் தளம் ஒருங்கிணைக்கப்பட்டது',
    showProfile: 'சுயவிவரத்தை மாற்று',
    hideProfile: 'சுயவிவரத்தை மறை',
    profileTitle: 'நேரடி திட்ட தகுதி சரிபார்ப்பு (Jan Samarth Matcher)',
    profileSubtext: 'இவற்றை மாற்றும்போது அனைத்து திட்ட மானியங்களும் உடனுக்குடன் கணக்கிடப்படும்',
    kpiMatched: 'தகுதியான அரசு திட்டங்கள்',
    kpiMaxSubsidy: 'கிடைக்கும் அதிகபட்ச மூலதன மானியம்',
    kpiCredit: 'செயலில் உள்ள கிரெடிட் ஸ்கோர்',
    kpiProfile: 'இருப்பிடம் & தொழில் விவரம்',
    genderLabel: 'பாலினம்',
    femaleOpt: 'பெண் (35% PMEGP / ஸ்டாண்ட்-அப்)',
    maleOpt: 'ஆண்',
    otherOpt: 'மற்றவை',
    socialCatLabel: 'சமூக பிரிவு',
    generalOpt: 'பொது பிரிவு (General)',
    obcOpt: 'பிற்படுத்தப்பட்டோர் (OBC)',
    scOpt: 'ஆதிதிராவிடர் (SC)',
    stOpt: 'பழங்குடியினர் (ST)',
    minorityOpt: 'சிறுபான்மையினர் (Minority)',
    locationLabel: 'இருப்பிடம்',
    ruralOpt: 'கிராமப்புறம் (35% அதிகபட்ச மானியம்)',
    semiUrbanOpt: 'அரை நகர்ப்புறம் (Semi-Urban)',
    urbanOpt: 'நகர்ப்புறம் (25% அதிகபட்ச மானியம்)',
    stateLabel: 'மாநிலம்',
    sectorLabel: 'தொழில் துறை',
    secAgri: 'விவசாயம் & உரம்/விதை விற்பனை',
    secFood: 'உணவு பதப்படுத்துதல் / மாவு மில்',
    secHandloom: 'கைத்தறி & கைவினைஞர்கள் (விஸ்வகர்மா)',
    secStreet: 'தெருவோர வியாபாரிகள் (ஸ்வநிதி)',
    secRetail: 'மளிகை கடை / சில்லறை வணிகம்',
    secDairy: 'பால் பண்ணை & கால்நடை',
    secMfg: 'சிறு உற்பத்தி தொழில்',
    secServices: 'சேவைகள் / பழுதுபார்க்கும் கடை',
    loanLabel: 'தேவையான கடன் தொகை',
    catAll: 'அனைத்து திட்டங்கள்',
    catMudra: 'முத்ரா திட்டம் (ஷிஷு & Kishore)',
    catPmegp: 'PMEGP (35% வரை மானியம்)',
    catStreet: 'பிஎம் ஸ்வநிதி (தெருவோர வியாபாரி)',
    catArtisan: 'பிஎம் விஸ்வகர்மா (கைவினைஞர்)',
    catFood: 'PMFME (உணவு பதப்படுத்துதல்)',
    catWomenScSt: 'ஸ்டாண்ட்-அப் இந்தியா (பெண்கள்/SC/ST)',
    catAgri: 'நபார்டு SHG இணைப்பு',
    eligibleTag: 'தகுதி உண்டு (Eligible)',
    partiallyEligibleTag: 'பகுதி தகுதி (Partially Eligible)',
    ineligibleTag: 'தகுதி இல்லை (Ineligible)',
    sanctionRange: 'கடன் உச்சவரம்பு',
    subsidyBenefit: 'அரசு மானியம் / நன்மை',
    interestRate: 'ஆண்டு வட்டி விகிதம்',
    collateralRequired: 'பிணையம் / அடமானம் தேவையா?',
    collateralNo: 'தேவையில்லை (100% பிணையமற்ற கடன்)',
    collateralYes: 'வழக்கமான MSME மார்ஜின்',
    matchedReasonsTitle: 'பொருந்திய தகுதி காரணங்கள்:',
    showMore: (count) => `+ மேலும் ${count} நிபந்தனைகளை காண்க`,
    showLess: 'குறைவாக காட்டு',
    reqDocsTitle: 'தேவையான ஆவணங்கள்:',
    recTitle: 'பரிந்துரை: ',
    targetTitle: 'பயனாளிகள்:',
    applyBtn: (portal) => `${portal} தளத்தில் விண்ணப்பிக்கவும்`,
    modalTitle: (portal) => `${portal} டிஜிட்டல் விண்ணப்ப வாயில்`,
    modalSub: (portal) => `${portal} கடன் மற்றும் மானிய ஆவண தயாரிப்பு`,
    summaryTitle: 'விண்ணப்பதாரர் விவரம்:',
    applicantLabel: 'விண்ணப்பதாரர்:',
    dossierDocsTitle: 'தேவையான ஆவணங்கள்:',
    cancelBtn: 'ரத்து செய்',
    generateDossierBtn: (portal) => `${portal} ஆவணத்தை உருவாக்கவும்`,
    successTitle: 'டிஜிட்டல் ஆவணம் தயார்!',
    successDesc: (portal) => `உங்கள் கணக்கு அறிக்கை மற்றும் கடன் மதிப்பெண் ${portal} விண்ணப்பத்திற்கு தயாராக உள்ளது.`,
    openOfficialPortalBtn: (portal) => `${portal} அதிகாரப்பூர்வ போர்ட்டலைத் திறந்து விண்ணப்பிக்கவும்`,
    dossierRefLabel: 'ஆவண குறிப்பு எண்',
    dossierStatusReady: 'கணக்கு அறிக்கை & கடன் மதிப்பீடு இணைக்கப்பட்டது',
    portalRedirectNote: (portal) => `உங்கள் டிஜிட்டல் ஆவணம் தயாராக உள்ளது. ${portal} அதிகாரப்பூர்வ தளத்திற்கு சென்று விண்ணப்பத்தை முடிக்கவும்.`,
    copyDossierBtn: 'முழு ஆவண விவரங்களை நகலெடு',
    dossierCopied: 'ஆவணம் நகலெடுக்கப்பட்டது!',
    liveSyncTitle: 'அரசு திட்டங்கள் நேரடி இணைப்பு',
    liveSyncBadge: 'DFS & ஜன் சமர்த் திறந்த தளம்',
    syncNowBtn: 'அரசு தளத்துடன் நேரடி ஒத்திசைவு',
    syncingBtn: 'ஒத்திசைக்கப்படுகிறது...',
    lastSyncLabel: 'கடைசி சரிபார்ப்பு',
    verifiedPolicySource: 'அதிகாரப்பூர்வ அரசு அறிவிக்கை',
    policyHighlightsTitle: 'அரசு சுற்றறிக்கை புதுப்பிப்புகள்:',
    backToKhata: '← கணக்குக்கு திரும்பு',
    close: 'மூடு'
  },
  bn: {
    title: 'সরকারি প্রকল্প ও ভর্তুকি ম্যাচিং ইঞ্জিন',
    subtitle: 'আপনার প্রোফাইল (লিঙ্গ, অবস্থান, সামাজিক বিভাগ ও খাতা লেনদেন) অনুযায়ী সঠিক যোগ্যতা ও ভর্তুকি হিসাব',
    badge: 'জন সমর্থ পোর্টাল ইন্টিগ্রেটেড',
    showProfile: 'প্রোফাইল পরিবর্তন করুন',
    hideProfile: 'প্রোফাইল লুকান',
    profileTitle: 'লাইভ প্রকল্প ম্যাচিং প্রোফাইল (Jan Samarth Matcher)',
    profileSubtext: 'এই বিকল্পগুলি পরিবর্তন করলে সমস্ত প্রকল্পের ভর্তুকি সাথে সাথে পুনঃগণনা করা হয়',
    kpiMatched: 'যোগ্য সরকারি প্রকল্প',
    kpiMaxSubsidy: 'সর্বোচ্চ উপলব্ধ মূলধন ভর্তুকি',
    kpiCredit: 'সক্রিয় ক্রেডিট মূল্যায়ন',
    kpiProfile: 'অবস্থান ও ব্যবসা প্রোফাইল',
    genderLabel: 'লিঙ্গ',
    femaleOpt: 'মহিলা (35% PMEGP / স্ট্যান্ড-আপ)',
    maleOpt: 'পুরুষ',
    otherOpt: 'অন্যান্য / তৃতীয় লিঙ্গ',
    socialCatLabel: 'সামাজিক বিভাগ',
    generalOpt: 'সাধারণ (General)',
    obcOpt: 'ওবিসি (OBC বিশেষ বিভাগ)',
    scOpt: 'তপশিলি জাতি (SC)',
    stOpt: 'তপশিলি উপজাতি (ST)',
    minorityOpt: 'সংখ্যালঘু (Minority)',
    locationLabel: 'অবস্থান',
    ruralOpt: 'গ্রামীণ (35% সর্বোচ্চ ভর্তুকি)',
    semiUrbanOpt: 'আধা-শহুরে (Semi-Urban)',
    urbanOpt: 'শহুরে (25% সর্বোচ্চ ভর্তুকি)',
    stateLabel: 'রাজ্য',
    sectorLabel: 'ব্যবসা খাত / কার্যক্রম',
    secAgri: 'কৃষি ও সহযোগী / সার-বীজ',
    secFood: 'খাদ্য প্রক্রিয়াকরণ / চাকি / তেল মিল',
    secHandloom: 'তাঁত ও হস্তশিল্প (বিশ্বকর্মা)',
    secStreet: 'হকার / ঠেলাগাড়ি বিক্রেতা (স্বনিধি)',
    secRetail: 'মুদি দোকান / খুচরা ব্যবসা',
    secDairy: 'ডেইরি ও পশুপালন',
    secMfg: 'ক্ষুদ্র উৎপাদন শিল্প',
    secServices: 'পরিষেবা / মেরামতের দোকান',
    loanLabel: 'কাঙ্ক্ষিত ঋণের পরিমাণ',
    catAll: 'সমস্ত প্রকল্প',
    catMudra: 'মুদ্রা যোজনা (শিশু ও কিশোর)',
    catPmegp: 'PMEGP (35% পর্যন্ত ভর্তুকি)',
    catStreet: 'পিএম স্বনিধি (রাস্তার বিক্রেতা)',
    catArtisan: 'পিএম বিশ্বকর্মা (কারিগর)',
    catFood: 'PMFME (খাদ্য প্রক্রিয়াকরণ)',
    catWomenScSt: 'স্ট্যান্ড-আপ ইন্ডিয়া (মহিলা/SC/ST)',
    catAgri: 'নাবার্ড SHG লিঙ্কেজ',
    eligibleTag: 'যোগ্য (Eligible)',
    partiallyEligibleTag: 'আংশিক যোগ্য (Partially Eligible)',
    ineligibleTag: 'অযোগ্য (Ineligible)',
    sanctionRange: 'ঋণের সীমা',
    subsidyBenefit: 'সরকারি ভর্তুকি / সুবিধা',
    interestRate: 'বার্ষিক সুদের হার',
    collateralRequired: 'জামানত / বন্ধক প্রয়োজন?',
    collateralNo: 'না (100% জামানতমুক্ত ঋণ)',
    collateralYes: 'স্বাভাবিক MSME মার্জিন',
    matchedReasonsTitle: 'যাচাইকৃত যোগ্যতার কারণসমূহ:',
    showMore: (count) => `+ আরও ${count}টি শর্ত ও নথিপত্র দেখুন`,
    showLess: 'কম দেখান',
    reqDocsTitle: 'প্রয়োজনীয় নথিপত্র:',
    recTitle: 'পরামর্শ: ',
    targetTitle: 'উদ্দিষ্ট সুবিধাভোগী:',
    applyBtn: (portal) => `${portal}-এ আবেদন করুন`,
    modalTitle: (portal) => `${portal} ডিজিটাল আবেদন গেটওয়ে`,
    modalSub: (portal) => `${portal} ঋণ ও ভর্তুকি নথি প্রস্তুতি`,
    summaryTitle: 'আবেদনকারীর সংক্ষিপ্ত বিবরণ:',
    applicantLabel: 'আবেদনকারী:',
    dossierDocsTitle: 'প্রয়োজনীয় নথিসমূহ:',
    cancelBtn: 'বাতিল করুন',
    generateDossierBtn: (portal) => `${portal} ডিজিটাল নথি তৈরি করুন`,
    successTitle: 'ডিজিটাল নথি সফলভাবে প্রস্তুত!',
    successDesc: (portal) => `আপনার খাতা রিপোর্ট এবং ক্রেডিট স্কোর ${portal} আবেদনের জন্য প্রস্তুত।`,
    openOfficialPortalBtn: (portal) => `${portal} অফিশিয়াল পোর্টাল খুলুন ও আবেদন করুন`,
    dossierRefLabel: 'নথি রেফারেন্স নম্বর',
    dossierStatusReady: 'খাতা বিবরণী এবং ক্রেডিট মূল্যায়ন সংযুক্ত',
    portalRedirectNote: (portal) => `আপনার ডিজিটাল নথি প্যাকেজ প্রস্তুত। এখন ${portal} অফিশিয়াল ওয়েবসাইটে গিয়ে আবেদন সম্পূর্ণ করুন।`,
    copyDossierBtn: 'সম্পূর্ণ নথি বিবরণ কপি করুন',
    dossierCopied: 'নথি কপি হয়েছে!',
    liveSyncTitle: 'সরকারি স্কিম লাইভ সিঙ্ক',
    liveSyncBadge: 'DFS এবং জন সমর্থ পোর্টাল',
    syncNowBtn: 'সরকারি পোর্টালের সাথে সিঙ্ক করুন',
    syncingBtn: 'সিঙ্ক হচ্ছে...',
    lastSyncLabel: 'সর্বশেষ যাচাইকরণ',
    verifiedPolicySource: 'অফিশিয়াল সরকারি বিজ্ঞপ্তি',
    policyHighlightsTitle: 'লাইভ সরকারি সার্কুলার আপডেট:',
    backToKhata: '← খাতায় ফিরে যান',
    close: 'বন্ধ করুন'
  },
  en: {
    title: 'Govt Schemes & Subsidies Matching Engine',
    subtitle: 'Cross-references applicant profile (gender, location, category & khata cashflow) with central/state rules',
    badge: 'Jan Samarth Integrated',
    showProfile: 'Customize Profile Rules',
    hideProfile: 'Hide Profile Engine',
    profileTitle: 'Live Scheme Cross-Referencing Profile (Jan Samarth Matcher)',
    profileSubtext: 'Altering these inputs re-calculates all scheme subsidies instantly',
    kpiMatched: 'Matched Eligible Schemes',
    kpiMaxSubsidy: 'Max Available Capital Subsidy',
    kpiCredit: 'Active Credit Appraisal',
    kpiProfile: 'Location & Sector Profile',
    genderLabel: 'Gender',
    femaleOpt: 'Female (35% PMEGP / Stand-Up)',
    maleOpt: 'Male',
    otherOpt: 'Transgender / Other',
    socialCatLabel: 'Social Category',
    generalOpt: 'General',
    obcOpt: 'OBC (Special Category)',
    scOpt: 'SC (Special Category)',
    stOpt: 'ST (Special Category)',
    minorityOpt: 'Minority (Special Category)',
    locationLabel: 'Location',
    ruralOpt: 'Rural (35% Max Subsidy)',
    semiUrbanOpt: 'Semi-Urban',
    urbanOpt: 'Urban (25% Max Subsidy)',
    stateLabel: 'State',
    sectorLabel: 'Business Activity / Sector',
    secAgri: 'Agri & Allied / Inputs',
    secFood: 'Food Processing / Mills',
    secHandloom: 'Handloom & Crafts (Vishwakarma)',
    secStreet: 'Street Vendor / Hawkers (SVANidhi)',
    secRetail: 'Kirana / Retail Shop',
    secDairy: 'Dairy & Poultry',
    secMfg: 'Small Manufacturing',
    secServices: 'Services / Repair Kiosk',
    loanLabel: 'Target Loan Request',
    catAll: 'All Matched Programs',
    catMudra: 'PM MUDRA (Shishu & Kishore)',
    catPmegp: 'PMEGP (Up to 35% Subsidy)',
    catStreet: 'PM SVANidhi (Street Vendors)',
    catArtisan: 'PM Vishwakarma (Artisans)',
    catFood: 'PMFME (Food Processing)',
    catWomenScSt: 'Stand-Up India (Women / SC-ST)',
    catAgri: 'NABARD SHG Linkage',
    eligibleTag: 'Eligible',
    partiallyEligibleTag: 'Partially Eligible',
    ineligibleTag: 'Ineligible',
    sanctionRange: 'Sanction Range',
    subsidyBenefit: 'Subsidy / Benefit',
    interestRate: 'Interest Rate',
    collateralRequired: 'Collateral Required?',
    collateralNo: 'No (100% Free)',
    collateralYes: 'Normal MSME Margin',
    matchedReasonsTitle: 'Cross-Referenced Match Reasons:',
    showMore: (count) => `+ View ${count} more criteria & documents`,
    showLess: 'Show Less',
    reqDocsTitle: 'Required Documents:',
    recTitle: 'Recommendation: ',
    targetTitle: 'Target: ',
    applyBtn: (portal) => `Apply on ${portal}`,
    modalTitle: (portal) => `${portal} Application Gateway`,
    modalSub: (portal) => `${portal} Loan & Subsidy Dossier Packaging`,
    summaryTitle: 'Cross-Referenced Applicant Summary:',
    applicantLabel: 'Applicant:',
    dossierDocsTitle: 'Required Dossier Documents:',
    cancelBtn: 'Cancel',
    generateDossierBtn: (portal) => `Generate ${portal} Dossier`,
    successTitle: 'Digital Dossier Prepared!',
    successDesc: (portal) => `Your digital ledger summary & alternative credit profile have been packaged for ${portal}.`,
    openOfficialPortalBtn: (portal) => `Open & Apply on ${portal} Portal`,
    dossierRefLabel: 'Dossier Reference ID',
    dossierStatusReady: 'Ledger Turnover & Credit Appraisal Attached',
    portalRedirectNote: (portal) => `Your digital application dossier is ready. Proceed to the official ${portal} website to submit your application.`,
    copyDossierBtn: 'Copy Full Dossier Summary',
    dossierCopied: 'Dossier Copied to Clipboard!',
    liveSyncTitle: 'Government Schemes Live Policy Sync',
    liveSyncBadge: 'Jan Samarth & DFS Open Data',
    syncNowBtn: 'Live Sync with Official Portals',
    syncingBtn: 'Syncing Official Circulars...',
    lastSyncLabel: 'Last Policy Verification',
    verifiedPolicySource: 'Official DFS & MSME Gazette Rails',
    policyHighlightsTitle: 'Live Policy Highlights:',
    backToKhata: '← Back to Khata',
    close: 'Close'
  }
};

const SCHEMES_DEFINITIONS: SchemeDefinition[] = [
  {
    id: 'pm-mudra-shishu',
    portal: 'Jan Samarth',
    portalUrl: 'https://www.jansamarth.in',
    categoryType: 'mudra',
    minLoan: 10000,
    maxLoan: 50000,
    localized: {
      hi: {
        name: 'प्रधानमंत्री मुद्रा योजना (शिशु ऋण)',
        description: 'छोटे व्यापारियों, पटरी विक्रेताओं, कारीगरों व नए सूक्ष्म उद्यमों हेतु आसान पूंजी ऋण।',
        targetAudience: 'किराना दुकान, फल-सब्जी विक्रेता, दर्जी, छोटे कारीगर',
        baseSubsidyText: '100% बंधक-मुक्त एवं शून्य प्रोसेसिंग शुल्क',
        interestRate: '8.5% - 10.5% वार्षिक',
        requiredDocs: ['आधार कार्ड', 'पैन कार्ड / फॉर्म 60', 'बैंक पासबुक (6 माह)', 'बहीखाता रिपोर्ट']
      },
      mr: {
        name: 'प्रधानमंत्री मुद्रा योजना (शिशू कर्ज)',
        description: 'लहान व्यावसायिक, भाजीपाला विक्रेते, कारागीर व नवीन सूक्ष्म व्यवसायांसाठी भांडवली कर्ज.',
        targetAudience: 'किराणा दुकान, फेरीवाले, शिंपी, छोटे कारागीर',
        baseSubsidyText: '100% विनातारण आणि शून्य प्रक्रिया शुल्क',
        interestRate: '8.5% - 10.5% वार्षिक',
        requiredDocs: ['आधार कार्ड', 'पॅन कार्ड / फॉर्म 60', 'बँक पासबुक (6 महिने)', 'खातेवही अहवाल']
      },
      te: {
        name: 'పీఎం ముద్రా యోజన (శిశు రుణం)',
        description: 'చిరు వ్యాపారులు, కూరగాయల విక్రేతలు, టైలర్లు మరియు సూక్ష్మ యూనిట్లకు సులభ మూలధనం.',
        targetAudience: 'కిరాణా దుకాణాలు, పండ్ల వ్యాపారులు, టైలరింగ్ షాపులు, చేతివృత్తులు',
        baseSubsidyText: '100% షూరిటీ లేని రుణం & సున్నా ప్రాసెసింగ్ ఫీజు',
        interestRate: '8.5% - 10.5% వార్షికం',
        requiredDocs: ['ఆధార్ కార్డు', 'పాన్ కార్డు / ఫారం 60', 'బ్యాంక్ పాస్‌బుక్ (6 నెలలు)', 'డిజిటల్ ఖాతా నివేదిక']
      },
      ta: {
        name: 'பிரதமர் முத்ரா திட்டம் (ஷிஷு கடன்)',
        description: 'சிறு வியாபாரிகள், காய்கறி விற்பனையாளர்கள் மற்றும் கைவினைஞர்களுக்கான தொடக்க கடன்.',
        targetAudience: 'மளிகை கடை, தள்ளுவண்டி வியாபாரி, தையல் கடை, சிறு உற்பத்தியாளர்கள்',
        baseSubsidyText: '100% பிணையமற்ற கடன் & பூஜ்ஜிய செயலாக்க கட்டணம்',
        interestRate: '8.5% - 10.5% ஆண்டுக்கு',
        requiredDocs: ['ஆதார் அட்டை', 'பான் கார்டு', 'வங்கி கணக்கு புத்தகம்', 'கணக்கு அறிக்கை']
      },
      bn: {
        name: 'প্রধানমন্ত্রী মুদ্রা যোজনা (শিশু ঋণ)',
        description: 'ক্ষুদ্র ব্যবসায়ী, সবজি বিক্রেতা, দর্জি ও কারিগরদের জন্য সহজে মূলধন ঋণ।',
        targetAudience: 'মুদি দোকান, ফল-সবজি বিক্রেতা, ছোট ওয়ার্কশপ, হস্তশিল্পী',
        baseSubsidyText: '100% জামানতমুক্ত এবং শূন্য প্রসেসিং ফি',
        interestRate: '8.5% - 10.5% বার্ষিক',
        requiredDocs: ['আধার কার্ড', 'প্যান কার্ড', 'ব্যাংক পাসবুক (৬ মাস)', 'খাতা বিবরণী']
      },
      en: {
        name: 'PM MUDRA Yojana (Shishu Tier)',
        description: 'Micro-credit designed for small vendors, kirana merchants, artisans, and budding rural micro-units requiring seed capital.',
        targetAudience: 'Small merchants, fruit/veg vendors, repair kiosks, tailors',
        baseSubsidyText: '100% Collateral-Free & Zero Processing Fee',
        interestRate: '8.5% - 10.5% p.a.',
        requiredDocs: ['Aadhaar Card', 'PAN / Form 60', 'Bank Passbook (6 mo)', 'Digital Khata Report']
      }
    },
    evaluate: (p, lang) => {
      const matched: string[] = [];
      const unmet: string[] = [];
      let score = 70;

      if (p.desiredLoanAmount <= 50000) {
        matched.push(
          lang === 'te'
            ? 'కోరిన రుణం (≤ ₹50,000) శిశు శ్రేణికి సరిపోతుంది'
            : lang === 'hi'
            ? 'वांछित ऋण (≤ ₹50,000) शिशु श्रेणी के बिल्कुल अनुकूल है'
            : lang === 'mr'
            ? 'मागितलेले कर्ज (≤ ₹50,000) शिशू श्रेणीच्या मर्यादेत बसते'
            : lang === 'ta'
            ? 'கோரப்பட்ட கடன் (≤ ₹50,000) ஷிஷு வரம்பிற்குள் உள்ளது'
            : lang === 'bn'
            ? 'প্রয়োজনীয় ঋণ (≤ ₹৫০,০০০) শিশু ঋণ সীমার মধ্যে রয়েছে'
            : 'Loan requirement (≤ ₹50,000) falls within Shishu bracket'
        );
        score += 15;
      } else {
        unmet.push(
          lang === 'te'
            ? 'కోరిన రుణం ₹50,000 మించింది (ముద్రా కిశోర్ లేదా PMEGP ఎంచుకోండి)'
            : lang === 'hi'
            ? 'ऋण ₹50,000 से अधिक है (कृपया मुद्रा किशोर या PMEGP चुनें)'
            : lang === 'mr'
            ? 'कर्ज ₹50,000 पेक्षा जास्त आहे (कृपया मुद्रा किशोर किंवा PMEGP निवडा)'
            : lang === 'ta'
            ? 'கடன் ₹50,000-ஐ தாண்டியுள்ளது (முத்ரா கிஷோர் அல்லது PMEGP-ஐ தேர்ந்தெடுக்கவும்)'
            : lang === 'bn'
            ? 'ঋণ ₹৫০,০০০ এর বেশি (অনুগ্রহ করে মুদ্রা কিশোর বা PMEGP বেছে নিন)'
            : 'Desired loan exceeds ₹50,000 (Consider Mudra Kishore or PMEGP)'
        );
        score -= 20;
      }

      if (p.creditScore >= 600) {
        matched.push(
          lang === 'te'
            ? `క్రెడిట్ స్కోరు (${p.creditScore}) బ్యాంక్ రుణ మంజూరు నిబంధనలకు అనుకూలంగా ఉంది`
            : lang === 'hi'
            ? `क्रेडिट स्कोर (${p.creditScore}) बैंक मूल्यांकन मानकों के अनुरूप है`
            : lang === 'mr'
            ? `क्रेडिट स्कोअर (${p.creditScore}) बँक निकषांनुसार योग्य आहे`
            : lang === 'ta'
            ? `கிரெடிட் ஸ்கோர் (${p.creditScore}) வங்கி ஒப்புதல் விதிகளுக்கு பொருந்துகிறது`
            : lang === 'bn'
            ? `ক্রেডিট স্কোর (${p.creditScore}) ব্যাংক মূল্যায়ন মানদণ্ডের সাথে সঙ্গতিপূর্ণ`
            : `Credit score (${p.creditScore}) meets bank appraisal criteria`
        );
        score += 15;
      }

      return {
        isEligible: score >= 70,
        isPartiallyEligible: score >= 50 && score < 70,
        matchScore: Math.min(100, Math.max(10, score)),
        calculatedSubsidyPercent: 0,
        calculatedSubsidyAmount: 0,
        collateralFree: true,
        matchedReasons: matched,
        unmetReasons: unmet,
        recommendedAction:
          lang === 'te'
            ? 'జన్ సమర్థ్ పోర్టల్ ద్వారా లేదా ఏదైనా బ్యాంక్ శాఖలో నేరుగా దరఖాస్తు చేసుకోండి.'
            : lang === 'hi'
            ? 'जन समर्थ पोर्टल या किसी भी सरकारी बैंक शाखा में आधार के साथ आवेदन करें।'
            : lang === 'mr'
            ? 'जन समर्थ पोर्टलवर किंवा कोणत्याही बँक शाखेत थेट अर्ज करा.'
            : lang === 'ta'
            ? 'ஜன் சமர்த் போர்டல் அல்லது எந்தவொரு வங்கி கிளையிலும் நேரடியாக விண்ணப்பிக்கவும்.'
            : lang === 'bn'
            ? 'জন সমর্থ পোর্টাল বা যেকোনো ব্যাংক শাখায় সরাসরি আবেদন করুন।'
            : 'Apply directly through Jan Samarth or visit any bank branch.'
      };
    }
  },
  {
    id: 'pm-mudra-kishore',
    portal: 'Jan Samarth',
    portalUrl: 'https://www.jansamarth.in',
    categoryType: 'mudra',
    minLoan: 50000,
    maxLoan: 500000,
    localized: {
      hi: {
        name: 'प्रधानमंत्री मुद्रा योजना (किशोर ऋण)',
        description: 'स्थापित सूक्ष्म इकाइयों हेतु कार्यशील पूंजी, कच्चा माल व मशीनरी विस्तार ऋण।',
        targetAudience: 'किराना स्टोर, वर्कशॉप, हथकरघा इकाइयां, मिनी आटा चक्की',
        baseSubsidyText: 'CGTMSE क्रेडिट गारंटी सुरक्षा (100% बंधक मुक्त)',
        interestRate: '9.0% - 11.5% वार्षिक',
        requiredDocs: ['आधार व पैन कार्ड', '1 वर्ष का बैंक स्टेटमेंट', 'उद्यम पंजीकरण (Udyam)', 'बिक्री बहीखाता विवरण']
      },
      mr: {
        name: 'प्रधानमंत्री मुद्रा योजना (किशोर कर्ज)',
        description: 'सुरू असलेल्या व्यवसायांसाठी खेळते भांडवल आणि यंत्रसामग्री खरेदीसाठी कर्ज.',
        targetAudience: 'किराणा दुकाने, दुरुस्ती कार्यशाळा, हातमाग युनिट, पीठ गिरणी',
        baseSubsidyText: 'CGTMSE क्रेडिट गॅरंटी कव्हरेज (विनातारण)',
        interestRate: '9.0% - 11.5% वार्षिक',
        requiredDocs: ['आधार व पॅन कार्ड', '1 वर्षाचे बँक स्टेटमेंट', 'उद्यम नोंदणी', 'विक्री खातेवही']
      },
      te: {
        name: 'పీఎం ముద్రా యోజన (కిశోర్ రుణం)',
        description: 'నడుస్తున్న వ్యాపారాలను విస్తరించడానికి మరియు యంత్రాల కొనుగోలుకు వర్కింగ్ క్యాపిటల్ రుణం.',
        targetAudience: 'డెయిరీ యూనిట్లు, రిపేర్ వర్క్‌షాపులు, చేనేత యూనిట్లు, మినీ మిల్లులు',
        baseSubsidyText: 'CGTMSE క్రెడిట్ గ్యారెంటీ కవరేజ్ (పూచీకత్తు రహితం)',
        interestRate: '9.0% - 11.5% వార్షికం',
        requiredDocs: ['ఆధార్ & పాన్ కార్డ్', '1 సంవత్సరం బ్యాంక్ స్టేట్‌మెంట్', 'ఉద్యమ్ రిజిస్ట్రేషన్', 'సేల్స్ ఖాతా నివేదిక']
      },
      ta: {
        name: 'பிரதமர் முத்ரா திட்டம் (கிஷோர் கடன்)',
        description: 'இயங்கும் சிறு தொழில்களுக்கான நடைமுறை மூலதனம் மற்றும் இயந்திரங்கள் வாங்குவதற்கான கடன்.',
        targetAudience: 'மளிகை கடைகள், பட்டறைகள், கைத்தறி கூடங்கள், சிறு ஆலைகள்',
        baseSubsidyText: 'CGTMSE அரசு கடன் உத்தரவாதம் (பிணையமற்றது)',
        interestRate: '9.0% - 11.5% ஆண்டுக்கு',
        requiredDocs: ['ஆதார் & பான் கார்டு', '1 வருட வங்கி அறிக்கை', 'உத்யம் பதிவு', 'விற்பனை கணக்கு விவரம்']
      },
      bn: {
        name: 'প্রধানমন্ত্রী মুদ্রা যোজনা (কিশোর ঋণ)',
        description: 'চলতি ব্যবসার সম্প্রসারণ এবং যন্ত্রপাতি ক্রয়ের জন্য চলতি মূলধন ঋণ।',
        targetAudience: 'মুদি দোকান, ওয়ার্কশপ, তাঁত ইউনিট, মিনি আটা কল',
        baseSubsidyText: 'CGTMSE ক্রেডিট গ্যারান্টি কভারেজ (জামানতমুক্ত)',
        interestRate: '9.0% - 11.5% বার্ষিক',
        requiredDocs: ['আধার ও প্যান কার্ড', '১ বছরের ব্যাংক স্টেটমেন্ট', 'উদ্যম রেজিস্ট্রেশন', 'বিক্রয় খাতা রিপোর্ট']
      },
      en: {
        name: 'PM MUDRA Yojana (Kishore Tier)',
        description: 'Working capital & machinery loans for operating micro-enterprises with established sales history.',
        targetAudience: 'Operating grocery stores, repair workshops, handloom units, mini flour mills',
        baseSubsidyText: 'CGTMSE Credit Guarantee Coverage',
        interestRate: '9.0% - 11.5% p.a.',
        requiredDocs: ['Aadhaar & PAN', '1 Year Bank Statement', 'Udyam Registration', 'Sales Ledger Summary']
      }
    },
    evaluate: (p, lang) => {
      const matched: string[] = [];
      const unmet: string[] = [];
      let score = 65;

      if (p.desiredLoanAmount > 50000 && p.desiredLoanAmount <= 500000) {
        matched.push(
          lang === 'te'
            ? 'రుణ అభ్యర్థన కిశోర్ శ్రేణికి (₹50వేలు - ₹5 లక్షలు) సరిపోతుంది'
            : lang === 'hi'
            ? 'ऋण मांग (₹50k - ₹5 लाख) किशोर ब्रैकेट के पूर्णतः अनुकूल है'
            : lang === 'mr'
            ? 'कर्ज मागणी (₹50 हजार - ₹5 लाख) किशोर श्रेणीशी जुळते'
            : lang === 'ta'
            ? 'கடன் கோரிக்கை கிஷோர் வரம்பிற்கு (₹50ஆ - ₹5 லட்சம்) பொருந்துகிறது'
            : lang === 'bn'
            ? 'ঋণের পরিমাণ কিশোর সীমার (₹৫০ হাজার - ₹৫ লাখ) সাথে মানানসই'
            : 'Loan request matches Kishore ticket range (₹50k - ₹5 Lakhs)'
        );
        score += 20;
      }

      if (p.creditScore >= 680) {
        matched.push(
          lang === 'te'
            ? `బలమైన క్రెడిట్ స్కోర్ (${p.creditScore}) తక్షణ రుణ మంజూరుకు అర్హతనిస్తుంది`
            : lang === 'hi'
            ? `मजबूत क्रेडिट स्कोर (${p.creditScore}) त्वरित स्वीकृति की गारंटी देता है`
            : lang === 'mr'
            ? `उत्कृष्ट क्रेडिट स्कोअर (${p.creditScore}) त्वरित मंजुरीसाठी पात्र ठरतो`
            : lang === 'ta'
            ? `வலுவான கிரெடிட் ஸ்கோர் (${p.creditScore}) உடனடி ஒப்புதலுக்கு தகுதி பெறுகிறது`
            : lang === 'bn'
            ? `দৃঢ় ক্রেডিট স্কোর (${p.creditScore}) তাৎক্ষণিক অনুমোদনের জন্য উপযুক্ত`
            : `Strong Credit Score (${p.creditScore}) qualifies for instant sanction`
        );
        score += 15;
      }

      return {
        isEligible: score >= 75,
        isPartiallyEligible: score >= 55 && score < 75,
        matchScore: Math.min(100, Math.max(10, score)),
        calculatedSubsidyPercent: 0,
        calculatedSubsidyAmount: 0,
        collateralFree: true,
        matchedReasons: matched,
        unmetReasons: unmet,
        recommendedAction:
          lang === 'te'
            ? 'డిజిటల్ ఖాతా సారాంశాన్ని రూపొందించి జన్ సమర్థ్ పోర్టల్ ద్వారా సమర్పించండి.'
            : lang === 'hi'
            ? 'डिजिटल बहीखाता सारांश तैयार कर जन समर्थ पोर्टल पर सबमिट करें।'
            : lang === 'mr'
            ? 'डिजिटल खातेवही सारांश तयार करा आणि जन समर्थ पोर्टलवर अर्ज सादर करा.'
            : lang === 'ta'
            ? 'டிஜிட்டல் கணக்கு சுருக்கத்தை உருவாக்கி ஜன் சமர்த் வழியாக விண்ணப்பிக்கவும்.'
            : lang === 'bn'
            ? 'ডিজিটাল খাতা বিবরণী তৈরি করুন এবং জন সমর্থের মাধ্যমে আবেদন জমা দিন।'
            : 'Generate Digital Khata Summary and submit application via Jan Samarth.'
      };
    }
  },
  {
    id: 'pmegp-subsidy',
    portal: 'KVIC / PMEGP',
    portalUrl: 'https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp',
    categoryType: 'pmegp',
    minLoan: 100000,
    maxLoan: 5000000,
    localized: {
      hi: {
        name: 'प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP)',
        description: 'नया निर्माण या सेवा उद्यम स्थापित करने हेतु 15% से 35% तक भारी सरकारी पूंजीगत सब्सिडी।',
        targetAudience: 'ग्रामीण विनिर्माण, खाद्य प्रसंस्करण, लकड़ी-लोहा उद्योग, सेवा केंद्र',
        baseSubsidyText: '15% से 35% सरकारी पूंजीगत सब्सिडी',
        interestRate: 'बैंक बेस रेट + 1.5% से 2.5%',
        requiredDocs: ['EDP प्रशिक्षण प्रमाणपत्र', 'परियोजना रिपोर्ट (DPR)', 'ग्रामीण क्षेत्र प्रमाणपत्र', 'जाति/श्रेणी प्रमाणपत्र', 'आधार व पैन']
      },
      mr: {
        name: 'प्रधानमंत्री रोजगार निर्मिती कार्यक्रम (PMEGP)',
        description: 'नवीन उद्योग किंवा सेवा व्यवसाय सुरू करण्यासाठी 15% ते 35% पर्यंत थेट सरकारी सबसिडी.',
        targetAudience: 'ग्रामीण उत्पादन, अन्न प्रक्रिया, सुतारकाम, फॅब्रिकेशन, सेवा केंद्रे',
        baseSubsidyText: '15% ते 35% सरकारी भांडवली सबसिडी',
        interestRate: 'बँक मूळ दर + 1.5% ते 2.5%',
        requiredDocs: ['EDP प्रशिक्षण प्रमाणपत्र', 'प्रकल्प अहवाल (DPR)', 'ग्रामीण दाखला', 'जात प्रमाणपत्र', 'आधार व पॅन']
      },
      te: {
        name: 'ప్రధాన మంత్రి ఉపాధి కల్పన పథకం (PMEGP)',
        description: 'కొత్త తయారీ లేదా సేవా యూనిట్ల ఏర్పాటు కోసం 15% నుండి 35% భారీ ప్రభుత్వ మూలధన సబ్సిడీ.',
        targetAudience: 'గ్రామీణ తయారీ యూనిట్లు, ఫుడ్ ప్రాసెసింగ్, ఫ్యాబ్రికేషన్, సర్వీస్ సెంటర్లు',
        baseSubsidyText: '15% నుండి 35% ప్రభుత్వ మూలధన సబ్సిడీ',
        interestRate: 'బ్యాంక్ బేస్ రేటు + 1.5% నుండి 2.5%',
        requiredDocs: ['EDP ట్రైనింగ్ సర్టిఫికెట్', 'ప్రాజెక్ట్ రిపోర్ట్ (DPR)', 'గ్రామీణ ధృవీకరణ పత్రం', 'కుల ధృవీకరణ పత్రం', 'ఆధార్ & పాన్']
      },
      ta: {
        name: 'பிரதமரின் வேலைவாய்ப்பு உருவாக்கும் திட்டம் (PMEGP)',
        description: 'புதிய உற்பத்தி அல்லது சேவை தொழில்களை தொடங்க 15% முதல் 35% வரை அரசு மூலதன மானியம்.',
        targetAudience: 'கிராமப்புற உற்பத்தி, உணவு பதப்படுத்துதல், பழுதுபார்க்கும் மையங்கள்',
        baseSubsidyText: '15% முதல் 35% வரை நேரடி அரசு மானியம்',
        interestRate: 'வங்கி அடிப்படை விகிதம் + 1.5% முதல் 2.5%',
        requiredDocs: ['EDP பயிற்சி சான்றிதழ்', 'திட்ட அறிக்கை (DPR)', 'கிராமப்புற சான்றிதழ்', 'சாதி சான்றிதழ்', 'ஆதார் & பான்']
      },
      bn: {
        name: 'প্রধানমন্ত্রী কর্মসংস্থান সৃষ্টি কর্মসূচি (PMEGP)',
        description: 'নতুন উৎপাদন বা পরিষেবা শিল্প স্থাপনের জন্য ১৫% থেকে ৩৫% সরকারি মূলধন ভর্তুকি।',
        targetAudience: 'গ্রামীণ উৎপাদন, খাদ্য প্রক্রিয়াকরণ, কাঠ-লোহার কাজ, পরিষেবা কেন্দ্র',
        baseSubsidyText: '১৫% থেকে ৩৫% সরকারি মূলধন অনুদান',
        interestRate: 'ব্যাংক বেস রেট + ১.৫% থেকে ২.৫%',
        requiredDocs: ['EDP প্রশিক্ষণ সার্টিফিকেট', 'প্রকল্প রিপোর্ট (DPR)', 'গ্রামীণ সার্টিফিকেট', 'জাতিগত শংসাপত্র', 'আধার ও প্যান']
      },
      en: {
        name: 'PMEGP (Prime Minister Employment Generation Programme)',
        description: 'Flagship credit-linked capital subsidy scheme for setting up micro manufacturing or service units.',
        targetAudience: 'Rural manufacturing, food processing, fabrication, services',
        baseSubsidyText: '15% to 35% Government Capital Subsidy',
        interestRate: 'Bank base rate + 1.5% to 2.5%',
        requiredDocs: ['EDP Training Certificate', 'Detailed Project Report (DPR)', 'Rural Area Certificate', 'Category Certificate', 'Aadhaar/PAN']
      }
    },
    evaluate: (p, lang) => {
      const matched: string[] = [];
      const unmet: string[] = [];
      let score = 60;

      const isSpecialCategory =
        p.gender === 'female' ||
        p.socialCategory === 'sc' ||
        p.socialCategory === 'st' ||
        p.socialCategory === 'obc' ||
        p.socialCategory === 'minority';

      let subsidyPercent = 15;
      if (p.locationType === 'rural') {
        if (isSpecialCategory) {
          subsidyPercent = 35;
          matched.push(
            lang === 'te'
              ? 'గ్రామీణ ప్రత్యేక వర్గ సబ్సిడీ: 35% ప్రభుత్వ గ్రాంట్ (స్వంత వాటా కేవలం 5%)'
              : lang === 'hi'
              ? 'ग्रामीण विशेष श्रेणी सब्सिडी: 35% सरकारी अनुदान (स्वयं का अंशदान केवल 5%)'
              : lang === 'mr'
              ? 'ग्रामीण विशेष प्रवर्ग सबसिडी: 35% सरकारी अनुदान (स्वतःचा वाटा फक्त 5%)'
              : lang === 'ta'
              ? 'கிராமப்புற சிறப்பு பிரிவு மானியம்: 35% அரசு மானியம் (சொந்த பங்கு 5% மட்டுமே)'
              : lang === 'bn'
              ? 'গ্রামীণ বিশেষ শ্রেণী ভর্তুকি: ৩৫% সরকারি অনুদান (নিজস্ব অবদান মাত্র ৫%)'
              : 'Max Rural Special Category Subsidy: 35% Gov Grant (Own share 5%)'
          );
          score += 25;
        } else {
          subsidyPercent = 25;
          matched.push(
            lang === 'te'
              ? 'గ్రామీణ సాధారణ వర్గ సబ్సిడీ: 25% ప్రభుత్వ గ్రాంట్ (స్వంత వాటా 10%)'
              : lang === 'hi'
              ? 'ग्रामीण सामान्य श्रेणी सब्सिडी: 25% सरकारी अनुदान (स्वयं का अंशदान 10%)'
              : lang === 'mr'
              ? 'ग्रामीण सर्वसाधारण प्रवर्ग सबसिडी: 25% सरकारी अनुदान (स्वतःचा वाटा 10%)'
              : lang === 'ta'
              ? 'கிராமப்புற பொது பிரிவு மானியம்: 25% அரசு மானியம் (சொந்த பங்கு 10%)'
              : lang === 'bn'
              ? 'গ্রামীণ সাধারণ শ্রেণী ভর্তুকি: ২৫% সরকারি অনুদান (নিজস্ব অবদান ১০%)'
              : 'Rural General Category Subsidy: 25% Gov Grant (Own share 10%)'
          );
          score += 20;
        }
      } else {
        if (isSpecialCategory) {
          subsidyPercent = 25;
          matched.push(
            lang === 'te'
              ? 'పట్టణ ప్రత్యేక వర్గ సబ్సిడీ: 25% ప్రభుత్వ గ్రాంట్ (స్వంత వాటా 5%)'
              : lang === 'hi'
              ? 'शहरी विशेष श्रेणी सब्सिडी: 25% सरकारी अनुदान'
              : lang === 'mr'
              ? 'शहरी विशेष प्रवर्ग सबसिडी: 25% सरकारी अनुदान'
              : lang === 'ta'
              ? 'நகர்ப்புற சிறப்பு பிரிவு மானியம்: 25% அரசு மானியம்'
              : lang === 'bn'
              ? 'শহুরে বিশেষ শ্রেণী ভর্তুকি: ২৫% সরকারি অনুদান'
              : 'Urban Special Category Subsidy: 25% Gov Grant'
          );
          score += 20;
        } else {
          subsidyPercent = 15;
          matched.push(
            lang === 'te'
              ? 'పట్టణ సాధారణ వర్గ సబ్సిడీ: 15% ప్రభుత్వ గ్రాంట్'
              : lang === 'hi'
              ? 'शहरी सामान्य श्रेणी सब्सिडी: 15% सरकारी अनुदान'
              : lang === 'mr'
              ? 'शहरी सर्वसाधारण प्रवर्ग सबसिडी: 15% सरकारी अनुदान'
              : lang === 'ta'
              ? 'நகர்ப்புற பொது பிரிவு மானியம்: 15% அரசு மானியம்'
              : lang === 'bn'
              ? 'শহুরে সাধারণ শ্রেণী ভর্তুকি: ১৫% সরকারি অনুদান'
              : 'Urban General Category Subsidy: 15% Gov Grant'
          );
          score += 10;
        }
      }

      const projectCost = Math.max(p.desiredLoanAmount, 100000);
      const subsidyAmount = (projectCost * subsidyPercent) / 100;

      return {
        isEligible: score >= 70,
        isPartiallyEligible: score >= 50 && score < 70,
        matchScore: Math.min(100, score),
        calculatedSubsidyPercent: subsidyPercent,
        calculatedSubsidyAmount: Math.round(subsidyAmount),
        collateralFree: projectCost <= 1000000,
        matchedReasons: matched,
        unmetReasons: unmet,
        recommendedAction:
          lang === 'te'
            ? 'KVIC PMEGP పోర్టల్ లేదా జన్ సమర్థ్ ద్వారా ఆన్‌లైన్‌లో దరఖాస్తు చేసుకోండి.'
            : lang === 'hi'
            ? 'KVIC PMEGP पोर्टल या जन समर्थ पर ऑनलाइन आवेदन करें।'
            : lang === 'mr'
            ? 'KVIC PMEGP पोर्टल किंवा जन समर्थवर ऑनलाइन अर्ज करा.'
            : lang === 'ta'
            ? 'KVIC PMEGP போர்டல் அல்லது ஜன் சமர்த் வழியாக ஆன்லைனில் விண்ணப்பிக்கவும்.'
            : lang === 'bn'
            ? 'KVIC PMEGP পোর্টাল বা জন সমর্থের মাধ্যমে অনলাইনে আবেদন করুন।'
            : 'Apply online through KVIC PMEGP Portal or Jan Samarth.'
      };
    }
  },
  {
    id: 'pm-svanidhi',
    portal: 'PM SVANidhi Portal',
    portalUrl: 'https://pmsvanidhi.mohua.gov.in',
    categoryType: 'street_vendor',
    minLoan: 10000,
    maxLoan: 50000,
    localized: {
      hi: {
        name: 'पीएम स्वनिधि (स्ट्रीट वेंडर योजना)',
        description: 'रेहड़ी-पटरी व ठेला व्यापारियों हेतु 7% ब्याज सब्सिडी और ₹1,200/वर्ष यूपीआई कैशबैक के साथ आसान ऋण।',
        targetAudience: 'फेरीवाले, साप्ताहिक हाट विक्रेता, फल/सब्जी ठेला, चाय-नाश्ता स्टॉल',
        baseSubsidyText: '7% वार्षिक ब्याज सब्सिडी + ₹1,200/वर्ष कैशबैक',
        interestRate: '7% ब्याज छूट के साथ रियायती दर',
        requiredDocs: ['वेंडिंग प्रमाणपत्र (LOR)', 'आधार से लिंक मोबाइल नंबर', 'बैंक खाता / UPI क्यूआर कोड']
      },
      mr: {
        name: 'पीएम स्वनिधी (फेरीवाला योजना)',
        description: 'हातगाडी व फेरीवाल्यांसाठी 7% व्याज सबसिडी आणि ₹1,200/वर्ष UPI कॅशबॅकसह कर्ज.',
        targetAudience: 'फेरीवाले, आठवडे बाजार विक्रेते, भाजीपाला हातगाडी, चहा नाश्ता स्टॉल',
        baseSubsidyText: '7% वार्षिक व्याज सबसिडी + ₹1,200/वर्ष कॅशबॅक',
        interestRate: '7% व्याज सवलतीसह सुलभ दर',
        requiredDocs: ['फेरीवाला दाखला (LOR)', 'आधार लिंक मोबाईल', 'बँक खाते / UPI QR कोड']
      },
      te: {
        name: 'పీఎం స్వనిధి (వీధి వ్యాపారుల పథకం)',
        description: 'తోపుడు బండ్లు మరియు వీధి వ్యాపారులకు 7% వడ్డీ సబ్సిడీ మరియు ₹1,200 వార్షిక UPI క్యాష్‌బ్యాక్ రుణం.',
        targetAudience: 'హాకర్లు, వీధి విక్రేతలు, తోపుడు బండ్లు, టీ స్టాల్స్, టిఫిన్ సెంటర్లు',
        baseSubsidyText: '7% వార్షిక వడ్డీ సబ్సిడీ + ₹1,200/సం. క్యాష్‌బ్యాక్',
        interestRate: '7% వడ్డీ రాయితీతో సులభ రుణం',
        requiredDocs: ['వెండింగ్ సర్టిఫికెట్ (LOR)', 'ఆధార్ లింక్డ్ మొబైల్', 'బ్యాంక్ ఖాతా / UPI QR కోడ్']
      },
      ta: {
        name: 'பிரதமர் ஸ்வநிதி (தெருவோர வியாபாரிகள் திட்டம்)',
        description: 'தெருவோர வியாபாரிகளுக்கு 7% வட்டி மானியம் மற்றும் ₹1,200 ஆண்டு UPI கேஷ்பேக் கடன்.',
        targetAudience: 'தள்ளுவண்டி வியாபாரிகள், காய்கறி விற்பனையாளர்கள், சாலையோர உணவகங்கள்',
        baseSubsidyText: '7% ஆண்டு வட்டி மானியம் + ₹1,200/ஆண்டு கேஷ்பேக்',
        interestRate: '7% வட்டி மானியத்துடன் கூடிய கடன்',
        requiredDocs: ['வியாபார சான்றிதழ் (LOR)', 'ஆதார் எண்', 'வங்கி கணக்கு / UPI QR']
      },
      bn: {
        name: 'পিএম স্বনিধি (রাস্তার হকার প্রকল্প)',
        description: 'রাস্তার হকারদের জন্য ৭% সুদ ভর্তুকি এবং ₹১,২০০ বার্ষিক UPI ক্যাশব্যাক সহ সহজ ঋণ।',
        targetAudience: 'হকার, সাপ্তাহিক বাজারের বিক্রেতা, ফল-সবজি ঠেলাগাড়ি, চা স্টল',
        baseSubsidyText: '৭% বার্ষিক সুদে ভর্তুকি + ₹১,২০০/বছর ক্যাশব্যাক',
        interestRate: '৭% সুদ ছাড়ের সাথে সহজ ঋণ',
        requiredDocs: ['ভেন্ডিং সার্টিফিকেট (LOR)', 'আধার লিঙ্ক মোবাইল', 'ব্যাংক অ্যাকাউন্ট / UPI QR']
      },
      en: {
        name: 'PM SVANidhi (Street Vendors Scheme)',
        description: 'Collateral-free working capital loan for street vendors with 7% interest subsidy & UPI cashback.',
        targetAudience: 'Hawkers, weekly haat vendors, handcart operators, tea stalls',
        baseSubsidyText: '7% Annual Interest Subvention + ₹1,200/yr UPI Cashback',
        interestRate: '7% Subsidized Interest Rate',
        requiredDocs: ['Vending Certificate / LOR', 'Aadhaar linked Mobile', 'Bank Account / UPI QR Code']
      }
    },
    evaluate: (p, lang) => {
      const matched: string[] = [];
      const unmet: string[] = [];
      let score = 50;

      if (p.businessSector === 'street_vendor' || p.businessSector === 'retail_shop') {
        matched.push(
          lang === 'te'
            ? 'వ్యాపార కార్యకలాపం పట్టణ స్థానిక సంస్థల వెండర్ నిబంధనలకు సరిపోతుంది'
            : lang === 'hi'
            ? 'गतिविधि स्ट्रीट वेंडर / शहरी स्थानीय निकाय मानदंडों से मेल खाती है'
            : lang === 'mr'
            ? 'व्यवसाय फेरीवाला / स्थानिक स्वराज्य संस्था निकषांशी जुळतो'
            : lang === 'ta'
            ? 'தொழில் உள்ளாட்சி அமைப்பு விற்பனையாளர் விதிகளுக்கு பொருந்துகிறது'
            : lang === 'bn'
            ? 'ব্যবসা স্থানীয় পৌরসভা হকার মানদণ্ডের সাথে মানানসই'
            : 'Activity matches Urban Local Body vendor criteria'
        );
        score += 35;
      } else {
        unmet.push(
          lang === 'te'
            ? 'ప్రత్యేకంగా తోపుడు బండ్లు మరియు వీధి వ్యాపారుల కోసం రూపొందించబడింది'
            : lang === 'hi'
            ? 'यह योजना विशेष रूप से रेहड़ी-पटरी एवं ठेला व्यापारियों हेतु है'
            : lang === 'mr'
            ? 'विशेषतः फेरीवाले आणि हातगाडी व्यावसायिकांसाठी'
            : lang === 'ta'
            ? 'தெருவோர வியாபாரிகள் மற்றும் தள்ளுவண்டிகளுக்கு பிரத்யேகமானது'
            : lang === 'bn'
            ? 'বিশেষভাবে রাস্তার হকার ও ঠেলাগাড়ি বিক্রেতাদের জন্য'
            : 'Specifically curated for street vendors and small carts'
        );
        score -= 15;
      }

      if (p.desiredLoanAmount <= 50000) {
        matched.push(
          lang === 'te'
            ? 'రుణ మొత్తం స్వనిధి దశల పరిమితిలో (₹10వేలు, ₹20వేలు, ₹50వేలు) ఉంది'
            : lang === 'hi'
            ? 'ऋण राशि स्वनिधि की तीनों किस्तों (10k, 20k, 50k) के अंतर्गत है'
            : lang === 'mr'
            ? 'कर्ज रक्कम स्वनिधी टप्प्यांच्या मर्यादेत आहे'
            : lang === 'ta'
            ? 'கடன் தொகை ஸ்வநிதி தவணை வரம்பிற்குள் உள்ளது'
            : lang === 'bn'
            ? 'ঋণের পরিমাণ স্বনিধি কিস্তি সীমার মধ্যে রয়েছে'
            : 'Loan amount is within SVANidhi tranche limits'
        );
        score += 15;
      }

      return {
        isEligible: score >= 70,
        isPartiallyEligible: score >= 45 && score < 70,
        matchScore: Math.min(100, Math.max(10, score)),
        calculatedSubsidyPercent: 7,
        calculatedSubsidyAmount: Math.round(p.desiredLoanAmount * 0.07),
        collateralFree: true,
        matchedReasons: matched,
        unmetReasons: unmet,
        recommendedAction:
          lang === 'te'
            ? 'pmsvanidhi.mohua.gov.in లో లేదా సమీప CSC కేంద్రాన్ని సంప్రదించండి.'
            : lang === 'hi'
            ? 'pmsvanidhi.mohua.gov.in या नजदीकी सीएससी सेंटर पर आवेदन करें।'
            : lang === 'mr'
            ? 'pmsvanidhi.mohua.gov.in वर किंवा जवळच्या CSC केंद्रावर अर्ज करा.'
            : lang === 'ta'
            ? 'pmsvanidhi.mohua.gov.in அல்லது CSC மையத்தை அணுகவும்.'
            : lang === 'bn'
            ? 'pmsvanidhi.mohua.gov.in এ বা সিএসসি কেন্দ্রে আবেদন করুন।'
            : 'Apply on pmsvanidhi.mohua.gov.in or visit CSC.'
      };
    }
  },
  {
    id: 'pm-vishwakarma',
    portal: 'PM Vishwakarma',
    portalUrl: 'https://pmvishwakarma.gov.in',
    categoryType: 'artisan',
    minLoan: 100000,
    maxLoan: 300000,
    localized: {
      hi: {
        name: 'पीएम विश्वकर्मा योजना (कारीगर व शिल्पकार)',
        description: '18 पारंपरिक व्यवसायों (बढ़ई, लोहार, कुम्हार, दर्जी, बुनकर) हेतु ₹15,000 टूलकिट अनुदान व 5% ब्याज पर ऋण।',
        targetAudience: 'बुनकर, दर्जी, बढ़ई, लोहार, सुनार, कुम्हार, चर्मकार, मूर्तिकार',
        baseSubsidyText: '₹15,000 मुफ्त आधुनिक टूल-किट अनुदान + 5% रियायती ब्याज',
        interestRate: '5% निश्चित रियायती ब्याज दर',
        requiredDocs: ['आधार कार्ड', 'राशन कार्ड', 'बैंक पासबुक', 'ग्राम पंचायत / स्थानीय निकाय सत्यापन']
      },
      mr: {
        name: 'पीएम विश्वकर्मा योजना (कारागीर व बलुतेदार)',
        description: '18 पारंपरिक व्यवसायांसाठी (सुतार, लोहार, कुंभार, शिंपी, विणकर) ₹15,000 टूलकिट अनुदान व 5% व्याजाने कर्ज.',
        targetAudience: 'विणकर, शिंपी, सुतार, लोहार, सोनार, कुंभार, चांभार',
        baseSubsidyText: '₹15,000 मोफत आधुनिक टूल-किट अनुदान + 5% सवलतीचे व्याज',
        interestRate: '5% सवलतीचा निश्चित व्याजदर',
        requiredDocs: ['आधार कार्ड', 'रेशन कार्ड', 'बँक पासबुक', 'ग्रामपंचायत पडताळणी']
      },
      te: {
        name: 'పీఎం విశ్వకర్మ పథకం (చేతివృత్తులు & కళాకారులు)',
        description: '18 సంప్రదాయ చేతివృత్తుల వారికి ₹15,000 ఉచిత టూల్‌కిట్ గ్రాంట్ మరియు 5% రాయితీ వడ్డీతో రుణం.',
        targetAudience: 'చేనేతకారులు, టైలర్లు, వడ్రంగులు, కమ్మరులు, కుమ్మరులు, శిల్పులు',
        baseSubsidyText: '₹15,000 ఉచిత ఆధునిక టూల్-కిట్ గ్రాంట్ + 5% రాయితీ వడ్డీ',
        interestRate: '5% స్థిర రాయితీ వడ్డీ రేటు',
        requiredDocs: ['ఆధార్ కార్డు', 'రేషన్ కార్డు', 'బ్యాంక్ పాస్‌బుక్', 'గ్రామ పంచాయతీ ధృవీకరణ']
      },
      ta: {
        name: 'பிரதமர் விஸ்வகர்மா திட்டம் (கைவினைஞர்கள்)',
        description: '18 பாரம்பரிய கைவினைஞர்களுக்கு ₹15,000 இலவச கருவி மானியம் மற்றும் 5% வட்டி கடன்.',
        targetAudience: 'நெசவாளர்கள், தையல்காரர்கள், தச்சர்கள், கொல்லர்கள், குயவர்கள்',
        baseSubsidyText: '₹15,000 இலவச நவீன கருவித்தொகுப்பு மானியம் + 5% வட்டி',
        interestRate: '5% குறைந்த நிலையான வட்டி விகிதம்',
        requiredDocs: ['ஆதார் அட்டை', 'ரேஷன் கார்டு', 'வங்கி புத்தகம்', 'கிராம பஞ்சாயத்து சரிபார்ப்பு']
      },
      bn: {
        name: 'পিএম বিশ্বকর্মা যোজনা (কারিগর ও শিল্পী)',
        description: '১৮টি ঐতিহ্যবাহী পেশার জন্য ₹১৫,০০০ বিনামূল্যে টুলকিট অনুদান ও ৫% সুদে ঋণ।',
        targetAudience: 'তাঁতি, দর্জি, ছুতোর, কামার, কুমার, স্বর্ণকার, ভাস্কর',
        baseSubsidyText: '₹১৫,০০০ বিনামূল্যে আধুনিক টুল-কিট অনুদান + ৫% রেয়াতি সুদ',
        interestRate: '৫% নির্দিষ্ট রেয়াতি সুদের হার',
        requiredDocs: ['আধার কার্ড', 'রেশন কার্ড', 'ব্যাংক পাসবুক', 'গ্রাম পঞ্চায়েত যাচাইকরণ']
      },
      en: {
        name: 'PM Vishwakarma Scheme',
        description: 'Financial & skill ecosystem for traditional artisans across 18 notified trades with ₹15k toolkit grant & 5% loan.',
        targetAudience: 'Weavers, tailors, carpenters, blacksmiths, potters, cobblers',
        baseSubsidyText: '₹15,000 Free Modern Tool-kit Grant + 5% Subsidized Interest',
        interestRate: '5% Fixed Subsidized Concessional Rate',
        requiredDocs: ['Aadhaar Card', 'Ration Card', 'Bank Passbook', 'Gram Panchayat Verification']
      }
    },
    evaluate: (p, lang) => {
      const matched: string[] = [];
      const unmet: string[] = [];
      let score = 45;

      if (p.businessSector === 'handloom_artisan') {
        matched.push(
          lang === 'te'
            ? 'దరఖాస్తుదారు గుర్తింపు పొందిన 18 సంప్రదాయ చేతివృత్తుల వర్గానికి చెందినవారు'
            : lang === 'hi'
            ? 'आवेदक मान्यता प्राप्त 18 पारंपरिक कारीगर व्यवसायों में शामिल है'
            : lang === 'mr'
            ? 'अर्जदार 18 पारंपारिक कारागीर व्यवसायात समाविष्ट आहे'
            : lang === 'ta'
            ? 'விண்ணப்பதாரர் அங்கீகரிக்கப்பட்ட 18 பாரம்பரிய கைவினைத் தொழிலில் உள்ளார்'
            : lang === 'bn'
            ? 'আবেদনকারী ১৮টি স্বীকৃত ঐতিহ্যবাহী কারিগর পেশার সাথে যুক্ত'
            : 'Applicant is engaged in recognized traditional artisanal trade'
        );
        score += 40;
      } else {
        unmet.push(
          lang === 'te'
            ? 'కేవలం 18 సంప్రదాయ చేతివృత్తుల వారికి మాత్రమే వర్తిస్తుంది'
            : lang === 'hi'
            ? 'केवल 18 अधिसूचित पारंपरिक कारीगरों (बुनकर, दर्जी, बढ़ई आदि) हेतु'
            : lang === 'mr'
            ? 'फक्त 18 अधिसूचित पारंपारिक कारागिरांसाठी'
            : lang === 'ta'
            ? '18 பாரம்பரிய கைவினை தொழில்களுக்கு மட்டுமே பொருந்தும்'
            : lang === 'bn'
            ? 'কেবলমাত্র ১৮টি ঐতিহ্যবাহী কারিগর পেশার জন্য প্রযোজ্য'
            : 'Restricted to 18 traditional artisan trades'
        );
        score -= 15;
      }

      matched.push(
        lang === 'te'
          ? '₹15,000 ఆధునిక టూల్-కిట్ ఈ-వోచర్ గ్రాంట్ కోసం అర్హులు'
          : lang === 'hi'
          ? '₹15,000 आधुनिक उपकरण ई-वाउचर अनुदान हेतु पात्र'
          : lang === 'mr'
          ? '₹15,000 आधुनिक अवजारे ई-व्हाउचर अनुदानासाठी पात्र'
          : lang === 'ta'
          ? '₹15,000 நவீன கருவி இ-வவுச்சர் மானியத்திற்கு தகுதியானவர்'
          : lang === 'bn'
          ? '₹১৫,০০০ আধুনিক সরঞ্জাম ই-ভাউচার অনুদানের জন্য যোগ্য'
          : 'Eligible for ₹15,000 modern tool-kit e-voucher grant'
      );

      return {
        isEligible: score >= 70,
        isPartiallyEligible: score >= 45 && score < 70,
        matchScore: Math.min(100, Math.max(10, score)),
        calculatedSubsidyPercent: 15,
        calculatedSubsidyAmount: 15000,
        collateralFree: true,
        matchedReasons: matched,
        unmetReasons: unmet,
        recommendedAction:
          lang === 'te'
            ? 'CSC కేంద్రం లేదా గ్రామ పంచాయతీలో బయోమెట్రిక్ ఈ-కేవైసీతో నమోదు చేసుకోండి.'
            : lang === 'hi'
            ? 'सीएससी सेंटर या ग्राम पंचायत में बायोमेट्रिक ई-केवाईसी के साथ पंजीकरण करें।'
            : lang === 'mr'
            ? 'CSC केंद्र किंवा ग्रामपंचायतीमध्ये बायोमेट्रिक e-KYC सह नोंदणी करा.'
            : lang === 'ta'
            ? 'CSC மையம் அல்லது கிராம பஞ்சாயத்தில் பயோமெட்ரிக் e-KYC மூலம் பதிவு செய்யவும்.'
            : lang === 'bn'
            ? 'সিএসসি কেন্দ্র বা গ্রাম পঞ্চায়েতে বায়োমেট্রিক e-KYC সহ নিবন্ধন করুন।'
            : 'Enroll at CSC center or Gram Panchayat with biometric e-KYC.'
      };
    }
  },
  {
    id: 'pmfme-scheme',
    portal: 'Jan Samarth',
    portalUrl: 'https://pmfme.mofpi.gov.in',
    categoryType: 'food_processing',
    minLoan: 200000,
    maxLoan: 3000000,
    localized: {
      hi: {
        name: 'पीएम सूक्ष्म खाद्य प्रसंस्करण उद्यम (PMFME)',
        description: 'आटा चक्की, मसाला पिसाई, अचार, बेकरी, डेयरी व तेल मिल इकाइयों हेतु 35% पूंजीगत सब्सिडी (₹10 लाख तक)।',
        targetAudience: 'सूक्ष्म खाद्य प्रसंस्करण, डेयरी पैकिंग, मसाला चक्की, बेकरी इकाइयां',
        baseSubsidyText: '35% क्रेडिट-लिंक्ड पूंजीगत सब्सिडी (₹10 लाख तक)',
        interestRate: 'बैंक सामान्य वाणिज्यिक दर',
        requiredDocs: ['FSSAI रजिस्ट्रेशन / खाद्य लाइसेंस', 'बिजली बिल / परिसर प्रमाण', 'मशीनरी डीपीआर', 'बैंक स्टेटमेंट (6 माह)']
      },
      mr: {
        name: 'पीएम सूक्ष्म अन्न प्रक्रिया उद्योग (PMFME)',
        description: 'पीठ गिरणी, मसाला उद्योग, लोणचे, बेकरी, डेअरी आणि तेल गिरण्यांसाठी 35% भांडवली सबसिडी (₹10 लाखांपर्यंत).',
        targetAudience: 'सूक्ष्म अन्न प्रक्रिया, डेअरी पॅकिंग, मसाला गिरणी, बेकरी',
        baseSubsidyText: '35% भांडवली सबसिडी (कमाल ₹10 लाख)',
        interestRate: 'बँक नियमित दर',
        requiredDocs: ['FSSAI नोंदणी / परवाना', 'वीज बिल / जागा पुरावा', 'यंत्रसामग्री कोटेशन', 'बँक स्टेटमेंट']
      },
      te: {
        name: 'పీఎం సూక్ష్మ ఆహార ప్రాసెసింగ్ పథకం (PMFME)',
        description: 'పిండి మిల్లులు, మసాలా గ్రైండింగ్, పచ్చళ్ళు, బేకరీ మరియు ఆయిల్ మిల్లులకు 35% మూలధన సబ్సిడీ (₹10 లక్షల వరకు).',
        targetAudience: 'ఫుడ్ ప్రాసెసింగ్, డెయిరీ ప్యాకింగ్, మసాలా మిల్లులు, బేకరీ యూనిట్లు',
        baseSubsidyText: '35% క్రెడిట్ లింక్డ్ క్యాపిటల్ సబ్సిడీ (గరిష్టంగా ₹10 లక్షలు)',
        interestRate: 'బ్యాంక్ ప్రామాణిక రేటు',
        requiredDocs: ['FSSAI రిజిస్ట్రేషన్ / లైసెన్స్', 'కరెంట్ బిల్లు / స్థల ధృవీకరణ', 'మిషనరీ కొటేషన్ (DPR)', 'బ్యాంక్ స్టేట్‌మెంట్']
      },
      ta: {
        name: 'பிரதமர் உணவு பதப்படுத்தும் தொழில் திட்டம் (PMFME)',
        description: 'மாவு மில், மசாலா பொடி, ஊறுகாய், பேக்கரி மற்றும் பால் பண்ணை அலகுகளுக்கு 35% மூலதன மானியம் (₹10 லட்சம் வரை).',
        targetAudience: 'உணவு பதப்படுத்துதல், பால் பொருட்கள், பேக்கரி கூடங்கள்',
        baseSubsidyText: '35% மூலதன மானியம் (அதிகபட்சம் ₹10 லட்சம் வரை)',
        interestRate: 'வங்கி வணிக வட்டி விகிதம்',
        requiredDocs: ['FSSAI உணவு உரிமம்', 'மின் கட்டண ரசீது', 'இயந்திர திட்ட அறிக்கை', 'வங்கி அறிக்கை']
      },
      bn: {
        name: 'পিএম ক্ষুদ্র খাদ্য প্রক্রিয়াকরণ প্রকল্প (PMFME)',
        description: 'আটা কল, মশলা পেষাই, আচার, বেকারি, ডেইরি ও তেল মিলের জন্য ৩৫% মূলধন ভর্তুকি (১০ লাখ টাকা পর্যন্ত)।',
        targetAudience: 'ক্ষুদ্র খাদ্য প্রক্রিয়াকরণ, ডেইরি প্যাকিং, মশলা কল, বেকারি ইউনিট',
        baseSubsidyText: '৩৫% ক্রেডিট-সংযুক্ত মূলধন ভর্তুকি (সর্বোচ্চ ₹১০ লাখ)',
        interestRate: 'ব্যাংক বাণিজ্যিক হার',
        requiredDocs: ['FSSAI খাদ্য লাইসেন্স', 'বিদ্যুৎ বিল / ঠিকানার প্রমাণ', 'মেশিনারি কোটেশন', 'ব্যাংক বিবরণী']
      },
      en: {
        name: 'PMFME (Micro Food Processing Enterprises)',
        description: 'Financial & tech support for micro food units (flour mills, spice grinding, pickle, bakery, dairy packaging).',
        targetAudience: 'Micro food units, dairy processing, spice grinders, snack/pickle makers',
        baseSubsidyText: '35% Credit-Linked Capital Subsidy up to ₹10 Lakhs',
        interestRate: 'Bank Commercial Rate',
        requiredDocs: ['FSSAI Registration / Food License', 'Electricity Bill', 'DPR for Machinery', 'Bank Statements']
      }
    },
    evaluate: (p, lang) => {
      const matched: string[] = [];
      const unmet: string[] = [];
      let score = 45;

      if (['food_processing', 'dairy_livestock', 'agri_allied'].includes(p.businessSector)) {
        matched.push(
          lang === 'te'
            ? 'వ్యాపారం మైక్రో ఫుడ్ / వ్యవసాయ ప్రాసెసింగ్ కేటగిరీ కిందకు వస్తుంది'
            : lang === 'hi'
            ? 'व्यवसाय खाद्य व कृषि उत्पाद प्रसंस्करण श्रेणी के अंतर्गत आता है'
            : lang === 'mr'
            ? 'व्यवसाय अन्न व कृषी प्रक्रिया श्रेणीत येतो'
            : lang === 'ta'
            ? 'தொழில் உணவு / வேளாண் பதப்படுத்துதல் பிரிவின் கீழ் வருகிறது'
            : lang === 'bn'
            ? 'ব্যবসা খাদ্য ও কৃষি প্রক্রিয়াকরণ শ্রেণীর আওতাভুক্ত'
            : 'Business categorized under Micro Food / Agro Processing'
        );
        score += 40;
      } else {
        unmet.push(
          lang === 'te'
            ? 'ఆహార ప్రాసెసింగ్, మసాలాలు, పిండి మిల్లు లేదా వ్యవసాయ ఉత్పత్తుల ప్రాసెసింగ్ అవసరం'
            : lang === 'hi'
            ? 'खाद्य प्रसंस्करण, मसाला, चक्की या कृषि प्रसंस्करण आवश्यक है'
            : lang === 'mr'
            ? 'अन्न प्रक्रिया, मसाले, गिरणी किंवा कृषी प्रक्रिया आवश्यक'
            : lang === 'ta'
            ? 'உணவு, மசாலா, ஆலை அல்லது வேளாண் பதப்படுத்துதல் தொழில் தேவை'
            : lang === 'bn'
            ? 'খাদ্য প্রক্রিয়াকরণ, মশলা, আটা কল বা কৃষি প্রক্রিয়াকরণ প্রয়োজন'
            : 'Requires food, spice, dairy, grain or agro-processing activity'
        );
        score -= 20;
      }

      const projectCost = Math.max(p.desiredLoanAmount, 200000);
      const subsidyCap = 1000000;
      const calculatedSubsidy = Math.min(subsidyCap, Math.round(projectCost * 0.35));

      matched.push(
        lang === 'te'
          ? `35% మూలధన సబ్సిడీకి అర్హులు (అంచనా ₹${calculatedSubsidy.toLocaleString('en-IN')})`
          : lang === 'hi'
          ? `35% पूंजीगत सब्सिडी (अनुमानित ₹${calculatedSubsidy.toLocaleString('en-IN')}) हेतु पात्र`
          : lang === 'mr'
          ? `35% भांडवली सबसिडीसाठी पात्र (अंदाजे ₹${calculatedSubsidy.toLocaleString('en-IN')})`
          : lang === 'ta'
          ? `35% மூலதன மானியத்திற்கு தகுதி (சுமார் ₹${calculatedSubsidy.toLocaleString('en-IN')})`
          : lang === 'bn'
          ? `৩৫% মূলধন ভর্তুকির জন্য যোগ্য (আনুমানিক ₹${calculatedSubsidy.toLocaleString('en-IN')})`
          : `Eligible for 35% Capital Subsidy (Est. ₹${calculatedSubsidy.toLocaleString('en-IN')})`
      );

      return {
        isEligible: score >= 70,
        isPartiallyEligible: score >= 50 && score < 70,
        matchScore: Math.min(100, Math.max(10, score)),
        calculatedSubsidyPercent: 35,
        calculatedSubsidyAmount: calculatedSubsidy,
        collateralFree: projectCost <= 1000000,
        matchedReasons: matched,
        unmetReasons: unmet,
        recommendedAction:
          lang === 'te'
            ? 'pmfme.mofpi.gov.in లో లేదా జన్ సమర్థ్ ద్వారా ODOP ఎంచుకుని దరఖాస్తు చేయండి.'
            : lang === 'hi'
            ? 'pmfme.mofpi.gov.in या जन समर्थ पर ODOP उत्पाद चुनकर आवेदन करें।'
            : lang === 'mr'
            ? 'pmfme.mofpi.gov.in किंवा जन समर्थवर ODOP निवडून अर्ज करा.'
            : lang === 'ta'
            ? 'pmfme.mofpi.gov.in அல்லது ஜன் சமர்த் வழியாக ODOP தேர்ந்தெடுத்து விண்ணப்பிக்கவும்.'
            : lang === 'bn'
            ? 'pmfme.mofpi.gov.in বা জন সমর্থের মাধ্যমে আবেদন করুন।'
            : 'Submit application on pmfme.mofpi.gov.in or Jan Samarth.'
      };
    }
  },
  {
    id: 'stand-up-india',
    portal: 'Jan Samarth',
    portalUrl: 'https://www.standupmitra.in',
    categoryType: 'women_sc_st',
    minLoan: 1000000,
    maxLoan: 10000000,
    localized: {
      hi: {
        name: 'स्टैंड-अप इंडिया योजना (महिला व SC/ST)',
        description: 'महिला एवं अनुसूचित जाति/जनजाति उद्यमियों हेतु ₹10 लाख से ₹1 करोड़ तक नया विनिर्माण/सेवा उद्यम ऋण।',
        targetAudience: 'महिला उद्यमी, SC व ST संस्थापक, नया विनिर्माण व सेवा उद्योग',
        baseSubsidyText: 'सरकारी समर्थित क्रेडिट गारंटी (CGSUS)',
        interestRate: 'MCLR + 3% + प्रीमियम',
        requiredDocs: ['आधार / पैन', 'जाति प्रमाणपत्र (SC/ST हेतु)', 'परियोजना रिपोर्ट (DPR)', 'प्रदूषण/NOC यदि आवश्यक हो']
      },
      mr: {
        name: 'स्टँड-अप इंडिया योजना (महिला व SC/ST)',
        description: 'महिला व अनुसूचित जाती/जमाती उद्योजकांसाठी ₹10 लाख ते ₹1 कोटीपर्यंत नवीन उद्योग कर्ज.',
        targetAudience: 'महिला उद्योजक, SC व ST संस्थापक, नवीन उत्पादन व सेवा युनिट',
        baseSubsidyText: 'सरकारी क्रेडिट गॅरंटी (CGSUS)',
        interestRate: 'MCLR + 3% + प्रीमियम',
        requiredDocs: ['आधार / पॅन', 'जात प्रमाणपत्र', 'प्रकल्प अहवाल (DPR)', 'MSME नोंदणी']
      },
      te: {
        name: 'స్టాండ్-అప్ ఇండియా పథకం (మహిళలు & SC/ST)',
        description: 'మహిళలు మరియు SC/ST వ్యాపారవేత్తల కోసం ₹10 లక్షల నుండి ₹1 కోటి వరకు కొత్త తయారీ/సేవా రుణ పథకం.',
        targetAudience: 'మహిళా వ్యాపారవేత్తలు, SC & ST వ్యవస్థాపకులు, గ్రీన్‌ఫీల్డ్ యూనిట్లు',
        baseSubsidyText: 'ప్రభుత్వ క్రెడిట్ గ్యారెంటీ (CGSUS)',
        interestRate: 'MCLR + 3% + ప్రీమియం',
        requiredDocs: ['ఆధార్ / పాన్', 'కుల ధృవీకరణ పత్రం', 'ప్రాజెక్ట్ రిపోర్ట్ (DPR)', 'MSME రిజిస్ట్రేషన్']
      },
      ta: {
        name: 'ஸ்டாண்ட்-அப் இந்தியா திட்டம் (பெண்கள் & SC/ST)',
        description: 'பெண்கள் மற்றும் SC/ST தொழில்முனைவோருக்கு ₹10 லட்சம் முதல் ₹1 கோடி வரை புதிய தொழில் கடன்.',
        targetAudience: 'பெண் தொழில்முனைவோர், SC & ST தொடக்க நிறுவனர்கள்',
        baseSubsidyText: 'அரசு ஆதரவு கடன் உத்தரவாதம் (CGSUS)',
        interestRate: 'MCLR + 3% + பிரீமியம்',
        requiredDocs: ['ஆதார் / பான் கார்டு', 'சாதி சான்றிதழ்', 'திட்ட அறிக்கை (DPR)', 'MSME பதிவு']
      },
      bn: {
        name: 'স্ট্যান্ড-আপ ইন্ডিয়া যোজনা (মহিলা ও SC/ST)',
        description: 'মহিলা এবং তপশিলি জাতি/উপজাতি উদ্যোক্তাদের জন্য ১০ লাখ থেকে ১ কোটি টাকা পর্যন্ত নতুন উদ্যোগ ঋণ।',
        targetAudience: 'নারী উদ্যোক্তা, SC ও ST প্রতিষ্ঠাতা, নতুন কারখানা ও সেবা ইউনিট',
        baseSubsidyText: 'সরকারি ক্রেডিট গ্যারান্টি (CGSUS)',
        interestRate: 'MCLR + ৩% + প্রিমিয়াম',
        requiredDocs: ['আধার / প্যান', 'জাতিগত শংসাপত্র', 'প্রকল্প রিপোর্ট (DPR)', 'উদ্যোগ রেজিস্ট্রেশন']
      },
      en: {
        name: 'Stand-Up India Scheme',
        description: 'Bank loans between ₹10 Lakhs and ₹1 Crore for greenfield enterprises set up by Women or SC/ST entrepreneurs.',
        targetAudience: 'Women entrepreneurs, SC & ST founders, greenfield manufacturing/services',
        baseSubsidyText: 'Government Backed Credit Guarantee (CGSUS)',
        interestRate: 'MCLR + 3% + Tenor Premium',
        requiredDocs: ['Aadhaar / PAN', 'Caste Certificate (for SC/ST)', 'Detailed Project Report (DPR)', 'MSME Registration']
      }
    },
    evaluate: (p, lang) => {
      const matched: string[] = [];
      const unmet: string[] = [];
      let score = 40;

      if (p.gender === 'female' || p.socialCategory === 'sc' || p.socialCategory === 'st') {
        matched.push(
          lang === 'te'
            ? `దరఖాస్తుదారు ప్రధాన అర్హతను (${p.gender === 'female' ? 'మహిళా' : 'SC/ST'} వ్యాపారవేత్త) కలిగి ఉన్నారు`
            : lang === 'hi'
            ? `आवेदक मुख्य मानदंड (${p.gender === 'female' ? 'महिला' : 'SC/ST'} उद्यमी) को पूरा करता है`
            : lang === 'mr'
            ? `अर्जदार मुख्य निकष (${p.gender === 'female' ? 'महिला' : 'SC/ST'} उद्योजक) पूर्ण करतो`
            : lang === 'ta'
            ? `விண்ணப்பதாரர் முதன்மை தகுதியை (${p.gender === 'female' ? 'பெண்' : 'SC/ST'} தொழில்முனைவோர்) பூர்த்தி செய்கிறார்`
            : lang === 'bn'
            ? `আবেদনকারী প্রধান মানদণ্ড (${p.gender === 'female' ? 'মহিলা' : 'SC/ST'} উদ্যোক্তা) পূরণ করেছেন`
            : `Applicant satisfies core criteria (${p.gender === 'female' ? 'Woman' : 'SC/ST'} Entrepreneur)`
        );
        score += 35;
      } else {
        unmet.push(
          lang === 'te'
            ? 'ప్రత్యేకంగా మహిళలు మరియు SC/ST వ్యాపారవేత్తల కోసం మాత్రమే'
            : lang === 'hi'
            ? 'केवल महिला और SC/ST उद्यमियों द्वारा नए ग्रीनफील्ड उद्यम हेतु'
            : lang === 'mr'
            ? 'फक्त महिला आणि SC/ST उद्योजकांसाठी'
            : lang === 'ta'
            ? 'பெண்கள் மற்றும் SC/ST தொழில்முனைவோருக்கு மட்டுமே'
            : lang === 'bn'
            ? 'কেবলমাত্র মহিলা এবং SC/ST উদ্যোক্তাদের জন্য'
            : 'Exclusive for Women and SC/ST entrepreneurs'
        );
        score -= 25;
      }

      if (p.desiredLoanAmount >= 1000000) {
        matched.push(
          lang === 'te'
            ? 'రుణ మొత్తం స్టాండ్-అప్ ఇండియా పరిమితికి (₹10 లక్షలు - ₹1 కోటి) సరిపోతుంది'
            : lang === 'hi'
            ? 'ऋण मांग स्टैंड-अप इंडिया टिकट साइज (₹10 लाख - ₹1 करोड़) से मेल खाती है'
            : lang === 'mr'
            ? 'कर्ज मागणी स्टँड-अप इंडिया मर्यादेशी (₹10 लाख - ₹1 कोटी) जुळते'
            : lang === 'ta'
            ? 'கடன் தேவை ஸ்டாண்ட்-அப் இந்தியா வரம்பிற்குள் (₹10 லட்சம் - ₹1 கோடி) உள்ளது'
            : lang === 'bn'
            ? 'ঋণের পরিমাণ স্ট্যান্ড-আপ ইন্ডিয়া সীমার (₹১০ লাখ - ₹১ কোটি) সাথে মেলে'
            : 'Loan requirement aligns with Stand-Up India ticket size (₹10L - ₹1 Cr)'
        );
        score += 25;
      } else {
        unmet.push(
          lang === 'te'
            ? 'స్టాండ్-అప్ ఇండియా కింద కనీస రుణ పరిమితి ₹10 లక్షలు'
            : lang === 'hi'
            ? 'स्टैंड-अप इंडिया के तहत न्यूनतम ऋण सीमा ₹10 लाख है'
            : lang === 'mr'
            ? 'स्टँड-अप इंडिया अंतर्गत किमान कर्ज मर्यादा ₹10 लाख आहे'
            : lang === 'ta'
            ? 'ஸ்டாண்ட்-அப் இந்தியாவின் கீழ் குறைந்தபட்ச கடன் வரம்பு ₹10 லட்சம்'
            : lang === 'bn'
            ? 'স্ট্যান্ড-আপ ইন্ডিয়ার অধীনে ন্যূনতম ঋণের পরিমাণ ₹১০ লাখ'
            : 'Minimum sanction limit under Stand-Up India is ₹10 Lakhs'
        );
        score -= 10;
      }

      return {
        isEligible: score >= 75,
        isPartiallyEligible: score >= 50 && score < 75,
        matchScore: Math.min(100, Math.max(10, score)),
        calculatedSubsidyPercent: 0,
        calculatedSubsidyAmount: 0,
        collateralFree: true,
        matchedReasons: matched,
        unmetReasons: unmet,
        recommendedAction:
          lang === 'te'
            ? 'standupmitra.in లేదా జన్ సమర్థ్ లో లాగిన్ అయి ప్రాజెక్ట్ రిపోర్ట్ (DPR) సమర్పించండి.'
            : lang === 'hi'
            ? 'standupmitra.in या जन समर्थ पर प्रोजेक्ट रिपोर्ट अपलोड करें।'
            : lang === 'mr'
            ? 'standupmitra.in किंवा जन समर्थवर प्रकल्प अहवाल सादर करा.'
            : lang === 'ta'
            ? 'standupmitra.in அல்லது ஜன் சமர்த் தளத்தில் திட்ட அறிக்கையை சமர்ப்பிக்கவும்.'
            : lang === 'bn'
            ? 'standupmitra.in বা জন समर्थ-এ লগইন করে ডিপিআর জমা দিন।'
            : 'Log in to standupmitra.in or Jan Samarth to submit DPR.'
      };
    }
  },
  {
    id: 'nabard-shg-linkage',
    portal: 'NABARD',
    portalUrl: 'https://www.nabard.org',
    categoryType: 'agriculture',
    minLoan: 100000,
    maxLoan: 2000000,
    localized: {
      hi: {
        name: 'नाबार्ड स्वयं सहायता समूह (SHG) बैंक लिंकेज',
        description: 'ग्रामीण महिला स्वयं सहायता समूहों हेतु 3% ब्याज छूट के साथ 100% बंधक-मुक्त सामूहिक ऋण।',
        targetAudience: 'महिला स्वयं सहायता समूह सदस्य, डेयरी समितियां, ग्रामीण किसान समूह',
        baseSubsidyText: '100% बंधक-मुक्त सामूहिक ऋण + 3% ब्याज छूट',
        interestRate: '7.0% वार्षिक (3% ब्याज छूट के साथ)',
        requiredDocs: ['SHG प्रस्ताव पुस्तिका', 'आपसी अनुबंध (Inter-se Agreement)', 'बचत बैंक पासबुक', 'ग्रेडिंग रिपोर्ट']
      },
      mr: {
        name: 'नाबार्ड बचत गट (SHG) बँक लिंकेज',
        description: 'ग्रामीण महिला बचत गटांसाठी 3% व्याज सवलतीसह 100% विनातारण सामूहिक कर्ज.',
        targetAudience: 'महिला बचत गट सदस्य, डेअरी संस्था, ग्रामीण शेतकरी गट',
        baseSubsidyText: '100% विनातारण सामूहिक कर्ज + 3% व्याज सवलत',
        interestRate: '7.0% वार्षिक (3% व्याज सवलतीसह)',
        requiredDocs: ['बचत गट ठराव वही', 'बचत खाते पासबुक', 'बँक / NRLM ग्रेडिंग अहवाल']
      },
      te: {
        name: 'నాబార్డ్ స్వయం సహాయక సంఘాల (SHG) బ్యాంక్ లింకేజ్',
        description: 'గ్రామీణ మహిళా సంఘాలకు 3% వడ్డీ రాయితీతో 100% షూరిటీ లేని సామూహిక రుణాలు.',
        targetAudience: 'మహిళా స్వయం సహాయక సంఘాలు, పాడి రైతుల సమాఖ్యలు, చేనేత గ్రూపులు',
        baseSubsidyText: '100% షూరిటీ లేని గ్రూప్ క్రెడిట్ + 3% వడ్డీ రాయితీ',
        interestRate: '7.0% వార్షికం (3% వడ్డీ రాయితీతో)',
        requiredDocs: ['SHG రిజల్యూషన్ పుస్తకం', 'బ్యాంక్ పాస్‌బుక్ (6 నెలలు)', 'గ్రేడింగ్ రిపోర్ట్']
      },
      ta: {
        name: 'நபார்டு மகளிர் சுயஉதவி குழு (SHG) வங்கி இணைப்பு',
        description: 'கிராமப்புற மகளிர் குழுக்களுக்கு 3% வட்டி மானியத்துடன் 100% பிணையமற்ற கடன்.',
        targetAudience: 'மகளிர் சுயஉதவி குழு உறுப்பினர்கள், பால் பண்ணை கூட்டமைப்புகள்',
        baseSubsidyText: '100% பிணையமற்ற குழு கடன் + 3% வட்டி மானியம்',
        interestRate: '7.0% ஆண்டுக்கு (3% வட்டி மானியத்துடன்)',
        requiredDocs: ['SHG தீர்மான புத்தகம்', 'வங்கி கணக்கு புத்தகம்', 'தர மதிப்பீட்டு அறிக்கை']
      },
      bn: {
        name: 'নাবার্ড স্বনির্ভর দল (SHG) ব্যাংক লিঙ্কেজ',
        description: 'গ্রামীণ মহিলা স্বনির্ভর গোষ্ঠীগুলির জন্য ৩% সুদ ছাড় সহ ১০০% জামানতমুক্ত ঋণ।',
        targetAudience: 'মহিলা স্বনির্ভর দল সদস্য, ডেইরি সমবায়, গ্রামীণ কৃষক গোষ্ঠী',
        baseSubsidyText: '১০০% জামানতমুক্ত গ্রুপ ঋণ + ৩% সুদ রেয়াত',
        interestRate: '৭.০% বার্ষিক (৩% সুদ ছাড় সহ)',
        requiredDocs: ['SHG রেজোলিউশন বই', 'সেভিংস পাসবুক', 'গ্রেডিং রিপোর্ট']
      },
      en: {
        name: 'NABARD SHG-Bank Linkage Programme',
        description: 'Enables rural women Self Help Groups (SHGs) to access collateral-free credit with 3% interest subvention.',
        targetAudience: 'Women SHG members, dairy collectives, handloom weavers groups',
        baseSubsidyText: '100% Collateral-Free Group Credit Guarantee',
        interestRate: '7.0% p.a. (with 3% Interest Subvention)',
        requiredDocs: ['SHG Resolution Book', 'Inter-se Agreement', 'Savings Account Passbook', 'Grading Report']
      }
    },
    evaluate: (p, lang) => {
      const matched: string[] = [];
      const unmet: string[] = [];
      let score = 50;

      if (p.gender === 'female') {
        matched.push(
          lang === 'te'
            ? 'మహిళా స్వయం సహాయక సంఘాల సాధికారత ప్రాధాన్యతకు సరిగ్గా సరిపోతుంది'
            : lang === 'hi'
            ? 'महिला स्वयं सहायता समूह सशक्तिकरण प्राथमिकता से पूर्णतः मेल खाता है'
            : lang === 'mr'
            ? 'महिला बचत गट सक्षमीकरण प्राधान्याशी थेट जुळते'
            : lang === 'ta'
            ? 'மகளிர் சுயஉதவி குழு அதிகாரமளித்தல் முன்னுரிமையுடன் நேரடியாக பொருந்துகிறது'
            : lang === 'bn'
            ? 'মহিলা স্বনির্ভর দল ক্ষমতায়ন অগ্রাধিকারের সাথে সরাসরি মিলে যায়'
            : 'Directly matches Women SHG Empowerment priority'
        );
        score += 25;
      }

      if (p.locationType === 'rural' || p.locationType === 'semi-urban') {
        matched.push(
          lang === 'te'
            ? 'గ్రామీణ / పాక్షిక-పట్టణ ప్రాంతం నాబార్డ్ ప్రాధాన్యత రంగ రీఫైనాన్స్‌కు అర్హత పొందింది'
            : lang === 'hi'
            ? 'ग्रामीण/अर्ध-शहरी स्थान नाबार्ड प्राथमिकता क्षेत्र पुनर्वित्त के योग्य है'
            : lang === 'mr'
            ? 'ग्रामीण/निमशहरी स्थान नाबार्ड प्राधान्य क्षेत्रासाठी पात्र आहे'
            : lang === 'ta'
            ? 'கிராமப்புற / பகுதி-நகர்ப்புற பகுதி நபார்டு முன்னுரிமை துறைக்கு தகுதி பெறுகிறது'
            : lang === 'bn'
            ? 'গ্রামীণ / আধা-শহুরে অবস্থান নাবার্ড অগ্রাধিকার খাতের জন্য উপযুক্ত'
            : 'Rural / Semi-urban location qualifies for NABARD priority sector'
        );
        score += 20;
      }

      return {
        isEligible: score >= 70,
        isPartiallyEligible: score >= 45 && score < 70,
        matchScore: Math.min(100, Math.max(10, score)),
        calculatedSubsidyPercent: 3,
        calculatedSubsidyAmount: Math.round(p.desiredLoanAmount * 0.03),
        collateralFree: true,
        matchedReasons: matched,
        unmetReasons: unmet,
        recommendedAction:
          lang === 'te'
            ? 'మీ గ్రామ పంచాయతీ విలేజ్ ఆర్గనైజేషన్ (VO) లేదా బ్యాంక్ మిత్ర/సఖితో సంప్రదించండి.'
            : lang === 'hi'
            ? 'अपनी ग्राम पंचायत वीओ (Village Organization) या बैंक सखी से संपर्क करें।'
            : lang === 'mr'
            ? 'आपल्या ग्रामपंचायत VO किंवा बँक सखीशी संपर्क साधा.'
            : lang === 'ta'
            ? 'உங்கள் கிராம பஞ்சாயத்து VO அல்லது வங்கி சக்கியை அணுகவும்.'
            : lang === 'bn'
            ? 'আপনার গ্রাম পঞ্চায়েত ভিও বা ব্যাংক সখীর সাথে যোগাযোগ করুন।'
            : 'Coordinate with your Gram Panchayat VO or Bank Sakhi.'
      };
    }
  }
];

interface GovernmentSchemesModalProps {
  currentLang: SupportedLanguage;
  userCreditScore?: number;
  userMonthlyIncome?: number;
  inline?: boolean;
  onClose?: () => void;
  customerProfile?: CustomerProfile | null;
}

const INDIAN_STATES = [
  'Telangana',
  'Andhra Pradesh',
  'Maharashtra',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Bihar',
  'Karnataka',
  'Tamil Nadu',
  'West Bengal',
  'Rajasthan',
  'Gujarat',
  'Punjab',
  'Odisha',
  'Haryana',
  'Kerala'
];

export const GovernmentSchemesModal: React.FC<GovernmentSchemesModalProps> = ({
  currentLang,
  userCreditScore = 740,
  userMonthlyIncome = 45000,
  inline = false,
  onClose,
  customerProfile
}) => {
  const t = UI_TRANSLATIONS[currentLang] || UI_TRANSLATIONS.en;

  // Configurable Applicant Profile
  const [profile, setProfile] = useState<ApplicantProfile>(() => ({
    gender: customerProfile?.gender || 'female',
    socialCategory: customerProfile?.socialCategory || 'obc',
    locationType: customerProfile?.locationType || 'rural',
    state: customerProfile?.state || (currentLang === 'te' ? 'Telangana' : currentLang === 'mr' ? 'Maharashtra' : currentLang === 'ta' ? 'Tamil Nadu' : currentLang === 'bn' ? 'West Bengal' : 'Uttar Pradesh'),
    businessSector: customerProfile?.businessSector || 'agri_allied',
    businessAgeMonths: 18,
    monthlyRevenue: userMonthlyIncome || 45000,
    desiredLoanAmount: 200000,
    hasUdyam: true,
    creditScore: userCreditScore
  }));

  useEffect(() => {
    if (!customerProfile) return;
    setProfile((prev) => ({
      ...prev,
      gender: customerProfile.gender,
      socialCategory: customerProfile.socialCategory,
      locationType: customerProfile.locationType,
      state: customerProfile.state,
      businessSector: customerProfile.businessSector
    }));
  }, [customerProfile]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  const [showProfileDrawer, setShowProfileDrawer] = useState<boolean>(true);
  const [applicationModalScheme, setApplicationModalScheme] = useState<SchemeDefinition | null>(null);
  const [applicationSuccess, setApplicationSuccess] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [copiedDossier, setCopiedDossier] = useState<boolean>(false);

  // Dynamic Backend Sync State
  const [liveUpdates, setLiveUpdates] = useState<Record<string, any>>({});
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const fetchLiveSchemeUpdates = async () => {
    try {
      const res = await fetch(apiUrl('/api/schemes/live-updates'));
      if (res.ok) {
        const data = await res.json();
        if (data.updates && Array.isArray(data.updates)) {
          const map: Record<string, any> = {};
          data.updates.forEach((u: any) => {
            map[u.schemeId] = u;
          });
          setLiveUpdates(map);
          setLastSyncTime(data.lastSyncTimestamp || new Date().toISOString());
        }
      }
    } catch (err) {
      console.warn('Live scheme feed fetch notice:', err);
    }
  };

  const handleTriggerLiveSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(apiUrl('/api/schemes/sync'), { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.updates && Array.isArray(data.updates)) {
          const map: Record<string, any> = {};
          data.updates.forEach((u: any) => {
            map[u.schemeId] = u;
          });
          setLiveUpdates(map);
          setLastSyncTime(data.lastSyncTimestamp || new Date().toISOString());
        }
      }
    } catch (err) {
      console.error('Trigger sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchLiveSchemeUpdates();
  }, []);

  // Scheme evaluation engine: Evaluates in real-time in selected language
  const evaluatedSchemes = useMemo(() => {
    return SCHEMES_DEFINITIONS.map((scheme) => {
      const evaluation = scheme.evaluate(profile, currentLang);
      const locText = scheme.localized[currentLang] || scheme.localized.en;
      const liveData = liveUpdates[scheme.id];
      return {
        ...scheme,
        locText,
        evaluation,
        liveData
      };
    }).sort((a, b) => b.evaluation.matchScore - a.evaluation.matchScore);
  }, [profile, currentLang, liveUpdates]);

  const filteredSchemes = useMemo(() => {
    if (selectedCategory === 'all') return evaluatedSchemes;
    return evaluatedSchemes.filter((s) => s.categoryType === selectedCategory);
  }, [evaluatedSchemes, selectedCategory]);

  const eligibleCount = evaluatedSchemes.filter((s) => s.evaluation.isEligible).length;
  const maxPossibleSubsidy = Math.max(...evaluatedSchemes.map((s) => s.evaluation.calculatedSubsidyAmount));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleApplyNow = (scheme: SchemeDefinition) => {
    setApplicationModalScheme(scheme);
    setApplicationSuccess(false);
    setCopiedDossier(false);
    setCopiedRef(false);
  };

  const handleConfirmDossier = () => {
    setApplicationSuccess(true);
  };

  const handleCopyFullDossier = () => {
    if (!applicationModalScheme) return;
    const refId = `DOS-${applicationModalScheme.id.toUpperCase().slice(0, 8)}-${profile.creditScore}`;
    const loc = applicationModalScheme.localized[currentLang] || applicationModalScheme.localized.en;
    const evalResult = applicationModalScheme.evaluate(profile, currentLang);
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const fullText = `=====================================================
GOVERNMENT SCHEME APPLICATION DOSSIER
=====================================================
Scheme: ${loc.name}
Portal: ${applicationModalScheme.portal} (${applicationModalScheme.portalUrl || ''})
Dossier Reference ID: ${refId}
Generated Date: ${dateStr}
Status: Digital Dossier Ready for Verification

-----------------------------------------------------
1. APPLICANT & BUSINESS PROFILE
-----------------------------------------------------
• Gender: ${profile.gender.toUpperCase()}
• Social Category: ${profile.socialCategory.toUpperCase()}
• Location: ${profile.locationType.toUpperCase()} (${profile.state})
• Business Sector: ${profile.businessSector.replace(/_/g, ' ').toUpperCase()}
• Business Vintage: ${profile.businessAgeMonths} Months
• Monthly Revenue / Turnover: ₹${profile.monthlyRevenue.toLocaleString('en-IN')}
• Desired Loan Requirement: ₹${profile.desiredLoanAmount.toLocaleString('en-IN')}
• Udyam MSME Status: ${profile.hasUdyam ? 'Registered (Verified)' : 'Not Registered'}

-----------------------------------------------------
2. CREDIT APPRAISAL & SCHEME MATCH
-----------------------------------------------------
• Alternative Credit Score: ${profile.creditScore} / 900
• Eligibility Status: ${evalResult.isEligible ? 'ELIGIBLE' : evalResult.isPartiallyEligible ? 'PARTIALLY ELIGIBLE' : 'INELIGIBLE'}
• Match Score: ${evalResult.matchScore}%
• Scheme Sanction Limit: ₹${applicationModalScheme.minLoan.toLocaleString('en-IN')} - ₹${applicationModalScheme.maxLoan.toLocaleString('en-IN')}
• Interest Rate: ${loc.interestRate}
• Capital Subsidy: ${evalResult.calculatedSubsidyPercent}% (₹${evalResult.calculatedSubsidyAmount.toLocaleString('en-IN')})
• Collateral Free: ${evalResult.collateralFree ? 'YES (100% Collateral-Free)' : 'No (Standard MSME Margin)'}

-----------------------------------------------------
3. VERIFIED ELIGIBILITY REASONS
-----------------------------------------------------
${evalResult.matchedReasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}

-----------------------------------------------------
4. ATTACHED DIGITAL VERIFICATION RECORDS
-----------------------------------------------------
[✓] Aadhaar & PAN Identity Verification Artifact
[✓] Digital Khata Cash-Flow & Daily UPI Turnover Record
[✓] Alternative Credit Rating & Repayment Velocity Statement
[✓] Bank Statement Verification via RBI AA Framework
${profile.hasUdyam ? '[✓] Udyam MSME Registration Certificate' : ''}

-----------------------------------------------------
5. OFFICIAL PORTAL SUBMISSION LINK
-----------------------------------------------------
Official Portal: ${applicationModalScheme.portal}
Direct Link: ${applicationModalScheme.portalUrl}
=====================================================`;

    navigator.clipboard.writeText(fullText);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2500);
  };

  const content = (
    <div className={`bg-stone-900 border border-stone-800 rounded-3xl w-full ${inline ? '' : 'max-w-5xl shadow-2xl my-6'} overflow-hidden`}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-emerald-950 p-6 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{t.title}</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40">
                {t.badge}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">{t.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handleTriggerLiveSync}
            disabled={isSyncing}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border cursor-pointer ${
              isSyncing
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                : 'bg-emerald-950/60 hover:bg-emerald-900/80 border-emerald-500/50 text-emerald-300'
            }`}
            title={t.syncNowBtn}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
            <span>{isSyncing ? t.syncingBtn : t.syncNowBtn}</span>
          </button>

          <button
            onClick={() => setShowProfileDrawer(!showProfileDrawer)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border cursor-pointer ${
              showProfileDrawer
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-stone-800 border-stone-700 text-stone-300 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showProfileDrawer ? t.hideProfile : t.showProfile}</span>
          </button>

          {!inline && onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-stone-950/80 border-b border-stone-800 text-xs">
        <div className="p-3 bg-stone-900/90 rounded-2xl border border-stone-800/80">
          <span className="text-stone-500 block">{t.kpiMatched}</span>
          <span className="text-lg font-bold text-emerald-400 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {eligibleCount} / {SCHEMES_DEFINITIONS.length}
          </span>
        </div>

        <div className="p-3 bg-stone-900/90 rounded-2xl border border-stone-800/80">
          <span className="text-stone-500 block">{t.kpiMaxSubsidy}</span>
          <span className="text-lg font-bold text-amber-300 font-mono">
            {formatCurrency(maxPossibleSubsidy)}
          </span>
        </div>

        <div className="p-3 bg-stone-900/90 rounded-2xl border border-stone-800/80">
          <span className="text-stone-500 block">{t.kpiCredit}</span>
          <span className="text-lg font-bold text-stone-200 font-mono flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {profile.creditScore} / 900
          </span>
        </div>

        <div className="p-3 bg-stone-900/90 rounded-2xl border border-stone-800/80">
          <span className="text-stone-500 block">{t.kpiProfile}</span>
          <span className="text-xs font-semibold text-stone-300 truncate block mt-1">
            {profile.locationType === 'rural' ? t.ruralOpt.split(' ')[0] : profile.locationType === 'urban' ? t.urbanOpt.split(' ')[0] : t.semiUrbanOpt.split(' ')[0]} • {profile.state}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 1. DYNAMIC APPLICANT PROFILE MATCHER DRAWER */}
        {showProfileDrawer && (
          <div className="bg-stone-950/90 border border-emerald-900/50 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>{t.profileTitle}</span>
              </div>
              <span className="text-[11px] text-stone-400">{t.profileSubtext}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              {/* Gender */}
              <div className="space-y-1">
                <label className="text-stone-400 block font-medium">{t.genderLabel}</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value as GenderType })}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1.5 text-stone-200 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
                >
                  <option value="female">{t.femaleOpt}</option>
                  <option value="male">{t.maleOpt}</option>
                  <option value="other">{t.otherOpt}</option>
                </select>
              </div>

              {/* Social Category */}
              <div className="space-y-1">
                <label className="text-stone-400 block font-medium">{t.socialCatLabel}</label>
                <select
                  value={profile.socialCategory}
                  onChange={(e) => setProfile({ ...profile, socialCategory: e.target.value as SocialCategoryType })}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1.5 text-stone-200 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
                >
                  <option value="obc">{t.obcOpt}</option>
                  <option value="sc">{t.scOpt}</option>
                  <option value="st">{t.stOpt}</option>
                  <option value="minority">{t.minorityOpt}</option>
                  <option value="general">{t.generalOpt}</option>
                </select>
              </div>

              {/* Location Type */}
              <div className="space-y-1">
                <label className="text-stone-400 block font-medium">{t.locationLabel}</label>
                <select
                  value={profile.locationType}
                  onChange={(e) => setProfile({ ...profile, locationType: e.target.value as LocationType })}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1.5 text-stone-200 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
                >
                  <option value="rural">{t.ruralOpt}</option>
                  <option value="semi-urban">{t.semiUrbanOpt}</option>
                  <option value="urban">{t.urbanOpt}</option>
                </select>
              </div>

              {/* State */}
              <div className="space-y-1">
                <label className="text-stone-400 block font-medium">{t.stateLabel}</label>
                <select
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1.5 text-stone-200 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Business Sector */}
              <div className="space-y-1">
                <label className="text-stone-400 block font-medium">{t.sectorLabel}</label>
                <select
                  value={profile.businessSector}
                  onChange={(e) => setProfile({ ...profile, businessSector: e.target.value as BusinessSectorType })}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1.5 text-stone-200 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
                >
                  <option value="agri_allied">{t.secAgri}</option>
                  <option value="food_processing">{t.secFood}</option>
                  <option value="handloom_artisan">{t.secHandloom}</option>
                  <option value="street_vendor">{t.secStreet}</option>
                  <option value="retail_shop">{t.secRetail}</option>
                  <option value="dairy_livestock">{t.secDairy}</option>
                  <option value="manufacturing_small">{t.secMfg}</option>
                  <option value="services">{t.secServices}</option>
                </select>
              </div>

              {/* Target Loan Amount */}
              <div className="space-y-1">
                <label className="text-stone-400 block font-medium">{t.loanLabel}</label>
                <select
                  value={profile.desiredLoanAmount}
                  onChange={(e) => setProfile({ ...profile, desiredLoanAmount: parseInt(e.target.value) })}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1.5 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="50000">₹50,000</option>
                  <option value="200000">₹2,00,000</option>
                  <option value="500000">₹5,00,000</option>
                  <option value="1000000">₹10,00,000</option>
                  <option value="2500000">₹25,00,000</option>
                  <option value="5000000">₹50,00,000</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Live Sync Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-stone-950/70 border border-emerald-500/20 rounded-2xl text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-ping'}`} />
            <span className="font-semibold text-stone-300">{t.liveSyncTitle}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {t.liveSyncBadge}
            </span>
          </div>

          <div className="flex items-center gap-3 text-stone-400 text-[11px] flex-wrap">
            <span className="flex items-center gap-1 hidden sm:flex">
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              {t.verifiedPolicySource}
            </span>
            {lastSyncTime && (
              <span className="font-mono text-emerald-400/90 bg-stone-900/90 px-2 py-0.5 rounded-md border border-stone-800">
                {t.lastSyncLabel}: {new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            <button
              onClick={handleTriggerLiveSync}
              disabled={isSyncing}
              type="button"
              className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border cursor-pointer ${
                isSyncing
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                  : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/50 text-emerald-300 hover:text-white shadow-sm'
              }`}
              title="Check official government schemes and portal guidelines to update"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
              <span>{isSyncing ? t.syncingBtn : t.syncNowBtn}</span>
            </button>
          </div>
        </div>

        {/* 2. CATEGORY FILTERS - mobile friendly */}
        <div className="w-full min-w-0">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-stretch gap-2 sm:gap-2">
            {[
              { id: 'all', label: t.catAll },
              { id: 'mudra', label: t.catMudra },
              { id: 'pmegp', label: t.catPmegp },
              { id: 'street_vendor', label: t.catStreet },
              { id: 'artisan', label: t.catArtisan },
              { id: 'food_processing', label: t.catFood },
              { id: 'women_sc_st', label: t.catWomenScSt },
              { id: 'agriculture', label: t.catAgri }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full sm:w-auto min-w-0 px-2.5 sm:px-3.5 py-2 sm:py-1.5 rounded-xl sm:rounded-full text-[11px] sm:text-xs leading-tight font-semibold text-center break-words whitespace-normal sm:whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-stone-800/80 text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. EVALUATED SCHEMES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchemes.map((scheme) => {
            const { evaluation, locText } = scheme;
            const isSelected = selectedSchemeId === scheme.id;

            return (
              <div
                key={scheme.id}
                className={`bg-stone-900/90 rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                  evaluation.isEligible
                    ? 'border-emerald-500/40 hover:border-emerald-500'
                    : evaluation.isPartiallyEligible
                    ? 'border-amber-500/30 hover:border-amber-500/50'
                    : 'border-stone-800 opacity-80'
                }`}
              >
                <div>
                  {/* Top Bar: Portal + Match Tag */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 font-semibold border border-stone-700">
                        {scheme.portal}
                      </span>
                      <h4 className="text-base font-bold text-stone-100 mt-1.5">
                        {locText.name}
                      </h4>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full font-mono flex items-center gap-1 ${
                          evaluation.isEligible
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : evaluation.isPartiallyEligible
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {evaluation.isEligible && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {evaluation.isEligible
                          ? `${t.eligibleTag} (${evaluation.matchScore}%)`
                          : evaluation.isPartiallyEligible
                          ? `${t.partiallyEligibleTag} (${evaluation.matchScore}%)`
                          : t.ineligibleTag}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-300/90 leading-relaxed mb-3">
                    {locText.description}
                  </p>

                  {/* Dynamic Feed Alert from Live Policy Sync */}
                  {scheme.liveData && (
                    <div className="mb-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-200/90 flex items-start gap-2">
                      <Radio className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0 animate-pulse" />
                      <div>
                        <strong className="text-emerald-300 font-semibold">{t.policyHighlightsTitle} </strong>
                        <span>{scheme.liveData.latestPolicyHighlights}</span>
                      </div>
                    </div>
                  )}

                  {/* Key Metrics Chips */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4 bg-stone-950/60 p-3 rounded-2xl border border-stone-800/80">
                    <div>
                      <span className="text-[11px] text-stone-500 block">{t.sanctionRange}</span>
                      <span className="font-mono font-bold text-stone-200">
                        ₹{scheme.minLoan.toLocaleString('en-IN')} - ₹{scheme.maxLoan.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500 block">{t.subsidyBenefit}</span>
                      <span className="font-mono font-bold text-amber-300">
                        {evaluation.calculatedSubsidyPercent > 0
                          ? `${evaluation.calculatedSubsidyPercent}% (${formatCurrency(evaluation.calculatedSubsidyAmount)})`
                          : locText.baseSubsidyText}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500 block">{t.interestRate}</span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        {locText.interestRate}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500 block">{t.collateralRequired}</span>
                      <span className="font-semibold text-stone-300">
                        {evaluation.collateralFree ? t.collateralNo : t.collateralYes}
                      </span>
                    </div>
                  </div>

                  {/* Match Criteria Details Accordion */}
                  <div className="space-y-1.5 mb-4">
                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      {t.matchedReasonsTitle}
                    </p>
                    {evaluation.matchedReasons.slice(0, isSelected ? 10 : 2).map((reason, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}

                    {evaluation.unmetReasons.map((unmet, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-amber-300/90">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{unmet}</span>
                      </div>
                    ))}

                    {evaluation.matchedReasons.length > 2 && (
                      <button
                        onClick={() => setSelectedSchemeId(isSelected ? null : scheme.id)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium pt-1 underline block cursor-pointer"
                      >
                        {isSelected ? t.showLess : t.showMore(evaluation.matchedReasons.length - 2)}
                      </button>
                    )}

                    {isSelected && (
                      <div className="pt-2 border-t border-stone-800/80 mt-2 space-y-2 text-xs">
                        <div>
                          <span className="text-stone-400 font-semibold block mb-1">{t.reqDocsTitle}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {locText.requiredDocs.map((doc, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-lg bg-stone-800 text-stone-300 text-[11px] border border-stone-700"
                              >
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-stone-400 text-[11px] italic bg-stone-950/40 p-2 rounded-xl">
                          <strong className="text-stone-300 not-italic">{t.recTitle}</strong>
                          {evaluation.recommendedAction}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Apply / Generate Jan Samarth Dossier Action */}
                <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-stone-400">
                    {t.targetTitle} <strong className="text-stone-300">{locText.targetAudience.split(',')[0]}</strong>
                  </span>

                  <button
                    onClick={() => handleApplyNow(scheme)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950 cursor-pointer"
                  >
                    <span>{t.applyBtn(scheme.portal)}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Jan Samarth Application Modal / Dossier Generator */}
      {applicationModalScheme && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {applicationModalScheme.localized[currentLang]?.name || applicationModalScheme.localized.en.name}
                  </h4>
                  <p className="text-[11px] text-stone-400">{t.modalSub(applicationModalScheme.portal)}</p>
                </div>
              </div>
              <button
                onClick={() => setApplicationModalScheme(null)}
                className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {applicationSuccess ? (
              <div className="py-4 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">{t.successTitle}</h4>
                  <p className="text-xs text-stone-300 max-w-sm mx-auto">
                    {t.successDesc(applicationModalScheme.portal)}
                  </p>
                </div>

                <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 text-left space-y-3">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="text-stone-400">{t.dossierRefLabel}:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-emerald-400">
                        DOS-{applicationModalScheme.id.toUpperCase().slice(0, 8)}-{profile.creditScore}
                      </span>
                      <button
                        onClick={() => {
                          const refId = `DOS-${applicationModalScheme.id.toUpperCase().slice(0, 8)}-${profile.creditScore}`;
                          navigator.clipboard.writeText(refId);
                          setCopiedRef(true);
                          setTimeout(() => setCopiedRef(false), 2000);
                        }}
                        type="button"
                        title={copiedRef ? 'Copied to clipboard' : 'Copy Reference ID'}
                        aria-label="Copy Reference ID"
                        className="p-1 px-1.5 rounded-lg bg-stone-900 border border-stone-700 hover:border-emerald-500/50 hover:bg-stone-800 text-stone-300 hover:text-white transition flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        {copiedRef ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-400" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{t.dossierStatusReady}</span>
                  </div>

                  {/* Copy Complete Dossier Content Button */}
                  <button
                    onClick={handleCopyFullDossier}
                    type="button"
                    className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-700/80 hover:border-emerald-500/60 text-stone-200 text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm group"
                  >
                    {copiedDossier ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-emerald-400 font-bold">{t.dossierCopied}</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 text-emerald-400 group-hover:scale-105 transition-transform flex-shrink-0" />
                        <span>{t.copyDossierBtn}</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-stone-400 pt-1 border-t border-stone-800/80">
                    {t.portalRedirectNote(applicationModalScheme.portal)}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <a
                    href={applicationModalScheme.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{t.openOfficialPortalBtn(applicationModalScheme.portal)}</span>
                  </a>
                  <button
                    onClick={() => {
                      setApplicationModalScheme(null);
                      setApplicationSuccess(false);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
                  >
                    {t.close}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3 text-xs bg-stone-950 p-4 rounded-2xl border border-stone-800">
                  <p className="font-bold text-stone-200">{t.summaryTitle}</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-stone-500">{t.applicantLabel}</span>
                      <p className="font-semibold text-stone-300">
                        {profile.gender === 'female' ? t.femaleOpt.split(' ')[0] : t.maleOpt} • {profile.socialCategory.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <span className="text-stone-500">{t.locationLabel}:</span>
                      <p className="font-semibold text-stone-300">
                        {profile.locationType === 'rural' ? t.ruralOpt.split(' ')[0] : t.urbanOpt.split(' ')[0]} ({profile.state})
                      </p>
                    </div>
                    <div>
                      <span className="text-stone-500">{t.loanLabel}:</span>
                      <p className="font-bold font-mono text-emerald-400">₹{profile.desiredLoanAmount.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <span className="text-stone-500">{t.kpiCredit}:</span>
                      <p className="font-bold font-mono text-emerald-400">{profile.creditScore} / 900</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-300 block">{t.dossierDocsTitle}</label>
                  <div className="space-y-1">
                    {(applicationModalScheme.localized[currentLang]?.requiredDocs || applicationModalScheme.localized.en.requiredDocs).map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-stone-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                  <button
                    onClick={() => setApplicationModalScheme(null)}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
                  >
                    {t.cancelBtn}
                  </button>
                  <button
                    onClick={handleConfirmDossier}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{t.generateDossierBtn(applicationModalScheme.portal)}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer Return Action */}
      <div className="bg-stone-950 p-4 border-t border-stone-800 flex items-center justify-end">
        {onClose && (
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition cursor-pointer"
          >
            {inline ? t.backToKhata : t.close}
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
