import type { Product } from './schema'

/**
 * HOLBERY Marketplace catalog source.
 *
 * IMPORTANT: Every record below is a DEMONSTRATION record (`kind: 'demonstration'`).
 * They exist only to exercise the storefront UI and the validation rules.
 * They are NOT validated, NOT available for purchase, and have NO active
 * channel listing. Prices shown are planning placeholders, not offers.
 *
 * To add a real product: set `kind: 'product'`, complete quality + rights
 * reviews, attach validation evidence, and add a verified active channel
 * listing. `npm run validate:catalog` enforces these rules.
 */
const demoLicense = {
  name: 'Lisensi Penggunaan Pribadi & Usaha Tunggal (draf)',
  permitted: [
    'Digunakan untuk usaha atau pekerjaan milik pembeli sendiri',
    'Diubah dan disesuaikan untuk kebutuhan internal'
  ],
  notPermitted: [
    'Dijual ulang, dibagikan, atau diunggah ulang dalam bentuk asli maupun modifikasi',
    'Diklaim sebagai karya sendiri'
  ]
}

const demoSupport =
  'Draf kebijakan: pertanyaan penggunaan dijawab melalui email dukungan pada hari kerja. Belum aktif karena produk belum dirilis.'
const demoUpdate =
  'Draf kebijakan: perbaikan kesalahan pada versi mayor yang sama akan diberikan tanpa biaya. Belum aktif karena produk belum dirilis.'
const demoDeliveryNote =
  'Belum ada metode pengiriman. Produk ini adalah data demonstrasi dan tidak dapat dibeli.'

export const PRODUCTS: Product[] = [
  {
    id: 'prd_demo0001',
    sku: 'HB-DEMO-BF-001',
    slug: 'workbook-arus-kas-penjual-mikro',
    kind: 'demonstration',
    title: 'Workbook Arus Kas & Stok Penjual Mikro',
    category: 'bisnis-keuangan',
    shortDescription:
      'Contoh struktur spreadsheet untuk mencatat uang masuk, uang keluar, dan stok barang harian bagi penjual online skala kecil.',
    fullDescription: [
      'Banyak penjual mikro mencampur uang pribadi dan uang usaha sehingga sulit mengetahui apakah usahanya benar-benar menghasilkan. Workbook ini dirancang sebagai satu file sederhana yang memisahkan pencatatan kas, stok, dan ringkasan bulanan.',
      'Catatan: halaman ini adalah data demonstrasi untuk menguji tampilan toko. Isi, harga, dan deliverable belum final dan belum melalui validasi produk.'
    ],
    targetCustomer: 'Penjual online dan reseller skala mikro yang masih mencatat transaksi secara manual.',
    problemSolved: 'Sulit membedakan uang usaha dan pribadi serta tidak tahu sisa stok tanpa menghitung ulang.',
    deliverables: [
      { name: 'Workbook arus kas & stok', format: 'XLSX / Google Sheets', description: 'Sheet kas harian, stok, dan ringkasan bulanan.' },
      { name: 'Panduan singkat', format: 'PDF', description: 'Langkah pengisian dan contoh pengisian dengan data fiktif.' }
    ],
    fileFormats: ['XLSX', 'Google Sheets', 'PDF'],
    languages: ['Bahasa Indonesia'],
    compatibility: ['Microsoft Excel 2016 atau lebih baru', 'Google Sheets (browser)', 'Pembaca PDF apa pun'],
    howToUse: [
      'Salin file ke Google Drive atau buka di Excel.',
      'Isi saldo awal dan daftar produk pada sheet Pengaturan.',
      'Catat setiap transaksi pada sheet Kas Harian.',
      'Lihat ringkasan otomatis pada sheet Ringkasan Bulanan.'
    ],
    price: { amount: 49000, currency: 'IDR' },
    version: '0.1.0',
    license: demoLicense,
    previewImages: [
      { src: '/static/previews/cashflow-workbook.svg', alt: 'Ilustrasi tata letak workbook arus kas dengan tabel dan ringkasan', illustrative: true }
    ],
    deliveryMethod: 'not_yet_available',
    deliveryNote: demoDeliveryNote,
    supportPolicy: demoSupport,
    updatePolicy: demoUpdate,
    status: 'draft',
    availability: 'not_available',
    reviews: { quality: 'not_started', rights: 'not_started' },
    validationEvidence: [],
    channelListings: [{ channel: 'holbery_store', label: 'HOLBERY Store', status: 'planned' }],
    tags: ['spreadsheet', 'arus kas', 'stok', 'umkm'],
    createdAt: '2026-10-21',
    updatedAt: '2026-10-21'
  },
  {
    id: 'prd_demo0002',
    sku: 'HB-DEMO-BF-002',
    slug: 'kalkulator-hpp-harga-jual',
    kind: 'demonstration',
    title: 'Kalkulator HPP & Harga Jual',
    category: 'software-tools',
    shortDescription:
      'Contoh kalkulator untuk menghitung harga pokok produksi, biaya platform, dan margin sebelum menentukan harga jual.',
    fullDescription: [
      'Menentukan harga jual sering dilakukan dengan menebak. Kalkulator ini menyusun komponen biaya bahan, kemasan, tenaga kerja, serta potongan marketplace agar margin bersih terlihat sebelum harga dipasang.',
      'Catatan: halaman ini adalah data demonstrasi. Produk belum tersedia dan belum diuji oleh pengguna.'
    ],
    targetCustomer: 'Pelaku usaha makanan, kerajinan, dan produk fisik skala kecil.',
    problemSolved: 'Harga jual ditetapkan tanpa menghitung seluruh biaya sehingga margin ternyata tipis atau negatif.',
    deliverables: [
      { name: 'Kalkulator HPP', format: 'Google Sheets', description: 'Input biaya per komponen dan simulasi margin.' }
    ],
    fileFormats: ['Google Sheets'],
    languages: ['Bahasa Indonesia'],
    compatibility: ['Google Sheets (browser atau aplikasi seluler)'],
    howToUse: [
      'Buat salinan file ke akun Google Anda.',
      'Isi biaya bahan dan biaya lain per unit.',
      'Masukkan persentase potongan platform penjualan.',
      'Bandingkan beberapa skenario harga jual.'
    ],
    price: { amount: 29000, currency: 'IDR' },
    version: '0.1.0',
    license: demoLicense,
    previewImages: [
      { src: '/static/previews/hpp-calculator.svg', alt: 'Ilustrasi kalkulator HPP dengan kolom biaya dan margin', illustrative: true }
    ],
    deliveryMethod: 'not_yet_available',
    deliveryNote: demoDeliveryNote,
    supportPolicy: demoSupport,
    updatePolicy: demoUpdate,
    status: 'review',
    availability: 'coming_soon',
    reviews: { quality: 'in_progress', rights: 'not_started' },
    validationEvidence: [],
    channelListings: [{ channel: 'holbery_store', label: 'HOLBERY Store', status: 'planned' }],
    tags: ['hpp', 'harga jual', 'margin', 'kalkulator'],
    createdAt: '2026-10-21',
    updatedAt: '2026-10-21'
  },
  {
    id: 'prd_demo0003',
    sku: 'HB-DEMO-PO-001',
    slug: 'paket-sop-usaha-jasa',
    kind: 'demonstration',
    title: 'Paket SOP Usaha Jasa Kecil',
    category: 'produktivitas-operasional',
    shortDescription:
      'Contoh kumpulan SOP dan checklist untuk pembukaan, layanan pelanggan, dan penutupan harian pada usaha jasa kecil.',
    fullDescription: [
      'Usaha jasa yang bergantung pada pemilik sering kesulitan saat menambah karyawan. Paket ini berisi kerangka SOP yang dapat diedit agar standar layanan konsisten.',
      'Catatan: halaman ini adalah data demonstrasi untuk menguji tampilan katalog.'
    ],
    targetCustomer: 'Pemilik usaha jasa dengan 1–10 karyawan.',
    problemSolved: 'Standar kerja hanya ada di kepala pemilik sehingga kualitas layanan tidak konsisten.',
    deliverables: [
      { name: 'Template SOP', format: 'DOCX / Google Docs', description: 'Kerangka SOP pembukaan, layanan, dan penutupan.' },
      { name: 'Checklist harian', format: 'PDF', description: 'Checklist siap cetak.' }
    ],
    fileFormats: ['DOCX', 'Google Docs', 'PDF'],
    languages: ['Bahasa Indonesia'],
    compatibility: ['Microsoft Word 2016 atau lebih baru', 'Google Docs', 'Pembaca PDF apa pun'],
    howToUse: [
      'Pilih template SOP yang sesuai.',
      'Sesuaikan langkah dengan kondisi usaha Anda.',
      'Cetak checklist dan tempel di area kerja.'
    ],
    price: { amount: 59000, currency: 'IDR' },
    version: '0.1.0',
    license: demoLicense,
    previewImages: [
      { src: '/static/previews/sop-pack.svg', alt: 'Ilustrasi dokumen SOP dan checklist', illustrative: true }
    ],
    deliveryMethod: 'not_yet_available',
    deliveryNote: demoDeliveryNote,
    supportPolicy: demoSupport,
    updatePolicy: demoUpdate,
    status: 'draft',
    availability: 'not_available',
    reviews: { quality: 'not_started', rights: 'not_started' },
    validationEvidence: [],
    channelListings: [],
    tags: ['sop', 'checklist', 'operasional'],
    createdAt: '2026-10-21',
    updatedAt: '2026-10-21'
  },
  {
    id: 'prd_demo0004',
    sku: 'HB-DEMO-AI-001',
    slug: 'prompt-kit-deskripsi-produk',
    kind: 'demonstration',
    title: 'Prompt Kit Deskripsi Produk yang Jujur',
    category: 'ai-otomasi',
    shortDescription:
      'Contoh kumpulan instruksi AI untuk menyusun deskripsi produk yang jelas dan jujur tanpa klaim berlebihan.',
    fullDescription: [
      'Deskripsi produk buatan AI sering terdengar generik dan berisi klaim yang tidak bisa dibuktikan. Kit ini menyusun instruksi bertahap yang memaksa AI memakai fakta produk dan menghindari janji hasil.',
      'Catatan: halaman ini adalah data demonstrasi. Hasil AI tetap wajib ditinjau manusia.'
    ],
    targetCustomer: 'Penjual online dan kreator yang menulis banyak deskripsi produk.',
    problemSolved: 'Menulis deskripsi produk memakan waktu dan hasil AI sering tidak akurat.',
    deliverables: [
      { name: 'Prompt kit', format: 'PDF + TXT', description: 'Instruksi bertahap beserta contoh input dan output fiktif.' }
    ],
    fileFormats: ['PDF', 'TXT'],
    languages: ['Bahasa Indonesia', 'English'],
    compatibility: ['Asisten AI berbasis chat apa pun yang menerima teks'],
    howToUse: [
      'Siapkan fakta produk: bahan, ukuran, isi, dan batasan.',
      'Tempelkan prompt sesuai urutan.',
      'Tinjau dan koreksi hasil sebelum dipublikasikan.'
    ],
    price: { amount: 39000, currency: 'IDR' },
    version: '0.1.0',
    license: demoLicense,
    previewImages: [
      { src: '/static/previews/prompt-kit.svg', alt: 'Ilustrasi dokumen prompt kit dengan langkah bertahap', illustrative: true }
    ],
    deliveryMethod: 'not_yet_available',
    deliveryNote: demoDeliveryNote,
    supportPolicy: demoSupport,
    updatePolicy: demoUpdate,
    status: 'draft',
    availability: 'not_available',
    reviews: { quality: 'not_started', rights: 'not_started' },
    validationEvidence: [],
    channelListings: [],
    tags: ['ai', 'prompt', 'copywriting'],
    createdAt: '2026-10-21',
    updatedAt: '2026-10-21'
  },
  {
    id: 'prd_demo0005',
    sku: 'HB-DEMO-CD-001',
    slug: 'template-katalog-promosi-editable',
    kind: 'demonstration',
    title: 'Template Katalog Promosi yang Dapat Diedit',
    category: 'kreatif-desain',
    shortDescription:
      'Contoh template katalog produk orisinal untuk dibagikan lewat chat atau media sosial, dapat diedit tanpa aplikasi berbayar.',
    fullDescription: [
      'Katalog yang rapi membantu calon pembeli memahami produk dengan cepat. Template ini dirancang untuk diedit di aplikasi desain gratis dan diekspor menjadi PDF atau gambar.',
      'Catatan: halaman ini adalah data demonstrasi. Aset desain belum melalui pemeriksaan hak cipta.'
    ],
    targetCustomer: 'UMKM yang menjual lewat chat dan media sosial.',
    problemSolved: 'Daftar produk dikirim dalam bentuk foto acak sehingga sulit dibaca calon pembeli.',
    deliverables: [
      { name: 'Template katalog', format: 'PDF + tautan template', description: 'Halaman sampul, daftar produk, dan halaman kontak.' }
    ],
    fileFormats: ['PDF', 'PNG'],
    languages: ['Bahasa Indonesia'],
    compatibility: ['Aplikasi desain berbasis browser yang mendukung impor PDF'],
    howToUse: ['Buka template.', 'Ganti foto, nama, dan harga produk.', 'Ekspor menjadi PDF atau gambar.'],
    price: { amount: 35000, currency: 'IDR' },
    version: '0.1.0',
    license: demoLicense,
    previewImages: [
      { src: '/static/previews/catalog-template.svg', alt: 'Ilustrasi halaman katalog promosi dengan kartu produk', illustrative: true }
    ],
    deliveryMethod: 'not_yet_available',
    deliveryNote: demoDeliveryNote,
    supportPolicy: demoSupport,
    updatePolicy: demoUpdate,
    status: 'draft',
    availability: 'not_available',
    reviews: { quality: 'not_started', rights: 'not_started' },
    validationEvidence: [],
    channelListings: [],
    tags: ['template', 'katalog', 'promosi'],
    createdAt: '2026-10-21',
    updatedAt: '2026-10-21'
  },
  {
    id: 'prd_demo0006',
    sku: 'HB-DEMO-IS-001',
    slug: 'workbook-konsinyasi-multi-outlet',
    kind: 'demonstration',
    title: 'Workbook Konsinyasi Multi-Outlet',
    category: 'solusi-industri',
    shortDescription:
      'Contoh workbook untuk mencatat titip jual di beberapa toko, menghitung barang terjual, dan menyiapkan rekap setoran.',
    fullDescription: [
      'Produsen yang menitipkan barang di banyak warung atau toko sering kehilangan jejak stok dan setoran. Workbook ini menyusun pencatatan per outlet dan rekap penagihan.',
      'Catatan: halaman ini adalah data demonstrasi berdasarkan hipotesis produk yang belum divalidasi.'
    ],
    targetCustomer: 'Produsen makanan ringan dan kerajinan yang menitipkan barang di beberapa outlet.',
    problemSolved: 'Stok titipan dan setoran dari banyak outlet sulit direkap dan rawan selisih.',
    deliverables: [
      { name: 'Workbook konsinyasi', format: 'XLSX / Google Sheets', description: 'Sheet per outlet, kunjungan, dan rekap setoran.' }
    ],
    fileFormats: ['XLSX', 'Google Sheets'],
    languages: ['Bahasa Indonesia'],
    compatibility: ['Microsoft Excel 2016 atau lebih baru', 'Google Sheets'],
    howToUse: ['Daftarkan outlet dan produk.', 'Catat barang dititipkan dan sisa saat kunjungan.', 'Gunakan rekap untuk penagihan.'],
    price: { amount: 69000, currency: 'IDR' },
    version: '0.1.0',
    license: demoLicense,
    previewImages: [
      { src: '/static/previews/consignment-workbook.svg', alt: 'Ilustrasi tabel konsinyasi per outlet', illustrative: true }
    ],
    deliveryMethod: 'not_yet_available',
    deliveryNote: demoDeliveryNote,
    supportPolicy: demoSupport,
    updatePolicy: demoUpdate,
    status: 'draft',
    availability: 'not_available',
    reviews: { quality: 'not_started', rights: 'not_started' },
    validationEvidence: [],
    channelListings: [],
    tags: ['konsinyasi', 'titip jual', 'warung'],
    createdAt: '2026-10-21',
    updatedAt: '2026-10-21'
  }
]
