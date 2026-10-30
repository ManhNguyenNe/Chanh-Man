import { formatMoney } from '../../utils/formatMoney'
import './Checkout.css'

export default function OrderSummary({ quote, children }) {
  return <aside className="cart-page-panel cart-page-summary order-summary" aria-labelledby="order-summary-title">
    <h2 id="order-summary-title">Tóm tắt đơn hàng</h2>
    <div className="order-lines">{quote.items.map((item) => <article className="order-line" key={item.variantId}>
      <img src={item.image} alt={item.productName} width="72" height="72" />
      <div><h3><a href={`/san-pham/${encodeURIComponent(item.productId)}`}>{item.productName}</a></h3>
        <p className="surface-note">{item.variantLabel}</p>
        <p className="surface-note">{item.quantity} × {formatMoney(item.unitPrice)}</p>
        <strong>{formatMoney(item.quantity * item.unitPrice)}</strong>
      </div>
    </article>)}</div>
    <dl><div><dt>Tạm tính</dt><dd>{formatMoney(quote.subtotal)}</dd></div>
      <div><dt>Phí giao hàng dùng thử</dt><dd>{formatMoney(quote.shippingFee)}</dd></div>
      <div className="order-total"><dt>Tổng thanh toán</dt><dd aria-live="polite">{formatMoney(quote.total)}</dd></div>
    </dl>
    <p className="surface-note">Thanh toán khi nhận hàng (COD). Chưa thu tiền trực tuyến.</p>
    {children}
  </aside>
}
