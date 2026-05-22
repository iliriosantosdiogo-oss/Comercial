import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Store, Product } from '../types';
import { ShoppingCart, Send, Plus, Minus, X, MessageCircle, Package, ArrowLeft, Layout, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface CartItem extends Product {
  quantity: number;
}

export default function StoreFront() {
  const { slug } = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    if (store) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [store]);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const q = query(collection(db, 'stores'), where('slug', '==', slug), limit(1));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          setLoading(false);
          return;
        }
        const storeData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Store;
        setStore(storeData);

        const pq = query(collection(db, 'products'), where('storeId', '==', storeData.id));
        const psnapshot = await getDocs(pq);
        setProducts(psnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [slug]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) return { ...item, quantity: Math.max(1, item.quantity + delta) };
      return item;
    }));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = () => {
    if (!store) return;
    let message = `*Pedido via A.S Comercial para ${store.name}*\n\n`;
    cart.forEach(item => {
      message += `• ${item.quantity}x ${item.name} - Kz ${(item.price * item.quantity).toLocaleString('pt-AO')}\n`;
    });
    message += `\n*TOTAL: Kz ${total.toLocaleString('pt-AO')}*\n\n_Gerado por A.S Comercial_`;
    window.open(`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;

  if (!store) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="font-black text-5xl mb-8 tracking-tighter opacity-10">A.S Comercial</div>
      <h1 className="text-2xl font-black italic mb-4">Loja não encontrada</h1>
      <Link to="/" className="text-primary font-bold border-b-2 border-primary">Voltar ao Início</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-32 max-w-lg mx-auto">
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-4 left-4 right-4 z-[70] max-w-lg mx-auto bg-slate-900/95 backdrop-blur text-white px-5 py-4 rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] flex items-center justify-between border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/30 shrink-0">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#25D366]">BOAS-VINDAS</p>
                <p className="text-sm font-black text-white">Olá! Seja bem-vindo à <span className="text-[#25D366] italic">{store.name}</span></p>
              </div>
            </div>
            <button 
              onClick={() => setShowWelcome(false)}
              className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Visual Header */}
      <header className="p-8 pb-12 pt-16 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] shadow-inner mb-6 flex items-center justify-center overflow-hidden border border-slate-100 italic font-black text-4xl text-primary">
          {store.logoUrl ? <img src={store.logoUrl} className="w-full h-full object-cover" /> : store.name.charAt(0)}
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2 italic uppercase">{store.name}</h1>
        <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs">{store.description}</p>
        
        <div className="mt-8 flex gap-2">
           <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
             Vendedor Verificado
           </div>
        </div>
      </header>

      {/* Catalog */}
      <main className="px-6 space-y-10">
         <div className="flex items-center gap-4">
            <div className="h-px bg-slate-100 flex-1" />
            <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Menu</h2>
            <div className="h-px bg-slate-100 flex-1" />
         </div>

         <div className="space-y-6">
            {products.map((product, index) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.45, ease: [0.16, 1, 0.3, 1] }} key={product.id}
                className="flex gap-4 p-4 bg-white rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="w-28 h-28 bg-slate-50 rounded-2xl flex-shrink-0 overflow-hidden shadow-inner flex items-center justify-center text-slate-200">
                  {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" /> : <Package size={32} />}
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg leading-tight mb-1">{product.name}</h3>
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{product.description}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-black text-slate-900 text-lg">Kz {product.price.toLocaleString('pt-AO')}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      className="bg-primary text-white px-4 py-2 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform font-bold text-xs flex items-center gap-2"
                    >
                      <Plus size={16} /> ADICIONAR
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
         </div>
      </main>

      {/* Floating Bar */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-6 right-6 z-50 max-w-[calc(512px-3rem)]"
          >
            <button 
              onClick={() => setShowCart(true)}
              className="w-full bg-slate-900 text-white rounded-[2rem] p-6 flex items-center justify-between shadow-[0_20px_50px_rgba(15,23,42,0.3)] hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center gap-4">
                 <div className="relative">
                   <div className="bg-primary w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black absolute -top-2 -right-2 transform scale-110 shadow-lg">
                      {cartCount}
                   </div>
                   <ShoppingCart size={24} />
                 </div>
                 <span className="font-black text-sm tracking-widest uppercase">Ver Sacola</span>
              </div>
              <span className="font-black text-lg">Kz {total.toLocaleString('pt-AO')}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCart(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="bg-white rounded-t-[3rem] w-full max-w-lg relative p-8 pb-12 shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-black text-2xl italic tracking-tight">Sua Sacola</h2>
                <button onClick={() => setShowCart(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><X /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 mb-8 custom-scrollbar">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                      {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900 text-sm">{item.name}</h4>
                      <p className="font-black text-primary text-xs">Kz {item.price.toLocaleString('pt-AO')}</p>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl">
                      <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-400 hover:text-slate-900"><Minus size={14} /></button>
                      <span className="font-black text-sm min-w-[1ch] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-400 hover:text-primary transition-colors"><Plus size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-50">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total do Pedido</span>
                  <span className="text-3xl font-black text-slate-900 italic">Kz {total.toLocaleString('pt-AO')}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-[#25D366] text-white py-5 rounded-[1.8rem] font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-[#25D366]/30 active:scale-95 transition-all"
                >
                  <Send size={24} /> FINALIZAR NO ZAP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
