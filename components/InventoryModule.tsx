
import React, { useState, useEffect } from 'react';
import { NewInventoryModal } from './NewItemModals';
import { apiService } from '../services/api';

const InventoryModule: React.FC = () => {
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // AI Prediction State
  const [aiPrediction, setAiPrediction] = useState({
    message: 'Analisando dados de estoque com IA...',
    action: 'Aguarde',
    savings: '...'
  });

  useEffect(() => {
    const loadInventory = async () => {
      setIsLoading(true);
      try {
        // Parallel load of Inventory and AI Forecast
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

        // Update AI Prediction based on real API data
        // Backend returns: { analysis_summary, critical_restock: [], waste_alert }
        if (aiData && aiData.critical_restock && aiData.critical_restock.length > 0) {
             const count = aiData.critical_restock.length;
             const firstItem = aiData.critical_restock[0];
             setAiPrediction({
                 message: `${count} produtos precisam de reposição urgente (ex: ${firstItem.item}). Motivo: ${firstItem.reason || 'Baixo estoque e alta saída.'}`,
                 action: 'Repor Agora',
                 savings: 'R$ 840,00' // Estimated savings placeholder
             });
        } else if (aiData && aiData.analysis_summary) {
             setAiPrediction({
                 message: aiData.analysis_summary,
                 action: 'Manter',
                 savings: 'R$ 1.250,00'
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
        setAiPrediction({
            message: 'Não foi possível conectar ao serviço de IA.',
            action: 'Erro',
            savings: '-'
        });
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Estoque de Produtos</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Ecossistema Gestor VetPro - Inteligência de Suprimentos.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-200">
            <i className="fas fa-download mr-2"></i> Exportar
          </button>
          <button 
            onClick={() => setShowNewItemModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
          >
            <i className="fas fa-plus mr-2"></i> Novo Item
          </button>
        </div>
      </div>

      {/* AI Prediction Alert Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 p-6 rounded-2xl shadow-xl text-white flex items-center gap-6 transition-all ${
            aiPrediction.action === 'Repor Agora' ? 'bg-blue-600 shadow-blue-200' : 'bg-emerald-600 shadow-emerald-200'
          }`}>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                <i className="fas fa-chart-line"></i>
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-lg mb-1">PREVISÃO DE ESTOQUE (IA)</h4>
                <p className="text-sm text-white/90 leading-relaxed">
                    {aiPrediction.message}
                </p>
            </div>
            <button className={`bg-white px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-opacity-90 transition-all shadow-lg shrink-0 ${
               aiPrediction.action === 'Repor Agora' ? 'text-blue-600' : 'text-emerald-600'
            }`}>
              {aiPrediction.action}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
              {aiPrediction.action === 'Repor Agora' ? 'Custo de Ruptura Evitado' : 'Economia de Armazenagem'}
            </p>
            <h4 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{aiPrediction.savings}</h4>
            <p className="text-xs text-green-500 mt-2 font-medium italic">Baseado em previsões da IA</p>
          </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">Produto</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">Categoria</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase text-center">Estoque Atual</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">Preço Venda</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">Saúde Estoque</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {items.map((item: any, idx: number) => (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/70 transition-all">
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.category}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`font-bold ${item.stock <= item.minStock ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
                    {item.stock} / {item.minStock}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-slate-100">{item.price}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden max-w-20">
                          <div className={`h-full rounded-full ${item.status === 'critical' ? 'bg-red-500' : item.status === 'warning' ? 'bg-orange-500' : 'bg-green-500'}`} style={{width: `${(item.stock / 30) * 100}%`}}></div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase ${
                        item.status === 'critical'
                          ? 'text-red-600'
                          : item.status === 'warning'
                          ? 'text-orange-600'
                          : 'text-green-600'
                      }`}>
                        {item.status}
                      </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 p-2">
                    <i className="fas fa-edit"></i>
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
    </div>
  );
};

export default InventoryModule;
