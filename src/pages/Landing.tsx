import { Link } from 'react-router-dom';
import { Lock, Search, Activity, ChevronRight, ShieldCheck, Database, FileCode2, Layers } from 'lucide-react';
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
        {/* Hero Section */}
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
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            Submit encrypted financials. Prove creditworthiness. Never expose your book.
            The first private credit protocol built on Fully Homomorphic Encryption.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/borrower" 
              className="px-8 py-4 rounded-xl bg-white text-black hover:bg-zinc-200 font-medium flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
            >
              Get Started <ChevronRight className="w-4 h-4" />
            </Link>
            <a 
              href="#about" 
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 font-medium flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
            >
              Learn More
            </a>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full max-w-6xl mx-auto bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 mb-32"
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

        {/* About Section */}
        <section id="about" className="w-full max-w-6xl mx-auto mb-32 scroll-mt-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-medium mb-6 text-white">
                Privacy-Preserving <br />
                <span className="text-zinc-500">Underwriting</span>
              </h2>
              <p className="text-zinc-400 font-light leading-relaxed mb-6 text-lg">
                Traditional institutional credit requires exposing sensitive financial data, trade secrets, and proprietary strategies to third-party underwriters. CipherLend changes this paradigm.
              </p>
              <p className="text-zinc-400 font-light leading-relaxed text-lg">
                By leveraging Fully Homomorphic Encryption (FHE) via the Fhenix network, borrowers can encrypt their financial statements client-side. The underwriting model runs directly on the encrypted ciphertext, producing a verifiable credit score without ever decrypting the underlying data.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-2xl border border-white/10"></div>
              <div className="relative p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-2">1. Client-Side Encryption</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">Financials are encrypted locally using the CoFHE SDK before transmission.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-2">2. FHE Computation</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">Smart contracts execute risk models on encrypted data, generating a risk band.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Search className="w-5 h-5 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-2">3. Verifiable Output</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">Lenders and auditors verify the score and compliance without seeing raw inputs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full max-w-6xl mx-auto mb-32 scroll-mt-32">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-medium mb-4 text-white">Protocol Features</h2>
            <p className="text-zinc-400 font-light">Engineered for institutional capital markets.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <ShieldCheck className="w-6 h-6 text-zinc-300 mb-6" />
              <h3 className="text-xl font-medium text-white mb-3">Zero-Knowledge Compliance</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-light">
                Prove regulatory compliance and covenant adherence continuously without exposing sensitive operational metrics.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <Database className="w-6 h-6 text-zinc-300 mb-6" />
              <h3 className="text-xl font-medium text-white mb-3">On-Chain Risk Banding</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-light">
                Standardized credit scoring (AAA to C) computed deterministically on-chain, providing objective risk assessment.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <Layers className="w-6 h-6 text-zinc-300 mb-6" />
              <h3 className="text-xl font-medium text-white mb-3">Tranche Architecture</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-light">
                Capital pools structured into senior and junior tranches, allowing lenders to select their preferred risk-return profile.
              </p>
            </div>
          </div>
        </section>

        {/* Tech Section */}
        <section id="tech" className="w-full max-w-6xl mx-auto scroll-mt-32">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="font-display text-3xl md:text-4xl font-medium mb-6 text-white">Built on Fhenix</h2>
              <p className="text-zinc-400 font-light leading-relaxed mb-8">
                CipherLend utilizes the Fhenix network, an Ethereum Layer 2 powered by Fully Homomorphic Encryption. This allows our smart contracts to compute over encrypted data, bringing absolute data confidentiality to public blockchains.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://fhenix.io" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 font-medium text-sm transition-colors border border-white/10">
                  Explore Fhenix
                </a>
                <Link to="/docs" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                  <FileCode2 className="w-4 h-4" /> Read the Docs
                </Link>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="bg-[#0A0C10] rounded-xl border border-white/10 p-6 font-mono text-xs text-zinc-500 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <pre className="overflow-x-auto">
{`// FHE Underwriting Contract
import "@fhenixprotocol/contracts/FHE.sol";

contract CipherLendScoring {
    function computeScore(
        euint32 encryptedARR,
        euint32 encryptedDebt
    ) public pure returns (euint8) {
        // Compute Debt-to-ARR ratio securely
        euint32 ratio = FHE.div(encryptedDebt, encryptedARR);
        
        // Return risk band (A, B, C)
        return FHE.select(
            FHE.lte(ratio, FHE.asEuint32(2)), 
            FHE.asEuint8(1), // Band A
            FHE.asEuint8(2)  // Band B
        );
    }
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
