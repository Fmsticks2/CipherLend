import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Lock, Activity, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Logo } from './Footer';

export default function TopNav({ role }: { role?: string }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const navLinks = [
    { name: 'Borrower', path: '/borrower', icon: Lock, desc: 'Submit encrypted financials' },
    { name: 'Lender', path: '/lender', icon: Activity, desc: 'Deploy capital to risk-banded loans' },
    { name: 'Auditor', path: '/auditor', icon: Search, desc: 'Verify loan compliance' },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        
        {/* Center: Empty or Page Links */}
        <div className="hidden md:flex items-center justify-center gap-6 w-1/3 text-sm font-medium text-zinc-400">
          <Link to="/#about" className="hover:text-white transition-colors">About</Link>
          <Link to="/#features" className="hover:text-white transition-colors">Features</Link>
          <Link to="/#tech" className="hover:text-white transition-colors">Technology</Link>
        </div>

        {/* Right: Portal Dropdown & Wallet */}
        <div className="flex items-center justify-end gap-3 w-1/3">
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors text-sm font-medium"
            >
              Portals <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-72 rounded-xl border border-white/10 bg-[#0A0C10] shadow-2xl overflow-hidden"
                >
                  <div className="p-2 flex flex-col gap-1">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = location.pathname === link.path;
                      return (
                        <Link
                          key={link.name}
                          to={link.path}
                          onClick={() => setIsDropdownOpen(false)}
                          className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
                        >
                          <div className="mt-0.5 p-1.5 rounded-md bg-white/5 border border-white/10">
                            <Icon className="w-4 h-4 text-zinc-300" />
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-zinc-200'}`}>{link.name}</div>
                            <div className="text-xs text-zinc-500 mt-0.5">{link.desc}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <ConnectButton showBalance={false} chainStatus="none" accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }} />
        </div>
      </div>
    </motion.nav>
  );
}
