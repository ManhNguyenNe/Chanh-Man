import { useState } from 'react'
import { Drawer, Input } from 'antd'
import Icon from '../Icon'
import './Header.css'

export default function Header({ onCategory, onSearch, onCart, onInfo, cartCount, query, user, accountLoading }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const ordersHref = user ? '/account/orders' : '/login?next=%2Faccount%2Forders'
  const links = [
    { id: 'laptop', name: 'Laptop' },
    { id: 'phone', name: 'Điện thoại' },
    { id: 'pc', name: 'Linh kiện PC' },
  ]
  function choose(id) {
    setMenuOpen(false)
    onCategory(id)
  }
  return (
    <header className="site-header">
      <a className="skip-link" href="#main">
        Bỏ qua đến nội dung chính
      </a>
      <div className="top-nav">
        <div className="container top-nav-inner">
          <button
            className="nav-icon mobile-menu"
            aria-label="Mở danh mục"
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" />
          </button>
          <a className="wordmark" href="/" aria-label="Chanh&Man — Trang chủ">
            Chanh<span>&</span>Man<span className="brand-dot">.</span>
          </a>
          <nav className="desktop-links" aria-label="Điều hướng chính">
            {links.map((link) => (
              <button key={link.id} onClick={() => choose(link.id)}>
                {link.name}
              </button>
            ))}
            <a href="/#nhu-cau">Theo nhu cầu</a>
            <a href="/#ho-tro">Hỗ trợ</a>
          </nav>
          <div className="nav-actions">
            <a className="nav-orders" href={ordersHref}>Đơn hàng</a>
            <button
              className="nav-icon account-button"
              aria-label={user ? `Tài khoản của ${user.displayName}` : 'Tài khoản'}
              disabled={accountLoading}
              onClick={() => onInfo('account')}
            >
              <Icon name="user" />
            </button>
            <button
              className="nav-icon"
              aria-label={`Giỏ hàng, ${cartCount} sản phẩm`}
              onClick={onCart}
            >
              <Icon name="bag" />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>
      <div className="shop-nav">
        <div className="container shop-nav-inner">
          <a className="shop-title" href="/">
            Cửa hàng<span>Chọn đúng. Trải nghiệm hơn.</span>
          </a>
          <form
            className="header-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault()
              onSearch(new FormData(event.currentTarget).get('search').toString().trim())
            }}
          >
            <Input
              key={query}
              name="search"
              defaultValue={query}
              aria-label="Tìm sản phẩm"
              placeholder="Bạn đang tìm điều gì?"
              prefix={<Icon name="search" />}
              suffix={
                <button type="submit" className="search-submit" aria-label="Tìm kiếm">
                  <Icon name="arrow" />
                </button>
              }
            />
          </form>
          <a className="nav-advice" href="/#ho-tro">
            <Icon name="support" />
            <span>Cùng bạn chọn đúng</span>
          </a>
        </div>
      </div>
      <Drawer
        title="Khám phá Chanh&Man"
        placement="left"
        size="min(360px, 100vw)"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      >
        <nav className="mobile-links" aria-label="Danh mục trên điện thoại">
          {links.map((link) => (
            <button key={link.id} onClick={() => choose(link.id)}>
              {link.name}
              <Icon name="chevron" />
            </button>
          ))}
          <a href="/#nhu-cau" onClick={() => setMenuOpen(false)}>
            Chọn theo nhu cầu
            <Icon name="chevron" />
          </a>
          <a href="/#ho-tro" onClick={() => setMenuOpen(false)}>
            Dịch vụ và hỗ trợ
            <Icon name="chevron" />
          </a>
          <button
            onClick={() => {
              setMenuOpen(false)
              onInfo('account')
            }}
          >
            Tài khoản
            <Icon name="user" />
          </button>
          <a href={ordersHref} onClick={() => setMenuOpen(false)}>
            Đơn hàng của tôi
            <Icon name="chevron" />
          </a>
        </nav>
      </Drawer>
    </header>
  )
}
