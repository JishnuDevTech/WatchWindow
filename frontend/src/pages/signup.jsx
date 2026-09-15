import { useState } from 'react';
import { AlertCircle, Chrome, Eye, EyeOff, Loader2, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/authShell.jsx';
import authService from '../services/authService';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try { await authService.signUp(email, password, name); navigate('/onboarding'); } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const googleSignIn = async () => {
    setError('');
    setLoading(true);
    try { await authService.signInWithGoogle(); navigate('/dashboard'); } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <AuthShell eyebrow="Get started" title="Create your account" description="Bring your household viewing plans into one clear place." footer="Your account keeps your family schedule private and in sync.">
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
        <div><label className="mb-2 block text-sm font-semibold text-slate-700">Full name</label><div className="relative"><UserRound size={18} className="absolute left-3 top-3.5 text-slate-400" /><input className="w-full pl-10 pr-4" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" autoComplete="name" required /></div></div>
        <div><label className="mb-2 block text-sm font-semibold text-slate-700">Email address</label><div className="relative"><Mail size={18} className="absolute left-3 top-3.5 text-slate-400" /><input className="w-full pl-10 pr-4" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></div></div>
        <div><label className="mb-2 block text-sm font-semibold text-slate-700">Password</label><div className="relative"><LockKeyhole size={18} className="absolute left-3 top-3.5 text-slate-400" /><input className="w-full pl-10 pr-12" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" autoComplete="new-password" minLength="6" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2 rounded-md p-2 text-slate-400 hover:bg-slate-100" aria-label="Toggle password visibility">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
        <div><label className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</label><div className="relative"><LockKeyhole size={18} className="absolute left-3 top-3.5 text-slate-400" /><input className="w-full pl-10 pr-12" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat your password" autoComplete="new-password" required /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-2 rounded-md p-2 text-slate-400 hover:bg-slate-100" aria-label="Toggle confirmation visibility">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
        <button type="submit" disabled={loading} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 font-bold text-white hover:bg-blue-700 disabled:opacity-60">{loading && <Loader2 size={18} className="animate-spin" />}{loading ? 'Creating account' : 'Create account'}</button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
      <button type="button" disabled={loading} onClick={googleSignIn} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 font-bold text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-60"><Chrome size={18} />Continue with Google</button>
      <p className="mt-7 text-center text-sm text-slate-600">Already have an account? <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">Sign in</Link></p>
    </AuthShell>
  );
}
