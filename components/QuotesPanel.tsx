import React, { useState } from 'react';

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Quote {
  id: string;
  petName: string;
  tutorName: string;
  phone: string;
  title: string;
  items: QuoteItem[];
  discount: number;
  notes: string;
  validUntil: string;
  createdAt: string;
  status: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected';
}

const MOCK_QUOTES: Quote[] = [
  {
    id: 'ORC-001', petName: 'Rex', tutorName: 'João Silva', phone: '(11) 99001-2345',
    title: 'Castração + Pós-Operatório',
    items: [
      { id: '1', description: 'Castração cirúrgica', quantity: 1, unitPrice: 850 },
      { id: '2', description: 'Anestesia inalatória', quantity: 1, unitPrice: 250 },
      { id: '3', description: 'Antibiótico pós-op (7d)', quantity: 1, unitPrice: 80 },
    ],
    discount: 5, notes: 'Jejum de 12h obrigatório.', validUntil: '2026-05-25',
    createdAt: '2026-05-10', status: 'sent',
  },
  {
    id: 'ORC-002', petName: 'Luna', tutorName: 'Maria Costa', phone: '(11) 98877-6655',
    title: 'Check-up Completo + Vacinas',
    items: [
      { id: '1', description: 'Consulta clínica geral', quantity: 1, unitPrice: 180 },
      { id: '2', description: 'Hemograma completo', quantity: 1, unitPrice: 120 },
      { id: '3', description: 'Vacina Tríplice Felina', quantity: 1, unitPrice: 95 },
    ],
    discount: 0, notes: '', validUntil: '2026-05-20',
    createdAt: '2026-05-08', status: 'approved',
  },
  {
    id: 'ORC-003', petName: 'Thor', tutorName: 'Carlos Melo', phone: '(11) 97766-5544',
    title: 'Limpeza de Tártaro',
    items: [
      { id: '1', description: 'Tartarectomia', quantity: 1, unitPrice: 420 },
      { id: '2', description: 'Anestesia', quantity: 1, unitPrice: 200 },
    ],
    discount: 10, notes: 'Inclui radiografia dental.', validUntil: '2026-05-18',
    createdAt: '2026-05-05', status: 'rejected',
  },
  {
    id: 'ORC-004', petName: 'Mia', tutorName: 'Ana Paula', phone: '(11) 96655-4433',
    title: 'Plano Filhote Completo',
    items: [
      { id: '1', description: 'Vacinas V3+V4 (3 doses)', quantity: 3, unitPrice: 85 },
      { id: '2', description: 'Vermifugação', quantity: 2, unitPrice: 35 },
      { id: '3', description: 'Consultas de acompanhamento', quantity: 3, unitPrice: 150 },
    ],
    discount: 15, notes: 'Combo filhote com desconto especial.', validUntil: '2026-06-10',
    createdAt: '2026-05-12', status: 'draft',
  },
];

const STATUS_CONFIG = {
  draft:    { label: 'Rascunho',   color: 'text-slate-400',   bg: 'bg-slate-50',   border: 'border-slate-100',   dot: 'bg-slate-300' },
  sent:     { label: 'Enviado',    color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100',    dot: 'bg-blue-400' },
  viewed:   { label: 'Visualizado',color: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-100',  dot: 'bg-indigo-400' },
  approved: { label: 'Aprovado',   color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', dot: 'bg-emerald-500' },
  rejected: { label: 'Recusado',   color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-100',    dot: 'bg-rose-500' },
};

const SERVICES_CATALOG = [
  { description: 'Consulta clínica geral', unitPrice: 180 },
  { description: 'Consulta de retorno', unitPrice: 90 },
  { description: 'Castração cirúrgica (Cão)', unitPrice: 850 },
  { description: 'Castração cirúrgica (Gato)', unitPrice: 550 },
  { description: 'Anestesia inalatória', unitPrice: 250 },
  { description: 'Tartarectomia', unitPrice: 420 },
  { description: 'Hemograma completo', unitPrice: 120 },
  { description: 'Ultrassom abdominal', unitPrice: 280 },
  { description: 'Raio-X digital', unitPrice: 160 },
  { description: 'Vacina V10', unitPrice: 98 },
  { description: 'Vacina Antirrábica', unitPrice: 65 },
  { description: 'Vacina Tríplice Felina', unitPrice: 95 },
  { description: 'Vermifugação', unitPrice: 35 },
  { description: 'Banho e Tosa', unitPrice: 75 },
  { description: 'Internação diária', unitPrice: 180 },
];

const calcTotal = (items: QuoteItem[], discount: number) => {
  const sub = items.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
  return sub - (sub * discount) / 100;
};

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const QuotesPanel: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>(MOCK_QUOTES);
  const [filter, setFilter] = useState<'all' | Quote['status']>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  // New quote form state
  const [form, setForm] = useState({
    petName: '', tutorName: '', phone: '', title: '', discount: 0, notes: '', validUntil: '',
  });
  const [items, setItems] = useState<QuoteItem[]>([{ id: '1', description: '', quantity: 1, unitPrice: 0 }]);

  const filtered = quotes.filter(q => filter === 'all' || q.status === filter);

  const addItem = () => setItems(p => [...p, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (id: string) => setItems(p => p.filter(i => i.id !== id));
  const updateItem = (id: string, field: keyof QuoteItem, value: any) =>
    setItems(p => p.map(i => i.id === id ? { ...i, [field]: value } : i));

  const selectCatalog = (idx: number, svc: typeof SERVICES_CATALOG[0]) =>
    setItems(p => p.map((i, n) => n === idx ? { ...i, description: svc.description, unitPrice: svc.unitPrice } : i));

  const saveQuote = () => {
    const newQ: Quote = {
      id: `ORC-${String(quotes.length + 1).padStart(3, '0')}`,
      ...form,
      items,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      status: 'draft',
    };
    setQuotes(p => [newQ, ...p]);
    setShowForm(false);
    setForm({ petName: '', tutorName: '', phone: '', title: '', discount: 0, notes: '', validUntil: '' });
    setItems([{ id: '1', description: '', quantity: 1, unitPrice: 0 }]);
  };

  const subtotal = items.reduce((a, i) => a + i.quantity * i.unitPrice, 0);
  const total = subtotal - (subtotal * (form.discount || 0)) / 100;

  const approvedTotal = quotes.filter(q => q.status === 'approved')
    .reduce((a, q) => a + calcTotal(q.items, q.discount), 0);
  const pendingCount = quotes.filter(q => q.status === 'sent' || q.status === 'viewed').length;
  const convRate = Math.round((quotes.filter(q => q.status === 'approved').length / quotes.length) * 100);

  return (
    <div className="space-y-5">

      {/* KPI summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Receita Aprovada', value: fmt(approvedTotal), icon: 'fa-check-circle', color: '#1B5E20', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Aguardando Resposta', value: `${pendingCount} orçamentos`, icon: 'fa-clock', color: '#E65100', bg: 'bg-orange-50', border: 'border-orange-100' },
          { label: 'Taxa de Conversão', value: `${convRate}%`, icon: 'fa-chart-pie', color: '#1565C0', bg: 'bg-blue-50', border: 'border-blue-100' },
        ].map((s, i) => (
          <div key={i} className={`p-4 rounded-xl border ${s.bg} ${s.border} flex items-center gap-4`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.color + '18' }}>
              <i className={`fas ${s.icon} text-sm`} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex bg-slate-50 rounded-full p-1 border border-slate-100">
          {(['all', 'draft', 'sent', 'approved', 'rejected'] as const).map(s => {
            const cfg = s === 'all' ? null : STATUS_CONFIG[s];
            return (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                  filter === s ? 'bg-[#E65100] text-white shadow' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {s === 'all' ? 'Todos' : cfg!.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="omie-btn-primary flex items-center gap-2"
        >
          <i className="fas fa-plus text-xs" /> Novo Orçamento
        </button>
      </div>

      {/* New quote form */}
      {showForm && (
        <div className="omie-card p-6 border-2 border-[#E65100]/20 space-y-5">
          <p className="text-[10px] font-black text-[#E65100] uppercase tracking-widest">Novo Orçamento</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { field: 'petName', label: 'Pet', placeholder: 'Nome do pet' },
              { field: 'tutorName', label: 'Tutor', placeholder: 'Nome do tutor' },
              { field: 'phone', label: 'Telefone', placeholder: '(11) 9...' },
              { field: 'title', label: 'Título do orçamento', placeholder: 'Ex: Castração + pós-op' },
            ].map(f => (
              <div key={f.field}>
                <label className="omie-label">{f.label}</label>
                <input
                  value={(form as any)[f.field]}
                  onChange={e => setForm(p => ({ ...p, [f.field]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="omie-input !text-sm"
                />
              </div>
            ))}
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="omie-label mb-0">Serviços / Produtos</label>
              <button onClick={addItem} className="text-[9px] font-black text-[#E65100] uppercase tracking-widest hover:underline flex items-center gap-1">
                <i className="fas fa-plus text-[8px]" /> Adicionar linha
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="flex gap-2 items-center">
                  {/* Catalog dropdown */}
                  <div className="relative flex-1">
                    <input
                      value={item.description}
                      onChange={e => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Descrição do serviço..."
                      className="omie-input !text-sm w-full"
                      list={`catalog-${item.id}`}
                    />
                    <datalist id={`catalog-${item.id}`}>
                      {SERVICES_CATALOG.map(s => (
                        <option key={s.description} value={s.description} />
                      ))}
                    </datalist>
                  </div>
                  <input
                    type="number" min="1"
                    value={item.quantity}
                    onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                    className="omie-input !text-sm !w-20 text-center"
                    placeholder="Qtd"
                  />
                  <input
                    type="number" min="0"
                    value={item.unitPrice}
                    onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="omie-input !text-sm !w-32"
                    placeholder="Valor unit."
                  />
                  <span className="text-[11px] font-black text-slate-600 w-24 text-right shrink-0">
                    {fmt(item.quantity * item.unitPrice)}
                  </span>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 hover:bg-rose-100 transition-all shrink-0">
                      <i className="fas fa-trash text-[8px]" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals + extras */}
          <div className="flex items-end justify-between gap-4">
            <div className="grid grid-cols-3 gap-3 flex-1">
              <div>
                <label className="omie-label">Desconto (%)</label>
                <input type="number" min="0" max="100"
                  value={form.discount}
                  onChange={e => setForm(p => ({ ...p, discount: parseFloat(e.target.value) || 0 }))}
                  className="omie-input !text-sm"
                />
              </div>
              <div>
                <label className="omie-label">Válido até</label>
                <input type="date"
                  value={form.validUntil}
                  onChange={e => setForm(p => ({ ...p, validUntil: e.target.value }))}
                  className="omie-input !text-sm"
                />
              </div>
              <div>
                <label className="omie-label">Observações</label>
                <input
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Instruções, condições..."
                  className="omie-input !text-sm"
                />
              </div>
            </div>

            {/* Total box */}
            <div className="bg-[#E65100]/5 border border-[#E65100]/20 rounded-xl p-4 min-w-[200px] text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subtotal</p>
              <p className="text-sm font-bold text-slate-600">{fmt(subtotal)}</p>
              {form.discount > 0 && (
                <>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Desconto ({form.discount}%)</p>
                  <p className="text-sm font-bold text-rose-500">- {fmt(subtotal * form.discount / 100)}</p>
                </>
              )}
              <div className="border-t border-[#E65100]/20 mt-2 pt-2">
                <p className="text-[9px] font-black text-[#E65100] uppercase tracking-widest">Total</p>
                <p className="text-xl font-black text-[#E65100]">{fmt(total)}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="omie-btn-secondary">Cancelar</button>
            <button onClick={saveQuote} className="omie-btn-primary flex items-center gap-2">
              <i className="fas fa-save text-xs" /> Salvar Orçamento
            </button>
          </div>
        </div>
      )}

      {/* Quotes table */}
      <div className="omie-table-container">
        <table className="omie-table">
          <thead>
            <tr>
              <th>Orçamento</th>
              <th>Pet / Tutor</th>
              <th>Serviços</th>
              <th>Total</th>
              <th>Validade</th>
              <th>Status</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(q => {
              const st = STATUS_CONFIG[q.status];
              const qTotal = calcTotal(q.items, q.discount);
              return (
                <tr key={q.id} className="group cursor-pointer hover:bg-slate-50/50" onClick={() => setSelectedQuote(q)}>
                  <td>
                    <div>
                      <p className="text-sm font-black text-[#020617] uppercase">{q.id}</p>
                      <p className="text-[9px] text-slate-300 font-bold uppercase">{q.createdAt}</p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="text-[11px] font-black text-slate-700 uppercase">{q.petName}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{q.tutorName}</p>
                    </div>
                  </td>
                  <td>
                    <p className="text-[11px] font-bold text-slate-600 truncate max-w-[200px]">{q.title}</p>
                    <p className="text-[9px] text-slate-300 font-bold uppercase">{q.items.length} itens</p>
                  </td>
                  <td>
                    <p className="text-sm font-black text-[#E65100]">{fmt(qTotal)}</p>
                    {q.discount > 0 && <p className="text-[9px] text-emerald-500 font-bold">{q.discount}% desc.</p>}
                  </td>
                  <td>
                    <p className="text-[10px] font-bold text-slate-500">
                      {q.validUntil ? new Date(q.validUntil).toLocaleDateString('pt-BR') : '—'}
                    </p>
                  </td>
                  <td>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase ${st.color} ${st.bg} ${st.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </div>
                  </td>
                  <td className="text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black text-emerald-600 border border-emerald-100 hover:bg-emerald-50 transition-all">
                        <i className="fab fa-whatsapp text-[10px]" />Enviar
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black text-indigo-600 border border-indigo-100 hover:bg-indigo-50 transition-all">
                        <i className="fas fa-file-pdf text-[10px]" />PDF
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-16">
                  <i className="fas fa-file-invoice-dollar text-4xl text-slate-100 mb-3 block" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhum orçamento encontrado</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="omie-table-summary">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {filtered.length} orçamento{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Detail modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-4" onClick={() => setSelectedQuote(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-portal-enter" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-black text-[#E65100] uppercase tracking-widest">{selectedQuote.id}</p>
                <h3 className="text-base font-black text-[#020617] uppercase tracking-tight">{selectedQuote.title}</h3>
                <p className="text-[10px] text-slate-400">{selectedQuote.petName} · {selectedQuote.tutorName} · {selectedQuote.phone}</p>
              </div>
              <button onClick={() => setSelectedQuote(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <i className="fas fa-times text-slate-500 text-xs" />
              </button>
            </div>
            <div className="p-7 space-y-4">
              {/* Items list */}
              <table className="omie-table">
                <thead>
                  <tr><th>Serviço</th><th className="text-center">Qtd</th><th className="text-right">Unit.</th><th className="text-right">Total</th></tr>
                </thead>
                <tbody>
                  {selectedQuote.items.map(i => (
                    <tr key={i.id}>
                      <td className="!py-2">{i.description}</td>
                      <td className="!py-2 text-center">{i.quantity}</td>
                      <td className="!py-2 text-right">{fmt(i.unitPrice)}</td>
                      <td className="!py-2 text-right font-black">{fmt(i.quantity * i.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end">
                <div className="text-right space-y-1">
                  {selectedQuote.discount > 0 && <p className="text-[10px] text-emerald-500 font-bold">Desconto: {selectedQuote.discount}%</p>}
                  <p className="text-xl font-black text-[#E65100]">{fmt(calcTotal(selectedQuote.items, selectedQuote.discount))}</p>
                </div>
              </div>
              {selectedQuote.notes && <p className="text-[11px] text-slate-500 italic border-t border-slate-100 pt-3">"{selectedQuote.notes}"</p>}
            </div>
            <div className="px-7 py-4 border-t border-slate-100 bg-slate-50/30 flex justify-between">
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[9px] font-black text-emerald-600 border border-emerald-200 hover:bg-emerald-50">
                  <i className="fab fa-whatsapp" />Enviar WhatsApp
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[9px] font-black text-indigo-600 border border-indigo-200 hover:bg-indigo-50">
                  <i className="fas fa-file-pdf" />Gerar PDF
                </button>
              </div>
              {selectedQuote.status === 'sent' || selectedQuote.status === 'viewed' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setQuotes(p => p.map(q => q.id === selectedQuote.id ? { ...q, status: 'rejected' } : q)); setSelectedQuote(null); }}
                    className="px-4 py-2 rounded-lg text-[9px] font-black text-rose-600 border border-rose-200 hover:bg-rose-50"
                  >Recusar</button>
                  <button
                    onClick={() => { setQuotes(p => p.map(q => q.id === selectedQuote.id ? { ...q, status: 'approved' } : q)); setSelectedQuote(null); }}
                    className="omie-btn-primary !py-2"
                  >Aprovar Orçamento</button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
