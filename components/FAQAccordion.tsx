import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { faqs } from "@/data/dummy";
import { Plus, Minus } from "lucide-react";

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-[#121212] border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-16 space-y-3">
          <p className="text-[#E07A5F] text-xs font-bold tracking-widest uppercase">
            Bantuan
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Pertanyaan Umum (FAQ)
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className={`border rounded-2xl transition-all duration-300 ${isOpen ? "bg-[#1A1A1A] border-[#E07A5F]/30" : "bg-transparent border-white/10 hover:border-white/20"}`}
              >
                <button 
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className={`font-bold text-base sm:text-lg pr-8 ${isOpen ? "text-[#E07A5F]" : "text-white"}`}>
                    {faq.question}
                  </span>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? "bg-[#E07A5F] text-black" : "bg-white/5 text-white"}`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0 text-white/60 text-sm sm:text-base leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
