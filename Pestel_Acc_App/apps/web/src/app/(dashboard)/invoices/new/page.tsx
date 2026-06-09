'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { clientsApi, invoicesApi } from '@/lib/api';

interface ClientOption {
  id: string;
  name: string;
}

interface InvoiceItemForm {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

const DEFAULT_ITEM: InvoiceItemForm = {
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

export default function NewInvoicePage() {
  const router = useRouter();

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientId, setClientId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [terms, setTerms] = useState('Due on receipt');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItemForm[]>([{ ...DEFAULT_ITEM }]);

  const [loadingClients, setLoadingClients] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    clientsApi
      .list()
      .then((res) => {
        const options = (res.data ?? []).map((c: { id: string; name: string }) => ({
          id: c.id,
          name: c.name,
        }));
        setClients(options);
      })
      .catch(() => setError('Could not load clients. Please try again.'))
      .finally(() => setLoadingClients(false));
  }, []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const vat = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice * (item.vatRate / 100),
      0,
    );
    const total = subtotal + vat;
    return { subtotal, vat, total };
  }, [items]);

  function addItem() {
    setItems((prev) => [...prev, { ...DEFAULT_ITEM }]);
  }

  function removeItem(index: number) {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function updateItem(index: number, patch: Partial<InvoiceItemForm>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!clientId) {
      setError('Please choose a client.');
      return;
    }
    if (!dueDate) {
      setError('Please provide a due date.');
      return;
    }
    if (items.some((item) => !item.description.trim())) {
      setError('Each line item needs a description.');
      return;
    }

    setSaving(true);
    try {
      await invoicesApi.create({
        clientId,
        dueDate,
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
      router.push('/invoices');
    } catch {
      setError('Could not create invoice. Please verify values and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 p-6 text-white shadow-lg shadow-cyan-900/20">
        <p className="text-cyan-100 text-sm">Billing</p>
        <h2 className="text-2xl font-semibold mt-1">Create Invoice</h2>
        <p className="text-cyan-100 mt-2">Choose a customer, add line items, and issue a professional transport invoice.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <section className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1 text-sm">
              <span className="text-slate-600">Customer</span>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-cyan-500 focus:outline-none"
                disabled={loadingClients}
              >
                <option value="">{loadingClients ? 'Loading customers...' : 'Select customer'}</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-slate-600">Due Date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-cyan-500 focus:outline-none"
              />
            </label>
          </div>

          <label className="space-y-1 text-sm block">
            <span className="text-slate-600">Payment Terms</span>
            <input
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="e.g. Net 15"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-cyan-500 focus:outline-none"
            />
          </label>

          <label className="space-y-1 text-sm block">
            <span className="text-slate-600">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional note shown on invoice"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:border-cyan-500 focus:outline-none"
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
                  className="md:col-span-5 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                />
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                  placeholder="Qty"
                  className="md:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) })}
                  placeholder="Unit price"
                  className="md:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.vatRate}
                  onChange={(e) => updateItem(index, { vatRate: Number(e.target.value) })}
                  placeholder="VAT %"
                  className="md:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="md:col-span-1 rounded-lg border border-slate-300 text-slate-600 hover:text-rose-600 hover:border-rose-300"
                  title="Remove item"
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
          <h3 className="text-base font-semibold text-slate-900">Invoice Summary</h3>
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
            className="mt-6 h-11 w-full rounded-xl bg-cyan-600 text-white font-medium hover:bg-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Creating...' : 'Create Invoice'}
          </button>
        </aside>
      </form>
    </div>
  );
}
