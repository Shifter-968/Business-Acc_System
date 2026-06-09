'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { getCurrentUserRole, usersApi } from '@/lib/api';

const ROLE_OPTIONS = [
  { value: 'ACCOUNTANT', label: 'Finance — can create invoices and record expenses' },
  { value: 'VIEWER',     label: 'View only — can see everything but not change anything' },
  { value: 'ADMIN',      label: 'Admin — full access including approving other users' },
];

interface PendingUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<PendingUser[]>([]);
  // per-user role override selection — default is the user's requested role
  const [roleOverrides, setRoleOverrides] = useState<Record<string, string>>({});

  async function loadPending() {
    setLoading(true);
    setError('');
    try {
      const res = await usersApi.listPending();
      const users: PendingUser[] = res.data ?? [];
      setPending(users);
      // seed override map with each user's requested role
      const defaults: Record<string, string> = {};
      users.forEach((u) => { defaults[u.id] = u.role; });
      setRoleOverrides(defaults);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) {
        setError('Only admins can access user approvals.');
      } else {
        setError('Could not load pending registrations.');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const role = getCurrentUserRole();
    if (!role) {
      router.replace('/login');
      return;
    }
    if (role !== 'ADMIN') {
      router.replace('/dashboard');
      return;
    }
    loadPending();
  }, []);

  async function approveUser(id: string) {
    setApprovingId(id);
    try {
      const chosenRole = roleOverrides[id];
      await usersApi.approve(id, chosenRole);
      setPending((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError('Could not approve user.');
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-amber-600 to-orange-700 p-6 text-white shadow-lg shadow-amber-900/20">
        <p className="text-amber-100 text-sm">Admin Control</p>
        <h2 className="text-2xl font-semibold mt-1">People waiting to join</h2>
        <p className="text-amber-100 mt-2">These people have asked to use the system. Review and approve them before they can log in.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Pending requests</h3>
          <button
            onClick={loadPending}
            className="h-9 px-4 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500 mt-4">Loading pending users...</p>
        ) : pending.length === 0 ? (
          <p className="text-sm text-slate-500 mt-4">Nobody is waiting for approval right now.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">Requested</th>
                  <th className="py-2 pr-4 font-medium">Approve as</th>
                  <th className="py-2 pr-4 font-medium">Registered</th>
                  <th className="py-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 text-slate-800 font-medium">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{user.email}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-block rounded-full bg-slate-100 text-slate-600 text-xs px-2 py-0.5">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={roleOverrides[user.id] ?? user.role}
                        onChange={(e) =>
                          setRoleOverrides((prev) => ({ ...prev, [user.id]: e.target.value }))
                        }
                        className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-amber-500 focus:outline-none"
                      >
                        {ROLE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 pr-4 text-slate-500 text-xs">{new Date(user.createdAt).toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => approveUser(user.id)}
                        disabled={approvingId === user.id}
                        className="h-9 px-3 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 disabled:opacity-60"
                      >
                        {approvingId === user.id ? 'Approving...' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4" />
        Once you approve someone, they can log in straight away.
      </div>
    </div>
  );
}
