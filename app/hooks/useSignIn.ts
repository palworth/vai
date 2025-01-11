import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const useSignIn = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      return true;  // Return true on successful login
    } catch (err) {
      setError((err as Error).message);
      return false;  // Return false if login fails
    } finally {
      setLoading(false);
    }
  };

  return { signIn, error, loading };
};

