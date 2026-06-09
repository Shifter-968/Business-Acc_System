"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Users, FileText, FileCheck,
  ShoppingCart, CreditCard, BookOpen, BarChart3,
  Receipt, Settings, Building2, ChevronRight, ShieldCheck,
} from 'lucide-react';
import { getCurrentUserRole } from '@/lib/api';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Customers', icon: Users },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/quotes', label: 'Trip Quotes', icon: FileCheck },
  { href: '/expenses', label: 'Expenses', icon: ShoppingCart },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/accounts', label: 'Accounts', icon: BookOpen },
  { href: '/reports/profit-loss', label: 'Reports', icon: BarChart3 },
  { href: '/vat', label: 'VAT', icon: Receipt },
  { href: '/settings', label: 'Settings', icon: Settings },
];

type SidebarProps = {
  onNavigate?: () => void;
};

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(getCurrentUserRole());
  }, []);

  const items = useMemo(() => {
    if (role !== 'ADMIN') return navItems;
    return [
      ...navItems,
      { href: '/admin/users', label: 'User Approvals', icon: ShieldCheck },
    ];
  }, [role]);

  return (
    <aside className="h-full w-full bg-slate-950 text-slate-200 flex flex-col">
      <div className="h-20 flex items-center px-6 border-b border-slate-800">
        <div className="h-10 w-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mr-3">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold tracking-wide text-slate-100">Fannie Logistics</p>
          <p className="text-xs text-slate-400">Finance Suite</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${isActive
                ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {label}
              </span>
              <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'translate-x-0 text-cyan-300' : '-translate-x-1 text-slate-500 group-hover:translate-x-0 group-hover:text-slate-300'}`} />
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-800">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs text-slate-300">
          <p className="font-medium text-slate-100 mb-1">Business Health</p>
          <p>Track trips, receivables, fleet costs, payroll, and VAT in one workspace.</p>
        </div>
      </div>
    </aside>
  );
}
