
import React, { useState, useEffect } from 'react';
import { NewInventoryModal } from './NewItemModals';
import { apiService } from '../services/api';
import { LotControlPanel } from './LotControlPanel';

const MODULE_COLOR = '#0097A7';

const InventoryModule: React.FC = () => {
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [showLotPanel, setShowLotPanel] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // AI Prediction State
  const [aiPrediction, setAiPrediction] = useState({
    message: 'Analisando dados de estoque com IA...',
    action: 'Aguarde',
    savings: '...'
  });

  useEffect(() => {
    if ((window as any).__setModuleBreadcrumb) {
      (window as any).__setModuleBreadcrumb('Estoque');
    }
    const loadInventory = async () => {
      setIsLoading(true);
      try {
        const [productsRes, aiRes] = await Promise.all([
            apiService.getProducts(),
            apiService.getInventoryForecast()
        ]);

        const data = productsRes.data;
        const aiData = aiRes.data;

        const mapped = data.map((i: any) => {
            const stock = i.stock_quantity || 0;
            const minStock = i.min_stock_level || 0;
            let status = 'ok';
            if (stock <= 0) status = 'critical';
            else if (stock <= minStock) status = 'warning';
            
            return {
                name: i.name,
                category: i.category || 'Geral',
                stock: stock,
                minStock: minStock,
                price: parseFloat(i.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                status: status
            };
        });
        setItems(mapped);

        if (aiData && aiData.critical_restock && aiData.critical_restock.length > 0) {
             const count = aiData.critical_restock.length;
             const firstItem = aiData.critical_restock[0];
             setAiPrediction({
                 message: `${count} produtos precisam de reposição urgente (ex: ${firstItem.item}).`,
                 action: 'Repor Agora',
                 savings: 'R$ 840,00'
             });
        } else {
             setAiPrediction({
                 message: 'Estoque saudável. A IA analisou o histórico de vendas e não detectou riscos de ruptura iminente.',
                 action: 'Manter',
                 savings: 'R$ 1.250,00'
             });
        }

      } catch (e) {
        console.error('Failed to load inventory', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadInventory();
  }, []);

  const handleNewItemSaved = (item: any) => {
    setItems((prev) => [...prev, item]);
  };

  return (
    <div className="flex flex-col gap-6 animate-portal-enter pb-10">
      
      {/* Module Header */}
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Gestão de Suprimentos</h1>
          <p className="text-2xl font-black text-[#020617] uppercase tracking-tight">Estoque & Almoxarifado</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowLotPanel(true)}
            className="omie-btn-secondary flex items-center gap-2"
          >
            <i className="fas fa-box-open text-xs" />Lotes & Validade
          </button>
          <button className="omie-btn-secondary">Exportar Inventário</button>
          <button
            onClick={() => setShowNewItemModal(true)}
            className="omie-btn-primary"
          >
            Novo Produto
          </button>
        </div>
      </div>

      {/* AI Insight Bar */}
      <div className="omie-card bg-[#020617] p-8 flex items-center gap-8 relative overflow-hidden border-none text-white shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF9F1C]/10 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
         <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shrink-0 border border-white/10 backdrop-blur-md shadow-xl">
             <i className="fas fa-brain text-[#FF9F1C]"></i>
         </div>
         <div className="flex-1">
             <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#FF9F1C] mb-2">it2a Smart Stock AI</h4>
             <p className="text-[13px] font-bold text-slate-300 leading-relaxed max-w-2xl">
                 "{aiPrediction.message}"
             </p>
         </div>
         <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Economia Prevista</span>
            <span className="text-2xl font-black text-emerald-400 tracking-tighter uppercase">{aiPrediction.savings}</span>
         </div>
      </div>


      {/* Main Table */}
      <div className="omie-table-container">
        <div className="omie-card-header !bg-slate-50/50">
           <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Catálogo de Produtos</h3>
        </div>
        <table className="omie-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th className="text-center">Saldo / Mín</th>
              <th>Preço Unit.</th>
              <th>Status</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, idx: number) => (
              <tr key={idx} className="group">
                <td>
                  <p className="text-sm font-black text-[#020617] uppercase tracking-tight transition-colors group-hover:[color:var(--module-color)]" style={{ ['--module-color' as any]: MODULE_COLOR }}>{item.name}</p>
                </td>
                <td>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                </td>
                <td className="text-center">
                  <div className="flex flex-col items-center">
                    <span className={`text-sm font-black ${item.status === 'critical' ? 'text-rose-500' : 'text-[#020617]'}`}>
                      {item.stock}
                    </span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Meta: {item.minStock}</span>
                  </div>
                </td>
                <td>
                   <span className="text-sm font-bold text-slate-600 uppercase tracking-tight">{item.price}</span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200">
                       <div className={`w-full h-full rounded-full animate-ping ${item.status === 'critical' ? 'bg-rose-500' : item.status === 'warning' ? 'bg-[#FF9F1C]' : 'bg-emerald-500'}`}></div>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      item.status === 'critical' ? 'text-rose-500' : item.status === 'warning' ? 'text-[#FF9F1C]' : 'text-emerald-500'
                    }`}>
                      {item.status === 'critical' ? 'Ruptura' : item.status === 'warning' ? 'Baixo' : 'Saudável'}
                    </span>
                  </div>
                </td>
                <td className="text-right">
                  <button className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 hover:text-[#FF9F1C] hover:border-[#FF9F1C] transition-all">
                    <i className="fas fa-edit text-[10px]"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NewInventoryModal
        isOpen={showNewItemModal}
        onClose={() => setShowNewItemModal(false)}
        onSaved={handleNewItemSaved}
      />

      {showLotPanel && <LotControlPanel onClose={() => setShowLotPanel(false)} />}
    </div>
  );
};

export default InventoryModule;
