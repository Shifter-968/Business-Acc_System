import { Landmark, BookOpenText, Scale, ArrowUpRight } from 'lucide-react';

const accountRows = [
  { code: '1000', name: 'Bank - Main', type: 'Asset', balance: 'R 429,400' },
  { code: '1100', name: 'Accounts Receivable', type: 'Asset', balance: 'R 312,500' },
  { code: '2000', name: 'VAT Payable', type: 'Liability', balance: 'R 58,900' },
  { code: '4000', name: 'Service Revenue', type: 'Income', balance: 'R 1,284,300' },
  { code: '5000', name: 'Operating Expenses', type: 'Expense', balance: 'R 742,900' },
];

export default function AccountsPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-700 p-6 text-white shadow-lg shadow-indigo-900/20">
        <p className="text-indigo-100 text-sm">Chart of Accounts</p>
        <h2 className="text-2xl font-semibold mt-1">Your accounting backbone</h2>
        <p className="text-indigo-100 mt-2 max-w-2xl">Every transaction posts here, so reports stay accurate and audit-ready.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Assets</p>
            <Landmark className="h-4 w-4 text-slate-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-900 mt-3">R 1,016,900</p>
          <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1"><ArrowUpRight className="h-4 w-4" /> +6.1%</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Liabilities</p>
            <Scale className="h-4 w-4 text-slate-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-900 mt-3">R 475,500</p>
          <p className="text-sm text-slate-500 mt-2">Current quarter</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Ledger Entries</p>
            <BookOpenText className="h-4 w-4 text-slate-500" />
          </div>
          <p className="text-2xl font-semibold text-slate-900 mt-3">2,184</p>
          <p className="text-sm text-slate-500 mt-2">This financial year</p>
        </article>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
        <h3 className="text-base font-semibold text-slate-900">Core Ledger Accounts</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-3 px-2 font-medium">Code</th>
                <th className="py-3 px-2 font-medium">Account Name</th>
                <th className="py-3 px-2 font-medium">Type</th>
                <th className="py-3 px-2 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {accountRows.map((row) => (
                <tr key={row.code} className="border-b last:border-0 border-slate-100">
                  <td className="py-3 px-2 font-medium text-slate-900">{row.code}</td>
                  <td className="py-3 px-2 text-slate-700">{row.name}</td>
                  <td className="py-3 px-2 text-slate-600">{row.type}</td>
                  <td className="py-3 px-2 font-semibold text-slate-900">{row.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
