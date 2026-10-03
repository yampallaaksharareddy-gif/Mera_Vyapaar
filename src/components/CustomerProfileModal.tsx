import React, { useRef, useState } from 'react';
import { Camera, CheckCircle2, ImagePlus, User, X, RefreshCw } from 'lucide-react';
import { auth, saveCustomerProfileToFirestore } from '../services/firebase';

export type CustomerGender = 'female' | 'male' | 'other';
export type CustomerSocialCategory = 'general' | 'obc' | 'sc' | 'st' | 'minority';
export type CustomerLocationType = 'rural' | 'semi-urban' | 'urban';
export type CustomerBusinessSector =
  | 'agri_allied'
  | 'food_processing'
  | 'handloom_artisan'
  | 'street_vendor'
  | 'retail_shop'
  | 'dairy_livestock'
  | 'manufacturing_small'
  | 'services';

export interface CustomerProfile {
  firstName: string;
  middleName: string;
  lastName: string;
  address: string;
  gender: CustomerGender;
  age: number;
  socialCategory: CustomerSocialCategory;
  locationType: CustomerLocationType;
  state: string;
  businessSector: CustomerBusinessSector;
  photoDataUrl: string;
}

const PROFILE_PREFIX = 'mera_vyapaar_customer_profile_';

const cleanPhone = (phone: string) => phone.replace(/\D/g, '').slice(-10);

export const getCustomerProfileKey = (phone: string) => `${PROFILE_PREFIX}${cleanPhone(phone)}`;

export const loadCustomerProfile = (phone: string): CustomerProfile | null => {
  if (!phone) return null;
  try {
    const raw = localStorage.getItem(getCustomerProfileKey(phone));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as CustomerProfile;
  } catch (error) {
    console.warn('Could not load customer profile', error);
  }
  return null;
};

export const saveCustomerProfile = (phone: string, profile: CustomerProfile) => {
  if (!phone) return;
  try {
    localStorage.setItem(getCustomerProfileKey(phone), JSON.stringify(profile));
  } catch (error) {
    console.warn('Could not save customer profile', error);
  }
};

export const getEmptyCustomerProfile = (): CustomerProfile => ({
  firstName: '',
  middleName: '',
  lastName: '',
  address: '',
  gender: 'other',
  age: 18,
  socialCategory: 'general',
  locationType: 'rural',
  state: 'Telangana',
  businessSector: 'agri_allied',
  photoDataUrl: ''
});

interface CustomerProfileModalProps {
  phoneNumber: string;
  authUid?: string;
  currentLang?: string;
  initialProfile?: CustomerProfile | null;
  required?: boolean;
  onSaved: (profile: CustomerProfile) => void;
  onClose?: () => void;
}

const STATES = [
  'Telangana', 'Andhra Pradesh', 'Maharashtra', 'Uttar Pradesh', 'Madhya Pradesh',
  'Bihar', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Rajasthan', 'Gujarat',
  'Punjab', 'Odisha', 'Haryana', 'Kerala'
];

const SECTORS: Array<{ value: CustomerBusinessSector; label: string }> = [
  { value: 'agri_allied', label: 'Agri & Allied / Inputs' },
  { value: 'food_processing', label: 'Food Processing / Mills' },
  { value: 'handloom_artisan', label: 'Handloom & Crafts (Vishwakarma)' },
  { value: 'street_vendor', label: 'Street Vendor / Hawkers (SVANidhi)' },
  { value: 'retail_shop', label: 'Kirana / Retail Shop' },
  { value: 'dairy_livestock', label: 'Dairy & Poultry' },
  { value: 'manufacturing_small', label: 'Small Manufacturing' },
  { value: 'services', label: 'Services / Repair Kiosk' }
];

const inputClass = 'w-full min-w-0 rounded-xl border border-stone-700 bg-stone-900 px-3 py-2.5 text-sm text-stone-100 placeholder:text-stone-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  phoneNumber,
  authUid,
  initialProfile,
  required = false,
  onSaved,
  onClose
}) => {
  const [profile, setProfile] = useState<CustomerProfile>(initialProfile || getEmptyCustomerProfile());
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof CustomerProfile>(key: K, value: CustomerProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Please choose a photo smaller than 5 MB.');
      return;
    }
    setSelectedPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setError('');
      update('photoDataUrl', String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      setError('Please enter the first name and last name.');
      return;
    }
    if (!profile.address.trim()) {
      setError('Please enter the customer address.');
      return;
    }
    if (!profile.age || profile.age < 18 || profile.age > 100) {
      setError('Please enter an age between 18 and 100.');
      return;
    }
    if (!profile.state || !profile.businessSector) {
      setError('Please complete the location and business sector.');
      return;
    }

    setIsSaving(true);
    setError('');

    let updatedProfile = { ...profile };
    const activeUid = authUid || auth.currentUser?.uid;

    try {
      if (activeUid) {
        const firestoreDoc = await saveCustomerProfileToFirestore(
          activeUid,
          phoneNumber,
          profile,
          selectedPhotoFile
        );
        if (firestoreDoc.profilePhotoUrl) {
          updatedProfile.photoDataUrl = firestoreDoc.profilePhotoUrl;
        }
      }
    } catch (err: any) {
      console.warn('Firestore profile save notice:', err);
    } finally {
      saveCustomerProfile(phoneNumber, updatedProfile);
      setIsSaving(false);
      onSaved(updatedProfile);
    }
  };

  const fullName = [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ');

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-2xl max-h-[94dvh] overflow-y-auto rounded-3xl border border-stone-800 bg-stone-950 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-stone-800 bg-stone-950/95 px-4 py-4 sm:px-6 backdrop-blur">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">{required ? 'Complete your profile' : 'Customer Profile'}</h2>
            <p className="mt-1 text-xs text-stone-400">These details are used to personalize Government Schemes eligibility.</p>
          </div>
          {!required && onClose && (
            <button type="button" onClick={onClose} className="h-9 w-9 shrink-0 rounded-full bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-6">
          <div className="flex flex-col items-center gap-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="group relative h-24 w-24 overflow-hidden rounded-full border-2 border-emerald-500/60 bg-stone-900 shadow-lg">
              {profile.photoDataUrl ? (
                <img src={profile.photoDataUrl} alt={fullName || 'Customer profile'} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-emerald-400"><User className="h-10 w-10" /></div>
              )}
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/65 py-1 text-[10px] font-semibold text-white">
                <Camera className="h-3 w-3" /> Photo
              </span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300">
              <ImagePlus className="h-3.5 w-3.5" /> Upload / Change photo
            </button>
          </div>

          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Personal details</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="space-y-1.5"><span className="text-xs text-stone-400">First name *</span><input className={inputClass} value={profile.firstName} onChange={(e) => update('firstName', e.target.value)} /></label>
              <label className="space-y-1.5"><span className="text-xs text-stone-400">Middle name</span><input className={inputClass} value={profile.middleName} onChange={(e) => update('middleName', e.target.value)} /></label>
              <label className="space-y-1.5"><span className="text-xs text-stone-400">Last name *</span><input className={inputClass} value={profile.lastName} onChange={(e) => update('lastName', e.target.value)} /></label>
            </div>
            <label className="block space-y-1.5"><span className="text-xs text-stone-400">Address *</span><textarea rows={3} className={inputClass} value={profile.address} onChange={(e) => update('address', e.target.value)} placeholder="House / street / village or town" /></label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="space-y-1.5"><span className="text-xs text-stone-400">Gender *</span><select className={inputClass} value={profile.gender} onChange={(e) => update('gender', e.target.value as CustomerGender)}><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></select></label>
              <label className="space-y-1.5"><span className="text-xs text-stone-400">Age *</span><input type="number" min={18} max={100} className={inputClass} value={profile.age} onChange={(e) => update('age', Number(e.target.value))} /></label>
              <label className="space-y-1.5"><span className="text-xs text-stone-400">Caste / social category *</span><select className={inputClass} value={profile.socialCategory} onChange={(e) => update('socialCategory', e.target.value as CustomerSocialCategory)}><option value="general">General</option><option value="obc">OBC</option><option value="sc">SC</option><option value="st">ST</option><option value="minority">Minority</option></select></label>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Location & business</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="space-y-1.5"><span className="text-xs text-stone-400">Location type *</span><select className={inputClass} value={profile.locationType} onChange={(e) => update('locationType', e.target.value as CustomerLocationType)}><option value="rural">Rural</option><option value="semi-urban">Semi-Urban</option><option value="urban">Urban</option></select></label>
              <label className="space-y-1.5"><span className="text-xs text-stone-400">State *</span><select className={inputClass} value={profile.state} onChange={(e) => update('state', e.target.value)}>{STATES.map((state) => <option key={state} value={state}>{state}</option>)}</select></label>
            </div>
            <label className="block space-y-1.5"><span className="text-xs text-stone-400">Business sector *</span><select className={inputClass} value={profile.businessSector} onChange={(e) => update('businessSector', e.target.value as CustomerBusinessSector)}>{SECTORS.map((sector) => <option key={sector.value} value={sector.value}>{sector.label}</option>)}</select></label>
          </section>

          {error && <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-3 py-2.5 text-xs text-rose-200">{error}</div>}

          <div className="sticky bottom-0 -mx-4 -mb-4 flex gap-2 border-t border-stone-800 bg-stone-950/95 p-4 sm:-mx-6 sm:-mb-6 sm:p-6">
            {!required && onClose && <button type="button" onClick={onClose} disabled={isSaving} className="flex-1 rounded-xl bg-stone-800 px-4 py-3 text-sm font-semibold text-stone-200 hover:bg-stone-700 disabled:opacity-50">Cancel</button>}
            <button type="submit" disabled={isSaving} className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50 inline-flex items-center justify-center gap-2">
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Saving to Cloud...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Save profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
