import { cookies } from 'next/headers';
import crypto from 'crypto';

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

export const generateCSRFToken = (): string => {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
};

export const setCSRFCookie = async (token: string): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600, // 1 hour
    path: '/',
  });
};

export const getCSRFToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value || null;
};

export const verifyCSRFToken = async (token: string | null): Promise<boolean> => {
  if (!token) return false;

  const cookieToken = await getCSRFToken();
  if (!cookieToken) return false;

  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(cookieToken)
  );
};

export const validateCSRFRequest = async (request: Request): Promise<boolean> => {
  // CSRF tokens are only needed for state-changing requests
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true;
  }

  const token = request.headers.get(CSRF_HEADER_NAME);
  return verifyCSRFToken(token);
};
