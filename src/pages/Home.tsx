import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Zap, MessageCircle, Star, Users, Phone, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (user) navigate('/dashboard');
    else navigate('/login');
  };

  return (
    <div className="flex flex-col bg-white">
      {/* Hero */}
      <section className="pt-20 pb-32 overflow-hidden px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start text-left"
          >
            <div className="inline-flex items-center gap-2 bg-primary/5 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
              <Star size={12} fill="currentColor" /> Criador de lojas mais rápido do mundo
            </div>
            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 leading-[1] tracking-tighter mb-8">
              Sua loja. <br/> Seu cliente. <br/> <span className="text-primary tracking-[-0.05em]">No WhatsApp.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg mb-10">
              Imagine criar um catálogo incrível e receber pedidos prontos no seu zap em menos de 3 minutos. O <span className="text-slate-900 font-bold uppercase tracking-tighter">A.S Comercial</span> faz isso por você.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
              <button 
                onClick={handleStart}
                className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-[2rem] font-black text-xl hover:bg-primary-dark transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 group"
              >
                CRIAR LOJA AGORA <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 leading-none">100% GRÁTIS</span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Por tempo limitado</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.85, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1 }}
            className="relative"
          >
             <div className="bg-slate-50 rounded-[3rem] p-4 shadow-inner">
                <div className="bg-white rounded-[2.5rem] shadow-premium overflow-hidden border border-slate-100 p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <ShoppingBag size={20} strokeWidth={2.5} />
                    </div>
                    <div className="font-black text-xl tracking-tight text-slate-900 italic">A.S Comercial</div>
                  </div>
                  <div className="space-y-6">
                    <div className="h-48 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300">
                      <ShoppingBag size={48} />
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-100 w-3/4 rounded-full" />
                      <div className="h-4 bg-slate-50 w-1/2 rounded-full" />
                    </div>
                    <div className="pt-4">
                      <div className="w-full bg-[#25D366] text-white py-4 rounded-xl font-black text-center text-sm tracking-widest shadow-lg shadow-[#25D366]/20">COMPRAR NO WHATSAPP</div>
                    </div>
                  </div>
                </div>
             </div>
             
             {/* Floating Badge */}
             <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 max-w-[200px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <span className="font-black text-slate-900 text-xs">COMUNIDADE</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase tracking-wider">Junte-se a mais de 4mil empreendedores</p>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Features Simple */}
      <section className="bg-slate-50/50 py-32 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <Zap className="text-yellow-500" />, title: "Instantâneo", desc: "Sua loja no ar em menos de 180 segundos. Sem complicação." },
              { icon: <MessageCircle className="text-primary" />, title: "Conversão Real", desc: "Pedidos chegam organizados no Zap. Você só fecha a venda." },
              { icon: <Phone className="text-blue-500" />, title: "Mobile First", desc: "Feito para funcionar perfeitamente em qualquer telemóvel." }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center p-8 bg-white rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{f.title}</h3>
                <p className="text-slate-500 font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-20 bg-white border-t border-slate-100 px-6 text-center">
         <div className="max-w-7xl mx-auto">
            <div className="font-black text-4xl text-slate-900 mb-8 tracking-tighter">A.S Comercial</div>
            <div className="flex justify-center gap-8 text-sm font-bold text-slate-400 uppercase tracking-widest mb-12">
               <a href="#" className="hover:text-slate-900">Facebook</a>
               <a href="#" className="hover:text-slate-900">Email</a>
               <a href="#" className="hover:text-slate-900">Termos</a>
            </div>
            <p className="text-slate-400 text-xs font-bold">© 2026 A.S Comercial - iliriosantosdiogo@gmail.com</p>
         </div>
      </footer>
    </div>
  );
}
