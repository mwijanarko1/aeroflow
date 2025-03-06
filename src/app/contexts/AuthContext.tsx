'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  UserCredential
} from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, setDoc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { SavedAnalysis } from '../types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string, agreeToTerms: boolean) => Promise<UserCredential>;
  signInWithGoogle: (agreeToTerms: boolean) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName?: string, photoURL?: string) => Promise<void>;
  updateUserEmail: (email: string, password: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  saveAnalysisData: (data: any) => Promise<void>;
  getUserAnalysisData: () => Promise<SavedAnalysis[]>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, agreeToTerms: boolean) => {
    if (!agreeToTerms) {
      throw new Error('You must agree to the Terms of Service and Privacy Policy');
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Save user data with terms agreement
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      photoURL: userCredential.user.photoURL,
      agreedToTerms: true,
      agreedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    return userCredential;
  };

  const signInWithGoogle = async (agreeToTerms: boolean) => {
    if (!agreeToTerms) {
      throw new Error('You must agree to the Terms of Service and Privacy Policy');
    }
    
    const userCredential = await signInWithPopup(auth, googleProvider);
    
    // Check if user already exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      // Save user data with terms agreement for new users
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        agreedToTerms: true,
        agreedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    }

    return userCredential;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (displayName?: string, photoURL?: string) => {
    if (!user) throw new Error('User not authenticated');
    
    const updateData: { displayName?: string; photoURL?: string } = {};
    if (displayName) updateData.displayName = displayName;
    if (photoURL) updateData.photoURL = photoURL;
    
    await updateProfile(user, updateData);
    
    // Update user data in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      ...updateData,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  };

  const updateUserEmail = async (email: string, password: string) => {
    if (!user) throw new Error('User not authenticated');
    
    // Re-authenticate user first (not implemented here, would require reauthenticateWithCredential)
    
    await updateEmail(user, email);
    
    // Update user data in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('User not authenticated');
    
    // Re-authenticate user first (not implemented here, would require reauthenticateWithCredential)
    
    await updatePassword(user, newPassword);
  };

  const saveAnalysisData = async (data: any) => {
    if (!user) throw new Error('User not authenticated');
    
    // Create a reference to the user's analysis collection
    const analysisRef = doc(db, 'users', user.uid, 'analyses', new Date().toISOString());
    
    // Save the analysis data
    await setDoc(analysisRef, {
      ...data,
      createdAt: new Date().toISOString(),
      userId: user.uid,
    });
  };

  const getUserAnalysisData = async (): Promise<SavedAnalysis[]> => {
    if (!user) throw new Error('User not authenticated');
    
    // Get all analyses for the user
    const analysesRef = collection(db, 'users', user.uid, 'analyses');
    const q = query(analysesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const analyses: SavedAnalysis[] = [];
    querySnapshot.forEach((doc) => {
      analyses.push({
        id: doc.id,
        ...doc.data()
      } as SavedAnalysis);
    });
    
    return analyses;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    saveAnalysisData,
    getUserAnalysisData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 