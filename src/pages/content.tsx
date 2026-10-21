import type { FC } from 'hono/jsx'
import { SITE } from '../config/site'
import { PageHeader, Prose } from '../components/Common'

const home = { href: '/', label: 'Beranda' }

const DraftNotice: FC = () => (
  <div class="alert alert-info" role="note">
    <strong>Dokumen draf.</strong> Kebijakan ini disusun untuk tahap pratinjau dan akan ditinjau pemilik (serta penasihat hukum bila
    diperlukan) sebelum penjualan dimulai. Ini bukan nasihat hukum. Terakhir diperbarui{' '}
    <time datetime={SITE.policiesLastUpdated}>{SITE.policiesLastUpdated}</time>.
  </div>
)

export const AboutPage: FC = () => (
  <>
    <PageHeader
      eyebrow="Tentang"
      title="Tentang HOLBERY"
      lead="HOLBERY membuat produk digital orisinal yang membantu usaha kecil dan profesional menyelesaikan pekerjaan nyata."
      crumbs={[home, { label: 'Tentang' }]}
    />
    <Prose>
      <h2>Apa itu HOLBERY Marketplace</h2>
      <p>
        HOLBERY Marketplace adalah toko resmi milik HOLBERY untuk menjual dan mendistribusikan produk digital buatan sendiri:
        template, spreadsheet, panduan PDF, alat bisnis, software, dan workflow AI praktis. Ini bukan marketplace multi-penjual —
        setiap produk dibuat, ditinjau, dan didukung langsung oleh HOLBERY.
      </p>
      <h2>Prinsip kami</h2>
      <ul>
        <li><strong>Bukti sebelum asumsi.</strong> Produk dikembangkan dari masalah pelanggan yang teramati, bukan sekadar tren.</li>
        <li><strong>Jujur dan jelas.</strong> Isi, format, kompatibilitas, batasan, lisensi, dan kebijakan dukungan dicantumkan sebelum pembelian.</li>
        <li><strong>Tanpa klaim palsu.</strong> Kami tidak menampilkan testimoni rekaan, angka penjualan palsu, atau janji hasil finansial.</li>
        <li><strong>Privasi sejak awal.</strong> Kami hanya mengumpulkan data yang benar-benar diperlukan.</li>
        <li><strong>Karya orisinal.</strong> Kami tidak menjual template salinan, software bajakan, atau aset tanpa lisensi.</li>
      </ul>
      <h2>Status saat ini</h2>
      <p>
        Toko sedang dalam tahap pratinjau. Produk yang tampil adalah <strong>data demonstrasi</strong> untuk menguji pengalaman
        belanja dan belum dapat dibeli. Produk pertama akan dirilis setelah melalui validasi, pemeriksaan kualitas, dan pemeriksaan
        hak cipta.
      </p>
      <h2>Fokus pasar</h2>
      <p>
        Kami melayani pelanggan di Indonesia terlebih dahulu, dengan rencana mendukung pelanggan internasional di kemudian hari.
      </p>
    </Prose>
  </>
)

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Apakah produk di toko ini sudah bisa dibeli?',
    a: 'Belum. Toko sedang dalam tahap pratinjau dan produk yang tampil adalah data demonstrasi. Tombol pembelian hanya muncul pada produk yang sudah dipublikasikan dan memiliki listing penjualan resmi yang terverifikasi.'
  },
  {
    q: 'Bagaimana cara membeli produk nanti?',
    a: 'Pada tahap awal, pembelian akan dilakukan melalui kanal penjualan resmi yang mendukung produk digital. Tautan ke kanal tersebut hanya ditampilkan setelah listing aktif dan diverifikasi. HOLBERY tidak akan meminta transfer langsung lewat pesan pribadi.'
  },
  {
    q: 'Bagaimana produk dikirimkan?',
    a: 'Metode pengiriman dicantumkan di setiap halaman produk. File berbayar tidak pernah disimpan di tautan publik permanen. Produk yang belum memiliki metode pengiriman yang teruji tidak dijual.'
  },
  {
    q: 'Aplikasi apa yang saya perlukan?',
    a: 'Setiap halaman produk mencantumkan format file dan kompatibilitas, misalnya Microsoft Excel, Google Sheets, atau pembaca PDF. Kami mengutamakan aplikasi yang bisa dipakai gratis.'
  },
  {
    q: 'Bolehkah saya membagikan atau menjual ulang produk?',
    a: 'Tidak, kecuali lisensi produk menyatakan sebaliknya. Ketentuan penggunaan yang diperbolehkan dan tidak diperbolehkan tercantum di setiap halaman produk.'
  },
  {
    q: 'Apakah produk menjamin peningkatan penjualan atau keuntungan?',
    a: 'Tidak. Produk HOLBERY adalah alat bantu kerja. Hasil bergantung pada cara penggunaan dan kondisi usaha masing-masing, sehingga kami tidak menjanjikan hasil finansial tertentu.'
  },
  {
    q: 'Apakah saya perlu membuat akun?',
    a: 'Tidak. Anda dapat menjelajahi seluruh katalog tanpa akun. Situs ini tidak memasang pelacak iklan.'
  },
  {
    q: 'Bagaimana jika file bermasalah?',
    a: 'Kebijakan dukungan, pembaruan, dan refund tercantum di halaman produk serta halaman Refund & Pembatalan. Kebijakan tersebut berlaku penuh setelah produk resmi dijual.'
  }
]

export const FaqPage: FC = () => (
  <>
    <PageHeader
      eyebrow="Bantuan"
      title="Pertanyaan yang Sering Diajukan"
      lead="Jawaban singkat tentang produk, pembelian, pengiriman, dan lisensi."
      crumbs={[home, { label: 'FAQ' }]}
    />
    <section class="section section-tight">
      <div class="container container-narrow">
        <div class="faq-list">
          {FAQS.map((f, i) => (
            <details class="faq-item" id={`faq-${i + 1}`}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
        <p class="faq-more">
          Belum menemukan jawaban? <a href="/kontak">Hubungi dukungan</a>.
        </p>
      </div>
    </section>
  </>
)

export { FAQS }

export const ContactPage: FC = () => (
  <>
    <PageHeader
      eyebrow="Bantuan"
      title="Kontak & Dukungan"
      lead="Cara menghubungi HOLBERY untuk pertanyaan produk, dukungan teknis, dan permintaan terkait privasi."
      crumbs={[home, { label: 'Kontak' }]}
    />
    <Prose>
      <h2>Email umum</h2>
      <p><a href={`mailto:${SITE.generalEmail}`}>{SITE.generalEmail}</a></p>
      <h2>Email dukungan</h2>
      <p><a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a></p>
      <h2>WhatsApp</h2>
      <p>
        <a href="https://wa.me/6285712658316" rel="nofollow">085712658316</a>
        {' '}<span class="text-muted">— gunakan untuk pertanyaan produk dan dukungan pesanan.</span>
      </p>
      <h2>Identitas penjual</h2>
      <p>{SITE.legalSellerName} — {SITE.legalSellerType}. HOLBERY adalah merek toko.</p>
      <h2>Apa yang bisa kami bantu</h2>
      <ul>
        <li>Pertanyaan sebelum membeli: isi produk, format, dan kompatibilitas.</li>
        <li>Bantuan penggunaan produk yang sudah dibeli.</li>
        <li>Laporan file rusak atau tidak bisa dibuka.</li>
        <li>Permintaan terkait data pribadi sesuai Kebijakan Privasi.</li>
      </ul>
      <h2>Tips agar cepat terbantu</h2>
      <ul>
        <li>Sebutkan nama produk dan SKU (tertera di halaman produk).</li>
        <li>Sertakan kanal tempat Anda membeli dan nomor pesanan dari kanal tersebut.</li>
        <li>Jangan pernah mengirimkan kata sandi, PIN, kode OTP, atau data kartu pembayaran.</li>
      </ul>
      <h2>Keamanan</h2>
      <p>
        Untuk saat ini, pembelian hanya dapat dilakukan melalui kanal resmi yang ditautkan pada halaman produk setelah listing aktif
        dan diverifikasi. Jangan mentransfer uang berdasarkan pesan yang mengaku dari HOLBERY tanpa memeriksa kanal penjualan resmi.
      </p>
    </Prose>
  </>
)

export const PrivacyPage: FC = () => (
  <>
    <PageHeader title="Kebijakan Privasi" crumbs={[home, { label: 'Kebijakan Privasi' }]} />
    <Prose>
      <DraftNotice />
      <h2>1. Ruang lingkup</h2>
      <p>Kebijakan ini menjelaskan bagaimana HOLBERY Marketplace menangani informasi saat Anda mengunjungi situs ini.</p>
      <h2>2. Data yang kami kumpulkan saat ini</h2>
      <ul>
        <li>Situs ini tidak memerlukan akun dan tidak memiliki formulir yang menyimpan data pribadi.</li>
        <li>Kami tidak memasang cookie iklan, piksel pelacak, atau analitik pihak ketiga.</li>
        <li>
          Penyedia hosting (Cloudflare) dapat memproses data teknis seperti alamat IP dan jenis peramban untuk mengirimkan halaman
          serta melindungi situs dari penyalahgunaan, sesuai kebijakan privasi mereka.
        </li>
        <li>Kata kunci pencarian diproses untuk menampilkan hasil dan tidak kami simpan.</li>
      </ul>
      <h2>3. Pembelian melalui kanal pihak ketiga</h2>
      <p>
        Jika nanti Anda membeli melalui kanal penjualan pihak ketiga, data pesanan dan pembayaran diproses oleh kanal tersebut
        berdasarkan kebijakan privasinya. HOLBERY hanya menerima data yang diperlukan untuk memenuhi pesanan dan memberikan dukungan.
      </p>
      <h2>4. Prinsip penggunaan data</h2>
      <ul>
        <li>Mengumpulkan data seminimal mungkin untuk tujuan yang jelas.</li>
        <li>Tidak menjual data pribadi.</li>
        <li>Meminta persetujuan untuk pelacakan non-esensial atau pemasaran bila diwajibkan.</li>
        <li>Menetapkan jangka waktu penyimpanan sebelum mengumpulkan data pesanan.</li>
      </ul>
      <h2>5. Hak Anda</h2>
      <p>
        Sesuai peraturan perlindungan data pribadi yang berlaku di Indonesia, Anda dapat meminta akses, koreksi, atau penghapusan
        data pribadi yang kami simpan. Kanal permintaan akan tercantum di halaman <a href="/kontak">Kontak</a>.
      </p>
      <h2>6. Perubahan</h2>
      <p>Perubahan material akan diumumkan di halaman ini beserta tanggal pembaruannya.</p>
    </Prose>
  </>
)

export const TermsPage: FC = () => (
  <>
    <PageHeader title="Syarat & Ketentuan" crumbs={[home, { label: 'Syarat & Ketentuan' }]} />
    <Prose>
      <DraftNotice />
      <h2>1. Tentang layanan</h2>
      <p>
        HOLBERY Marketplace menampilkan katalog produk digital orisinal milik HOLBERY. Selama tahap pratinjau, situs ini hanya
        berfungsi sebagai katalog dan tidak memproses pembayaran.
      </p>
      <h2>2. Informasi produk</h2>
      <p>
        Kami berupaya menampilkan informasi produk secara akurat. Produk berlabel “Data demonstrasi”, “Belum tersedia”, atau “Segera
        hadir” bukan penawaran penjualan, dan harga yang tampil padanya hanya bersifat perencanaan.
      </p>
      <h2>3. Pembelian</h2>
      <p>
        Pembelian hanya dapat dilakukan melalui tombol pembelian resmi pada produk berstatus “Tersedia”. Transaksi yang dilakukan di
        kanal pihak ketiga juga tunduk pada syarat kanal tersebut.
      </p>
      <h2>4. Lisensi</h2>
      <p>
        Pembelian memberikan lisensi penggunaan, bukan pengalihan hak cipta. Ketentuan detail tercantum di halaman setiap produk.
        Kecuali dinyatakan lain, produk tidak boleh dijual ulang, dibagikan, atau diunggah ulang.
      </p>
      <h2>5. Tanpa jaminan hasil</h2>
      <p>
        Produk adalah alat bantu. HOLBERY tidak menjamin hasil bisnis, finansial, atau hasil lain tertentu dari penggunaan produk.
      </p>
      <h2>6. Penggunaan situs</h2>
      <p>Anda setuju untuk tidak mengganggu, menyalahgunakan, atau mencoba mengakses bagian situs yang tidak diperuntukkan bagi publik.</p>
      <h2>7. Hukum yang berlaku</h2>
      <p>Ketentuan ini tunduk pada hukum Republik Indonesia.</p>
    </Prose>
  </>
)

export const RefundPage: FC = () => (
  <>
    <PageHeader title="Kebijakan Refund & Pembatalan" crumbs={[home, { label: 'Refund & Pembatalan' }]} />
    <Prose>
      <DraftNotice />
      <h2>1. Status saat ini</h2>
      <p>Belum ada produk yang dijual, sehingga belum ada transaksi yang dapat dibatalkan atau di-refund.</p>
      <h2>2. Rancangan kebijakan untuk produk digital</h2>
      <ul>
        <li>Jika file rusak, tidak dapat dibuka pada aplikasi yang tercantum di halaman kompatibilitas, atau berbeda secara material dari deskripsi, kami akan memperbaiki, mengganti, atau mengembalikan dana.</li>
        <li>Karena produk digital dapat disalin setelah diakses, refund karena berubah pikiran mungkin tidak tersedia, kecuali diwajibkan oleh hukum atau kebijakan kanal penjualan.</li>
        <li>Pesanan yang belum dikirimkan dapat dibatalkan.</li>
        <li>Untuk pembelian melalui kanal pihak ketiga, proses refund mengikuti mekanisme dan batas waktu kanal tersebut.</li>
      </ul>
      <h2>3. Cara mengajukan</h2>
      <p>
        Hubungi kami melalui kanal di halaman <a href="/kontak">Kontak</a> dengan menyertakan nama produk, SKU, kanal pembelian,
        nomor pesanan, dan penjelasan masalah.
      </p>
      <h2>4. Pencabutan akses</h2>
      <p>Jika refund disetujui, lisensi penggunaan produk tersebut berakhir dan akses unduhan (bila ada) dapat dicabut.</p>
    </Prose>
  </>
)

export const NotFoundPage: FC = () => (
  <section class="section not-found" aria-labelledby="nf-title" id="not-found">
    <div class="container container-narrow">
      <p class="eyebrow">Error 404</p>
      <h1 id="nf-title" class="page-title">Halaman tidak ditemukan</h1>
      <p class="page-lead">Halaman yang Anda cari tidak ada, sudah dipindahkan, atau produk belum dipublikasikan.</p>
      <div class="btn-row">
        <a href="/" class="btn btn-primary">Ke beranda</a>
        <a href="/produk" class="btn btn-secondary">Lihat semua produk</a>
      </div>
    </div>
  </section>
)

export const ErrorPage: FC = () => (
  <section class="section not-found" aria-labelledby="err-title">
    <div class="container container-narrow">
      <p class="eyebrow">Error 500</p>
      <h1 id="err-title" class="page-title">Terjadi kesalahan</h1>
      <p class="page-lead">Maaf, halaman tidak dapat dimuat. Silakan coba lagi beberapa saat lagi.</p>
      <div class="btn-row">
        <a href="/" class="btn btn-primary">Ke beranda</a>
      </div>
    </div>
  </section>
)
