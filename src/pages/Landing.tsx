import { Link } from 'react-router-dom';
import { Shield, Lock, Search, Activity, ChevronRight } from 'lucide-react';
import TopNav from '../components/TopNav';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 data-stream-bg opacity-20 pointer-events-none z-0"></div>
      
      <TopNav />

      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-cipher-muted">
            Institutional Credit.<br />
            <span className="text-cipher-primary">Zero Exposure.</span>
          </h1>
          <p className="text-xl text-cipher-muted max-w-2xl mx-auto">
            Submit encrypted financials. Prove creditworthiness. Never expose your book.
            Powered by Fhenix Fully Homomorphic Encryption.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full mb-20">
          {/* Borrower Card */}
          <div className="glass-card glass-card-hover p-8 flex flex-col">
            <div className="w-12 h-12 rounded-lg bg-cipher-primary/10 flex items-center justify-center mb-6 border border-cipher-primary/20">
              <Lock className="w-6 h-6 text-cipher-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-4">Borrower</h2>
            <p className="text-cipher-muted mb-8 flex-grow">
              Submit encrypted financials. Get credit scored on-chain without revealing raw data.
            </p>
            <Link 
              to="/borrower" 
              className="w-full py-3 px-4 rounded bg-cipher-primary hover:bg-cipher-primary/90 text-white font-bold text-center flex items-center justify-center gap-2 transition-colors"
            >
              Enter Portal <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Lender Card */}
          <div className="glass-card glass-card-hover p-8 flex flex-col">
            <div className="w-12 h-12 rounded-lg bg-cipher-secondary/10 flex items-center justify-center mb-6 border border-cipher-secondary/20">
              <Activity className="w-6 h-6 text-cipher-secondary" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-4">Lender</h2>
            <p className="text-cipher-muted mb-8 flex-grow">
              Browse risk-banded loans. Deploy capital with cryptographic proof of borrower health.
            </p>
            <Link 
              to="/lender" 
              className="w-full py-3 px-4 rounded bg-cipher-surface border border-cipher-secondary text-cipher-secondary hover:bg-cipher-secondary/10 font-bold text-center flex items-center justify-center gap-2 transition-colors"
            >
              Enter Portal <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Auditor Card */}
          <div className="glass-card glass-card-hover p-8 flex flex-col">
            <div className="w-12 h-12 rounded-lg bg-cipher-muted/10 flex items-center justify-center mb-6 border border-cipher-muted/20">
              <Search className="w-6 h-6 text-cipher-text" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-4">Auditor</h2>
            <p className="text-cipher-muted mb-8 flex-grow">
              Verify loan compliance. Audit underwriting models with zero raw data exposure.
            </p>
            <Link 
              to="/auditor" 
              className="w-full py-3 px-4 rounded bg-cipher-surface border border-cipher-border hover:border-cipher-text text-cipher-text hover:bg-cipher-surface/80 font-bold text-center flex items-center justify-center gap-2 transition-colors"
            >
              Enter Portal <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="w-full max-w-6xl mx-auto glass-card p-6 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-cipher-border">
          <div className="text-center px-4">
            <div className="text-sm font-mono text-cipher-muted uppercase tracking-wider mb-2">Total Originated</div>
            <div className="font-display text-3xl font-bold text-white">$4.2M</div>
          </div>
          <div className="text-center px-4">
            <div className="text-sm font-mono text-cipher-muted uppercase tracking-wider mb-2">Active Borrowers</div>
            <div className="font-display text-3xl font-bold text-white">47</div>
          </div>
          <div className="text-center px-4">
            <div className="text-sm font-mono text-cipher-muted uppercase tracking-wider mb-2">Avg Risk Band</div>
            <div className="font-display text-3xl font-bold text-cipher-primary">A</div>
          </div>
          <div className="text-center px-4">
            <div className="text-sm font-mono text-cipher-muted uppercase tracking-wider mb-2">Total Value Locked</div>
            <div className="font-display text-3xl font-bold text-white">$12.8M</div>
          </div>
        </div>
      </main>
    </div>
  );
}
