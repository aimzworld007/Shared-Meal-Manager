import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  setDoc
} from "firebase/firestore";
import { User, GroceryItem, Deposit, Participant } from "../types";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmNZKM8m9iKA4rrxanl-yscV86cMz2-fM",
  authDomain: "messmeal-31a11.firebaseapp.com",
  projectId: "messmeal-31a11",
  storageBucket: "messmeal-31a11.firebasestorage.app",
  messagingSenderId: "413119253017",
  appId: "1:413119253017:web:4b6c4f8dbb147693853888",
  measurementId: "G-KXD9W95FCT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Auth Service ---

/**
 * Signs a user in with email and password.
 */
export const signIn = (email: string, pass: string) => {
  return signInWithEmailAndPassword(auth, email, pass);
};

/**
 * Creates a new user (member) with email and password. Used by admin.
 * NOTE: Using the client SDK for this will sign the admin out and sign the new user in.
 * The UI should inform the admin to log back in. A robust solution uses a backend function.
 */
export const signUp = async (email: string, pass: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  // Create a document for the new user
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    role: "user" // Default role for members
  });
  return userCredential;
};

/**
 * Signs the current user out.
 */
export const signOut = () => {
  return firebaseSignOut(auth);
};

/**
 * Listens for authentication state changes and retrieves user role from Firestore.
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      // Default to 'user' role if not specified in Firestore
      const role = userDoc.exists() ? userDoc.data().role : 'user';

      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: role,
      });
    } else {
      callback(null);
    }
  });
};

// --- Firestore Service ---

// Helper to get user subcollection reference
const getGroceriesRef = (userId: string) => collection(db, 'users', userId, 'groceries');
const getDepositsRef = (userId: string) => collection(db, 'users', userId, 'deposits');

// --- Groceries ---
export const getGroceries = async (userId: string): Promise<GroceryItem[]> => {
    const querySnapshot = await getDocs(query(getGroceriesRef(userId), orderBy('date', 'desc')));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroceryItem));
};
export const addGrocery = (userId: string, item: Omit<GroceryItem, 'id'>) => addDoc(getGroceriesRef(userId), item);
export const updateGrocery = (userId: string, itemId: string, data: Partial<GroceryItem>) => updateDoc(doc(getGroceriesRef(userId), itemId), data);
export const deleteGrocery = (userId: string, itemId: string) => deleteDoc(doc(getGroceriesRef(userId), itemId));

// --- Deposits ---
export const getDeposits = async (userId: string): Promise<Deposit[]> => {
    const querySnapshot = await getDocs(query(getDepositsRef(userId), orderBy('date', 'desc')));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deposit));
};
export const addDeposit = (userId: string, deposit: Omit<Deposit, 'id'>) => addDoc(getDepositsRef(userId), deposit);
export const updateDeposit = (userId: string, depositId: string, data: Partial<Deposit>) => updateDoc(doc(getDepositsRef(userId), depositId), data);
export const deleteDeposit = (userId: string, depositId: string) => deleteDoc(doc(getDepositsRef(userId), depositId));

// --- Members (Users) ---
export const getMembers = async (): Promise<Participant[]> => {
    const usersQuery = query(collection(db, 'users'), orderBy('email'));
    const querySnapshot = await getDocs(usersQuery);
    return querySnapshot.docs.map(doc => ({ id: doc.id, email: doc.data().email } as Participant));
};


// --- Admin Data Fetching ---

/**
 * Defines the comprehensive summary of a user's data for admin analytics.
 */
export interface UserDataSummary {
    userId: string;
    userEmail: string;
    groceries: GroceryItem[];
    deposits: Deposit[];
}

/**
 * Fetches all data for all users. This is an admin-only function.
 */
export const fetchAllUsersData = async (): Promise<UserDataSummary[]> => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const allUserData: UserDataSummary[] = [];

    for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userEmail = userDoc.data().email;

        const groceries = await getGroceries(userId);
        const deposits = await getDeposits(userId);

        allUserData.push({
            userId,
            userEmail,
            groceries,
            deposits,
        });
    }

    return allUserData;
};