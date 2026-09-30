import { useEffect, useState } from 'react'
import { Breadcrumb, Button, Skeleton } from 'antd'
import ShopLayout from '../layouts/ShopLayout'
import ProductDetails from '../components/products/ProductDetails'
import { getProduct, listProducts } from '../services/productService'
import { categoryUrl } from '../utils/categoryRoutes'

export default function Product({ id }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    getProduct(id).then(async (product) => {
      const related = await listProducts({ limit: 24 })
      if (active) {
        setData({ product, related: related.items.filter((item) => item.id !== id).slice(0, 4) })
        document.title = `${product.name} | Chanh&Man`
      }
    }).catch((issue) => { if (active) setError(issue.message) })
    return () => { active = false }
  }, [id, attempt])
  return (
    <ShopLayout onSearch={(q) => window.location.assign(`${categoryUrl('all')}?q=${encodeURIComponent(q)}`)}>
      {({ onAdd, onInfo, onSelect }) => (
        <div className="pdp-page">
          <div className="container">
            <nav aria-label="Đường dẫn trang">
              <Breadcrumb separator=">" items={[
                { title: <a href="/">Trang chủ</a> },
                { title: <a href={categoryUrl(data?.product.category || 'all')}>{({ phone: 'Điện thoại', laptop: 'Laptop', pc: 'Linh kiện PC' })[data?.product.category] || 'Sản phẩm'}</a> },
                { title: <span aria-current="page">{data?.product.name || 'Chi tiết sản phẩm'}</span> },
              ]} />
            </nav>
            {error ? <div className="catalog-empty" role="alert"><h1>Chưa thể mở sản phẩm</h1><p>{error}</p><Button onClick={() => { setError(''); setAttempt(attempt + 1) }}>Thử lại</Button><a href="/san-pham">Về danh mục sản phẩm</a></div>
              : data ? <ProductDetails {...data} onAdd={onAdd} onInfo={onInfo} onSelect={onSelect} />
                : <div className="pdp-panel" role="status" aria-label="Đang tải sản phẩm"><Skeleton active /><Skeleton active /></div>}
          </div>
        </div>
      )}
    </ShopLayout>
  )
}
