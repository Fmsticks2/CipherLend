import { useState } from 'react';
import { Search, ShieldCheck, Lock, Download, CheckCircle2, FileText, Activity, ChevronRight } from 'lucide-react';
import TopNav from '../components/TopNav';
import RiskBand from '../components/RiskBand';

export default function Auditor() {
  const [loanId, setLoanId] = useState('');
  const [permit, setPermit] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = () => {
    if (!loanId || !permit) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerified(true);
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cipher-bg">
      <TopNav role="Auditor" />

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-4">Permit Verification Panel</h1>
          <p className="text-cipher-muted max-w-2xl mx-auto">
            Audit underwriting models and verify loan compliance with zero raw data exposure.
            Enter a loan ID and the corresponding borrower permit to begin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Input Panel */}
          <div className="md:col-span-5 space-y-6">
            <div className="glass-card p-6">
              <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
                <Search className="w-5 h-5 text-cipher-primary" /> Verification Details
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-cipher-muted uppercase tracking-wider">Loan ID or Borrower Address</label>
                  <input 
                    type="text" 
                    value={loanId}
                    onChange={(e) => setLoanId(e.target.value)}
                    placeholder="e.g. LOAN-0047"
                    className="w-full bg-cipher-surface border border-cipher-border rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-cipher-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-cipher-muted uppercase tracking-wider">Permit Hash</label>
                  <textarea 
                    value={permit}
                    onChange={(e) => setPermit(e.target.value)}
                    placeholder="0x..."
                    rows={3}
                    className="w-full bg-cipher-surface border border-cipher-border rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cipher-primary resize-none"
                  />
                </div>

                <button 
                  onClick={handleVerify}
                  disabled={isVerifying || !loanId || !permit}
                  className="w-full py-3 rounded bg-cipher-primary hover:bg-cipher-primary/90 text-white font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {isVerifying ? (
                    <><Activity className="w-5 h-5 animate-spin" /> Verifying Proof...</>
                  ) : (
                    <><ShieldCheck className="w-5 h-5" /> Verify Compliance</>
                  )}
                </button>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="glass-card p-6">
              <h3 className="font-display font-bold text-lg mb-4">Recent Verifications</h3>
              <div className="space-y-3">
                {[
                  { id: 'LOAN-0042', time: '2 hours ago', status: 'Valid' },
                  { id: 'LOAN-0038', time: '5 hours ago', status: 'Valid' },
                  { id: 'LOAN-0019', time: '1 day ago', status: 'Invalid Permit' },
                ].map((log, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-cipher-border/50 last:border-0">
                    <div>
                      <div className="font-mono text-sm text-white">{log.id}</div>
                      <div className="text-xs text-cipher-muted">{log.time}</div>
                    </div>
                    <span className={`text-xs font-mono uppercase tracking-wider px-2 py-1 rounded border ${
                      log.status === 'Valid' 
                        ? 'bg-cipher-secondary/10 text-cipher-secondary border-cipher-secondary/20' 
                        : 'bg-risk-d/10 text-risk-d border-risk-d/20'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="md:col-span-7">
            {verified ? (
              <div className="glass-card overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="bg-cipher-surface border-b border-cipher-border px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-cipher-secondary" />
                    <h2 className="font-display font-bold text-xl tracking-wider">AUDIT REPORT</h2>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold text-white">{loanId}</div>
                    <div className="text-xs font-mono text-cipher-muted">Verified: {new Date().toLocaleString()}</div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="space-y-3 p-4 rounded bg-cipher-secondary/5 border border-cipher-secondary/20">
                    <div className="flex items-center gap-2 text-sm font-mono text-cipher-secondary">
                      <CheckCircle2 className="w-4 h-4" /> Underwriting model executed correctly
                    </div>
                    <div className="flex items-center gap-2 text-sm font-mono text-cipher-secondary">
                      <CheckCircle2 className="w-4 h-4" /> Risk band computation verified
                    </div>
                    <div className="flex items-center gap-2 text-sm font-mono text-cipher-secondary">
                      <CheckCircle2 className="w-4 h-4" /> No manual override detected
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-8 py-4 border-y border-cipher-border/50">
                    <div className="space-y-1">
                      <div className="text-xs font-mono text-cipher-muted uppercase tracking-wider">Risk Band</div>
                      <div className="font-mono font-bold"><RiskBand band="A" /></div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-mono text-cipher-muted uppercase tracking-wider">Revenue Bucket</div>
                      <div className="font-mono font-bold text-white">$1M – $5M <span className="text-cipher-muted text-xs font-normal">(not exact)</span></div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-mono text-cipher-muted uppercase tracking-wider">DSCR Above 1.2x</div>
                      <div className="font-mono font-bold text-cipher-secondary flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-mono text-cipher-muted uppercase tracking-wider">Leverage Ratio</div>
                      <div className="font-mono font-bold text-white">Within policy</div>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <div className="text-xs font-mono text-cipher-muted uppercase tracking-wider">Covenant Status</div>
                      <div className="font-mono font-bold text-cipher-secondary">Compliant</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded bg-cipher-surface border border-cipher-border">
                      <span className="text-sm font-mono text-cipher-muted uppercase tracking-wider">Raw Financial Data</span>
                      <span className="flex items-center gap-1.5 text-sm font-mono font-bold text-cipher-primary">
                        <Lock className="w-4 h-4" /> NOT DISCLOSED
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-mono text-cipher-muted uppercase tracking-wider">Computation Proof Hash</div>
                      <div className="p-3 rounded bg-cipher-bg border border-cipher-border font-mono text-sm text-cipher-muted break-all flex justify-between items-start gap-4">
                        <span>0x7f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a</span>
                        <a href="#" className="text-cipher-primary hover:text-white whitespace-nowrap text-xs flex items-center gap-1 transition-colors">
                          View Explorer <ChevronRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button className="px-6 py-2.5 rounded border border-cipher-border hover:border-cipher-text text-white font-bold flex items-center gap-2 transition-colors text-sm">
                      <Download className="w-4 h-4" /> Download Audit PDF
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] glass-card flex flex-col items-center justify-center p-8 text-center border-dashed border-2 border-cipher-border/50">
                <div className="w-16 h-16 rounded-full bg-cipher-surface flex items-center justify-center mb-4 border border-cipher-border">
                  <FileText className="w-8 h-8 text-cipher-muted" />
                </div>
                <h3 className="font-display font-bold text-xl mb-2 text-cipher-muted">No Report Generated</h3>
                <p className="text-sm text-cipher-muted max-w-sm">
                  Enter a Loan ID and Permit Hash to verify the cryptographic proof of the underwriting computation.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Need to add ChevronRight to imports
