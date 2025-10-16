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
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  setDoc,
  getDoc,
} from "firebase/firestore";
// Fix: Add Firebase storage imports for site settings features.
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
// Fix: Import the missing SiteSettings type.
import { User, GroceryItem, Deposit, Participant, SiteSettings } from "../types";

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
// Fix: Initialize Firebase Storage.
const storage = getStorage(app);

// --- Helper to get user-specific subcollection ref ---
const getUserSubcollection = (collectionName: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated.");
    return collection(db, 'users', user.uid, collectionName);
};


// --- Auth Service ---
export const signIn = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
export const signUp = async (email: string, pass: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  // Create a document for the new user so we can add subcollections to it.
  await setDoc(doc(db, "users", user.uid), { email: user.email, createdAt: new Date() });
  return userCredential;
};
export const signOut = () => firebaseSignOut(auth);
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
    callback(firebaseUser);
  });
};
export const sendPasswordResetEmail = (email: string) => firebaseSendPasswordResetEmail(auth, email);
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

// --- Firestore Service (User-Scoped) ---

// --- Groceries ---
export const getAllGroceries = async (): Promise<GroceryItem[]> => {
    const groceriesCol = getUserSubcollection('groceries');
    const q = query(groceriesCol, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroceryItem));
};
export const addGrocery = (item: Omit<GroceryItem, 'id'>) => {
    const groceriesCol = getUserSubcollection('groceries');
    return addDoc(groceriesCol, item);
};
export const deleteGrocery = (itemId: string) => {
    const groceryDocRef = doc(getUserSubcollection('groceries'), itemId);
    return deleteDoc(groceryDocRef);
};
export const updateGrocery = (itemId: string, data: Partial<Omit<GroceryItem, 'id'>>) => {
    const groceryDocRef = doc(getUserSubcollection('groceries'), itemId);
    return updateDoc(groceryDocRef, data);
};


// --- Deposits ---
export const getAllDeposits = async (): Promise<Deposit[]> => {
    const depositsCol = getUserSubcollection('deposits');
    const q = query(depositsCol, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deposit));
};
export const addDeposit = (deposit: Omit<Deposit, 'id'>) => {
    const depositsCol = getUserSubcollection('deposits');
    return addDoc(depositsCol, deposit);
};
export const deleteDeposit = (depositId: string) => {
    const depositDocRef = doc(getUserSubcollection('deposits'), depositId);
    return deleteDoc(depositDocRef);
};
export const updateDeposit = (depositId: string, data: Partial<Omit<Deposit, 'id'>>) => {
    const depositDocRef = doc(getUserSubcollection('deposits'), depositId);
    return updateDoc(depositDocRef, data);
};

// --- Members ---
export const getMembers = async (): Promise<Participant[]> => {
    const membersCol = getUserSubcollection('members');
    const q = query(membersCol, orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Participant));
};
export const addMember = (name: string, phone: string) => {
    const membersCol = getUserSubcollection('members');
    return addDoc(membersCol, { name, phone });
};
export const updateMember = (memberId: string, name: string, phone: string) => {
    const memberDocRef = doc(getUserSubcollection('members'), memberId);
    return updateDoc(memberDocRef, { name, phone });
};
export const deleteMember = (memberId: string) => {
    const memberDocRef = doc(getUserSubcollection('members'), memberId);
    return deleteDoc(memberDocRef);
};


// Fix: Add missing functions for managing site settings.
// --- Site Settings (Admin) ---
export const getSiteSettings = async (): Promise<SiteSettings> => {
  const settingsDocRef = doc(db, 'settings', 'site');
  const docSnap = await getDoc(settingsDocRef);
  if (docSnap.exists()) {
    return docSnap.data() as SiteSettings;
  }
  return {}; // Return empty object if no settings found
};

export const updateSiteSettings = (data: Partial<SiteSettings>) => {
  const settingsDocRef = doc(db, 'settings', 'site');
  return setDoc(settingsDocRef, data, { merge: true });
};

export const uploadLogo = async (file: File): Promise<string> => {
  // Use a consistent file path to overwrite the logo
  const storageRef = ref(storage, 'site/logo.png');
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};