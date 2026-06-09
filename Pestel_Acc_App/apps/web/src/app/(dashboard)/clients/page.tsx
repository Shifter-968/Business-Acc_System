'use client';

import { useEffect, useState, Suspense } from 'react';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { clientsApi } from '@/lib/api';

interface Client {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  city?: string;
  isActive: boolean;
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <ClientsPageContent />
    </Suspense>
  );
}

function ClientsPageContent() {
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    city: '',
  });

  useEffect(() => {
    setLoading(true);
    clientsApi
      .list(search || undefined)
      .then((res) => setClients(res.data))
      .catch(() => setError('Could not load clients. Is the API running?'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    if (searchParams.get('open') === 'create') {
      setShowCreate(true);
    }
  }, [searchParams]);

  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault();
    if (!newClient.name.trim()) {
      setError('Client name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await clientsApi.create({
        name: newClient.name.trim(),
        contactPerson: newClient.contactPerson.trim() || undefined,
        email: newClient.email.trim() || undefined,
        phone: newClient.phone.trim() || undefined,
        city: newClient.city.trim() || undefined,
      });
      setNewClient({ name: '', contactPerson: '', email: '', phone: '', city: '' });
      setShowCreate(false);
      const res = await clientsApi.list(search || undefined);
      setClients(res.data);
    } catch {
      setError('Could not create client. Please check values and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Customers</h2>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? 'Loading…' : `${clients.length} customer${clients.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="h-10 px-4 rounded-xl bg-cyan-600 text-white text-sm font-medium flex items-center gap-2 hover:bg-cyan-500 transition-colors w-fit"
        >
          <Plus className="h-4 w-4" /> New Customer
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="relative w-full md:max-w-sm">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email or contact"
            className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-cyan-200"
          />
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> {error}
          </div>
        )}

        {loading && !error && (
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />)}
          </div>
        )}

        {!loading && !error && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-2 font-medium">Name</th>
                  <th className="py-3 px-2 font-medium">Contact Person</th>
                  <th className="py-3 px-2 font-medium">Email</th>
                  <th className="py-3 px-2 font-medium">Phone</th>
                  <th className="py-3 px-2 font-medium">City</th>
                  <th className="py-3 px-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 text-sm">
                      No customers found. Add your first customer account.
                    </td>
                  </tr>
                )}
                {clients.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2 font-medium text-slate-900">{c.name}</td>
                    <td className="py-3 px-2 text-slate-600">{c.contactPerson ?? '—'}</td>
                    <td className="py-3 px-2 text-slate-600">{c.email ?? '—'}</td>
                    <td className="py-3 px-2 text-slate-600">{c.phone ?? '—'}</td>
                    <td className="py-3 px-2 text-slate-600">{c.city ?? '—'}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateClient} className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Add New Customer</h3>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="space-y-1 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Customer Name</span>
                <input
                  value={newClient.name}
                  onChange={(e) => setNewClient((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. North Route Cement (required)"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-700">Contact Person</span>
                <input
                  value={newClient.contactPerson}
                  onChange={(e) => setNewClient((p) => ({ ...p, contactPerson: e.target.value }))}
                  placeholder="e.g. Naledi Mokoena"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-700">Phone Number</span>
                <input
                  value={newClient.phone}
                  onChange={(e) => setNewClient((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="e.g. +27 82 123 4567"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-700">Email Address</span>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient((p) => ({ ...p, email: e.target.value }))}
                  placeholder="e.g. accounts@sunrise.co.za"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-700">City</span>
                <input
                  value={newClient.city}
                  onChange={(e) => setNewClient((p) => ({ ...p, city: e.target.value }))}
                  placeholder="e.g. Johannesburg"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="h-10 px-4 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="h-10 px-4 rounded-xl bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Create Client'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

