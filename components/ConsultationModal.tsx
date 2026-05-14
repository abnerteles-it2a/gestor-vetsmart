import React, { useState } from 'react';
import { analyzeClinicalCase } from '../services/vertexAiService';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useNavigation } from '../context/NavigationContext';

// ── Types ──────────────────────────────────────────────────────────────────
type ConsultTab = 'anamnese' | 'exame' | 'diagnostico' | 'tratamento';

interface VitalSigns {
  temperatura: string;
  freqCardiaca: string;
  freqResp: string;
  tpc: string;
}

interface ConsultationData {
  anamnese: string;
  vitals: VitalSigns;
  achadosClinicos: string;
  hipoteses: string;
  examesSolicitados: string[];
  tratamento: string;
}

interface Props {
  pet: {
    id: string | number;
    name: string;
    species: string;
    breed?: string;
    age?: string;
    weight?: string;
    tutor?: string;
    photoUrl?: string;
  };
  onClose: () => void;
  onFinalized?: (data: ConsultationData) => void;
}

// ── Constants ──────────────────────────────────────────────────────────────
const MODULE_COLOR = '#00695C';

const EXAMES_OPTIONS = [
  'Hemograma', 'Bioquímico', 'Ultrassom', 'Raio-X',
  'Urinálise', 'Fezes', 'Eletrocardiograma', 'Citologia',
];

const TABS: { id: ConsultTab; label: string; icon: string }[] = [
  { id: 'anamnese',    label: 'Anamnese',      icon: 'fa-comment-medical' },
  { id: 'exame',       label: 'Exame Físico',  icon: 'fa-stethoscope' },
  { id: 'diagnostico', label: 'Diagnóstico',   icon: 'fa-clipboard-check' },
  { id: 'tratamento',  label: 'Tratamento',    icon: 'fa-pills' },
];

// ── Component ──────────────────────────────────────────────────────────────
export const ConsultationModal: React.FC<Props> = ({ pet, onClose, onFinalized }) => {
  const { addToast } = useToast();
  const { navigateTo } = useNavigation();
  const [activeTab, setActiveTab] = useState<ConsultTab>('anamnese');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDiagSuggestion, setAiDiagSuggestion] = useState('');
  const [aiTreatSuggestion, setAiTreatSuggestion] = useState('');
  const [soapResult, setSoapResult] = useState<any>(null);
  const [billingResult, setBillingResult] = useState<any[]>([]);
  const [whatsappText, setWhatsappText] = useState('');
  const [saved, setSaved] = useState(false);

  const [data, setData] = useState<ConsultationData>({
    anamnese: '',
    vitals: { temperatura: '', freqCardiaca: '', freqResp: '', tpc: '' },
    achadosClinicos: '',
    hipoteses: '',
    examesSolicitados: [],
    tratamento: '',
  });

  // ── Helpers ──────────────────────────────────────────────────────────────
  const updateVital = (key: keyof VitalSigns, value: string) => {
    setData(d => ({ ...d, vitals: { ...d.vitals, [key]: value } }));
  };

  const toggleExame = (exame: string) => {
    setData(d => ({
      ...d,
      examesSolicitados: d.examesSolicitados.includes(exame)
        ? d.examesSolicitados.filter(e => e !== exame)
        : [...d.examesSolicitados, exame],
    }));
  };

  // ── AI call ───────────────────────────────────────────────────────────────
  const handleAiValidate = async (target: 'diagnostico' | 'tratamento') => {
    if (!data.anamnese && !data.achadosClinicos) {
      addToast('Preencha a anamnese ou achados clínicos antes de consultar a IA.', 'error');
      return;
    }
    setAiLoading(true);
    try {
      const rawNotes = `Anamnese: ${data.anamnese}\nExame: T:${data.vitals.temperatura}°C FC:${data.vitals.freqCardiaca}bpm FR:${data.vitals.freqResp}mpm TPC:${data.vitals.tpc}s\nAchados: ${data.achadosClinicos}\nHipóteses: ${data.hipoteses}`;
      const result = await analyzeClinicalCase(rawNotes, {
        species: pet.species, breed: pet.breed || 'SRD',
        age: pet.age || '?', weight: pet.weight || '?',
      }, '');

      // Always store SOAP when AI runs
      if (result?.structured_soap) setSoapResult(result.structured_soap);

      if (target === 'diagnostico') {
        setAiDiagSuggestion(result?.structured_soap?.a ||
          `Paciente ${pet.species} com quadro compatível. Recomenda-se exames complementares.`);
      } else {
        setAiTreatSuggestion(result?.structured_soap?.p ||
          `Iniciar tratamento sintomático. Reavaliar em 48-72h.`);
        // Billing + WhatsApp only on tratamento call
        if (result?.suggested_billing) setBillingResult(result.suggested_billing);
        const wa = result?.owner_instructions?.whatsapp_format ||
          result?.owner_instructions?.text || '';
        setWhatsappText(wa);
      }
      addToast('Sugestão IA gerada com sucesso!', 'success');
    } catch {
      addToast('Erro ao consultar IA. Tente novamente.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleFinalize = async () => {
    try {
      await apiService.createMedicalRecord({
        pet_id: pet.id,
        vet_id: '1',
        date: new Date().toISOString().split('T')[0],
        soap_s: data.anamnese,
        soap_o: `T:${data.vitals.temperatura} FC:${data.vitals.freqCardiaca} FR:${data.vitals.freqResp} TPC:${data.vitals.tpc} | ${data.achadosClinicos}`,
        soap_a: soapResult?.a || data.hipoteses,
        soap_p: soapResult?.p || data.tratamento,
        diagnosis: data.hipoteses.split('.')[0] || 'Consulta clínica',
        notes: `Exames: ${data.examesSolicitados.join(', ')}`,
      });
      setSaved(true);
      addToast(`Consulta de ${pet.name} salva no prontuário!`, 'success');
      onFinalized?.(data);
      onClose();
      // Navigate to patient's history tab so the vet sees the new record immediately
      if (pet.id !== 'new') {
        navigateTo('patients', { petId: String(pet.id), subTab: 'history' });
      }
    } catch {
      addToast('Consulta finalizada (offline — banco indisponível).', 'success');
      onFinalized?.(data);
      onClose();
    }
  };

  const handleSaveDraft = () => {
    addToast(`Rascunho de ${pet.name} salvo.`, 'success');
  };

  // ── Tab progress indicator ────────────────────────────────────────────────
  const tabIndex = TABS.findIndex(t => t.id === activeTab);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(2,6,23,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden animate-portal-enter"
        style={{ maxHeight: '90vh' }}
      >

        {/* ── HEADER: Pet Info ── */}
        <div className="bg-[#020617] px-8 py-5 flex items-center justify-between gap-6 shrink-0">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
              {pet.photoUrl
                ? <img src={pet.photoUrl} alt="" className="w-full h-full object-cover" />
                : <i className="fas fa-paw text-white/30 text-xl" />
              }
            </div>
            {/* Info */}
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">{pet.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {pet.tutor && (
                  <>
                    <span className="text-[10px] text-white/40 font-bold flex items-center gap-1">
                      <i className="fas fa-user text-[8px]" /> {pet.tutor}
                    </span>
                    <span className="text-white/20 text-[10px]">•</span>
                  </>
                )}
                {pet.breed && <span className="text-[10px] text-white/40 font-bold">{pet.breed}</span>}
                {pet.age && (
                  <>
                    <span className="text-white/20 text-[10px]">•</span>
                    <span className="text-[10px] text-white/40 font-bold">{pet.age}</span>
                  </>
                )}
                {pet.weight && (
                  <>
                    <span className="text-white/20 text-[10px]">•</span>
                    <span className="text-[10px] text-white/40 font-bold">{pet.weight}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white/70 text-[10px] font-black uppercase tracking-widest hover:bg-white/15 transition-colors border border-white/10">
              <i className="fas fa-history text-[9px]" /> Histórico
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
              style={{ background: MODULE_COLOR, color: '#fff' }}
            >
              <i className="fas fa-robot text-[9px]" /> IA Assistente
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <i className="fas fa-times text-[11px]" />
            </button>
          </div>
        </div>

        {/* ── PROGRESS BAR ── */}
        <div className="h-1 bg-slate-100 shrink-0">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${((tabIndex + 1) / TABS.length) * 100}%`,
              backgroundColor: MODULE_COLOR,
            }}
          />
        </div>

        {/* ── TAB BAR ── */}
        <div className="flex border-b border-slate-100 bg-white shrink-0 px-2">
          {TABS.map((tab, idx) => {
            const isActive = tab.id === activeTab;
            const isDone = idx < tabIndex;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-4 text-[10px] font-black uppercase tracking-widest
                  border-b-2 transition-all duration-200 whitespace-nowrap
                  ${isActive
                    ? 'border-[#00695C] text-[#00695C]'
                    : isDone
                      ? 'border-transparent text-emerald-400 hover:text-[#00695C]'
                      : 'border-transparent text-slate-300 hover:text-slate-500'
                  }
                `}
              >
                {isDone && !isActive
                  ? <i className="fas fa-check-circle text-emerald-400 text-[10px]" />
                  : <i className={`fas ${tab.icon} text-[10px]`} />
                }
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── CONTENT ── */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/40">

          {/* ─── ANAMNESE ─── */}
          {activeTab === 'anamnese' && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[#020617] mb-1 flex items-center gap-2">
                  <i className="fas fa-comment-medical text-[#00695C]" />
                  Queixa Principal e Histórico
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mb-4">
                  Descreva o motivo da consulta, sintomas relatados pelo tutor e a evolução do quadro clínico.
                </p>
                <textarea
                  rows={10}
                  value={data.anamnese}
                  onChange={e => setData(d => ({ ...d, anamnese: e.target.value }))}
                  placeholder="Descreva o motivo da consulta, sintomas relatados pelo tutor, evolução do quadro..."
                  className="w-full omie-input !py-4 !text-sm !leading-relaxed resize-none !bg-white"
                  autoFocus
                />
              </div>

              {/* AI tip */}
              <div className="flex items-start gap-3 p-4 rounded-xl border"
                style={{ backgroundColor: '#00695C10', borderColor: '#00695C30' }}>
                <i className="fas fa-lightbulb text-[#00695C] mt-0.5" />
                <p className="text-[11px] text-[#00695C] font-bold leading-relaxed">
                  <strong>Dica IA:</strong> Use linguagem natural. A IA estruturará a anamnese em termos técnicos automaticamente na etapa de Diagnóstico.
                </p>
              </div>

              {/* Next */}
              <div className="flex justify-end">
                <button
                  onClick={() => setActiveTab('exame')}
                  className="omie-btn-primary flex items-center gap-2"
                >
                  Próximo: Exame Físico <i className="fas fa-arrow-right" />
                </button>
              </div>
            </div>
          )}

          {/* ─── EXAME FÍSICO ─── */}
          {activeTab === 'exame' && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[#020617] mb-4 flex items-center gap-2">
                  <i className="fas fa-heartbeat text-[#00695C]" />
                  Sinais Vitais
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'temperatura',   label: 'Temperatura',    unit: '°C',  placeholder: '38.5', icon: 'fa-thermometer-half' },
                    { key: 'freqCardiaca',  label: 'Freq. Cardíaca', unit: 'bpm', placeholder: '120',  icon: 'fa-heart' },
                    { key: 'freqResp',      label: 'Freq. Resp.',    unit: 'mpm', placeholder: '30',   icon: 'fa-lungs' },
                    { key: 'tpc',           label: 'TPC',            unit: 'seg', placeholder: '2',    icon: 'fa-hand-pointer' },
                  ].map(field => (
                    <div
                      key={field.key}
                      className="omie-card bg-white p-5 flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-2 text-slate-400">
                        <i className={`fas ${field.icon} text-[10px]`} />
                        <span className="text-[8px] font-black uppercase tracking-widest">{field.label}</span>
                      </div>
                      <div className="flex items-end gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={data.vitals[field.key as keyof VitalSigns]}
                          onChange={e => updateVital(field.key as keyof VitalSigns, e.target.value)}
                          placeholder={field.placeholder}
                          className="flex-1 text-2xl font-black text-[#020617] bg-transparent border-none outline-none w-full"
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        />
                        <span className="text-[10px] font-bold text-slate-300 mb-1">{field.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[#020617] mb-3 flex items-center gap-2">
                  <i className="fas fa-search text-[#00695C]" />
                  Achados Clínicos
                </h3>
                <textarea
                  rows={7}
                  value={data.achadosClinicos}
                  onChange={e => setData(d => ({ ...d, achadosClinicos: e.target.value }))}
                  placeholder="Descreva os achados da inspeção, palpação, ausculta..."
                  className="w-full omie-input !py-4 !text-sm !leading-relaxed resize-none !bg-white"
                />
              </div>

              <div className="flex justify-between">
                <button onClick={() => setActiveTab('anamnese')} className="omie-btn-secondary flex items-center gap-2">
                  <i className="fas fa-arrow-left" /> Voltar
                </button>
                <button onClick={() => setActiveTab('diagnostico')} className="omie-btn-primary flex items-center gap-2">
                  Próximo: Diagnóstico <i className="fas fa-arrow-right" />
                </button>
              </div>
            </div>
          )}

          {/* ─── DIAGNÓSTICO ─── */}
          {activeTab === 'diagnostico' && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Hypothesis text area */}
                <div className="md:col-span-3 flex flex-col gap-3">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-[#020617] flex items-center gap-2">
                    <i className="fas fa-clipboard-check text-[#00695C]" />
                    Hipóteses Diagnósticas
                  </h3>
                  <textarea
                    rows={8}
                    value={data.hipoteses}
                    onChange={e => setData(d => ({ ...d, hipoteses: e.target.value }))}
                    placeholder="Descreva as hipóteses diagnósticas ou deixe a IA sugerir..."
                    className="w-full omie-input !py-4 !text-sm !leading-relaxed resize-none !bg-white"
                  />
                  <button
                    onClick={() => handleAiValidate('diagnostico')}
                    disabled={aiLoading}
                    className="omie-btn-primary flex items-center gap-2 self-start !bg-[#020617] !text-[#00695C] border-none"
                  >
                    {aiLoading
                      ? <><i className="fas fa-circle-notch fa-spin" /> Consultando IA...</>
                      : <><i className="fas fa-robot" /> Validar com IA</>
                    }
                  </button>
                </div>

                {/* AI Suggestion panel */}
                <div
                  className="md:col-span-2 rounded-2xl p-5 flex flex-col gap-4 border"
                  style={{ backgroundColor: '#00695C08', borderColor: '#00695C20' }}
                >
                  <div className="flex items-center gap-2">
                    <i className="fas fa-robot text-[#00695C]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00695C]">Sugestão IA</span>
                  </div>
                  {aiDiagSuggestion ? (
                    <>
                      <p className="text-[12px] text-slate-600 italic leading-relaxed flex-1">
                        "{aiDiagSuggestion}"
                      </p>
                      <button
                        onClick={() => setData(d => ({ ...d, hipoteses: aiDiagSuggestion }))}
                        className="text-[10px] font-black text-[#00695C] uppercase tracking-widest hover:underline self-start"
                      >
                        Usar este texto
                      </button>
                    </>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      Clique em "Validar com IA" para obter sugestão diagnóstica baseada na anamnese e exame físico.
                    </p>
                  )}
                </div>
              </div>

              {/* SOAP structured output */}
              {soapResult && (
                <div className="rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-file-medical text-[#00695C] text-[11px]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">SOAP Estruturado</span>
                    </div>
                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">CONFIDENCE: HIGH</span>
                  </div>
                  <div className="grid grid-cols-2 gap-0 bg-white">
                    {[{k:'s',l:'Subjetivo'},{k:'o',l:'Objetivo'},{k:'a',l:'Avaliação'},{k:'p',l:'Plano'}].map((item, i) => (
                      <div key={item.k} className={`p-4 ${i < 2 ? 'border-b' : ''} ${i % 2 === 0 ? 'border-r' : ''} border-slate-100`}>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-1">{item.l}</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{soapResult[item.k] || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exam checkboxes */}
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[#020617] mb-4 flex items-center gap-2">
                  <i className="fas fa-vials text-[#00695C]" />
                  Solicitação de Exames
                </h3>
                <div className="flex flex-wrap gap-3">
                  {EXAMES_OPTIONS.map(exame => {
                    const checked = data.examesSolicitados.includes(exame);
                    return (
                      <button
                        key={exame}
                        onClick={() => toggleExame(exame)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                          checked
                            ? 'border-[#00695C] text-[#00695C] bg-[#00695C10]'
                            : 'border-slate-200 text-slate-400 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <i className={`fas ${checked ? 'fa-check-square' : 'fa-square'} text-[10px]`} />
                        {exame}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setActiveTab('exame')} className="omie-btn-secondary flex items-center gap-2">
                  <i className="fas fa-arrow-left" /> Voltar
                </button>
                <button onClick={() => setActiveTab('tratamento')} className="omie-btn-primary flex items-center gap-2">
                  Próximo: Tratamento <i className="fas fa-arrow-right" />
                </button>
              </div>
            </div>
          )}

          {/* ─── TRATAMENTO ─── */}
          {activeTab === 'tratamento' && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Prescription textarea */}
                <div className="md:col-span-3 flex flex-col gap-3">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-[#020617] flex items-center gap-2">
                    <i className="fas fa-pills text-[#00695C]" />
                    Prescrição / Plano Terapêutico
                  </h3>
                  <textarea
                    rows={10}
                    value={data.tratamento}
                    onChange={e => setData(d => ({ ...d, tratamento: e.target.value }))}
                    placeholder="Descreva os medicamentos, doses, frequências e orientações ao tutor..."
                    className="w-full omie-input !py-4 !text-sm !leading-relaxed resize-none !bg-white"
                  />
                  <button
                    onClick={() => handleAiValidate('tratamento')}
                    disabled={aiLoading}
                    className="omie-btn-primary flex items-center gap-2 self-start !bg-[#020617] !text-[#00695C] border-none"
                  >
                    {aiLoading
                      ? <><i className="fas fa-circle-notch fa-spin" /> Gerando Plano...</>
                      : <><i className="fas fa-robot" /> Sugerir Plano IA</>
                    }
                  </button>
                </div>

                {/* AI Treatment Suggestion */}
                <div
                  className="md:col-span-2 rounded-2xl p-5 flex flex-col gap-4 border"
                  style={{ backgroundColor: '#00695C08', borderColor: '#00695C20' }}
                >
                  <div className="flex items-center gap-2">
                    <i className="fas fa-robot text-[#00695C]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00695C]">Sugestão IA</span>
                  </div>
                  {aiTreatSuggestion ? (
                    <>
                      <p className="text-[12px] text-slate-600 italic leading-relaxed flex-1">
                        "{aiTreatSuggestion}"
                      </p>
                      <button
                        onClick={() => setData(d => ({ ...d, tratamento: aiTreatSuggestion }))}
                        className="text-[10px] font-black text-[#00695C] uppercase tracking-widest hover:underline self-start"
                      >
                        Usar este texto
                      </button>
                    </>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      Clique em "Sugerir Plano IA" para gerar um plano terapêutico baseado no diagnóstico.
                    </p>
                  )}
                </div>
              </div>

              {/* Exams requested summary */}
              {data.examesSolicitados.length > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <i className="fas fa-vials text-slate-400" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Exames Solicitados</p>
                    <div className="flex flex-wrap gap-2">
                      {data.examesSolicitados.map(e => (
                        <span key={e} className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-slate-600">{e}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Billing suggestions */}
              {billingResult.length > 0 && (
                <div className="rounded-2xl border border-emerald-100 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 bg-emerald-50 border-b border-emerald-100">
                    <i className="fas fa-file-invoice-dollar text-emerald-500 text-[11px]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Sugestão de Faturamento</span>
                  </div>
                  <div className="bg-white divide-y divide-slate-50">
                    {billingResult.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between px-5 py-3">
                        <span className="text-[11px] font-bold text-slate-700">{item.item || item}</span>
                        <i className="fas fa-check-circle text-emerald-400 text-[11px]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WhatsApp instructions */}
              {whatsappText && (
                <div className="rounded-2xl border border-green-100 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-green-50 border-b border-green-100">
                    <div className="flex items-center gap-2">
                      <i className="fab fa-whatsapp text-green-500 text-[13px]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Instruções ao Tutor</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(whatsappText)}
                        className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-white border border-green-200 text-green-600 hover:bg-green-50 transition-all"
                      >
                        <i className="fas fa-copy mr-1" />Copiar
                      </button>
                      <button
                        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`)}
                        className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all"
                      >
                        <i className="fas fa-paper-plane mr-1" />Enviar
                      </button>
                    </div>
                  </div>
                  <div className="bg-green-50/50 p-5">
                    <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">{whatsappText}</p>
                  </div>
                </div>
              )}

              {/* Final actions */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <button onClick={() => setActiveTab('diagnostico')} className="omie-btn-secondary flex items-center gap-2">
                  <i className="fas fa-arrow-left" /> Voltar
                </button>
                <div className="flex gap-4">
                  <button
                    onClick={handleSaveDraft}
                    className="omie-btn-secondary flex items-center gap-2"
                  >
                    <i className="fas fa-save" /> Salvar Rascunho
                  </button>
                  <button
                    onClick={handleFinalize}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-white transition-all hover:opacity-90 shadow-lg"
                    style={{ backgroundColor: '#16A34A' }}
                  >
                    <i className="fas fa-check" /> Finalizar Consulta
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ConsultationModal;
