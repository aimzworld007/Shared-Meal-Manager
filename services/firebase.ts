/**
 * @file firebase.ts
 * @summary Initializes Firebase and exports auth and Firestore service functions.
 * This file is the single point of interaction with the Firebase backend.
 */
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { User, Member, GroceryItem, Deposit } from '../types';

// Your web app's Firebase configuration
// IMPORTANT: Do not commit sensitive keys to a public repository.
// These have been hardcoded here to resolve the invalid-api-key error in the current project setup.
const firebaseConfig = {
  apiKey: "AIzaSyDmNZKM8m9iKA4rrxanl-yscV86cMz2-fM",
  authDomain: "messmeal-31a11.firebaseapp.com",
  projectId: "messmeal-31a11",
  storageBucket: "messmeal-31a11.appspot.com",
  messagingSenderId: "413119253017",
  appId: "1:413119253017:web:4b6c4f8dbb147693853888"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- AUTHENTICATION ---

/**
 * Maps a Firebase User object to our application's User type.
 * @param {FirebaseUser} firebaseUser - The user object from Firebase Auth.
 * @returns {User} The application-specific user object.
 */
const mapFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
  };
};

/**
 * Listens for authentication state changes and calls the callback.
 * @param {(user: User | null) => void} callback - The function to call with the user state.
 * @returns {() => void} An unsubscribe function.
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    const user = firebaseUser ? mapFirebaseUser(firebaseUser) : null;
    callback(user);
  });
};

export const signIn = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
export const signUp = (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass);
export const signOut = () => firebaseSignOut(auth);

// --- FIRESTORE DATA HELPERS ---

const getCollectionPath = (uid: string, subcollection: 'members' | 'groceries' | 'deposits') => {
    return `users/${uid}/${subcollection}`;
}

// --- MEMBERS ---

export const getMembers = (uid: string, callback: (members: Member[]) => void) => {
    const q = query(collection(db, getCollectionPath(uid, 'members')), orderBy('name'));
    return onSnapshot(q, (snapshot) => {
        const members: Member[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
        callback(members);
    });
};
export const addMember = (uid: string, name: string) => addDoc(collection(db, getCollectionPath(uid, 'members')), { name });
export const updateMember = (uid: string, memberId: string, name: string) => updateDoc(doc(db, getCollectionPath(uid, 'members'), memberId), { name });
export const deleteMember = (uid: string, memberId: string) => deleteDoc(doc(db, getCollectionPath(uid, 'members'), memberId));

// --- GROCERIES ---

export const getGroceries = (uid: string, callback: (items: GroceryItem[]) => void) => {
    const q = query(collection(db, getCollectionPath(uid, 'groceries')), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const items: GroceryItem[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroceryItem));
        callback(items);
    });
};
export const addGrocery = (uid: string, item: Omit<GroceryItem, 'id'>) => addDoc(collection(db, getCollectionPath(uid, 'groceries')), item);
export const updateGrocery = (uid: string, itemId: string, item: Omit<GroceryItem, 'id'>) => updateDoc(doc(db, getCollectionPath(uid, 'groceries'), itemId), item);
export const deleteGrocery = (uid: string, itemId: string) => deleteDoc(doc(db, getCollectionPath(uid, 'groceries'), itemId));

// --- DEPOSITS ---

export const getDeposits = (uid: string, callback: (items: Deposit[]) => void) => {
    const q = query(collection(db, getCollectionPath(uid, 'deposits')), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const items: Deposit[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deposit));
        callback(items);
    });
};
export const addDeposit = (uid: string, deposit: Omit<Deposit, 'id'>) => addDoc(collection(db, getCollectionPath(uid, 'deposits')), deposit);
export const updateDeposit = (uid: string, depositId: string, deposit: Omit<Deposit, 'id'>) => updateDoc(doc(db, getCollectionPath(uid, 'deposits'), depositId), deposit);
export const deleteDeposit = (uid: string, depositId: string) => deleteDoc(doc(db, getCollectionPath(uid, 'deposits'), depositId));


// --- ADMIN ---

// Fix: Renamed from UserSummary to UserDataSummary and added fields for admin analytics.
export interface UserDataSummary {
    userId: string;
    userEmail: string | null;
    members: Member[];
    groceries: GroceryItem[];
    deposits: Deposit[];
}

/**
 * Fetches a list of all users and their associated data. In a real app, this should be a secured Cloud Function.
 */
// Fix: Renamed from fetchAllUsers to fetchAllUsersData and implemented fetching of subcollections.
export const fetchAllUsersData = async (): Promise<UserDataSummary[]> => {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);

    const allUserData = await Promise.all(usersSnapshot.docs.map(async (userDoc) => {
        const user = {
            id: userDoc.id,
            email: userDoc.data().email || userDoc.id,
        };

        const membersSnapshot = await getDocs(collection(db, `users/${user.id}/members`));
        const groceriesSnapshot = await getDocs(collection(db, `users/${user.id}/groceries`));
        const depositsSnapshot = await getDocs(collection(db, `users/${user.id}/deposits`));

        const members: Member[] = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
        const groceries: GroceryItem[] = groceriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroceryItem));
        const deposits: Deposit[] = depositsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deposit));
        
        return {
            userId: user.id,
            userEmail: user.email,
            members,
            groceries,
            deposits,
        };
    }));
    
    return allUserData;
};

// This is the old fetchAllUsers, which is now replaced by fetchAllUsersData to meet the requirements of the admin dashboard.
// For simplicity, it's removed, but in a real-world scenario with multiple consumers, you'd deprecate it carefully.
/*
export const fetchAllUsers = async (): Promise<UserSummary[]> => {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    // Note: This relies on an 'email' field being saved on the user document,
    // which our current signup flow doesn't do. A better approach is a Cloud Function
    // that can access Firebase Auth user list. For now, we'll use the UID as the primary identifier.
    return usersSnapshot.docs.map(doc => ({
        id: doc.id,
        email: doc.data().email || doc.id, // Fallback to UID if email isn't on the doc
    }));
};
*/
export interface UserSummary {
    id: string;
    email: string | null;
}

/**
 * Fetches a list of all users. In a real app, this should be a secured Cloud Function.
 */
export const fetchAllUsers = async (): Promise<UserSummary[]> => {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    // Note: This relies on an 'email' field being saved on the user document,
    // which our current signup flow doesn't do. A better approach is a Cloud Function
    // that can access Firebase Auth user list. For now, we'll use the UID as the primary identifier.
    return usersSnapshot.docs.map(doc => ({
        id: doc.id,
        email: doc.data().email || doc.id, // Fallback to UID if email isn't on the doc
    }));
};