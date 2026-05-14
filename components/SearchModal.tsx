
import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import { useNavigation } from '../context/NavigationContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ pets: any[], tutors: any[], products: any[] }>({ pets: [], tutors: [], products: [] });
  const [loading, setLoading] = useState(false);
  const { setActiveTab } = useNavigation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setResults({ pets: [], tutors: [], products: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 1) {
        setLoading(true);
        try {
          const res = await apiService.globalSearch(query);
          setResults(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults({ pets: [], tutors: [], products: [] });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (tab: string) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#020617]/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-portal-enter">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-white">
          <i className="fas fa-search text-slate-400 text-lg"></i>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 border-none outline-none text-base font-bold text-[#020617] placeholder:text-slate-300 uppercase tracking-tight"
            placeholder="O QUE VOCÊ ESTÁ BUSCANDO HOJE?..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <i className="fas fa-circle-notch fa-spin text-[#FF9F1C]"></i>}
          <div className="px-2 py-1 rounded-md bg-slate-50 text-[9px] font-black text-slate-400 border border-slate-200 uppercase tracking-widest">ESC</div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2 bg-white">
          {query.length <= 1 && (
            <div className="p-12 text-center">
              <i className="fas fa-rocket text-4xl text-slate-100 mb-6"></i>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 mb-2">Busca Global it2a</p>
              <div className="flex justify-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-2"><kbd className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">↑↓</kbd> NAVEGAR</span>
                <span className="flex items-center gap-2"><kbd className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">↵</kbd> SELECIONAR</span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {results.pets.length > 0 && (
              <div className="mb-4">
                <h3 className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#FF9F1C] border-b border-slate-50 mb-2">Pacientes</h3>
                {results.pets.map((p) => (
                  <button key={p.id} onClick={() => handleSelect('patients')} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 rounded-xl transition-all text-left group">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-white flex items-center justify-center text-[#FF9F1C] text-sm border border-transparent group-hover:border-slate-100 shadow-sm transition-all">
                      <i className="fas fa-paw"></i>
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#020617] uppercase tracking-tight">{p.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.species} • {p.breed}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {results.tutors.length > 0 && (
              <div className="mb-4">
                <h3 className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#FF9F1C] border-b border-slate-50 mb-2">Tutores</h3>
                {results.tutors.map((t) => (
                  <button key={t.id} onClick={() => handleSelect('patients')} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 rounded-xl transition-all text-left group">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-white flex items-center justify-center text-[#FF9F1C] text-sm border border-transparent group-hover:border-slate-100 shadow-sm transition-all">
                      <i className="fas fa-user"></i>
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#020617] uppercase tracking-tight">{t.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {results.products.length > 0 && (
              <div className="mb-4">
                <h3 className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#FF9F1C] border-b border-slate-50 mb-2">Inventário</h3>
                {results.products.map((p) => (
                  <button key={p.id} onClick={() => handleSelect('inventory')} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 rounded-xl transition-all text-left group">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-white flex items-center justify-center text-[#FF9F1C] text-sm border border-transparent group-hover:border-slate-100 shadow-sm transition-all">
                      <i className="fas fa-box"></i>
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#020617] uppercase tracking-tight">{p.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.category} • R$ {p.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {query.length > 1 && results.pets.length === 0 && results.tutors.length === 0 && results.products.length === 0 && !loading && (
              <div className="p-12 text-center">
                <i className="fas fa-ghost text-4xl text-slate-100 mb-6"></i>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Nenhum resultado encontrado para "{query}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
