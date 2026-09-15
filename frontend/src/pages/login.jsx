import { useState } from 'react';
import { AlertCircle, Chrome, Eye, EyeOff, Loader2, LockKeyhole, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/authShell.jsx';
import authService from '../services/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const finishSignIn = async (action) => {
    setError('');
    setLoading(true);
    try { await action(); navigate('/dashboard'); } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <AuthShell eyebrow="Welcome back" title="Sign in to WatchWindow" description="See the shared schedule and take your next viewing window." footer="Your account keeps your family schedule private and in sync.">
      <form onSubmit={(event) => { event.preventDefault(); finishSignIn(() => authService.signIn(email, password)); }} className="space-y-5">
        {error && <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
        <div><label className="mb-2 block text-sm font-semibold text-slate-700">Email address</label><div className="relative"><Mail size={18} className="absolute left-3 top-3.5 text-slate-400" /><input className="w-full pl-10 pr-4" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></div></div>
        <div><div className="mb-2 flex items-center justify-between"><label className="block text-sm font-semibold text-slate-700">Password</label><Link to="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Forgot password?</Link></div><div className="relative"><LockKeyhole size={18} className="absolute left-3 top-3.5 text-slate-400" /><input className="w-full pl-10 pr-12" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2 rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
        <button type="submit" disabled={loading} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 font-bold text-white hover:bg-blue-700 disabled:opacity-60">{loading && <Loader2 size={18} className="animate-spin" />}{loading ? 'Signing in' : 'Sign in'}</button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
      <button type="button" disabled={loading} onClick={() => finishSignIn(() => authService.signInWithGoogle())} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 font-bold text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-60"><Chrome size={18} />Continue with Google</button>
      <p className="mt-7 text-center text-sm text-slate-600">New to WatchWindow? <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-700">Create an account</Link></p>
    </AuthShell>
  );
}
