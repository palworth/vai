'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import nookies from 'nookies';
import { verifyAuthCookie } from '@/utils/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Refresh the token on auth state change
        const token = await user.getIdToken();
        nookies.set(undefined, 'token', token, { path: '/' });

        // Check if user document exists in Firestore, if not create one
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            name: user.displayName || '',
            email: user.email || '',
            // Add any other fields you want to store
          });
        }
      } else {
        setUser(null);
        nookies.set(undefined, 'token', '', { path: '/' });
      }
      setLoading(false);
    });

    // Check for existing token on initial load
    const cookies = nookies.get();
    if (verifyAuthCookie(cookies)) {
      // If a valid token exists, wait for onAuthStateChanged to set the user
    } else {
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

