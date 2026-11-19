import React, { useEffect, useState } from 'react';
import { api } from './services/api';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function restore() {
    setLoading(true); setError('');
    try { setUser((await api('auth/me')).user); }
    catch (e) { if (e.status !== 401) setError('Could not connect. Check that the server and MongoDB are running.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { restore(); const expired = () => setUser(null); window.addEventListener('session-expired', expired); return () => window.removeEventListener('session-expired', expired); }, []);
  async function logout() { await api('auth/logout', {}); setUser(null); }
  if (loading) return <p className="p-12 text-center">Loading your workspace…</p>;
  if (error) return <div className="p-12 text-center"><p role="alert">{error}</p><button className="primary mt-4" onClick={restore}>Try again</button></div>;
  return user ? <Dashboard user={user} onUserChanged={setUser} onLogout={logout} /> : <Auth onAuthenticated={setUser} />;
}
