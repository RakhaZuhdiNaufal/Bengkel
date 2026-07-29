export const vehicles = [
  { brand: "Porsche", models: ["911 GT3 RS", "Cayenne", "Macan", "Panamera"] },
  { brand: "BMW", models: ["M3", "M4 Competition", "X5", "320i"] },
  { brand: "Mercedes-Benz", models: ["C-Class", "E-Class", "S-Class", "AMG GT"] },
  { brand: "Toyota", models: ["Fortuner", "Alphard", "Innova Zenix", "Camry"] },
  { brand: "Honda", models: ["Civic Type R", "CR-V", "HR-V", "Accord"] }
];

export const branches = [
  "Auto Craft Jakarta Selatan",
  "Auto Craft Jakarta Barat",
  "Auto Craft Serpong",
  "Auto Craft Surabaya",
  "Auto Craft Bandung"
];

export const services = [
  {
    id: "ganti-oli",
    name: "Ganti Oli Premium",
    price: 950000,
    estimatedTime: "45 Menit",
    rating: 4.9,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1635784384591-10c0349b1076?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "tune-up",
    name: "General Tune Up",
    price: 1500000,
    estimatedTime: "2 Jam",
    rating: 4.8,
    reviews: 84,
    image: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "spooring",
    name: "Spooring & Balancing",
    price: 600000,
    estimatedTime: "1 Jam",
    rating: 4.7,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1598147743516-ebcd892782e4?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "servis-ac",
    name: "Servis AC Total",
    price: 1200000,
    estimatedTime: "2.5 Jam",
    rating: 4.9,
    reviews: 95,
    image: "https://images.unsplash.com/photo-1563223771-5fe4038fbfc9?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "detailing",
    name: "Premium Auto Detailing",
    price: 3500000,
    estimatedTime: "1 Hari",
    rating: 5.0,
    reviews: 320,
    image: "https://images.unsplash.com/photo-1607860108855-64b2078675c1?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "ecu-remap",
    name: "ECU Remap & Tuning",
    price: 5500000,
    estimatedTime: "3 Jam",
    rating: 4.9,
    reviews: 150,
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=800&auto=format&fit=crop"
  }
];

export const promos = [
  {
    id: "promo-1",
    badge: "FLASH SALE",
    title: "Diskon 30% Ganti Oli Mesin Sintetis",
    discount: "30%",
    validUntil: "Berakhir dalam 2 Hari",
    desc: "Khusus untuk pelanggan baru. Termasuk filter oli gratis.",
    bgImage: "https://images.unsplash.com/photo-1502877336475-76753f602dc1?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "promo-2",
    badge: "BUNDLE",
    title: "Tune Up + AC + Detailing",
    discount: "CASHBACK RP 1JT",
    validUntil: "Berlaku hingga 30 Agustus",
    desc: "Paket lengkap mengembalikan performa mobil seperti baru.",
    bgImage: "https://images.unsplash.com/photo-1600793575654-910699b5e4d4?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "promo-3",
    badge: "MEMBER",
    title: "Gratis General Checkup 50 Titik",
    discount: "GRATIS",
    validUntil: "Tanpa Batas Waktu",
    desc: "Eksklusif untuk member terdaftar di aplikasi Auto Craft.",
    bgImage: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=600&auto=format&fit=crop"
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Budi Santoso",
    car: "BMW M4 Competition",
    rating: 5,
    comment: "Hasil remap ECU sangat terasa. Tenaga mesin naik drastis tapi tetap aman dipakai harian. Teknisi sangat paham apa yang mereka kerjakan.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Reza Rahardian",
    car: "Porsche 911 GT3 RS",
    rating: 5,
    comment: "Pengerjaan detailing dan ceramic coatingnya level dewa. Mobil kembali mengkilap bahkan lebih bagus dari saat keluar showroom.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Anita Sari",
    car: "Honda CR-V",
    rating: 4.5,
    comment: "Servis rutin AC cepat dan transparan. Tidak ada biaya tersembunyi. Ruang tunggunya sangat nyaman seperti cafe premium.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "David Kurniawan",
    car: "Toyota Fortuner",
    rating: 5,
    comment: "Suspensi mobil terasa keras, dibawa ke Auto Craft langsung dicek dan masalah selesai hari itu juga. Sangat direkomendasikan!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
  }
];

export const articles = [
  {
    id: 1,
    title: "Kapan Waktu yang Tepat Untuk Remap ECU?",
    category: "Performa",
    date: "12 Agustus 2026",
    preview: "Remap ECU tidak selalu harus untuk balapan. Mobil harian pun bisa merasakan manfaat efisiensi bahan bakar dan respon tarikan yang lebih halus...",
    thumbnail: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Mitos dan Fakta Seputar Ceramic Coating",
    category: "Perawatan Eksterior",
    date: "05 Agustus 2026",
    preview: "Banyak yang mengira ceramic coating membuat mobil anti baret 100%. Padahal fungsi utamanya adalah menolak air dan melindungi dari sinar UV...",
    thumbnail: "https://images.unsplash.com/photo-1607860108855-64b2078675c1?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Tanda-Tanda Kompresor AC Mulai Lemah",
    category: "Tips Servis",
    date: "28 Juli 2026",
    preview: "Jangan tunggu sampai AC benar-benar panas. Jika mulai terdengar suara bising dari ruang mesin saat AC menyala, segera cek kompresor Anda...",
    thumbnail: "https://images.unsplash.com/photo-1563223771-5fe4038fbfc9?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Panduan Memilih Oli Sintetis vs Mineral",
    category: "Perawatan Mesin",
    date: "20 Juli 2026",
    preview: "Apakah oli sintetis selalu lebih baik? Jawabannya tergantung usia dan spesifikasi mesin mobil Anda. Pelajari perbedaan mendasarnya di sini...",
    thumbnail: "https://images.unsplash.com/photo-1635784384591-10c0349b1076?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 5,
    title: "Pentingnya Spooring Rutin Setiap 10.000 KM",
    category: "Kaki-Kaki",
    date: "15 Juli 2026",
    preview: "Setir lari ke kiri atau ban makan sebelah adalah tanda mobil butuh spooring. Jangan abaikan karena bisa membahayakan keselamatan berkendara...",
    thumbnail: "https://images.unsplash.com/photo-1598147743516-ebcd892782e4?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 6,
    title: "Cara Menjaga Interior Kulit Agar Tetap Mewah",
    category: "Detailing",
    date: "02 Juli 2026",
    preview: "Jok kulit rentan pecah-pecah jika sering terpapar panas matahari. Gunakan kondisioner khusus secara rutin untuk menjaga kelembapan materialnya...",
    thumbnail: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?q=80&w=800&auto=format&fit=crop"
  }
];

export const faqs = [
  {
    question: "Berapa lama rata-rata waktu pengerjaan servis?",
    answer: "Tergantung jenis layanan. Servis rutin dan ganti oli umumnya memakan waktu 1-2 jam. Untuk modifikasi kustom atau overhoul bisa memakan waktu 1-3 hari kerja. Anda akan selalu diinfokan estimasi waktu sebelum pengerjaan dimulai."
  },
  {
    question: "Apakah bisa melakukan booking servis secara online?",
    answer: "Tentu saja! Fitur Quick Booking kami memungkinkan Anda memilih jadwal, teknisi, dan layanan secara instan. Tidak perlu antre berlama-lama di bengkel."
  },
  {
    question: "Apakah Auto Craft menerima mobil pabrikan Eropa?",
    answer: "Ya, teknisi kami tersertifikasi internasional dan berpengalaman menangani mobil Eropa seperti BMW, Mercedes-Benz, Porsche, hingga Audi menggunakan diagnostic tool resmi."
  },
  {
    question: "Apakah pengerjaan dan sparepart memiliki garansi?",
    answer: "Semua pengerjaan kami memiliki garansi 100%. Untuk suku cadang (sparepart), kami mengikuti kebijakan garansi resmi dari masing-masing merek (biasanya 3-12 bulan)."
  },
  {
    question: "Metode pembayaran apa saja yang diterima?",
    answer: "Kami menerima Cash, Transfer Bank, Kartu Kredit (Visa/Mastercard), serta pembayaran digital melalui QRIS untuk kenyamanan transaksi Anda."
  }
];
