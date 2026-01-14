'use client'

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, KeyRound, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function LoginScreen() {
  const { login, resetPasscode } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [masterCode, setMasterCode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [showMasterCode, setShowMasterCode] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passcode) {
      setError('Please enter your passcode');
      return;
    }

    if (passcode.length !== 6) {
      setError('Passcode must be 6 digits');
      return;
    }

    const success = login(passcode);
    if (!success) {
      setError('Invalid passcode. Please try again.');
      setPasscode('');
    }
  };

  const handleResetPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!masterCode || !newPasscode || !confirmPasscode) {
      setError('Please fill in all fields');
      return;
    }

    if (newPasscode.length !== 6) {
      setError('New passcode must be exactly 6 digits');
      return;
    }

    if (!/^\d+$/.test(newPasscode)) {
      setError('Passcode must contain only numbers');
      return;
    }

    if (newPasscode !== confirmPasscode) {
      setError('New passcodes do not match');
      return;
    }

    const resetSuccess = resetPasscode(masterCode, newPasscode);
    if (resetSuccess) {
      setSuccess('Passcode reset successfully! You can now login with your new passcode.');
      setMasterCode('');
      setNewPasscode('');
      setConfirmPasscode('');
      setTimeout(() => {
        setShowForgotPassword(false);
        setSuccess('');
      }, 2000);
    } else {
      setError('Invalid master code. Please contact administrator.');
      setMasterCode('');
    }
  };

  const handlePasscodeChange = (value: string) => {
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 6) {
      setPasscode(digitsOnly);
      setError('');
    }
  };

  const handleNewPasscodeChange = (value: string) => {
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 6) {
      setNewPasscode(digitsOnly);
      setError('');
    }
  };

  const handleConfirmPasscodeChange = (value: string) => {
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 6) {
      setConfirmPasscode(digitsOnly);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Marine Cargo Agencies
          </h1>
          <p className="text-gray-600">
            Image Render Tool - Secure Access
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {!showForgotPassword ? (
            /* Normal Login Form */
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="passcode" className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter Your Passcode
                </label>
                <div className="relative">
                  <input
                    id="passcode"
                    type={showPasscode ? "text" : "password"}
                    value={passcode}
                    onChange={(e) => handlePasscodeChange(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-center text-2xl tracking-widest font-mono"
                    placeholder="••••••"
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  6-digit numeric passcode
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-primary transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(true);
                  setError('');
                  setPasscode('');
                }}
                className="w-full text-primary hover:text-blue-700 font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                Forgot Passcode?
              </button>
            </form>
          ) : (
            /* Forgot Password Form */
            <form onSubmit={handleResetPasscode} className="space-y-5">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Passcode</h3>
                <p className="text-sm text-gray-600">
                  Enter the master code to reset your passcode
                </p>
              </div>

              <div>
                <label htmlFor="masterCode" className="block text-sm font-semibold text-gray-700 mb-2">
                  Master Reset Code
                </label>
                <div className="relative">
                  <input
                    id="masterCode"
                    type={showMasterCode ? "text" : "password"}
                    value={masterCode}
                    onChange={(e) => {
                      setMasterCode(e.target.value.toUpperCase());
                      setError('');
                    }}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono"
                    placeholder="Enter master code"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMasterCode(!showMasterCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showMasterCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPasscode" className="block text-sm font-semibold text-gray-700 mb-2">
                  New Passcode
                </label>
                <input
                  id="newPasscode"
                  type="password"
                  value={newPasscode}
                  onChange={(e) => handleNewPasscodeChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-center text-xl tracking-widest font-mono"
                  placeholder="••••••"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-1">Must be 6 digits</p>
              </div>

              <div>
                <label htmlFor="confirmPasscode" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Passcode
                </label>
                <input
                  id="confirmPasscode"
                  type="password"
                  value={confirmPasscode}
                  onChange={(e) => handleConfirmPasscodeChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-center text-xl tracking-widest font-mono"
                  placeholder="••••••"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setError('');
                    setSuccess('');
                    setMasterCode('');
                    setNewPasscode('');
                    setConfirmPasscode('');
                  }}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-primary transition-all shadow-lg"
                >
                  Reset Passcode
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>© 2026 Marine Cargo Agencies Private Limited</p>
          <p className="mt-1">Authorized Access Only</p>
        </div>
      </div>
    </div>
  );
}
