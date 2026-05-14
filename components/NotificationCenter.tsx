import React, { useState, useRef, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'appointment' | 'vaccine' | 'stock' | 'pet' | 'birthday' | 'report' | 'payment';
  title: string;
  message: string;
  time: string;
  read: boolean;
  urgent: boolean;
  action?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'appointment',
    title: 'Consulta em 30 min',
    message: 'Rex (João Silva) — Consulta de Rotina às 14:30',
    time: 'Agora',
    read: false,
    urgent: true,
    action: 'agenda',
  },
  {
    id: '2',
    type: 'vaccine',
    title: 'Vacinas vencendo',
    message: '4 pets com vacinas vencendo esta semana. Luna, Thor, Mia e Rex.',
    time: 'Há 15 min',
    read: false,
    urgent: true,
    action: 'patients',
  },
  {
    id: '3',
    type: 'stock',
    title: 'Estoque crítico',
    message: 'Bravecto Gatos (8 unid.) abaixo do mínimo. Reposição sugerida.',
    time: 'Há 1h',
    read: false,
    urgent: true,
    action: 'inventory',
  },
  {
    id: '4',
    type: 'pet',
    title: 'Pets sem retorno',
    message: '3 pets sem retorno há 90+ dias. Enviar lembrete automático?',
    time: 'Há 2h',
    read: false,
    urgent: false,
    action: 'campaigns',
  },
  {
    id: '5',
    type: 'birthday',
    title: 'Aniversário de pets 🎂',
    message: 'Luna (Gato Siamês) faz 3 anos hoje! Enviar parabéns ao tutor?',
    time: 'Há 3h',
    read: false,
    urgent: false,
    action: 'patients',
  },
  {
    id: '6',
    type: 'payment',
    title: 'Pagamento em atraso',
    message: 'Carlos Lima — R$ 450,00 vencido há 7 dias.',
    time: 'Ontem',
    read: true,
    urgent: false,
    action: 'financial',
  },
  {
    id: '7',
    type: 'report',
    title: 'Relatório mensal pronto',
    message: 'Relatório de Abril/2026 gerado. Faturamento: R$ 18.450,00.',
    time: 'Ontem',
    read: true,
    urgent: false,
    action: 'reports',
  },
];

const TYPE_CONFIG = {
  appointment: { icon: 'fa-calendar-check', color: '#1565C0', bg: 'bg-blue-50', border: 'border-blue-100' },
  vaccine:     { icon: 'fa-syringe',        color: '#2E7D32', bg: 'bg-green-50', border: 'border-green-100' },
  stock:       { icon: 'fa-boxes-stacked',  color: '#E65100', bg: 'bg-orange-50', border: 'border-orange-100' },
  pet:         { icon: 'fa-paw',            color: '#6A1B9A', bg: 'bg-purple-50', border: 'border-purple-100' },
  birthday:    { icon: 'fa-birthday-cake',  color: '#AD1457', bg: 'bg-pink-50', border: 'border-pink-100' },
  report:      { icon: 'fa-chart-bar',      color: '#00838F', bg: 'bg-cyan-50', border: 'border-cyan-100' },
  payment:     { icon: 'fa-dollar-sign',    color: '#C62828', bg: 'bg-red-50', border: 'border-red-100' },
};

interface NotificationCenterProps {
  onNavigate: (tab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'urgent') return n.urgent;
    return true;
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleAction = (n: Notification) => {
    markRead(n.id);
    if (n.action) onNavigate(n.action);
    setOpen(false);
  };

  const dismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // AI daily summary
  const urgentCount = notifications.filter(n => n.urgent && !n.read).length;
  const aiSummary = urgentCount > 0
    ? `${urgentCount} alerta${urgentCount > 1 ? 's' : ''} urgente${urgentCount > 1 ? 's' : ''} hoje — consulta, estoque e vacinas pendentes.`
    : 'Tudo em ordem! Nenhum alerta crítico no momento.';

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        id="notification-bell"
        onClick={() => setOpen(o => !o)}
        className="relative text-white/50 hover:text-white transition-colors cursor-pointer"
        title="Notificações"
      >
        <i className="fas fa-bell text-[16px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[7px] font-black min-w-[14px] h-[14px] px-0.5 rounded-full flex items-center justify-center border-[1.5px] border-[#020617] leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-10 w-[380px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-slate-100 z-[9000] overflow-hidden"
          style={{ animation: 'portalEnter 0.2s ease forwards' }}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Notificações</h3>
              {unreadCount > 0 && (
                <p className="text-[10px] text-slate-400 mt-0.5">{unreadCount} não lidas</p>
              )}
            </div>
            <button
              onClick={markAllRead}
              className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
            >
              Marcar tudo lido
            </button>
          </div>

          {/* AI Summary */}
          <div className={`mx-4 mt-3 mb-1 p-3 rounded-xl flex items-start gap-3 ${urgentCount > 0 ? 'bg-rose-50 border border-rose-100' : 'bg-emerald-50 border border-emerald-100'}`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${urgentCount > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}>
              <i className="fas fa-wand-magic-sparkles text-white text-[9px]" />
            </div>
            <p className={`text-[10px] font-semibold leading-relaxed ${urgentCount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              <strong>IA VetGrid:</strong> {aiSummary}
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 px-4 mt-3 mb-2">
            {(['all', 'unread', 'urgent'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                  filter === f
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'unread' ? 'Não lidas' : 'Urgentes'}
              </button>
            ))}
          </div>

          {/* Notification list */}
          <div className="max-h-[340px] overflow-y-auto custom-scrollbar px-4 pb-4 space-y-2">
            {filtered.length === 0 && (
              <div className="text-center py-8 text-slate-300">
                <i className="fas fa-check-circle text-3xl mb-2 block" />
                <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma notificação</p>
              </div>
            )}
            {filtered.map(n => {
              const cfg = TYPE_CONFIG[n.type];
              return (
                <div
                  key={n.id}
                  onClick={() => handleAction(n)}
                  className={`relative flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
                    n.read ? 'bg-white border-slate-100 opacity-60' : `${cfg.bg} ${cfg.border}`
                  }`}
                >
                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: cfg.color + '18' }}
                  >
                    <i className={`fas ${cfg.icon} text-[12px]`} style={{ color: cfg.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight truncate">{n.title}</p>
                      {n.urgent && !n.read && (
                        <span className="shrink-0 text-[7px] font-black text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Urgente</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{n.message}</p>
                    <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-1">{n.time}</p>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1" />
                  )}

                  {/* Dismiss */}
                  <button
                    onClick={(e) => dismiss(n.id, e)}
                    className="absolute top-2 right-2 w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Dispensar"
                  >
                    <i className="fas fa-times text-[7px] text-slate-500" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/30">
            <button className="w-full text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
              Ver histórico completo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
