export type TransactionType = 'INCOME' | 'EXPENSE';

export interface LedgerEntry {
  id: string;
  amount: number;
  transactionType: TransactionType;
  category: string;
  audioNotePath?: string;
  timestamp: number;
  isSynced: boolean;
  notes?: string;
  customerName?: string;
  sourceText?: string;
}

export interface CreditScoreResult {
  totalScore: number; // 300 - 900
  tier: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_IMPROVEMENT';
  cashFlowConsistencyScore: number; // Max 250
  profitMarginScore: number; // Max 200
  transactionFrequencyScore: number; // Max 150
  seasonalityBufferScore: number; // Max 150
  shgTrustFactorScore: number; // Max 150
  eligibleSchemes: string[];
  maxRecommendedLoan: number;
  riskRating: 'LOW' | 'MODERATE' | 'HIGH';
  insights: string[];
}

export interface MandiItem {
  id: string;
  commodity: string;
  commodityHi: string;
  commodityNames?: Partial<Record<SupportedLanguage, string>>;
  market: string;
  state: string;
  modalPrice: number; // in INR per Quintal
  minPrice: number;
  maxPrice: number;
  changePercent: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  advisoryNote: string;
  advisoryNoteHi: string;
  advisoryNotes?: Partial<Record<SupportedLanguage, string>>;
  arrivalVolume?: string;
  arrivalVolumes?: Partial<Record<SupportedLanguage, string>>;
  buyerDemand?: string;
  buyerDemands?: Partial<Record<SupportedLanguage, string>>;
  recommendedStrategy?: string;
  recommendedStrategies?: Partial<Record<SupportedLanguage, string>>;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  nameVernacular: string;
  category: 'MUDRA' | 'PMEGP' | 'NABARD' | 'PM_SVANIDHI';
  maxAmount: number;
  subsidyRate: string;
  interestRate: string;
  targetBeneficiaries: string;
  eligibilityConditions: string[];
  requiredDocuments: string[];
  status: 'ELIGIBLE' | 'PARTIALLY_ELIGIBLE' | 'NEEDS_DATA';
  names?: Partial<Record<SupportedLanguage, string>>;
  targets?: Partial<Record<SupportedLanguage, string>>;
  subsidies?: Partial<Record<SupportedLanguage, string>>;
  eligibilities?: Partial<Record<SupportedLanguage, string[]>>;
  documents?: Partial<Record<SupportedLanguage, string[]>>;
}

export type SupportedLanguage = 'hi' | 'mr' | 'te' | 'ta' | 'bn' | 'en';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  region: string;
}
