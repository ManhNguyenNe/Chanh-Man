import { useEffect, useRef, useState } from 'react'
import { Breadcrumb, Button, Form, Input, Skeleton } from 'antd'
import ShopLayout from '../layouts/ShopLayout'
import { demoPassword, getPasswordResetState, resetPassword } from '../services/authService.js'
import { authReturnPath } from '../utils/authRoutes.js'
import '../components/auth/Auth.css'

export default function ResetPassword() {
  useEffect(() => { document.title = 'Đặt mật khẩu mới | Chanh&Man' }, [])
  return <ShopLayout onSearch={(q) => window.location.assign(`/san-pham?q=${encodeURIComponent(q)}`)}>
    {() => <ResetPasswordContent />}
  </ShopLayout>
}

function ResetPasswordContent() {
  const [form] = Form.useForm()
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token'))
  const [state, setState] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const pending = useRef(false)
  const feedbackHeading = useRef(null)
  const next = authReturnPath(new URLSearchParams(window.location.search).get('next'))
  const loginUrl = `/login?next=${encodeURIComponent(next)}`
  const forgotUrl = `/forgot-password?next=${encodeURIComponent(next)}`
  const expiresAt = state?.expiresAt
  useEffect(() => {
    let active = true
    getPasswordResetState(token).then((data) => { if (active) setState(data) })
      .catch((issue) => { if (active) setState({ error: issue }) })
    return () => { active = false }
  }, [token, attempt])
  useEffect(() => {
    if (!expiresAt || done) return
    const timer = setTimeout(() => setAttempt((value) => value + 1), Math.max(0, expiresAt - Date.now()))
    return () => clearTimeout(timer)
  }, [expiresAt, done])
  useEffect(() => { if (done || state?.error) feedbackHeading.current?.focus() }, [done, state])
  async function submit(values) {
    if (pending.current || done) return
    pending.current = true
    setBusy(true)
    setError('')
    try { await resetPassword({ ...values, token }); form.resetFields(); setDone(true) }
    catch (issue) {
      if (issue.code?.includes('RECOVERY_LINK')) setState({ error: issue })
      else {
        setError(issue.message)
        if (issue.fieldErrors) form.setFields(Object.entries(issue.fieldErrors).map(([name, message]) => ({ name, errors: [message] })))
      }
    } finally { pending.current = false; setBusy(false) }
  }
  return <div className="auth-page"><div className="container">
    <nav aria-label="Đường dẫn trang"><Breadcrumb separator=">" items={[
      { title: <a href="/">Trang chủ</a> }, { title: <a href={forgotUrl}>Quên mật khẩu</a> },
      { title: <span aria-current="page">Đặt mật khẩu mới</span> },
    ]} /></nav>
    <header className="auth-page-heading"><h1>Đặt mật khẩu mới<span>.</span></h1><p>Hoàn tất bước khôi phục tài khoản của bạn.</p></header>
    <div className="auth-layout">
      <section className="auth-panel" aria-label="Đặt mật khẩu mới">
        {done ? <div className="auth-result"><h2 ref={feedbackHeading} tabIndex={-1}>Đã mô phỏng đặt mật khẩu mới</h2>
          <p role="status">Liên kết dùng thử đã được sử dụng. Mật khẩu vừa nhập không được lưu.</p>
          <p className="surface-note">Chưa thay đổi mật khẩu thật. Tài khoản dùng thử vẫn đăng nhập bằng {demoPassword}.</p>
          <Button type="primary" href={loginUrl}>Về trang đăng nhập</Button>
        </div> : !state ? <div role="status" aria-label="Đang kiểm tra liên kết"><Skeleton active /></div>
          : state.error ? <div className="auth-result" role="alert"><h2 ref={feedbackHeading} tabIndex={-1}>
            {state.error.code === 'RECOVERY_LINK_EXPIRED' ? 'Liên kết đã hết hạn' : state.error.code === 'RECOVERY_LINK_USED' ? 'Liên kết đã được sử dụng' : state.error.code === 'STORAGE_ERROR' ? 'Chưa kiểm tra được liên kết' : 'Liên kết không hợp lệ'}
          </h2><p>{state.error.message}</p>
            {state.error.code === 'STORAGE_ERROR' && <Button onClick={() => { setState(null); setAttempt((value) => value + 1) }}>Thử lại</Button>}
            <Button type="primary" href={forgotUrl}>Yêu cầu liên kết mới</Button><a className="text-action" href={loginUrl}>Về trang đăng nhập</a>
          </div> : <>
            <Form form={form} layout="vertical" requiredMark={false} disabled={busy} onFinish={submit} onValuesChange={() => setError('')}
              scrollToFirstError={{ block: 'center', focus: true }}>
              <Form.Item name="password" label="Mật khẩu mới" extra="Từ 8 đến 128 ký tự. Chỉ nhập mật khẩu minh họa." rules={[
                { required: true, whitespace: true, message: 'Vui lòng nhập mật khẩu mới.' },
                { min: 8, max: 128, message: 'Mật khẩu cần từ 8 đến 128 ký tự.' },
              ]}><Input.Password autoComplete="new-password" maxLength={128} /></Form.Item>
              <Form.Item name="confirmPassword" label="Nhập lại mật khẩu mới" dependencies={['password']} rules={[
                { required: true, message: 'Vui lòng nhập lại mật khẩu mới.' },
                ({ getFieldValue }) => ({ validator: (_, value) => !value || value === getFieldValue('password') ? Promise.resolve() : Promise.reject(new Error('Mật khẩu nhập lại chưa khớp.')) }),
              ]}><Input.Password autoComplete="new-password" maxLength={128} /></Form.Item>
              {error && <p className="form-feedback" role="alert">{error}</p>}
              <Button type="primary" htmlType="submit" block loading={busy}>Đặt mật khẩu mới</Button>
            </Form><p className="auth-switch"><a className="text-action" href={forgotUrl}>Yêu cầu liên kết mới</a></p>
          </>}
      </section>
      <aside className="auth-panel auth-demo" aria-labelledby="reset-help-title"><h2 id="reset-help-title">Liên kết khôi phục</h2>
        <p>Liên kết dùng thử có hiệu lực 10 phút, chỉ dùng một lần. Yêu cầu liên kết mới sẽ thay thế liên kết cũ.</p>
        <p>Mở liên kết trên cùng tab đã mô phỏng yêu cầu khôi phục.</p>
        <p className="surface-note">Đây là mô phỏng giao diện. Không lưu mật khẩu hoặc gửi email thật; phiên, hồ sơ và giỏ hàng vẫn được giữ.</p>
      </aside>
    </div>
  </div></div>
}
