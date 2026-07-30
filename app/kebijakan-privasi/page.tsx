import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
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
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Kebijakan Privasi</h1>
            <p className="text-white/50 text-sm mt-1">Terakhir diperbarui: 30 Juli 2026</p>
          </div>
        </div>

        <div className="prose prose-invert prose-p:text-white/70 prose-headings:text-white prose-a:text-[#E07A5F] max-w-none">
          <p>
            Di Auto Craft, kami memprioritaskan privasi Anda. Dokumen ini menjelaskan informasi apa yang kami kumpulkan, 
            bagaimana kami menggunakannya, dan langkah-langkah yang kami ambil untuk memastikan data pribadi Anda tetap aman.
          </p>

          <h3>1. Informasi yang Kami Kumpulkan</h3>
          <p>Kami mengumpulkan informasi yang Anda berikan secara langsung saat pendaftaran, pemesanan servis, atau transaksi produk, antara lain:</p>
          <ul>
            <li>Data identitas (Nama, Email, Nomor Telepon).</li>
            <li>Data kendaraan (Merek, Model, Tahun, Plat Nomor).</li>
            <li>Riwayat transaksi dan histori servis kendaraan Anda.</li>
          </ul>

          <h3>2. Penggunaan Informasi</h3>
          <p>Data Anda digunakan secara eksklusif untuk:</p>
          <ul>
            <li>Memproses reservasi servis dan pembelian sparepart.</li>
            <li>Mengirimkan notifikasi terkait status kendaraan Anda.</li>
            <li>Program poin loyalitas Auto Craft Platinum.</li>
            <li>Analitik internal untuk meningkatkan kualitas pelayanan kami.</li>
          </ul>

          <h3>3. Perlindungan Data</h3>
          <p>Kami menggunakan enkripsi keamanan tingkat tinggi untuk melindungi data Anda. Kami tidak akan pernah menjual, menyewakan, atau mendistribusikan data pribadi Anda kepada pihak ketiga untuk tujuan pemasaran tanpa izin eksplisit Anda.</p>
        </div>
      </main>
    </div>
  );
}
