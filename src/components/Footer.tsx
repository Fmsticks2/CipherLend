import { Link } from 'react-router-dom';

export const Logo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050505] pt-20 pb-10 mt-24 relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="col-span-1 md:col-span-4">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
                <Logo className="w-4 h-4 text-zinc-300" />
              </div>
              <span className="font-display font-medium text-xl tracking-tight text-white">CipherLend</span>
            </Link>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
              Private credit underwriting protocol built on Fhenix FHE. 
              Institutional lending with zero raw data exposure.
            </p>
          </div>
          
          <div className="col-span-1 md:col-span-2 md:col-start-7">
            <h4 className="text-white font-medium mb-6 text-sm tracking-wide">Protocol</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><Link to="/borrower" className="hover:text-white transition-colors">Borrower Portal</Link></li>
              <li><Link to="/lender" className="hover:text-white transition-colors">Lender Portal</Link></li>
              <li><Link to="/auditor" className="hover:text-white transition-colors">Auditor Portal</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-white font-medium mb-6 text-sm tracking-wide">Developers</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><Link to="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link to="/contracts" className="hover:text-white transition-colors">Smart Contracts</Link></li>
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="text-white font-medium mb-6 text-sm tracking-wide">Company</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-sm text-zinc-600">
          <p>© 2026 CipherLend. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">Twitter</a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">Discord</a>
            <Link to="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
