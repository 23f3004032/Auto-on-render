'use client'

import { useState } from 'react';
import Header from '@/components/Header';
import ModeSelector from '@/components/ModeSelector';
import NormalMode from '@/components/NormalMode';
import ProMode from '@/components/ProMode';
import BulkMode from '@/components/BulkMode';
import { Mode } from '@/types';

export default function Home() {
  const [selectedMode, setSelectedMode] = useState<Mode>(null);

  const handleModeSelect = (mode: Mode) => {
    setSelectedMode(mode);
  };

  const handleReset = () => {
    setSelectedMode(null);
  };

  return (
    <main className="min-h-screen bg-secondary-light">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Mode Selector */}
        <ModeSelector selectedMode={selectedMode} onModeSelect={handleModeSelect} />

        {/* Selected Mode Content */}
        {selectedMode && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            {/* Reset Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedMode === 'normal' && 'Normal Mode'}
                {selectedMode === 'pro' && 'Pro Mode'}
                {selectedMode === 'bulk' && 'Bulk Mode'}
              </h2>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                ← Change Mode
              </button>
            </div>

            {/* Mode Content */}
            {selectedMode === 'normal' && <NormalMode />}
            {selectedMode === 'pro' && <ProMode />}
            {selectedMode === 'bulk' && <BulkMode />}
          </div>
        )}

        {/* Footer Info */}
        {!selectedMode && (
          <div className="text-center mt-8 text-gray-500 text-sm">
            <p>© 2026 Marine Cargo Agencies Private Limited</p>
            <p className="mt-1">Professional Image Documentation Tool</p>
          </div>
        )}
      </div>
    </main>
  )
}
