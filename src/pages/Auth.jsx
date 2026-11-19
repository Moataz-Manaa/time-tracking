import React, { useState } from 'react';
import { api } from '../services/api';
export default function Auth({ onAuthenticated }) {
  const [register, setRegister] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); setPending(true); setError('');
    try { const values = Object.fromEntries(new FormData(event.currentTarget)); onAuthenticated((await api('auth/' + (register ? 'register' : 'login'), values)).user); }
    catch (e) { setError(e.message); } finally { setPending(false); }
  }
  return <main className="min-h-screen flex items-center justify-center p-6"><section className="card p-8 w-full max-w-md"><p className="text-3xl font-bold text-emerald-900 mb-8">◷ tempo.</p><h1>{register ? 'Create your account' : 'Welcome back'}</h1><p className="text-slate-500 mt-2 mb-6">A little focus goes a long way.</p><form onSubmit={submit} className="grid gap-4">{register && <label className="grid gap-2 text-sm">Name<input name="name" autoComplete="name" required maxLength={100}/></label>}<label className="grid gap-2 text-sm">Email<input name="email" type="email" autoComplete="email" required maxLength={254}/></label><label className="grid gap-2 text-sm">Password<input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={8} maxLength={72}/></label>{register && <p className="text-xs text-slate-500">At least 8 characters; maximum 72 bytes.</p>}{error && <p role="alert" className="text-red-700 text-sm">{error}</p>}<button className="primary" disabled={pending}>{pending ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button></form><button className="text-sm text-emerald-800 mt-6" disabled={pending} onClick={() => { setRegister(!register); setError(''); }}>{register ? 'Already have an account? Sign in' : 'New here? Create an account'}</button></section></main>;
}
