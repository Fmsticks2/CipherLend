import { motion } from 'motion/react';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';

export default function GenericPage({ title, description }: { title: string, description?: string }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 data-stream-bg opacity-40 pointer-events-none z-0"></div>
      
      <TopNav />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-40 pb-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-16 shadow-2xl"
        >
          <h1 className="font-display text-4xl md:text-5xl font-medium mb-6 tracking-tight text-white">{title}</h1>
          
          <div className="prose prose-invert prose-zinc max-w-none">
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              {description || `This is the placeholder page for ${title}. In a production environment, this would contain the detailed content, documentation, or legal text associated with this section.`}
            </p>
            
            <div className="space-y-6 text-zinc-500 font-light">
              <p>
                CipherLend utilizes Fully Homomorphic Encryption (FHE) to enable secure, private credit underwriting. 
                Our protocol ensures that sensitive financial data remains encrypted during computation, 
                protecting borrower privacy while providing verifiable risk assessments to lenders.
              </p>
              <div className="h-px w-full bg-white/10 my-8"></div>
              <p className="text-sm font-mono uppercase tracking-widest text-zinc-600">
                System Status: Operational • Network: Fhenix Testnet
              </p>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
