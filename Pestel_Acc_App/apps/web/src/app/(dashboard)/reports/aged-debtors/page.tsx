'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface AgedRow {
  client: string;
  invoiceNumber: string;
  total: number;
  amountDue: number;
  daysOverdue: number;
}

interface AgedData {
  generatedAt: string;
  buckets: Record<string, AgedRow[]>;
  totals: Record<string, number>;
  grandTotal: number;
}

const BUCKET_LABELS: Record<string, string> = {
  current: 'Current (not yet due)',
  '1-30': '1–30 days overdue',
  '31-60': '31–60 days overdue',
  '61-90': '61–90 days overdue',
  '90+': '90+ days overdue',
};

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

export default function AgedDebtorsPage() {
  const [data, setData] = useState<AgedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    api
      .get('/reports/aged-debtors')
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load aged debtors report.'))
      .finally(() => setLoading(false));
  }, []);

  async function exportFile(format: 'xlsx' | 'pdf') {
    setExporting(format);
    try {
      const res = await api.get('/reports/aged-debtors/export', {
        params: { format },
        responseType: 'blob',
      });
      downloadBlob(res.data, `aged-debtors-${new Date().toISOString().slice(0, 10)}.${format}`);
    } catch {
      alert('Export failed. Check the API.');
    } finally {
      setExporting('');
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-orange-600 to-rose-700 p-6 text-white shadow-lg shadow-orange-900/20">
        <p className="text-orange-100 text-sm">Receivables Analysis</p>
        <h2 className="text-2xl font-semibold mt-1">Aged Debtors</h2>
        <p className="text-orange-100 mt-2">Outstanding invoices grouped by how long they have been unpaid.</p>
      </div>

      {data && (
        <div className="flex gap-3 flex-wrap">
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
        </div>
      )}

      {loading ? (
        <div className="space-y-3 p-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div>
      ) : data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(data.totals).map(([bucket, total]) => (
              <div key={bucket} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-xs text-slate-500">{BUCKET_LABELS[bucket] ?? bucket}</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">{currency(total)}</p>
              </div>
            ))}
          </div>

          {Object.entries(data.buckets).map(([bucket, rows]) => {
            if (rows.length === 0) return null;
            return (
              <div key={bucket} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                  <h4 className="font-semibold text-slate-800">{BUCKET_LABELS[bucket] ?? bucket}</h4>
                </div>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-5 py-2 font-medium text-slate-500">Invoice</th>
                      <th className="text-left px-5 py-2 font-medium text-slate-500">Client</th>
                      <th className="text-right px-5 py-2 font-medium text-slate-500">Invoice Total</th>
                      <th className="text-right px-5 py-2 font-medium text-slate-500">Amount Due</th>
                      <th className="text-right px-5 py-2 font-medium text-slate-500">Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.invoiceNumber} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium text-slate-900">{row.invoiceNumber}</td>
                        <td className="px-5 py-3 text-slate-700">{row.client}</td>
                        <td className="px-5 py-3 text-right text-slate-700">{currency(row.total)}</td>
                        <td className="px-5 py-3 text-right font-semibold text-rose-700">{currency(row.amountDue)}</td>
                        <td className="px-5 py-3 text-right text-slate-600">{row.daysOverdue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
            <span className="font-semibold text-slate-900">Grand Total Outstanding</span>
            <span className="text-xl font-semibold text-rose-700">{currency(data.grandTotal)}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

