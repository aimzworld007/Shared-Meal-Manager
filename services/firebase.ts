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
  deleteUser,
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
  writeBatch,
  where,
  limit,
} from "firebase/firestore";
// FIX: Added Firebase Storage imports for handling file uploads.
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
// FIX: Added SiteSettings type import.
import { User, GroceryItem, Deposit, Participant, Period, ArchiveData, SiteSettings, Reminder } from "../types";

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
// FIX: Initialize Firebase Storage.
const storage = getStorage(app);

// --- Auth Service ---
export const signIn = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
export const signUp = async (email: string, pass: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  // Create a document for the new user so we can add subcollections to it.
  await setDoc(doc(db, "users", user.uid), { 
    email: user.email, 
    createdAt: new Date(),
    currency: 'AED' // Set default currency on signup
  });
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

export const deleteUserAccount = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated.");

  // 1. Delete Firestore data
  const userDocRef = doc(db, 'users', user.uid);
  // Note: This does not delete subcollections (members, periods, etc.). For a full
  // cleanup, a Cloud Function would be needed to recursively delete subcollections.
  // For this client-side app, we delete the main doc, and security rules will
  // make the orphaned subcollections inaccessible to anyone.
  await deleteDoc(userDocRef);

  // 2. Delete user from Auth
  await deleteUser(user);
};


// --- Firestore Service (User-Scoped) ---

// --- User Data ---
export const getUserData = async (uid: string): Promise<User | null> => {
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        // We only cast here because we know the shape from signup and updates
        return { uid, ...(docSnap.data() as Omit<User, 'uid'>) };
    }
    return null;
}

export const updateUserSettings = (uid: string, data: Partial<User>) => {
    const userDocRef = doc(db, 'users', uid);
    return updateDoc(userDocRef, data);
};

// --- Helper for period-specific subcollections ---
const getPeriodSubcollection = (periodId: string, collectionName: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated.");
    if (!periodId) throw new Error("Period ID is required for this operation.");
    return collection(db, 'users', user.uid, 'periods', periodId, collectionName);
};

// --- Helper for user-level subcollections (like members) ---
const getUserSubcollection = (collectionName: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated.");
    return collection(db, 'users', user.uid, collectionName);
};

// --- Groceries (scoped to a period) ---
export const getAllGroceries = async (periodId: string): Promise<GroceryItem[]> => {
    const groceriesCol = getPeriodSubcollection(periodId, 'groceries');
    const q = query(groceriesCol, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroceryItem));
};
export const addGrocery = (periodId: string, item: Omit<GroceryItem, 'id'>) => {
    const groceriesCol = getPeriodSubcollection(periodId, 'groceries');
    return addDoc(groceriesCol, item);
};
export const deleteGrocery = (periodId: string, itemId: string) => {
    const groceryDocRef = doc(getPeriodSubcollection(periodId, 'groceries'), itemId);
    return deleteDoc(groceryDocRef);
};
export const updateGrocery = (periodId: string, itemId: string, data: Partial<Omit<GroceryItem, 'id'>>) => {
    const groceryDocRef = doc(getPeriodSubcollection(periodId, 'groceries'), itemId);
    return updateDoc(groceryDocRef, data);
};


// --- Deposits (scoped to a period) ---
export const getAllDeposits = async (periodId: string): Promise<Deposit[]> => {
    const depositsCol = getPeriodSubcollection(periodId, 'deposits');
    const q = query(depositsCol, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deposit));
};
export const addDeposit = (periodId: string, deposit: Omit<Deposit, 'id'>) => {
    const depositsCol = getPeriodSubcollection(periodId, 'deposits');
    return addDoc(depositsCol, deposit);
};
export const deleteDeposit = (periodId: string, depositId: string) => {
    const depositDocRef = doc(getPeriodSubcollection(periodId, 'deposits'), depositId);
    return deleteDoc(depositDocRef);
};
export const updateDeposit = (periodId: string, depositId: string, data: Partial<Omit<Deposit, 'id'>>) => {
    const depositDocRef = doc(getPeriodSubcollection(periodId, 'deposits'), depositId);
    return updateDoc(depositDocRef, data);
};

// --- Members (not period-specific) ---
export const getMembers = async (): Promise<Participant[]> => {
    const membersCol = getUserSubcollection('members');
    const q = query(membersCol, orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Participant));
};
export const addMember = (name: string, phone: string) => {
    const membersCol = getUserSubcollection('members');
    return addDoc(membersCol, { name, phone, isMealManager: false });
};
export const updateMember = (memberId: string, name: string, phone: string) => {
    const memberDocRef = doc(getUserSubcollection('members'), memberId);
    return updateDoc(memberDocRef, { name, phone });
};
export const deleteMember = (memberId: string) => {
    const memberDocRef = doc(getUserSubcollection('members'), memberId);
    return deleteDoc(memberDocRef);
};

export const setMealManager = async (newManagerId: string) => {
    const membersCol = getUserSubcollection('members');
    const batch = writeBatch(db);

    const membersSnapshot = await getDocs(membersCol);
    membersSnapshot.forEach(doc => {
        if (doc.data().isMealManager === true && doc.id !== newManagerId) {
            batch.update(doc.ref, { isMealManager: false });
        }
    });

    const newManagerRef = doc(membersCol, newManagerId);
    batch.update(newManagerRef, { isMealManager: true });

    await batch.commit();
};

// --- Reminders (not period-specific) ---
export const getReminders = async (): Promise<Reminder[]> => {
    const remindersCol = getUserSubcollection('reminders');
    const q = query(remindersCol, orderBy('dueDate', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder));
};

export const addReminder = (reminderData: Omit<Reminder, 'id'>) => {
    const remindersCol = getUserSubcollection('reminders');
    return addDoc(remindersCol, reminderData);
};

export const updateReminder = (reminderId: string, data: Partial<Omit<Reminder, 'id'>>) => {
    const reminderDocRef = doc(getUserSubcollection('reminders'), reminderId);
    return updateDoc(reminderDocRef, data);
};

export const deleteReminder = (reminderId: string) => {
    const reminderDocRef = doc(getUserSubcollection('reminders'), reminderId);
    return deleteDoc(reminderDocRef);
};


// --- Meal Periods & Archiving ---
export const getPeriods = async (): Promise<Period[]> => {
    const periodsCol = getUserSubcollection('periods');
    const q = query(periodsCol, orderBy('startDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Period));
}

export const updatePeriod = (periodId: string, data: Partial<Omit<Period, 'id' | 'status'>>) => {
    const periodDocRef = doc(getUserSubcollection('periods'), periodId);
    return updateDoc(periodDocRef, data);
};

export const getActivePeriod = async (): Promise<Period | null> => {
    const periodsCol = getUserSubcollection('periods');
    const q = query(periodsCol, where('status', '==', 'active'), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Period;
};

export const getArchivedPeriods = async (): Promise<Period[]> => {
    const periodsCol = getUserSubcollection('periods');
    const q = query(periodsCol, where('status', '==', 'archived'), orderBy('startDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Period));
};

export const getArchive = async (archiveId: string) => {
    const archiveRef = doc(getUserSubcollection('archives'), archiveId);
    const docSnap = await getDoc(archiveRef);
    if (!docSnap.exists()) {
        throw new Error("Archive not found.");
    }
    return { id: docSnap.id, ...docSnap.data() };
};

export const createFirstPeriod = (periodData: Omit<Period, 'id' | 'status'>) => {
    const periodsCol = getUserSubcollection('periods');
    return addDoc(periodsCol, { ...periodData, status: 'active' });
};

export const archivePeriodAndStartNew = async (
    currentPeriod: Period,
    archiveData: ArchiveData,
    newPeriodData: Omit<Period, 'id' | 'status'>,
    transferBalances: boolean,
) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated.");

    const batch = writeBatch(db);

    // 1. Create the archive document
    const archiveDocRef = doc(getUserSubcollection('archives'), currentPeriod.id);
    batch.set(archiveDocRef, {
        periodName: currentPeriod.name,
        archivedAt: new Date().toISOString(),
        periodStartDate: currentPeriod.startDate,
        periodEndDate: currentPeriod.endDate,
        data: archiveData,
    });

    // 2. Update current period to 'archived'
    const currentPeriodRef = doc(getUserSubcollection('periods'), currentPeriod.id);
    batch.update(currentPeriodRef, { status: 'archived' });

    // 3. Create the new 'active' period
    const newPeriodRef = doc(getUserSubcollection('periods'));
    const newPeriodWithStatus: Omit<Period, 'id'> = {
        ...newPeriodData,
        status: 'active',
    };
    batch.set(newPeriodRef, newPeriodWithStatus);

    // 4. (Optional) Create transfer deposits in the new period
    if (transferBalances) {
        for (const member of archiveData.members) {
            if (member.balance !== 0) {
                const depositData: Omit<Deposit, 'id'> = {
                    amount: member.balance,
                    date: newPeriodData.startDate,
                    userId: member.id,
                    notes: `Balance transfer from '${currentPeriod.name}'`
                };
                const newDepositRef = doc(getPeriodSubcollection(newPeriodRef.id, 'deposits'));
                batch.set(newDepositRef, depositData);
            }
        }
    }

    // 5. Commit batch
    await batch.commit();

    // 6. Clean up old archives (keep the latest 3)
    const archivesCol = getUserSubcollection('archives');
    const archivesQuery = query(archivesCol, orderBy('archivedAt', 'desc'));
    const snapshot = await getDocs(archivesQuery);
    if (snapshot.docs.length > 3) {
        const archivesToDelete = snapshot.docs.slice(3);
        const deleteBatch = writeBatch(db);
        archivesToDelete.forEach(doc => deleteBatch.delete(doc.ref));
        await deleteBatch.commit();
        console.log(`Deleted ${archivesToDelete.length} old archive(s).`);
    }
};

// FIX: Added functions to manage global site settings for admins.
// --- Site Settings (Admin) ---
export const getSiteSettings = async (): Promise<SiteSettings> => {
    const settingsRef = doc(db, 'settings', 'site');
    const docSnap = await getDoc(settingsRef);
    if (docSnap.exists()) {
        return docSnap.data() as SiteSettings;
    }
    // Return default/empty settings if not found, to prevent app from crashing on first run.
    return { siteTitle: 'Shared Meal Manager', siteDescription: 'Manage your shared meals easily.', logoUrl: '' };
};

export const updateSiteSettings = (data: Partial<SiteSettings>) => {
    const settingsRef = doc(db, 'settings', 'site');
    // Use setDoc with merge: true to create/update the document without overwriting existing fields.
    return setDoc(settingsRef, data, { merge: true });
};

export const uploadLogo = async (file: File): Promise<string> => {
    // Create a unique file path to prevent overwriting existing files.
    const filePath = `logos/${new Date().getTime()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
};