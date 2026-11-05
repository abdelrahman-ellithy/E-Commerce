import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const TONES = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  info: 'text-brand-600',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (type, message) => {
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      setToasts((current) => [
        ...current.slice(-3),
        { id, type, message },
      ]);

      const timer = setTimeout(() => dismiss(id), 4500);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  const toast = useMemo(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
      >
        {toasts.map((item) => {
          const Icon = ICONS[item.type] || Info;
          return (
            <div
              key={item.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-soft"
            >
              <Icon
                className={`mt-0.5 h-5 w-5 shrink-0 ${TONES[item.type] || TONES.info}`}
                aria-hidden="true"
              />
              <p className="flex-1 text-sm font-medium leading-6 text-slate-700">
                {item.message}
              </p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-md p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside a ToastProvider.');
  }

  return context;
}
