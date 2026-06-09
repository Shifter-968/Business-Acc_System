'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { quotesApi } from '@/lib/api';

interface Quote {
  id: string;
  quoteNumber: string;
  client: { name: string };
  status: string;
  total: number;
  expiryDate: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SENT: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-emerald-100 text-emerald-700',
  DECLINED: 'bg-rose-100 text-rose-700',
  CONVERTED: 'bg-purple-100 text-purple-700',
};

const FILTERS = ['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'CONVERTED'];

function currency(value: number) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(value);
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [converting, setConverting] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = activeFilter !== 'ALL' ? { status: activeFilter } : undefined;
    quotesApi
      .list(params)
      .then((res) => setQuotes(res.data ?? []))
      .catch(() => setError('Could not load quotes. Is the API running?'))
      .finally(() => setLoading(false));
  }, [activeFilter]);

  async function handleConvert(id: string) {
    if (!confirm('Convert this quote into an invoice?')) return;
    setConverting(id);
    try {
      const res = await quotesApi.convert(id);
      alert(`Invoice ${res.data.invoiceNumber} created!`);
      setActiveFilter('ALL');
    } catch {
      alert('Could not convert quote. Check API.');
    } finally {
      setConverting(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 p-6 text-white shadow-lg shadow-violet-900/20">
        <p className="text-violet-100 text-sm">Sales Pipeline</p>
        <h2 className="text-2xl font-semibold mt-1">Quotes</h2>
        <p className="text-violet-100 mt-2">Draft, send, and convert quotes into invoices in one step.</p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`h-9 px-3 rounded-xl text-sm font-medium border transition-colors ${
                activeFilter === f
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <Link
          href="/quotes/new"
          className="h-10 px-4 rounded-xl bg-violet-600 text-white text-sm font-medium flex items-center gap-2 hover:bg-violet-500 transition-colors w-fit"
        >
          <Plus className="h-4 w-4" /> New Quote
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="p-6 text-sm text-amber-700 bg-amber-50">{error}</p>
        ) : quotes.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No quotes found.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-600">Quote #</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Client</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Expires</th>
                <th className="text-right px-5 py-3 font-medium text-slate-600">Total</th>
                <th className="text-right px-5 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{q.quoteNumber}</td>
                  <td className="px-5 py-3 text-slate-700">{q.client?.name ?? '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-lg ${STATUS_COLORS[q.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {new Date(q.expiryDate).toLocaleDateString('en-ZA')}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-900">
                    {currency(Number(q.total))}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {(q.status === 'SENT' || q.status === 'ACCEPTED') && (
                      <button
                        onClick={() => handleConvert(q.id)}
                        disabled={converting === q.id}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 disabled:opacity-60"
                      >
                        {converting === q.id ? '...' : 'Convert to Invoice'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

