import Link from 'next/link';
import { ArrowUpRight, Coins, ReceiptText, WalletCards, CircleDollarSign } from 'lucide-react';

const stats = [
  { label: 'Transport Revenue', value: 'R 1,284,300', delta: '+12.4%', icon: Coins },
  { label: 'Outstanding Receivables', value: 'R 312,500', delta: '+5.2%', icon: ReceiptText },
  { label: 'Fleet and Trip Costs', value: 'R 742,900', delta: '-2.1%', icon: WalletCards },
  { label: 'Net Margin', value: 'R 541,400', delta: '+9.8%', icon: CircleDollarSign },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 p-6 lg:p-8 text-white shadow-lg shadow-cyan-900/20">
        <p className="text-cyan-100 text-sm">Today at a glance</p>
        <h2 className="text-2xl lg:text-3xl font-semibold mt-1">Your logistics cockpit is ready</h2>
        <p className="text-cyan-100 mt-2 max-w-2xl">
          Monitor customer billing, control route costs, and keep finance aligned with daily fleet activity.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, delta, icon: Icon }) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-sm text-slate-500">{label}</p>
              <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-slate-900 mt-4">{value}</p>
            <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
              <ArrowUpRight className="h-4 w-4" /> {delta} vs last month
            </p>
          </article>
        ))}
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <article className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Recent Invoices</h3>
          <div className="mt-4 space-y-3">
            {[
              { id: 'INV-2026-101', client: 'Kopano Mining', amount: 'R 52,000', status: 'Paid' },
              { id: 'INV-2026-102', client: 'North Route Cement', amount: 'R 18,300', status: 'Sent' },
              { id: 'INV-2026-103', client: 'Horizon Steel', amount: 'R 74,900', status: 'Overdue' },
            ].map((invoice) => (
              <div key={invoice.id} className="rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{invoice.id}</p>
                  <p className="text-sm text-slate-500">{invoice.client}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{invoice.amount}</p>
                  <p className="text-xs text-slate-500">{invoice.status}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Quick Actions</h3>
          <div className="mt-4 space-y-2">
            {[
              { label: 'Create Invoice', href: '/invoices/new' },
              { label: 'Capture Expense', href: '/expenses' },
              { label: 'Add Customer', href: '/clients?open=create' },
              { label: 'Review Margin Report', href: '/reports/profit-loss' },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="block w-full text-left rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
