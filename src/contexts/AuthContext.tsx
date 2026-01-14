'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Constants
const DEFAULT_PASSCODE = '123456';
const MASTER_RESET_CODE = 'BABURAOMARINE1904';
const STORAGE_KEY = 'auth_passcode';
const SESSION_KEY = 'auth_session';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (passcode: string) => boolean;
  logout: () => void;
  resetPasscode: (masterCode: string, newPasscode: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple encoding to obscure passcode in localStorage (not cryptographically secure)
const encodePasscode = (passcode: string): string => {
  return btoa(passcode);
};

const decodePasscode = (encoded: string): string => {
  try {
    return atob(encoded);
  } catch {
    return '';
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize: Check if user has a valid session
  useEffect(() => {
    const checkSession = () => {
      if (typeof window !== 'undefined') {
        const session = sessionStorage.getItem(SESSION_KEY);
        if (session === 'active') {
          setIsAuthenticated(true);
        }
        
        // Initialize default passcode if not set
        const storedPasscode = localStorage.getItem(STORAGE_KEY);
        if (!storedPasscode) {
          localStorage.setItem(STORAGE_KEY, encodePasscode(DEFAULT_PASSCODE));
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = (passcode: string): boolean => {
    if (typeof window === 'undefined') return false;

    const storedPasscode = localStorage.getItem(STORAGE_KEY);
    if (!storedPasscode) {
      // If no passcode exists, set default and check against it
      localStorage.setItem(STORAGE_KEY, encodePasscode(DEFAULT_PASSCODE));
      if (passcode === DEFAULT_PASSCODE) {
        sessionStorage.setItem(SESSION_KEY, 'active');
        setIsAuthenticated(true);
        return true;
      }
      return false;
    }

    const actualPasscode = decodePasscode(storedPasscode);
    if (passcode === actualPasscode) {
      sessionStorage.setItem(SESSION_KEY, 'active');
      setIsAuthenticated(true);
      return true;
    }

    return false;
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_KEY);
    }
    setIsAuthenticated(false);
  };

  const resetPasscode = (masterCode: string, newPasscode: string): boolean => {
    if (typeof window === 'undefined') return false;

    // Verify master reset code
    if (masterCode !== MASTER_RESET_CODE) {
      return false;
    }

    // Validate new passcode (must be exactly 6 digits)
    if (!newPasscode || newPasscode.length !== 6 || !/^\d+$/.test(newPasscode)) {
      return false;
    }

    // Set new passcode
    localStorage.setItem(STORAGE_KEY, encodePasscode(newPasscode));
    return true;
  };

  const value: AuthContextType = {
    isAuthenticated,
    login,
    logout,
    resetPasscode,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
