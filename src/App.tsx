/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Borrower from './pages/Borrower';
import Lender from './pages/Lender';
import Auditor from './pages/Auditor';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/borrower" element={<Borrower />} />
        <Route path="/lender" element={<Lender />} />
        <Route path="/auditor" element={<Auditor />} />
      </Routes>
    </Router>
  );
}
