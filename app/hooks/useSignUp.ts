import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const useSignUp = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { signUp, error, loading };
};

