import { useState } from 'react'
import { Button, Drawer, Empty, InputNumber } from 'antd'
import { formatMoney } from '../../utils/formatMoney'
import './CartDrawer.css'

export default function CartDrawer({ open, onClose, cart, onQuantity, onRemove }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function update(action) {
    setError('')
    setBusy(true)
    try {
      await action()
    } catch (issue) {
      setError(issue.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Drawer
      title={`Giỏ hàng của bạn (${cart.count})`}
      open={open}
      onClose={onClose}
      size="min(460px, 100vw)"
      className="cart-drawer"
      footer={
        cart.items.length ? (
          <div className="cart-summary">
            <div>
              <span>Tạm tính</span>
              <strong>{formatMoney(cart.total)}</strong>
            </div>
            <p>Giỏ hàng dùng thử. Chanh&Man chưa tiếp nhận thanh toán hoặc đơn hàng.</p>
            <Button type="primary" block onClick={onClose}>
              Tiếp tục khám phá
            </Button>
          </div>
        ) : null
      }
    >
      {error && (
        <p role="alert" className="form-feedback">
          {error}
        </p>
      )}
      {cart.items.length ? (
        <div className="cart-items">
          {cart.items.map((item) => (
            <article key={item.variantId} className="cart-item">
              <img src={item.image} alt={item.name} width="104" height="80" />
              <div className="cart-item-content">
                <h3>{item.name}</h3>
                <p>{item.label}</p>
                <strong>{formatMoney(item.price)}</strong>
                <div className="cart-item-controls">
                  <InputNumber
                    aria-label={`Số lượng ${item.name} ${item.label}`}
                    min={1}
                    max={item.stock}
                    precision={0}
                    value={item.quantity}
                    disabled={busy}
                    onChange={(quantity) => {
                      if (quantity !== null) update(() => onQuantity(item.variantId, quantity))
                    }}
                  />
                  <button
                    className="text-action"
                    disabled={busy}
                    aria-label={`Xóa ${item.name} ${item.label}`}
                    onClick={() => update(() => onRemove(item.variantId))}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-cart">
          <Empty description="Giỏ hàng đang chờ lựa chọn của bạn." />
          <Button type="primary" onClick={onClose}>
            Khám phá sản phẩm
          </Button>
        </div>
      )}
    </Drawer>
  )
}
