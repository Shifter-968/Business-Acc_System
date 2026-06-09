import { Plus, Search, ArrowUpRight, Banknote, CreditCard, Landmark } from 'lucide-react';

const payments = [
  { id: 'PAY-2026-312', invoice: 'INV-2026-109', method: 'EFT', date: '02 May 2026', amount: 'R 16,000', status: 'Cleared' },
  { id: 'PAY-2026-311', invoice: 'INV-2026-108', method: 'Card', date: '30 Apr 2026', amount: 'R 66,200', status: 'Cleared' },
  { id: 'PAY-2026-310', invoice: 'INV-2026-107', method: 'Bank Transfer', date: '28 Apr 2026', amount: 'R 9,300', status: 'Pending' },
];

export default function PaymentsPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 p-6 text-white shadow-lg shadow-emerald-900/20">
        <p className="text-emerald-100 text-sm">Collections</p>
        <h2 className="text-2xl font-semibold mt-1">Track money coming in</h2>
        <p className="text-emerald-100 mt-2 max-w-2xl">Capture received payments and reconcile them against invoices in one place.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">This Month</p>
            <Banknote className="h-4 w-4 text-slate-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-900 mt-3">R 248,700</p>
          <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1"><ArrowUpRight className="h-4 w-4" /> +8.3%</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Pending Reconciliation</p>
            <Landmark className="h-4 w-4 text-slate-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-900 mt-3">R 21,400</p>
          <p className="text-sm text-amber-600 mt-2">Needs matching</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Card Payments</p>
            <CreditCard className="h-4 w-4 text-slate-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-900 mt-3">R 74,900</p>
          <p className="text-sm text-slate-500 mt-2">Last 30 days</p>
        </article>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200" placeholder="Search payment or invoice" />
          </div>
          <button className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-sm font-medium flex items-center gap-2 hover:bg-emerald-500 transition-colors">
            <Plus className="h-4 w-4" /> Record Payment
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-3 px-2 font-medium">Payment ID</th>
                <th className="py-3 px-2 font-medium">Invoice</th>
                <th className="py-3 px-2 font-medium">Method</th>
                <th className="py-3 px-2 font-medium">Date</th>
                <th className="py-3 px-2 font-medium">Amount</th>
                <th className="py-3 px-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b last:border-0 border-slate-100">
                  <td className="py-3 px-2 font-medium text-slate-900">{payment.id}</td>
                  <td className="py-3 px-2 text-slate-700">{payment.invoice}</td>
                  <td className="py-3 px-2 text-slate-600">{payment.method}</td>
                  <td className="py-3 px-2 text-slate-600">{payment.date}</td>
                  <td className="py-3 px-2 font-semibold text-slate-900">{payment.amount}</td>
                  <td className="py-3 px-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${payment.status === 'Cleared' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
