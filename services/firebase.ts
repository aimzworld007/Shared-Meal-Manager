import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
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
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { User, GroceryItem, Deposit, Participant, SiteConfig } from "../types";

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
const storage = getStorage(app);

// --- Auth Service ---
export const signIn = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
export const signUp = async (email: string, pass: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  await setDoc(doc(db, "users", user.uid), { email: user.email, role: "user" });
  return userCredential;
};
export const signOut = () => firebaseSignOut(auth);
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const role = userDoc.exists() ? userDoc.data().role : 'user';
      callback({ uid: firebaseUser.uid, email: firebaseUser.email, role });
    } else {
      callback(null);
    }
  });
};
export const reauthenticateUser = async (password: string) => {
  const user = auth.currentUser;
  if (user && user.email) {
    const credential = EmailAuthProvider.credential(user.email, password);
    return reauthenticateWithCredential(user, credential);
  }
  throw new Error("No user is currently signed in or user has no email.");
};
export const changeUserEmail = (newEmail: string) => {
  if (!auth.currentUser) throw new Error("User not authenticated.");
  return updateEmail(auth.currentUser, newEmail);
};
export const changeUserPassword = (newPassword: string) => {
  if (!auth.currentUser) throw new Error("User not authenticated.");
  return updatePassword(auth.currentUser, newPassword);
};

// --- Firestore Service ---
const groceriesCol = collection(db, 'groceries');
const depositsCol = collection(db, 'deposits');
const membersCol = collection(db, 'members');
const settingsDoc = doc(db, 'settings', 'siteConfig');

// --- Settings ---
export const getSiteConfig = async (): Promise<SiteConfig> => {
    const docSnap = await getDoc(settingsDoc);
    if (docSnap.exists()) {
        return docSnap.data() as SiteConfig;
    }
    // Return a default config if it doesn't exist
    return {
        title: "Shared Meal Manager",
        description: "A web application to manage shared meal expenses.",
        logoUrl: '', // Default to no logo
    };
};
export const updateSiteConfig = (data: Partial<SiteConfig>) => setDoc(settingsDoc, data, { merge: true });

// --- Groceries ---
export const getAllGroceries = async (): Promise<GroceryItem[]> => {
    const q = query(groceriesCol, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroceryItem));
};
export const addGrocery = (item: Omit<GroceryItem, 'id'>) => addDoc(groceriesCol, item);
export const deleteGrocery = (itemId: string) => deleteDoc(doc(groceriesCol, itemId));

// --- Deposits ---
export const getAllDeposits = async (): Promise<Deposit[]> => {
    const q = query(depositsCol, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deposit));
};
export const addDeposit = (deposit: Omit<Deposit, 'id'>) => addDoc(depositsCol, deposit);
export const deleteDeposit = (depositId: string) => deleteDoc(doc(depositsCol, depositId));

// --- Members ---
export const getMembers = async (): Promise<Participant[]> => {
    const q = query(membersCol, orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name } as Participant));
};
export const addMember = (name: string) => addDoc(membersCol, { name });

// --- Storage Service ---
export const uploadLogo = async (file: File): Promise<string> => {
    // Use a fixed path to always overwrite the same logo file
    const logoRef = ref(storage, 'site/logo');
    await uploadBytes(logoRef, file);
    return getDownloadURL(logoRef);
};
