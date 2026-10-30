import { useEffect, useState } from 'react'
import { Breadcrumb, Button, Empty, Skeleton } from 'antd'
import ShopLayout from '../layouts/ShopLayout'
import { listMyOrders } from '../services/orderService.js'
import { formatMoney } from '../utils/formatMoney.js'
import { orderStatusLabels, paymentStatusLabels } from '../utils/orderStatus.js'
import '../components/cart/CartPage.css'
import '../components/checkout/Checkout.css'

export default function Orders() {
  useEffect(() => { document.title = 'Đơn hàng của tôi | Chanh&Man' }, [])
  return <ShopLayout onSearch={(q) => window.location.assign(`/san-pham?q=${encodeURIComponent(q)}`)}>
    {({ authState }) => <div className="cart-page"><div className="container">
      <nav aria-label="Đường dẫn trang"><Breadcrumb separator=">" items={[
        { title: <a href="/">Trang chủ</a> }, { title: <a href="/account">Tài khoản</a> },
        { title: <span aria-current="page">Đơn hàng của tôi</span> },
      ]} /></nav>
      <header className="cart-page-heading"><h1>Đơn hàng của tôi<span>.</span></h1><p>Xem lại lựa chọn và theo dõi trạng thái đơn hàng của bạn.</p></header>
      {authState.loading ? <OrdersLoading />
        : authState.error ? <section className="cart-page-panel checkout-message" role="alert"><p>{authState.error}</p><Button onClick={authState.reload}>Thử lại</Button></section>
          : !authState.user ? <LoginRequired /> : <OrdersList key={authState.user.id} />}
    </div></div>}
  </ShopLayout>
}

function OrdersLoading() {
  return <section className="cart-page-panel" role="status" aria-label="Đang tải danh sách đơn hàng"><Skeleton active /></section>
}

function LoginRequired() {
  return <section className="cart-page-panel checkout-message"><h2>Đăng nhập để xem đơn hàng</h2>
    <p>Bạn chưa đăng nhập hoặc phiên đã kết thúc. Đăng nhập để xem đơn hàng của mình.</p>
    <Button type="primary" href="/login?next=%2Faccount%2Forders">Đăng nhập</Button>
  </section>
}

function OrdersList() {
  const [result, setResult] = useState(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    listMyOrders().then((orders) => { if (active) setResult({ orders }) })
      .catch((error) => { if (active) setResult({ error }) })
    return () => { active = false }
  }, [attempt])
  const refresh = () => { setResult(null); setAttempt((value) => value + 1) }
  if (!result) return <OrdersLoading />
  if (result.error?.code === 'UNAUTHENTICATED') return <LoginRequired />
  if (result.error) return <section className="cart-page-panel checkout-message" role="alert"><p>{result.error.message}</p><Button onClick={refresh}>Thử lại</Button></section>
  return <>
    <section className="cart-page-panel orders-toolbar">
      <div><nav className="orders-account-nav" aria-label="Điều hướng tài khoản">
        <a className="text-action" href="/account">Thông tin cá nhân</a>
        <a className="text-action" href="/account/orders" aria-current="page">Đơn hàng của tôi</a>
      </nav><p className="surface-note">{result.orders.length} đơn hàng · Mới nhất trước. Đơn dùng thử được lưu trên trình duyệt, chưa gửi tới cửa hàng.</p></div>
      <Button onClick={refresh}>Làm mới</Button>
    </section>
    {!result.orders.length ? <section className="cart-page-panel empty-cart"><Empty description="Bạn chưa có đơn hàng nào." />
      <Button type="primary" href="/san-pham">Khám phá sản phẩm</Button>
    </section> : <div className="orders-list" aria-label="Danh sách đơn hàng">{result.orders.map((order) => {
      const item = order.items[0]
      const count = order.items.reduce((sum, line) => sum + line.quantity, 0)
      return <article key={order.id} className="cart-page-panel orders-card" aria-labelledby={`order-${order.id}`}>
        <header className="orders-card-heading"><div><h2 id={`order-${order.id}`}>Đơn {order.code}</h2>
          <p className="surface-note">Ngày tạo: <time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleString('vi-VN')}</time></p>
        </div><span className="order-status">{orderStatusLabels[order.status]}</span></header>
        <div className="order-line"><img src={item.image} alt={item.productName} width="72" height="72" loading="lazy" />
          <div><h3>{item.productName}</h3><p className="surface-note">{item.variantLabel} · Số lượng: {item.quantity}</p>
            {order.items.length > 1 && <p className="surface-note">Và {order.items.length - 1} phiên bản khác trong đơn.</p>}
          </div>
        </div>
        <footer className="orders-card-footer"><div><p className="surface-note">{count} sản phẩm · COD · {paymentStatusLabels[order.paymentStatus]}</p>
          <p>Tổng thanh toán: <strong>{formatMoney(order.total)}</strong></p>
        </div><Button href={`/account/orders/${order.id}`} aria-label={`Xem chi tiết đơn ${order.code}`}>Xem chi tiết</Button></footer>
      </article>
    })}</div>}
  </>
}
