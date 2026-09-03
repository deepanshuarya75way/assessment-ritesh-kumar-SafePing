import { createContext, useContext, useEffect, useState } from 'react';

const ToastContext = createContext(null);

let nextToastId = 1;

function ToastViewport({ toasts, dismissToast }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
      {toasts.map((toast) => {
        const toneClasses =
          toast.tone === 'error'
            ? 'border-rose-400/30 bg-rose-500/15 text-rose-100'
            : toast.tone === 'warning'
              ? 'border-amber-400/30 bg-amber-500/15 text-amber-100'
              : 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-3xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${toneClasses}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? <p className="mt-1 text-sm opacity-90">{toast.description}</p> : null}
              </div>
              <button
                type="button"
                className="text-xs font-medium uppercase tracking-[0.18em] opacity-80 transition hover:opacity-100"
                onClick={() => dismissToast(toast.id)}
              >
                Close
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = (id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  };

  const showToast = ({ title, description = '', tone = 'success', duration = 4000 }) => {
    const id = nextToastId++;

    setToasts((currentToasts) => [...currentToasts, { id, title, description, tone, duration }]);
    return id;
  };

  useEffect(() => {
    if (!toasts.length) {
      return undefined;
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        dismissToast(toast.id);
      }, toast.duration),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastViewport toasts={toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
