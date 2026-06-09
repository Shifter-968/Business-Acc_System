'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState<'FINANCE' | 'READ_ONLY'>('FINANCE');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        accessLevel,
        password,
      });
      setSuccess(data?.message ?? 'Request sent! Someone will review and activate your account soon.');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err: any) {
      const message = err?.response?.data?.message;
      if (typeof message === 'string') {
        setError(message);
      } else {
        setError('Could not submit registration. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/10 space-y-5"
      >
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-800">
            <UserPlus className="h-3.5 w-3.5" /> New account request
          </div>
          <h2 className="text-3xl font-semibold text-slate-900 mt-3">Register</h2>
          <p className="mt-2 text-sm text-slate-500">
            Once you submit, someone will review your request and turn on your account. You will not be able to log in until then.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">First Name</span>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="e.g. Thabo"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Last Name</span>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="e.g. Ndlovu"
            />
          </label>
        </div>

        <label className="space-y-1 block">
          <span className="text-sm font-medium text-slate-700">Work Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-amber-200"
            placeholder="you@company.com"
          />
        </label>

        <label className="space-y-1 block">
          <span className="text-sm font-medium text-slate-700">Access Level Request</span>
          <select
            value={accessLevel}
            onChange={(e) => setAccessLevel(e.target.value as 'FINANCE' | 'READ_ONLY')}
            className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="FINANCE">I work in finance — I need to create invoices and capture expenses</option>
            <option value="READ_ONLY">I just need to view reports and data, no editing</option>
          </select>
          <p className="text-xs text-slate-500">The person who manages the system may give you a different level of access when they approve you.</p>
        </label>

        <label className="space-y-1 block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-amber-200"
            placeholder="Minimum 8 characters"
          />
        </label>

        <label className="space-y-1 block">
          <span className="text-sm font-medium text-slate-700">Confirm Password</span>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-amber-200"
            placeholder="Re-enter your password"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-500 disabled:opacity-60"
        >
          {loading ? 'Submitting...' : 'Submit Registration'}
        </button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-slate-900 hover:text-slate-700">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
