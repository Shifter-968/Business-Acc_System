// ─── InvoicesPage ─────────────────────────────────────────────────────────────
//
// TEACHING NOTE — How this frontend page works
//
// 1. "use client" — tells Next.js this component runs in the BROWSER, not the server.
//    We need this because we use React state (useState, useEffect).
//
// 2. useState — holds data in memory while the page is open.
//    Example: invoices is an array. When setInvoices([...]) is called, the page re-renders.
//
// 3. useEffect — runs code AFTER the page loads.
//    We use it to fetch invoices from the API on first load.
//
// 4. invoicesApi.list() — calls GET /api/v1/invoices on the backend.
//    The backend returns an array of invoice objects.
//    We store it in `invoices` state and display it in the table.
//
// 5. The status filter buttons call setActiveFilter and re-trigger the fetch.
//
// FLOW:
//   Page loads → useEffect fires → fetch from API → setInvoices(data) → table renders
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { invoicesApi } from '@/lib/api';

// The shape of one invoice as returned by the backend
type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'VOID' | 'OVERDUE';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  dueDate: string;
  total: number;
  amountDue: number;
  client: { id: string; name: string };
  _count?: { items: number };
}

// Map statuses to readable badge colors
const statusStyle: Record<InvoiceStatus, string> = {
  DRAFT:           'bg-slate-100 text-slate-600',
  SENT:            'bg-amber-100 text-amber-700',
  PARTIALLY_PAID:  'bg-blue-100 text-blue-700',
  PAID:            'bg-emerald-100 text-emerald-700',
  VOID:            'bg-red-100 text-red-500',
  OVERDUE:         'bg-rose-100 text-rose-700',
};

const ALL_STATUSES: Array<InvoiceStatus | 'ALL'> = ['ALL', 'DRAFT', 'SENT', 'PAID', 'OVERDUE'];

// Format a number as South African Rand
function zar(n: number) {
  return `R ${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
}

export default function InvoicesPage() {
  const [invoices, setInvoices]       = useState<Invoice[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [activeFilter, setActiveFilter] = useState<InvoiceStatus | 'ALL'>('ALL');

  // Fetch invoices whenever the status filter changes
  useEffect(() => {
    setLoading(true);
    setError('');
    const params = activeFilter !== 'ALL' ? { status: activeFilter } : {};
    invoicesApi
      .list(params)
      .then((res) => setInvoices(res.data))
      .catch(() => setError('Could not load invoices. Is the API running?'))
      .finally(() => setLoading(false));
  }, [activeFilter]);

  // Client-side text search on top of the already-filtered list
  const filtered = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.client.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Invoices</h2>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? 'Loading…' : `${filtered.length} invoice${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="h-10 px-4 rounded-xl bg-cyan-600 text-white text-sm font-medium flex items-center gap-2 hover:bg-cyan-500 transition-colors w-fit"
        >
          <Plus className="h-4 w-4" /> New Invoice
        </Link>
      </div>

      {/* ── Main card ── */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
        {/* Controls row */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice or client"
              className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-cyan-200"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setActiveFilter(s)}
                className={`h-9 px-3 rounded-lg text-sm border transition-colors ${
                  activeFilter === s
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !error && (
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-2 font-medium">Invoice</th>
                  <th className="py-3 px-2 font-medium">Client</th>
                  <th className="py-3 px-2 font-medium">Due Date</th>
                  <th className="py-3 px-2 font-medium">Total</th>
                  <th className="py-3 px-2 font-medium">Amount Due</th>
                  <th className="py-3 px-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 text-sm">
                      No invoices found. Create your first invoice!
                    </td>
                  </tr>
                )}
                {filtered.map((invoice) => (
                  <tr key={invoice.id} className="border-b last:border-0 border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2 font-medium text-slate-900">{invoice.invoiceNumber}</td>
                    <td className="py-3 px-2 text-slate-700">{invoice.client.name}</td>
                    <td className="py-3 px-2 text-slate-600">
                      {new Date(invoice.dueDate).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-2 font-semibold text-slate-900">{zar(invoice.total)}</td>
                    <td className="py-3 px-2 text-slate-700">{zar(invoice.amountDue)}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[invoice.status]}`}>
                        {invoice.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
