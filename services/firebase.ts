/**
 * @file firebase.ts
 * @summary A service module for all Firebase interactions.
 * This file centralizes Firebase configuration and provides a clean API
 * for authentication and Firestore database operations.
 */
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { User, Member, GroceryItem, Deposit } from '../types';

// Your web app's Firebase configuration
// In a real app, use environment variables like process.env.REACT_APP_FIREBASE_API_KEY
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};


// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// --- Authentication ---

export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
  return auth.onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
      };
      callback(user);
    } else {
      callback(null);
    }
  });
};

export const signIn = (email: string, pass: string): Promise<firebase.auth.UserCredential> => {
  return auth.signInWithEmailAndPassword(email, pass);
};

export const signUp = (email: string, pass: string): Promise<firebase.auth.UserCredential> => {
  return auth.createUserWithEmailAndPassword(email, pass);
};

export const signOut = (): Promise<void> => {
  return auth.signOut();
};


// --- Firestore Collections ---

const getCollectionRef = (collectionName: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated for Firestore operation.");
    return db.collection('users').doc(user.uid).collection(collectionName);
}

// --- Generic Firestore CRUD ---

const addDoc = async <T extends { [key: string]: any }>(collectionName: string, data: T) => {
    const ref = getCollectionRef(collectionName);
    return await ref.add(data);
};

const getDocs = async <T>(collectionName: string): Promise<(T & { id: string })[]> => {
    const query = getCollectionRef(collectionName);
    // Members don't have a date, so we can't sort them all by date.
    const snapshot = collectionName === 'members' ? await query.get() : await query.orderBy('date', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T & { id: string }));
};

const updateDoc = async (collectionName: string, id: string, data: { [key: string]: any }) => {
    return await getCollectionRef(collectionName).doc(id).update(data);
};

const deleteDoc = async (collectionName: string, id: string) => {
    return await getCollectionRef(collectionName).doc(id).delete();
};

// --- Specific CRUD for Collections ---

// Members
export const addMember = (data: Omit<Member, 'id'>) => addDoc('members', data);
export const getMembers = () => getDocs<Member>('members');
export const updateMember = (id: string, data: Partial<Omit<Member, 'id'>>) => updateDoc('members', id, data);
export const deleteMember = (id: string) => deleteDoc('members', id);

// Groceries
export const addGrocery = (data: Omit<GroceryItem, 'id'>) => addDoc('groceries', data);
export const getGroceries = () => getDocs<GroceryItem>('groceries');
export const updateGrocery = (id: string, data: Partial<Omit<GroceryItem, 'id'>>) => updateDoc('groceries', id, data);
export const deleteGrocery = (id: string) => deleteDoc('groceries', id);

// Deposits
export const addDeposit = (data: Omit<Deposit, 'id'>) => addDoc('deposits', data);
export const getDeposits = () => getDocs<Deposit>('deposits');
export const updateDeposit = (id: string, data: Partial<Omit<Deposit, 'id'>>) => updateDoc('deposits', id, data);
export const deleteDeposit = (id: string) => deleteDoc('deposits', id);

// --- Admin ---

export interface UserDataSummary {
    userId: string;
    userEmail: string | null;
    members: Member[];
    groceries: GroceryItem[];
    deposits: Deposit[];
}

export const fetchAllUsersData = async (): Promise<UserDataSummary[]> => {
    // This function requires admin privileges and is best implemented as a Firebase Cloud Function.
    // The client-side implementation below assumes Firestore rules are set up to allow
    // an admin user to read the `users` collection, which is not a secure default.
    console.warn("fetchAllUsersData is running on the client. For production, this should be a secure Cloud Function.");
    
    const usersSnapshot = await db.collection('users').get();
    const allUserData: UserDataSummary[] = [];

    for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        // Attempt to get email from user doc, assuming it was stored on signup.
        const userEmail = userDoc.data()?.email || 'N/A';

        const [members, groceries, deposits] = await Promise.all([
            db.collection('users').doc(userId).collection('members').get(),
            db.collection('users').doc(userId).collection('groceries').get(),
            db.collection('users').doc(userId).collection('deposits').get()
        ]);

        allUserData.push({
            userId,
            userEmail,
            members: members.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Member[],
            groceries: groceries.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GroceryItem[],
            deposits: deposits.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Deposit[],
        });
    }

    return allUserData;
};
