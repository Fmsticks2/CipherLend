import { useState, useEffect } from 'react';
import { Filter, ChevronRight, Lock, CheckCircle2, ShieldAlert, Activity, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TopNav from '../components/TopNav';
import RiskBand from '../components/RiskBand';
import Footer from '../components/Footer';

const LOANS = [
  { id: 'LOAN-0047', amount: 750000, rate: 8.4, ltv: 65, term: 18, sector: 'DeFi Infrastructure', band: 'A', block: '4421847' },
  { id: 'LOAN-0092', amount: 2500000, rate: 6.2, ltv: 50, term: 24, sector: 'Asset Management', band: 'AA', block: '4421912' },
  { id: 'LOAN-0104', amount: 150000, rate: 12.5, ltv: 80, term: 12, sector: 'Market Making', band: 'BB', block: '4422005' },
  { id: 'LOAN-0118', amount: 400000, rate: 10.1, ltv: 70, term: 12, sector: 'CeFi Exchange', band: 'BBB', block: '4422156' },
];

export default function Lender() {
  const [selectedLoan, setSelectedLoan] = useState<typeof LOANS[0] | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [isFunding, setIsFunding] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleFund = () => {
    if (!fundAmount || isNaN(Number(fundAmount)) || Number(fundAmount) <= 0) {
      setToast({ message: 'Please enter a valid funding amount', type: 'error' });
      return;
    }
    
    setIsFunding(true);
    setTimeout(() => {
      setIsFunding(false);
      setToast({ message: `Successfully funded $${Number(fundAmount).toLocaleString()} to ${selectedLoan?.id}`, type: 'success' });
      setFundAmount('');
      setTimeout(() => setSelectedLoan(null), 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 data-stream-bg opacity-40 pointer-events-none z-0"></div>
      
      <TopNav role="Lender" />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div className={`px-4 py-3 rounded-lg border shadow-lg flex items-center gap-2 font-mono text-sm backdrop-blur-md ${
              toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
              toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
              'bg-white/5 border-white/10 text-white'
            }`}>
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10">
        {/* Portfolio Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Total Deployed</div>
            <div className="font-display text-4xl font-medium text-white">$2.4M</div>
          </div>
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Weighted Avg Rate</div>
            <div className="font-display text-4xl font-medium text-emerald-400">9.2%</div>
          </div>
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Avg Risk Band</div>
            <div className="font-display text-4xl font-medium text-indigo-400">BBB</div>
          </div>
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">30-day Returns</div>
            <div className="font-display text-4xl font-medium text-white">+$18,450</div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full lg:w-64 shrink-0 space-y-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <Filter className="w-5 h-5 text-zinc-400" />
              </div>
              <h2 className="font-display font-medium text-xl text-white">Filters</h2>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Risk Band</label>
              <div className="flex flex-wrap gap-2">
                {['AA', 'A', 'BBB', 'BB'].map(band => (
                  <button key={band} className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 text-sm font-mono text-zinc-300 transition-all">
                    {band}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex justify-between ml-1">
                <span>Loan Size</span>
                <span className="text-indigo-400">$50K - $5M</span>
              </label>
              <input type="range" className="w-full accent-indigo-500" min="50000" max="5000000" />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Min Interest Rate</label>
              <div className="relative">
                <input type="number" placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-white/30 transition-all" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono">%</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Sector</label>
              <div className="relative">
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-white/30 transition-all appearance-none">
                  <option className="bg-zinc-900">All Sectors</option>
                  <option className="bg-zinc-900">DeFi Infrastructure</option>
                  <option className="bg-zinc-900">Asset Management</option>
                  <option className="bg-zinc-900">Market Making</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-500">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Covenant Type</label>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 text-sm font-mono cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" className="peer appearance-none w-5 h-5 border border-white/20 rounded-md bg-white/5 checked:bg-indigo-500 checked:border-indigo-500 transition-all cursor-pointer" defaultChecked />
                    <CheckCircle2 className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <span className="text-zinc-400 group-hover:text-white transition-colors">DSCR-linked</span>
                </label>
                <label className="flex items-center gap-3 text-sm font-mono cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" className="peer appearance-none w-5 h-5 border border-white/20 rounded-md bg-white/5 checked:bg-indigo-500 checked:border-indigo-500 transition-all cursor-pointer" defaultChecked />
                    <CheckCircle2 className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <span className="text-zinc-400 group-hover:text-white transition-colors">Fixed</span>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Loan Cards */}
          <div className="flex-grow space-y-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-display font-medium text-2xl text-white">Active Opportunities</h2>
              <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 uppercase tracking-widest">Showing {LOANS.length} loans</span>
            </div>

            {LOANS.map((loan, i) => (
              <motion.div 
                key={loan.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + (i * 0.1) }}
                className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 flex flex-col md:flex-row justify-between gap-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="flex-grow space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-mono font-medium text-xl text-white group-hover:text-indigo-400 transition-colors">{loan.id}</h3>
                        <RiskBand band={loan.band} />
                      </div>
                      <p className="text-sm text-zinc-400 font-light">{loan.sector}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-medium text-3xl text-white">${loan.amount.toLocaleString()}</div>
                      <div className="text-sm font-mono text-emerald-400 mt-1">{loan.rate}% APR</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-white/10">
                    <div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">LTV</div>
                      <div className="font-mono font-medium text-lg text-white">{loan.ltv}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Term</div>
                      <div className="font-mono font-medium text-lg text-white">{loan.term} mo</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Borrower Profile</div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-widest">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" /> Encrypted
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-2.5 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                      Score Verified On-chain (block #{loan.block})
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setSelectedLoan(loan)}
                        className="px-6 py-2.5 rounded-lg border border-white/20 hover:bg-white/10 text-sm font-medium text-white transition-all"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => setSelectedLoan(loan)}
                        className="px-6 py-2.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-sm font-medium transition-all shadow-lg"
                      >
                        Fund This Loan
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />

      {/* Modal */}
      <AnimatePresence>
        {selectedLoan && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
              className="bg-[#0A0C10]/90 border border-white/10 backdrop-blur-2xl rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0A0C10]/80 backdrop-blur-xl z-10">
                <div className="flex items-center gap-4">
                  <h2 className="font-display font-medium text-2xl text-white">{selectedLoan.id}</h2>
                  <RiskBand band={selectedLoan.band} />
                </div>
                <button 
                  onClick={() => setSelectedLoan(null)}
                  className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-6 p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Requested Amount</div>
                    <div className="font-display text-4xl font-medium text-white">${selectedLoan.amount.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Interest Rate</div>
                    <div className="font-display text-4xl font-medium text-emerald-400">{selectedLoan.rate}% APR</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-mono font-medium text-[10px] uppercase tracking-widest mb-4 text-zinc-400 flex items-center gap-2 ml-1">
                    <ShieldAlert className="w-4 h-4" /> Risk Analysis
                  </h3>
                  <div className="p-5 rounded-xl border border-white/10 bg-white/5 space-y-4">
                    <p className="text-sm text-zinc-400 font-light leading-relaxed">
                      This borrower has been cryptographically verified to fall within the <strong className="text-white bg-white/10 px-2 py-0.5 rounded font-mono">{selectedLoan.band}</strong> risk band.
                    </p>
                    <ul className="text-sm text-zinc-400 font-light space-y-3 ml-1">
                      <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> DSCR &gt; 1.5x</li>
                      <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> LTV &lt; {selectedLoan.ltv + 5}%</li>
                      <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> No defaults in past 36 months</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-mono font-medium text-[10px] uppercase tracking-widest mb-4 text-zinc-400 flex items-center gap-2 ml-1">
                    <Lock className="w-4 h-4" /> Cryptographic Proof
                  </h3>
                  <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400 font-light">Borrower Financials</span>
                      <span className="text-[10px] font-mono px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">ENCRYPTED</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400 font-light">Computation Verified</span>
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-md border border-indigo-500/20 uppercase tracking-widest">Block #{selectedLoan.block}</span>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Proof Hash</div>
                      <div className="text-xs font-mono text-zinc-500 break-all bg-black/40 p-4 rounded-lg border border-white/5 shadow-inner">
                        0x7f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10">
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3 ml-1">Funding Amount</label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-lg">$</span>
                      <input 
                        type="number" 
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 pl-10 text-white font-mono text-lg focus:outline-none focus:border-white/30 transition-all"
                      />
                    </div>
                    <button 
                      onClick={handleFund}
                      disabled={isFunding || !fundAmount}
                      className="px-8 py-4 rounded-xl bg-white text-black hover:bg-zinc-200 font-medium transition-all whitespace-nowrap shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isFunding ? (
                        <><Activity className="w-4 h-4 animate-spin" /> Processing...</>
                      ) : (
                        'Confirm Funding'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
