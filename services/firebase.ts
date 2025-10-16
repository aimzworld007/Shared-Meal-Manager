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

// Top-level collection references
const groceriesCol = collection(db, 'groceries');
const depositsCol = collection(db, 'deposits');

// --- Groceries ---
export const getAllGroceries = async (): Promise<GroceryItem[]> => {
    const querySnapshot = await getDocs(query(groceriesCol, orderBy('date', 'desc')));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroceryItem));
};
export const addGrocery = (item: Omit<GroceryItem, 'id'>) => addDoc(groceriesCol, item);
export const updateGrocery = (itemId: string, data: Partial<GroceryItem>) => updateDoc(doc(groceriesCol, itemId), data);
export const deleteGrocery = (itemId: string) => deleteDoc(doc(groceriesCol, itemId));

// --- Deposits ---
export const getAllDeposits = async (): Promise<Deposit[]> => {
    const querySnapshot = await getDocs(query(depositsCol, orderBy('date', 'desc')));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deposit));
};
export const addDeposit = (deposit: Omit<Deposit, 'id'>) => addDoc(depositsCol, deposit);
export const updateDeposit = (depositId: string, data: Partial<Deposit>) => updateDoc(doc(depositsCol, depositId), data);
export const deleteDeposit = (depositId: string) => deleteDoc(doc(depositsCol, depositId));


// --- Members (Users) ---
export const getMembers = async (): Promise<Participant[]> => {
    const usersQuery = query(collection(db, 'users'), orderBy('email'));
    const querySnapshot = await getDocs(usersQuery);
    return querySnapshot.docs.map(doc => ({ id: doc.id, email: doc.data().email } as Participant));
};
