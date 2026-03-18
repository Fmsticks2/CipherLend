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
      <div className="relative flex items-center w-full bg-cipher-surface border border-cipher-border rounded px-3 py-2 h-10 overflow-hidden">
        <Lock className="w-4 h-4 text-cipher-secondary mr-2 shrink-0" />
        <span className={`font-mono text-sm ${isAnimating ? 'cipher-shimmer' : 'text-cipher-secondary'}`}>
          {isAnimating ? displayValue : `🔒 ${displayValue}`}
        </span>
        {!isAnimating && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-cipher-secondary/50 uppercase tracking-widest border border-cipher-secondary/20 px-1.5 rounded bg-cipher-secondary/5">
            Encrypted
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex items-center w-full">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cipher-muted font-mono">
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-cipher-surface border border-cipher-border rounded px-3 py-2 h-10 text-cipher-text font-mono text-sm focus:outline-none focus:border-cipher-primary transition-colors ${prefix ? 'pl-8' : ''}`}
      />
    </div>
  );
}
