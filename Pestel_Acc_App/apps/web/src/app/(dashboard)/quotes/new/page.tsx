'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { clientsApi, quotesApi } from '@/lib/api';

interface ClientOption {
  id: string;
  name: string;
}

interface QuoteItemForm {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

const DEFAULT_ITEM: QuoteItemForm = {
  description: '',
  quantity: 1,
  unitPrice: 0,
  vatRate: 15,
};

function currency(value: number) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(value);
}

export default function NewQuotePage() {
  const router = useRouter();

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientId, setClientId] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [terms, setTerms] = useState('Valid for 30 days');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<QuoteItemForm[]>([{ ...DEFAULT_ITEM }]);

  const [loadingClients, setLoadingClients] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    clientsApi
      .list()
      .then((res) =>
        setClients((res.data ?? []).map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })))
      )
      .catch(() => setError('Could not load clients.'))
      .finally(() => setLoadingClients(false));
  }, []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const vat = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice * (item.vatRate / 100),
      0,
    );
    return { subtotal, vat, total: subtotal + vat };
  }, [items]);

  function addItem() {
    setItems((prev) => [...prev, { ...DEFAULT_ITEM }]);
  }

  function removeItem(index: number) {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function updateItem(index: number, patch: Partial<QuoteItemForm>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!clientId) { setError('Please choose a client.'); return; }
    if (!expiryDate) { setError('Please provide an expiry date.'); return; }
    if (items.some((item) => !item.description.trim())) {
      setError('Each line item needs a description.'); return;
    }

    setSaving(true);
    try {
      await quotesApi.create({
        clientId,
        expiryDate,
        terms,
        notes,
        items: items.map((item, index) => ({
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          vatRate: Number(item.vatRate),
          sortOrder: index,
        })),
      });
      router.push('/quotes');
    } catch {
      setError('Could not create quote. Please verify values and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 p-6 text-white shadow-lg shadow-violet-900/20">
        <p className="text-violet-100 text-sm">Sales Pipeline</p>
        <h2 className="text-2xl font-semibold mt-1">Create Quote</h2>
        <p className="text-violet-100 mt-2">Build a trip quote and send it to your customer for acceptance.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <section className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1 text-sm">
              <span className="text-slate-600">Customer</span>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-violet-500 focus:outline-none"
                disabled={loadingClients}
              >
                <option value="">{loadingClients ? 'Loading...' : 'Select customer'}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-slate-600">Expiry Date</span>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-violet-500 focus:outline-none"
              />
            </label>
          </div>

          <label className="space-y-1 text-sm block">
            <span className="text-slate-600">Terms</span>
            <input
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-violet-500 focus:outline-none"
            />
          </label>

          <label className="space-y-1 text-sm block">
            <span className="text-slate-600">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-violet-500 focus:outline-none"
            />
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Line Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="h-9 px-3 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Item
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="rounded-xl border border-slate-200 p-3 grid grid-cols-1 md:grid-cols-12 gap-3">
                <input
                  value={item.description}
                  onChange={(e) => updateItem(index, { description: e.target.value })}
                  placeholder="Description"
                  className="md:col-span-5 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
                />
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                  placeholder="Qty"
                  className="md:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) })}
                  placeholder="Unit price"
                  className="md:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.vatRate}
                  onChange={(e) => updateItem(index, { vatRate: Number(e.target.value) })}
                  placeholder="VAT %"
                  className="md:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="md:col-span-1 rounded-lg border border-slate-300 text-slate-600 hover:text-rose-600 hover:border-rose-300"
                >
                  <Trash2 className="h-4 w-4 mx-auto" />
                </button>
              </div>
            ))}
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-fit">
          <h3 className="text-base font-semibold text-slate-900">Quote Summary</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{currency(totals.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>VAT</span>
              <span>{currency(totals.vat)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-slate-900 font-semibold">
              <span>Total</span>
              <span>{currency(totals.total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 h-11 w-full rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Creating...' : 'Create Quote'}
          </button>
        </aside>
      </form>
    </div>
  );
}
