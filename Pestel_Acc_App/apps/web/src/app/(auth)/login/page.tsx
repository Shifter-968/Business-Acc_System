// ─── LoginPage ────────────────────────────────────────────────────────────────
//
// TEACHING NOTE — How login works end-to-end
//
// 1. User types email + password and clicks "Sign In"
// 2. handleLogin() is called (React form handler)
// 3. We call POST /api/v1/auth/login with the credentials
// 4. If correct, the API returns: { accessToken, refreshToken }
// 5. We store both tokens in localStorage (browser storage)
// 6. We redirect to /dashboard
//
// Why two tokens?
//   accessToken  — short-lived (e.g. 15 minutes). Used on every API call.
//   refreshToken — long-lived (e.g. 7 days). Used to get a new accessToken
//                  when the old one expires, without forcing re-login.
//
// The api.ts interceptor (which we read earlier) handles this automatically.
//
// useState for loading and error gives the user feedback while waiting.
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, Mail, Sparkles } from 'lucide-react';
import { api, getCurrentUserRole, setAuthSession } from '@/lib/api';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); // stop the browser from refreshing the page
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setAuthSession();
      const role = getCurrentUserRole();
      router.push(role === 'ADMIN' ? '/admin/users' : '/dashboard');
    } catch (err: any) {
      const message = err?.response?.data?.message;
      if (typeof message === 'string') {
        setError(message);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <section className="hidden lg:flex relative overflow-hidden bg-slate-950 text-white p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.28),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.24),transparent_35%)]" />
        <div className="relative z-10 max-w-lg my-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs tracking-wide">
            <Sparkles className="h-3.5 w-3.5" /> Finance control center
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Run your agency finances with clarity and confidence.</h1>
          <p className="text-slate-200">
            Track invoices, expenses, VAT, and reporting from one modern accounting workspace.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 lg:p-10 bg-slate-100">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/10 space-y-6"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Welcome back</p>
            <h2 className="text-3xl font-semibold text-slate-900 mt-1">Sign in</h2>
            <p className="mt-2 text-sm text-slate-500">Access your Fannie Logistics dashboard.</p>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <div className="relative">
              <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-cyan-200"
                placeholder="admin@fannielogistics.co.za"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <LockKeyhole className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-cyan-200"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-slate-500">
            Need an account?{' '}
            <Link href="/register" className="font-medium text-cyan-700 hover:text-cyan-600">
              Register here
            </Link>
          </p>

          <p className="text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Fannie Logistics System
          </p>
        </form>
      </section>
    </div>
  );
}
