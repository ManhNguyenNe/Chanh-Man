import { App as AntdApp, ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import Home from './pages/Home'
import Category from './pages/Category'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import Checkout from './pages/Checkout'
import Order from './pages/Order'
import Orders from './pages/Orders'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { categoryFromPath } from './utils/categoryRoutes'
import { antdTheme } from './assets/theme'

export default function App() {
  const category = categoryFromPath(window.location.pathname)
  const productId = window.location.pathname.match(/^\/san-pham\/([^/]+)\/?$/)?.[1]
  const authMode = window.location.pathname.match(/^\/(login|register)\/?$/)?.[1]
  const orderId = window.location.pathname.match(/^\/account\/orders\/([^/]+)\/?$/)?.[1]
  return (
    <ConfigProvider theme={antdTheme} locale={viVN} wave={{ disabled: true }}>
      <AntdApp>{orderId ? <Order key={orderId} id={orderId} /> : /^\/account\/orders\/?$/.test(window.location.pathname) ? <Orders /> : /^\/checkout\/?$/.test(window.location.pathname) ? <Checkout /> : /^\/account\/?$/.test(window.location.pathname) ? <Profile /> : /^\/reset-password\/?$/.test(window.location.pathname) ? <ResetPassword /> : /^\/forgot-password\/?$/.test(window.location.pathname) ? <ForgotPassword /> : authMode ? <Auth mode={authMode} /> : /^\/cart\/?$/.test(window.location.pathname) ? <Cart /> : productId ? <Product key={productId} id={productId} /> : category ? <Category category={category} /> : <Home />}</AntdApp>
    </ConfigProvider>
  )
}
