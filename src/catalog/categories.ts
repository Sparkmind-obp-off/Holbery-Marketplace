import type { CategorySlug } from './schema'

export interface Category {
  slug: CategorySlug
  name: string
  nameEn: string
  description: string
  examples: string[]
}

/** Source: docs/04-product-taxonomy.md */
export const CATEGORIES: readonly Category[] = [
  {
    slug: 'bisnis-keuangan',
    name: 'Bisnis & Keuangan',
    nameEn: 'Business & Finance',
    description: 'Alat pembukuan, arus kas, inventaris, kalkulator harga/HPP, dan laporan penjualan untuk usaha kecil.',
    examples: ['Pembukuan sederhana', 'Arus kas', 'Kalkulator HPP']
  },
  {
    slug: 'produktivitas-operasional',
    name: 'Produktivitas & Operasional',
    nameEn: 'Productivity & Operations',
    description: 'Planner, tracker, SOP, checklist, dan workflow kit untuk menjalankan pekerjaan harian dengan rapi.',
    examples: ['SOP', 'Checklist', 'Tracker']
  },
  {
    slug: 'kreatif-desain',
    name: 'Kreatif & Desain',
    nameEn: 'Creative & Design',
    description: 'Template orisinal yang dapat diedit: katalog, menu, materi promosi, dan aset media sosial.',
    examples: ['Katalog produk', 'Menu', 'Kit promosi']
  },
  {
    slug: 'pengetahuan-edukasi',
    name: 'Pengetahuan & Edukasi',
    nameEn: 'Knowledge & Education',
    description: 'Panduan praktis, workbook, tutorial, dan materi pelatihan yang langsung bisa dipraktikkan.',
    examples: ['Panduan PDF', 'Workbook', 'Materi pelatihan']
  },
  {
    slug: 'software-tools',
    name: 'Software & Tools',
    nameEn: 'Software & Tools',
    description: 'Kalkulator, dashboard, alat web kecil, dan utilitas bisnis yang fokus pada satu pekerjaan.',
    examples: ['Kalkulator', 'Dashboard', 'Utilitas web']
  },
  {
    slug: 'ai-otomasi',
    name: 'AI & Otomasi',
    nameEn: 'AI & Automation',
    description: 'Prompt kit, desain workflow, otomasi spreadsheet, dan instruksi agen yang dapat digunakan ulang.',
    examples: ['Prompt kit', 'Workflow AI', 'Otomasi spreadsheet']
  },
  {
    slug: 'solusi-industri',
    name: 'Solusi Industri',
    nameEn: 'Industry Solutions',
    description: 'Paket khusus untuk penjual online, warung/ritel mikro, usaha jasa, barbershop, dan kreator.',
    examples: ['Penjual online', 'Warung', 'Usaha jasa']
  },
  {
    slug: 'bundel-sistem-premium',
    name: 'Bundel & Sistem Premium',
    nameEn: 'Bundles & Premium Systems',
    description: 'Kumpulan produk yang saling terhubung dengan panduan setup dan hasil akhir yang jelas.',
    examples: ['Bundel', 'Sistem lengkap']
  }
] as const

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug)
}
