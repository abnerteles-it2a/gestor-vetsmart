import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto min-w-[300px] px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 animate-in slide-in-from-right duration-300 ${
              toast.type === 'success' ? 'bg-white border-green-100 text-green-700' :
              toast.type === 'error' ? 'bg-white border-red-100 text-red-700' :
              toast.type === 'warning' ? 'bg-white border-amber-100 text-amber-700' :
              'bg-white border-blue-100 text-blue-700'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
               toast.type === 'success' ? 'bg-green-100 text-green-600' :
               toast.type === 'error' ? 'bg-red-100 text-red-600' :
               toast.type === 'warning' ? 'bg-amber-100 text-amber-600' :
               'bg-blue-100 text-blue-600'
            }`}>
              <i className={`fas ${
                toast.type === 'success' ? 'fa-check' :
                toast.type === 'error' ? 'fa-times' :
                toast.type === 'warning' ? 'fa-exclamation-triangle' :
                'fa-info'
              }`}></i>
            </div>
            <div className="flex-1 text-sm font-medium">
              {toast.message}
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
