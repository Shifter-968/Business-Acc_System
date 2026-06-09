import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <header className="flex items-center justify-between">
          <div className="text-xl font-semibold tracking-wide">Fannie Logistics</div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-900">
              Sign in
            </Link>
            <Link href="/register" className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-cyan-400">
              Register
            </Link>
          </div>
        </header>

        <section className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-cyan-300 text-sm uppercase tracking-[0.2em]">Logistics Command Center</p>
            <h1 className="mt-3 text-4xl lg:text-5xl font-semibold leading-tight">
              Run transport finance, trips, and fleet operations in one place.
            </h1>
            <p className="mt-5 text-slate-300 max-w-xl">
              Give dispatch, finance, and management one shared system for customer billing, trip visibility, cost control, and reporting.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-medium text-slate-900 hover:bg-cyan-400">
                Request Access <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 font-medium hover:bg-slate-900">
                Go to Login
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center gap-3 text-cyan-300">
                <ShieldCheck className="h-5 w-5" />
                <h3 className="font-semibold">Safe sign-up process</h3>
              </div>
              <p className="mt-2 text-sm text-slate-300">Every new sign-up is reviewed before the person can log in.</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center gap-3 text-cyan-300">
                <Truck className="h-5 w-5" />
                <h3 className="font-semibold">Operations and Finance Together</h3>
              </div>
              <p className="mt-2 text-sm text-slate-300">Keep trucks, trips, customer invoicing, and cost recovery aligned without jumping between systems.</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center gap-3 text-cyan-300">
                <BarChart3 className="h-5 w-5" />
                <h3 className="font-semibold">Live Margin Reporting</h3>
              </div>
              <p className="mt-2 text-sm text-slate-300">Track receivables, fleet costs, payroll exposure, and route profitability after authentication.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
