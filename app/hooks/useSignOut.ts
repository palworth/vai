import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { clearAuthCookie } from '@/utils/auth';

export const useSignOut = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      await signOut(auth);
      // Clear the authentication cookie after successful logout
      clearAuthCookie();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { logout, error, loading };
};

