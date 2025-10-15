/**
 * @file firebase.ts
 * @summary Initializes and exports Firebase services for the application.
 * This file replaces the mock service with a real Firebase implementation,
 * handling authentication with Google and data storage in Firestore.
 */
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
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
} from 'firebase/firestore';
import { User, Participant, GroceryItem, Deposit } from '../types';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyDmNZKM8m9iKA4rrxanl-yscV86cMz2-fM",
    authDomain: "messmeal-31a11.firebaseapp.com",
    projectId: "messmeal-31a11",
    storageBucket: "messmeal-31a11.appspot.com",
    messagingSenderId: "413119253017",
    appId: "1:413119253017:web:4b6c4f8dbb147693853888",
    measurementId: "G-KXD9W95FCT"
};

// --- INITIALIZE FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();


// --- AUTHENTICATION FUNCTIONS ---

/**
 * Initiates Google Sign-In popup flow.
 * @returns {Promise<User>} A promise that resolves with the authenticated user's data.
 * @throws Throws an error if the sign-in process fails.
 */
export const signIn = async (): Promise<User> => {
  const result = await signInWithPopup(auth, provider);
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
 * @param {string} collectionName - The name of the subcollection (e.g., 'participants').
 * @returns {import('@firebase/firestore').CollectionReference} A Firestore collection reference.
 */
const getUserSubcollection = (adminUid: string, collectionName: string) => {
    return collection(db, 'users', adminUid, collectionName);
};


// --- FIRESTORE: PARTICIPANTS ---

/**
 * Fetches all participants for a given admin user from Firestore.
 * @param {string} adminUid - The admin user's UID.
 * @returns {Promise<Participant[]>} A promise resolving to an array of participants.
 */
export const fetchParticipants = async (adminUid: string): Promise<Participant[]> => {
  const querySnapshot = await getDocs(getUserSubcollection(adminUid, 'participants'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Participant));
};

/**
 * Adds a new participant to Firestore under the current admin user.
 * @param {string} adminUid - The admin user's UID.
 * @param {string} name - The name of the new participant.
 * @returns {Promise<Participant>} A promise resolving to the newly created participant.
 */
export const addParticipant = async (adminUid: string, name: string): Promise<Participant> => {
  const docRef = await addDoc(getUserSubcollection(adminUid, 'participants'), { name });
  return { id: docRef.id, name };
};

/**
 * Deletes a participant from Firestore.
 * @param {string} adminUid - The admin user's UID.
 * @param {string} id - The ID of the participant to delete.
 * @returns {Promise<void>} An empty promise that resolves on completion.
 */
export const deleteParticipant = async (adminUid: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', adminUid, 'participants', id));
};


// --- FIRESTORE: GROCERIES ---

/**
 * Fetches all grocery items for a given admin user from Firestore.
 * @param {string} adminUid - The admin user's UID.
 * @returns {Promise<GroceryItem[]>} A promise resolving to an array of grocery items.
 */
export const fetchGroceries = async (adminUid: string): Promise<GroceryItem[]> => {
  const querySnapshot = await getDocs(getUserSubcollection(adminUid, 'groceries'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroceryItem));
};

/**
 * Adds a new grocery item to Firestore.
 * @param {string} adminUid - The admin user's UID.
 * @param {Omit<GroceryItem, 'id'>} groceryData - The data for the new item.
 * @returns {Promise<GroceryItem>} A promise resolving to the newly created grocery item.
 */
export const addGrocery = async (adminUid: string, groceryData: Omit<GroceryItem, 'id'>): Promise<GroceryItem> => {
  const docRef = await addDoc(getUserSubcollection(adminUid, 'groceries'), groceryData);
  return { id: docRef.id, ...groceryData };
};

/**
 * Deletes a grocery item from Firestore.
 * @param {string} adminUid - The admin user's UID.
 * @param {string} id - The ID of the grocery item to delete.
 * @returns {Promise<void>} An empty promise.
 */
export const deleteGrocery = async (adminUid: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', adminUid, 'groceries', id));
};


// --- FIRESTORE: DEPOSITS ---

/**
 * Fetches all deposits for a given admin user from Firestore.
 * @param {string} adminUid - The admin user's UID.
 * @returns {Promise<Deposit[]>} A promise resolving to an array of deposits.
 */
export const fetchDeposits = async (adminUid: string): Promise<Deposit[]> => {
  const querySnapshot = await getDocs(getUserSubcollection(adminUid, 'deposits'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deposit));
};

/**
 * Adds a new deposit to Firestore.
 * @param {string} adminUid - The admin user's UID.
 * @param {Omit<Deposit, 'id'>} depositData - The data for the new deposit.
 * @returns {Promise<Deposit>} A promise resolving to the newly created deposit.
 */
export const addDeposit = async (adminUid: string, depositData: Omit<Deposit, 'id'>): Promise<Deposit> => {
  const docRef = await addDoc(getUserSubcollection(adminUid, 'deposits'), depositData);
  return { id: docRef.id, ...depositData };
};

/**
 * Deletes a deposit from Firestore.
 * @param {string} adminUid - The admin user's UID.
 * @param {string} id - The ID of the deposit to delete.
 * @returns {Promise<void>} An empty promise.
 */
export const deleteDeposit = async (adminUid: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', adminUid, 'deposits', id));
};