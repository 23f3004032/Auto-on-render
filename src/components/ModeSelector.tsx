import { Mode } from '@/types';

interface ModeSelectorProps {
  selectedMode: Mode;
  onModeSelect: (mode: Mode) => void;
}

export default function ModeSelector({ selectedMode, onModeSelect }: ModeSelectorProps) {
  const modes = [
    {
      id: 'normal' as Mode,
      title: 'Normal Mode',
      description: 'Upload images with descriptions in 2-column layout',
      icon: '📄',
    },
    {
      id: 'pro' as Mode,
      title: 'Pro Mode',
      description: 'Advanced customization with fonts, colors & layouts',
      icon: '⚙️',
    },
    {
      id: 'bulk' as Mode,
      title: 'Bulk Mode',
      description: 'Quick batch upload without descriptions',
      icon: '📦',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Select Mode
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeSelect(mode.id)}
            className={`
              relative p-6 rounded-lg border-2 transition-all duration-300 
              hover:scale-105 hover:shadow-xl
              ${
                selectedMode === mode.id
                  ? 'border-primary bg-gradient-to-br from-primary to-primary-dark text-white shadow-xl scale-105'
                  : 'border-gray-200 bg-white text-gray-800 hover:border-primary hover:shadow-md'
              }
            `}
          >
            {/* Selected indicator */}
            {selectedMode === mode.id && (
              <div className="absolute -top-3 -right-3 bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg">
                ✓
              </div>
            )}

            {/* Icon */}
            <div className="text-5xl mb-4 text-center">{mode.icon}</div>

            {/* Title */}
            <h3 className="text-xl font-bold mb-2 text-center">
              {mode.title}
            </h3>

            {/* Description */}
            <p
              className={`text-sm text-center ${
                selectedMode === mode.id ? 'text-gray-100' : 'text-gray-500'
              }`}
            >
              {mode.description}
            </p>
          </button>
        ))}
      </div>

      {/* Info text */}
      {!selectedMode && (
        <p className="text-center text-gray-500 mt-6 text-sm">
          Click on a mode to get started
        </p>
      )}
    </div>
  );
}
