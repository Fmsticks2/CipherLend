import { Link, useLocation } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Logo } from './Footer';

export default function TopNav({ role }: { role?: string }) {
  const [connected, setConnected] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Borrower', path: '/borrower' },
    { name: 'Lender', path: '/lender' },
    { name: 'Auditor', path: '/auditor' },
  ];

  return (
    <motion.nav 
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl rounded-2xl border border-white/10 bg-[#0A0C10]/80 backdrop-blur-xl shadow-2xl"
    >
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Logo */}
        <div className="flex items-center gap-3 w-1/3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
              <Logo className="w-4 h-4 text-zinc-300" />
            </div>
            <span className="font-display font-medium text-lg tracking-tight text-white hidden sm:block">CipherLend</span>
          </Link>
          {role && (
            <div className="hidden lg:flex items-center px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
              {role}
            </div>
          )}
        </div>
        
        {/* Center: Nav Links */}
        <div className="hidden md:flex items-center justify-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.name} 
                to={link.path}
                className={`relative px-4 py-1.5 text-sm font-medium transition-colors rounded-lg z-10 ${isActive ? 'text-black' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right: Wallet */}
        <div className="flex items-center justify-end gap-3 w-1/3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-zinc-400">Fhenix Testnet</span>
          </div>
          
          <button 
            onClick={() => setConnected(!connected)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 transition-colors text-sm font-medium text-white"
          >
            <Wallet className="w-4 h-4 text-zinc-300" strokeWidth={1.5} />
            {connected ? (
              <span className="font-mono text-xs">0x74...3F21</span>
            ) : (
              <span>Connect</span>
            )}
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
