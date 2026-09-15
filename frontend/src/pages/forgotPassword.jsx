import { useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthShell from '../components/authShell.jsx';
import authService from '../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try { await authService.sendPasswordReset(email); setSent(true); } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return <AuthShell eyebrow="Account recovery" title="Reset your password" description="We’ll send a secure reset link to the email associated with your account." footer="The reset link will expire for your security.">
    {sent ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center"><CheckCircle2 className="mx-auto mb-3 text-emerald-700" size={30} /><h3 className="font-bold text-emerald-900">Check your inbox</h3><p className="mt-2 text-sm leading-6 text-emerald-800">If an account exists for {email}, a reset link is on its way.</p><Link to="/login" className="mt-5 inline-flex items-center gap-2 font-bold text-emerald-800 hover:text-emerald-900"><ArrowLeft size={16} />Back to sign in</Link></div> : <form onSubmit={submit} className="space-y-5">{error && <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}<div><label className="mb-2 block text-sm font-semibold text-slate-700">Email address</label><div className="relative"><Mail size={18} className="absolute left-3 top-3.5 text-slate-400" /><input className="w-full pl-10 pr-4" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></div></div><button type="submit" disabled={loading} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 font-bold text-white hover:bg-blue-700 disabled:opacity-60">{loading && <Loader2 size={18} className="animate-spin" />}{loading ? 'Sending link' : 'Send reset link'}</button><Link to="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"><ArrowLeft size={16} />Back to sign in</Link></form>}
  </AuthShell>;
}
