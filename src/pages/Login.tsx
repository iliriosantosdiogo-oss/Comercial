import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export default function Login() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSimulatedLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    
    setLoading(true);
    // Simulation logic: wait and then use Google Login for real persistence
    // In a real app, logic would use phone auth. Here we stick to Google for the sandbox but dress it up.
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto focus next
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-[calc(100-64px)] flex items-center justify-center p-6 bg-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/10">
            <MessageSquare size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Entrar no A.S Comercial</h1>
          <p className="text-slate-500 font-medium">Sua loja incrível começa aqui.</p>
        </div>

        <form onSubmit={handleSimulatedLogin} className="space-y-6">
          {step === 1 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Seu Nome</label>
                <input 
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                  placeholder="Como quer ser chamado?"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">WhatsApp</label>
                <input 
                  required
                  type="tel"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                  placeholder="55 11 99999-9999"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95"
              >
                Continuar <ArrowRight size={20} />
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Código de 4 dígitos</label>
                <div className="flex justify-center gap-4">
                  {code.map((c, i) => (
                    <input 
                      key={i}
                      id={`code-${i}`}
                      required
                      type="text"
                      maxLength={1}
                      value={c}
                      onChange={e => handleCodeChange(i, e.target.value)}
                      className="w-16 h-16 text-center text-2xl font-black rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                    />
                  ))}
                </div>
                <p className="text-center text-slate-400 text-sm mt-6 flex items-center justify-center gap-2">
                  <ShieldCheck size={16} /> Código simulado para sua segurança
                </p>
              </div>
              <button 
                disabled={loading}
                type="submit"
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl active:scale-95"
              >
                {loading ? 'Acessando...' : 'Entrar na Conta'}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-slate-500 font-bold hover:text-slate-700 transition-colors">
                Alterar dados
              </button>
            </motion.div>
          )}
        </form>

        <div className="mt-12 text-center text-xs text-slate-400 font-medium pb-10">
          Ao clicar em entrar você aceita nossos <br/> termos e condições de uso.
        </div>
      </motion.div>
    </div>
  );
}
