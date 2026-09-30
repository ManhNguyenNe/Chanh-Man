import Icon from '../Icon'
import { formatMoney } from '../../utils/formatMoney'
import './Products.css'

export default function ProductCard({ product, onSelect, compact = false }) {
  const price = Math.min(...product.variants.map((variant) => variant.price))
  const inStock = product.variants.some((variant) => variant.stock > 0)
  return (
    <article className="product-card">
      <a
        className="product-image-button"
        aria-label={`Xem ${product.name}`}
        href={`/san-pham/${encodeURIComponent(product.id)}`}
      >
        <img src={product.image} alt={product.name} width="800" height="512" loading="lazy" />
      </a>
      <div className="product-content">
        {!compact && <p className="product-badge">
          {product.promotion ? 'Có khuyến mại · Minh họa' : product.badge}
        </p>}
        <p className="product-brand">{product.brand}</p>
        <h3>
          <a title={product.name} href={`/san-pham/${encodeURIComponent(product.id)}`}>{product.name}</a>
        </h3>
        <p className="product-specs" title={product.specs.join(' · ')}>{product.specs.join(' · ')}</p>
        <div className="product-bottom">
          <div>
            <p className="product-price">
              {product.variants.length > 1 && <span>Từ </span>}
              {formatMoney(price)}
            </p>
            {!compact && <p className="product-stock">{inStock ? 'Có sẵn trong danh mục' : 'Tạm hết hàng'}</p>}
          </div>
          <button
            className="product-open"
            aria-label={`Chọn cấu hình ${product.name}`}
            onClick={() => onSelect(product)}
          >
            <Icon name="arrow" />
          </button>
        </div>
      </div>
    </article>
  )
}
