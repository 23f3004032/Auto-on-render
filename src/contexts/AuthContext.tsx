'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Constants
const DEFAULT_PASSCODE = '123456';
const MASTER_RESET_CODE = 'BABURAOMARINE1904';
const SESSION_KEY = 'auth_session';
const AUTH_DOC_ID = 'credentials';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (passcode: string) => Promise<boolean>;
  logout: () => void;
  resetPasscode: (masterCode: string, newPasscode: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize: Check session and ensure default password exists in Firestore
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for active session
        if (typeof window !== 'undefined') {
          const session = sessionStorage.getItem(SESSION_KEY);
          if (session === 'active') {
            setIsAuthenticated(true);
          }
        }

        // Initialize default passcode in Firestore if not exists
        const authDocRef = doc(db, 'auth', AUTH_DOC_ID);
        const authDoc = await getDoc(authDocRef);
        
        if (!authDoc.exists()) {
          // Create default credentials
          await setDoc(authDocRef, {
            passcode: DEFAULT_PASSCODE,
            masterCode: MASTER_RESET_CODE,
            lastUpdated: new Date().toISOString(),
          });
          console.log('✓ Default credentials initialized in Firestore');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (passcode: string): Promise<boolean> => {
    try {
      const authDocRef = doc(db, 'auth', AUTH_DOC_ID);
      const authDoc = await getDoc(authDocRef);
      
      if (!authDoc.exists()) {
        console.error('Auth document not found');
        return false;
      }

      const storedPasscode = authDoc.data().passcode;
      
      if (passcode === storedPasscode) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(SESSION_KEY, 'active');
        }
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_KEY);
    }
    setIsAuthenticated(false);
  };

  const resetPasscode = async (masterCode: string, newPasscode: string): Promise<boolean> => {
    try {
      // Verify master reset code
      const authDocRef = doc(db, 'auth', AUTH_DOC_ID);
      const authDoc = await getDoc(authDocRef);
      
      if (!authDoc.exists()) {
        console.error('Auth document not found');
        return false;
      }

      const storedMasterCode = authDoc.data().masterCode;
      
      if (masterCode !== storedMasterCode) {
        return false;
      }

      // Validate new passcode (must be exactly 6 digits)
      if (!newPasscode || newPasscode.length !== 6 || !/^\d+$/.test(newPasscode)) {
        return false;
      }

      // Update passcode in Firestore (globally for all devices)
      await setDoc(authDocRef, {
        passcode: newPasscode,
        masterCode: storedMasterCode,
        lastUpdated: new Date().toISOString(),
      });

      console.log('✓ Password updated globally in Firestore');
      return true;
    } catch (error) {
      console.error('Reset passcode error:', error);
      return false;
    }
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
