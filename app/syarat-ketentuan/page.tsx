import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-black text-[#F4F1DE] font-sans pb-24">
      <header className="bg-[#121212]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center">
          <Link href="/home" className="flex items-center gap-2 text-white/70 hover:text-white transition text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-[#E07A5F]/10 rounded-2xl flex items-center justify-center border border-[#E07A5F]/20 text-[#E07A5F]">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Syarat & Ketentuan</h1>
            <p className="text-white/50 text-sm mt-1">Terakhir diperbarui: 30 Juli 2026</p>
          </div>
        </div>

        <div className="prose prose-invert prose-p:text-white/70 prose-headings:text-white prose-a:text-[#E07A5F] max-w-none">
          <p>
            Selamat datang di Auto Craft. Dengan menggunakan layanan bengkel, website, dan aplikasi kami, Anda dianggap telah membaca, 
            mengerti, dan menyetujui seluruh syarat dan ketentuan di bawah ini.
          </p>

          <h3>1. Layanan Bengkel dan Booking</h3>
          <ul>
            <li>Jadwal booking yang sudah dikonfirmasi wajib ditepati. Keterlambatan lebih dari 30 menit dapat menyebabkan jadwal Anda digeser.</li>
            <li>Uang Muka (DP) sebesar 30% yang dibayarkan untuk booking layanan khusus tidak dapat dikembalikan jika pembatalan dilakukan kurang dari 24 jam.</li>
            <li>Estimasi harga dan waktu yang tertera pada aplikasi dapat berubah setelah dilakukan inspeksi fisik oleh teknisi di bengkel.</li>
          </ul>

          <h3>2. Garansi Suku Cadang dan Servis</h3>
          <ul>
            <li>Semua suku cadang asli yang dibeli dan dipasang di Auto Craft dilindungi garansi pabrikan.</li>
            <li>Garansi jasa servis berlaku selama 14 hari atau 1.000 KM (mana yang tercapai lebih dulu) sejak tanggal pengambilan kendaraan.</li>
          </ul>

          <h3>3. Pembayaran</h3>
          <p>
            Pembayaran lunas wajib dilakukan sebelum kendaraan dikeluarkan dari bengkel. Auto Craft berhak menahan kendaraan 
            apabila kewajiban pembayaran belum diselesaikan oleh pelanggan.
          </p>
        </div>
      </main>
    </div>
  );
}
