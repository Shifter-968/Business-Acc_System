'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { expensesApi } from '@/lib/api';

interface Expense {
  id: string;
  description?: string;
  category?: string;
  amount: number;
  date?: string;
}

function currency(value: number) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(value);
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Operations');
  const [amount, setAmount] = useState<number>(0);
  const [expenseDate, setExpenseDate] = useState('');

  async function loadExpenses() {
    setLoading(true);
    try {
      const res = await expensesApi.list();
      setExpenses(res.data ?? []);
      setError('');
    } catch {
      setError('Expenses backend is not fully implemented yet. UI is ready and wired.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  async function handleCreateExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setError('Expense description is required.');
      return;
    }
    if (amount <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await expensesApi.create({
        description: description.trim(),
        category,
        amount: Number(amount),
        date: expenseDate || undefined,
      });
      setDescription('');
      setCategory('Operations');
      setAmount(0);
      setExpenseDate('');
      await loadExpenses();
    } catch {
      setError('Could not save expense. Backend endpoint may still be scaffold only.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white shadow-lg shadow-emerald-900/20">
        <p className="text-emerald-100 text-sm">Spend Management</p>
        <h2 className="text-2xl font-semibold mt-1">Capture Expenses</h2>
        <p className="text-emerald-100 mt-2">Record business costs and keep your profitability accurate.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <form onSubmit={handleCreateExpense} className="xl:col-span-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Expense
          </h3>
          <label className="space-y-1 block text-sm">
            <span className="text-slate-600">Expense Description</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Meta ads for winter campaign"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <label className="space-y-1 block text-sm">
            <span className="text-slate-600">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option>Operations</option>
              <option>Marketing</option>
              <option>Travel</option>
              <option>Software</option>
              <option>Utilities</option>
              <option>Other</option>
            </select>
          </label>
          <label className="space-y-1 block text-sm">
            <span className="text-slate-600">Amount (ZAR)</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="e.g. 1500.00"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <label className="space-y-1 block text-sm">
            <span className="text-slate-600">Expense Date</span>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="h-10 w-full rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Capture Expense'}
          </button>
        </form>

        <section className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Recent Expenses</h3>
          {loading ? (
            <p className="text-sm text-slate-500 mt-3">Loading expenses...</p>
          ) : expenses.length === 0 ? (
            <p className="text-sm text-slate-500 mt-3">No expenses yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-4 font-medium">Description</th>
                    <th className="py-2 pr-4 font-medium">Category</th>
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4 text-slate-800">{expense.description ?? 'Expense'}</td>
                      <td className="py-3 pr-4 text-slate-600">{expense.category ?? '-'}</td>
                      <td className="py-3 pr-4 text-slate-600">{expense.date ? new Date(expense.date).toLocaleDateString() : '-'}</td>
                      <td className="py-3 text-right font-medium text-slate-900">{currency(Number(expense.amount ?? 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      )}
    </div>
  );
}
