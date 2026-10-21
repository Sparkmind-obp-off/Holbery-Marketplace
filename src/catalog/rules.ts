import type { ChannelListing, Product } from './schema'

export interface VisibilityOptions {
  showDemonstrationRecords: boolean
}

/**
 * Public visibility rule.
 * - Real products are public only when `published` or `paused` (paused shows as unavailable).
 * - Draft / review / archived real products are never exposed publicly.
 * - Demonstration records are public only when explicitly enabled, and are
 *   always labelled as demonstrations in the UI. Archived demos stay hidden.
 */
export function isPubliclyVisible(p: Product, opts: VisibilityOptions): boolean {
  if (p.status === 'archived') return false
  if (p.kind === 'demonstration') return opts.showDemonstrationRecords
  return p.status === 'published' || p.status === 'paused'
}

/** Returns the first verified active listing, if any. */
export function getActiveListing(p: Product): ChannelListing | undefined {
  return p.channelListings.find(
    (l) => l.status === 'active' && typeof l.url === 'string' && l.url.startsWith('https://') && !!l.lastVerified
  )
}

/**
 * Purchase rule — the ONLY place that decides whether a buy CTA is rendered.
 * A product is purchasable only when ALL of the following hold:
 *   real product, published, available, both reviews passed, a real delivery
 *   method, and a verified active external listing URL.
 */
export function isPurchasable(p: Product): boolean {
  return (
    p.kind === 'product' &&
    p.status === 'published' &&
    p.availability === 'available' &&
    p.reviews.quality === 'passed' &&
    p.reviews.rights === 'passed' &&
    p.deliveryMethod !== 'not_yet_available' &&
    getActiveListing(p) !== undefined
  )
}

export type DisplayState = 'demonstration' | 'available' | 'coming_soon' | 'paused' | 'not_available'

export function getDisplayState(p: Product): DisplayState {
  if (p.kind === 'demonstration') return 'demonstration'
  if (isPurchasable(p)) return 'available'
  if (p.status === 'paused') return 'paused'
  if (p.availability === 'coming_soon') return 'coming_soon'
  return 'not_available'
}

export const DISPLAY_STATE_LABEL: Record<DisplayState, string> = {
  demonstration: 'Data demonstrasi',
  available: 'Tersedia',
  coming_soon: 'Segera hadir',
  paused: 'Dijeda sementara',
  not_available: 'Belum tersedia'
}

export const STATUS_LABEL: Record<Product['status'], string> = {
  draft: 'Draf',
  review: 'Dalam peninjauan',
  published: 'Dipublikasikan',
  paused: 'Dijeda',
  archived: 'Diarsipkan'
}

export const DELIVERY_LABEL: Record<Product['deliveryMethod'], string> = {
  external_channel: 'Melalui kanal penjualan resmi',
  protected_download: 'Unduhan terlindungi',
  manual: 'Dikirim manual setelah pesanan terverifikasi',
  not_yet_available: 'Belum tersedia'
}

export const REVIEW_LABEL: Record<Product['reviews']['quality'], string> = {
  not_started: 'Belum dimulai',
  in_progress: 'Sedang berjalan',
  passed: 'Lulus',
  failed: 'Tidak lulus'
}
