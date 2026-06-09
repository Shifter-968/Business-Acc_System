'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface BalanceSheetData {
  asAt: string;
  assets: { accountsReceivable: number; cash: number; total: number };
  liabilities: { total: number };
  equity: { retainedEarnings: number; total: number };
  note: string;
}

function currency(value: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 2 }).format(value);
}

export default function BalanceSheetPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/reports/balance-sheet', { params: { date } });
      setData(res.data);
    } catch {
      setError('Could not generate report. Check date and API.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-700 p-6 text-white shadow-lg shadow-indigo-900/20">
        <p className="text-indigo-100 text-sm">Financial Reports</p>
        <h2 className="text-2xl font-semibold mt-1">Balance Sheet</h2>
        <p className="text-indigo-100 mt-2">Assets, liabilities, and equity as at a specific date.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-wrap gap-4 items-end">
        <label className="space-y-1 text-sm">
          <span className="text-slate-600">As at date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="block rounded-xl border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <button
          onClick={generate}
          disabled={loading}
          className="h-10 px-5 rounded-xl bg-indigo-700 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-60"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div>
      )}

      {data && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">As at: <strong>{data.asAt}</strong></p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
              <h4 className="font-semibold text-emerald-800 mb-3">Assets</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-700">
                  <span>Accounts Receivable</span>
                  <span>{currency(data.assets.accountsReceivable)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Cash Collected</span>
                  <span>{currency(data.assets.cash)}</span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-800 border-t border-slate-200 pt-2">
                  <span>Total Assets</span>
                  <span>{currency(data.assets.total)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
              <h4 className="font-semibold text-rose-800 mb-3">Liabilities</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between font-semibold text-rose-800 border-t border-slate-200 pt-2">
                  <span>Total Liabilities</span>
                  <span>{currency(data.liabilities.total)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
              <h4 className="font-semibold text-blue-800 mb-3">Equity</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-700">
                  <span>Retained Earnings</span>
                  <span>{currency(data.equity.retainedEarnings)}</span>
                </div>
                <div className="flex justify-between font-semibold text-blue-800 border-t border-slate-200 pt-2">
                  <span>Total Equity</span>
                  <span>{currency(data.equity.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
            {data.note}
          </div>
        </div>
      )}
    </div>
  );
}

