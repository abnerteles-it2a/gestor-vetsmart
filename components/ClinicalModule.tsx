import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useNavigation } from '../context/NavigationContext';
import { KpiCard } from './KpiCard';
import { PrescriptionModal } from './PrescriptionModal';
import { ConsultationModal } from './ConsultationModal';

const MODULE_COLOR = '#00695C';

const ClinicalModule: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [prescriptionPet, setPrescriptionPet] = useState<any | null>(null);
  const [consultationPet, setConsultationPet] = useState<any | null>(null);

  useEffect(() => {
    // Set breadcrumb
    if ((window as any).__setModuleBreadcrumb) {
      (window as any).__setModuleBreadcrumb('Prontuário');
    }
    apiService.getPets().then(res => {
      setPatients(res.data);
      setLoading(false);
    });
  }, []);

  const filteredPatients = patients.filter(p => {
    const matchSearch = p.name?.toUpperCase().includes(search.toUpperCase()) ||
      p.tutor?.toUpperCase().includes(search.toUpperCase());
    if (activeFilter === 'todos') return matchSearch;
    return matchSearch;
  });

  if (loading) return (
    <div className="p-10 text-[10px] font-black uppercase text-slate-400 tracking-widest animate-pulse">
      Sincronizando it2a Clinical...
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-portal-enter pb-10">

      {/* Module Header */}
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Prontuário Médico</h1>
          <p className="text-2xl font-black text-[#020617] uppercase tracking-tight">Atendimento &amp; Diagnóstico</p>
        </div>
        <div className="flex gap-4">
          <button className="omie-btn-secondary">Exportar Laudos</button>
          <button
            onClick={() => setConsultationPet({ id: 'new', name: 'Novo Paciente', species: 'Canino' })}
            className="omie-btn-primary"
          >
            <i className="fas fa-plus mr-2" />Novo Atendimento
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <KpiCard
          title="Pacientes Ativos"
          value={patients.length.toString()}
          icon={<i className="fas fa-paw"></i>}
          subtext="Total cadastrado"
          subtextColor="text-slate-400"
          color={MODULE_COLOR}
        />
        <KpiCard
          title="Em Atendimento"
          value="3"
          icon={<i className="fas fa-stethoscope"></i>}
          subtext="Consultórios ocupados"
          subtextColor="text-[#FF9F1C]"
          color={MODULE_COLOR}
        />
        <KpiCard
          title="Aguardando Triagem"
          value="7"
          icon={<i className="fas fa-clock-rotate-left"></i>}
          subtext="Na fila de espera"
          subtextColor="text-rose-500"
          color={MODULE_COLOR}
        />
        <KpiCard
          title="Alta Hoje"
          value="12"
          icon={<i className="fas fa-check-circle"></i>}
          subtext="Atendimentos concluídos"
          subtextColor="text-emerald-500"
          color={MODULE_COLOR}
        />
      </div>

      {/* Control Bar */}
      <div className="omie-card p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="PESQUISAR PACIENTE POR NOME OU TUTOR..."
            className="omie-input !pl-10 !py-2.5 !rounded-lg !text-[11px] !font-bold !bg-slate-50 border-transparent focus:!bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value.toUpperCase())}
          />
        </div>
        <div className="flex bg-slate-50 rounded-full p-1 border border-slate-100">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'atendimento', label: 'Em Atendimento' },
            { id: 'espera', label: 'Aguardando' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeFilter === f.id
                  ? 'text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              style={activeFilter === f.id ? { background: MODULE_COLOR } : {}}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="omie-table-container">
        <div className="omie-card-header">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Lista de Pacientes</h3>
          <span className="px-3 py-1 bg-slate-50 text-[10px] font-black text-slate-400 rounded-full uppercase tracking-widest border border-slate-100">
            {filteredPatients.length} pacientes
          </span>
        </div>
        <table className="omie-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Espécie / Raça</th>
              <th>Tutor</th>
              <th>Última Visita</th>
              <th>Status</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((pet, idx) => (
              <tr key={pet.id || idx} className="group">
                <td>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 group-hover:border-[#00695C]/30 transition-colors shrink-0">
                      {pet.photoUrl ? (
                        <img src={pet.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <i className="fas fa-paw text-slate-200 text-sm"></i>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-[#020617] uppercase tracking-tight group-hover:text-[#00695C] transition-colors">{pet.name}</span>
                      <span className="text-[9px] font-bold text-slate-300 uppercase">#{pet.id}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex flex-col">
                    <span
                      className="text-[10px] font-black uppercase tracking-widest"
                      style={{ color: MODULE_COLOR }}
                    >{pet.species}</span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase">{pet.breed || 'SRD'}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-user-circle text-slate-300 text-[11px]"></i>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{pet.tutor}</span>
                  </div>
                </td>
                <td>
                  <span className="text-[11px] font-bold text-slate-600 uppercase">{pet.lastVisit || 'N/A'}</span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                      {pet.status || 'Ativo'}
                    </span>
                  </div>
                </td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setConsultationPet(pet)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-[#00695C]/30 text-[#00695C] hover:bg-[#00695C]/5 transition-all"
                    >
                      <i className="fas fa-stethoscope text-[9px]" />
                      Atender
                    </button>
                    <button
                      onClick={() => setPrescriptionPet(pet)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-all"
                    >
                      <i className="fas fa-file-prescription text-[9px]" />
                      Receita
                    </button>
                    <button
                      onClick={() => navigateTo('patients', { petId: pet.id, subTab: 'history' })}
                      className="omie-btn-primary !px-5 !py-2 !text-[9px] shadow-none"
                    >
                      Prontuário
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-20">
                  <i className="fas fa-paw text-4xl text-slate-100 mb-4 block"></i>
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Nenhum paciente encontrado.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* it2a Insight Footer */}
        <div className="omie-table-summary">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">it2a Diagnosis Insight</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full" style={{ background: MODULE_COLOR }}></div>
              <div className="w-1 h-1 rounded-full" style={{ background: MODULE_COLOR }}></div>
              <div className="w-1 h-1 rounded-full bg-slate-200"></div>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Total: {filteredPatients.length} pacientes
          </span>
        </div>
      </div>

      {/* Consultation Modal */}
      {consultationPet && (
        <ConsultationModal
          pet={{
            id: consultationPet.id,
            name: consultationPet.name,
            species: consultationPet.species,
            breed: consultationPet.breed,
            age: consultationPet.age,
            weight: consultationPet.weight,
            tutor: consultationPet.tutor_name || consultationPet.tutor,
            photoUrl: consultationPet.photo_url || consultationPet.photoUrl,
          }}
          onClose={() => setConsultationPet(null)}
        />
      )}

      {/* Prescription Modal */}
      {prescriptionPet && (
        <PrescriptionModal
          pet={{
            id: prescriptionPet.id,
            name: prescriptionPet.name,
            species: prescriptionPet.species,
            breed: prescriptionPet.breed,
            weight: prescriptionPet.weight,
            tutor: prescriptionPet.tutor_name || prescriptionPet.tutor,
          }}
          onClose={() => setPrescriptionPet(null)}
        />
      )}
    </div>
  );
};

export default ClinicalModule;