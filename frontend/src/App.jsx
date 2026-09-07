import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Verify from './pages/Verify';
import News from './pages/News';
import History from './pages/History';
import VerificationDetail from './pages/VerificationDetail';
import Analytics from './pages/Analytics';
import Sources from './pages/Sources';
import Settings from './pages/Settings';

export default function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/news" element={<News />} />
            <Route path="/history" element={<History />} />
            <Route path="/history/:id" element={<VerificationDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/sources" element={<Sources />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}
