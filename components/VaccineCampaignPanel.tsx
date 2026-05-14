import React, { useState } from 'react';

interface VaccineReminder {
  id: string;
  petName: string;
  species: string;
  tutorName: string;
  phone: string;
  vaccine: string;
  dueDate: string;
  daysOverdue: number; // negative = days until due, positive = days overdue
  status: 'overdue' | 'due_today' | 'due_soon' | 'upcoming';
  lastDose?: string;
}

const MOCK_REMINDERS: VaccineReminder[] = [
  { id: '1', petName: 'Rex',   species: 'Cão',  tutorName: 'João Silva',   phone: '(11) 99001-2345', vaccine: 'Múltipla V10',    dueDate: '2026-05-05', daysOverdue: 8,   status: 'overdue',   lastDose: '2025-05-05' },
  { id: '2', petName: 'Luna',  species: 'Gato', tutorName: 'Maria Costa',  phone: '(11) 98877-6655', vaccine: 'Tríplice Felina', dueDate: '2026-05-13', daysOverdue: 0,   status: 'due_today', lastDose: '2025-05-13' },
  { id: '3', petName: 'Thor',  species: 'Cão',  tutorName: 'Carlos Melo',  phone: '(11) 97766-5544', vaccine: 'Antirrábica',    dueDate: '2026-05-20', daysOverdue: -7,  status: 'due_soon',  lastDose: '2025-05-20' },
  { id: '4', petName: 'Mia',   species: 'Gato', tutorName: 'Ana Paula',    phone: '(11) 96655-4433', vaccine: 'Leucemia Felina',dueDate: '2026-05-25', daysOverdue: -12, status: 'due_soon',  lastDose: '2025-05-25' },
  { id: '5', petName: 'Bolt',  species: 'Cão',  tutorName: 'Pedro Santos', phone: '(11) 95544-3322', vaccine: 'Múltipla V10',   dueDate: '2026-06-10', daysOverdue: -28, status: 'upcoming',  lastDose: '2025-06-10' },
  { id: '6', petName: 'Nala',  species: 'Cão',  tutorName: 'Sofia Lima',   phone: '(11) 94433-2211', vaccine: 'Giardia',        dueDate: '2026-06-15', daysOverdue: -33, status: 'upcoming',  lastDose: '2025-06-15' },
  { id: '7', petName: 'Simba', species: 'Gato', tutorName: 'Rafael Dias',  phone: '(11) 93322-1100', vaccine: 'Calicivirose',   dueDate: '2026-07-01', daysOverdue: -49, status: 'upcoming',  lastDose: '2025-07-01' },
];

const VACCINE_CAMPAIGNS = [
  { id: 'c1', name: 'Campanha Antirrábica 2026', period: '15/01 – 15/06', eligible: 60, vaccinated: 45, goal: 60, status: 'active' },
  { id: 'c2', name: 'Vacinação V10 Anual',        period: '01/01 – 31/12', eligible: 120, vaccinated: 78, goal: 100, status: 'active' },
  { id: 'c3', name: 'Tríplice Felina 2026',       period: '01/03 – 30/09', eligible: 35, vaccinated: 12, goal: 35, status: 'active' },
];

const STATUS_CONFIG = {
  overdue:   { label: 'Atrasada',    color: 'text-rose-600',   bg: 'bg-rose-50',   border: 'border-rose-200',   dot: 'bg-rose-500', pulse: true },
  due_today: { label: 'Vence hoje',  color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500', pulse: true },
  due_soon:  { label: 'Vence em breve', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-500', pulse: false },
  upcoming:  { label: 'Agendada',    color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-100',dot: 'bg-emerald-500', pulse: false },
};

export const VaccineCampaignPanel: React.FC = () => {
  const [activeView, setActiveView] = useState<'calendar' | 'campaigns'>('calendar');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'overdue' | 'due_soon' | 'upcoming'>('all');
  const [sentAlerts, setSentAlerts] = useState<Set<string>>(new Set());
  const [bulkSent, setBulkSent] = useState(false);

  const reminders = MOCK_REMINDERS.filter(r => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'overdue') return r.status === 'overdue' || r.status === 'due_today';
    if (selectedFilter === 'due_soon') return r.status === 'due_soon';
    return r.status === 'upcoming';
  });

  const overdueCount  = MOCK_REMINDERS.filter(r => r.status === 'overdue' || r.status === 'due_today').length;
  const dueSoonCount  = MOCK_REMINDERS.filter(r => r.status === 'due_soon').length;
  const upcomingCount = MOCK_REMINDERS.filter(r => r.status === 'upcoming').length;

  const sendAlert = (id: string) => setSentAlerts(prev => new Set(prev).add(id));
  const sendBulk = () => setBulkSent(true);

  return (
    <div className="space-y-5">
      {/* Sub-nav */}
      <div className="flex items-center justify-between">
        <div className="flex bg-slate-50 rounded-full p-1 border border-slate-100">
          {[
            { id: 'calendar',  label: '📅 Calendário Vacinal' },
            { id: 'campaigns', label: '💉 Campanhas Ativas' },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id as any)}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeView === v.id ? 'bg-[#FF8F00] text-white shadow' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {activeView === 'calendar' && overdueCount > 0 && (
          <button
            onClick={sendBulk}
            disabled={bulkSent}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              bulkSent
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-[#25D366] text-white hover:bg-[#1fba58] shadow-md'
            }`}
          >
            <i className={`fab fa-whatsapp text-xs ${bulkSent ? '' : ''}`} />
            {bulkSent ? `✓ ${overdueCount} lembretes enviados` : `Enviar ${overdueCount} lembretes urgentes`}
          </button>
        )}
      </div>

      {/* ===== VACCINE CALENDAR ===== */}
      {activeView === 'calendar' && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Atrasadas / Hoje',    count: overdueCount,  color: '#B71C1C', bg: 'bg-rose-50',    border: 'border-rose-100',    icon: 'fa-exclamation-circle' },
              { label: 'Vencendo em 30 dias', count: dueSoonCount,  color: '#E65100', bg: 'bg-orange-50',  border: 'border-orange-100',  icon: 'fa-clock' },
              { label: 'Próximas (31+ dias)', count: upcomingCount, color: '#1B5E20', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'fa-calendar-check' },
            ].map((s, i) => (
              <div key={i} className={`p-4 rounded-xl border ${s.bg} ${s.border} flex items-center gap-4`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.color + '18' }}>
                  <i className={`fas ${s.icon} text-sm`} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-2xl font-black" style={{ color: s.color }}>{s.count}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex bg-slate-50 rounded-full p-1 border border-slate-100 w-fit">
            {[
              { id: 'all',      label: 'Todos' },
              { id: 'overdue',  label: '🔴 Urgentes' },
              { id: 'due_soon', label: '🟡 Em breve' },
              { id: 'upcoming', label: '🟢 Agendados' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id as any)}
                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                  selectedFilter === f.id ? 'bg-[#FF8F00] text-white shadow' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Reminders table */}
          <div className="omie-table-container">
            <table className="omie-table">
              <thead>
                <tr>
                  <th>Pet / Tutor</th>
                  <th>Vacina</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                  <th>Último dose</th>
                  <th className="text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map(r => {
                  const st = STATUS_CONFIG[r.status];
                  const sent = sentAlerts.has(r.id);
                  return (
                    <tr key={r.id} className="group">
                      <td>
                        <div>
                          <p className="text-sm font-black text-[#020617] uppercase tracking-tight">
                            {r.species === 'Cão' ? '🐕' : '🐱'} {r.petName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{r.tutorName} · {r.phone}</p>
                        </div>
                      </td>
                      <td>
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{r.vaccine}</span>
                      </td>
                      <td>
                        <div>
                          <p className={`text-[11px] font-black ${st.color}`}>
                            {new Date(r.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                          <p className={`text-[9px] font-bold ${st.color} opacity-70`}>
                            {r.daysOverdue > 0
                              ? `${r.daysOverdue} dias atrasada`
                              : r.daysOverdue === 0
                              ? 'Vence hoje'
                              : `em ${Math.abs(r.daysOverdue)} dias`}
                          </p>
                        </div>
                      </td>
                      <td>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase ${st.color} ${st.bg} ${st.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${st.pulse ? 'animate-pulse' : ''}`} />
                          {st.label}
                        </div>
                      </td>
                      <td>
                        <span className="text-[10px] font-bold text-slate-400">{r.lastDose ? new Date(r.lastDose).toLocaleDateString('pt-BR') : '—'}</span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => sendAlert(r.id)}
                            disabled={sent}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                              sent
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : 'bg-[#25D366] text-white hover:bg-[#1fba58]'
                            }`}
                          >
                            <i className="fab fa-whatsapp text-[10px]" />
                            {sent ? 'Enviado ✓' : 'WhatsApp'}
                          </button>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-100 hover:bg-indigo-50 transition-all">
                            <i className="fas fa-calendar-plus text-[9px]" />
                            Agendar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="omie-table-summary">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {reminders.length} pets no calendário vacinal
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===== ACTIVE CAMPAIGNS ===== */}
      {activeView === 'campaigns' && (
        <div className="space-y-4">
          {VACCINE_CAMPAIGNS.map(camp => {
            const pct = Math.round((camp.vaccinated / camp.eligible) * 100);
            const remaining = camp.eligible - camp.vaccinated;
            return (
              <div key={camp.id} className="omie-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-black text-[#FF8F00] uppercase tracking-widest mb-1">Campanha Ativa</p>
                    <h3 className="text-base font-black text-[#020617] uppercase tracking-tight">{camp.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">📅 {camp.period}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-[#020617]">{pct}%</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">da meta alcançada</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>{camp.vaccinated} vacinados</span>
                    <span>meta: {camp.goal}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: pct >= 80 ? '#2E7D32' : pct >= 50 ? '#FF8F00' : '#B71C1C' }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-lg font-black text-rose-500">{remaining}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Elegíveis restantes</p>
                    </div>
                    <div className="w-px bg-slate-100" />
                    <div>
                      <p className="text-lg font-black text-emerald-500">{camp.vaccinated}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Já vacinados</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[9px] font-black uppercase text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all">
                      Ver Lista
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[9px] font-black uppercase bg-[#25D366] text-white hover:bg-[#1fba58] transition-all">
                      <i className="fab fa-whatsapp" />
                      Enviar {remaining} lembretes
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* New campaign CTA */}
          <div className="border-2 border-dashed border-[#FF8F00]/30 rounded-xl p-8 text-center hover:border-[#FF8F00]/60 transition-colors cursor-pointer group">
            <i className="fas fa-plus-circle text-3xl text-[#FF8F00]/30 mb-3 block group-hover:text-[#FF8F00] transition-colors" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-[#FF8F00] transition-colors">
              Criar nova campanha de vacinação
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
