import { CalendarClock, ShieldCheck } from 'lucide-react';

export default function AuthShell({ eyebrow, title, description, children, footer }) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_440px]">
        <section className="hidden lg:block lg:pl-8">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-extrabold text-white shadow-sm">W</div>
            <span className="font-extrabold tracking-tight text-slate-900">WatchWindow</span>
          </div>
          <p className="ww-eyebrow mb-4">Shared TV time, made simple</p>
          <h1 className="max-w-xl text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900">
            Make room for what matters.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
            See the household schedule, find a clear window, and make your viewing time yours.
          </p>
          <div className="mt-10 flex items-center gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-2"><CalendarClock size={18} className="text-blue-600" /> One shared schedule</span>
            <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-blue-600" /> Private by design</span>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-7 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-extrabold text-white shadow-sm">W</div>
            <p className="font-extrabold tracking-tight text-slate-900">WatchWindow</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
            <p className="ww-eyebrow mb-3">{eyebrow}</p>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            <div className="mt-7">{children}</div>
          </div>
          <p className="mt-5 text-center text-xs leading-5 text-slate-500">{footer}</p>
        </section>
      </div>
    </main>
  );
}
