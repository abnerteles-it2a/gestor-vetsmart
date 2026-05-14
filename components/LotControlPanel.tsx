import React, { useState } from 'react';

interface Lot {
  id: string;
  productName: string;
  category: string;
  lotNumber: string;
  quantity: number;
  expirationDate: string;
  supplier: string;
  entryDate: string;
}

const MOCK_LOTS: Lot[] = [
  { id: '1', productName: 'Vacina V10', category: 'Vacinas', lotNumber: 'VAC-2024-A123', quantity: 45, expirationDate: '2026-06-15', supplier: 'Zoetis', entryDate: '2026-01-10' },
  { id: '2', productName: 'Bravecto Gatos', category: 'Fármacos', lotNumber: 'BRV-2024-B456', quantity: 8, expirationDate: '2026-06-01', supplier: 'MSD', entryDate: '2026-01-05' },
  { id: '3', productName: 'Amoxicilina 500mg', category: 'Antibióticos', lotNumber: 'AMX-2024-C789', quantity: 120, expirationDate: '2026-07-20', supplier: 'Chemitec', entryDate: '2025-12-20' },
  { id: '4', productName: 'Dipirona Sódica', category: 'Analgésicos', lotNumber: 'DIP-2024-D012', quantity: 60, expirationDate: '2026-05-30', supplier: 'Pharma', entryDate: '2025-11-15' },
  { id: '5', productName: 'Ração Royal Canin', category: 'Nutrição', lotNumber: 'RC-2024-E345', quantity: 24, expirationDate: '2026-12-10', supplier: 'Royal Canin', entryDate: '2026-02-01' },
  { id: '6', productName: 'Vacina Antirrábica', category: 'Vacinas', lotNumber: 'RAB-2023-F678', quantity: 15, expirationDate: '2026-05-20', supplier: 'Zoetis', entryDate: '2025-10-10' },
  { id: '7', productName: 'Tramadol 50mg', category: 'Controlados', lotNumber: 'TRM-2024-G901', quantity: 30, expirationDate: '2027-03-15', supplier: 'União Química', entryDate: '2026-01-20' },
];

const getDaysUntilExpiry = (dateStr: string) => {
  const today = new Date();
  const exp = new Date(dateStr);
  return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const getExpiryStatus = (days: number) => {
  if (days <= 0)  return { label: 'Vencido',   color: 'text-rose-600',   bg: 'bg-rose-50',   border: 'border-rose-200',   dot: 'bg-rose-500' };
  if (days <= 30) return { label: 'Crítico',   color: 'text-rose-500',   bg: 'bg-rose-50',   border: 'border-rose-100',   dot: 'bg-rose-500' };
  if (days <= 60) return { label: 'Atenção',   color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', dot: 'bg-orange-400' };
  if (days <= 90) return { label: 'Alerta',    color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100', dot: 'bg-yellow-400' };
  return           { label: 'Saudável',         color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-100',dot: 'bg-emerald-500' };
};

interface LotControlPanelProps {
  onClose: () => void;
}

export const LotControlPanel: React.FC<LotControlPanelProps> = ({ onClose }) => {
  const [lots] = useState<Lot[]>(MOCK_LOTS);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'ok'>('all');
  const [search, setSearch] = useState('');
  const [showAddLot, setShowAddLot] = useState(false);
  const [newLot, setNewLot] = useState({ productName: '', lotNumber: '', quantity: '', expirationDate: '', supplier: '' });

  const filtered = lots.filter(lot => {
    const days = getDaysUntilExpiry(lot.expirationDate);
    const matchSearch = lot.productName.toLowerCase().includes(search.toLowerCase()) ||
      lot.lotNumber.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'critical') return days <= 30;
    if (filter === 'warning')  return days > 30 && days <= 90;
    if (filter === 'ok')       return days > 90;
    return true;
  });

  const criticalCount = lots.filter(l => getDaysUntilExpiry(l.expirationDate) <= 30).length;
  const warningCount  = lots.filter(l => { const d = getDaysUntilExpiry(l.expirationDate); return d > 30 && d <= 90; }).length;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col animate-portal-enter">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
              <i className="fas fa-box-open text-cyan-600 text-sm" />
            </div>
            <div>
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Controle de Lotes & Validade</h2>
              <p className="text-[10px] text-slate-400">Rastreabilidade completa — FEFO ativo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddLot(v => !v)}
              className="omie-btn-primary !px-5 !py-2 flex items-center gap-2"
            >
              <i className="fas fa-plus text-xs" /> Novo Lote
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
              <i className="fas fa-times text-slate-500 text-xs" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6 space-y-5">

          {/* Alert summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Vencendo em 30 dias', count: criticalCount, icon: 'fa-exclamation-triangle', color: '#B71C1C', bg: 'bg-rose-50', border: 'border-rose-100' },
              { label: 'Alerta (31–90 dias)',  count: warningCount,  icon: 'fa-clock',                 color: '#E65100', bg: 'bg-orange-50', border: 'border-orange-100' },
              { label: 'Saudável (90+ dias)',  count: lots.length - criticalCount - warningCount, icon: 'fa-check-circle', color: '#1B5E20', bg: 'bg-emerald-50', border: 'border-emerald-100' },
            ].map((s, i) => (
              <div key={i} className={`p-4 rounded-xl border ${s.bg} ${s.border} flex items-center gap-4`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.color + '18' }}>
                  <i className={`fas ${s.icon} text-sm`} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-2xl font-black" style={{ color: s.color }}>{s.count}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add lot form */}
          {showAddLot && (
            <div className="p-5 rounded-xl border border-cyan-100 bg-cyan-50/30 space-y-3">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Registrar Novo Lote</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="omie-label">Produto</label>
                  <input value={newLot.productName} onChange={e => setNewLot(p => ({...p, productName: e.target.value}))} placeholder="Nome do produto" className="omie-input !text-sm" />
                </div>
                <div>
                  <label className="omie-label">Nº do Lote</label>
                  <input value={newLot.lotNumber} onChange={e => setNewLot(p => ({...p, lotNumber: e.target.value}))} placeholder="Ex: VAC-2026-A001" className="omie-input !text-sm" />
                </div>
                <div>
                  <label className="omie-label">Quantidade</label>
                  <input type="number" value={newLot.quantity} onChange={e => setNewLot(p => ({...p, quantity: e.target.value}))} placeholder="Unidades" className="omie-input !text-sm" />
                </div>
                <div>
                  <label className="omie-label">Validade</label>
                  <input type="date" value={newLot.expirationDate} onChange={e => setNewLot(p => ({...p, expirationDate: e.target.value}))} className="omie-input !text-sm" />
                </div>
                <div>
                  <label className="omie-label">Fornecedor</label>
                  <input value={newLot.supplier} onChange={e => setNewLot(p => ({...p, supplier: e.target.value}))} placeholder="Nome do fornecedor" className="omie-input !text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setShowAddLot(false)} className="omie-btn-secondary !px-5 !py-2">Cancelar</button>
                <button className="omie-btn-primary !px-5 !py-2 flex items-center gap-2">
                  <i className="fas fa-save text-xs" /> Registrar Lote
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar produto ou lote..."
                className="omie-input !pl-10 !py-2 !text-sm"
              />
            </div>
            <div className="flex bg-slate-50 rounded-full p-1 border border-slate-100">
              {([
                { id: 'all',      label: 'Todos' },
                { id: 'critical', label: '🔴 Críticos' },
                { id: 'warning',  label: '🟠 Atenção' },
                { id: 'ok',       label: '🟢 OK' },
              ] as const).map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                    filter === f.id ? 'bg-[#0097A7] text-white shadow' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lots table */}
          <div className="omie-table-container">
            <table className="omie-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Nº Lote</th>
                  <th>Fornecedor</th>
                  <th className="text-center">Qtd.</th>
                  <th>Validade</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(lot => {
                  const days = getDaysUntilExpiry(lot.expirationDate);
                  const st = getExpiryStatus(days);
                  return (
                    <tr key={lot.id} className={`group ${days <= 30 ? 'bg-rose-50/30' : ''}`}>
                      <td>
                        <div>
                          <p className="text-sm font-black text-[#020617] uppercase tracking-tight">{lot.productName}</p>
                          <p className="text-[9px] text-slate-300 font-bold uppercase">{lot.category}</p>
                        </div>
                      </td>
                      <td>
                        <code className="text-[10px] font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-slate-500">{lot.lotNumber}</code>
                      </td>
                      <td>
                        <span className="text-[11px] font-bold text-slate-500">{lot.supplier}</span>
                      </td>
                      <td className="text-center">
                        <span className="text-sm font-black text-[#020617]">{lot.quantity}</span>
                      </td>
                      <td>
                        <div>
                          <p className={`text-[11px] font-black uppercase ${st.color}`}>
                            {new Date(lot.expirationDate).toLocaleDateString('pt-BR')}
                          </p>
                          <p className={`text-[9px] font-bold ${st.color} opacity-70`}>
                            {days <= 0 ? 'Vencido' : `${days} dias restantes`}
                          </p>
                        </div>
                      </td>
                      <td>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${st.color} ${st.bg} ${st.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${days <= 30 ? 'animate-pulse' : ''}`} />
                          {st.label}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {days <= 90 && (
                            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black text-orange-600 border border-orange-100 hover:bg-orange-50 transition-all">
                              <i className="fab fa-whatsapp text-[10px]" />Alertar
                            </button>
                          )}
                          <button className="w-7 h-7 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 hover:text-[#0097A7] hover:border-[#0097A7] transition-all">
                            <i className="fas fa-edit text-[9px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <i className="fas fa-boxes-stacked text-4xl text-slate-100 mb-3 block" />
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhum lote encontrado</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="omie-table-summary">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {filtered.length} lote{filtered.length !== 1 ? 's' : ''} · Princípio FEFO ativo
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
