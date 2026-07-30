"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, ChevronLeft, MapPin, Truck, CreditCard, ShoppingCart } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Simulasi data dari state keranjang
  const [cartItems] = useState([
    { id: "p1", name: "Michelin Pilot Sport 4S (245/35 R20)", price: 4500000, qty: 2, image: "https://images.unsplash.com/photo-1622340356501-8b9a2c262e3d?q=80&w=200&auto=format&fit=crop" },
    { id: "p2", name: "Motul 300V Power 5W-40 2L", price: 850000, qty: 1, image: "https://images.unsplash.com/photo-1635784384591-10c0349b1076?q=80&w=200&auto=format&fit=crop" },
  ]);

  const [checkoutData, setCheckoutData] = useState({
    address: "",
    shipping: "",
    payment: "",
  });

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const shippingCost = checkoutData.shipping === "express" ? 150000 : checkoutData.shipping === "regular" ? 50000 : 0;
  const total = subtotal + shippingCost;

  const handleNext = () => setStep((p) => Math.min(p + 1, 3));
  const handlePrev = () => setStep((p) => Math.max(p - 1, 1));

  const submitCheckout = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#1A1A1A] border border-white/10 rounded-3xl p-10 text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Pesanan Diterima!</h2>
          <p className="text-white/60 mb-8">
            Terima kasih telah berbelanja di Auto Craft. Kami sedang memproses pesanan Anda.
          </p>
          <button 
            onClick={() => router.push("/produk")}
            className="w-full bg-[#E07A5F] hover:bg-[#d0694e] text-white font-bold py-4 rounded-xl transition"
          >
            Lanjut Belanja
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#F4F1DE] flex flex-col font-sans selection:bg-[#E07A5F]/30 pb-24">
      {/* HEADER */}
      <header className="bg-[#121212]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/produk"
            className="flex items-center gap-2 text-white/70 hover:text-white transition text-sm font-semibold"
          >
            ← Batal & Kembali
          </Link>
          <span className="font-bold text-white text-sm">Checkout Marketplace</span>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto p-4 sm:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: Steps */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= num ? "bg-[#E07A5F] text-white" : "bg-[#1A1A1A] text-white/40 border border-white/10"
                }`}>
                  {num}
                </div>
                {num < 3 && (
                  <div className={`w-8 h-0.5 mx-2 ${step > num ? "bg-[#E07A5F]" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="bg-[#121212] border border-white/10 rounded-[32px] p-6 sm:p-10 min-h-[400px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              {/* STEP 1: Pengiriman */}
              {step === 1 && (
                <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <MapPin className="text-[#E07A5F]" /> Alamat Pengiriman
                    </h2>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase mb-2">Alamat Lengkap</label>
                    <textarea
                      rows={3}
                      value={checkoutData.address}
                      onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                      placeholder="Contoh: Jl. Sudirman No. 12, RT 01/RW 02, Jakarta Selatan..."
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#E07A5F] focus:outline-none transition resize-none"
                    />
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
                      <Truck className="text-[#E07A5F]" /> Opsi Pengiriman
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div 
                        onClick={() => setCheckoutData({ ...checkoutData, shipping: "regular" })}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center justify-between ${
                          checkoutData.shipping === "regular" ? "border-[#E07A5F] bg-[#E07A5F]/10" : "border-white/5 bg-[#1A1A1A] hover:border-white/20"
                        }`}
                      >
                        <div>
                          <span className="font-bold text-white block">Reguler</span>
                          <span className="text-xs text-white/50">2-3 Hari Kerja</span>
                        </div>
                        <span className="font-bold text-[#E07A5F]">Rp 50.000</span>
                      </div>
                      <div 
                        onClick={() => setCheckoutData({ ...checkoutData, shipping: "express" })}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center justify-between ${
                          checkoutData.shipping === "express" ? "border-[#E07A5F] bg-[#E07A5F]/10" : "border-white/5 bg-[#1A1A1A] hover:border-white/20"
                        }`}
                      >
                        <div>
                          <span className="font-bold text-white block">Express</span>
                          <span className="text-xs text-white/50">1 Hari Kerja / Same Day</span>
                        </div>
                        <span className="font-bold text-[#E07A5F]">Rp 150.000</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Pembayaran */}
              {step === 2 && (
                <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <CreditCard className="text-[#E07A5F]" /> Metode Pembayaran
                    </h2>
                  </div>
                  
                  <div className="space-y-3">
                    {["Bank Transfer (BCA/Mandiri)", "Kartu Kredit", "E-Wallet (GoPay/OVO/Dana)"].map((method) => (
                      <div 
                        key={method}
                        onClick={() => setCheckoutData({ ...checkoutData, payment: method })}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                          checkoutData.payment === method ? "border-[#E07A5F] bg-[#E07A5F]/10" : "border-white/5 bg-[#1A1A1A] hover:border-white/20"
                        }`}
                      >
                        <span className="font-bold text-white">{method}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${checkoutData.payment === method ? "border-[#E07A5F]" : "border-white/20"}`}>
                          {checkoutData.payment === method && <div className="w-2.5 h-2.5 bg-[#E07A5F] rounded-full" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Konfirmasi */}
              {step === 3 && (
                <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <CheckCircle2 className="text-[#E07A5F]" /> Konfirmasi Pesanan
                    </h2>
                  </div>
                  
                  <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 space-y-4">
                    <div className="pb-4 border-b border-white/5">
                      <span className="text-white/50 text-xs uppercase font-bold block mb-1">Alamat Pengiriman</span>
                      <p className="text-white text-sm">{checkoutData.address}</p>
                    </div>
                    <div className="pb-4 border-b border-white/5 flex justify-between">
                      <span className="text-white/50 text-xs uppercase font-bold block mb-1">Pengiriman</span>
                      <p className="text-white text-sm font-bold uppercase">{checkoutData.shipping}</p>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50 text-xs uppercase font-bold block mb-1">Metode Pembayaran</span>
                      <p className="text-white text-sm font-bold">{checkoutData.payment}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6">
              <button
                onClick={handlePrev}
                disabled={step === 1 || isSubmitting}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition ${
                  step === 1 ? "opacity-0 pointer-events-none" : "bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Kembali
              </button>

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={
                    (step === 1 && (!checkoutData.address || !checkoutData.shipping)) ||
                    (step === 2 && !checkoutData.payment)
                  }
                  className="flex items-center gap-2 bg-[#E07A5F] hover:bg-[#d0694e] text-white px-8 py-3 rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={submitCheckout}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-[#E07A5F] hover:bg-[#d0694e] text-white px-8 py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-[#E07A5F]/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Memproses..." : "Bayar Sekarang"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="lg:w-[350px]">
          <div className="bg-[#121212] border border-white/10 rounded-[32px] p-6 sticky top-24">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Ringkasan Belanja
            </h3>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-black overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white line-clamp-2 mb-1">{item.name}</h4>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-xs text-white/50">{item.qty} x</span>
                      <span className="text-xs font-bold text-[#E07A5F]">Rp {item.price.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Subtotal</span>
                <span className="text-white font-bold">Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Ongkos Kirim</span>
                <span className="text-white font-bold">Rp {shippingCost.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
              <span className="text-white font-bold">Total Pembayaran</span>
              <span className="text-2xl font-black text-[#E07A5F]">Rp {total.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
