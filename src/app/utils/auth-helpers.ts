'use client';

import { FirebaseError } from 'firebase/app';

/**
 * Format Firebase authentication error messages to be more user-friendly
 */
export function formatAuthError(error: unknown): string {
  if (error instanceof FirebaseError) {
    const errorCode = error.code;
    
    // Email/password authentication errors
    if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
      return 'Invalid email or password';
    } else if (errorCode === 'auth/email-already-in-use') {
      return 'This email is already registered. Please sign in instead.';
    } else if (errorCode === 'auth/weak-password') {
      return 'Password should be at least 6 characters';
    } else if (errorCode === 'auth/invalid-email') {
      return 'Please enter a valid email address';
    } else if (errorCode === 'auth/user-disabled') {
      return 'This account has been disabled. Please contact support.';
    } else if (errorCode === 'auth/too-many-requests') {
      return 'Too many unsuccessful login attempts. Please try again later.';
    }
    
    // Google sign-in errors
    else if (errorCode === 'auth/popup-closed-by-user') {
      return 'Sign in was cancelled';
    } else if (errorCode === 'auth/popup-blocked') {
      return 'Sign in popup was blocked by your browser. Please allow popups for this site.';
    } else if (errorCode === 'auth/account-exists-with-different-credential') {
      return 'An account already exists with the same email address but different sign-in credentials.';
    }
    
    // Return the error message if we don't have a specific handler
    return error.message || 'An error occurred during authentication';
  }
  
  // For non-Firebase errors or unknown errors
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): { valid: boolean; message: string } {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  
  // Optional: Add more password strength requirements
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  if (strength < 3) {
    return { 
      valid: false, 
      message: 'Password should include uppercase, lowercase, numbers, and special characters' 
    };
  }
  
  return { valid: true, message: '' };
} 