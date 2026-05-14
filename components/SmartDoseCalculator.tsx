import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';

interface Medication {
  id: number;
  name: string;
  active_ingredient: string;
  concentration_mg_ml: number;
  dosage_mg_kg_dog: string;
  dosage_mg_kg_cat: string;
  category: string;
}

interface Pet {
  id: number;
  name: string;
  species: string;
  weight: number;
}

interface SmartDoseCalculatorProps {
  initialPetId?: string | number;
}

const MODULE_COLOR = '#3949AB';

const SmartDoseCalculator: React.FC<SmartDoseCalculatorProps> = ({ initialPetId }) => {
  const { addToast } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [customDosage, setCustomDosage] = useState<number>(0);
  const [result, setResult] = useState<{ doseMg: number; volumeMl: number } | null>(null);

  useEffect(() => {
    if ((window as any).__setModuleBreadcrumb) {
      (window as any).__setModuleBreadcrumb('Bulário it2a');
    }
    apiService.getPets().then(res => {
      const allPets = res.data;
      setPets(allPets);
      if (initialPetId) {
        const found = allPets.find((p: any) => p.id.toString() === initialPetId.toString());
        if (found) setSelectedPet(found);
      } else if (allPets.length > 0) {
        setSelectedPet(allPets[0]);
      }
    });
  }, [initialPetId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      apiService.getMedications(search).then(res => setMeds(res.data));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (selectedPet && selectedMed) {
      const dosageStr = selectedPet.species === 'Gato' ? selectedMed.dosage_mg_kg_cat : selectedMed.dosage_mg_kg_dog;
      const dosage = parseFloat(dosageStr);
      setCustomDosage(dosage);
      calculate(dosage);
    }
  }, [selectedMed, selectedPet]);

  const calculate = (dosage: number) => {
    if (!selectedPet || !selectedMed) return;
    const mg = selectedPet.weight * dosage;
    const ml = mg / selectedMed.concentration_mg_ml;
    setResult({ doseMg: mg, volumeMl: ml });
  };

  const handleCopy = () => {
    const text = `Prescrição: ${selectedMed?.name} (${selectedMed?.active_ingredient}) — Dose: ${result?.doseMg.toFixed(2)}mg (${result?.volumeMl.toFixed(2)}ml). Paciente: ${selectedPet?.name} — ${selectedPet?.weight}kg.`;
    navigator.clipboard.writeText(text);
    addToast('Prescrição copiada para a área de transferência!', 'success');
  };

  return (
    <div className="flex flex-col gap-6 animate-portal-enter pb-10">

      {/* Module Header */}
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Suporte Clínico</h1>
          <p className="text-2xl font-black text-[#020617] uppercase tracking-tight">Calculadora de Doses it2a</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white rounded-full"
            style={{ background: MODULE_COLOR }}
          >
            Smart Support
          </span>
        </div>
      </div>

      {/* Main Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Inputs */}
        <div className="lg:col-span-7 omie-card">
          <div className="omie-card-header">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">
              <i className="fas fa-calculator mr-2" style={{ color: MODULE_COLOR }}></i>
              Parâmetros da Prescrição
            </h3>
          </div>
          <div className="p-8 space-y-8">
            {/* Step 1: Pet */}
            <div>
              <label className="omie-label">1. Selecionar Paciente</label>
              <select
                className="omie-input"
                value={selectedPet?.id || ''}
                onChange={(e) => setSelectedPet(pets.find(p => p.id === parseInt(e.target.value)) || null)}
              >
                {pets.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species}) — {p.weight}kg
                  </option>
                ))}
              </select>
              {selectedPet && (
                <div className="mt-3 flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: MODULE_COLOR + '20' }}>
                    <i className="fas fa-paw text-sm" style={{ color: MODULE_COLOR }}></i>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: MODULE_COLOR }}>{selectedPet.species}</p>
                    <p className="text-sm font-black text-[#020617] uppercase">{selectedPet.name} — {selectedPet.weight}kg</p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Medication */}
            <div>
              <label className="omie-label">2. Medicamento (Bulário)</label>
              <div className="relative mb-3">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  type="text"
                  className="omie-input !pl-10"
                  placeholder="Buscar por nome ou princípio ativo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto custom-scrollbar p-1">
                {meds.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMed(m)}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                      selectedMed?.id === m.id
                        ? 'text-white border-transparent shadow-lg'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                    }`}
                    style={selectedMed?.id === m.id ? { background: MODULE_COLOR, borderColor: MODULE_COLOR } : {}}
                  >
                    {m.name}
                  </button>
                ))}
                {meds.length === 0 && (
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest p-2">
                    Nenhum medicamento encontrado.
                  </p>
                )}
              </div>
            </div>

            {/* Step 3: Custom dosage */}
            {selectedMed && selectedPet && (
              <div className="animate-fade-in">
                <label className="omie-label">3. Ajustar Dosagem (mg/kg)</label>
                <div className="flex gap-4 items-center">
                  <input
                    type="number"
                    step="0.01"
                    className="omie-input !text-lg !font-black !text-[#020617] flex-1"
                    value={customDosage}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setCustomDosage(val);
                      calculate(val);
                    }}
                  />
                  <div className="shrink-0 text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Concentração</p>
                    <p className="text-sm font-black text-[#020617] uppercase">{selectedMed.concentration_mg_ml} mg/ml</p>
                  </div>
                </div>
              </div>
            )}

            {!selectedMed && (
              <div className="py-10 text-center">
                <i className="fas fa-prescription-bottle-medical text-5xl text-slate-100 mb-4 block"></i>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Selecione um medicamento para calcular
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Result */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Result card */}
          {result && selectedMed && selectedPet ? (
            <div className="omie-card bg-[#020617] border-none text-white relative overflow-hidden flex-1">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full -mr-20 -mt-20 blur-[80px]" style={{ background: MODULE_COLOR + '40' }}></div>
              <div className="p-8 relative z-10 h-full flex flex-col">
                <div className="mb-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: MODULE_COLOR }}>
                    it2a Smart Dose Result
                  </p>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">{selectedMed.name}</h3>
                  <p className="text-[11px] font-bold text-slate-500 uppercase">{selectedMed.active_ingredient}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Dose Total</p>
                    <p className="text-3xl font-black text-white tracking-tighter">
                      {result.doseMg.toFixed(2)}
                      <span className="text-[10px] text-slate-400 ml-1">mg</span>
                    </p>
                  </div>
                  <div className="rounded-2xl p-5 text-center text-white shadow-2xl" style={{ background: MODULE_COLOR }}>
                    <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-2">Volume a Aplicar</p>
                    <p className="text-3xl font-black tracking-tighter">
                      {result.volumeMl.toFixed(2)}
                      <span className="text-[10px] text-white/60 ml-1">ml</span>
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Contexto</p>
                  <p className="text-[11px] font-bold text-slate-300 uppercase">
                    {selectedPet.name} · {selectedPet.species} · {selectedPet.weight}kg
                  </p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase mt-0.5">
                    Dosagem: {customDosage} mg/kg · {selectedMed.concentration_mg_ml} mg/ml
                  </p>
                </div>

                <button
                  onClick={handleCopy}
                  className="omie-btn-secondary !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 w-full mt-auto"
                >
                  <i className="fas fa-copy mr-2"></i>Copiar para Prontuário
                </button>
              </div>
            </div>
          ) : (
            <div className="omie-card bg-[#020617] border-none text-white flex-1 flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-[80px]" style={{ background: MODULE_COLOR + '30' }}></div>
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 text-3xl border border-white/10"
                style={{ background: MODULE_COLOR + '30' }}
              >
                <i className="fas fa-calculator" style={{ color: MODULE_COLOR }}></i>
              </div>
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">
                Selecione paciente e medicamento para calcular
              </p>
            </div>
          )}

          {/* Info card */}
          <div className="omie-card">
            <div className="omie-card-header">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">⚠ Aviso Clínico</h3>
            </div>
            <div className="p-6">
              <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed">
                Este cálculo é um suporte clínico baseado no bulário it2a. O diagnóstico e a prescrição final são de responsabilidade exclusiva do médico veterinário responsável.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartDoseCalculator;
