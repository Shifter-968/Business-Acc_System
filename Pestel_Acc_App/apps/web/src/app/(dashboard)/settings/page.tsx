import { ShieldCheck, Building2, Mail, BellRing, SlidersHorizontal } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white shadow-lg shadow-slate-900/20">
        <p className="text-slate-300 text-sm">Workspace Settings</p>
        <h2 className="text-2xl font-semibold mt-1">Manage your business details</h2>
        <p className="text-slate-300 mt-2 max-w-2xl">Update your company info, set how invoices look, and adjust how the system works for your team.</p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2"><Building2 className="h-4 w-4" /> Company Profile</h3>
          <div className="mt-4 space-y-3">
            <label className="space-y-1 block">
              <span className="text-sm font-medium text-slate-700">Company Name</span>
              <input className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm" defaultValue="Fannie Logistics (Pty) Ltd" placeholder="The full name of your company" />
            </label>
            <label className="space-y-1 block">
              <span className="text-sm font-medium text-slate-700">Registration Number</span>
              <input className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm" defaultValue="2019/204155/07" placeholder="Company registration number (from CIPC paperwork)" />
            </label>
            <label className="space-y-1 block">
              <span className="text-sm font-medium text-slate-700">Business Address</span>
              <input className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm" defaultValue="12 Skyline Avenue, Johannesburg" placeholder="Street, city, province" />
            </label>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2"><Mail className="h-4 w-4" /> Invoice Settings</h3>
          <div className="mt-4 space-y-3">
            <label className="space-y-1 block">
              <span className="text-sm font-medium text-slate-700">How long customers have to pay</span>
              <input className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm" defaultValue="30 days" placeholder="e.g. 30 days" />
            </label>
            <label className="space-y-1 block">
              <span className="text-sm font-medium text-slate-700">Your email address on invoices</span>
              <input className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm" defaultValue="finance@fannielogistics.co.za" placeholder="Where customers reply when they have questions about an invoice" />
            </label>
            <label className="space-y-1 block">
              <span className="text-sm font-medium text-slate-700">Message at the bottom of every invoice</span>
              <input className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm" defaultValue="Thank you for trusting Fannie Logistics." placeholder="e.g. Thank you for trusting Fannie Logistics." />
            </label>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2"><BellRing className="h-4 w-4" /> Notifications</h3>
          <p className="text-sm text-slate-500 mt-2">Invoice due reminders, overdue alerts, and weekly summaries.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Security</h3>
          <p className="text-sm text-slate-500 mt-2">Control who can do what and how long people stay logged in.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Preferences</h3>
          <p className="text-sm text-slate-500 mt-2">Choose how money amounts, dates, and reports are shown.</p>
        </article>
      </section>

      <div className="flex justify-end">
        <button className="h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors">Save Changes</button>
      </div>
    </div>
  );
}
