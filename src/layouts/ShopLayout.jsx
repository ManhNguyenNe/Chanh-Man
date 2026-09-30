import { lazy, Suspense, useState } from 'react'
import { Button, Modal } from 'antd'
import Header from '../components/header/Header'
import Footer from '../components/footer/Footer'
import useCart from '../hooks/useCart'
import { shopInfo } from '../assets/shopInfo'
import { categoryUrl } from '../utils/categoryRoutes'
const ProductDialog = lazy(() => import('../components/products/ProductDialog'))
const CartDrawer = lazy(() => import('../components/cart/CartDrawer'))
export default function ShopLayout({ children, query = '', onSearch }) {
  const { cart, addItem, updateQuantity, removeItem } = useCart()
  const [selected, setSelected] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [info, setInfo] = useState(null)
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
        onInfo={setInfo}
        cartCount={cart.count}
      />
      <main id="main" tabIndex={-1}>
        {children({ onSelect: setSelected, onInfo: setInfo, onAdd: add })}
      </main>
      <Footer onCategory={(id) => window.location.assign(categoryUrl(id))} onInfo={setInfo} />
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
        footer={
          <Button type="primary" onClick={() => setInfo(null)}>
            Đã hiểu
          </Button>
        }
      >
        <div className="info-dialog">
          {info && shopInfo[info].paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </Modal>
    </>
  )
}
