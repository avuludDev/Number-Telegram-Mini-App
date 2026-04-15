import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Live from './components/Live';
import { Num } from './components/Num';
import Wallet from './components/Wallet';
import Nav from './components/Nav';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { UserProvider } from './context/userProvider';
import { TonClientProvider } from './context/ton-client-context';
import { Friends } from './components/Friends';


export default function App() {
  return (
    <TonConnectUIProvider manifestUrl={`https://www.numbers-app.tech/tonconnect-manifest.json`}>
      <UserProvider>
        <TonClientProvider>
          <Router>
            <div>
              {/* Pass handleNavClick function to Nav for route-based navigation */}
              <Nav />

              {/* Define routes for each screen */}
              <Routes>
                <Route path="/" element={<Navigate to="/live" replace />} />
                <Route path="/live" element={<Live />} />
                <Route path="/num" element={<Num />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/wallet" element={<Wallet />} />
              </Routes>
            </div>
          </Router>
        </TonClientProvider>
      </UserProvider>
  
    </TonConnectUIProvider>
  );
}
