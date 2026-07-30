"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, Filter, Star, Plus, Minus, X, CheckCircle2 } from "lucide-react";
import { products } from "@/data/dummy";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export default function ProdukPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();

  const categories = ["Semua", "Ban", "Oli", "Rem", "Aki", "Shock", "AC", "Lainnya"];

  const filteredProducts = products.filter((p) => {
    const matchCategory = activeCategory === "Semua" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 }];
    });
    // Buka cart otomatis saat nambah barang (opsional)
    setIsCartOpen(true);
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      }).filter(item => item.qty > 0);
    });
  };

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setIsCartOpen(false);
      router.push("/checkout");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-black text-[#F4F1DE] font-sans selection:bg-[#E07A5F]/30 pb-24">
      {/* HEADER */}
      <header className="bg-[#121212]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/home"
            className="flex items-center gap-2 text-white/70 hover:text-white transition text-sm font-semibold"
          >
            ← Kembali ke Dashboard
          </Link>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-white hover:text-[#E07A5F] transition"
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E07A5F] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="px-6 py-12 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Marketplace <span className="text-[#E07A5F]">Sparepart Premium</span>
        </h1>
        <p className="text-white/60 text-sm sm:text-base">
          Temukan suku cadang asli dan oli berkualitas tinggi untuk performa kendaraan Anda. Semua produk dijamin 100% original.
        </p>
      </section>

      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR FILTER */}
        <aside className="lg:col-span-1 space-y-8">
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-[#E07A5F]" /> Cari Produk
            </h3>
            <input 
              type="text"
              placeholder="Ketik nama produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition"
            />
          </div>

          <div className="bg-[#121212] border border-white/10 rounded-3xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#E07A5F]" /> Kategori
            </h3>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                    activeCategory === cat ? "bg-[#E07A5F] text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* PRODUCT GRID */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Menampilkan {filteredProducts.length} Produk</h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-[#121212] border border-white/10 rounded-3xl p-12 text-center text-white/50">
              Produk tidak ditemukan. Coba ubah kata kunci pencarian.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.id === "p3"; // Simulasi stok habis untuk produk id p3
                const stockLeft = isOutOfStock ? 0 : 3;

                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -5 }}
                    className="bg-[#121212] border border-white/10 rounded-3xl overflow-hidden group hover:border-[#E07A5F]/50 transition-all duration-300 flex flex-col relative"
                  >
                    {/* Image Placeholder */}
                    <div className="h-48 bg-[#1A1A1A] relative overflow-hidden">
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className={`w-full h-full object-cover transition-all duration-500 ${isOutOfStock ? "opacity-30 grayscale" : "opacity-80 group-hover:opacity-100 group-hover:scale-105"}`}
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/10">
                          {p.category}
                        </div>
                        {isOutOfStock ? (
                          <div className="bg-red-500/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-red-500/20">
                            Habis
                          </div>
                        ) : (
                          <div className="bg-[#E07A5F]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-[#E07A5F]/20">
                            Sisa {stockLeft}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-1 text-[#E07A5F] mb-2">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-xs font-bold text-white">{p.rating}</span>
                        <span className="text-xs text-white/50">({p.reviews})</span>
                      </div>
                      <h3 className="text-white font-bold text-sm sm:text-base mb-1 line-clamp-2 flex-1">
                        {p.name}
                      </h3>
                      <p className="text-[#E07A5F] font-black text-lg mb-4 mt-2">
                        Rp {p.price.toLocaleString("id-ID")}
                      </p>
                      
                      <button 
                        onClick={() => addToCart(p)}
                        disabled={isOutOfStock}
                        className="w-full bg-[#1A1A1A] hover:bg-[#E07A5F] text-white font-bold py-3 rounded-xl border border-white/10 hover:border-[#E07A5F] transition text-sm flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(224,122,95,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#1A1A1A] disabled:hover:border-white/10"
                      >
                        <ShoppingCart className="w-4 h-4" /> Tambah Keranjang
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* SHOPPING CART SIDEBAR (OVERLAY) */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#121212] border-l border-white/10 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#E07A5F]" /> Keranjang Belanja
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="text-white/50 hover:text-white transition">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="text-center text-white/50 py-20 flex flex-col items-center">
                    <ShoppingCart className="w-16 h-16 opacity-20 mb-4" />
                    <p>Keranjang Anda masih kosong.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center bg-[#1A1A1A] border border-white/5 p-3 rounded-2xl">
                      <div className="w-16 h-16 rounded-xl bg-black overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-[#E07A5F] font-semibold mt-1">Rp {item.price.toLocaleString("id-ID")}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-black rounded-lg px-2 py-1 border border-white/10">
                        <button onClick={() => updateQty(item.id, -1)} className="text-white/50 hover:text-white transition"><Minus className="w-3 h-3" /></button>
                        <span className="text-white text-xs font-bold w-4 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="text-white/50 hover:text-white transition"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-white/10 bg-[#1A1A1A]">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-white/70 text-sm">Total Belanja</span>
                    <span className="text-2xl font-black text-[#E07A5F]">Rp {totalPrice.toLocaleString("id-ID")}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full bg-[#E07A5F] hover:bg-[#d0694e] text-white font-bold py-4 rounded-xl transition shadow-lg shadow-[#E07A5F]/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isCheckingOut ? (
                      "Memproses..."
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" /> Checkout & Booking Jadwal
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
