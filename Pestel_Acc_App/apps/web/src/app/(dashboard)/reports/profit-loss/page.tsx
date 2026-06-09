'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface ProfitLossData {
  period: { from: string; to: string };
  income: { total: number; invoiceCount: number };
  expenses: { total: number; byCategory: Record<string, number>; expenseCount: number };
  netProfit: number;
  profitMargin: number;
}

function currency(value: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 2 }).format(value);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ProfitLossPage() {
  const now = new Date();
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const today = now.toISOString().slice(0, 10);

  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(today);
  const [data, setData] = useState<ProfitLossData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState('');

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/reports/profit-loss', { params: { from, to } });
      setData(res.data);
    } catch {
      setError('Could not generate report. Check date range and API.');
    } finally {
      setLoading(false);
    }
  }

  async function exportFile(format: 'xlsx' | 'pdf') {
    setExporting(format);
    try {
      const res = await api.get(`/reports/profit-loss/export`, {
        params: { format, from, to },
        responseType: 'blob',
      });
      downloadBlob(res.data, `profit-loss-${from}-${to}.${format}`);
    } catch {
      alert(`Export failed. Ensure the API is running and data exists.`);
    } finally {
      setExporting('');
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-slate-700 to-slate-900 p-6 text-white shadow-lg">
        <p className="text-slate-300 text-sm">Financial Reports</p>
        <h2 className="text-2xl font-semibold mt-1">Profit &amp; Loss</h2>
        <p className="text-slate-300 mt-2">Income vs expenses for a selected date range.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-wrap gap-4 items-end">
        <label className="space-y-1 text-sm">
          <span className="text-slate-600">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="block rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-600 focus:outline-none"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600">To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="block rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-600 focus:outline-none"
          />
        </label>
        <button
          onClick={generate}
          disabled={loading}
          className="h-10 px-5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-60"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
        {data && (
          <>
            <button
              onClick={() => exportFile('xlsx')}
              disabled={!!exporting}
              className="h-10 px-4 rounded-xl border border-emerald-600 text-emerald-700 text-sm font-medium hover:bg-emerald-50 disabled:opacity-60"
            >
              {exporting === 'xlsx' ? '...' : 'Export XLSX'}
            </button>
            <button
              onClick={() => exportFile('pdf')}
              disabled={!!exporting}
              className="h-10 px-4 rounded-xl border border-rose-600 text-rose-700 text-sm font-medium hover:bg-rose-50 disabled:opacity-60"
            >
              {exporting === 'pdf' ? '...' : 'Export PDF'}
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div>
      )}

      {data && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-900">
            Period: {data.period.from} — {data.period.to}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">Total Income</p>
              <p className="text-2xl font-semibold text-emerald-900 mt-1">{currency(data.income.total)}</p>
              <p className="text-xs text-emerald-600 mt-1">{data.income.invoiceCount} invoices</p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm text-rose-700">Total Expenses</p>
              <p className="text-2xl font-semibold text-rose-900 mt-1">{currency(data.expenses.total)}</p>
              <p className="text-xs text-rose-600 mt-1">{data.expenses.expenseCount} expense records</p>
            </div>
            <div className={`rounded-xl border p-4 ${data.netProfit >= 0 ? 'border-cyan-200 bg-cyan-50' : 'border-amber-200 bg-amber-50'}`}>
              <p className={`text-sm ${data.netProfit >= 0 ? 'text-cyan-700' : 'text-amber-700'}`}>Net Profit</p>
              <p className={`text-2xl font-semibold mt-1 ${data.netProfit >= 0 ? 'text-cyan-900' : 'text-amber-900'}`}>
                {currency(data.netProfit)}
              </p>
              <p className={`text-xs mt-1 ${data.netProfit >= 0 ? 'text-cyan-600' : 'text-amber-600'}`}>
                {data.profitMargin.toFixed(1)}% margin
              </p>
            </div>
          </div>

          {Object.keys(data.expenses.byCategory).length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mt-4 mb-2">Expenses by Category</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 text-slate-600 font-medium">Category</th>
                      <th className="text-right py-2 text-slate-600 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.expenses.byCategory).map(([cat, amt]) => (
                      <tr key={cat} className="border-b border-slate-100">
                        <td className="py-2 text-slate-700">{cat}</td>
                        <td className="py-2 text-right text-slate-900 font-medium">{currency(amt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

