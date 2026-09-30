import { useRef, useState } from 'react'
import { InputNumber } from 'antd'
import { formatMoney } from '../../utils/formatMoney'
import './CartDrawer.css'

export default function CartItems({ cart, onQuantity, onRemove }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  async function update(action) {
    if (pending.current) return
    pending.current = true
    setError('')
    setBusy(true)
    try { await action() }
    catch (issue) { setError(issue.message) }
    finally { pending.current = false; setBusy(false) }
  }
  return <>
    {error && <p role="alert" className="form-feedback">{error}</p>}
    <div className="cart-items" aria-busy={busy}>
      {cart.items.map((item) => <article key={item.variantId} className="cart-item">
        <a href={`/san-pham/${encodeURIComponent(item.productId)}`} aria-label={`Xem ${item.name}`}>
          <img src={item.image} alt={item.name} width="104" height="80" />
        </a>
        <div className="cart-item-content">
          <h3><a href={`/san-pham/${encodeURIComponent(item.productId)}`}>{item.name}</a></h3>
          <p>{item.label}</p>
          <strong>{formatMoney(item.price)} <span className="surface-note">/ sản phẩm</span></strong>
          <div className="cart-item-controls">
            <InputNumber aria-label={`Số lượng ${item.name} ${item.label}`} min={1} max={item.stock}
              precision={0} value={item.quantity} disabled={busy}
              onChange={(quantity) => { if (quantity !== null) update(() => onQuantity(item.variantId, quantity)) }} />
            <button className="text-action" disabled={busy} aria-label={`Xóa ${item.name} ${item.label}`}
              onClick={() => update(() => onRemove(item.variantId))}>Xóa</button>
          </div>
          <p>Còn {item.stock} sản phẩm</p>
          <div className="cart-line-total"><span>Thành tiền</span><strong>{formatMoney(item.price * item.quantity)}</strong></div>
        </div>
      </article>)}
    </div>
  </>
}
