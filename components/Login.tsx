import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const success = await login(email, password);
      if (!success) {
        setError('Credenciais inválidas. Verifique seu e-mail e senha.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center h-screen w-screen bg-slate-950 animate-fade-in font-['Inter',_sans-serif]">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 px-6 items-stretch">

        {/* ===== LEFT PANEL — Brand ===== */}
        <div className="hidden md:flex flex-col justify-between rounded-2xl p-10 bg-gray-800/50 backdrop-blur-sm border border-gray-700/40">
          <div>
            {/* IT2A Logo + Product name lockup */}
            <div className="flex items-center gap-4 mb-10">
              <img
                src="/logo_white.png"
                alt="IT2A"
                className="h-9 w-auto object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-2xl font-black text-white tracking-tight leading-none">VetGrid</div>
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em] mt-1">
                  Plataforma Veterinária Enterprise
                </div>
              </div>
            </div>

            {/* Feature list */}
            <div className="space-y-7">
              {[
                { icon: 'fa-stethoscope', title: 'Prontuário & IA Clínica', desc: 'Documentação inteligente com SOAP estruturado e diagnóstico assistido.' },
                { icon: 'fa-chart-pie', title: 'BI & Relatórios', desc: 'Dashboard executivo com métricas de fidelidade e receita em tempo real.' },
                { icon: 'fa-shield-halved', title: 'Segurança IT2A', desc: 'Infraestrutura hardened com criptografia e controle de sessão.' },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                    <i className={`fas ${f.icon} text-indigo-400 text-sm`} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-black uppercase tracking-wide leading-none mb-1">{f.title}</p>
                    <p className="text-slate-400 text-[12px] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Version badge */}
          <div className="flex items-center gap-2 mt-8 text-gray-500 text-[10px] uppercase font-black tracking-widest bg-gray-900/50 px-3 py-2 rounded-full border border-gray-700/30 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            VetGrid v2.0 — Enterprise
          </div>
        </div>

        {/* ===== RIGHT PANEL — Form ===== */}
        <div className="flex items-stretch justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative border border-gray-100 flex flex-col justify-between">

            {/* Loading bar */}
            {loading && (
              <div className="absolute top-0 left-0 h-[3px] w-full bg-indigo-600 rounded-t-2xl animate-pulse" />
            )}

            {/* Header */}
            <div className="text-center mb-8">
              {/* Mobile: show logo */}
              <div className="md:hidden flex justify-center mb-4">
                <img src="/logo_white.png" alt="IT2A" className="h-8 invert opacity-60" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-1">
                Bem-vindo
              </h1>
              <p className="text-gray-400 text-sm font-medium">
                Acesso restrito ao painel VetGrid
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-2">
                <i className="fas fa-exclamation-triangle text-rose-500 text-xs" />
                <p className="text-[11px] font-black text-rose-700 uppercase tracking-tight">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail corporativo"
                disabled={loading}
                required
                className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none disabled:opacity-60"
              />

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha de acesso"
                  disabled={loading}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none pr-20 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                >
                  Recuperar Acesso
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-black uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading
                  ? <><i className="fas fa-circle-notch fa-spin text-sm" /> Autenticando...</>
                  : 'Entrar no Sistema'
                }
              </button>

              {/* Demo hint */}
              <button
                type="button"
                onClick={() => { setEmail('admin@vetsmart.com'); setPassword('123456'); }}
                className="w-full mt-1 py-2 px-4 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all"
              >
                <i className="fas fa-key mr-2 text-slate-300" />
                Demo: admin@vetsmart.com / 123456
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.15em]">
                © 2026 IT2A Intelligence Systems
              </span>
              <div className="flex gap-4">
                <i className="fas fa-headset text-slate-300 cursor-pointer hover:text-indigo-500 transition-colors" title="Suporte" />
                <i className="fas fa-book text-slate-300 cursor-pointer hover:text-indigo-500 transition-colors" title="Documentação" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
