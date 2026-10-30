import { useEffect } from 'react'
import { Breadcrumb, Button, Empty, Skeleton } from 'antd'
import ShopLayout from '../layouts/ShopLayout'
import CartItems from '../components/cart/CartItems'
import { formatMoney } from '../utils/formatMoney'
import '../components/cart/CartPage.css'

export default function Cart() {
  useEffect(() => { document.title = 'Giỏ hàng | Chanh&Man' }, [])
  return <ShopLayout onSearch={(q) => window.location.assign(`/san-pham?q=${encodeURIComponent(q)}`)}>
    {({ cartState: { cart, loading, error, reload, updateQuantity, removeItem } }) => <div className="cart-page">
      <div className="container">
        <nav aria-label="Đường dẫn trang"><Breadcrumb separator=">" items={[
          { title: <a href="/">Trang chủ</a> },
          { title: <span aria-current="page">Giỏ hàng</span> },
        ]} /></nav>
        <header className="cart-page-heading"><h1>Giỏ hàng<span>.</span></h1>
          <p role="status">{loading ? 'Đang tải giỏ hàng…' : `${cart.count} sản phẩm trong giỏ`}</p>
        </header>
        {!loading && cart.notices?.length > 0 && <div className="cart-page-notice" role="status">
          <h2>Giỏ hàng đã được cập nhật</h2>{cart.notices.map((notice) => <p key={notice}>{notice}</p>)}
        </div>}
        {loading ? <div className="cart-page-panel" role="status" aria-label="Đang tải giỏ hàng"><Skeleton active /></div>
          : error ? <div className="cart-page-panel" role="alert"><p>{error}</p><Button onClick={reload}>Thử lại</Button></div>
          : cart.items.length ? <div className="cart-page-layout">
            <section className="cart-page-panel" aria-label="Sản phẩm trong giỏ">
              <CartItems cart={cart} onQuantity={updateQuantity} onRemove={removeItem} />
              <a className="text-action" href="/san-pham">Tiếp tục chọn sản phẩm ↗</a>
            </section>
            <aside className="cart-page-panel cart-page-summary" aria-labelledby="cart-summary-title">
              <h2 id="cart-summary-title">Tóm tắt giỏ hàng</h2>
              <dl><div><dt>Số lượng</dt><dd>{cart.count} sản phẩm</dd></div>
                <div><dt>Tạm tính</dt><dd aria-live="polite">{formatMoney(cart.total)}</dd></div>
                <div><dt>Phí giao hàng</dt><dd>Chưa tính</dd></div></dl>
              <p className="surface-note">Phí giao hàng sẽ được hiển thị tại bước đặt hàng.</p>
              <Button type="primary" block href="/checkout" aria-describedby="checkout-note">Tiếp tục đặt hàng</Button>
              <p id="checkout-note" className="surface-note">Đăng nhập và kiểm tra thông tin giao hàng để tạo đơn COD dùng thử. Chưa có giao hàng hoặc thanh toán thực tế.</p>
            </aside>
          </div> : <section className="cart-page-panel empty-cart">
            <Empty description="Giỏ hàng của bạn đang trống." />
            <p>Khám phá laptop và điện thoại phù hợp với bạn.</p>
            <Button type="primary" href="/san-pham">Khám phá sản phẩm</Button>
          </section>}
      </div>
    </div>}
  </ShopLayout>
}
