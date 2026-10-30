import { useEffect, useRef, useState } from 'react'
import { Breadcrumb, Button, Form, Input, Skeleton } from 'antd'
import ShopLayout from '../layouts/ShopLayout'
import { profilePhonePattern, signOut, updateProfile } from '../services/authService.js'
import '../components/auth/Auth.css'

export default function Profile() {
  useEffect(() => { document.title = 'Hồ sơ của bạn | Chanh&Man' }, [])
  return <ShopLayout onSearch={(q) => window.location.assign(`/san-pham?q=${encodeURIComponent(q)}`)}>
    {({ authState }) => <div className="auth-page"><div className="container">
      <nav aria-label="Đường dẫn trang"><Breadcrumb separator=">" items={[
        { title: <a href="/">Trang chủ</a> }, { title: <span aria-current="page">Hồ sơ của bạn</span> },
      ]} /></nav>
      <header className="auth-page-heading"><h1>Hồ sơ của bạn<span>.</span></h1>
        <p>Quản lý thông tin cá nhân và tài khoản của bạn.</p>
      </header>
      {authState.loading ? <section className="auth-panel" role="status" aria-label="Đang tải hồ sơ"><Skeleton active /></section>
        : authState.error ? <section className="auth-panel auth-result" role="alert"><p>{authState.error}</p><Button onClick={authState.reload}>Thử lại</Button></section>
        : authState.user ? <ProfileForm key={authState.user.id} user={authState.user} onExpired={authState.reload} />
          : <section className="auth-panel auth-result"><h2>Vui lòng đăng nhập</h2>
            <p>Bạn chưa đăng nhập hoặc phiên đã kết thúc. Đăng nhập để xem và sửa hồ sơ của mình.</p>
            <Button type="primary" href="/login?next=%2Faccount">Đăng nhập</Button>
          </section>}
    </div></div>}
  </ShopLayout>
}

function ProfileForm({ user, onExpired }) {
  const [form] = Form.useForm()
  const [busy, setBusy] = useState('')
  const [feedback, setFeedback] = useState(null)
  const pending = useRef(false)
  function showError(issue) {
    setFeedback({ error: true, message: issue.message })
    if (issue.fieldErrors) form.setFields(Object.entries(issue.fieldErrors).map(([name, text]) => ({ name, errors: [text] })))
    if (issue.code === 'UNAUTHENTICATED') onExpired()
  }
  async function save(values) {
    if (pending.current) return
    pending.current = true
    setBusy('save')
    setFeedback(null)
    try {
      const profile = await updateProfile(values)
      form.setFieldsValue({ displayName: profile.displayName, phone: profile.phone })
      setFeedback({ message: 'Đã lưu thông tin hồ sơ.' })
    } catch (issue) { showError(issue) }
    finally { pending.current = false; setBusy('') }
  }
  async function logout() {
    if (pending.current) return
    pending.current = true
    setBusy('logout')
    setFeedback(null)
    try { await signOut() }
    catch (issue) { showError(issue) }
    finally { pending.current = false; setBusy('') }
  }
  return <div className="auth-layout profile-layout">
    <section className="auth-panel profile-form" aria-labelledby="profile-form-title">
      <h2 id="profile-form-title">Thông tin cá nhân</h2>
      <Form form={form} layout="vertical" initialValues={{ displayName: user.displayName, email: user.email, phone: user.phone || '' }}
        disabled={Boolean(busy)} onFinish={save} onValuesChange={() => setFeedback(null)} requiredMark={false}>
        <Form.Item name="displayName" label="Họ và tên" rules={[
          { required: true, whitespace: true, message: 'Vui lòng nhập họ và tên.' },
          { min: 2, max: 80, transform: (value) => value?.trim(), message: 'Họ và tên từ 2 đến 80 ký tự.' },
        ]}><Input autoComplete="name" maxLength={80} /></Form.Item>
        <Form.Item name="email" label="Email" extra="Email dùng để đăng nhập và không thay đổi tại đây.">
          <Input readOnly autoComplete="email" />
        </Form.Item>
        <Form.Item name="phone" label="Số điện thoại" extra="Không bắt buộc. Nhập 8–15 chữ số, có thể bắt đầu bằng +."
          rules={[{ pattern: profilePhonePattern, transform: (value) => value?.trim(), message: 'Số điện thoại cần 8–15 chữ số, có thể bắt đầu bằng +.' }]}>
          <Input type="tel" autoComplete="tel" maxLength={16} />
        </Form.Item>
        {feedback && <p className="form-feedback" role={feedback.error ? 'alert' : 'status'}>{feedback.message}</p>}
        <Button type="primary" htmlType="submit" loading={busy === 'save'} disabled={busy === 'logout'}>Lưu thay đổi</Button>
      </Form>
    </section>
    <aside className="auth-panel auth-demo" aria-labelledby="profile-account-title">
      <h2 id="profile-account-title">Tài khoản của bạn</h2>
      <p>Xin chào <strong>{user.displayName}</strong>.</p>
      <nav className="profile-links" aria-label="Điều hướng tài khoản">
        <a className="text-action" href="/account" aria-current="page">Thông tin cá nhân</a>
        <Button href="/account/orders">Đơn hàng của tôi</Button>
        <a className="text-action" href="/cart">Xem giỏ hàng</a>
        <a className="text-action" href="/san-pham">Tiếp tục mua sắm</a>
      </nav>
      <Button loading={busy === 'logout'} disabled={busy === 'save'} onClick={logout}>Đăng xuất</Button>
      <p className="surface-note">Hồ sơ dùng thử được giữ trong tab này. Chỉ sử dụng thông tin minh họa.</p>
    </aside>
  </div>
}
