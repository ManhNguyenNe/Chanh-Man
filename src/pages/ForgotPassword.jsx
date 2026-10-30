import { useEffect, useRef, useState } from 'react'
import { Breadcrumb, Button, Form, Input } from 'antd'
import ShopLayout from '../layouts/ShopLayout'
import { createDemoRecovery, demoPassword, requestPasswordReset } from '../services/authService.js'
import { authReturnPath } from '../utils/authRoutes.js'
import '../components/auth/Auth.css'

export default function ForgotPassword() {
  useEffect(() => { document.title = 'Quên mật khẩu | Chanh&Man' }, [])
  return <ShopLayout onSearch={(q) => window.location.assign(`/san-pham?q=${encodeURIComponent(q)}`)}>
    {() => <ForgotPasswordContent />}
  </ShopLayout>
}

function ForgotPasswordContent() {
  const [form] = Form.useForm()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const pending = useRef(false)
  const resultHeading = useRef(null)
  const next = authReturnPath(new URLSearchParams(window.location.search).get('next'))
  const loginUrl = `/login?next=${encodeURIComponent(next)}`
  useEffect(() => { if (result) resultHeading.current?.focus() }, [result])
  async function submit(values) {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setError('')
    try { setResult(await requestPasswordReset(values)) }
    catch (issue) {
      setError(issue.message)
      if (issue.fieldErrors) form.setFields(Object.entries(issue.fieldErrors).map(([name, message]) => ({ name, errors: [message] })))
    } finally { pending.current = false; setBusy(false) }
  }
  async function openDemoLink() {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setError('')
    try {
      const { token } = await createDemoRecovery()
      window.location.assign(`/reset-password?next=${encodeURIComponent(next)}#token=${encodeURIComponent(token)}`)
    } catch (issue) { setError(issue.message) }
    finally { pending.current = false; setBusy(false) }
  }
  return <div className="auth-page"><div className="container">
    <nav aria-label="Đường dẫn trang"><Breadcrumb separator=">" items={[
      { title: <a href="/">Trang chủ</a> }, { title: <a href={loginUrl}>Đăng nhập</a> },
      { title: <span aria-current="page">Quên mật khẩu</span> },
    ]} /></nav>
    <header className="auth-page-heading"><h1>Quên mật khẩu<span>.</span></h1><p>Bắt đầu khôi phục quyền truy cập tài khoản của bạn.</p></header>
    <div className="auth-layout">
      <section className="auth-panel" aria-label="Khôi phục mật khẩu">
        {result ? <div className="auth-result"><h2 ref={resultHeading} tabIndex={-1}>Yêu cầu dùng thử đã hoàn tất</h2>
          <p role="status">{result.message}</p>
          <p className="surface-note">Đây là mô phỏng. Chưa gửi email hoặc thay đổi mật khẩu của bạn.</p>
          {error && <p role="alert" className="form-feedback">{error}</p>}
          <Button type="primary" loading={busy} onClick={openDemoLink}>Mô phỏng mở liên kết khôi phục</Button>
          <Button href={loginUrl}>Về trang đăng nhập</Button>
          <Button disabled={busy} onClick={() => { setResult(null); setError('') }}>Gửi yêu cầu khác</Button>
        </div> : <>
          <Form form={form} layout="vertical" requiredMark={false} disabled={busy} onFinish={submit}
            onValuesChange={() => setError('')} scrollToFirstError={{ block: 'center', focus: true }}>
            <Form.Item name="email" label="Email đăng ký" extra="Nhập email đã dùng để tạo tài khoản." rules={[
              { required: true, whitespace: true, message: 'Vui lòng nhập email.' },
              { type: 'email', transform: (value) => value?.trim(), message: 'Email chưa đúng định dạng.' },
              { max: 254, transform: (value) => value?.trim(), message: 'Email tối đa 254 ký tự.' },
            ]}><Input autoComplete="email" inputMode="email" maxLength={254} /></Form.Item>
            {error && <p role="alert" className="form-feedback">{error}</p>}
            <Button type="primary" htmlType="submit" block loading={busy}>Gửi yêu cầu khôi phục</Button>
          </Form>
          <p className="auth-switch"><a className="text-action" href={loginUrl}>Về trang đăng nhập</a></p>
        </>}
      </section>
      <aside className="auth-panel auth-demo" aria-labelledby="recovery-help-title"><h2 id="recovery-help-title">Khôi phục tài khoản</h2>
        <p>Yêu cầu khôi phục luôn trả thông báo chung để bảo vệ thông tin tài khoản.</p>
        <p>Khi tính năng gửi email hoạt động, hãy kiểm tra cả Hộp thư đến và thư rác để tìm hướng dẫn.</p>
        <p className="surface-note">Bản dùng thử chưa gửi email hoặc đổi mật khẩu thật. Sau khi gửi, chọn Mô phỏng mở liên kết khôi phục để thử bước tiếp theo. Chỉ sử dụng thông tin minh họa; giỏ hàng vẫn được giữ.</p>
        <p className="surface-note">Tài khoản dùng thử vẫn đăng nhập bằng mật khẩu chung: <strong>{demoPassword}</strong>.</p>
      </aside>
    </div>
  </div></div>
}
