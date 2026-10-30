import { Button, Drawer, Empty } from 'antd'
import CartItems from './CartItems'
import { formatMoney } from '../../utils/formatMoney'
import './CartDrawer.css'

export default function CartDrawer({ open, onClose, cart, onQuantity, onRemove }) {
  return <Drawer title={`Giỏ hàng của bạn (${cart.count})`} open={open} onClose={onClose}
    size="min(460px, 100vw)" className="cart-drawer"
    footer={cart.items.length ? <div className="cart-summary">
      <div><span>Tạm tính</span><strong>{formatMoney(cart.total)}</strong></div>
      <p>Giỏ hàng dùng thử. Chưa có thanh toán hoặc giao hàng thực tế.</p>
      <Button type="primary" block href="/cart">Xem giỏ hàng</Button>
    </div> : null}>
    {cart.notices?.map((notice) => <p key={notice} role="status" className="surface-note">{notice}</p>)}
    {cart.items.length ? <CartItems cart={cart} onQuantity={onQuantity} onRemove={onRemove} />
      : <div className="empty-cart"><Empty description="Giỏ hàng đang chờ lựa chọn của bạn." />
        <Button type="primary" onClick={onClose}>Khám phá sản phẩm</Button>
      </div>}
  </Drawer>
}
