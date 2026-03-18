/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Borrower from './pages/Borrower';
import Lender from './pages/Lender';
import Auditor from './pages/Auditor';
import GenericPage from './pages/GenericPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/borrower" element={<Borrower />} />
        <Route path="/lender" element={<Lender />} />
        <Route path="/auditor" element={<Auditor />} />
        
        {/* Footer Pages */}
        <Route path="/docs" element={<GenericPage title="Documentation" description="Technical documentation and API references for the CipherLend protocol." />} />
        <Route path="/contracts" element={<GenericPage title="Smart Contracts" description="Details, audits, and source code for the Fhenix FHE smart contracts powering CipherLend." />} />
        <Route path="/about" element={<GenericPage title="About Us" description="Learn more about the team and vision behind CipherLend." />} />
        <Route path="/blog" element={<GenericPage title="Blog" description="Latest news, updates, and insights from the CipherLend team." />} />
        <Route path="/careers" element={<GenericPage title="Careers" description="Join us in building the future of private institutional credit." />} />
        <Route path="/terms" element={<GenericPage title="Terms of Service" description="Legal terms and conditions for using the CipherLend protocol." />} />
        <Route path="/privacy" element={<GenericPage title="Privacy Policy" description="How we handle and protect your data using Fully Homomorphic Encryption." />} />
      </Routes>
    </Router>
  );
}
