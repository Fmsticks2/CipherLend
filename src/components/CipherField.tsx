import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

export default function CipherField({ 
  value, 
  encrypted, 
  onChange, 
  type = "text", 
  placeholder = "",
  prefix = ""
}: { 
  value: string; 
  encrypted: boolean; 
  onChange?: (val: string) => void;
  type?: string;
  placeholder?: string;
  prefix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (encrypted) {
      setIsAnimating(true);
      let iterations = 0;
      const interval = setInterval(() => {
        setDisplayValue(
          Array.from({ length: 16 }, () => 
            Math.floor(Math.random() * 16).toString(16)
          ).join('')
        );
        iterations++;
        if (iterations > 15) {
          clearInterval(interval);
          setDisplayValue("0x" + Array.from({ length: 12 }, () => 
            Math.floor(Math.random() * 16).toString(16)
          ).join(''));
          setIsAnimating(false);
        }
      }, 50);
      return () => clearInterval(interval);
    } else {
      setDisplayValue(value);
    }
  }, [encrypted, value]);

  if (encrypted) {
    return (
      <div className="relative flex items-center w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 h-12 overflow-hidden shadow-inner">
        <Lock className="w-4 h-4 text-zinc-500 mr-3 shrink-0" />
        <span className={`font-mono text-sm ${isAnimating ? 'animate-pulse text-zinc-400' : 'text-zinc-500'}`}>
          {isAnimating ? displayValue : `🔒 ${displayValue}`}
        </span>
        {!isAnimating && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded bg-white/5">
            Encrypted
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex items-center w-full">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 h-12 text-white font-mono text-sm focus:outline-none focus:border-white/30 transition-colors shadow-inner ${prefix ? 'pl-8' : ''}`}
      />
    </div>
  );
}
