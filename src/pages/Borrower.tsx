import { useState, useEffect } from 'react';
import { CheckCircle2, Lock, Shield, ChevronRight, Activity, FileText } from 'lucide-react';
import TopNav from '../components/TopNav';
import CipherField from '../components/CipherField';
import RiskBand from '../components/RiskBand';

const STEPS = [
  { id: 1, title: 'Financial Profile' },
  { id: 2, title: 'Submission' },
  { id: 3, title: 'Credit Score' },
  { id: 4, title: 'Active Loans' }
];

export default function Borrower() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    arr: '',
    debt: '',
    burn: '',
    ar: '',
    cash: '',
    age: '',
    sector: 'DeFi Protocol'
  });

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleEncrypt = () => {
    setIsEncrypted(true);
    setTimeout(() => {
      setToast({ message: '🔒 Fields encrypted successfully', type: 'success' });
    }, 1000);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setSubmitStatus('Encrypting...');
    
    setTimeout(() => {
      setSubmitStatus('Submitting to Fhenix...');
      setToast({ message: '⛓ Profile submitted to Fhenix', type: 'info' });
      setTimeout(() => {
        setSubmitStatus('Running Underwriting Model...');
        setTimeout(() => {
          setSubmitStatus('Score Ready');
          setIsSubmitting(false);
          setCurrentStep(3);
        }, 2000);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cipher-bg relative">
      <TopNav role="Borrower" />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`px-4 py-3 rounded border shadow-lg flex items-center gap-2 font-mono text-sm ${
            toast.type === 'success' ? 'bg-cipher-secondary/10 border-cipher-secondary/30 text-cipher-secondary' :
            toast.type === 'error' ? 'bg-risk-d/10 border-risk-d/30 text-risk-d' :
            'bg-cipher-surface border-cipher-border text-white'
          }`}>
            {toast.message}
          </div>
        </div>
      )}

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-cipher-border z-0"></div>
            {STEPS.map((step, idx) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm border-2 transition-colors ${
                  currentStep > step.id ? 'bg-cipher-secondary border-cipher-secondary text-cipher-bg' :
                  currentStep === step.id ? 'bg-cipher-primary border-cipher-primary text-white' :
                  'bg-cipher-surface border-cipher-border text-cipher-muted'
                }`}>
                  {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                </div>
                <span className={`text-xs font-mono uppercase tracking-wider ${
                  currentStep >= step.id ? 'text-white' : 'text-cipher-muted'
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-card p-8">
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="font-display text-2xl font-bold mb-2">Financial Profile Submission</h2>
                <p className="text-cipher-muted">Enter your financial data. It will be encrypted locally before submission.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-mono text-cipher-muted uppercase tracking-wider">Annual Recurring Revenue (ARR)</label>
                  <CipherField 
                    value={formData.arr} 
                    encrypted={isEncrypted} 
                    onChange={(v) => setFormData({...formData, arr: v})}
                    prefix="$"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-mono text-cipher-muted uppercase tracking-wider">Total Outstanding Debt</label>
                  <CipherField 
                    value={formData.debt} 
                    encrypted={isEncrypted} 
                    onChange={(v) => setFormData({...formData, debt: v})}
                    prefix="$"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-mono text-cipher-muted uppercase tracking-wider">Monthly Burn Rate</label>
                  <CipherField 
                    value={formData.burn} 
                    encrypted={isEncrypted} 
                    onChange={(v) => setFormData({...formData, burn: v})}
                    prefix="$"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-mono text-cipher-muted uppercase tracking-wider">Accounts Receivable (90-day)</label>
                  <CipherField 
                    value={formData.ar} 
                    encrypted={isEncrypted} 
                    onChange={(v) => setFormData({...formData, ar: v})}
                    prefix="$"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-mono text-cipher-muted uppercase tracking-wider">Cash on Hand</label>
                  <CipherField 
                    value={formData.cash} 
                    encrypted={isEncrypted} 
                    onChange={(v) => setFormData({...formData, cash: v})}
                    prefix="$"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-mono text-cipher-muted uppercase tracking-wider">Business Age (months)</label>
                  <CipherField 
                    value={formData.age} 
                    encrypted={isEncrypted} 
                    onChange={(v) => setFormData({...formData, age: v})}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-mono text-cipher-muted uppercase tracking-wider">Industry Sector</label>
                  {isEncrypted ? (
                    <CipherField value={formData.sector} encrypted={true} />
                  ) : (
                    <select 
                      value={formData.sector}
                      onChange={(e) => setFormData({...formData, sector: e.target.value})}
                      className="w-full bg-cipher-surface border border-cipher-border rounded px-3 py-2 h-10 text-cipher-text font-mono text-sm focus:outline-none focus:border-cipher-primary appearance-none"
                    >
                      <option>DeFi Protocol</option>
                      <option>CeFi Exchange</option>
                      <option>Infrastructure</option>
                      <option>Market Making</option>
                      <option>Asset Management</option>
                      <option>Other</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-cipher-border flex flex-col items-center">
                <button
                  onClick={isEncrypted ? () => setCurrentStep(2) : handleEncrypt}
                  className={`w-full md:w-auto px-8 py-3 rounded font-bold flex items-center justify-center gap-2 transition-colors ${
                    isEncrypted 
                      ? 'bg-cipher-secondary text-cipher-bg hover:bg-cipher-secondary/90' 
                      : 'bg-cipher-primary text-white hover:bg-cipher-primary/90'
                  }`}
                >
                  {isEncrypted ? (
                    <>Proceed to Submission <ChevronRight className="w-4 h-4" /></>
                  ) : (
                    <><Lock className="w-4 h-4" /> Encrypt All Fields</>
                  )}
                </button>
                {!isEncrypted && (
                  <p className="text-xs font-mono text-cipher-muted mt-4 text-center">
                    Your data is encrypted client-side using CoFHE SDK before touching the network.
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center">
                <h2 className="font-display text-2xl font-bold mb-2">Submission & On-Chain Scoring</h2>
                <p className="text-cipher-muted">Review encrypted payload and submit to Fhenix network.</p>
              </div>

              <div className="bg-cipher-bg border border-cipher-border rounded-lg p-6 font-mono text-sm text-cipher-muted break-all">
                <div className="flex items-center gap-2 mb-4 text-cipher-secondary">
                  <Lock className="w-4 h-4" />
                  <span className="uppercase tracking-wider">Encrypted Payload</span>
                </div>
                0x{Array.from({length: 256}, () => Math.floor(Math.random() * 16).toString(16)).join('')}
              </div>

              <div className="flex justify-between items-center p-4 border border-cipher-border rounded bg-cipher-surface/50">
                <span className="font-mono text-sm text-cipher-muted uppercase tracking-wider">Estimated Gas Fee</span>
                <span className="font-mono text-white">0.0042 FHE</span>
              </div>

              <div className="pt-6 flex flex-col items-center">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-8 py-3 rounded bg-cipher-primary hover:bg-cipher-primary/90 text-white font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <><Lock className="w-4 h-4 animate-pulse" /> {submitStatus}</>
                  ) : (
                    <><Activity className="w-4 h-4" /> Submit Encrypted Profile</>
                  )}
                </button>
                
                {isSubmitting && (
                  <div className="w-full max-w-md mt-6 h-1 bg-cipher-border rounded overflow-hidden">
                    <div className="h-full bg-cipher-primary animate-pulse w-full"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center">
                <h2 className="font-display text-2xl font-bold mb-2">Credit Score Results</h2>
                <p className="text-cipher-muted">Your encrypted financials have been scored on-chain.</p>
              </div>

              <div className="border border-cipher-border rounded-lg overflow-hidden">
                <div className="bg-cipher-surface border-b border-cipher-border px-6 py-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cipher-primary" />
                  <h3 className="font-display font-bold tracking-wider">YOUR CREDIT PROFILE</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-cipher-border/50">
                    <span className="font-mono text-sm text-cipher-muted uppercase tracking-wider">Risk Band</span>
                    <RiskBand band="A" />
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-cipher-border/50">
                    <span className="font-mono text-sm text-cipher-muted uppercase tracking-wider">Max Loan Size</span>
                    <span className="font-mono text-white font-bold">$850,000</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-cipher-border/50">
                    <span className="font-mono text-sm text-cipher-muted uppercase tracking-wider">Interest Rate</span>
                    <span className="font-mono text-white font-bold">8.4% APR</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-cipher-border/50">
                    <span className="font-mono text-sm text-cipher-muted uppercase tracking-wider">LTV Ratio</span>
                    <span className="font-mono text-white font-bold">65%</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-mono text-sm text-cipher-muted uppercase tracking-wider">Covenant Trigger</span>
                    <span className="font-mono text-white font-bold">DSCR &lt; 1.2x</span>
                  </div>
                </div>
                <div className="bg-cipher-primary/10 border-t border-cipher-primary/20 px-6 py-3 flex items-start gap-3">
                  <Lock className="w-4 h-4 text-cipher-primary mt-0.5 shrink-0" />
                  <p className="text-xs font-mono text-cipher-primary/80">
                    Raw financials never left your device in unencrypted form. Computation was verified via FHE.
                  </p>
                </div>
              </div>

              <div className="pt-6 flex justify-center">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-8 py-3 rounded bg-cipher-secondary hover:bg-cipher-secondary/90 text-cipher-bg font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4" /> Share with Lenders
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold mb-2">Active Loans Dashboard</h2>
                  <p className="text-cipher-muted">Manage your current credit facilities.</p>
                </div>
                <button className="px-4 py-2 rounded border border-cipher-primary text-cipher-primary hover:bg-cipher-primary/10 font-bold text-sm transition-colors">
                  + New Application
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-cipher-border">
                      <th className="py-3 px-4 font-mono text-xs text-cipher-muted uppercase tracking-wider">Loan ID</th>
                      <th className="py-3 px-4 font-mono text-xs text-cipher-muted uppercase tracking-wider">Amount</th>
                      <th className="py-3 px-4 font-mono text-xs text-cipher-muted uppercase tracking-wider">Rate</th>
                      <th className="py-3 px-4 font-mono text-xs text-cipher-muted uppercase tracking-wider">Risk Band</th>
                      <th className="py-3 px-4 font-mono text-xs text-cipher-muted uppercase tracking-wider">Next Payment</th>
                      <th className="py-3 px-4 font-mono text-xs text-cipher-muted uppercase tracking-wider">Status</th>
                      <th className="py-3 px-4 font-mono text-xs text-cipher-muted uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cipher-border">
                    <tr className="hover:bg-cipher-surface/50 transition-colors">
                      <td className="py-4 px-4 font-mono text-sm">L-0047</td>
                      <td className="py-4 px-4 font-mono text-sm font-bold">$750,000</td>
                      <td className="py-4 px-4 font-mono text-sm">8.4%</td>
                      <td className="py-4 px-4"><RiskBand band="A" /></td>
                      <td className="py-4 px-4 font-mono text-sm text-cipher-muted">Apr 15, 2026</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono font-bold bg-cipher-secondary/10 text-cipher-secondary border border-cipher-secondary/20">
                          Active
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-sm font-bold text-cipher-primary hover:text-white transition-colors">Manage</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-cipher-surface/50 transition-colors">
                      <td className="py-4 px-4 font-mono text-sm">L-0082</td>
                      <td className="py-4 px-4 font-mono text-sm font-bold">$250,000</td>
                      <td className="py-4 px-4 font-mono text-sm">11.2%</td>
                      <td className="py-4 px-4"><RiskBand band="BBB" /></td>
                      <td className="py-4 px-4 font-mono text-sm text-cipher-muted">—</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                          Pending
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-sm font-bold text-cipher-primary hover:text-white transition-colors">View</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
