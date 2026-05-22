import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion } from 'motion/react';
import { Store as StoreIcon, AtSign, Phone } from 'lucide-react';

export default function Onboarding() {
  const { user, setStore } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    whatsapp: '',
    description: '',
    color: '#25D366',
    currency: 'AOA',
    logoUrl: ''
  });

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      // Basic slug validation
      const cleanSlug = formData.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
      const storeId = user.uid; 
      const inviteCode = generateInviteCode();

      const newStore = {
        ownerId: user.uid,
        name: formData.name,
        slug: cleanSlug,
        whatsapp: formData.whatsapp.replace(/\D/g, ''),
        currency: formData.currency,
        description: formData.description,
        color: formData.color,
        logoUrl: formData.logoUrl,
        inviteCode,
        createdAt: serverTimestamp(),
      };

      const storePath = `stores/${storeId}`;
      try {
        await setDoc(doc(db, 'stores', storeId), newStore);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, storePath);
      }

      setStore({ id: storeId, ...newStore } as any);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      try {
        const info = JSON.parse(err.message);
        setError(`Erro de permissão (${info.operationType}): ${info.error}`);
      } catch {
        setError('Ocorreu um erro ao criar sua loja. Verifique o número do WhatsApp e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-xl border border-zinc-200"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <StoreIcon size={32} />
          </div>
          <h1 className="text-2xl font-bold">Configure sua loja</h1>
          <p className="text-zinc-500">Estamos quase lá! Faltam poucos detalhes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Nome da Loja</label>
            <input 
              required
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="Ex: Doce Sabor"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Seu Link Único</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                <AtSign size={16} />
              </span>
              <input 
                required
                type="text"
                className="w-full pl-10 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                placeholder="nome-da-loja"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
            <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">ascomercial.site/{formData.slug || 'sua-loja'}</p>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">WhatsApp</label>
            <div className="relative group">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                <Phone size={16} />
              </span>
              <input 
                required
                type="tel"
                className="w-full pl-10 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                placeholder="Ex: 244925372670"
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Descrição Curta</label>
            <textarea 
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium min-h-[100px]"
              placeholder="Ex: Os melhores doces de Luanda direto na sua mesa."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Cor Principal</label>
              <div className="flex gap-2 p-1 border border-slate-200 rounded-2xl bg-slate-50">
                {['#25D366', '#FFD700', '#FF4757', '#2F3542'].map(c => (
                  <button 
                    key={c}
                    type="button"
                    onClick={() => setFormData({...formData, color: c})}
                    className={`w-full aspect-square rounded-xl border-4 transition-all ${formData.color === c ? 'border-primary' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Moeda</label>
              <select 
                className="w-full px-4 py-4 rounded-2xl border border-slate-200 outline-none appearance-none bg-white font-bold"
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="AOA">Kwanza (Kz)</option>
                <option value="BRL">Real (R$)</option>
                <option value="USD">Dólar ($)</option>
              </select>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Finalizar Configuração'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
