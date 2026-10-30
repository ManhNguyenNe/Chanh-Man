import { useEffect, useRef, useState } from 'react'
import { Breadcrumb, Button, Empty, Form, Input, Radio, Skeleton } from 'antd'
import ShopLayout from '../layouts/ShopLayout'
import { profilePhonePattern } from '../services/authService.js'
import { createOrder, getMyOrder, quoteOrder } from '../services/orderService.js'
import { clearPurchasedCart } from '../services/cartService.js'
import OrderSummary from '../components/checkout/OrderSummary'
import '../components/cart/CartPage.css'

export default function Checkout() {
  useEffect(() => { document.title = 'Đặt hàng | Chanh&Man' }, [])
  return <ShopLayout onSearch={(q) => window.location.assign(`/san-pham?q=${encodeURIComponent(q)}`)}>
    {(state) => <CheckoutContent {...state} />}
  </ShopLayout>
}

function CheckoutContent({ authState, cartState }) {
  const [receipt] = useState(() => new URLSearchParams(window.location.search).get('order'))
  const [recovering, setRecovering] = useState(Boolean(receipt))
  const [recoveryError, setRecoveryError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    if (receipt && authState.user) getMyOrder(receipt).then((order) => {
      if (active) window.location.replace(`/account/orders/${order.id}?cart=kept`)
    }).catch((issue) => { if (active && issue.code !== 'NOT_FOUND') setRecoveryError(issue.message) })
      .finally(() => { if (active) setRecovering(false) })
    return () => { active = false }
  }, [receipt, authState.user, attempt])
  const { cart } = cartState
  const login = `/login?next=${encodeURIComponent('/checkout' + (receipt ? `?order=${encodeURIComponent(receipt)}` : ''))}`
  return <div className="cart-page"><div className="container">
    <nav aria-label="Đường dẫn trang"><Breadcrumb separator=">" items={[
      { title: <a href="/">Trang chủ</a> }, { title: <a href="/cart">Giỏ hàng</a> },
      { title: <span aria-current="page">Đặt hàng</span> },
    ]} /></nav>
    <header className="cart-page-heading"><h1>Đặt hàng<span>.</span></h1><p>Kiểm tra lựa chọn và thông tin giao hàng trước khi xác nhận.</p></header>
    {authState.loading || cartState.loading || (authState.user && recovering) ? <section className="cart-page-panel" role="status" aria-label="Đang tải đơn hàng"><Skeleton active /></section>
      : recoveryError || authState.error || cartState.error ? <section className="cart-page-panel checkout-message" role="alert">
        <p>{recoveryError || authState.error || cartState.error}</p>
        <Button onClick={() => { setRecoveryError(''); setRecovering(Boolean(receipt)); setAttempt((value) => value + 1); authState.reload(); cartState.reload() }}>Thử lại</Button>
      </section> : !authState.user ? <section className="cart-page-panel checkout-message"><h2>Đăng nhập để đặt hàng</h2>
        <p>Phiên đã kết thúc hoặc bạn chưa đăng nhập. Giỏ hàng vẫn được giữ khi đăng nhập.</p><Button type="primary" href={login}>Đăng nhập</Button>
        <a className="text-action" href="/cart">Quay lại giỏ hàng</a>
      </section> : !cart.items.length ? <section className="cart-page-panel empty-cart"><Empty description="Giỏ hàng của bạn đang trống." />
        <Button type="primary" href="/san-pham">Khám phá sản phẩm</Button>
      </section> : <CheckoutForm key={authState.user.id} user={authState.user} cart={cart} onExpired={authState.reload} />}
  </div></div>
}

function CheckoutForm({ user, cart, onExpired }) {
  const [form] = Form.useForm()
  const [quote, setQuote] = useState(null)
  const [reviewed, setReviewed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const pending = useRef(false)
  const requestId = useRef(null)
  const reviewHeading = useRef(null)
  useEffect(() => {
    let active = true
    quoteOrder({ items: cart.items, paymentMethod: 'cod' }).then((data) => {
      if (active) { setQuote(data); setReviewed(false); setError(''); requestId.current = null }
    }).catch((issue) => { if (active) { setQuote(null); setError(issue.message) } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [cart.items, attempt])
  useEffect(() => { if (reviewed) reviewHeading.current?.focus() }, [reviewed])
  function showError(issue) {
    setError(issue.message)
    if (issue.fieldErrors) form.setFields(Object.entries(issue.fieldErrors).map(([name, message]) => ({ name, errors: [message] })))
    if (issue.quote) { setQuote(issue.quote); setReviewed(!issue.quote.issues.length) }
    if (issue.code === 'UNAUTHENTICATED') onExpired()
  }
  async function review(values) {
    if (pending.current) return
    pending.current = true
    setBusy('quote')
    setError('')
    try {
      const data = await quoteOrder({ items: cart.items, shippingAddress: values, paymentMethod: 'cod' })
      setQuote(data)
      setReviewed(!data.issues.length)
      requestId.current ||= crypto.randomUUID()
    } catch (issue) { showError(issue) }
    finally { pending.current = false; setBusy('') }
  }
  async function confirm() {
    if (pending.current || !reviewed || quote.issues.length) return
    pending.current = true
    setBusy('order')
    setError('')
    try {
      // The URL preserves this attempt's ID if the response/navigation is interrupted.
      window.history.replaceState(null, '', `/checkout?order=${requestId.current}`)
      const order = await createOrder({ items: quote.items, shippingAddress: quote.shippingAddress, paymentMethod: 'cod',
        requestId: requestId.current, quoteFingerprint: quote.fingerprint })
      let cleared = false
      try { cleared = await clearPurchasedCart(order.items) } catch { /* Keep the successful order; the result page explains the retained cart. */ }
      window.location.replace(`/account/orders/${order.id}${cleared ? '' : '?cart=kept'}`)
    } catch (issue) { showError(issue) }
    finally { pending.current = false; setBusy('') }
  }
  return <div className="checkout-layout">
    <section className="cart-page-panel checkout-form" aria-labelledby="shipping-title"><h2 id="shipping-title">Thông tin giao hàng</h2>
      <p className="surface-note">Đơn hàng dùng thử, chưa gửi tới cửa hàng. Chỉ nhập thông tin minh họa.</p>
      {cart.notices?.map((notice) => <p className="form-feedback" key={notice} role="status">{notice}</p>)}
      <Form form={form} layout="vertical" requiredMark={false} disabled={Boolean(busy)}
        initialValues={{ fullName: user.displayName, phone: user.phone, paymentMethod: 'cod' }} onFinish={review}
        onFinishFailed={({ errorFields }) => {
          setError('Thông tin giao hàng chưa hợp lệ. Vui lòng sửa các trường được báo lỗi rồi kiểm tra lại đơn hàng.')
          if (errorFields.length) form.scrollToField(errorFields[0].name, { block: 'center', focus: true })
        }}
        onValuesChange={() => { setReviewed(false); setError(''); requestId.current = null }}>
        <Form.Item name="fullName" label="Tên người nhận" rules={[{ required: true, whitespace: true, message: 'Vui lòng nhập tên người nhận.' },
          { min: 2, max: 80, transform: (value) => value?.trim(), message: 'Tên người nhận từ 2 đến 80 ký tự.' }]}><Input autoComplete="shipping name" maxLength={80} /></Form.Item>
        <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại.' },
          { pattern: profilePhonePattern, transform: (value) => value?.trim(), message: 'Nhập 8–15 chữ số, có thể bắt đầu bằng +.' }]}><Input type="tel" autoComplete="shipping tel" maxLength={16} /></Form.Item>
        <Form.Item name="street" label="Địa chỉ cụ thể" rules={[{ required: true, whitespace: true, message: 'Vui lòng nhập địa chỉ cụ thể.' },
          { min: 5, max: 240, transform: (value) => value?.trim(), message: 'Địa chỉ từ 5 đến 240 ký tự.' }]}><Input autoComplete="shipping street-address" maxLength={240} /></Form.Item>
        <div className="checkout-address-fields">{[['ward', 'Phường / xã', 'shipping address-level2'], ['city', 'Tỉnh / thành phố', 'shipping address-level1']].map(([name, label, autoComplete]) =>
          <Form.Item key={name} name={name} label={label} rules={[{ required: true, whitespace: true, message: `Vui lòng nhập ${label.toLowerCase()}.` },
            { min: 2, max: 80, transform: (value) => value?.trim(), message: `${label} từ 2 đến 80 ký tự.` }]}><Input autoComplete={autoComplete} maxLength={80} /></Form.Item>)}
        </div>
        <Form.Item name="note" label="Ghi chú (không bắt buộc)" rules={[{ max: 500, message: 'Ghi chú tối đa 500 ký tự.' }]}><Input.TextArea rows={3} maxLength={500} /></Form.Item>
        <Form.Item name="paymentMethod" label="Thanh toán"><Radio.Group options={[{ value: 'cod', label: 'Thanh toán khi nhận hàng (COD)' }]} /></Form.Item>
        {error && <p role="alert" className="form-feedback">{error}</p>}
        <Button type="primary" htmlType="submit" loading={busy === 'quote'} disabled={busy === 'order' || loading || !quote}>Kiểm tra đơn hàng</Button>
        {!quote && !loading && <Button onClick={() => { setLoading(true); setAttempt((value) => value + 1) }}>Thử lại báo giá</Button>}
      </Form>
      <a className="text-action" href="/cart">Quay lại chỉnh giỏ hàng</a>
    </section>
    {loading ? <section className="cart-page-panel" role="status" aria-label="Đang kiểm tra báo giá"><Skeleton active /></section> : quote && <OrderSummary quote={quote}>
      {quote.issues.length > 0 && <div role="alert"><p>Vui lòng chỉnh giỏ hàng trước khi xác nhận.</p>{quote.issues.map((issue) => <p key={issue.variantId}>{issue.message}</p>)}</div>}
      {reviewed ? <><div className="order-review"><h3 ref={reviewHeading} tabIndex={-1}>Kiểm tra trước khi đặt</h3>
        <p>{quote.shippingAddress.fullName} · {quote.shippingAddress.phone}</p>
        <p>{quote.shippingAddress.street}, {quote.shippingAddress.ward}, {quote.shippingAddress.city}</p>
        {quote.shippingAddress.note && <p>{quote.shippingAddress.note}</p>}
      </div><Button type="primary" block loading={busy === 'order'} disabled={busy === 'quote'} onClick={confirm}>Xác nhận đặt hàng COD</Button></>
        : <p className="surface-note">Nhập thông tin và nhấn Kiểm tra đơn hàng để xem lại trước khi đặt.</p>}
      {error && reviewed && <p role="alert">{error}</p>}
    </OrderSummary>}
  </div>
}
