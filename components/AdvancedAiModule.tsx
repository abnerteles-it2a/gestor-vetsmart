import React, { useState } from 'react';
import { analyzeDiagnosticImage } from '../services/vertexAiService';
import { apiService } from '../services/api';

const MODULE_COLOR = '#1565C0';

const IMAGE_TYPES = ['Raio-X', 'Ultrassom', 'Dermatologia', 'Microscopia', 'Oftalmologia'];

const SAMPLE_CASES = [
  { label: 'Fratura Rádio',  desc: 'Fratura completa em rádio distal, cão pequeno porte.' },
  { label: 'Dermatite',      desc: 'Mancha circular avermelhada com bordas descamativas no dorso.' },
  { label: 'Cistite',        desc: 'Imagem de ultrassom mostrando espessamento da parede da bexiga.' },
  { label: 'Pneumonia',      desc: 'Opacidade alveolar em lobo cranial direito, padrão broncopneumônico.' },
];

const AdvancedAiModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vision' | 'history'>('vision');

  // Vision state
  const [imageType, setImageType] = useState('Raio-X');
  const [imageDesc, setImageDesc] = useState('');
  const [visionResult, setVisionResult] = useState<any>(null);
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionPetId, setVisionPetId] = useState('');
  const [visionSaved, setVisionSaved] = useState(false);

  // History state
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histLoaded, setHistLoaded] = useState(false);

  // Load pets once on mount
  React.useEffect(() => {
    apiService.getPets().then(r => {
      setPets(r.data);
      if (r.data.length > 0) {
        setSelectedPetId(r.data[0].id);
        setVisionPetId(r.data[0].id); // default for VetVision too
      }
    }).catch(() => {});
  }, []);

  const handleSaveVisionRecord = async () => {
    if (!visionResult || !visionPetId) return;
    try {
      await apiService.createMedicalRecord({
        pet_id: visionPetId,
        vet_id: '1',
        date: new Date().toISOString().split('T')[0],
        soap_s: `Análise de imagem solicitada: ${imageType}`,
        soap_o: imageDesc,
        soap_a: visionResult.diagnosis?.[0] || 'Achado imaging',
        soap_p: visionResult.recommendation || 'Ver laudo completo',
        diagnosis: visionResult.diagnosis?.[0] || 'Diagnóstico por imagem',
        notes: `[VetVision] ${imageType} | Confiança: ${visionResult.confidence} | Achados: ${visionResult.technical_findings}`,
      });
      setVisionSaved(true);
      setTimeout(() => setVisionSaved(false), 4000);
    } catch {
      alert('Erro ao registrar no prontuário.');
    }
  };

  const handleVisionAnalysis = async () => {
    if (!imageDesc) return;
    setVisionLoading(true);
    setVisionResult(null);
    try {
      const result = await analyzeDiagnosticImage(imageType, imageDesc);
      setVisionResult(result);
    } catch { /* fallback handled inside service */ }
    finally { setVisionLoading(false); }
  };

  const loadHistory = async (petId?: string) => {
    const id = petId || selectedPetId;
    if (!id) return;
    setHistLoading(true);
    try {
      const r = await apiService.getMedicalRecords(id);
      setHistory(r.data || []);
      setHistLoaded(true);
    } catch { setHistory([]); setHistLoaded(true); }
    finally { setHistLoading(false); }
  };

  return (
    <div className="flex flex-col gap-6 animate-portal-enter pb-10">

      {/* Header */}
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Inteligência Clínica
          </h1>
          <p className="text-2xl font-black text-[#020617] uppercase tracking-tight">
            IA & Imagem
          </p>
        </div>
        <span className="text-[9px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest"
          style={{ color: MODULE_COLOR, borderColor: MODULE_COLOR + '40', background: MODULE_COLOR + '08' }}>
          <i className="fas fa-robot mr-1" />VetGrid AI BETA
        </span>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-slate-100 -mt-2">
        {([
          { id: 'vision',  label: 'VetVision — Análise de Imagem', icon: 'fa-eye' },
          { id: 'history', label: 'Histórico de Prontuários',       icon: 'fa-history' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); if (tab.id === 'history' && !histLoaded) loadHistory(); }}
            className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-[#1565C0] text-[#1565C0]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <i className={`fas ${tab.icon} text-[10px]`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── VETVISION ── */}
      {activeTab === 'vision' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Input panel */}
          <div className="omie-card bg-white p-8 flex flex-col gap-6">

            {/* Pet selector — REQUIRED for record linkage */}
            <div className="p-4 rounded-xl border-2 flex items-center gap-4"
              style={{ borderColor: MODULE_COLOR + '30', background: MODULE_COLOR + '06' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: MODULE_COLOR + '15' }}>
                <i className="fas fa-paw" style={{ color: MODULE_COLOR }} />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[8px] font-black uppercase tracking-widest" style={{ color: MODULE_COLOR }}>
                  Paciente vinculado ao exame
                </label>
                <select
                  value={visionPetId}
                  onChange={e => { setVisionPetId(e.target.value); setVisionSaved(false); }}
                  className="text-[12px] font-black text-[#020617] bg-transparent border-none outline-none cursor-pointer"
                >
                  {pets.length === 0 && <option value="">Carregando pacientes...</option>}
                  {pets.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.species}</option>
                  ))}
                </select>
              </div>
              <i className="fas fa-chevron-down text-[10px] text-slate-300 shrink-0" />
            </div>

            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[#020617] mb-4 flex items-center gap-2">
                <i className="fas fa-layer-group text-[#1565C0]" />
                Modalidade de Imagem
              </h3>
              <div className="flex flex-wrap gap-2">
                {IMAGE_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setImageType(type)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                      imageType === type
                        ? 'border-[#1565C0] text-[#1565C0] bg-[#1565C008]'
                        : 'border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Drop zone */}
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-[#1565C0]/40 hover:bg-[#1565C008] transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110"
                style={{ background: MODULE_COLOR + '15' }}>
                <i className="fas fa-cloud-upload-alt text-2xl" style={{ color: MODULE_COLOR }} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Arraste a imagem aqui</p>
              <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase tracking-widest">DICOM • JPEG • PNG (Simulado)</p>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Descrição / Contexto para IA
              </label>
              <textarea
                rows={4}
                value={imageDesc}
                onChange={e => setImageDesc(e.target.value)}
                placeholder="Descreva o que você observa ou selecione um caso de teste..."
                className="w-full omie-input !py-3 !text-sm !leading-relaxed resize-none !bg-white"
              />
              {/* Sample cases */}
              <div className="flex flex-wrap gap-2">
                {SAMPLE_CASES.map(c => (
                  <button
                    key={c.label}
                    onClick={() => setImageDesc(c.desc)}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 border border-slate-100 transition-all"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleVisionAnalysis}
                disabled={visionLoading || !imageDesc}
                className="omie-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 !py-3"
                style={{ background: MODULE_COLOR }}
              >
                {visionLoading
                  ? <><i className="fas fa-circle-notch fa-spin" /> Analisando pixels...</>
                  : <><i className="fas fa-microscope" /> Iniciar Análise VetVision</>
                }
              </button>
            </div>
          </div>

          {/* Output panel */}
          <div>
            {!visionResult && !visionLoading && (
              <div className="omie-card bg-white h-full flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
                  style={{ background: MODULE_COLOR + '10' }}>
                  <i className="fas fa-microscope text-3xl" style={{ color: MODULE_COLOR + '40' }} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Aguardando Imagem</p>
                <p className="text-[10px] text-slate-300 font-bold mt-2 max-w-48">
                  Descreva o caso e clique em "Iniciar Análise" para ver os resultados.
                </p>
              </div>
            )}

            {visionLoading && (
              <div className="omie-card bg-white h-full flex flex-col items-center justify-center gap-5 p-12">
                <div className="w-16 h-16 border-4 border-slate-100 rounded-full animate-spin"
                  style={{ borderTopColor: MODULE_COLOR }} />
                <p className="text-[11px] font-black uppercase tracking-widest animate-pulse" style={{ color: MODULE_COLOR }}>
                  Processando na Vertex AI...
                </p>
              </div>
            )}

            {visionResult && (
              <div className="flex flex-col gap-5">
                {/* Main finding */}
                <div className="omie-card bg-white p-6 border-l-4" style={{ borderLeftColor: MODULE_COLOR }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-black text-[#020617] uppercase tracking-tight">
                        {visionResult.diagnosis?.[0] || 'Achado Principal'}
                      </h2>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                        Confiança: <span className="font-black" style={{ color: MODULE_COLOR }}>{visionResult.confidence}</span>
                      </p>
                    </div>
                    <span className={`text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${
                      (visionResult.urgency_score || 0) >= 7
                        ? 'bg-red-50 text-red-500 border border-red-100'
                        : 'bg-amber-50 text-amber-500 border border-amber-100'
                    }`}>
                      Urgência: {visionResult.urgency_score}/10
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Achados Técnicos</p>
                    <p className="text-[12px] text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
                      {visionResult.technical_findings}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Recomendação Clínica</p>
                    <div className="flex items-start gap-3">
                      <i className="fas fa-user-md mt-0.5" style={{ color: MODULE_COLOR }} />
                      <p className="text-[12px] font-bold text-slate-700">{visionResult.recommendation}</p>
                    </div>
                  </div>
                </div>

                {/* Heatmap placeholder */}
                <div className="omie-card bg-[#020617] p-0 overflow-hidden relative">
                  <div className="h-40 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Visualização da Imagem Original</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">
                      <i className="fas fa-layer-group mr-2" />Camada de Detecção Ativa
                    </p>
                    <p className="text-[9px] text-white/50 font-bold mt-0.5">Áreas de interesse destacadas automaticamente.</p>
                  </div>
                </div>
                {/* Register in prontuário */}
                <div className="omie-card bg-white p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">
                      Registrar no Prontuário
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {pets.find(p => p.id.toString() === visionPetId.toString())?.name || 'Paciente'}
                      {' — '}{new Date().toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <button
                    onClick={handleSaveVisionRecord}
                    disabled={visionSaved}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                      visionSaved
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'text-white'
                    }`}
                    style={visionSaved ? {} : { background: MODULE_COLOR }}
                  >
                    <i className={`fas ${visionSaved ? 'fa-check' : 'fa-file-medical'}`} />
                    {visionSaved ? 'Registrado no Prontuário!' : 'Registrar no Prontuário'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── HISTÓRICO ── */}
      {activeTab === 'history' && (
        <div className="flex flex-col gap-6">
          {/* Pet selector */}
          <div className="omie-card bg-white p-5 flex items-center gap-5">
            <i className="fas fa-paw text-slate-300 text-lg" />
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Paciente</label>
              <select
                value={selectedPetId}
                onChange={e => {
                  setSelectedPetId(e.target.value);
                  setHistLoaded(false);
                  loadHistory(e.target.value);
                }}
                className="omie-input !py-2 !text-sm bg-white"
              >
                {pets.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => loadHistory()}
              disabled={histLoading}
              className="omie-btn-primary flex items-center gap-2 shrink-0"
              style={{ background: MODULE_COLOR }}
            >
              {histLoading
                ? <><i className="fas fa-circle-notch fa-spin" />Carregando...</>
                : <><i className="fas fa-sync" />Atualizar</>
              }
            </button>
          </div>

          {/* Records */}
          {histLoading && (
            <div className="text-center py-16 text-[11px] font-black uppercase tracking-widest text-slate-400 animate-pulse">
              Carregando prontuários...
            </div>
          )}

          {histLoaded && history.length === 0 && (
            <div className="omie-card bg-white flex flex-col items-center justify-center py-16 text-center">
              <i className="fas fa-folder-open text-4xl text-slate-100 mb-4" />
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Nenhum prontuário encontrado</p>
              <p className="text-[10px] text-slate-300 font-bold mt-1">Realize um atendimento para gerar o primeiro registro.</p>
            </div>
          )}

          {history.length > 0 && (
            <div className="flex flex-col gap-4">
              {history.map((record: any, idx: number) => (
                <div key={idx} className="omie-card bg-white p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
                        style={{ background: MODULE_COLOR }}>
                        {record.date ? new Date(record.date).getDate() : 'H'}
                      </div>
                      <div>
                        <h4 className="text-[13px] font-black text-[#020617] uppercase tracking-tight">
                          {record.diagnosis || 'Consulta de Rotina'}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                          {record.date
                            ? new Date(record.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                            : 'Data N/A'
                          }
                          {record.vetName && <span className="ml-2">• {record.vetName}</span>}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                      record.urgency === 'Urgente'
                        ? 'bg-red-50 text-red-500 border border-red-100'
                        : 'bg-slate-50 text-slate-400 border border-slate-100'
                    }`}>
                      {record.urgency || 'Rotina'}
                    </span>
                  </div>

                  {/* SOAP summary */}
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-1">Subjetivo / Objetivo</p>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{record.subjective || record.soap_s} {record.objective || record.soap_o}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-1">Avaliação / Plano</p>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{record.assessment || record.soap_a} {record.plan || record.soap_p}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedAiModule;