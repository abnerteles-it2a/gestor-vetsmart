import React, { useState } from 'react';
import { analyzeSymptoms, analyzeImage } from '../services/vertexAiService';

const AdvancedAiModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'vision' | 'interactions'>('diagnosis');
  const [symptoms, setSymptoms] = useState('');
  const [history, setHistory] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Vision state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleAnalysis = async () => {
    if (!symptoms) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const data = await analyzeSymptoms(symptoms, history);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageAnalysis = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const data = await analyzeImage(selectedImage);
      setResult({ type: 'vision', ...data });
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedImage(ev.target?.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <i className="fas fa-brain text-purple-600 dark:text-purple-400"></i>
            IA Veterinária Avançada
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Powered by Google Cloud Vertex AI</p>
        </div>
        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('diagnosis')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'diagnosis'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Diagnóstico Assistido
          </button>
          <button
            onClick={() => setActiveTab('vision')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'vision'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Visão Computacional
          </button>
          <button
            onClick={() => setActiveTab('interactions')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'interactions'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Interações
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Area */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            {activeTab === 'diagnosis' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Dados Clínicos</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Histórico / Anamnese
                  </label>
                  <textarea
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    rows={3}
                    placeholder="Ex: Paciente canino, 5 anos, histórico de ingestão de corpos estranhos..."
                    value={history}
                    onChange={(e) => setHistory(e.target.value)}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Sintomas Atuais
                  </label>
                  <textarea
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    rows={4}
                    placeholder="Ex: Vômito bilioso frequente, diarreia com sangue, apatia severa..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                  ></textarea>
                </div>
                <button
                  onClick={handleAnalysis}
                  disabled={isAnalyzing || !symptoms}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin"></i> Processando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic"></i> Gerar Hipóteses
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'vision' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Upload de Imagem</h3>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <i className="fas fa-cloud-upload-alt text-4xl text-slate-400 mb-2"></i>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Arraste ou clique para enviar Raio-X ou USG
                  </p>
                </div>
                {selectedImage && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={selectedImage} alt="Preview" className="w-full h-48 object-cover" />
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
                <button
                  onClick={handleImageAnalysis}
                  disabled={isAnalyzing || !selectedImage}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                   {isAnalyzing ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin"></i> Analisando Pixels...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-eye"></i> Analisar Imagem
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'interactions' && (
              <div className="text-center py-8 text-slate-500">
                <i className="fas fa-pills text-4xl mb-4 text-slate-300"></i>
                <p>Módulo de Interações Medicamentosas em desenvolvimento.</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
            <div className="flex gap-3">
              <i className="fas fa-info-circle text-blue-600 dark:text-blue-400 mt-1"></i>
              <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                <strong className="block mb-1">Aviso Legal</strong>
                A inteligência artificial serve apenas como ferramenta de suporte à decisão clínica. O diagnóstico final é de responsabilidade exclusiva do médico veterinário.
              </p>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2">
          {isAnalyzing ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Consultando Vertex AI...</h3>
              <p className="text-slate-500 dark:text-slate-400">Analisando padrões em milhões de casos clínicos.</p>
            </div>
          ) : result ? (
            <div className="space-y-6 animate-fade-in">
              {/* Diagnosis Result */}
              {activeTab === 'diagnosis' && (
                <>
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-purple-500">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                          Hipótese Diagnóstica Principal
                        </p>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                          {result.diagnosis}
                        </h2>
                      </div>
                      <div className="text-center bg-slate-50 dark:bg-slate-700 px-4 py-2 rounded-lg">
                        <span className="block text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {result.probability}%
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Probabilidade</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                       {result.warnings.map((warning: string, idx: number) => (
                         <div key={idx} className="flex items-center gap-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm font-medium">
                           <i className="fas fa-exclamation-triangle"></i>
                           {warning}
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <i className="fas fa-clipboard-list text-slate-400"></i> Sugestões de Conduta
                      </h3>
                      <ul className="space-y-3">
                        {result.suggestions.map((sug: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                            <i className="fas fa-check text-green-500 mt-1"></i>
                            {sug}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm opacity-75">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <i className="fas fa-book-medical text-slate-400"></i> Diagnósticos Diferenciais
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 pb-2">
                          <span>Parvovirose Canina</span>
                          <span className="font-bold text-slate-400">65%</span>
                        </li>
                        <li className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 pb-2">
                          <span>Corpo Estranho Intestinal</span>
                          <span className="font-bold text-slate-400">42%</span>
                        </li>
                        <li className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                          <span>Pancreatite Aguda</span>
                          <span className="font-bold text-slate-400">30%</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </>
              )}

              {/* Vision Result */}
              {activeTab === 'vision' && result.type === 'vision' && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Achados Radiográficos (IA)</h3>
                  <div className="space-y-4">
                    {result.findings.map((finding: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{finding}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                     <button className="text-purple-600 dark:text-purple-400 font-bold text-sm hover:underline">
                       Gerar Laudo Completo <i className="fas fa-arrow-right ml-1"></i>
                     </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-400">
              <i className="fas fa-robot text-6xl mb-6 text-slate-200 dark:text-slate-700"></i>
              <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">Assistente Virtual Pronto</h3>
              <p className="max-w-md mx-auto">
                Insira os dados clínicos ou faça upload de exames para receber insights baseados em IA.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAiModule;
