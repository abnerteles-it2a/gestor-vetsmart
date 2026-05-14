import React, { useState } from 'react';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  weight?: string;
  tutor?: string;
}

interface MedItem {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
}

interface PrescriptionModalProps {
  pet: Pet;
  vetName?: string;
  onClose: () => void;
}

// Bulário simplificado — base de autocomplete
const DRUG_DATABASE = [
  { name: 'Amoxicilina', dose_per_kg: '10-20mg/kg', frequencies: ['8/8h', '12/12h'], routes: ['Oral', 'Injetável'] },
  { name: 'Metronidazol', dose_per_kg: '25-50mg/kg', frequencies: ['12/12h', '24/24h'], routes: ['Oral', 'Injetável EV'] },
  { name: 'Prednisolona', dose_per_kg: '0.5-2mg/kg', frequencies: ['12/12h', '24/24h'], routes: ['Oral'] },
  { name: 'Dipirona Sódica', dose_per_kg: '25mg/kg', frequencies: ['8/8h', '12/12h'], routes: ['Oral', 'Injetável IM'] },
  { name: 'Metoclopramida', dose_per_kg: '0.2-0.5mg/kg', frequencies: ['8/8h'], routes: ['Oral', 'Injetável IM'] },
  { name: 'Enrofloxacino', dose_per_kg: '5-10mg/kg', frequencies: ['12/12h', '24/24h'], routes: ['Oral', 'Injetável IM'] },
  { name: 'Omeprazol', dose_per_kg: '0.7-1mg/kg', frequencies: ['24/24h'], routes: ['Oral'] },
  { name: 'Tramadol', dose_per_kg: '2-5mg/kg', frequencies: ['8/8h', '12/12h'], routes: ['Oral', 'Injetável IM/SC'] },
  { name: 'Meloxicam', dose_per_kg: '0.1-0.2mg/kg', frequencies: ['24/24h'], routes: ['Oral', 'Injetável SC'] },
  { name: 'Furosemida', dose_per_kg: '2-4mg/kg', frequencies: ['12/12h', '24/24h'], routes: ['Oral', 'Injetável EV/IM'] },
  { name: 'Cefalexina', dose_per_kg: '22-30mg/kg', frequencies: ['8/8h', '12/12h'], routes: ['Oral'] },
  { name: 'Dexametasona', dose_per_kg: '0.1-0.5mg/kg', frequencies: ['24/24h'], routes: ['Oral', 'Injetável EV/IM'] },
];

const ROUTES = ['Oral', 'Injetável IM', 'Injetável SC', 'Injetável EV', 'Tópico', 'Ocular', 'Auricular'];
const FREQUENCIES = ['4/4h', '6/6h', '8/8h', '12/12h', '24/24h', '48/48h', '1x semana'];
const DURATIONS = ['3 dias', '5 dias', '7 dias', '10 dias', '14 dias', '21 dias', '30 dias', 'Uso contínuo'];

const PRESCRIPTION_TYPES = [
  { id: 'simple', label: 'Receita Simples', icon: 'fa-file-prescription', color: '#1565C0' },
  { id: 'controlled', label: 'Controle Especial', icon: 'fa-shield-halved', color: '#B71C1C' },
  { id: 'exam', label: 'Solicitação de Exames', icon: 'fa-flask', color: '#1B5E20' },
  { id: 'certificate', label: 'Atestado', icon: 'fa-certificate', color: '#E65100' },
];

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({ pet, vetName = 'Dr. Ricardo Silva', onClose }) => {
  const [type, setType] = useState<'simple' | 'controlled' | 'exam' | 'certificate'>('simple');
  const [medications, setMedications] = useState<MedItem[]>([]);
  const [drugSearch, setDrugSearch] = useState('');
  const [drugSuggestions, setDrugSuggestions] = useState<typeof DRUG_DATABASE>([]);
  const [selectedDrug, setSelectedDrug] = useState<typeof DRUG_DATABASE[0] | null>(null);
  const [newMed, setNewMed] = useState<Partial<MedItem>>({
    route: 'Oral', frequency: '12/12h', duration: '7 dias', instructions: ''
  });
  const [examRequests, setExamRequests] = useState<string[]>([]);
  const [examInput, setExamInput] = useState('');
  const [observations, setObservations] = useState('');
  const [saved, setSaved] = useState(false);
  const [showAddMed, setShowAddMed] = useState(false);

  const petWeight = parseFloat((pet.weight || '').replace('kg', '')) || 0;

  // Drug autocomplete
  const handleDrugSearch = (q: string) => {
    setDrugSearch(q);
    if (q.length < 2) { setDrugSuggestions([]); return; }
    setDrugSuggestions(DRUG_DATABASE.filter(d => d.name.toLowerCase().includes(q.toLowerCase())));
  };

  const selectDrug = (drug: typeof DRUG_DATABASE[0]) => {
    setSelectedDrug(drug);
    setDrugSearch(drug.name);
    setDrugSuggestions([]);
    // Auto-suggest dose
    const doseRange = drug.dose_per_kg;
    const [minFactor] = doseRange.split('-').map(s => parseFloat(s));
    const suggestedDose = petWeight > 0 ? `${(minFactor * petWeight).toFixed(1)}mg (${doseRange} — peso: ${petWeight}kg)` : doseRange;
    setNewMed(prev => ({
      ...prev,
      name: drug.name,
      dose: suggestedDose,
      frequency: drug.frequencies[0],
      route: drug.routes[0],
    }));
  };

  const addMedication = () => {
    if (!newMed.name) return;
    const med: MedItem = {
      id: Date.now().toString(),
      name: newMed.name || '',
      dose: newMed.dose || '',
      frequency: newMed.frequency || '12/12h',
      duration: newMed.duration || '7 dias',
      route: newMed.route || 'Oral',
      instructions: newMed.instructions || '',
    };
    setMedications(prev => [...prev, med]);
    setNewMed({ route: 'Oral', frequency: '12/12h', duration: '7 dias', instructions: '' });
    setDrugSearch('');
    setSelectedDrug(null);
    setShowAddMed(false);
  };

  const removeMed = (id: string) => setMedications(prev => prev.filter(m => m.id !== id));

  const addExam = () => {
    if (!examInput.trim()) return;
    setExamRequests(prev => [...prev, examInput.trim()]);
    setExamInput('');
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1800);
  };

  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const selectedType = PRESCRIPTION_TYPES.find(t => t.id === type)!;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col animate-portal-enter">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: selectedType.color + '18' }}>
              <i className={`fas ${selectedType.icon} text-sm`} style={{ color: selectedType.color }} />
            </div>
            <div>
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Receita Digital</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{pet.name} · {pet.tutor || 'Tutor'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <i className="fas fa-times text-slate-500 text-xs" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left — Form */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6 space-y-6">

            {/* Type selector */}
            <div>
              <label className="omie-label">Tipo de Documento</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {PRESCRIPTION_TYPES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id as any)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      type === t.id ? 'border-current shadow-sm' : 'border-slate-100 hover:border-slate-200'
                    }`}
                    style={type === t.id ? { borderColor: t.color, background: t.color + '08' } : {}}
                  >
                    <i className={`fas ${t.icon} text-sm mb-2 block`} style={{ color: t.color }} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pet info summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-3 gap-4">
              {[
                { label: 'Paciente', value: pet.name },
                { label: 'Espécie / Raça', value: `${pet.species} · ${pet.breed || 'SRD'}` },
                { label: 'Peso', value: pet.weight || 'N/A' },
              ].map((f, i) => (
                <div key={i}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{f.label}</p>
                  <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{f.value}</p>
                </div>
              ))}
            </div>

            {/* MEDICATIONS (type: simple | controlled) */}
            {(type === 'simple' || type === 'controlled') && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="omie-label mb-0">Medicamentos</label>
                  <button
                    onClick={() => setShowAddMed(v => !v)}
                    className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <i className="fas fa-plus text-[8px]" />
                    Adicionar
                  </button>
                </div>

                {/* Add medication form */}
                {showAddMed && (
                  <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-3 mb-4">
                    {/* Drug search */}
                    <div className="relative">
                      <label className="omie-label">Medicamento</label>
                      <input
                        value={drugSearch}
                        onChange={e => handleDrugSearch(e.target.value)}
                        placeholder="Buscar por nome ou princípio ativo..."
                        className="omie-input !text-sm"
                      />
                      {drugSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden mt-1">
                          {drugSuggestions.map(d => (
                            <button
                              key={d.name}
                              onClick={() => selectDrug(d)}
                              className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                            >
                              <span className="text-[11px] font-black text-slate-800 uppercase">{d.name}</span>
                              <span className="text-[9px] text-slate-400 font-bold">{d.dose_per_kg}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dose */}
                    <div>
                      <label className="omie-label">
                        Dose
                        {petWeight > 0 && selectedDrug && (
                          <span className="ml-2 text-indigo-500 normal-case font-semibold">
                            (IA sugere: {selectedDrug.dose_per_kg} × {petWeight}kg)
                          </span>
                        )}
                      </label>
                      <input
                        value={newMed.dose || ''}
                        onChange={e => setNewMed(p => ({ ...p, dose: e.target.value }))}
                        placeholder="Ex: 5mg a cada 12h"
                        className="omie-input !text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="omie-label">Via</label>
                        <select value={newMed.route} onChange={e => setNewMed(p => ({ ...p, route: e.target.value }))} className="omie-input !text-sm">
                          {ROUTES.map(r => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="omie-label">Frequência</label>
                        <select value={newMed.frequency} onChange={e => setNewMed(p => ({ ...p, frequency: e.target.value }))} className="omie-input !text-sm">
                          {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="omie-label">Duração</label>
                        <select value={newMed.duration} onChange={e => setNewMed(p => ({ ...p, duration: e.target.value }))} className="omie-input !text-sm">
                          {DURATIONS.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="omie-label">Instruções ao tutor</label>
                      <input
                        value={newMed.instructions || ''}
                        onChange={e => setNewMed(p => ({ ...p, instructions: e.target.value }))}
                        placeholder="Ex: Dar com alimento, armazenar sob refrigeração..."
                        className="omie-input !text-sm"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button onClick={() => setShowAddMed(false)} className="omie-btn-secondary !px-5 !py-2">Cancelar</button>
                      <button onClick={addMedication} className="omie-btn-primary !px-5 !py-2">
                        <i className="fas fa-plus mr-2" />Adicionar Medicamento
                      </button>
                    </div>
                  </div>
                )}

                {/* Medication list */}
                <div className="space-y-2">
                  {medications.length === 0 && !showAddMed && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                      <i className="fas fa-pills text-3xl text-slate-100 mb-2 block" />
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhum medicamento adicionado</p>
                    </div>
                  )}
                  {medications.map((m, idx) => (
                    <div key={m.id} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors group">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-black text-indigo-600">{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{m.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{m.dose} · {m.route} · {m.frequency} por {m.duration}</p>
                        {m.instructions && <p className="text-[9px] text-slate-400 mt-1 italic">"{m.instructions}"</p>}
                      </div>
                      <button onClick={() => removeMed(m.id)} className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 hover:bg-rose-100 transition-all">
                        <i className="fas fa-trash text-[8px]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EXAM REQUESTS */}
            {type === 'exam' && (
              <div>
                <label className="omie-label">Exames Solicitados</label>
                <div className="flex gap-2 mb-3">
                  <input
                    value={examInput}
                    onChange={e => setExamInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addExam()}
                    placeholder="Ex: Hemograma completo, Bioquímica sérica..."
                    className="omie-input flex-1 !text-sm"
                  />
                  <button onClick={addExam} className="omie-btn-primary !px-5">
                    <i className="fas fa-plus" />
                  </button>
                </div>
                <div className="space-y-2">
                  {examRequests.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-flask text-emerald-600 text-xs" />
                        <span className="text-[11px] font-bold text-slate-700">{ex}</span>
                      </div>
                      <button onClick={() => setExamRequests(p => p.filter((_, j) => j !== i))} className="text-slate-300 hover:text-rose-500 transition-colors">
                        <i className="fas fa-times text-[10px]" />
                      </button>
                    </div>
                  ))}
                  {examRequests.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                      <i className="fas fa-flask text-3xl text-slate-100 mb-2 block" />
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Adicione os exames solicitados</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CERTIFICATE */}
            {type === 'certificate' && (
              <div>
                <label className="omie-label">Conteúdo do Atestado</label>
                <textarea
                  rows={6}
                  className="omie-input !resize-none !text-sm"
                  placeholder="Atesto para os devidos fins que o animal acima identificado esteve sob atendimento veterinário nesta data..."
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                />
              </div>
            )}

            {/* Observations */}
            {type !== 'certificate' && (
              <div>
                <label className="omie-label">Observações Gerais</label>
                <textarea
                  rows={3}
                  className="omie-input !resize-none !text-sm"
                  placeholder="Orientações complementares ao tutor..."
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Right — Preview */}
          <div className="w-72 border-l border-slate-100 bg-slate-50/50 flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prévia do Documento</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm text-[10px] leading-relaxed font-mono space-y-4">
                {/* Clinic header */}
                <div className="text-center border-b border-slate-100 pb-3">
                  <p className="font-black text-slate-800 text-[11px] uppercase tracking-tight">VetGrid Clínica</p>
                  <p className="text-slate-400 text-[9px]">CRMV: 00000 · CNPJ: 00.000.000/0001-00</p>
                  <p className="text-slate-400 text-[9px]">contato@vetgrid.com.br</p>
                </div>

                {/* Type badge */}
                <div className="text-center">
                  <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: selectedType.color + '18', color: selectedType.color }}>
                    {selectedType.label}
                  </span>
                </div>

                {/* Pet info */}
                <div className="text-[9px] text-slate-600 space-y-0.5">
                  <p><strong>Paciente:</strong> {pet.name}</p>
                  <p><strong>Espécie:</strong> {pet.species} · {pet.breed}</p>
                  {pet.weight && <p><strong>Peso:</strong> {pet.weight}</p>}
                  <p><strong>Tutor:</strong> {pet.tutor || '—'}</p>
                  <p><strong>Data:</strong> {today}</p>
                </div>

                {/* Medications */}
                {medications.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-t border-slate-100 pt-2">Prescrição</p>
                    {medications.map((m, i) => (
                      <div key={m.id} className="text-[9px] text-slate-700">
                        <p className="font-black">{i + 1}. {m.name}</p>
                        <p className="ml-3">Dose: {m.dose}</p>
                        <p className="ml-3">Via: {m.route} · {m.frequency} por {m.duration}</p>
                        {m.instructions && <p className="ml-3 italic text-slate-400">{m.instructions}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Exams */}
                {examRequests.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-t border-slate-100 pt-2">Exames Solicitados</p>
                    {examRequests.map((ex, i) => <p key={i} className="text-[9px] text-slate-700">• {ex}</p>)}
                  </div>
                )}

                {observations && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-t border-slate-100 pt-2">Observações</p>
                    <p className="text-[9px] text-slate-700">{observations}</p>
                  </div>
                )}

                {/* Signature */}
                <div className="border-t border-slate-100 pt-3 text-center">
                  <div className="h-8 border-b border-slate-300 mb-1" />
                  <p className="text-[9px] font-black text-slate-600">{vetName}</p>
                  <p className="text-[8px] text-slate-400">Médico Veterinário · CRMV 00000</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 hover:bg-slate-100 transition-all">
              <i className="fas fa-print text-xs" />Imprimir
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-200 hover:bg-emerald-50 transition-all">
              <i className="fab fa-whatsapp text-xs" />WhatsApp
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-all">
              <i className="fas fa-file-pdf text-xs" />PDF
            </button>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="omie-btn-secondary">Cancelar</button>
            <button
              onClick={handleSave}
              disabled={saved}
              className="omie-btn-primary flex items-center gap-2"
            >
              {saved
                ? <><i className="fas fa-check" /> Salvo!</>
                : <><i className="fas fa-save" /> Salvar Receita</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
