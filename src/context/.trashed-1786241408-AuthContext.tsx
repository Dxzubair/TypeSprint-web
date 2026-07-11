import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInAnonymously, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  OAuthProvider
} from 'firebase/auth';
import { auth, isFirebaseEnabled, GoogleAuthProvider } from '../utils/firebase';
import { syncUserData, saveUserDataToCloud } from '../utils/sync';
import { loadProfile, loadStats, loadAchievements, loadSettings } from '../utils/storage';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAnonymous: boolean;
  isFirebaseActive: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  loginAnonymously: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  triggerSync: (forceUpload?: boolean) => Promise<void>;
  updateUserDisplayName: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Auto-sync wrapper to make manual trigger simple
  const triggerSync = async (forceUpload = false) => {
    if (user) {
      const synced = await syncUserData(user.uid, forceUpload);
      if (synced) {
        // Dispatch custom event to notify App.tsx that sync updated state
        window.dispatchEvent(new CustomEvent('typesprint_sync_complete', { detail: synced }));
      }
    }
  };

  useEffect(() => {
    if (!isFirebaseEnabled || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAnonymous(currentUser ? currentUser.isAnonymous : false);
      
      if (currentUser) {
        // Automatically sync data with cloud upon successful login
        const synced = await syncUserData(currentUser.uid);
        if (synced) {
          window.dispatchEvent(new CustomEvent('typesprint_sync_complete', { detail: synced }));
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    if (!isFirebaseEnabled || !auth) throw new Error('Firebase authentication is not enabled');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signupWithEmail = async (email: string, password: string, displayName: string) => {
    if (!isFirebaseEnabled || !auth) throw new Error('Firebase authentication is not enabled');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseEnabled || !auth) throw new Error('Firebase authentication is not enabled');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithApple = async () => {
    if (!isFirebaseEnabled || !auth) throw new Error('Firebase authentication is not enabled');
    // Apple sign in is prepared. For full browser support, this uses OAuthProvider with 'apple.com'
    const provider = new OAuthProvider('apple.com');
    await signInWithPopup(auth, provider);
  };

  const loginAnonymously = async () => {
    if (!isFirebaseEnabled || !auth) throw new Error('Firebase authentication is not enabled');
    await signInAnonymously(auth);
  };

  const logout = async () => {
    if (!isFirebaseEnabled || !auth) throw new Error('Firebase authentication is not enabled');
    await signOut(auth);
    window.dispatchEvent(new CustomEvent('typesprint_logout'));
  };

  const resetPassword = async (email: string) => {
    if (!isFirebaseEnabled || !auth) throw new Error('Firebase authentication is not enabled');
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserDisplayName = async (displayName: string) => {
    if (!isFirebaseEnabled || !auth) throw new Error('Firebase authentication is not enabled');
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName });
      // Force reload of user to update AuthContext state
      setUser({ ...auth.currentUser });
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAnonymous,
    isFirebaseActive: isFirebaseEnabled,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    loginWithApple,
    loginAnonymously,
    logout,
    resetPassword,
    triggerSync,
    updateUserDisplayName
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
