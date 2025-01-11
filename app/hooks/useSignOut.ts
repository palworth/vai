import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const useSignOut = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      await signOut(auth);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { logout, error, loading };
};

