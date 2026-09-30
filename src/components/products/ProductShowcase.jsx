import { Button, Empty, Skeleton } from 'antd'
import Icon from '../Icon'
import ProductCard from './ProductCard'

export default function ProductShowcase({ catalog, onSelect }) {
  const { filters, categories, needs, items, total, loading, error, changeFilters, reload } =
    catalog
  const hasFilter = Boolean(filters.q || filters.need)
  const title = filters.q
    ? `Kết quả cho “${filters.q}”`
    : filters.need
      ? `Dành cho ${needs.find((need) => need.id === filters.need)?.name.toLowerCase() || 'bạn'}`
      : 'Lựa chọn đáng khám phá.'
  return (
    <section className="section products-section" id="san-pham" aria-labelledby="products-title">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow section-kicker">CHỌN LỌC BỞI CHANH&MAN</p>
            <h2 id="products-title">{title}</h2>
            <p>Thiết bị tốt, dành cho những điều bạn yêu thích.</p>
          </div>
          <button
            className="text-action view-all"
            onClick={() => changeFilters({ category: 'all', q: '', need: '', all: true }, false)}
          >
            Xem tất cả <Icon name="arrow" />
          </button>
        </div>
        <div className="product-toolbar">
          <div className="category-filters" role="group" aria-label="Lọc danh mục sản phẩm">
            {[{ id: 'all', name: 'Tất cả' }, ...categories].map((item) => (
              <button
                key={item.id}
                aria-pressed={filters.category === item.id}
                className={filters.category === item.id ? 'selected' : ''}
                onClick={() => changeFilters({ category: item.id, all: false }, false)}
              >
                {item.name}
              </button>
            ))}
          </div>
          <span className="result-count" aria-live="polite">
            {loading ? 'Đang tìm lựa chọn cho bạn…' : `${total} sản phẩm`}
          </span>
        </div>
        {hasFilter && (
          <div className="active-filter">
            <span>
              {filters.q
                ? `Tìm kiếm: ${filters.q}`
                : `Nhu cầu: ${needs.find((need) => need.id === filters.need)?.name}`}
            </span>
            <button
              className="text-action"
              onClick={() => changeFilters({ q: '', need: '', all: false }, false)}
            >
              Xóa bộ lọc <Icon name="close" />
            </button>
          </div>
        )}
        <div className="product-results" aria-busy={loading}>
          {error ? (
            <div className="catalog-empty" role="alert">
              <p>{error}</p>
              <Button onClick={reload}>Thử lại</Button>
            </div>
          ) : loading ? (
            <div className="product-grid">
              {Array.from({ length: 4 }, (_, index) => (
                <div className="product-skeleton" key={index}>
                  <Skeleton.Image active />
                  <Skeleton active paragraph={{ rows: 3 }} />
                </div>
              ))}
            </div>
          ) : items.length ? (
            <div className="product-grid">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} onSelect={onSelect} />
              ))}
            </div>
          ) : (
            <div className="catalog-empty">
              <Empty description="Chưa tìm thấy sản phẩm phù hợp." />
              <p>Thử một từ khóa khác hoặc khám phá toàn bộ danh mục.</p>
              <Button
                onClick={() =>
                  changeFilters({ category: 'all', q: '', need: '', all: true }, false)
                }
              >
                Xem các sản phẩm
              </Button>
            </div>
          )}
        </div>
        {!loading && !error && items.length > 0 && items.length < total && (
          <div className="load-more">
            <Button onClick={() => changeFilters({ all: true }, false)}>
              Xem thêm sản phẩm <Icon name="chevron" />
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
