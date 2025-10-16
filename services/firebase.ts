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
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      callback({ uid: firebaseUser.uid, email: firebaseUser.email });
    } else {
      callback(null);
    }
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

// --- Members ---
export const getMembers = async (): Promise<Participant[]> => {
    const membersCol = getUserSubcollection('members');
    const q = query(membersCol, orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name } as Participant));
};
export const addMember = (name: string) => {
    const membersCol = getUserSubcollection('members');
    return addDoc(membersCol, { name });
};
