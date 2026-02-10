import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { analyzeClinicalCase, analyzeDiagnosticImage } from '../services/vertexAiService';
import { apiService } from '../services/api';
import { openWhatsApp } from '../utils/whatsappUtils';

const AdvancedAiModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scribe' | 'vision' | 'history'>('scribe');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');

  // Load pets on mount
  React.useEffect(() => {
    const fetchPets = async () => {
        try {
            const response = await apiService.getPets();
            const allPets = response.data;
            setPets(allPets);
            if (allPets.length > 0 && !selectedPetId) {
                setSelectedPetId(allPets[0].id);
            }
        } catch (error) {
            console.error('Error fetching pets:', error);
        }
    };
    fetchPets();
  }, []);

  // Scribe State
  const [rawNotes, setRawNotes] = useState('');
  const [clinicalResult, setClinicalResult] = useState<any>(null);

  // Vision State
  const [imageType, setImageType] = useState('Raio-X');
  const [imageDesc, setImageDesc] = useState('');
  const [visionResult, setVisionResult] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  const handleScribeAnalysis = async () => {
    if (!rawNotes) return;
    setLoading(true);
    try {
      const selectedPet = pets.find(p => p.id.toString() === selectedPetId.toString());
      const petDetails = selectedPet ? {
        species: selectedPet.species,
        breed: selectedPet.breed,
        age: selectedPet.age, // Assuming age is available or calculated
        name: selectedPet.name
      } : { species: 'Desconhecido', breed: 'Desconhecido', age: 0, name: 'Desconhecido' };

      // Simple history summary from loaded history
      const historySummary = history.length > 0 
        ? `Histórico recente: ${history.slice(0, 3).map(h => h.diagnosis).join(', ')}`
        : 'Sem histórico recente.';

      const result = await analyzeClinicalCase(
        rawNotes, 
        petDetails,
        historySummary
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

  const handleSaveRecord = async () => {
    if (!clinicalResult) return;
    
    // Saving to Database via API
    try {
        await apiService.createMedicalRecord({
            pet_id: selectedPetId, 
            vet_id: '1', // Hardcoded current user for now
            date: new Date().toISOString().split('T')[0],
            soap_s: clinicalResult.structured_soap.s,
            soap_o: clinicalResult.structured_soap.o,
            soap_a: clinicalResult.structured_soap.a,
            soap_p: clinicalResult.structured_soap.p,
            diagnosis: clinicalResult.structured_soap.a.split('.')[0], 
            notes: 'Gerado via VetSmart AI'
        });
        
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    } catch (error) {
        console.error('Error saving record:', error);
        alert('Erro ao salvar prontuário.');
    }
  };

  const loadHistory = async () => {
      if (!selectedPetId) return;
      console.log(`Loading history for pet ${selectedPetId}...`);
      try {
        const response = await apiService.getMedicalRecords(selectedPetId);
        console.log('Records loaded:', response.data);
        setHistory(response.data);
      } catch (e) {
        console.error('Error loading history', e);
      }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl xl:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            VetSmart AI Copilot <span className="text-[10px] xl:text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-2 align-middle">BETA</span>
          </h1>
          <p className="text-xs xl:text-sm text-slate-500 dark:text-slate-400 mt-1">Assistente avançado para documentação clínica e diagnóstico por imagem.</p>
          
          <div className="mt-4 flex items-center gap-2">
            <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Paciente Atual:</label>
            <select 
                value={selectedPetId}
                onChange={(e) => {
                    setSelectedPetId(e.target.value);
                    if (activeTab === 'history') {
                        // Small delay to allow state to update before reload (or use useEffect)
                        setTimeout(() => loadHistory(), 100); 
                    }
                }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                ))}
            </select>
          </div>
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
          <button 
            onClick={() => { setActiveTab('history'); loadHistory(); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <i className="fas fa-history mr-2"></i> Histórico
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
              <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 relative">
                <i className="fas fa-file-medical text-6xl mb-4 opacity-20"></i>
                <p className="font-medium">O prontuário estruturado aparecerá aqui.</p>
                <p className="text-xs mt-2 opacity-60 max-w-48 text-center">Após gerar, você poderá salvar no histórico do paciente.</p>
                
                {/* Placeholder Save Button to show feature existence */}
                <button disabled className="mt-6 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg text-sm font-bold cursor-not-allowed flex items-center gap-2">
                    <i className="fas fa-save"></i> Salvar no Prontuário
                </button>
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
                    <div className="flex items-center gap-3">
                        <span className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded text-blue-600 font-mono">CONFIDENCE: HIGH</span>
                        <button 
                            onClick={handleSaveRecord}
                            disabled={saved}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${saved ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        >
                            {saved ? (
                                <><i className="fas fa-check"></i> Salvo!</>
                            ) : (
                                <><i className="fas fa-save"></i> Salvar no Prontuário</>
                            )}
                        </button>
                    </div>
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
                                    {item.reason && <span className="text-[10px] text-slate-400 max-w-24 truncate" title={item.reason}>{item.reason}</span>}
                                    <i className="fas fa-check-circle text-emerald-500"></i>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Owner Instructions */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 relative">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <i className="fab fa-whatsapp text-green-500"></i> Instruções ao Tutor
                            </h4>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        const text = clinicalResult.owner_instructions?.whatsapp_format || clinicalResult.owner_instructions?.text;
                                        navigator.clipboard.writeText(text);
                                    }}
                                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-bold transition-colors"
                                >
                                    <i className="fas fa-copy mr-1"></i> Copiar
                                </button>
                                <button 
                                    onClick={() => {
                                        const text = clinicalResult.owner_instructions?.whatsapp_format || clinicalResult.owner_instructions?.text;
                                        openWhatsApp('5511999999999', text); // Mock phone for demo
                                    }}
                                    className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold transition-colors"
                                >
                                    <i className="fas fa-paper-plane mr-1"></i> Enviar
                                </button>
                            </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans border border-green-100 dark:border-green-800/30">
                            {clinicalResult.owner_instructions?.whatsapp_format || clinicalResult.owner_instructions?.text}
                        </div>
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

      {/* HISTORY MODE */}
      {activeTab === 'history' && (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <i className="fas fa-history text-emerald-500"></i> Prontuário de {pets.find(p => p.id === selectedPetId)?.name || 'Paciente'} (Histórico)
                </h3>
                <div className="space-y-4">
                    {history.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <i className="fas fa-folder-open text-4xl mb-3 opacity-20"></i>
                            <p className="text-sm">Nenhum registro encontrado.</p>
                        </div>
                    ) : (
                        history.map((record, idx) => (
                            <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm">
                                            {record.date ? new Date(record.date).getDate() : 'H'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-700 dark:text-slate-200">{record.diagnosis || 'Consulta de Rotina'}</h4>
                                            <p className="text-xs text-slate-500">{record.date ? new Date(record.date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Data N/A'} • {record.vetName}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${record.urgency === 'Urgente' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {record.urgency || 'Rotina'}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Subjetivo & Objetivo</p>
                                        <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{record.subjective} {record.objective}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Avaliação & Plano</p>
                                        <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{record.assessment} {record.plan}</p>
                                    </div>
                                </div>
                                
                                <button className="mt-4 w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    Ver Detalhes Completos
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAiModule;