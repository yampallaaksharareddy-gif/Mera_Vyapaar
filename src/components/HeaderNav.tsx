import React from 'react';
import {
  Globe,
  TrendingUp,
  FileText,
  ScanLine,
  BookOpen,
  LogOut,
  PlusCircle,
  RefreshCw,
  User,
  Sparkles
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../constants/translations';

export type NavTab = 'ledger' | 'manual' | 'credit' | 'mandi' | 'schemes' | 'ocr' | 'ai';

interface HeaderNavProps {
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isOnline?: boolean;
  onToggleOnline?: () => void;
  unsyncedCount?: number;
  onSyncAll?: () => void;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenAuth: () => void;
  onLogout?: () => void;
  isAuthenticated: boolean;
  phoneNumber: string;
  userName?: string;
  profilePhoto?: string;
  onOpenProfile: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentLang,
  onLanguageChange,
  unsyncedCount = 0,
  onSyncAll,
  activeTab,
  onTabChange,
  onOpenAuth,
  onLogout,
  isAuthenticated,
  phoneNumber,
  userName = 'Ramesh Kumar',
  profilePhoto = '',
  onOpenProfile
}) => {
  const t = TRANSLATIONS[currentLang];

  return (
    <header className="border-b border-stone-800 bg-stone-950/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2.5 flex items-center justify-between gap-1.5 sm:gap-2 min-w-0">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <span className="font-bold text-white text-lg tracking-tight font-serif">
              व्या
            </span>
          </div>
          <h1 className="text-base sm:text-xl font-bold text-stone-100 tracking-tight whitespace-nowrap shrink-0">
            Mera Vyapaar
          </h1>
        </div>

        {/* Tab Navigation (Authenticated only) */}
        {isAuthenticated && (
          <nav className="hidden lg:flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800 overflow-x-auto">
            <button
              onClick={() => onTabChange('ledger')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'ledger'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.khataTab}</span>
            </button>

            <button
              onClick={() => onTabChange('manual')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.manualEntry}</span>
            </button>

            <button
              onClick={() => onTabChange('credit')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'credit'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t.creditTab}</span>
            </button>

            <button
              onClick={() => onTabChange('mandi')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'mandi'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <span className="text-xs">🌾</span>
              <span>{t.mandiTab}</span>
            </button>

            <button
              onClick={() => onTabChange('schemes')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'schemes'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t.schemesTab}</span>
            </button>

            <button
              onClick={() => onTabChange('ocr')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'ocr'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>{t.ocrTab}</span>
            </button>

            <button
              onClick={() => onTabChange('ai')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <div className="w-4 h-4 rounded bg-gradient-to-tr from-amber-600 via-emerald-600 to-emerald-400 flex items-center justify-center shrink-0">
                <span className="font-bold text-white text-[10px] tracking-tight font-serif">व्या</span>
              </div>
              <span>Vyapaar AI</span>
            </button>
          </nav>
        )}

        {/* Right Section: Fixed to Top Right */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 ml-auto shrink-0">
          {isAuthenticated ? (
            <>
              {unsyncedCount > 0 && onSyncAll && (
                <button
                  type="button"
                  onClick={onSyncAll}
                  title="Sync offline Room DB records to Cloud"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-xs font-semibold transition cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>{unsyncedCount} Sync</span>
                </button>
              )}

              {/* Language Selector */}
              <div className="relative inline-flex items-center shrink-0">
                <Globe className="w-3.5 h-3.5 absolute left-2.5 text-stone-400 pointer-events-none" />
                <select
                  value={currentLang}
                  onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
                  aria-label={t.selectLanguage}
                  className="bg-stone-900 border border-stone-700 text-stone-200 text-[11px] sm:text-xs rounded-lg pl-7 sm:pl-8 pr-2 sm:pr-3 py-1.5 w-[102px] sm:w-auto max-w-[102px] sm:max-w-none truncate focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-stone-900 text-stone-200">
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Profile Button */}
              <button
                type="button"
                onClick={onOpenProfile}
                title="Customer Profile"
                aria-label="Customer Profile"
                className="inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 overflow-hidden rounded-full bg-emerald-950/80 border border-emerald-600/80 hover:border-emerald-400 hover:bg-emerald-900/70 transition cursor-pointer shrink-0"
              >
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Customer profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-emerald-400" />
                )}
              </button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={onLogout}
                title={t.logout}
                className="inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-rose-950/70 text-stone-300 hover:text-rose-200 border border-stone-700 hover:border-rose-800 text-xs font-medium transition shadow-sm cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5 text-stone-400 hover:text-rose-400" />
                <span className="hidden sm:inline">{t.logout}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/60 transition cursor-pointer shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              <span>
                {currentLang === 'hi'
                  ? 'लॉगिन / साइन अप'
                  : currentLang === 'te'
                  ? 'లాగిన్ / సైన్ అప్'
                  : currentLang === 'mr'
                  ? 'लॉगिन / साइन अप'
                  : currentLang === 'ta'
                  ? 'உள்நுழைவு / பதிவு'
                  : currentLang === 'bn'
                  ? 'লগইন / সাইন আপ'
                  : 'Sign In / Register'}
              </span>
            </button>
          )}
        </div>
      </div>

    </header>
  );
};
