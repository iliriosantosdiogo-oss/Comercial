import { useState, useEffect } from 'react';
import React from 'react';
import { useAuth } from '../App';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { Product } from '../types';
import { improveDescription, generateProductImage } from '../services/geminiService';
import { Plus, Trash2, Package, Tag, DollarSign, Image as ImageIcon, ExternalLink, X, Wand2, Loader2, Upload, Layout, Copy, Check, Users, Sparkles, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const { store } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [improvingAI, setImprovingAI] = useState(false);
  const [copied, setCopied] = useState(false);

  // States for professional multi-image upload & AI mixing/generation
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [presetStyle, setPresetStyle] = useState<string>("Estúdio Minimalista");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [aiProgressText, setAiProgressText] = useState("");

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    active: true
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price.toString(),
        imageUrl: editingProduct.imageUrl || '',
        active: editingProduct.active
      });
      setUploadedImages([]); // Start fresh with image upload state
    } else {
      setFormData({ name: '', description: '', price: '', imageUrl: '', active: true });
      setUploadedImages([]);
    }
  }, [editingProduct]);

  const fetchProducts = async () => {
    if (!store) return;
    try {
      const q = query(collection(db, 'products'), where('storeId', '==', store.id));
      const snapshot = await getDocs(q);
      const items = (snapshot as any).docs.map((d: any) => ({ id: d.id, ...d.data() } as Product));
      setProducts(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [store]);

  const handleAIMagic = async () => {
    if (!formData.name) return;
    setImprovingAI(true);
    try {
      const improved = await improveDescription(formData.name, formData.description);
      setFormData(prev => ({ ...prev, description: improved }));
    } catch (err) {
      console.error(err);
    } finally {
      setImprovingAI(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const remainingSlots = 3 - uploadedImages.length;
    const filesArray = Array.from(files).slice(0, remainingSlots);
    
    filesArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setUploadedImages(prev => [...prev, reader.result as string].slice(0, 3));
        }
      };
      reader.readAsDataURL(file as File);
    });
  };

  const removeUploadedImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleGenerateAIImage = async () => {
    if (!formData.name) {
      alert("Por favor, digite o nome do produto primeiro!");
      return;
    }
    
    setGeneratingImage(true);
    setAiProgressText(`Analisando o produto "${formData.name}"...`);
    
    const interval = setInterval(() => {
      setAiProgressText(prev => {
        if (prev.includes("Analisando")) {
          return `Ajustando iluminação no estilo "${presetStyle}"...`;
        } else if (prev.includes("iluminação")) {
          return uploadedImages.length > 0 
            ? `Misturando detalhes das ${uploadedImages.length} fotos de referência...`
            : "Gerando textura fotorrealista de estúdio...";
        } else if (prev.includes("Misturando") || prev.includes("textura fotorrealista")) {
          return "Finalizando masterização e contraste...";
        } else {
          return "Renderizando em alta definição...";
        }
      });
    }, 2000);

    try {
      const resultImageUrl = await generateProductImage({
        productName: formData.name,
        productDescription: formData.description,
        uploadedImages,
        presetStyle
      });
      setFormData(prev => ({ ...prev, imageUrl: resultImageUrl }));
    } catch (err) {
      console.error(err);
    } finally {
      clearInterval(interval);
      setGeneratingImage(false);
      setAiProgressText("");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;

    const productsPath = 'products';
    const payload = {
      ...formData,
      storeId: store.id,
      price: parseFloat(formData.price),
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), payload);
      } else {
        await addDoc(collection(db, 'products'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      setShowAddModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, productsPath);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este produto do catálogo?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const copyLink = () => {
    if (!store) return;
    const url = `${window.location.origin}/s/${store.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const storeLink = `${window.location.origin}/s/${store?.slug}`;
  const inviteLink = `${window.location.origin}/login?ref=${store?.inviteCode}`;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-2 space-y-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2 italic">Painel A.S Comercial</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Gestão Simples do seu Negócio</p>
              </div>
              <button 
                onClick={() => { setEditingProduct(null); setShowAddModal(true); }}
                className="bg-primary text-white px-8 py-4 rounded-[2rem] font-black text-lg flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-2xl shadow-primary/30 active:scale-95"
              >
                <Plus size={24} /> NOVO PRODUTO
              </button>
           </div>

           {/* Quick Stats/Links */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
                 <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Sua Loja ao Vivo</h3>
                    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 overflow-hidden">
                       <span className="text-xs font-mono text-slate-400 truncate flex-1">{storeLink}</span>
                       <button onClick={copyLink} className="text-primary hover:scale-110 transition-transform">
                          {copied ? <Check size={18} /> : <Copy size={18} />}
                       </button>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <a href={storeLink} target="_blank" className="flex-1 bg-secondary text-primary-dark py-4 rounded-xl font-black text-center text-sm shadow-sm hover:brightness-95 transition-all">
                       VER COMO CLIENTE
                    </a>
                 </div>
              </div>

              <div className="bg-slate-900 border-indigo-400 p-8 rounded-[2.5rem] text-white flex flex-col justify-between">
                 <div>
                    <div className="flex items-center gap-3 mb-4">
                       <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                          <Users size={16} />
                       </div>
                       <h3 className="text-xs font-black text-indigo-300 uppercase tracking-widest">Convide Amigos</h3>
                    </div>
                    <p className="text-sm font-medium text-slate-400 mb-6 leading-relaxed">Ganhe destaque no A.S Comercial convidando outros lojistas para a plataforma.</p>
                 </div>
                 <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-black text-xs tracking-widest hover:bg-slate-100 transition-colors">
                    COPIAR LINK DE CONVITE
                 </button>
              </div>
           </div>
        </div>

        <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100 flex flex-col gap-6">
           <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles size={32} />
           </div>
           <h4 className="text-2xl font-black text-slate-800 italic">Dica de IA</h4>
           <p className="text-emerald-700 font-medium text-sm leading-relaxed">
             Produtos com descrições mais curtas e diretas vendem <span className="font-black">40% mais</span> no WhatsApp. Use nossa IA para otimizar seus textos!
           </p>
        </div>
      </div>

      <div className="mb-10 flex items-center gap-4">
         <div className="h-px bg-slate-100 flex-1" />
         <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Seu Catálogo</h2>
         <div className="h-px bg-slate-100 flex-1" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96 bg-slate-50 animate-pulse rounded-[2.5rem]" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
           <Package className="mx-auto text-slate-200 mb-6" size={64} strokeWidth={1} />
           <h3 className="text-2xl font-black text-slate-900 mb-2 italic">Tudo Vazio</h3>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8">Comece adicionando seu primeiro produto</p>
           <button onClick={() => setShowAddModal(true)} className="bg-primary text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-primary/20">
              CRIAR PRODUTO
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((p) => (
            <motion.div 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={p.id} 
              className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-50 shadow-sm hover:shadow-2xl transition-all group p-4"
            >
              <div className="aspect-square bg-slate-100 rounded-[2rem] relative overflow-hidden mb-6 shadow-inner">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <Package size={64} />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => { setEditingProduct(p); setShowAddModal(true); }} className="p-3 bg-white/95 backdrop-blur rounded-xl text-slate-600 shadow-xl hover:text-primary transition-colors">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-3 bg-white/95 backdrop-blur rounded-xl text-red-500 shadow-xl hover:bg-red-50 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="px-4 pb-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-extrabold text-slate-900 text-xl tracking-tight leading-none">{p.name}</h3>
                  <span className="font-black text-primary text-xl">Kz {p.price.toLocaleString('pt-AO')}</span>
                </div>
                <p className="text-slate-400 text-xs font-medium leading-relaxed line-clamp-2">{p.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-white rounded-[3rem] shadow-2xl relative z-10 w-full max-w-xl overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                  <h2 className="font-black text-2xl italic">{editingProduct ? 'Editar' : 'Novo'} Produto</h2>
                  <button onClick={() => setShowAddModal(false)} className="text-slate-300 hover:text-slate-900"><X /></button>
               </div>
               <form onSubmit={handleSave} className="p-8 space-y-6">
                  <div className="space-y-4">
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold"
                      placeholder="Nome do produto"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                    <div className="relative">
                      <textarea 
                        className="w-full px-6 pt-4 pb-12 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium min-h-[140px]"
                        placeholder="Descrição para o WhatsApp..."
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                      />
                      <button 
                        type="button" 
                        onClick={handleAIMagic}
                        disabled={improvingAI || !formData.name}
                        className="absolute bottom-4 right-4 bg-primary text-white p-2 rounded-xl shadow-lg hover:scale-105 transition-all disabled:opacity-30 disabled:grayscale"
                      >
                        {improvingAI ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                      </button>
                            <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Preço do Produto</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-primary text-lg">Kz</span>
                        <input 
                          required
                          type="number"
                          className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-black text-lg"
                          placeholder="0"
                          value={formData.price}
                          onChange={e => setFormData({...formData, price: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="border border-slate-100 rounded-3xl p-6 bg-slate-50/50 space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                          <ImageIcon size={14} className="text-primary" /> Imagem do Catálogo
                        </h4>
                        {formData.imageUrl && (
                          <span className="text-[9px] font-black uppercase bg-[#25D366]/10 text-[#25D366] px-3 py-1 rounded-full border border-[#25D366]/20">Ativa</span>
                        )}
                      </div>

                      {/* Active Preview */}
                      {formData.imageUrl && (
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200/60 shadow-inner bg-white group">
                          <img src={formData.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-x-0 bottom-0 bg-slate-900/60 backdrop-blur-sm p-3 text-white flex justify-between items-center">
                            <span className="text-[10px] font-bold truncate max-w-[200px] font-mono">
                              {formData.imageUrl.startsWith("data:") ? "Imagem gerada por IA (Base64)" : "URL externa do catálogo"}
                            </span>
                            <button 
                              type="button" 
                              onClick={() => setFormData({...formData, imageUrl: ""})}
                              className="text-red-400 hover:text-red-300 font-bold text-xs flex items-center gap-1 active:scale-95 transition-transform"
                            >
                              <Trash2 size={12} /> Remover
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Upload zone */}
                      <div>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Upload de Fotos de Referência ({uploadedImages.length}/3)</span>
                        <label className={cn(
                          "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all gap-2 bg-white",
                          uploadedImages.length >= 3 
                            ? "border-slate-100 opacity-50 pointer-events-none" 
                            : "border-slate-200 hover:border-primary/50 hover:bg-slate-50/50"
                        )}>
                          <Upload size={20} className="text-slate-450 hover:text-primary transition-colors" />
                          <div className="text-center">
                            <span className="text-xs font-black text-slate-800 block">Carregar fotos do celular</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Selecione ou arraste até 3 fotos</span>
                          </div>
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            onChange={handleFileUpload} 
                            className="hidden" 
                            disabled={uploadedImages.length >= 3}
                          />
                        </label>
                      </div>

                      {/* Uploaded Thumbnails list */}
                      {uploadedImages.length > 0 && (
                        <div className="flex gap-3 justify-center">
                          {uploadedImages.map((img, idx) => (
                            <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white shrink-0">
                              <img src={img} className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => removeUploadedImage(idx)}
                                className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md active:scale-90 transition-transform"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* AI Style Presets */}
                      <div className="space-y-2">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Estilo de Estúdio por IA</span>
                        <div className="grid grid-cols-3 gap-2">
                          {["Estúdio Minimalista", "Natureza Orgânica", "Neon Moderno"].map((style) => (
                            <button
                              key={style}
                              type="button"
                              onClick={() => setPresetStyle(style)}
                              className={cn(
                                "text-[9px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all border text-center",
                                presetStyle === style 
                                  ? "bg-primary text-white border-primary shadow-sm shadow-primary/20" 
                                  : "bg-white text-slate-500 border-slate-100 hover:bg-slate-100"
                              )}
                            >
                              {style.split(" ")[1] || style}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* AI Engine Box */}
                      <div className="pt-2">
                        {generatingImage ? (
                          <div className="border border-primary/20 bg-primary/5 p-4 rounded-2xl flex items-center gap-3 animate-pulse border-dashed">
                            <Loader2 size={18} className="text-primary animate-spin shrink-0" />
                            <div className="text-left">
                              <span className="text-[9px] font-black text-primary uppercase tracking-widest block">Estúdio IA A.S Comercial</span>
                              <span className="text-xs font-bold text-slate-600 block leading-tight">{aiProgressText}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <button
                              type="button"
                              onClick={handleGenerateAIImage}
                              disabled={!formData.name}
                              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white py-4 px-4 rounded-2xl font-black text-xs tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 uppercase"
                            >
                              <Sparkles size={14} className="text-primary fill-primary" />
                              {uploadedImages.length > 0 
                                ? `Misturar ${uploadedImages.length} fotos com IA` 
                                : "Gerar Foto Profissional por IA"
                              }
                            </button>
                            <p className="text-[10px] text-slate-400 text-center font-medium leading-normal italic px-2">
                              {uploadedImages.length > 0 
                                ? "Combine suas fotos amadoras em um ângulo fotorrealista perfeito!" 
                                : "Use nosso estúdio de IA para criar uma imagem incrível de catálogo a partir do nome!"}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Alternative pasting URL */}
                      <div className="pt-2 border-t border-slate-100">
                        <details className="group cursor-pointer">
                          <summary className="text-[10px] select-none text-slate-400 font-bold uppercase tracking-wider hover:text-slate-600 flex items-center justify-between">
                            <span>Inserir imagem via link alternativo</span>
                            <span className="text-xs transition-transform group-open:rotate-180">▼</span>
                          </summary>
                          <div className="mt-3">
                            <input 
                              type="url"
                              className="w-full px-5 py-3 rounded-xl border border-slate-100 bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all text-xs font-semibold text-slate-600"
                              placeholder="Fazer link da foto diretamente..."
                              value={formData.imageUrl}
                              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                            />
                          </div>
                        </details>
                      </div>
                    </div>             </div>
                  </div>
                  <button type="submit" className="w-full bg-primary text-white py-5 rounded-[1.8rem] font-black text-xl shadow-xl shadow-primary/20 active:scale-95 transition-all">
                    SALVAR PRODUTO
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
