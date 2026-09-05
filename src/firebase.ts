import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';

export { onAuthStateChanged };
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import firebaseConfigJson from '../firebase-applet-config.json';
import { CustomQuiz, QuizResult } from './types';

export const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey || "AIzaSyAiLuMn32Bo46YmgOfwJjGGJ9s6t4_58wc",
  authDomain: firebaseConfigJson.authDomain || "quiz-pro-bf311.firebaseapp.com",
  projectId: firebaseConfigJson.projectId || "quiz-pro-bf311",
  storageBucket: firebaseConfigJson.storageBucket || "quiz-pro-bf311.firebasestorage.app",
  messagingSenderId: firebaseConfigJson.messagingSenderId || "6982667020",
  appId: firebaseConfigJson.appId || "1:6982667020:web:b12da9e7829ba6b48a5729",
  measurementId: firebaseConfigJson.measurementId || "G-E45JMPLTTF",
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore (support named database if configured, or default)
const databaseId = firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
  ? firebaseConfigJson.firestoreDatabaseId
  : undefined;

export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

// Safe Analytics
export const initAnalytics = async () => {
  try {
    if (await isSupported()) {
      return getAnalytics(app);
    }
  } catch {
    // ignore analytics errors in iframe/sandbox
  }
  return null;
};
initAnalytics();

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string | null;
  photoURL?: string | null;
  isAnonymous: boolean;
  totalScore: number;
  quizzesPlayed: number;
  bestStreak: number;
  totalCorrect: number;
  totalQuestions: number;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  photoURL?: string | null;
  totalScore: number;
  quizzesPlayed: number;
  bestStreak: number;
  accuracy: number;
  updatedAt?: any;
}

// Local Guest Identifier
export function getGuestUserId(): string {
  const key = 'quiz_pro_guest_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `guest_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export function getGuestDisplayName(): string {
  const key = 'quiz_pro_guest_name';
  let name = localStorage.getItem(key);
  if (!name) {
    name = 'Quiz Pioneer';
    localStorage.setItem(key, name);
  }
  return name;
}

export function setGuestDisplayName(name: string): void {
  localStorage.setItem('quiz_pro_guest_name', name);
}

// Authentication Helpers
export async function ensureAuth(): Promise<FirebaseUser | null> {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err: any) {
    // If anonymous auth is disabled on this Firebase project (auth/admin-restricted-operation),
    // handle gracefully without breaking app functionality.
    return null;
  }
}

export async function loginWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider);
  await syncUserProfile(res.user);
  return res.user;
}

export async function logoutUser(): Promise<void> {
  await fbSignOut(auth);
}

export async function updateUserDisplayName(name: string): Promise<void> {
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: name });
    await syncUserProfile(auth.currentUser);
  } else {
    setGuestDisplayName(name);
  }
}

// Sync user profile to Firestore
export async function syncUserProfile(user: FirebaseUser | null): Promise<UserProfile> {
  const uid = user ? user.uid : getGuestUserId();
  const displayName = user?.displayName || (user?.isAnonymous ? 'Quiz Pioneer' : getGuestDisplayName());
  const isAnonymous = user ? user.isAnonymous : true;
  const email = user?.email || null;
  const photoURL = user?.photoURL || null;

  const userRef = doc(db, 'users', uid);
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const initialProfile: UserProfile = {
        uid,
        displayName,
        email,
        photoURL,
        isAnonymous,
        totalScore: 0,
        quizzesPlayed: 0,
        bestStreak: 0,
        totalCorrect: 0,
        totalQuestions: 0,
      };
      await setDoc(userRef, {
        ...initialProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return initialProfile;
    } else {
      const data = snap.data() as UserProfile;
      if (user?.displayName && user.displayName !== data.displayName) {
        await setDoc(userRef, { displayName: user.displayName, updatedAt: serverTimestamp() }, { merge: true });
        data.displayName = user.displayName;
      }
      return data;
    }
  } catch (e) {
    // Fallback profile if offline or restricted
    return {
      uid,
      displayName,
      email,
      photoURL,
      isAnonymous,
      totalScore: 0,
      quizzesPlayed: 0,
      bestStreak: 0,
      totalCorrect: 0,
      totalQuestions: 0,
    };
  }
}

// Save Quiz Result to Firestore
export async function saveCloudQuizResult(result: QuizResult): Promise<void> {
  try {
    const user = auth.currentUser;
    const uid = user ? user.uid : getGuestUserId();
    const displayName = user?.displayName || (user?.isAnonymous ? 'Quiz Pioneer' : getGuestDisplayName());
    const photoURL = user?.photoURL || null;

    // Save individual attempt
    await addDoc(collection(db, 'quiz_results'), {
      ...result,
      userId: uid,
      userDisplayName: displayName,
      userPhotoURL: photoURL,
      createdAt: serverTimestamp(),
    });

    // Update aggregate user record
    const userRef = doc(db, 'users', uid);
    let currentData: Partial<UserProfile> = {};
    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        currentData = userSnap.data() as Partial<UserProfile>;
      }
    } catch {
      // ignore
    }

    const totalScore = (currentData.totalScore || 0) + result.score;
    const quizzesPlayed = (currentData.quizzesPlayed || 0) + 1;
    const totalQuestions = (currentData.totalQuestions || 0) + result.totalQuestions;
    const totalCorrect = (currentData.totalCorrect || 0) + result.correctCount;
    const bestStreak = Math.max(currentData.bestStreak || 0, result.maxStreak);
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    await setDoc(
      userRef,
      {
        uid,
        displayName: displayName || currentData.displayName || 'Quiz Pioneer',
        email: user?.email || null,
        photoURL: photoURL,
        totalScore,
        quizzesPlayed,
        totalQuestions,
        totalCorrect,
        bestStreak,
        accuracy,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Update global leaderboard document
    const lbRef = doc(db, 'leaderboards', uid);
    await setDoc(
      lbRef,
      {
        userId: uid,
        displayName: displayName || currentData.displayName || 'Quiz Pioneer',
        photoURL: photoURL,
        totalScore,
        quizzesPlayed,
        bestStreak,
        accuracy,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error saving quiz result to Firestore:', err);
  }
}

// Real-time Leaderboard Listener
export function subscribeToLeaderboard(callback: (entries: LeaderboardEntry[]) => void): () => void {
  try {
    const q = query(collection(db, 'leaderboards'), orderBy('totalScore', 'desc'), limit(25));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: LeaderboardEntry[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        callback(list);
      },
      (err) => {
        console.error('Leaderboard snapshot error:', err);
      }
    );
  } catch (e) {
    console.error('Failed to subscribe to leaderboard:', e);
    return () => {};
  }
}

// Cloud Custom Quizzes
export async function saveCloudCustomQuiz(quiz: CustomQuiz): Promise<void> {
  try {
    const user = auth.currentUser;
    const uid = user ? user.uid : getGuestUserId();
    const displayName = user?.displayName || getGuestDisplayName();

    const quizRef = doc(db, 'custom_quizzes', quiz.id);
    await setDoc(
      quizRef,
      {
        ...quiz,
        createdBy: uid,
        createdByName: displayName,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.error('Failed to save custom quiz to Firestore:', e);
  }
}

export async function deleteCloudCustomQuiz(quizId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'custom_quizzes', quizId));
  } catch (e) {
    console.error('Failed to delete cloud custom quiz:', e);
  }
}

export function subscribeToCustomQuizzes(callback: (quizzes: CustomQuiz[]) => void): () => void {
  try {
    const q = query(collection(db, 'custom_quizzes'), limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: CustomQuiz[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        callback(list);
      },
      (err) => {
        console.error('Cloud quizzes snapshot error:', err);
      }
    );
  } catch (e) {
    console.error('Failed to subscribe to cloud custom quizzes:', e);
    return () => {};
  }
}
