import { User } from 'firebase/auth';
import nookies from 'nookies';

// Function to set the authentication cookie
export const setAuthCookie = async (user: User) => {
  const token = await user.getIdToken();
  nookies.set(null, 'token', token, {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
};

// Function to verify the authentication cookie
export const verifyAuthCookie = (cookies: { [key: string]: string }) => {
  return cookies.token ? true : false;
};

// Function to clear the authentication cookie
export const clearAuthCookie = () => {
  nookies.destroy(null, 'token');
};

