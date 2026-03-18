import { Link } from 'react-router-dom';
import { Shield, Wallet } from 'lucide-react';
import { useState } from 'react';

export default function TopNav({ role }: { role?: string }) {
  const [connected, setConnected] = useState(false);

  return (
    <nav className="border-b border-cipher-border bg-cipher-bg/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-cipher-primary" />
              <span className="font-display font-bold text-xl tracking-tight text-white">CipherLend</span>
            </Link>
            {role && (
              <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-cipher-surface border border-cipher-border text-xs font-mono text-cipher-muted uppercase tracking-wider">
                {role} Portal
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-cipher-surface border border-cipher-border text-xs font-mono">
              <div className="w-2 h-2 rounded-full bg-cipher-secondary animate-pulse"></div>
              <span className="text-cipher-muted">Fhenix Testnet</span>
            </div>
            
            <button 
              onClick={() => setConnected(!connected)}
              className="flex items-center gap-2 px-4 py-2 rounded bg-cipher-surface border border-cipher-border hover:border-cipher-primary transition-colors text-sm font-mono"
            >
              <Wallet className="w-4 h-4 text-cipher-muted" />
              {connected ? (
                <span className="text-cipher-text">0x742d...3F21 <span className="text-cipher-muted ml-1">| Fhenix ▾</span></span>
              ) : (
                <span className="text-cipher-text">Connect Wallet</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
