import React, { useState } from 'react';
import { analyzeClinicalCase, analyzeDiagnosticImage } from '../services/vertexAiService';

const AIConsultation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scribe' | 'vision'>('scribe');
  const [loading, setLoading] = useState(false);

  // Scribe State
  const [rawNotes, setRawNotes] = useState('');
  const [clinicalResult, setClinicalResult] = useState<any>(null);

  // Vision State
  const [imageType, setImageType] = useState('Raio-X');
  const [imageDesc, setImageDesc] = useState('');
  const [visionResult, setVisionResult] = useState<any>(null);

  const handleScribeAnalysis = async () => {
    if (!rawNotes) return;
    setLoading(true);
    try {
      // Mock Pet/History for demo
      const result = await analyzeClinicalCase(
        rawNotes, 
        { species: 'Canino', breed: 'Golden Retriever', age: 5, name: 'Thor' },
        'Histórico de ingestão de corpos estranhos.'
      );
      setClinicalResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVisionAnalysis = async () => {
    if (!imageDesc) return;
    setLoading(true);
    try {
      const result = await analyzeDiagnosticImage(imageType, imageDesc);
      setVisionResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            VetSmart AI Copilot <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-2 align-middle">BETA</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Assistente avançado para documentação clínica e diagnóstico por imagem.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('scribe')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'scribe' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <i className="fas fa-microphone-alt mr-2"></i> Smart Scribe
          </button>
          <button 
            onClick={() => setActiveTab('vision')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'vision' ? 'bg-white dark:bg-slate-700 shadow text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <i className="fas fa-eye mr-2"></i> Vet Vision
          </button>
        </div>
      </header>

      {/* SCRIBE MODE */}
      {activeTab === 'scribe' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 h-full">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <i className="fas fa-pen-to-square text-blue-500"></i> Notas da Consulta
              </h3>
              <p className="text-xs text-slate-500 mb-3">Digite ou dite as observações soltas. A IA estruturará tudo.</p>
              <textarea 
                className="w-full h-64 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-sm resize-none mb-4"
                placeholder="Ex: Thor, 5 anos, vômito amarelo hoje cedo. Comeu grama. Temp 39. Abdomen tenso. Vou pedir ultrassom e hemograma. Receitar Plasil e Omeprazol..."
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
              />
              <button 
                onClick={handleScribeAnalysis}
                disabled={loading || !rawNotes}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><i className="fas fa-circle-notch fa-spin"></i> Processando...</>
                ) : (
                  <><i className="fas fa-wand-magic-sparkles"></i> Gerar Prontuário</>
                )}
              </button>
            </div>
          </div>

          {/* Output Column */}
          <div className="lg:col-span-2 space-y-6">
            {!clinicalResult && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12">
                <i className="fas fa-file-medical text-6xl mb-4 opacity-20"></i>
                <p>O prontuário estruturado aparecerá aqui.</p>
              </div>
            )}

            {loading && !clinicalResult && (
               <div className="space-y-4 animate-pulse">
                 <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                 <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
               </div>
            )}

            {clinicalResult && (
              <div className="animate-fade-in space-y-6">
                {/* SOAP Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-3 border-b border-blue-100 dark:border-blue-800 flex justify-between items-center">
                    <h4 className="font-bold text-blue-700 dark:text-blue-300">SOAP Estruturado</h4>
                    <span className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded text-blue-600 font-mono">CONFIDENCE: HIGH</span>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-6">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Subjetivo</span>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{clinicalResult.structured_soap.s}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Objetivo</span>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{clinicalResult.structured_soap.o}</p>
                    </div>
                    <div className="col-span-2 h-px bg-slate-100 dark:bg-slate-800"></div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Avaliação</span>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{clinicalResult.structured_soap.a}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Plano</span>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{clinicalResult.structured_soap.p}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Billing Suggestions */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <i className="fas fa-file-invoice-dollar text-emerald-500"></i> Sugestão de Faturamento
                        </h4>
                        <ul className="space-y-3">
                            {clinicalResult.suggested_billing?.map((item: any, idx: number) => (
                                <li key={idx} className="flex justify-between items-center text-sm p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <span className="text-slate-700 dark:text-slate-300">{item.item}</span>
                                    {item.reason && <span className="text-[10px] text-slate-400 max-w-[100px] truncate" title={item.reason}>{item.reason}</span>}
                                    <i className="fas fa-check-circle text-emerald-500"></i>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Owner Instructions */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 relative">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <i className="fab fa-whatsapp text-green-500"></i> Instruções ao Tutor
                        </h4>
                        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans">
                            {clinicalResult.owner_instructions?.whatsapp_format || clinicalResult.owner_instructions?.text}
                        </div>
                        <button className="absolute top-6 right-6 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full font-bold transition-colors">
                            Copiar
                        </button>
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISION MODE */}
      {activeTab === 'vision' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 mb-6">Upload de Imagem Diagnóstica</h3>
                
                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Modalidade</label>
                    <div className="flex gap-3">
                        {['Raio-X', 'Ultrassom', 'Dermatologia', 'Microscopia'].map(type => (
                            <button 
                                key={type}
                                onClick={() => setImageType(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium border ${imageType === type ? 'bg-purple-100 border-purple-500 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-800/50 mb-6 group cursor-pointer hover:border-purple-400 transition-colors">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <i className="fas fa-cloud-upload-alt text-2xl"></i>
                    </div>
                    <p className="font-bold text-slate-700 dark:text-slate-200">Arraste sua imagem aqui</p>
                    <p className="text-xs text-slate-500 mt-2">DICOM, JPEG, PNG (Simulado)</p>
                </div>

                <div className="space-y-4">
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Descrição do Caso (Contexto para IA)</label>
                     <textarea 
                        className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                        placeholder="Descreva o que você vê ou selecione um caso de teste..."
                        value={imageDesc}
                        onChange={(e) => setImageDesc(e.target.value)}
                     />
                     
                     <div className="flex gap-2 overflow-x-auto pb-2">
                        <button onClick={() => setImageDesc("Fratura completa em rádio distal, cão pequeno porte.")} className="whitespace-nowrap px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs text-slate-600 hover:bg-slate-200">Teste: Fratura</button>
                        <button onClick={() => setImageDesc("Mancha circular avermelhada com bordas descamativas no dorso.")} className="whitespace-nowrap px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs text-slate-600 hover:bg-slate-200">Teste: Dermato</button>
                        <button onClick={() => setImageDesc("Imagem de ultrassom mostrando espessamento da parede da bexiga.")} className="whitespace-nowrap px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs text-slate-600 hover:bg-slate-200">Teste: Cistite</button>
                     </div>

                     <button 
                        onClick={handleVisionAnalysis}
                        disabled={loading || !imageDesc}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Analisando Pixels...' : 'Iniciar Análise VetVision'}
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {!visionResult && !loading && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12">
                         <i className="fas fa-microscope text-6xl mb-4 opacity-20"></i>
                         <p>Os resultados da análise aparecerão aqui.</p>
                    </div>
                )}
                
                {loading && !visionResult && (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        <p className="text-purple-600 font-bold animate-pulse">Processando imagem na Vertex AI...</p>
                    </div>
                )}

                {visionResult && (
                    <div className="animate-fade-in space-y-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border-l-4 border-purple-500">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{visionResult.diagnosis?.[0]}</h2>
                                    <p className="text-sm text-slate-500">Confiança da IA: <span className="font-bold text-purple-600">{visionResult.confidence}</span></p>
                                </div>
                                <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${visionResult.urgency_score >= 7 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                    Urgência: {visionResult.urgency_score}/10
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Achados Técnicos</h4>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                                    {visionResult.technical_findings}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Recomendação Clínica</h4>
                                <div className="flex items-start gap-3">
                                    <i className="fas fa-user-md text-purple-500 mt-1"></i>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{visionResult.recommendation}</p>
                                </div>
                            </div>
                        </div>

                        {/* Simulated Heatmap / Overlay */}
                        <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                            <div className="bg-slate-800 h-64 w-full flex items-center justify-center text-slate-500">
                                <span className="text-xs">[Visualização da Imagem Original]</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                                <p className="font-bold text-sm"><i className="fas fa-layer-group mr-2"></i>Camada de Detecção Ativa</p>
                                <p className="text-xs opacity-80">Áreas de interesse destacadas automaticamente.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default AIConsultation;