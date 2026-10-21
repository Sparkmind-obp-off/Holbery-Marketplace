import type { FC } from 'hono/jsx'
import type { OrderRow } from '../payments/orders'
import { downloadBlocker } from '../payments/orders'
import { formatPrice } from '../catalog/query'
import { PageHeader } from '../components/Common'

const STATUS_TEXT: Record<OrderRow['status'], { label: string; body: string; tone: string }> = {
  PENDING_PAYMENT: {
    label: 'Menunggu pembayaran',
    body: 'Kami belum menerima konfirmasi pembayaran dari Duitku. Jika Anda sudah membayar, konfirmasi biasanya masuk dalam beberapa menit.',
    tone: 'info'
  },
  PAID: { label: 'Pembayaran terverifikasi', body: 'Pembayaran Anda telah diverifikasi oleh server HOLBERY melalui Duitku.', tone: 'success' },
  FAILED: { label: 'Pembayaran gagal', body: 'Pembayaran tidak berhasil atau dibatalkan. Tidak ada dana yang kami terima untuk pesanan ini.', tone: 'warn' },
  EXPIRED: { label: 'Kedaluwarsa', body: 'Batas waktu pembayaran telah lewat. Silakan buat pesanan baru bila masih ingin membeli.', tone: 'warn' },
  REFUNDED: { label: 'Dana dikembalikan', body: 'Pesanan ini telah di-refund dan akses unduhan dinonaktifkan.', tone: 'warn' }
}

export const OrderPage: FC<{ order: OrderRow; token: string; supportContact: string | null; productSlug: string | null }> = ({
  order,
  token,
  supportContact,
  productSlug
}) => {
  const s = STATUS_TEXT[order.status]
  const blocker = downloadBlocker(order)
  const q = `?t=${encodeURIComponent(token)}`
  return (
    <>
      <PageHeader eyebrow="Pesanan" title={`Pesanan ${order.merchant_order_id}`} lead="Simpan tautan halaman ini. Tautan ini adalah akses pribadi Anda ke pesanan dan unduhan." />
      <section class="section section-tight">
        <div class="container container-narrow">
          <div class={`alert alert-${s.tone}`} role="status" id="order-status" data-status={order.status}>
            <strong>{s.label}.</strong> {s.body}
          </div>

          <dl class="spec-list order-summary">
            <div><dt>Produk</dt><dd>{order.product_title} <span class="muted">(v{order.product_version}, {order.sku})</span></dd></div>
            <div><dt>Total</dt><dd>{formatPrice({ amount: order.amount_idr, currency: 'IDR' })}</dd></div>
            <div><dt>Metode pembayaran</dt><dd>Duitku{order.provider_payment_code ? ` (${order.provider_payment_code})` : ''}</dd></div>
            <div><dt>Dibuat</dt><dd><time datetime={order.created_at}>{order.created_at.replace('T', ' ').slice(0, 16)} UTC</time></dd></div>
            {order.paid_at && <div><dt>Terverifikasi</dt><dd><time datetime={order.paid_at}>{order.paid_at.replace('T', ' ').slice(0, 16)} UTC</time></dd></div>}
          </dl>

          {order.status === 'PAID' && (
            <div class="download-box" id="download-box">
              <h2>Unduh produk</h2>
              {blocker ? (
                <p>Batas unduhan telah tercapai atau masa unduh berakhir. Hubungi dukungan untuk bantuan.</p>
              ) : (
                <>
                  <a class="btn btn-primary" href={`/pesanan/${order.id}/unduh${q}`} rel="nofollow" data-testid="download-button">Unduh berkas</a>
                  <p class="muted">
                    Sisa {order.download_limit - order.download_count} dari {order.download_limit} unduhan
                    {order.download_expires_at ? `, berlaku hingga ${order.download_expires_at.slice(0, 10)}` : ''}.
                  </p>
                </>
              )}
            </div>
          )}

          {order.status === 'PENDING_PAYMENT' && (
            <div class="btn-row">
              <button type="button" class="btn btn-secondary" id="reconcile-button" data-order={order.id} data-token={token}>
                Periksa status pembayaran
              </button>
              {order.provider_reference && (
                <button type="button" class="btn btn-primary" id="resume-pay-button" data-reference={order.provider_reference}>
                  Lanjutkan pembayaran
                </button>
              )}
            </div>
          )}
          {(order.status === 'FAILED' || order.status === 'EXPIRED') && productSlug && (
            <div class="btn-row"><a class="btn btn-primary" href={`/produk/${productSlug}`}>Buat pesanan baru</a></div>
          )}

          <p class="muted order-help">
            Butuh bantuan? {supportContact ? <>Hubungi {supportContact} dan sebutkan nomor pesanan <code>{order.merchant_order_id}</code>.</> : <a href="/kontak">Lihat halaman kontak</a>}
            {' '}Jangan bagikan tautan halaman ini.
          </p>
        </div>
      </section>
    </>
  )
}
