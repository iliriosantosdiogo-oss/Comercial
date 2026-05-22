import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useAuth } from '../App';
import { ShoppingBag, LogOut, LayoutDashboard, Store as StoreIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { user, store } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="h-16 border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <ShoppingBag size={18} strokeWidth={2.5} />
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-900 italic">A.S Comercial</span>
        </Link>
        
        <div className="hidden sm:flex flex-1 mx-10 justify-center">
           <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <a href="#" className="hover:text-primary transition-colors">Recursos</a>
              <a href="#" className="hover:text-primary transition-colors">Preços</a>
              <a href="#" className="hover:text-primary transition-colors">Suporte</a>
           </div>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              {store && (
                <Link 
                  to={`/s/${store.slug}`}
                  className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
                  target="_blank"
                >
                  <StoreIcon size={16} />
                  Ver Loja
                </Link>
              )}
              <Link 
                to="/dashboard"
                className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-600 transition-colors"
                title="Sair"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link 
              to="/login"
              className="bg-slate-900 text-white px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              Criar Loja
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
