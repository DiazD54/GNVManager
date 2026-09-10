import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert, LogIn } from 'lucide-react';
import { authService } from '../core/api/auth.service';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login(username, password);
      login(response.token, response.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E2E8F0] flex items-center justify-center p-6 font-sans selection:bg-[#00FFFF] selection:text-black">
      <div className="w-full max-w-md">
        
        {/* Encabezado */}
        <div className="text-center mb-10">
          <div className="bg-[#00FFFF] border-2 border-slate-800 inline-block p-4 shadow-md shadow-slate-300 mb-6 transform -rotate-3 hover:rotate-0 transition-transform">
            <Lock className="w-12 h-12 text-black stroke-[2px]" />
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-black" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.05)' }}>
            GNV <span className="text-[#00FFFF] bg-black px-2 py-1 ml-2">Manager</span>
          </h1>
          <p className="text-xl font-bold mt-4 uppercase tracking-widest bg-black text-white inline-block px-3 py-1">
            Acceso Restringido
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="bg-white border-2 border-slate-800 p-8 shadow-md shadow-slate-300">
          
          {error && (
            <div className="mb-6 p-4 border-2 border-slate-800 bg-[#FF4500] text-white flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 stroke-[2px]" />
              <p className="font-bold uppercase tracking-wider">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-2">Usuario</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border-2 border-slate-800 p-4 text-xl font-mono focus:outline-none focus:bg-[#00FFFF]/20 transition-colors"
                placeholder="ID de Operador"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-widest mb-2">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-slate-800 p-4 text-xl font-mono focus:outline-none focus:bg-[#00FFFF]/20 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full mt-10 p-5 border-2 border-slate-800 flex items-center justify-center gap-3 text-xl font-black uppercase tracking-widest transition-all
              ${isLoading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#00FFFF] text-black hover:-translate-y-1 hover:shadow-md shadow-slate-300 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]'}
            `}
          >
            {isLoading ? 'Verificando...' : (
              <>
                <LogIn className="w-6 h-6 stroke-[2px]" />
                Entrar al Sistema
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
