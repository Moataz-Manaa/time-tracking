import React, { useState } from 'react';
import { api } from '../services/api';

export default function Account({ user, onUserChanged }) {
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function save(event, type) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setError(''); setMessage('');
    if (type === 'password' && values.newPassword !== values.confirmPassword) { setError('New passwords do not match.'); return; }
    setPending(type);
    try {
      const result = await api('auth/' + type, values, 'PATCH');
      if (type === 'profile') { onUserChanged(result.user); setMessage('Profile updated.'); }
      else { form.reset(); setMessage('Password changed.'); }
    } catch (e) { setError(e.message); } finally { setPending(''); }
  }
  return <section aria-label="Account settings">
    {error && <p role="alert" className="bg-red-50 text-red-700 p-4 rounded-xl mb-5">{error}</p>}
    <p role="status" className="text-emerald-800 mb-5">{message}</p>
    <div className="grid lg:grid-cols-2 gap-6 items-stretch">
      <section className="card p-6"><h2>Your profile</h2><p className="text-sm text-slate-500 my-3">Update the name shown in your workspace.</p><form onSubmit={e => save(e, 'profile')} className="grid gap-4">
        <label className="grid gap-2 text-sm">Name<input name="name" autoComplete="name" defaultValue={user.name} required maxLength={100} disabled={!!pending}/></label>
        <label className="grid gap-2 text-sm">Email<input type="email" value={user.email} readOnly/></label><p className="text-xs text-slate-500">Your sign-in email is read-only.</p>
        <button className="primary" disabled={!!pending}>{pending === 'profile' ? 'Saving…' : 'Save profile'}</button>
      </form></section>
      <section className="card p-6"><h2>Change password</h2><p className="text-sm text-slate-500 my-3">Use at least 8 characters.</p><form onSubmit={e => save(e, 'password')} className="grid gap-4">
        <input type="text" autoComplete="username" value={user.email} readOnly hidden/>
        <label className="grid gap-2 text-sm">Current password<input name="currentPassword" type="password" autoComplete="current-password" required maxLength={72} disabled={!!pending}/></label>
        <label className="grid gap-2 text-sm">New password<input name="newPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={72} disabled={!!pending}/></label>
        <label className="grid gap-2 text-sm">Confirm new password<input name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={72} disabled={!!pending}/></label>
        <button className="primary" disabled={!!pending}>{pending === 'password' ? 'Updating…' : 'Change password'}</button>
      </form></section>
    </div>
  </section>;
}
