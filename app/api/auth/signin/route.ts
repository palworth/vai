import { NextResponse } from 'next/server';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();

    // Set the token as an HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    console.log('Token set in signin route');

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof FirebaseError) {
      console.error('Firebase sign-in error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      console.error('Unexpected sign-in error:', error);
      return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
  }
}

