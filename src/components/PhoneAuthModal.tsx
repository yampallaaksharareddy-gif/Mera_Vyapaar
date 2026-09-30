import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Lock,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  MessageSquare,
  UserPlus,
  LogIn,
  Store,
  AlertCircle,
  BadgeCheck
} from 'lucide-react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth, ensureFirebaseAuthSession } from '../services/firebase';
import { SupportedLanguage } from '../types';
import { TRANSLATIONS, getDeviceDefaultLanguage } from '../constants/translations';

const USERS_STORAGE_KEY = 'mera_vyapaar_registered_users';
const HAS_SIGNED_UP_KEY = 'mera_vyapaar_has_signed_up';
const REGISTERED_PHONE_KEY = 'mera_vyapaar_registered_phone';

export interface RegisteredUser {
  phone: string;
  name: string;
  password?: string;
  registeredAt: number;
}

export const getRegisteredUsers = (): RegisteredUser[] => {
  try {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  const initial: RegisteredUser[] = [];
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initial));
  } catch {}
  return initial;
};

export const saveRegisteredUser = (user: RegisteredUser) => {
  const current = getRegisteredUsers();
  const filtered = current.filter((u) => u.phone !== user.phone);
  filtered.push(user);
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
  } catch {}
};

export const checkHasSignedUp = (): boolean => {
  try {
    return localStorage.getItem(HAS_SIGNED_UP_KEY) === 'true';
  } catch {
    return false;
  }
};

export const markHasSignedUp = (phone?: string) => {
  try {
    localStorage.setItem(HAS_SIGNED_UP_KEY, 'true');
    if (phone) {
      localStorage.setItem(REGISTERED_PHONE_KEY, phone.replace(/\D/g, ''));
    }
  } catch {}
};

interface PhoneAuthModalProps {
  onClose?: () => void;
  onLoginSuccess: (phone: string, lang: SupportedLanguage, name?: string) => void;
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  unsyncedRecordsCount?: number;
  inline?: boolean;
  isGate?: boolean;
}

interface I18nStrings {
  signInTitle: string;
  signUpTitle: string;
  signInTab: string;
  signUpTab: string;
  phoneLabel: string;
  businessNameLabel: string;
  businessNamePlaceholder: string;
  otpTab: string;
  passwordTab: string;
  passwordLabel: string;
  createPasswordLabel: string;
  passwordPlaceholder: string;
  sendOtp: string;
  loginWithPassword: string;
  createAccountBtn: string;
  passwordRequired: string;
  nameRequired: string;
  notRegisteredError: string;
  alreadyRegisteredError: string;
  signUpOnlyOnceError: string;
  alreadyRegisteredBadge: string;
  signUpOnceNotice: string;
  incorrectPassword: string;
  signUpNow: string;
  signInNow: string;
  noAccountPrompt: string;
  haveAccountPrompt: string;
  noSmsSwitchToPassword: string;
  changeNum: (num: string) => string;
  successTitle: string;
  signUpSuccessTitle: string;
  successDesc: string;
  signUpSuccessDesc: string;
  cancel: string;
}

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({
  onClose,
  onLoginSuccess,
  currentLang,
  onLanguageChange,
  inline = false,
  isGate = false
}) => {
  // Check if customer on this device has already completed sign up
  const [hasSignedUpOnce, setHasSignedUpOnce] = useState<boolean>(() => checkHasSignedUp());

  // If customer has already signed up once, they must ALWAYS be in SIGN_IN mode
  const [authMode, setAuthMode] = useState<'SIGN_IN' | 'SIGN_UP'>(() => {
    return checkHasSignedUp() ? 'SIGN_IN' : 'SIGN_IN';
  });

  const [phoneNumber, setPhoneNumber] = useState<string>(() => {
    try {
      const savedPhone = localStorage.getItem(REGISTERED_PHONE_KEY);
      if (savedPhone) return savedPhone;
    } catch {}
    return '';
  });

  const [businessName, setBusinessName] = useState('');
  const [authMethod, setAuthMethod] = useState<'OTP' | 'PASSWORD'>('OTP');
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'SUCCESS'>('PHONE');
  const [otpCode, setOtpCode] = useState(''); // REAL OTP - STARTS EMPTY!
  const [password, setPassword] = useState(''); // REAL PASSWORD - STARTS EMPTY!
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUnregisteredError, setIsUnregisteredError] = useState(false);

  // Firebase Phone Auth ConfirmationResult
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Dependent on user's mobile device default language
  const userLang: SupportedLanguage = currentLang || getDeviceDefaultLanguage();
  const t = TRANSLATIONS[userLang];

  // Cleanup reCAPTCHA verifier on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {}
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const setupRecaptcha = (): RecaptchaVerifier | null => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (e) {}
      recaptchaVerifierRef.current = null;
    }

    const container = document.getElementById('recaptcha-container');
    if (!container) return null;

    try {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          setErrorMsg('reCAPTCHA session expired. Please click Send OTP again.');
        }
      });
      recaptchaVerifierRef.current = verifier;
      return verifier;
    } catch (err) {
      console.warn('Firebase reCAPTCHA initialization notice:', err);
      return null;
    }
  };

  const i18nConfig: Record<SupportedLanguage, I18nStrings> = {
    hi: {
      signInTitle: 'लॉगिन / साइन इन',
      signUpTitle: 'नया खाता बनाएं (केवल एक बार साइन अप)',
      signInTab: 'साइन इन',
      signUpTab: 'साइन अप',
      phoneLabel: 'मोबाइल नंबर',
      businessNameLabel: 'व्यापारी या दुकान का नाम',
      businessNamePlaceholder: 'उदा. शर्मा किराना स्टोर या आपका नाम',
      otpTab: 'SMS OTP',
      passwordTab: 'पासवर्ड / पिन',
      passwordLabel: 'लॉगिन पासवर्ड / पिन',
      createPasswordLabel: 'नया पासवर्ड / पिन बनाएं',
      passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
      sendOtp: 'OTP प्राप्त करें',
      loginWithPassword: 'पासवर्ड से लॉगिन करें',
      createAccountBtn: 'खाता बनाएं (साइन अप)',
      passwordRequired: 'कृपया पासवर्ड दर्ज करें',
      nameRequired: 'कृपया अपना नाम या व्यापार का नाम दर्ज करें',
      notRegisteredError: 'यह मोबाइल नंबर पंजीकृत नहीं है! कृपया पहले साइन अप करें।',
      alreadyRegisteredError: 'यह नंबर पहले से पंजीकृत है! ग्राहक केवल 1 बार साइन अप कर सकते हैं। कृपया सीधे साइन इन करें।',
      signUpOnlyOnceError: 'ग्राहक केवल 1 बार साइन अप कर सकते हैं! खाता पहले से मौजूद है। सीधे साइन इन करें।',
      alreadyRegisteredBadge: 'खाता पंजीकृत है • अब केवल साइन इन करें',
      signUpOnceNotice: 'केवल 1 बार साइन अप करें, उसके बाद हमेशा साइन इन करें',
      incorrectPassword: 'पासवर्ड गलत है। कृपया पुनः प्रयास करें।',
      signUpNow: '👉 नया खाता बनाएं (साइन अप)',
      signInNow: '👉 सीधे साइन इन करें',
      noAccountPrompt: 'खाता नहीं है?',
      haveAccountPrompt: 'पहले से खाता है?',
      noSmsSwitchToPassword: 'SMS नहीं मिला? पासवर्ड से तुरंत लॉगिन करें',
      changeNum: (num: string) => `नंबर बदलें (+91 ${num})`,
      successTitle: 'सत्यापन सफल!',
      signUpSuccessTitle: 'साइन अप सफल! खाता बन गया',
      successDesc: 'सुरक्षित सत्र सक्रिय हुआ। रिकॉर्ड्स क्लाउड पर सिंक किए जा रहे हैं...',
      signUpSuccessDesc: 'आपका व्यापार खाता सुरक्षित रूप से तैयार हो गया है।',
      cancel: 'रद्द करें'
    },
    mr: {
      signInTitle: 'लॉगिन / साइन इन',
      signUpTitle: 'नवीन खाते तयार करा (फक्त एकदा साइन अप)',
      signInTab: 'साइन इन',
      signUpTab: 'साइन अप',
      phoneLabel: 'मोबाईल नंबर',
      businessNameLabel: 'व्यापारी किंवा दुकानाचे नाव',
      businessNamePlaceholder: 'उदा. शर्मा किराणा किंवा तुमचे नाव',
      otpTab: 'SMS OTP',
      passwordTab: 'पासवर्ड / पिन',
      passwordLabel: 'लॉगिन पासवर्ड / पिन',
      createPasswordLabel: 'नवीन पासवर्ड / पिन तयार करा',
      passwordPlaceholder: 'तुमचा पासवर्ड प्रविष्ट करा',
      sendOtp: 'OTP पाठवा',
      loginWithPassword: 'पासवर्डने लॉगिन करा',
      createAccountBtn: 'खाते तयार करा (साइन अप)',
      passwordRequired: 'कृपया पासवर्ड प्रविष्ट करा',
      nameRequired: 'कृपया आपले नाव प्रविष्ट करा',
      notRegisteredError: 'हा मोबाईल नंबर नोंदणीकृत नाही! कृपया आधी साइन अप करा.',
      alreadyRegisteredError: 'हा नंबर आधीच नोंदणीकृत आहे! ग्राहक फक्त एकदाच साइन अप करू शकतात. कृपया साइन इन करा.',
      signUpOnlyOnceError: 'ग्राहक फक्त एकदाच साइन अप करू शकतात! खाते आधीच तयार आहे. थेट साइन इन करा.',
      alreadyRegisteredBadge: 'खाते नोंदणीकृत आहे • आता फक्त साइन इन करा',
      signUpOnceNotice: 'फक्त एकदा साइन अप करा, त्यानंतर नेहमी साइन इन करा',
      incorrectPassword: 'पासवर्ड चुकीचा आहे. कृपया पुन्हा प्रयत्न करा.',
      signUpNow: '👉 नवीन खाते तयार करा (साइन अप)',
      signInNow: '👉 थेट साइन इन करा',
      noAccountPrompt: 'खाते नाही का?',
      haveAccountPrompt: 'आधीच खाते आहे का?',
      noSmsSwitchToPassword: 'SMS आला नाही? पासवर्डने त्वरित लॉगिन करा',
      changeNum: (num: string) => `नंबर बदला (+91 ${num})`,
      successTitle: 'सत्यापन यशस्वी!',
      signUpSuccessTitle: 'नोंदणी यशस्वी! खाते तयार झाले',
      successDesc: 'सुरक्षित सत्र सक्रिय झाले. नोंदी क्लाउडवर सिंक होत आहेत...',
      signUpSuccessDesc: 'तुमचे व्यापार खाते सुरक्षितपणे तयार झाले आहे.',
      cancel: 'रद्द करा'
    },
    te: {
      signInTitle: 'లాగిన్ / సైన్ ఇన్',
      signUpTitle: 'కొత్త ఖాతాను సృష్టించండి (ఒక్కసారి మాత్రమే సైన్ అప్)',
      signInTab: 'సైన్ ఇన్',
      signUpTab: 'సైన్ అప్',
      phoneLabel: 'మొబైల్ సంఖ్య',
      businessNameLabel: 'వ్యాపారి లేదా దుకాణం పేరు',
      businessNamePlaceholder: 'ఉదా. శర్మ కిరాణా లేదా మీ పేరు',
      otpTab: 'SMS OTP',
      passwordTab: 'పాస్‌వర్డ్ / పిన్',
      passwordLabel: 'లాగిన్ పాస్‌వర్డ్ / పిన్',
      createPasswordLabel: 'కొత్త పాస్‌వర్డ్ / పిన్ సృష్టించండి',
      passwordPlaceholder: 'మీ పాస్‌వర్డ్ నమోదు చేయండి',
      sendOtp: 'OTP పొందండి',
      loginWithPassword: 'పాస్‌వర్డ్‌తో లాగిన్ అవ్వండి',
      createAccountBtn: 'ఖాతాను సృష్టించండి (సైన్ అప్)',
      passwordRequired: 'దయచేసి పాస్‌వర్డ్ నమోదు చేయండి',
      nameRequired: 'దయచేసి మీ పేరు నమోదు చేయండి',
      notRegisteredError: 'ఈ మొబైల్ నంబర్ నమోదు చేయబడలేదు! దయచేసి సైన్ అప్ చేయండి.',
      alreadyRegisteredError: 'ఈ నంబర్ ఇప్పటికే నమోదు చేయబడింది! కస్టమర్ ఒక్కసారి మాత్రమే సైన్ అప్ చేయగలరు. దయచేసి సైన్ ఇన్ చేయండి.',
      signUpOnlyOnceError: 'కస్టమర్ ఒక్కసారి మాత్రమే సైన్ అప్ చేయగలరు! ఇప్పటికే ఖాతా ఉంది. దయచేసి సైన్ ఇన్ చేయండి.',
      alreadyRegisteredBadge: 'ఖాతా నమోదైంది • ఇప్పుడు నేరుగా సైన్ ఇన్ చేయండి',
      signUpOnceNotice: 'ఒక్కసారి మాత్రమే సైన్ అప్ చేయండి, ఆ తర్వాత ఎల్లప్పుడూ సైన్ ఇన్ చేయండి',
      incorrectPassword: 'పాస్‌వర్డ్ తప్పుగా ఉంది. దయచేసి మళ్లీ ప్రయత్నించండి.',
      signUpNow: '👉 కొత్త ఖాతాను సృష్టించండి (సైన్ అప్)',
      signInNow: '👉 నేరుగా సైన్ ఇన్ చేయండి',
      noAccountPrompt: 'ఖాతా లేదా?',
      haveAccountPrompt: 'ఇప్పటికే ఖాతా ఉందా?',
      noSmsSwitchToPassword: 'SMS రాలేదా? పాస్‌వర్డ్‌తో వెంటనే లాగిన్ అవ్వండి',
      changeNum: (num: string) => `నంబర్ మార్చండి (+91 ${num})`,
      successTitle: 'ధృవీకరణ విజయవంతమైంది!',
      signUpSuccessTitle: 'రిజిస్ట్రేషన్ విజయవంతమైంది!',
      successDesc: 'సురక్షిత సెషన్ ప్రారంభమైంది. రికార్డులు క్లౌడ్‌కు సింక్ అవుతున్నాయి...',
      signUpSuccessDesc: 'మీ వ్యాపార ఖాతా సిద్ధంగా ఉంది.',
      cancel: 'రద్దు చేయి'
    },
    ta: {
      signInTitle: 'உள்நுழைக (Sign In)',
      signUpTitle: 'புதிய கணக்கை உருவாக்கவும் (ஒரு முறை மட்டும்)',
      signInTab: 'உள்நுழைக',
      signUpTab: 'பதிவு செய்க',
      phoneLabel: 'மொபைல் எண்',
      businessNameLabel: 'வணிகர் அல்லது கடையின் பெயர்',
      businessNamePlaceholder: 'எ.கா. சர்மா மளிகை அல்லது உங்கள் பெயர்',
      otpTab: 'SMS OTP',
      passwordTab: 'கடவுச்சொல் / பின்',
      passwordLabel: 'உள்நுழைவு கடவுச்சொல் / பின்',
      createPasswordLabel: 'புதிய கடவுச்சொல்லை உருவாக்கவும்',
      passwordPlaceholder: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்',
      sendOtp: 'OTP பெறுக',
      loginWithPassword: 'கடவுச்சொல் மூலம் உள்நுழைக',
      createAccountBtn: 'கணக்கை உருவாக்கு (Sign Up)',
      passwordRequired: 'கடவுச்சொல்லை உள்ளிடவும்',
      nameRequired: 'உங்கள் பெயரை உள்ளிடவும்',
      notRegisteredError: 'இந்த மொபைல் எண் பதிவு செய்யப்படவில்லை! பதிவு செய்யவும்.',
      alreadyRegisteredError: 'இந்த எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது! வாடிக்கையாளர் ஒரு முறை மட்டுமே பதிவு செய்ய முடியும். உள்நுழைக.',
      signUpOnlyOnceError: 'வாடிக்கையாளர் ஒரு முறை மட்டுமே பதிவு செய்ய முடியும்! ஏற்கனவே கணக்கு உள்ளது. உள்நுழைக.',
      alreadyRegisteredBadge: 'கணக்கு பதிவு செய்யப்பட்டது • இப்போது உள்நுழைக',
      signUpOnceNotice: 'ஒரு முறை மட்டுமே பதிவு செய்து, அதன் பிறகு எப்போதும் உள்நுழையவும்',
      incorrectPassword: 'தவறான கடவுச்சொல். மீண்டும் முயற்சிக்கவும்.',
      signUpNow: '👉 பதிவு செய்க (Sign Up)',
      signInNow: '👉 உள்நுழைக (Sign In)',
      noAccountPrompt: 'கணக்கு இல்லையா?',
      haveAccountPrompt: 'ஏற்கனவே கணக்கு உள்ளதா?',
      noSmsSwitchToPassword: 'SMS வரவில்லையா? கடவுச்சொல் மூலம் உடனடியாக உள்நுழைக',
      changeNum: (num: string) => `எண் மாற்றுக (+91 ${num})`,
      successTitle: 'சரிபார்ப்பு வெற்றி!',
      signUpSuccessTitle: 'பதிவு வெற்றிகரமானது!',
      successDesc: 'பாதுகாப்பான அமர்வு தொடங்கியது. பதிவுகள் ஒத்திசைக்கப்படுகின்றன...',
      signUpSuccessDesc: 'உங்கள் வணிகக் கணக்கு தயாராக உள்ளது.',
      cancel: 'ரத்து செய்'
    },
    bn: {
      signInTitle: 'লগইন / সাইন ইন',
      signUpTitle: 'নতুন অ্যাকাউন্ট তৈরি করুন (কেবল একবার সাইন আপ)',
      signInTab: 'সাইন ইন',
      signUpTab: 'সাইন আপ',
      phoneLabel: 'মোবাইল নম্বর',
      businessNameLabel: 'ব্যবসায়ী বা দোকানের নাম',
      businessNamePlaceholder: 'যেমন শর্মা মুদি বা আপনার নাম',
      otpTab: 'SMS OTP',
      passwordTab: 'পাসওয়ার্ড / পিন',
      passwordLabel: 'লগইন পাসওয়ার্ড / পিন',
      createPasswordLabel: 'নতুন পাসওয়ার্ড / পিন তৈরি করুন',
      passwordPlaceholder: 'আপনার পাসওয়ার্ড লিখুন',
      sendOtp: 'OTP পাঠান',
      loginWithPassword: 'পাসওয়ার্ড দিয়ে লগইন করুন',
      createAccountBtn: 'অ্যাকাউন্ট তৈরি করুন (সাইন আপ)',
      passwordRequired: 'অনুগ্রহ করে পাসওয়ার্ড লিখুন',
      nameRequired: 'অনুগ্রহ করে নাম লিখুন',
      notRegisteredError: 'এই মোবাইল নম্বরটি নিবন্ধিত নয়! অনুগ্রহ করে সাইন আপ করুন।',
      alreadyRegisteredError: 'এই নম্বরটি ইতিমধ্যে নিবন্ধিত! গ্রাহক কেবল একবার সাইন আপ করতে পারবেন। অনুগ্রহ করে সাইন ইন করুন।',
      signUpOnlyOnceError: 'গ্রাহক কেবল একবার সাইন আপ করতে পারবেন! অ্যাকাউন্ট ইতিমধ্যে প্রস্তুত। সরাসরি সাইন ইন করুন।',
      alreadyRegisteredBadge: 'অ্যাকাউন্ট নিবন্ধিত • এখন কেবল সাইন ইন করুন',
      signUpOnceNotice: 'কেবল একবার সাইন আপ করুন, এরপর সর্বদা সাইন ইন করুন',
      incorrectPassword: 'ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।',
      signUpNow: '👉 নতুন অ্যাকাউন্ট তৈরি করুন (সাইন আপ)',
      signInNow: '👉 সাইন ইন করুন',
      noAccountPrompt: 'অ্যাকাউন্ট নেই?',
      haveAccountPrompt: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
      noSmsSwitchToPassword: 'SMS আসেনি? পাসওয়ার্ড দিয়ে অবিলম্বে লগইন করুন',
      changeNum: (num: string) => `নম্বর পরিবর্তন করুন (+91 ${num})`,
      successTitle: 'যাচাইকরণ সফল!',
      signUpSuccessTitle: 'নিবন্ধন সফল হয়েছে!',
      successDesc: 'সুরক্ষিত সেশন সক্রিয় হয়েছে। রেকর্ডগুলি ক্লাউডে সিঙ্ক হচ্ছে...',
      signUpSuccessDesc: 'আপনার ব্যবসা অ্যাকাউন্ট তৈরি হয়েছে।',
      cancel: 'বাতিল করুন'
    },
    en: {
      signInTitle: 'Sign In to Vyapaar',
      signUpTitle: 'Create New Account (Sign Up Once)',
      signInTab: 'Sign In',
      signUpTab: 'Sign Up',
      phoneLabel: 'Mobile Number',
      businessNameLabel: 'Merchant / Shop Name',
      businessNamePlaceholder: 'e.g. Sharma Kirana or Your Name',
      otpTab: 'SMS OTP',
      passwordTab: 'Password / PIN',
      passwordLabel: 'Account Password / PIN',
      createPasswordLabel: 'Create Password / PIN',
      passwordPlaceholder: 'Enter your password',
      sendOtp: 'Send OTP',
      loginWithPassword: 'Sign In with Password',
      createAccountBtn: 'Create Account & Sign Up',
      passwordRequired: 'Please enter your password',
      nameRequired: 'Please enter your name or business name',
      notRegisteredError: 'This mobile number is not registered! Please sign up first.',
      alreadyRegisteredError: 'This mobile number is already registered! Customer can sign up only once. Please sign in.',
      signUpOnlyOnceError: 'Customer can only sign up once! An account already exists. Please Sign In below.',
      alreadyRegisteredBadge: 'Account Registered • Sign In with OTP or Password',
      signUpOnceNotice: 'Sign up only once, then sign in thereafter',
      incorrectPassword: 'Incorrect password. Please try again.',
      signUpNow: '👉 Create an Account (Sign Up)',
      signInNow: '👉 Sign In Directly',
      noAccountPrompt: 'Don’t have an account?',
      haveAccountPrompt: 'Already have an account?',
      noSmsSwitchToPassword: 'Didn’t receive SMS? Login with Password',
      changeNum: (num: string) => `Change (+91 ${num})`,
      successTitle: 'Login Successful!',
      signUpSuccessTitle: 'Account Created Successfully!',
      successDesc: 'Encrypted session established. Records syncing...',
      signUpSuccessDesc: 'Your merchant account is created and activated.',
      cancel: 'Cancel'
    }
  };

  const i18n = i18nConfig[userLang] || i18nConfig.en;
  const cleanPhone = phoneNumber.replace(/\D/g, '');

  // Check if a user is registered
  const findRegisteredUser = (phoneToFind: string) => {
    const users = getRegisteredUsers();
    return users.find((u) => u.phone === phoneToFind);
  };

  // Switch between Sign In and Sign Up tabs
  const handleSwitchMode = (newMode: 'SIGN_IN' | 'SIGN_UP') => {
    // STRICT RULE: Customer can only sign up once!
    if (newMode === 'SIGN_UP' && hasSignedUpOnce) {
      setErrorMsg(i18n.signUpOnlyOnceError);
      setAuthMode('SIGN_IN');
      return;
    }

    setAuthMode(newMode);
    setErrorMsg(null);
    setIsUnregisteredError(false);
    setStep('PHONE');

    if (newMode === 'SIGN_UP') {
      const existing = findRegisteredUser(cleanPhone);
      if (existing) {
        setPhoneNumber('');
      }
    }
  };

  // Real Firebase Phone Auth: Send SMS OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cleanPhone.length < 10) return;
    setErrorMsg(null);
    setIsUnregisteredError(false);

    // Enforce: User MUST be registered first
    const existingUser = findRegisteredUser(cleanPhone);
    if (!existingUser) {
      setIsUnregisteredError(true);
      setErrorMsg(i18n.notRegisteredError);
      return;
    }

    setIsVerifying(true);
    setConfirmationResult(null);

    const formattedPhone = `+91${cleanPhone.slice(-10)}`;

    try {
      const appVerifier = setupRecaptcha();
      if (!appVerifier) {
        throw new Error('Could not initialize reCAPTCHA verifier for phone authentication.');
      }

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setIsVerifying(false);
      setOtpCode(''); // START WITH EMPTY OTP CODE FOR USER INPUT!
      setStep('OTP');
    } catch (err: any) {
      console.warn('Firebase Phone Auth error:', err);
      setIsVerifying(false);

      let userError = 'Could not send SMS OTP via Firebase. Please check your phone number or try Password Login.';
      if (err.code === 'auth/invalid-phone-number') {
        userError = 'Invalid phone number format. Please enter a valid 10-digit mobile number.';
      } else if (err.code === 'auth/too-many-requests' || err.code === 'auth/quota-exceeded') {
        userError = 'SMS OTP quota limit exceeded for this number. Please use Password Login or try again later.';
      } else if (err.code === 'auth/captcha-check-failed') {
        userError = 'reCAPTCHA verification failed. Please refresh or use Password Login.';
      } else if (err.message) {
        userError = `Firebase Phone Auth: ${err.message}`;
      }

      setErrorMsg(userError);
    }
  };

  // Real Firebase Phone Auth: Verify SMS OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) return;

    if (!confirmationResult) {
      setErrorMsg('OTP session expired. Please click Change Number / Send OTP again.');
      return;
    }

    setErrorMsg(null);
    setIsVerifying(true);

    try {
      const userCredential = await confirmationResult.confirm(otpCode);
      const user = userCredential.user;

      setIsVerifying(false);
      setStep('SUCCESS');
      markHasSignedUp(cleanPhone);
      setHasSignedUpOnce(true);

      const existing = findRegisteredUser(cleanPhone);
      if (!existing) {
        saveRegisteredUser({
          phone: cleanPhone,
          name: user.displayName || businessName || `Merchant (${cleanPhone.slice(-4)})`,
          registeredAt: Date.now()
        });
      }

      setTimeout(() => {
        onLanguageChange(userLang);
        onLoginSuccess(`+91 ${cleanPhone}`, userLang, existing?.name || businessName || 'Merchant');
        if (onClose) onClose();
      }, 1200);
    } catch (err: any) {
      console.warn('Firebase OTP verification error:', err);
      setIsVerifying(false);

      let userError = 'Incorrect OTP code. Please check your SMS and try again.';
      if (err.code === 'auth/invalid-verification-code') {
        userError = 'Invalid 6-digit OTP code. Please enter the correct code received on SMS.';
      } else if (err.code === 'auth/code-expired') {
        userError = 'OTP code has expired. Please click Change Number to resend OTP.';
      } else if (err.message) {
        userError = err.message;
      }

      setErrorMsg(userError);
    }
  };

  // Real Firebase Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cleanPhone.length < 10) return;
    if (!password.trim()) {
      setErrorMsg(i18n.passwordRequired);
      return;
    }
    setErrorMsg(null);
    setIsUnregisteredError(false);

    const existingUser = findRegisteredUser(cleanPhone);
    if (!existingUser) {
      setIsUnregisteredError(true);
      setErrorMsg(i18n.notRegisteredError);
      return;
    }

    setIsVerifying(true);

    try {
      // Authenticate directly against Firebase Auth using phone-based email mapping
      await ensureFirebaseAuthSession(cleanPhone, existingUser.name, password.trim());

      setIsVerifying(false);
      setStep('SUCCESS');
      markHasSignedUp(cleanPhone);
      setHasSignedUpOnce(true);

      setTimeout(() => {
        onLanguageChange(userLang);
        onLoginSuccess(`+91 ${cleanPhone}`, userLang, existingUser.name || 'Merchant');
        if (onClose) onClose();
      }, 1200);
    } catch (err: any) {
      console.warn('Firebase Password Auth error:', err);
      setIsVerifying(false);

      let userError = i18n.incorrectPassword;
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        userError = i18n.incorrectPassword;
      } else if (err.message) {
        userError = err.message;
      }

      setErrorMsg(userError);
    }
  };

  // Real Firebase Sign Up & Password Account Creation
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasSignedUpOnce) {
      setErrorMsg(i18n.signUpOnlyOnceError);
      setAuthMode('SIGN_IN');
      return;
    }

    if (!businessName.trim()) {
      setErrorMsg(i18n.nameRequired);
      return;
    }
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!password.trim()) {
      setErrorMsg(i18n.passwordRequired);
      return;
    }

    setErrorMsg(null);
    setIsUnregisteredError(false);

    const existing = findRegisteredUser(cleanPhone);
    if (existing) {
      markHasSignedUp(cleanPhone);
      setHasSignedUpOnce(true);
      setErrorMsg(i18n.signUpOnlyOnceError);
      setAuthMode('SIGN_IN');
      return;
    }

    setIsVerifying(true);

    try {
      // Create Firebase Auth account with user's selected password
      await ensureFirebaseAuthSession(cleanPhone, businessName.trim(), password.trim());

      saveRegisteredUser({
        phone: cleanPhone,
        name: businessName.trim(),
        password: password.trim(),
        registeredAt: Date.now()
      });

      markHasSignedUp(cleanPhone);
      setHasSignedUpOnce(true);

      setIsVerifying(false);
      setStep('SUCCESS');
      setTimeout(() => {
        onLanguageChange(userLang);
        onLoginSuccess(`+91 ${cleanPhone}`, userLang, businessName.trim());
        if (onClose) onClose();
      }, 1200);
    } catch (err: any) {
      console.warn('Firebase Account Creation error:', err);
      setIsVerifying(false);
      setErrorMsg(err.message || 'Could not create account with Firebase. Please try again.');
    }
  };

  const modalBody = (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
      {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
      <div id="recaptcha-container"></div>

      {/* Header */}
      <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-emerald-950 p-4 sm:p-6 border-b border-stone-800 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-emerald-600 to-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-emerald-950/60 ring-2 ring-emerald-500/30">
          <span className="font-bold text-white text-2xl tracking-tight font-serif drop-shadow-md">व्या</span>
        </div>
        <h3 className="text-lg sm:text-lg sm:text-xl font-bold text-white tracking-wide">Mera Vyapaar</h3>
        <p className="text-xs text-stone-400 mt-1">
          {authMode === 'SIGN_IN' ? i18n.signInTitle : i18n.signUpTitle}
        </p>
      </div>

      <div className="p-4 sm:p-6">
        {step !== 'SUCCESS' && (
          <div className="mb-5">
            {hasSignedUpOnce ? (
              <div className="mb-3 px-3 py-2 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-medium">
                  <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{i18n.alreadyRegisteredBadge}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 mb-3">
                <div className="grid grid-cols-2 bg-stone-950 p-1 rounded-2xl border border-stone-800">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('SIGN_IN')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                      authMode === 'SIGN_IN'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{i18n.signInTab}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('SIGN_UP')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                      authMode === 'SIGN_UP'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{i18n.signUpTab}</span>
                  </button>
                </div>
              </div>
            )}

            {authMode === 'SIGN_IN' && step === 'PHONE' && (
              <div className="grid grid-cols-2 bg-stone-950/70 p-1 rounded-xl border border-stone-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('OTP');
                    setErrorMsg(null);
                  }}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                    authMethod === 'OTP'
                      ? 'bg-stone-800 text-emerald-400 shadow-sm border border-emerald-500/30'
                      : 'text-stone-400 hover:text-stone-300'
                  }`}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>{i18n.otpTab}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('PASSWORD');
                    setErrorMsg(null);
                  }}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                    authMethod === 'PASSWORD'
                      ? 'bg-stone-800 text-amber-400 shadow-sm border border-amber-500/30'
                      : 'text-stone-400 hover:text-stone-300'
                  }`}
                >
                  <KeyRound className="w-3 h-3" />
                  <span>{i18n.passwordTab}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error Message Alert */}
        {errorMsg && (
          <div className="mb-4 p-3.5 bg-red-950/70 border border-red-800/90 text-red-200 text-xs rounded-2xl flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
            {isUnregisteredError && !hasSignedUpOnce && (
              <button
                type="button"
                onClick={() => handleSwitchMode('SIGN_UP')}
                className="mt-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition text-left self-start flex items-center gap-1.5 shadow"
              >
                <span>{i18n.signUpNow}</span>
              </button>
            )}
          </div>
        )}

        {/* ================= SIGN IN MODE ================= */}
        {authMode === 'SIGN_IN' && (
          <>
            {/* OTP Method: Phone Step */}
            {authMethod === 'OTP' && step === 'PHONE' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-stone-300 block mb-1">
                    {i18n.phoneLabel}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-300 font-mono text-sm">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value.replace(/\D/g, ''));
                        setErrorMsg(null);
                        setIsUnregisteredError(false);
                      }}
                      placeholder="98765 43210"
                      className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-100 font-mono text-base focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || cleanPhone.length < 10}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{i18n.sendOtp}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {!hasSignedUpOnce && (
                  <div className="text-center pt-2">
                    <p className="text-xs text-stone-400">
                      {i18n.noAccountPrompt}{' '}
                      <button
                        type="button"
                        onClick={() => handleSwitchMode('SIGN_UP')}
                        className="text-emerald-400 font-semibold hover:underline ml-1"
                      >
                        {i18n.signUpTab}
                      </button>
                    </p>
                  </div>
                )}
              </form>
            )}

            {/* OTP Method: OTP Code Step */}
            {authMethod === 'OTP' && step === 'OTP' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-stone-300">
                      {t.otpCode}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('PHONE');
                        setConfirmationResult(null);
                      }}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      {i18n.changeNum(cleanPhone)}
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="------"
                    className="w-full bg-stone-950 border border-emerald-500/50 rounded-xl px-4 py-3 text-center text-stone-100 font-mono text-2xl tracking-[0.5em] focus:outline-none focus:border-emerald-500 placeholder:tracking-normal placeholder:text-stone-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || otpCode.length !== 6}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t.verifyOtp}</span>
                    </>
                  )}
                </button>

                <div className="pt-2 text-center border-t border-stone-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('PASSWORD');
                      setStep('PHONE');
                      setConfirmationResult(null);
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1.5 transition"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{i18n.noSmsSwitchToPassword}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Password Method */}
            {authMethod === 'PASSWORD' && step !== 'SUCCESS' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-stone-300 block mb-1">
                    {i18n.phoneLabel}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-300 font-mono text-sm">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value.replace(/\D/g, ''));
                        setErrorMsg(null);
                        setIsUnregisteredError(false);
                      }}
                      placeholder="98765 43210"
                      className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-100 font-mono text-base focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-300 block mb-1">
                    {i18n.passwordLabel}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={i18n.passwordPlaceholder}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-4 pr-11 py-2.5 text-stone-100 font-mono text-sm focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-stone-400 hover:text-stone-200 p-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || cleanPhone.length < 10 || !password.trim()}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-amber-950 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>{i18n.loginWithPassword}</span>
                    </>
                  )}
                </button>

                {!hasSignedUpOnce && (
                  <div className="text-center pt-2">
                    <p className="text-xs text-stone-400">
                      {i18n.noAccountPrompt}{' '}
                      <button
                        type="button"
                        onClick={() => handleSwitchMode('SIGN_UP')}
                        className="text-emerald-400 font-semibold hover:underline ml-1"
                      >
                        {i18n.signUpTab}
                      </button>
                    </p>
                  </div>
                )}
              </form>
            )}
          </>
        )}

        {/* ================= SIGN UP MODE ================= */}
        {authMode === 'SIGN_UP' && !hasSignedUpOnce && step !== 'SUCCESS' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-stone-300 block mb-1">
                {i18n.businessNameLabel}
              </label>
              <div className="flex items-center gap-2 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 focus-within:border-emerald-500">
                <Store className="w-4 h-4 text-stone-400 shrink-0" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={i18n.businessNamePlaceholder}
                  className="flex-1 bg-transparent text-stone-100 text-sm focus:outline-none placeholder:text-stone-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-stone-300 block mb-1">
                {i18n.phoneLabel}
              </label>
              <div className="flex items-center gap-2">
                <span className="bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-300 font-mono text-sm">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value.replace(/\D/g, ''));
                    setErrorMsg(null);
                  }}
                  placeholder="98765 43210"
                  className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-100 font-mono text-base focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-stone-300 block mb-1">
                {i18n.createPasswordLabel}
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={i18n.passwordPlaceholder}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-4 pr-11 py-2.5 text-stone-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-stone-400 hover:text-stone-200 p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying || cleanPhone.length < 10 || !businessName.trim() || !password.trim()}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 disabled:opacity-50"
            >
              {isVerifying ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{i18n.createAccountBtn}</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-stone-400">
                {i18n.haveAccountPrompt}{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('SIGN_IN')}
                  className="text-emerald-400 font-semibold hover:underline ml-1"
                >
                  {i18n.signInTab}
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Success Step */}
        {step === 'SUCCESS' && (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">
              {authMode === 'SIGN_UP' ? i18n.signUpSuccessTitle : i18n.successTitle}
            </h4>
            <p className="text-xs text-stone-400">
              {authMode === 'SIGN_UP' ? i18n.signUpSuccessDesc : i18n.successDesc}
            </p>
          </div>
        )}

        {!isGate && onClose && (
          <div className="mt-4 pt-4 border-t border-stone-800 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-stone-400 hover:text-stone-200"
            >
              {i18n.cancel}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (inline) {
    return <div className="w-full max-w-md mx-auto">{modalBody}</div>;
  }

  return (
    <div className="fixed inset-0 overflow-y-auto z-50 bg-black/80 backdrop-blur-md overflow-y-auto p-4 flex justify-center items-center">
      {modalBody}
    </div>
  );
};
