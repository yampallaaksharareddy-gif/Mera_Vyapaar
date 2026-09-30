import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  signOut,
  User
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { CustomerProfile } from '../components/CustomerProfileModal';

const firebaseConfig = {
  apiKey: "AIzaSyCfkmfICNZtGj0G31bieqwrQs3G9zAGDV0",
  authDomain: "mera-vyapaar.firebaseapp.com",
  projectId: "mera-vyapaar",
  storageBucket: "mera-vyapaar.firebasestorage.app",
  messagingSenderId: "579947679130",
  appId: "1:579947679130:web:cc07031003b3ebc7a3fe23",
  measurementId: "G-6Z2FPF0D7Q"
};

// Initialize Firebase singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Initialize Firestore with client-side offline persistence enabled
export const db = (() => {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (e) {
    return getFirestore(app);
  }
})();

export const storage = getStorage(app);

export interface FirestoreCustomerDocument {
  customerId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  gender: 'female' | 'male' | 'other';
  age: number;
  caste: 'general' | 'obc' | 'sc' | 'st' | 'minority';
  locationType: 'rural' | 'semi-urban' | 'urban';
  state: string;
  businessSector: string;
  profilePhotoUrl: string;
  ownerUid: string;
  createdAt?: any;
  updatedAt?: any;
}

export const getCleanPhone = (phoneStr: string): string => {
  if (!phoneStr) return '';
  const digits = phoneStr.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : '';
};

/**
 * Links an email/password credential to the currently authenticated Phone Auth user.
 * Keeps the EXACT SAME Firebase UID (`auth.currentUser.uid`) across Phone OTP & Password authentication!
 */
export const linkPasswordToCurrentUser = async (
  phoneStr: string,
  userPasswordInput: string
): Promise<User> => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('No active user session to link password to.');
  }

  const clean = getCleanPhone(phoneStr);

  if (!clean) {
    throw new Error('Valid 10-digit mobile number required for account linking.');
  }

  if (!userPasswordInput || userPasswordInput.trim().length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const email = `user_${clean}@meravyapaar.app`;
  const credential = EmailAuthProvider.credential(
    email,
    userPasswordInput.trim()
  );

  try {
    const result = await linkWithCredential(currentUser, credential);
    return result.user;
  } catch (err: any) {
    if (err.code === 'auth/credential-already-in-use') {
      // Credential already linked to this account
      return currentUser;
    }

    console.warn('Firebase linkWithCredential notice:', err);
    throw err;
  }
};

/**
 * Ensures an authenticated Firebase User session for password login or existing accounts.
 * If `auth.currentUser` is ALREADY authenticated (e.g. via Phone OTP), returns `auth.currentUser`
 * without overriding the active Phone Auth UID!
 */
export const ensureFirebaseAuthSession = async (
  phoneStr: string,
  name?: string,
  userPasswordInput?: string
): Promise<User> => {
  // If user is already authenticated on Firebase (e.g. Phone OTP), keep current user UID!
  if (auth.currentUser) {
    if (userPasswordInput && userPasswordInput.trim().length >= 6) {
      try {
        await linkPasswordToCurrentUser(phoneStr, userPasswordInput.trim());
      } catch (e) {}
    }

    return auth.currentUser;
  }

  const clean = getCleanPhone(phoneStr);

  if (!clean) {
    throw new Error('Valid 10-digit mobile number required for authentication.');
  }

  const email = `user_${clean}@meravyapaar.app`;

  if (!userPasswordInput || !userPasswordInput.trim()) {
    throw new Error('Password required for account authentication.');
  }

  const password = userPasswordInput.trim();

  try {
    const userCred = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return userCred.user;
  } catch (signInErr: any) {
    if (
      signInErr.code === 'auth/user-not-found' ||
      signInErr.code === 'auth/invalid-credential'
    ) {
      try {
        const newCred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        return newCred.user;
      } catch (createErr) {
        console.warn('Firebase account creation error:', createErr);
        throw signInErr;
      }
    }

    throw signInErr;
  }
};

/**
 * Signs out the current Firebase user.
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase signout notice:', err);
  }
};

/**
 * Compresses large images client-side before uploading to Firebase Storage.
 */
export const compressImageFile = (
  file: File,
  maxWidth = 800,
  maxHeight = 800
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();

      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.82
        );
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
};

/**
 * Uploads customer photo to Firebase Storage at `customerPhotos/{uid}/{customerId}/profile.jpg`
 */
export const uploadCustomerPhotoToStorage = async (
  uid: string,
  customerId: string,
  photoBlobOrFile: Blob | File
): Promise<string> => {
  const photoRef = ref(
    storage,
    `customerPhotos/${uid}/${customerId}/profile.jpg`
  );

  await uploadBytes(photoRef, photoBlobOrFile, {
    contentType: 'image/jpeg'
  });

  return await getDownloadURL(photoRef);
};

/**
 * Creates or updates customer document in Cloud Firestore at `users/{uid}/customers/{customerId}`.
 */
export const saveCustomerProfileToFirestore = async (
  uid: string,
  phoneStr: string,
  profile: CustomerProfile,
  photoFile?: File | null
): Promise<FirestoreCustomerDocument> => {
  const activeUid = uid || auth.currentUser?.uid;

  if (!activeUid) {
    throw new Error(
      'Unauthenticated: Cannot save customer data without an active Firebase Auth UID.'
    );
  }

  const clean = getCleanPhone(phoneStr);

  if (!clean) {
    throw new Error(
      'Valid 10-digit mobile number required to save customer profile.'
    );
  }

  const customerId = `cust_${clean}`;

  const customerDocRef = doc(
    db,
    'users',
    activeUid,
    'customers',
    customerId
  );

  let profilePhotoUrl = profile.photoDataUrl || '';

  // Upload photo to Firebase Storage if a new raw File object is provided
  if (photoFile) {
    try {
      const compressedBlob = await compressImageFile(photoFile);

      profilePhotoUrl = await uploadCustomerPhotoToStorage(
        activeUid,
        customerId,
        compressedBlob
      );
    } catch (storageErr) {
      console.warn(
        'Firebase Storage photo upload notice:',
        storageErr
      );
    }
  }

  const fullName = [
    profile.firstName,
    profile.middleName,
    profile.lastName
  ]
    .filter(Boolean)
    .join(' ');

  const docSnapshot = await getDoc(customerDocRef);
  const isNew = !docSnapshot.exists();

  const customerData: FirestoreCustomerDocument = {
    customerId,
    firstName: profile.firstName || '',
    middleName: profile.middleName || '',
    lastName: profile.lastName || '',
    fullName: fullName || 'Entrepreneur',
    phoneNumber: phoneStr,
    address: profile.address || '',
    gender: profile.gender || 'female',
    age: profile.age || 18,
    caste: profile.socialCategory || 'general',
    locationType: profile.locationType || 'rural',
    state: profile.state || 'Telangana',
    businessSector: profile.businessSector || 'agri_allied',
    profilePhotoUrl,
    ownerUid: activeUid,
    updatedAt: serverTimestamp()
  };

  if (isNew) {
    customerData.createdAt = serverTimestamp();
  }

  await setDoc(customerDocRef, customerData, { merge: true });

  return customerData;
};

/**
 * Loads a customer document for the logged-in owner UID from `users/{uid}/customers/{customerId}`.
 */
export const loadCustomerFromFirestore = async (
  uid: string,
  phoneStr: string
): Promise<FirestoreCustomerDocument | null> => {
  const activeUid = uid || auth.currentUser?.uid;

  if (!activeUid) {
    console.warn(
      'Unauthenticated: Cannot load customer data without active Firebase Auth UID.'
    );
    return null;
  }

  const clean = getCleanPhone(phoneStr);

  if (!clean) {
    return null;
  }

  const customerId = `cust_${clean}`;

  const customerDocRef = doc(
    db,
    'users',
    activeUid,
    'customers',
    customerId
  );

  try {
    const snapshot = await getDoc(customerDocRef);

    if (snapshot.exists()) {
      return snapshot.data() as FirestoreCustomerDocument;
    }
  } catch (err) {
    console.warn(
      'Firestore customer document fetch notice:',
      err
    );
  }

  return null;
};

/**
 * Retrieves all customer documents for the owner UID from `users/{uid}/customers`.
 */
export const loadAllCustomersFromFirestore = async (
  uid: string
): Promise<FirestoreCustomerDocument[]> => {
  const activeUid = uid || auth.currentUser?.uid;

  if (!activeUid) {
    console.warn(
      'Unauthenticated: Cannot load customers list without active Firebase Auth UID.'
    );
    return [];
  }

  try {
    const customersCol = collection(
      db,
      'users',
      activeUid,
      'customers'
    );

    const snapshot = await getDocs(customersCol);

    return snapshot.docs.map(
      (docSnap) =>
        docSnap.data() as FirestoreCustomerDocument
    );
  } catch (err) {
    console.warn(
      'Firestore customers collection fetch notice:',
      err
    );

    return [];
  }
};

/**
 * Deletes customer document from Firestore and photo from Storage.
 */
export const deleteCustomerFromFirestore = async (
  uid: string,
  phoneStr: string
): Promise<void> => {
  const activeUid = uid || auth.currentUser?.uid;

  if (!activeUid) {
    throw new Error(
      'Unauthenticated: Cannot delete customer data without an active Firebase Auth UID.'
    );
  }

  const clean = getCleanPhone(phoneStr);

  if (!clean) {
    return;
  }

  const customerId = `cust_${clean}`;

  const customerDocRef = doc(
    db,
    'users',
    activeUid,
    'customers',
    customerId
  );

  try {
    await deleteDoc(customerDocRef);

    const photoRef = ref(
      storage,
      `customerPhotos/${activeUid}/${customerId}/profile.jpg`
    );

    await deleteObject(photoRef).catch(() => {});
  } catch (err) {
    console.warn(
      'Firestore customer deletion notice:',
      err
    );
  }
};