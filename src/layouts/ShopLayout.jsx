import { lazy, Suspense, useState } from 'react'
import { Button, Modal } from 'antd'
import Header from '../components/header/Header'
import Footer from '../components/footer/Footer'
import useCart from '../hooks/useCart'
import useAuth from '../hooks/useAuth'
import { shopInfo } from '../assets/shopInfo'
import { categoryUrl } from '../utils/categoryRoutes'
const ProductDialog = lazy(() => import('../components/products/ProductDialog'))
const CartDrawer = lazy(() => import('../components/cart/CartDrawer'))
export default function ShopLayout({ children, query = '', onSearch }) {
  const cartState = useCart()
  const authState = useAuth()
  const { cart, addItem, updateQuantity, removeItem } = cartState
  const [selected, setSelected] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [info, setInfo] = useState(null)
  function showInfo(id) {
    if (id === 'account') {
      window.location.assign(authState.user ? '/account' : '/login?next=%2Faccount')
    } else setInfo(id)
  }
  async function add(variantId) {
    await addItem(variantId)
    setSelected(null)
    setCartOpen(true)
  }
  return (
    <>
      <Header
        onCategory={(id) => window.location.assign(categoryUrl(id))}
        onSearch={onSearch}
        query={query}
        onCart={() => setCartOpen(true)}
        onInfo={showInfo}
        user={authState.user}
        accountLoading={authState.loading}
        cartCount={cart.count}
      />
      <main id="main" tabIndex={-1}>
        {children({ onSelect: setSelected, onInfo: showInfo, onAdd: add, cartState, authState })}
      </main>
      <Footer onCategory={(id) => window.location.assign(categoryUrl(id))} onInfo={showInfo} />
      <Suspense
        fallback={
          <div role="status" className="overlay-loading">
            Đang mở…
          </div>
        }
      >
        {selected && (
          <ProductDialog
            key={selected.id}
            product={selected}
            onClose={() => setSelected(null)}
            onAdd={add}
          />
        )}
        {cartOpen && (
          <CartDrawer
            open
            onClose={() => setCartOpen(false)}
            cart={cart}
            onQuantity={updateQuantity}
            onRemove={removeItem}
          />
        )}
      </Suspense>
      <Modal
        title={info ? shopInfo[info].title : ''}
        open={Boolean(info)}
        onCancel={() => setInfo(null)}
        footer={<Button type="primary" onClick={() => setInfo(null)}>Đã hiểu</Button>}
      >
        <div className="info-dialog">
          {info && shopInfo[info].paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </Modal>
    </>
  )
}
