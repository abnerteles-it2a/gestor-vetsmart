import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showLogo, setShowLogo] = useState(true);
  const [logoErr, setLogoErr] = useState<number>(0);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Sign Up states
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setBusy(true);
      setMsg(null);
      const success = await login(email, password);
      if (!success) {
        setMsg('Falha ao entrar. Verifique suas credenciais.');
      }
    } catch (e: any) {
      const m = String(e?.message || e || 'Falha ao entrar. Tente novamente.');
      setMsg(m);
    } finally {
      setBusy(false);
    }
  };

  const handleSignUpSubmit = async () => {
    try {
      setBusy(true);
      setMsg(null);
      
      const success = await register(suName, suEmail, suPassword);
      
      if (success) {
        setIsSignUpOpen(false);
        setMsg('Conta criada! Bem-vindo ao Gestor VetPro.');
      } else {
        setMsg('Erro ao criar conta. Tente outro email.');
      }
    } catch (e: any) {
      const m = String(e?.message || e || 'Falha ao criar conta. Tente novamente.');
      setMsg(m);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center h-screen w-screen bg-slate-950 animate-fade-in font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 px-8">
        {/* Left Panel - Branding */}
        <div className="hidden md:flex flex-col items-center justify-center rounded-2xl p-10 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50">
          <div className="flex items-center gap-3 mb-3 w-full max-w-md">
            <img src="/logo.png" alt="IT2a" className="h-10 w-auto object-contain" />
            <div>
              <div className="text-3xl font-bold text-white tracking-tight">Gestor Vetsmart</div>
              <div className="text-sm text-gray-400 uppercase tracking-widest font-medium">Gestão Veterinária Inteligente</div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-8 text-gray-500 text-[10px] uppercase font-black tracking-widest bg-gray-900/40 px-3 py-1.5 rounded-full border border-gray-700/30">
             <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
             SaaS Gestor v1.2 — Alpha Launch
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex items-center justify-center p-0">
          <div className="w-full max-w-lg bg-white rounded-2xl p-10 shadow-[0_10px_35px_rgba(0,0,0,0.35)] relative border border-gray-200">
            {busy && <div className="absolute top-0 left-0 h-1 w-full bg-indigo-600 animate-pulse rounded-t-2xl" />}
            
            {!isSignUpOpen ? (
              <>
                <div className="text-center mb-8">
                   <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Bem-vindo</h1>
                   <p className="text-gray-500 text-sm font-medium">Gestão inteligente para você e sua empresa</p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-3 mb-6">
                  <div>
                    <input 
                      value={email} 
                      onChange={(e)=>setEmail(e.target.value)} 
                      placeholder="E-mail" 
                      disabled={busy} 
                      type="email"
                      required
                      className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                    />
                  </div>
                  <div className="relative">
                    <input 
                      value={password} 
                      onChange={(e)=>setPassword(e.target.value)} 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Senha" 
                      disabled={busy} 
                      required
                      className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all outline-none pr-12" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600"
                    >
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button type="button" className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">
                      Esqueci minha senha
                    </button>
                  </div>
                  
                  {msg && <div className="text-[11px] font-bold text-rose-600 mt-4 bg-rose-50 p-2 rounded-lg border border-rose-100">
                    {msg}
                  </div>}

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <button 
                      type="submit"
                      disabled={busy} 
                      className="py-3 rounded-xl text-sm font-black uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
                    >
                      {busy ? 'Entrando' : 'Entrar'}
                    </button>
                    <button 
                      type="button"
                      onClick={()=>{ setIsSignUpOpen(true); setMsg(null); }} 
                      disabled={busy} 
                      className="py-3 rounded-xl text-sm font-black uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all disabled:opacity-50"
                    >
                      Criar Conta
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                   <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Nova Conta</h1>
                   <p className="text-gray-500 text-sm font-medium">Integração ao ecossistema it2a</p>
                </div>

                <div className="space-y-3 mb-6">
                  <input 
                    value={suName} 
                    onChange={(e)=>setSuName(e.target.value)} 
                    placeholder="Nome completo" 
                    className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 text-gray-900 outline-none" 
                  />
                  <input 
                    value={suEmail} 
                    onChange={(e)=>setSuEmail(e.target.value)} 
                    placeholder="E-mail" 
                    className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 text-gray-900 outline-none" 
                  />
                  <input 
                    type="password" 
                    value={suPassword} 
                    onChange={(e)=>setSuPassword(e.target.value)} 
                    placeholder="Senha (mín. 6 caracteres)" 
                    className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 bg-gray-50 text-gray-900 outline-none" 
                  />
                </div>
                
                {msg && <div className="text-[11px] font-bold text-rose-600 mt-4 bg-rose-50 p-2 rounded-lg border border-rose-100">
                   {msg}
                </div>}
                
                <div className="flex items-center gap-3 pt-4">
                  <button 
                    onClick={()=>setIsSignUpOpen(false)} 
                    className="flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={handleSignUpSubmit} 
                    disabled={busy} 
                    className="flex-[2] py-3 rounded-xl text-sm font-black uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all"
                  >
                    {busy ? 'Criando' : 'Confirmar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
