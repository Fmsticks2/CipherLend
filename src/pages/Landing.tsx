import { Link } from 'react-router-dom';
import { Lock, Search, Activity, ChevronRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';

export default function Landing() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#050505]">
      {/* Animated background */}
      <div className="absolute inset-0 data-stream-bg opacity-40 pointer-events-none z-0"></div>
      
      <TopNav />

      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10 pt-40 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 mb-8">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Powered by Fhenix FHE</span>
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-medium tracking-tighter mb-8 text-white leading-[1.1]">
            Institutional Credit.<br />
            <span className="text-zinc-500">Zero Exposure.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
            Submit encrypted financials. Prove creditworthiness. Never expose your book.
            The first private credit protocol built on Fully Homomorphic Encryption.
          </p>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full mb-24"
        >
          {/* Borrower Card */}
          <motion.div variants={item} className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 flex flex-col group hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <Lock className="w-5 h-5 text-zinc-300" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-2xl font-medium mb-4 text-white">Borrower</h2>
            <p className="text-zinc-400 mb-10 flex-grow font-light leading-relaxed">
              Submit encrypted financials. Get credit scored on-chain without revealing raw data.
            </p>
            <Link 
              to="/borrower" 
              className="w-full py-3 px-4 rounded-xl bg-white text-black hover:bg-zinc-200 font-medium text-center flex items-center justify-center gap-2 transition-colors"
            >
              Enter Portal <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Lender Card */}
          <motion.div variants={item} className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 flex flex-col group hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-5 h-5 text-zinc-300" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-2xl font-medium mb-4 text-white">Lender</h2>
            <p className="text-zinc-400 mb-10 flex-grow font-light leading-relaxed">
              Browse risk-banded loans. Deploy capital with cryptographic proof of borrower health.
            </p>
            <Link 
              to="/lender" 
              className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 font-medium text-center flex items-center justify-center gap-2 transition-colors"
            >
              Enter Portal <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Auditor Card */}
          <motion.div variants={item} className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 flex flex-col group hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <Search className="w-5 h-5 text-zinc-300" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-2xl font-medium mb-4 text-white">Auditor</h2>
            <p className="text-zinc-400 mb-10 flex-grow font-light leading-relaxed">
              Verify loan compliance. Audit underwriting models with zero raw data exposure.
            </p>
            <Link 
              to="/auditor" 
              className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 font-medium text-center flex items-center justify-center gap-2 transition-colors"
            >
              Enter Portal <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="w-full max-w-6xl mx-auto bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          <div className="text-center px-4 border-r border-white/10 last:border-r-0 md:last:border-r-0">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Total Originated</div>
            <div className="font-display text-4xl font-medium text-white">$4.2M</div>
          </div>
          <div className="text-center px-4 border-r-0 md:border-r border-white/10">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Active Borrowers</div>
            <div className="font-display text-4xl font-medium text-white">47</div>
          </div>
          <div className="text-center px-4 border-r border-white/10 last:border-r-0 md:last:border-r-0">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Avg Risk Band</div>
            <div className="font-display text-4xl font-medium text-zinc-300">A</div>
          </div>
          <div className="text-center px-4">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Total Value Locked</div>
            <div className="font-display text-4xl font-medium text-white">$12.8M</div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
