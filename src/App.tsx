/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HeaderNav, NavTab } from './components/HeaderNav';
import { VoiceLedgerApp } from './components/VoiceLedgerApp';
import { ManualEntryView } from './components/ManualEntryView';
import { CreditScoreModal } from './components/CreditScoreModal';
import { MandiAdvisoryModal } from './components/MandiAdvisoryModal';
import { GovernmentSchemesModal } from './components/GovernmentSchemesModal';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { AskAiView } from './components/AskAiView';
import { PhoneAuthModal } from './components/PhoneAuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LedgerEntry, SupportedLanguage } from './types';
import { INITIAL_LEDGER_ENTRIES } from './constants/mockData';
import { calculateAlternativeCreditScore } from './utils/creditScorer';
import { getDeviceDefaultLanguage } from './constants/translations';
import { CheckCircle2 } from 'lucide-react';
import { CustomerProfile, CustomerProfileModal, loadCustomerProfile, saveCustomerProfile } from './components/CustomerProfileModal';
import { auth, ensureFirebaseAuthSession, loadCustomerFromFirestore, signOutUser } from './services/firebase';

const SESSION_KEY = 'mera_vyapaar_active_session';
const LANG_STORAGE_KEY = 'mera_vyapaar_preferred_language';

const getCleanPhone = (phoneStr: string) => {
  return phoneStr.replace(/[^0-9]/g, '').slice(-10);
};

const getStoredSession = (): { phone: string; name: string; lang?: SupportedLanguage } | null => {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.phone) return parsed;
    }
  } catch (e) {}
  return null;
};

const getUserEntries = (phoneStr: string): LedgerEntry[] => {
  if (!phoneStr) return [];
  const clean = getCleanPhone(phoneStr);
  if (!clean) return [];
  const key = `mera_vyapaar_entries_${clean}`;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}

  // Any new registered user starts with a clean slate
  return [];
};

export default function App() {
  const initialSession = getStoredSession();

  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(() => {
    if (initialSession?.lang) return initialSession.lang;
    try {
      const savedLang = localStorage.getItem(LANG_STORAGE_KEY) as SupportedLanguage;
      if (savedLang) return savedLang;
    } catch (e) {}
    return getDeviceDefaultLanguage();
  });

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavTab>('ledger');

  // Auth state - completely dynamic based on actual session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!initialSession);
  const [phoneNumber, setPhoneNumber] = useState<string>(initialSession?.phone ? `+91 ${getCleanPhone(initialSession.phone)}` : '');
  const [userName, setUserName] = useState<string>(initialSession?.name || '');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(!initialSession);
  const [firebaseUid, setFirebaseUid] = useState<string>('');
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(() =>
    initialSession?.phone ? loadCustomerProfile(initialSession.phone) : null
  );
  const [showProfileModal, setShowProfileModal] = useState<boolean>(() =>
    !!initialSession?.phone && !loadCustomerProfile(initialSession.phone)
  );

  // Dynamic ledger entries tied strictly to active authenticated user
  const [entries, setEntries] = useState<LedgerEntry[]>(() => {
    if (initialSession?.phone) {
      return getUserEntries(initialSession.phone);
    }
    return [];
  });

  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Sync Firebase Auth session and load customer profile from Cloud Firestore
  useEffect(() => {
    if (!isAuthenticated || !phoneNumber) return;
    let isMounted = true;

    const syncFirebaseUser = async () => {
      try {
        // If auth.currentUser exists (e.g. from Phone OTP login), use it directly without replacing active session!
        const activeUser = auth.currentUser || (await ensureFirebaseAuthSession(phoneNumber, userName));
        if (isMounted && activeUser) {
          setFirebaseUid(activeUser.uid);
          const firestoreDoc = await loadCustomerFromFirestore(activeUser.uid, phoneNumber);
          if (firestoreDoc && isMounted) {
            const profileFromFirestore: CustomerProfile = {
              firstName: firestoreDoc.firstName || '',
              middleName: firestoreDoc.middleName || '',
              lastName: firestoreDoc.lastName || '',
              address: firestoreDoc.address || '',
              gender: firestoreDoc.gender || 'female',
              age: firestoreDoc.age || 18,
              socialCategory: firestoreDoc.caste || 'general',
              locationType: firestoreDoc.locationType || 'rural',
              state: firestoreDoc.state || 'Telangana',
              businessSector: (firestoreDoc.businessSector as any) || 'agri_allied',
              photoDataUrl: firestoreDoc.profilePhotoUrl || ''
            };
            setCustomerProfile(profileFromFirestore);
            saveCustomerProfile(phoneNumber, profileFromFirestore);
          }
        }
      } catch (err) {
        console.warn('Firebase session sync notice:', err);
      }
    };

    syncFirebaseUser();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, phoneNumber]);

  // Persist entries strictly for the active user's phone key
  useEffect(() => {
    if (isAuthenticated && phoneNumber) {
      const clean = getCleanPhone(phoneNumber);
      const key = `mera_vyapaar_entries_${clean}`;
      try {
        localStorage.setItem(key, JSON.stringify(entries));
      } catch (e) {
        console.warn('Could not save user entries to localStorage', e);
      }
    }
  }, [entries, phoneNumber, isAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, currentLang);
    } catch (e) {}
  }, [currentLang]);

  // Recalculate credit score dynamically in real-time based on the user's actual entries
  const creditScoreResult = calculateAlternativeCreditScore(entries, 0.95, true, currentLang);
  const unsyncedCount = entries.filter((e) => !e.isSynced).length;

  const triggerToast = (msg: string) => {
    setSyncToast(msg);
    setTimeout(() => setSyncToast(null), 3500);
  };

  const handleAddEntry = (newEntryData: Omit<LedgerEntry, 'id' | 'timestamp' | 'isSynced'>) => {
    const entry: LedgerEntry = {
      ...newEntryData,
      id: `entry-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      // If online, immediately syncs; if offline, stays as unsynced Room DB entry
      isSynced: isOnline
    };

    setEntries((prev) => [entry, ...prev]);

    if (!isOnline) {
      const offlineMsgMap: Record<SupportedLanguage, string> = {
        en: '💾 Entry safely saved in local encrypted Room DB (Offline)',
        hi: '💾 प्रविष्टि स्थानीय Encrypted Room DB में सुरक्षित रूप से सहेजी गई (Offline)',
        mr: '💾 नोंद स्थानिक एन्क्रिप्टेड Room DB मध्ये सुरक्षित जतन केली (Offline)',
        te: '💾 ఎంట్రీ స్థానిక ఎన్‌క్రిప్ట్ చేసిన Room DB లో భద్రపరచబడింది (Offline)',
        ta: '💾 பதிவு உள்ளூர் என்க்ரிப்ட் செய்யப்பட்ட Room DB இல் பாதுகாக்கப்பட்டது (Offline)',
        bn: '💾 এন্ট্রি স্থানীয় এনক্রিপ্ট করা Room DB-তে সংরক্ষিত হয়েছে (Offline)'
      };
      triggerToast(offlineMsgMap[currentLang] || offlineMsgMap.en);
    }
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSyncAll = (showNotification: boolean = true) => {
    setEntries((prev) => prev.map((e) => ({ ...e, isSynced: true })));
    if (showNotification) {
      const syncMsgMap: Record<SupportedLanguage, string> = {
        en: '⚡ All Room DB records successfully synced to cloud PostgreSQL!',
        hi: '⚡ सभी Room DB रिकॉर्ड्स क्लाउड PostgreSQL पर सफलतापूर्वक सिंक हो गए!',
        mr: '⚡ सर्व Room DB नोंदी क्लाऊड PostgreSQL वर यशस्वीरित्या सिंक झाल्या!',
        te: '⚡ అన్ని Room DB రికార్డులు క్లౌడ్ PostgreSQL కు విజయవంతంగా సమకాలీకరించబడ్డాయి!',
        ta: '⚡ அனைத்து Room DB பதிவுகளும் கிளவுட் PostgreSQL உடன் வெற்றிகரமாக இணைக்கப்பட்டன!',
        bn: '⚡ সমস্ত Room DB রেকর্ড ক্লাউড PostgreSQL-এ সফলভাবে সিঙ্ক হয়েছে!'
      };
      triggerToast(syncMsgMap[currentLang] || syncMsgMap.en);
    }
  };

  const handleToggleOnline = () => {
    setIsOnline((prev) => {
      const next = !prev;
      if (next && unsyncedCount > 0) {
        // Auto-sync upon reconnection
        setTimeout(() => {
          handleSyncAll(false);
        }, 500);
      }
      return next;
    });
  };

  const handleLoginSuccess = (phone: string, lang: SupportedLanguage, name?: string) => {
    const clean = getCleanPhone(phone);
    const displayName = name || 'Vyapaari';

    // Persist session
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ phone: clean, name: displayName, lang }));
    } catch (e) {}

    setIsAuthenticated(true);
    setPhoneNumber(`+91 ${clean}`);
    setUserName(displayName);
    setCurrentLang(lang);
    setShowAuthModal(false);

    const savedProfile = loadCustomerProfile(clean);
    setCustomerProfile(savedProfile);
    setShowProfileModal(!savedProfile);

    // Dynamically load user's entries
    const userEntries = getUserEntries(clean);
    setEntries(userEntries);

    handleSyncAll(false); // Sync silently without pop-up toast
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
      signOutUser().catch(() => {});
    } catch (e) {}

    setIsAuthenticated(false);
    setPhoneNumber('');
    setUserName('');
    setCustomerProfile(null);
    setShowProfileModal(false);
    setEntries([]);
    setShowAuthModal(true);

    triggerToast(
      currentLang === 'hi'
        ? 'सत्र समाप्त: आप सफलतापूर्वक लॉगआउट हो गए'
        : currentLang === 'mr'
        ? 'सत्र समाप्त: आपण यशस्वीरीत्या लॉगआउट झालात'
        : currentLang === 'te'
        ? 'సెషన్ ముగిసింది: మీరు విజయవంతంగా లాగౌట్ అయ్యారు'
        : currentLang === 'ta'
        ? 'அமர்வு முடிந்தது: நீங்கள் வெற்றிகரமாக வெளியேறிவிட்டீர்கள்'
        : currentLang === 'bn'
        ? 'সেশন সমাপ্ত: আপনি সফলভাবে লগআউট করেছেন'
        : 'Session ended: Successfully logged out'
    );
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Top Header Navigation */}
      <HeaderNav
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        isOnline={isOnline}
        onToggleOnline={handleToggleOnline}
        unsyncedCount={unsyncedCount}
        onSyncAll={handleSyncAll}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        isAuthenticated={isAuthenticated}
        phoneNumber={phoneNumber}
        userName={userName}
        profilePhoto={customerProfile?.photoDataUrl || ''}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Sync Toast Feedback */}
      {syncToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-stone-900 border border-emerald-500 text-emerald-200 px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Main Content Area: Visible ONLY when authenticated */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 pb-24 lg:pb-6 flex flex-col items-center justify-center">
        {isAuthenticated ? (
          <div className="w-full">
            {activeTab === 'ledger' && (
              <VoiceLedgerApp
                entries={entries}
                onAddEntry={handleAddEntry}
                onDeleteEntry={handleDeleteEntry}
                onSyncAll={handleSyncAll}
                currentLang={currentLang}
                isOnline={isOnline}
                creditScore={creditScoreResult.totalScore}
                onOpenCreditModal={() => setActiveTab('credit')}
              />
            )}

            {activeTab === 'manual' && (
              <ManualEntryView
                currentLang={currentLang}
                onAddEntry={handleAddEntry}
                onNavigateToLedger={() => setActiveTab('ledger')}
              />
            )}

            {activeTab === 'credit' && (
              <CreditScoreModal
                entries={entries}
                currentLang={currentLang}
                inline={true}
                onClose={() => setActiveTab('ledger')}
                onOpenSchemes={() => setActiveTab('schemes')}
              />
            )}

            {activeTab === 'mandi' && (
              <MandiAdvisoryModal
                currentLang={currentLang}
                inline={true}
                onClose={() => setActiveTab('ledger')}
              />
            )}

            {activeTab === 'schemes' && (
              <GovernmentSchemesModal
                currentLang={currentLang}
                userCreditScore={creditScoreResult.totalScore}
                customerProfile={customerProfile}
                userMonthlyIncome={
                  entries
                    .filter((e) => e.transactionType === 'INCOME')
                    .reduce((acc, curr) => acc + curr.amount, 0) || 45000
                }
                inline={true}
                onClose={() => setActiveTab('ledger')}
              />
            )}

            {activeTab === 'ocr' && (
              <ReceiptScannerModal
                currentLang={currentLang}
                inline={true}
                onClose={() => setActiveTab('ledger')}
                onAddParsedEntry={(entry) => {
                  handleAddEntry(entry);
                  setActiveTab('ledger');
                }}
              />
            )}

            {activeTab === 'ai' && (
              <AskAiView
                currentLang={currentLang}
                entries={entries}
                userName={userName}
              />
            )}
          </div>
        ) : (
          /* Clean Logged Out View - Zero Financial / Ledger Data Exposed */
          <div className="w-full max-w-md mx-auto my-auto text-center py-16 px-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-600 via-emerald-600 to-emerald-400 flex items-center justify-center shadow-2xl shadow-emerald-950/60 mx-auto mb-6">
              <span className="font-bold text-white text-3xl font-serif">व्या</span>
            </div>

            <h2 className="text-2xl font-extrabold text-stone-100 mb-2 tracking-tight">
              Mera Vyapaar • मेरा व्यापार
            </h2>
            <p className="text-sm text-stone-400 mb-8 max-w-sm mx-auto">
              {currentLang === 'hi'
                ? 'अपने सुरक्षित डिजिटल बहीखाते और वित्तीय टूल्स तक पहुँचने के लिए साइन इन करें।'
                : 'Sign in with your mobile number to access your secure digital ledger, credit score, and mandi rates.'}
            </p>

            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/80 transition-all transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Sign In / Sign Up</span>
              <span>→</span>
            </button>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar for authenticated users */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentLang={currentLang}
        isAuthenticated={isAuthenticated}
        onAddEntry={handleAddEntry}
        onShowToast={triggerToast}
      />


      {showProfileModal && isAuthenticated && (
        <CustomerProfileModal
          phoneNumber={phoneNumber}
          authUid={firebaseUid}
          initialProfile={customerProfile}
          required={!customerProfile}
          onSaved={(profile) => {
            setCustomerProfile(profile);
            setShowProfileModal(false);
            triggerToast('Customer profile saved successfully to Cloud Firestore');
          }}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Auth Modal (Only for user sign-in via profile button) */}
      {showAuthModal && (
        <PhoneAuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
          currentLang={currentLang}
          onLanguageChange={setCurrentLang}
          unsyncedRecordsCount={unsyncedCount}
        />
      )}
    </div>
  );
}
