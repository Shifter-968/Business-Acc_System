"use client";

import { Bell, LogOut, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { signOut } from '@/lib/api';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clients': 'Customers',
  '/invoices': 'Invoices',
  '/quotes': 'Trip Quotes',
  '/expenses': 'Expenses',
  '/payments': 'Payments',
  '/accounts': 'Accounts',
  '/reports/profit-loss': 'Reports',
  '/vat': 'VAT',
  '/settings': 'Settings',
  '/admin/users': 'User Approvals',
};

type HeaderProps = {
  onOpenMobileMenu: () => void;
  onToggleDesktopSidebar: () => void;
  isDesktopSidebarCollapsed: boolean;
};

export default function Header({
  onOpenMobileMenu,
  onToggleDesktopSidebar,
  isDesktopSidebarCollapsed,
}: HeaderProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? 'Workspace';
  async function handleSignOut() {
    await signOut();
  }

  return (
    <header className="h-20 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center justify-between px-6 lg:px-8">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onToggleDesktopSidebar}
          className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:inline-flex"
          aria-label={isDesktopSidebarCollapsed ? 'Show panel' : 'Hide panel'}
          title={isDesktopSidebarCollapsed ? 'Show panel' : 'Hide panel'}
        >
          {isDesktopSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Fannie Logistics</p>
        <h1 className="truncate text-base font-semibold text-slate-900 sm:text-xl">{title}</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <button className="h-10 w-10 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">
          <Bell className="h-5 w-5 mx-auto" />
        </button>
        <button onClick={handleSignOut} className="h-10 px-3 sm:px-4 rounded-xl border border-slate-200 flex items-center gap-2 text-sm font-medium text-slate-700 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-colors">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
