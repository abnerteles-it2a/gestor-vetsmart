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
        setMsg('Conta criada! Bem-vindo ao Gestor Vetsmart.');
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center h-screen w-screen bg-slate-900">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 px-8">
        {/* Left Panel - Branding */}
        <div className="hidden md:flex flex-col items-center justify-center rounded-2xl p-10 bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="flex items-center gap-3 mb-3 w-full max-w-md">
            {showLogo && (
              <img 
                src="/logo_white.png" 
                alt="Logo" 
                className="h-16 w-auto object-contain" 
                onError={() => { setLogoErr(logoErr + 1); setShowLogo(false); }} 
              />
            )}
            <div>
              <div className="text-3xl font-bold text-white">Gestor Vetsmart</div>
              <div className="text-sm text-slate-300">Gestão Veterinária Inteligente</div>
            </div>
          </div>
          <p className="text-slate-400 text-center max-w-md mt-4">
            Plataforma completa para gestão de clínicas veterinárias, prontuários eletrônicos, agendamentos, telemedicina e controle financeiro.
          </p>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex items-center justify-center p-0">
          <div className="w-full max-w-lg bg-white rounded-2xl p-10 shadow-2xl relative">
            {busy && <div className="absolute top-0 left-0 h-1 w-full bg-blue-600 animate-pulse rounded-t-2xl" />}
            
            <div className="flex items-center justify-center gap-2 mb-6 md:hidden">
              {showLogo && (
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="h-10 w-auto object-contain" 
                  onError={() => { setLogoErr(logoErr + 1); setShowLogo(false); }} 
                />
              )}
              <span className="text-lg font-bold text-slate-900">Gestor Vetsmart</span>
            </div>
            
            {!isSignUpOpen ? (
              <>
                <div className="text-center mb-8">
                   <h2 className="text-2xl font-bold text-slate-800">Bem-vindo de volta</h2>
                   <div className="text-sm text-slate-500 mt-1">Entre com suas credenciais para acessar</div>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">E-mail</label>
                    <input 
                      value={email} 
                      onChange={(e)=>setEmail(e.target.value)} 
                      placeholder="seu@email.com" 
                      disabled={busy} 
                      type="email"
                      required
                      className="w-full px-3 py-3 rounded-lg text-sm border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all disabled:opacity-60 bg-slate-50" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Senha</label>
                    <input 
                      value={password} 
                      onChange={(e)=>setPassword(e.target.value)} 
                      type="password" 
                      placeholder="••••••••" 
                      disabled={busy} 
                      required
                      className="w-full px-3 py-3 rounded-lg text-sm border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all disabled:opacity-60 bg-slate-50" 
                    />
                  </div>
                  
                  {msg && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center gap-2">
                    <i className="fas fa-exclamation-circle"></i> {msg}
                  </div>}

                  <button 
                    type="submit"
                    disabled={busy} 
                    className="w-full py-3 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-70 shadow-sm hover:shadow-md mt-2"
                  >
                    {busy ? 'Entrando...' : 'Entrar na plataforma'}
                  </button>
                </form>
                
                <div className="text-center border-t border-slate-100 pt-6">
                  <span className="text-xs text-slate-500">Não tem uma conta? </span>
                  <button 
                    onClick={()=>{ setSuEmail(email); setSuPassword(password); setIsSignUpOpen(true); setMsg(null); }} 
                    disabled={busy} 
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline disabled:opacity-50 ml-1"
                  >
                    Criar conta
                  </button>
                </div>
              </>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="text-center mb-8">
                   <h2 className="text-2xl font-bold text-slate-800">Criar conta</h2>
                   <div className="text-sm text-slate-500 mt-1">Preencha os dados para se cadastrar</div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Nome completo</label>
                    <input 
                      value={suName} 
                      onChange={(e)=>setSuName(e.target.value)} 
                      placeholder="Seu nome" 
                      disabled={busy} 
                      className="w-full px-3 py-3 rounded-lg text-sm border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all disabled:opacity-60 bg-slate-50" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">E-mail corporativo</label>
                    <input 
                      value={suEmail} 
                      onChange={(e)=>setSuEmail(e.target.value)} 
                      placeholder="seu@email.com" 
                      disabled={busy} 
                      className="w-full px-3 py-3 rounded-lg text-sm border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all disabled:opacity-60 bg-slate-50" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Senha de acesso</label>
                    <input 
                      type="password" 
                      value={suPassword} 
                      onChange={(e)=>setSuPassword(e.target.value)} 
                      placeholder="Mínimo 6 caracteres" 
                      disabled={busy} 
                      className="w-full px-3 py-3 rounded-lg text-sm border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all disabled:opacity-60 bg-slate-50" 
                    />
                  </div>
                </div>
                
                {msg && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg mb-4 border border-red-100 flex items-center gap-2">
                   <i className="fas fa-exclamation-circle"></i> {msg}
                </div>}
                
                <div className="flex items-center gap-3 pt-2">
                  <button 
                    onClick={()=>setIsSignUpOpen(false)} 
                    className="flex-1 py-3 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={handleSignUpSubmit} 
                    disabled={busy} 
                    className="flex-[2] py-3 rounded-lg text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-70 shadow-sm hover:shadow"
                  >
                    {busy ? 'Criando...' : 'Confirmar cadastro'}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="absolute bottom-6 text-center text-xs text-slate-500/50 w-full md:w-auto md:text-white/20">
            © 2026 Gestor Vetsmart • Todos os direitos reservados
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
