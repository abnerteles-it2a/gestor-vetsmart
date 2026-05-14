
import React, { useState, useEffect } from 'react';
import { NewSaleModal } from './NewItemModals';
import { KpiCard } from './KpiCard';
import { apiService } from '../services/api';
import { QuotesPanel } from './QuotesPanel';

const MODULE_COLOR = '#E65100';

const SalesModule: React.FC = () => {
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [sales, setSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'sales' | 'quotes'>('sales');

  const { totalSales, salesCount, ticketAverage } = React.useMemo(() => {
    const validSales = sales.filter(s => s.status === 'concluido' || s.status === 'concluído');
    const total = validSales.reduce((acc, curr) => {
      let val = 0;
      if (typeof curr.value === 'number') {
        val = curr.value;
      } else if (typeof curr.value === 'string') {
        val = parseFloat(curr.value.replace('R$ ', '').replace('.', '').replace(',', '.'));
      }
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
    return {
      totalSales: total,
      salesCount: validSales.length,
      ticketAverage: validSales.length ? total / validSales.length : 0
    };
  }, [sales]);

  useEffect(() => {
    if ((window as any).__setModuleBreadcrumb) {
      (window as any).__setModuleBreadcrumb(activeSection === 'quotes' ? 'Orçamentos' : 'Caixa');
    }
    const loadSales = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getSales();
        const data = response.data;
        const mapped = data.map((s: any) => ({
            id: s.id,
            date: new Date(s.sale_date).toLocaleDateString('pt-BR') + ' ' + new Date(s.sale_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            desc: `Venda #${s.id}`,
            value: parseFloat(s.total_amount),
            payment: s.payment_method,
            status: s.status
        }));
        setSales(mapped);
      } catch (e) {
        console.error('Failed to load sales', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSales();
  }, []);

  const handleNewSaleSaved = (sale: any) => {
    const mappedSale = {
        id: sale.id,
        date: new Date(sale.sale_date || new Date()).toLocaleDateString('pt-BR') + ' ' + new Date(sale.sale_date || new Date()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        desc: `Venda #${sale.id}`,
        value: parseFloat(sale.total_amount),
        payment: sale.payment_method,
        status: sale.status
    };
    setSales((prev) => [mappedSale, ...prev]);
  };

  return (
    <div className="flex flex-col gap-6 animate-portal-enter pb-10">
      
      {/* Module Header */}
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Ponto de Venda & Checkout</h1>
          <p className="text-2xl font-black text-[#020617] uppercase tracking-tight">Frente de Caixa</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowNewSaleModal(true)}
            className="omie-btn-primary"
          >
            <i className="fas fa-cart-plus mr-2"></i> Nova Venda
          </button>
        </div>
      </div>

      {/* Section switcher */}
      <div className="flex bg-slate-100 rounded-xl p-1 w-fit">
        {[
          { id: 'sales',  label: '💳 Frente de Caixa' },
          { id: 'quotes', label: '📄 Orçamentos' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id as any)}
            className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              activeSection === s.id
                ? 'bg-white text-[#E65100] shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'quotes' ? (
        <QuotesPanel />
      ) : (
        <>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard 
          title="Faturamento Diário" 
          value={totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={<i className="fas fa-cash-register"></i>}
          subtext={`${salesCount} vendas concluídas`}
          subtextColor="text-emerald-500"
          color={MODULE_COLOR}
        />
        <KpiCard 
          title="Ticket Médio" 
          value={ticketAverage.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={<i className="fas fa-receipt"></i>}
          subtext="Por transação"
          subtextColor="text-slate-400"
          color={MODULE_COLOR}
        />
        <div className="omie-card !p-5 bg-[#020617] flex items-center justify-between text-white border-none shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
           <div className="z-10">
               <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1 block">Status do PDV</span>
               <h4 className="text-xl font-black text-emerald-400 uppercase tracking-tight">Caixa Aberto</h4>
           </div>
           <button className="z-10 omie-btn-secondary !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 !px-8 !py-2 !text-[9px]">Fechar</button>
        </div>
      </div>

      {/* Main Table */}
      <div className="omie-table-container">
        <div className="omie-card-header !bg-slate-50/50">
           <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Histórico de Transações</h3>
        </div>
        <table className="omie-table">
          <thead>
            <tr>
              <th>Cupom / Data</th>
              <th>Itens / Descrição</th>
              <th>Total</th>
              <th>Pagamento</th>
              <th>Status</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale: any, idx) => (
              <tr key={idx} className="group">
                <td>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-[#020617] uppercase tracking-tight group-hover:text-[#FF9F1C]">#{sale.id}</span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase">{sale.date}</span>
                  </div>
                </td>
                <td>
                   <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{sale.desc}</span>
                </td>
                <td>
                   <span className="text-sm font-black text-[#020617] uppercase tracking-tight">
                    {sale.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                   </span>
                </td>
                <td>
                   <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                         <i className={`fas ${sale.payment === 'Pix' ? 'fa-qrcode' : 'fa-credit-card'} text-[10px]`}></i>
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{sale.payment}</span>
                   </div>
                </td>
                <td>
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200">
                         <div className={`w-full h-full rounded-full animate-ping ${(sale.status === 'concluído' || sale.status === 'concluido') ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${(sale.status === 'concluído' || sale.status === 'concluido') ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {sale.status}
                      </span>
                   </div>
                </td>
                <td className="text-right">
                    <button className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 hover:text-[#FF9F1C] hover:border-[#FF9F1C] transition-all">
                       <i className="fas fa-print text-[10px]"></i>
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NewSaleModal
        isOpen={showNewSaleModal}
        onClose={() => setShowNewSaleModal(false)}
        onSaved={handleNewSaleSaved}
      />
      </>
      )}
    </div>
  );
};

export default SalesModule;
