import { useEffect, useState } from 'react'
import { Breadcrumb, Button, Skeleton } from 'antd'
import ShopLayout from '../layouts/ShopLayout'
import { getMyOrder } from '../services/orderService.js'
import OrderSummary from '../components/checkout/OrderSummary'
import { orderStatusLabels, paymentStatusLabels } from '../utils/orderStatus.js'
import '../components/cart/CartPage.css'

export default function Order({ id }) {
  useEffect(() => { document.title = 'Chi tiết đơn hàng | Chanh&Man' }, [])
  return <ShopLayout onSearch={(q) => window.location.assign(`/san-pham?q=${encodeURIComponent(q)}`)}>
    {({ authState, cartState }) => <OrderContent id={id} authState={authState} cart={cartState.cart} />}
  </ShopLayout>
}

function OrderContent({ id, authState, cart }) {
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    if (authState.user) getMyOrder(id).then((data) => { if (active) { setOrder(data); setError(null) } })
      .catch((issue) => { if (active) { setOrder(null); setError(issue) } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, authState.user, attempt])
  const unauthenticated = !authState.user || error?.code === 'UNAUTHENTICATED'
  const login = `/login?next=${encodeURIComponent(`/account/orders/${id}`)}`
  return <div className="cart-page"><div className="container">
    <nav aria-label="Đường dẫn trang"><Breadcrumb separator=">" items={[
      { title: <a href="/">Trang chủ</a> }, { title: <a href="/account">Tài khoản</a> }, { title: <a href="/account/orders">Đơn hàng của tôi</a> }, { title: <span aria-current="page">Chi tiết đơn hàng</span> },
    ]} /></nav>
    <header className="cart-page-heading"><h1>Chi tiết đơn hàng<span>.</span></h1><p>Kết quả đặt hàng COD dùng thử.</p></header>
    {authState.loading || (authState.user && loading) ? <section className="cart-page-panel" role="status" aria-label="Đang tải đơn hàng"><Skeleton active /></section>
      : authState.error ? <section className="cart-page-panel checkout-message" role="alert"><p>{authState.error}</p><Button onClick={authState.reload}>Thử lại</Button></section>
        : unauthenticated ? <section className="cart-page-panel checkout-message"><h2>Đăng nhập để xem đơn hàng</h2><Button type="primary" href={login}>Đăng nhập</Button></section>
          : error ? <section className="cart-page-panel checkout-message" role="alert"><p>{error.message}</p>
            {error.code !== 'NOT_FOUND' && <Button onClick={() => { setLoading(true); setAttempt((value) => value + 1) }}>Thử lại</Button>}<a className="text-action" href="/account">Về hồ sơ</a>
          </section> : order && order.userId === authState.user.id && <>
            <div className="cart-page-notice" role="status"><h2>Đã tạo đơn hàng dùng thử</h2><p>Đơn chưa được gửi tới cửa hàng. Không có thanh toán hoặc giao hàng thực tế.</p></div>
            {new URLSearchParams(window.location.search).get('cart') === 'kept' && cart.items.length > 0 && <div className="cart-page-notice" role="alert">
              <h2>Giỏ hàng được giữ lại</h2><p>Đơn đã được tạo, nhưng giỏ đã thay đổi hoặc chưa dọn được. Kiểm tra giỏ trước khi đặt tiếp để tránh chọn lại sản phẩm đã mua.</p><a className="text-action" href="/cart">Kiểm tra giỏ hàng</a>
            </div>}
            <div className="checkout-layout"><section className="cart-page-panel order-details">
              <div><h2>Đơn {order.code}</h2><p>Ngày tạo: {new Date(order.createdAt).toLocaleString('vi-VN')}</p><p>Trạng thái: {orderStatusLabels[order.status]}</p><p>Thanh toán COD: {paymentStatusLabels[order.paymentStatus]}</p></div>
              <div><h2>Thông tin giao hàng</h2><p>{order.shippingAddress.fullName}</p><p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.street}, {order.shippingAddress.ward}, {order.shippingAddress.city}</p>{order.shippingAddress.note && <p>Ghi chú: {order.shippingAddress.note}</p>}
              </div><p className="surface-note">Đơn và tồn kho được lưu dùng thử trên trình duyệt. Chỉ tài khoản đã đặt xem được đơn trong giao diện này.</p>
              <div className="order-actions"><Button type="primary" href="/san-pham">Tiếp tục mua sắm</Button><a className="text-action" href="/account/orders">Về danh sách đơn hàng</a></div>
            </section><OrderSummary quote={order} /></div>
          </>}
  </div></div>
}
