import { App as AntdApp, ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import Home from './pages/Home'
import Category from './pages/Category'
import Product from './pages/Product'
import Cart from './pages/Cart'
import { categoryFromPath } from './utils/categoryRoutes'
import { antdTheme } from './assets/theme'

export default function App() {
  const category = categoryFromPath(window.location.pathname)
  const productId = window.location.pathname.match(/^\/san-pham\/([^/]+)\/?$/)?.[1]
  return (
    <ConfigProvider theme={antdTheme} locale={viVN} wave={{ disabled: true }}>
      <AntdApp>{/^\/cart\/?$/.test(window.location.pathname) ? <Cart /> : productId ? <Product key={productId} id={productId} /> : category ? <Category category={category} /> : <Home />}</AntdApp>
    </ConfigProvider>
  )
}
