import { useState } from 'react';
import { Filter, ChevronRight, Lock, CheckCircle2, ShieldAlert, Activity } from 'lucide-react';
import TopNav from '../components/TopNav';
import RiskBand from '../components/RiskBand';

const LOANS = [
  { id: 'LOAN-0047', amount: 750000, rate: 8.4, ltv: 65, term: 18, sector: 'DeFi Infrastructure', band: 'A', block: '4421847' },
  { id: 'LOAN-0092', amount: 2500000, rate: 6.2, ltv: 50, term: 24, sector: 'Asset Management', band: 'AA', block: '4421912' },
  { id: 'LOAN-0104', amount: 150000, rate: 12.5, ltv: 80, term: 12, sector: 'Market Making', band: 'BB', block: '4422005' },
  { id: 'LOAN-0118', amount: 400000, rate: 10.1, ltv: 70, term: 12, sector: 'CeFi Exchange', band: 'BBB', block: '4422156' },
];

export default function Lender() {
  const [selectedLoan, setSelectedLoan] = useState<typeof LOANS[0] | null>(null);
  const [fundAmount, setFundAmount] = useState('');

  return (
    <div className="min-h-screen flex flex-col bg-cipher-bg">
      <TopNav role="Lender" />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4">
            <div className="text-xs font-mono text-cipher-muted uppercase tracking-wider mb-1">Total Deployed</div>
            <div className="font-display text-2xl font-bold text-white">$2.4M</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs font-mono text-cipher-muted uppercase tracking-wider mb-1">Weighted Avg Rate</div>
            <div className="font-display text-2xl font-bold text-cipher-secondary">9.2%</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs font-mono text-cipher-muted uppercase tracking-wider mb-1">Avg Risk Band</div>
            <div className="font-display text-2xl font-bold text-cipher-primary">BBB</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs font-mono text-cipher-muted uppercase tracking-wider mb-1">30-day Returns</div>
            <div className="font-display text-2xl font-bold text-white">+$18,450</div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <div className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-cipher-muted" />
              <h2 className="font-display font-bold text-lg">Filters</h2>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono text-cipher-muted uppercase tracking-wider">Risk Band</label>
              <div className="flex flex-wrap gap-2">
                {['AA', 'A', 'BBB', 'BB'].map(band => (
                  <button key={band} className="px-3 py-1 rounded border border-cipher-border bg-cipher-surface hover:border-cipher-primary text-sm font-mono transition-colors">
                    {band}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono text-cipher-muted uppercase tracking-wider flex justify-between">
                <span>Loan Size</span>
                <span className="text-cipher-primary">$50K - $5M</span>
              </label>
              <input type="range" className="w-full accent-cipher-primary" min="50000" max="5000000" />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono text-cipher-muted uppercase tracking-wider">Min Interest Rate</label>
              <div className="relative">
                <input type="number" placeholder="0" className="w-full bg-cipher-surface border border-cipher-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-cipher-primary" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cipher-muted font-mono">%</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono text-cipher-muted uppercase tracking-wider">Sector</label>
              <select className="w-full bg-cipher-surface border border-cipher-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-cipher-primary appearance-none">
                <option>All Sectors</option>
                <option>DeFi Infrastructure</option>
                <option>Asset Management</option>
                <option>Market Making</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono text-cipher-muted uppercase tracking-wider">Covenant Type</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm font-mono cursor-pointer">
                  <input type="checkbox" className="accent-cipher-primary" defaultChecked /> DSCR-linked
                </label>
                <label className="flex items-center gap-2 text-sm font-mono cursor-pointer">
                  <input type="checkbox" className="accent-cipher-primary" defaultChecked /> Fixed
                </label>
              </div>
            </div>
          </div>

          {/* Loan Cards */}
          <div className="flex-grow space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display font-bold text-xl">Active Opportunities</h2>
              <span className="text-sm font-mono text-cipher-muted">Showing {LOANS.length} loans</span>
            </div>

            {LOANS.map(loan => (
              <div key={loan.id} className="glass-card glass-card-hover p-6 flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-grow space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-mono font-bold text-lg text-white">{loan.id}</h3>
                        <RiskBand band={loan.band} />
                      </div>
                      <p className="text-sm text-cipher-muted">{loan.sector}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-2xl text-white">${loan.amount.toLocaleString()}</div>
                      <div className="text-sm font-mono text-cipher-secondary">{loan.rate}% APR</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-cipher-border/50">
                    <div>
                      <div className="text-xs font-mono text-cipher-muted uppercase tracking-wider mb-1">LTV</div>
                      <div className="font-mono font-bold">{loan.ltv}%</div>
                    </div>
                    <div>
                      <div className="text-xs font-mono text-cipher-muted uppercase tracking-wider mb-1">Term</div>
                      <div className="font-mono font-bold">{loan.term} mo</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs font-mono text-cipher-muted uppercase tracking-wider mb-1">Borrower Profile</div>
                      <div className="flex items-center gap-1.5 text-sm font-mono text-cipher-muted">
                        <Lock className="w-3.5 h-3.5 text-cipher-secondary" /> Encrypted
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-cipher-muted">
                      <CheckCircle2 className="w-4 h-4 text-cipher-primary" />
                      Score Verified On-chain (block #{loan.block})
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setSelectedLoan(loan)}
                        className="px-4 py-2 rounded border border-cipher-border hover:border-cipher-primary text-sm font-bold transition-colors"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => setSelectedLoan(loan)}
                        className="px-4 py-2 rounded bg-cipher-primary hover:bg-cipher-primary/90 text-white text-sm font-bold transition-colors"
                      >
                        Fund This Loan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-cipher-border flex justify-between items-center sticky top-0 bg-cipher-surface/90 backdrop-blur z-10">
              <div className="flex items-center gap-3">
                <h2 className="font-display font-bold text-xl">{selectedLoan.id}</h2>
                <RiskBand band={selectedLoan.band} />
              </div>
              <button 
                onClick={() => setSelectedLoan(null)}
                className="text-cipher-muted hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-8">
              <div className="grid grid-cols-2 gap-6 p-4 rounded bg-cipher-bg border border-cipher-border">
                <div>
                  <div className="text-xs font-mono text-cipher-muted uppercase tracking-wider mb-1">Requested Amount</div>
                  <div className="font-display text-3xl font-bold text-white">${selectedLoan.amount.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-cipher-muted uppercase tracking-wider mb-1">Interest Rate</div>
                  <div className="font-display text-3xl font-bold text-cipher-secondary">{selectedLoan.rate}% APR</div>
                </div>
              </div>

              <div>
                <h3 className="font-mono font-bold text-sm uppercase tracking-wider mb-3 text-cipher-muted flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Risk Analysis
                </h3>
                <div className="p-4 rounded border border-cipher-border/50 space-y-3">
                  <p className="text-sm text-cipher-text">
                    This borrower has been cryptographically verified to fall within the <strong className="text-white">{selectedLoan.band}</strong> risk band.
                  </p>
                  <ul className="text-sm text-cipher-muted list-disc list-inside space-y-1 ml-1">
                    <li>DSCR &gt; 1.5x</li>
                    <li>LTV &lt; {selectedLoan.ltv + 5}%</li>
                    <li>No defaults in past 36 months</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-mono font-bold text-sm uppercase tracking-wider mb-3 text-cipher-muted flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Cryptographic Proof
                </h3>
                <div className="p-4 rounded bg-cipher-bg border border-cipher-border space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-cipher-muted">Borrower Financials</span>
                    <span className="text-xs font-mono px-2 py-1 rounded bg-cipher-secondary/10 text-cipher-secondary border border-cipher-secondary/20">ENCRYPTED</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-cipher-muted">Computation Verified</span>
                    <span className="text-xs font-mono text-cipher-primary">Block #{selectedLoan.block}</span>
                  </div>
                  <div className="pt-3 border-t border-cipher-border/50">
                    <div className="text-xs font-mono text-cipher-muted mb-1">Proof Hash</div>
                    <div className="text-xs font-mono text-cipher-text break-all">
                      0x7f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-cipher-border">
                <label className="block text-sm font-mono text-cipher-muted uppercase tracking-wider mb-2">Funding Amount</label>
                <div className="flex gap-4">
                  <div className="relative flex-grow">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cipher-muted font-mono">$</span>
                    <input 
                      type="number" 
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-cipher-surface border border-cipher-border rounded px-3 py-3 pl-8 text-white font-mono focus:outline-none focus:border-cipher-primary"
                    />
                  </div>
                  <button className="px-8 py-3 rounded bg-cipher-primary hover:bg-cipher-primary/90 text-white font-bold transition-colors whitespace-nowrap">
                    Confirm Funding
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
