import { useEffect, useRef, useState } from 'react'
import { Breadcrumb, Button, Form, Input, Skeleton } from 'antd'
import ShopLayout from '../layouts/ShopLayout'
import { demoPassword, signIn, signUp, signOut, verifyDemoEmail } from '../services/authService.js'
import { authReturnPath } from '../utils/authRoutes.js'
import '../components/auth/Auth.css'

export default function Auth({ mode }) {
  return <ShopLayout onSearch={(q) => window.location.assign(`/san-pham?q=${encodeURIComponent(q)}`)}>
    {({ authState }) => <AuthContent key={mode} mode={mode} authState={authState} />}
  </ShopLayout>
}

function AuthContent({ mode, authState }) {
  const register = mode === 'register'
  const title = register ? 'Đăng ký' : 'Đăng nhập'
  const next = authReturnPath(new URLSearchParams(window.location.search).get('next'))
  const switchUrl = `/${register ? 'login' : 'register'}?next=${encodeURIComponent(next)}`
  const loginUrl = `/login?next=${encodeURIComponent(next)}`
  const [form] = Form.useForm()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [verified, setVerified] = useState(false)
  const pending = useRef(false)
  const resultHeading = useRef(null)
  useEffect(() => { document.title = `${title} | Chanh&Man` }, [title])
  useEffect(() => { if (result) resultHeading.current?.focus() }, [result])

  function showError(issue) {
    setError(issue.message)
    if (issue.fieldErrors) form.setFields(Object.entries(issue.fieldErrors).map(([name, text]) => ({ name, errors: [text] })))
  }
  async function submit(values) {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setError('')
    try {
      if (register) {
        const response = await signUp(values)
        form.resetFields(['password', 'confirmPassword'])
        setResult(response)
      } else {
        await signIn(values)
        window.location.replace(next)
      }
    } catch (issue) {
      showError(issue)
      if (issue.code === 'EMAIL_NOT_VERIFIED') {
        form.resetFields(['password'])
        setResult({ email: values.email.trim().toLowerCase() })
      }
    }
    finally { pending.current = false; setBusy(false) }
  }
  async function verify() {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setError('')
    try { await verifyDemoEmail(result.email); setVerified(true) }
    catch (issue) { showError(issue) }
    finally { pending.current = false; setBusy(false) }
  }
  async function logout() {
    setBusy(true)
    setError('')
    try { await signOut() } catch (issue) { showError(issue) }
    finally { setBusy(false) }
  }
  return <div className="auth-page"><div className="container">
    <nav aria-label="Đường dẫn trang"><Breadcrumb separator=">" items={[
      { title: <a href="/">Trang chủ</a> }, { title: <span aria-current="page">{title}</span> },
    ]} /></nav>
    <header className="auth-page-heading"><h1>{title}<span>.</span></h1>
      <p>{register ? 'Bắt đầu trải nghiệm cùng Chanh&Man.' : 'Chào mừng bạn trở lại Chanh&Man.'}</p>
    </header>
    <div className="auth-layout">
      <section className="auth-panel" aria-label={title}>
        {authState.loading ? <div role="status" aria-label="Đang tải tài khoản"><Skeleton active /></div>
          : authState.error ? <div role="alert"><p>{authState.error}</p><Button onClick={authState.reload}>Thử lại</Button></div>
          : authState.user ? <div className="auth-result"><h2>Bạn đã đăng nhập</h2><p>Xin chào {authState.user.displayName}.</p>
            <Button type="primary" href={next}>Tiếp tục mua sắm</Button><a className="text-action" href="/account">Xem hồ sơ</a><Button loading={busy} onClick={logout}>Đăng xuất</Button>
            {error && <p role="alert" className="form-feedback">{error}</p>}
          </div> : result ? <div className="auth-result">
            <h2 ref={resultHeading} tabIndex={-1}>Xác minh email dùng thử</h2>
            <p>Tài khoản <strong>{result.email}</strong> đã được tạo trong phiên dùng thử.</p>
            <p>{verified ? 'Email đã được xác minh giả lập. Bạn có thể đăng nhập ngay.' : 'Chưa gửi email thật. Nhấn nút bên dưới để mô phỏng bước xác minh.'}</p>
            {error && <p role="alert" className="form-feedback">{error}</p>}
            {verified ? <Button type="primary" href={loginUrl}>Đăng nhập ngay</Button>
              : <Button type="primary" loading={busy} onClick={verify}>Mô phỏng xác minh email</Button>}
            {!verified && <a className="text-action" href={loginUrl}>Về trang đăng nhập</a>}
          </div> : <>
            <Form form={form} layout="vertical" disabled={busy} onFinish={submit} onValuesChange={() => setError('')} requiredMark={false}>
              {register && <Form.Item name="displayName" label="Họ và tên" rules={[
                { required: true, whitespace: true, message: 'Vui lòng nhập họ và tên.' },
                { min: 2, max: 80, message: 'Họ và tên từ 2 đến 80 ký tự.' },
              ]}><Input autoComplete="name" maxLength={80} /></Form.Item>}
              <Form.Item name="email" label="Email" rules={[
                { required: true, message: 'Vui lòng nhập email.' },
                { type: 'email', transform: (value) => value?.trim(), message: 'Email chưa đúng định dạng.' },
                { max: 254, message: 'Email tối đa 254 ký tự.' },
              ]}><Input autoComplete="email" inputMode="email" maxLength={254} /></Form.Item>
              <Form.Item name="password" label="Mật khẩu" extra={register ? `Bản dùng thử sử dụng mật khẩu chung: ${demoPassword}` : null} rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu.' },
                ...(register ? [{ validator: (_, value) => !value || value === demoPassword ? Promise.resolve() : Promise.reject(new Error(`Vui lòng dùng mật khẩu dùng thử ${demoPassword}.`)) }] : []),
              ]}><Input.Password autoComplete={register ? 'new-password' : 'current-password'} /></Form.Item>
              {register && <Form.Item name="confirmPassword" label="Nhập lại mật khẩu" dependencies={['password']} rules={[
                { required: true, message: 'Vui lòng nhập lại mật khẩu.' },
                ({ getFieldValue }) => ({ validator: (_, value) => !value || value === getFieldValue('password') ? Promise.resolve() : Promise.reject(new Error('Mật khẩu nhập lại chưa khớp.')) }),
              ]}><Input.Password autoComplete="new-password" /></Form.Item>}
              {error && <p role="alert" className="form-feedback">{error}</p>}
              <Button type="primary" htmlType="submit" block loading={busy}>{register ? 'Tạo tài khoản' : 'Đăng nhập'}</Button>
            </Form>
            {!register && <a className="text-action" href={`/forgot-password?next=${encodeURIComponent(next)}`}>Quên mật khẩu?</a>}
            <p className="auth-switch">{register ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'} <a className="text-action" href={switchUrl}>{register ? 'Đăng nhập' : 'Đăng ký ngay'}</a></p>
          </>}
      </section>
      <aside className="auth-panel auth-demo" aria-labelledby="auth-demo-title"><h2 id="auth-demo-title">Trải nghiệm tài khoản</h2>
        <p>Đăng nhập để thử luồng mua hàng. Các lựa chọn trong giỏ vẫn được giữ khi đăng nhập hoặc đăng xuất.</p>
        <dl><div><dt>Email khách hàng</dt><dd>customer@chanhman.test</dd></div><div><dt>Mật khẩu dùng thử</dt><dd>{demoPassword}</dd></div></dl>
        <p className="surface-note">Chỉ nhập thông tin minh họa. Tài khoản và xác minh email được mô phỏng; không dùng mật khẩu cá nhân. Phiên tài khoản giữ trong tab này tối đa 1 giờ.</p>
        <p className="surface-note">Bạn có thể cập nhật hồ sơ, tạo đơn COD dùng thử và xem đơn của mình sau đăng nhập. Yêu cầu khôi phục mật khẩu hiện chỉ mô phỏng, chưa gửi email thật.</p>
      </aside>
    </div>
  </div></div>
}
