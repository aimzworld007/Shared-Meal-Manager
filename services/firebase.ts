
/**
 * @file firebase.ts
 * @summary Initializes and exports Firebase services for the application.
 * This file handles authentication with email/password and data storage in Firestore.
 */
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  collectionGroup,
  query,
} from 'firebase/firestore';
import { User, Member, GroceryItem, Deposit } from '../types';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyDmNZKM8m9iKA4rrxanl-yscV86cMz2-fM",
    authDomain: "messmeal-31a11.firebaseapp.com",
    projectId: "messmeal-31a11",
    storageBucket: "messmeal-31a11.firebasestorage.app",
    messagingSenderId: "413119253017",
    appId: "1:413119253017:web:4b6c4f8dbb147693853888",
    measurementId: "G-KXD9W95FCT"
};

// --- IMPORTANT: ADMIN CONFIGURATION ---
/**
 * The UID of the user designated as the admin.
 * THIS IS A CRITICAL STEP FOR ADMIN FUNCTIONALITY TO WORK.
 * 
 * To get your UID:
 * 1. Sign up for an account in the app.
 * 2. Go to your Firebase Console -> Authentication.
 * 3. Find the user account you want to be the admin.
 * 4. Copy the "User UID" for that user.
 * 5. Paste the UID here, replacing "YOUR_ADMIN_UID_HERE".
 *
 * Example: export const ADMIN_UID = "Abc123xyzDEF456...";
 */
export const ADMIN_UID = "YOUR_ADMIN_UID_HERE";


// --- INITIALIZE FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// --- AUTHENTICATION FUNCTIONS ---

/**
 * Signs a user in with their email and password.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<User>} A promise that resolves with the authenticated user's data.
 * @throws Throws an error if the sign-in process fails.
 */
export const signIn = async (email, password): Promise<User> => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const user = result.user;
  return {
    uid: user.uid,
    email: user.email,
  };
};

/**
 * Creates a new user account with an email and password.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<User>} A promise that resolves with the new user's data.
 * @throws Throws an error if the sign-up process fails.
 */
export const signUp = async (email, password): Promise<User> => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;
  return {
    uid: user.uid,
    email: user.email,
  };
};

/**
 * Signs the current user out.
 * @returns {Promise<void>} An empty promise that resolves upon successful sign-out.
 */
export const signOut = (): Promise<void> => {
  return firebaseSignOut(auth);
};

/**
 * Subscribes to authentication state changes.
 * This is a wrapper around Firebase's onAuthStateChanged to abstract Firebase-specific types.
 * @param {(user: User | null) => void} callback - A callback function that receives the user object or null.
 * @returns {() => void} An unsubscribe function to clean up the listener.
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      callback({ uid: firebaseUser.uid, email: firebaseUser.email });
    } else {
      callback(null);
    }
  });
};


// --- FIRESTORE HELPER ---

/**
 * Creates a Firestore collection reference for a subcollection under a specific user.
 * This is the core of the multi-tenancy data structure.
 * @param {string} adminUid - The UID of the currently logged-in user.
 * @param {string} collectionName - The name of the subcollection (e.g., 'members').
 * @returns {import('@firebase/firestore').CollectionReference} A Firestore collection reference.
 */
const getUserSubcollection = (adminUid: string, collectionName: string) => {
    return collection(db, 'users', adminUid, collectionName);
};


// --- FIRESTORE: MEMBERS ---

export const fetchMembers = async (adminUid: string): Promise<Member[]> => {
  const querySnapshot = await getDocs(getUserSubcollection(adminUid, 'members'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
};

export const addMember = async (adminUid: string, name: string): Promise<Member> => {
  const docRef = await addDoc(getUserSubcollection(adminUid, 'members'), { name });
  return { id: docRef.id, name };
};

export const deleteMember = async (adminUid: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', adminUid, 'members', id));
};


// --- FIRESTORE: GROCERIES ---

export const fetchGroceries = async (adminUid: string): Promise<GroceryItem[]> => {
  const querySnapshot = await getDocs(getUserSubcollection(adminUid, 'groceries'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroceryItem));
};

export const addGrocery = async (adminUid: string, groceryData: Omit<GroceryItem, 'id'>): Promise<GroceryItem> => {
  const docRef = await addDoc(getUserSubcollection(adminUid, 'groceries'), groceryData);
  return { id: docRef.id, ...groceryData };
};

export const deleteGrocery = async (adminUid: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', adminUid, 'groceries', id));
};


// --- FIRESTORE: DEPOSITS ---

export const fetchDeposits = async (adminUid: string): Promise<Deposit[]> => {
  const querySnapshot = await getDocs(getUserSubcollection(adminUid, 'deposits'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deposit));
};

export const addDeposit = async (adminUid: string, depositData: Omit<Deposit, 'id'>): Promise<Deposit> => {
  const docRef = await addDoc(getUserSubcollection(adminUid, 'deposits'), depositData);
  return { id: docRef.id, ...depositData };
};

export const deleteDeposit = async (adminUid: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', adminUid, 'deposits', id));
};


// --- ADMIN DATA FETCHING ---

/**
 * Represents aggregated data for a single user for admin analytics.
 */
export interface UserDataSummary {
    userId: string;
    userEmail: string | null;
    groceries: GroceryItem[];
    deposits: Deposit[];
}

/**
 * Fetches all data (groceries, deposits) for all users.
 * This is an admin-only function.
 * @returns {Promise<UserDataSummary[]>} A promise that resolves with an array of aggregated data for each user.
 */
export const fetchAllUsersData = async (): Promise<UserDataSummary[]> => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const allUserData: UserDataSummary[] = [];

    for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        // The user document itself might not store the email, so we fetch it separately if needed
        // For simplicity, we assume we don't have the email stored directly on the user doc
        // and would need to look it up in Auth if required. We'll use the UID as the primary identifier.
        
        const groceriesPromise = getDocs(collection(db, 'users', userId, 'groceries'));
        const depositsPromise = getDocs(collection(db, 'users', userId, 'deposits'));

        const [groceriesSnapshot, depositsSnapshot] = await Promise.all([
            groceriesPromise,
            depositsPromise
        ]);
        
        const groceries = groceriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroceryItem));
        const deposits = depositsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deposit));
        
        allUserData.push({
            userId: userId,
            userEmail: `user-${userId.substring(0, 5)}...`, // Placeholder email
            groceries,
            deposits
        });
    }
    
    return allUserData;
};
