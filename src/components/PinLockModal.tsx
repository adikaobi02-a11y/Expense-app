import React, { useState } from 'react';
import { Lock, Unlock, Delete } from 'lucide-react';

interface PinLockModalProps {
  correctPin: string;
  onUnlocked: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({ correctPin, onUnlocked }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          onUnlocked();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
      <div className="max-w-xs w-full space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <Lock size={28} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Enter Security PIN</h2>
          <p className="text-xs text-slate-400 mt-1">Unlock your Naija Expense Tracker</p>
        </div>

        {/* 4 Pin Indicator Dots */}
        <div className={`flex justify-center gap-4 py-2 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? 'bg-emerald-400 border-emerald-400 scale-110 shadow-sm shadow-emerald-400'
                  : 'border-slate-700 bg-slate-900'
              } ${error ? 'bg-rose-500 border-rose-500' : ''}`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-400">Incorrect PIN. Try again.</p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 active:scale-95 text-lg font-bold text-white flex items-center justify-center font-display transition-all"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 active:scale-95 text-lg font-bold text-white flex items-center justify-center font-display transition-all"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 active:scale-95 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <Delete size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
