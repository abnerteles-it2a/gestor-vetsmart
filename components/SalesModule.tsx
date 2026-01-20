
import React, { useState, useEffect } from 'react';
import { NewSaleModal } from './NewItemModals';
import { mockDataService } from '../services/mockDataService';

const SalesModule: React.FC = () => {
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [sales, setSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Derived state for KPIs
  const { totalSales, salesCount, ticketAverage } = React.useMemo(() => {
    const validSales = sales.filter(s => s.status === 'concluído');
    const total = validSales.reduce((acc, curr) => {
      const val = parseFloat(curr.value.replace('R$ ', '').replace('.', '').replace(',', '.'));
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
    return {
      totalSales: total,
      salesCount: validSales.length,
      ticketAverage: validSales.length ? total / validSales.length : 0
    };
  }, [sales]);

  useEffect(() => {
    const loadSales = async () => {
      setIsLoading(true);
      try {
        // Use MockDataService for Demo Mode
        const data = await mockDataService.getSales();
        const mapped = data.map((s: any) => ({
            id: s.id,
            date: s.date,
            desc: s.desc,
            value: s.value,
            payment: s.payment,
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
    setSales((prev) => [sale, ...prev]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Frente de Caixa</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Gestão de vendas, pagamentos e fluxo financeiro diário.</p>
        </div>
        <button 
          onClick={() => setShowNewSaleModal(true)}
          className="bg-green-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg shadow-green-200 hover:bg-green-700 transition-all flex items-center gap-2"
        >
          <i className="fas fa-cart-plus"></i> Nova Venda
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
           <p className="text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase mb-2">Vendas Hoje</p>
           <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
             {totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
           </h4>
           <div className="mt-4 flex items-center gap-2 text-green-500 text-xs font-bold">
              <i className="fas fa-arrow-up"></i> 15% em relação a ontem
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
           <p className="text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase mb-2">Ticket Médio</p>
           <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
             {ticketAverage.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
           </h4>
           <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-4 italic">Baseado em {salesCount} vendas</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
           <div>
               <p className="text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase mb-2">Status do Caixa</p>
               <h4 className="text-lg font-bold text-green-600">ABERTO</h4>
           </div>
           <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold">Fechar Caixa</button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Últimas Transações</h4>
            <div className="flex gap-2">
                <button className="text-sm text-blue-600 font-bold px-3 py-1">Hoje</button>
                <button className="text-sm text-slate-500 dark:text-slate-500 px-3 py-1">Ontem</button>
            </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">ID / Data</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Forma Pagto</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {sales.map((sale: any, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/70 transition-all">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">#{sale.id}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-500">{sale.date}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{sale.desc}</td>
                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">{sale.value}</td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                   <div className="flex items-center gap-2">
                      <i className={`fas ${sale.payment === 'Pix' ? 'fa-qrcode' : 'fa-credit-card'} text-slate-500 dark:text-slate-500`}></i>
                      {sale.payment}
                   </div>
                </td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    sale.status === 'concluído'
                      ? 'bg-green-50 text-green-600 dark:bg-green-500/20 dark:text-green-300'
                      : 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-300'
                   }`}>
                    {sale.status}
                   </span>
                </td>
                <td className="px-6 py-4 text-right">
                    <button className="text-slate-500 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 px-2"><i className="fas fa-print"></i></button>
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
    </div>
  );
};

export default SalesModule;
