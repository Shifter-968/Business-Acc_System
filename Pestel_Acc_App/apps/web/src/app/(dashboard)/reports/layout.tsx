import Link from 'next/link';

const reportLinks = [
  { href: '/reports/profit-loss', label: 'Profit & Loss' },
  { href: '/reports/balance-sheet', label: 'Balance Sheet' },
  { href: '/reports/aged-debtors', label: 'Aged Debtors' },
];

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    {reportLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="h-9 px-3 rounded-lg text-sm text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
            {children}
        </div>
    );
}
