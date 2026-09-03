import { motion } from 'framer-motion';
import { Shield, ShieldCheck } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-0">
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.25),_transparent_35%),radial-gradient(circle_at_center,_rgba(251,146,60,0.18),_transparent_40%),linear-gradient(180deg,_rgba(3,7,18,0.4),_rgba(3,7,18,0.9))]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="text-sm uppercase tracking-[0.3em] text-cyan-200">SafePing</div>
          <div>
            <h1 className="max-w-lg text-5xl font-semibold leading-tight">
              Automatic safe-arrival alerts for the people who matter.
            </h1>
            <p className="mt-6 max-w-md text-lg text-slate-300">
              Create trusted places, track your trip, and notify contacts as soon as you reach home.
            </p>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center lg:p-6">
        <div className="absolute inset-x-0 top-0 h-48 rounded-full bg-cyan-400/10 blur-3xl lg:hidden" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel relative w-full max-w-md rounded-[2rem] p-5 sm:p-8"
        >
          <div className="mb-7 flex items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">SafePing</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Arrival automations</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
          <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
            <Shield className="mr-2 h-3.5 w-3.5" />
            {subtitle}
          </div>
          <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">{title}</h2>
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}

export default AuthLayout;
