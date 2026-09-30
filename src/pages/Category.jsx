import { useEffect, useState } from 'react'
import { Breadcrumb, Button, Drawer, Empty, Select, Skeleton, Tag } from 'antd'
import ShopLayout from '../layouts/ShopLayout'
import ProductCard from '../components/products/ProductCard'
import CatalogFilters from '../components/catalog/CatalogFilters'
import useCategoryCatalog from '../hooks/useCategoryCatalog'
import { categoryRoutes } from '../utils/categoryRoutes'
import '../components/catalog/Catalog.css'
const names = { laptop: 'Laptop', phone: 'Điện thoại', pc: 'Linh kiện PC', all: 'Tất cả sản phẩm' }
export default function Category({ category }) {
  const catalog = useCategoryCatalog(category)
  const [filterOpen, setFilterOpen] = useState(false)
  const { filters, facets, change } = catalog
  const name = names[category]
  useEffect(() => {
    document.title = name + ' | Chanh&Man'
  }, [name])
  const chips = [
    ...filters.brands.map((value) => ({
      label: value,
      clear: () => change({ brands: filters.brands.filter((v) => v !== value) }),
    })),
    ...filters.colors.map((value) => ({
      label: value,
      clear: () => change({ colors: filters.colors.filter((v) => v !== value) }),
    })),
    ...(filters.priceRange
      ? [
          {
            label:
              facets?.priceRanges.find((p) => p.value === filters.priceRange)?.label ||
              filters.priceRange,
            clear: () => change({ priceRange: '' }),
          },
        ]
      : []),
    ...(filters.q ? [{ label: 'Tìm: ' + filters.q, clear: () => change({ q: '' }) }] : []),
    ...(filters.promotion
      ? [{ label: 'Có khuyến mại', clear: () => change({ promotion: false }) }]
      : []),
    ...(filters.inStock ? [{ label: 'Còn hàng', clear: () => change({ inStock: false }) }] : []),
  ]
  return (
    <ShopLayout query={filters.q} onSearch={(q) => change({ q })}>
      {({ onSelect }) => (
        <div className="category-page">
          <div className="container">
            <nav aria-label="Đường dẫn trang">
              <Breadcrumb
                separator=">"
                items={[
                  { title: <a href="/">Trang chủ</a> },
                  { title: <span aria-current="page">{name}</span> },
                ]}
              />
            </nav>
            <div className="category-intro">
              <div>
                <h1>
                  {name}
                  <span>.</span>
                </h1>
                <p>{facets?.category.caption || 'Tìm thiết bị phù hợp với bạn.'}</p>
              </div>
              <span className="category-editorial">
                Thiết bị tốt.
                <br />
                Khởi đầu cho nhiều điều hơn.
              </span>
            </div>
            <nav className="catalog-category-nav" aria-label="Chuyển danh mục">
              {Object.entries(names).map(([id, label]) => (
                <a
                  key={id}
                  href={categoryRoutes[id]}
                  aria-current={category === id ? 'page' : undefined}
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="catalog-layout">
              <aside className="catalog-sidebar" aria-label="Lọc sản phẩm">
                {facets ? <CatalogFilters catalog={catalog} /> : <Skeleton active />}
              </aside>
              <section
                className="catalog-results"
                aria-labelledby="category-results-title"
                aria-busy={catalog.loading}
              >
                <h2 id="category-results-title" className="sr-only">Danh sách sản phẩm</h2>
                <div className="catalog-toolbar">
                  <p role="status">
                    {catalog.loading ? (
                      'Đang tìm sản phẩm…'
                    ) : (
                      <>
                        <strong>{catalog.total}</strong> sản phẩm
                      </>
                    )}
                  </p>
                  <div className="catalog-sort">
                    <label htmlFor="catalog-sort">Sắp xếp</label>
                    <Select
                      id="catalog-sort"
                      value={filters.sort}
                      onChange={(sort) => change({ sort })}
                      options={[
                        { value: 'featured', label: 'Nổi bật' },
                        { value: 'price-asc', label: 'Giá thấp đến cao' },
                        { value: 'price-desc', label: 'Giá cao đến thấp' },
                        { value: 'name', label: 'Tên A–Z' },
                      ]}
                    />
                  </div>
                </div>
                <Button
                  className="mobile-filter-button"
                  onClick={() => setFilterOpen(true)}
                  disabled={!facets}
                >
                  Bộ lọc{chips.length ? ' (' + chips.length + ')' : ''}
                </Button>
                {chips.length > 0 && (
                  <div className="catalog-chips">
                    {chips.map((chip) => (
                      <Tag key={chip.label} closable onClose={chip.clear}>
                        {chip.label}
                      </Tag>
                    ))}
                    <button className="text-action" onClick={catalog.reset}>
                      Xóa tất cả
                    </button>
                  </div>
                )}
                {catalog.error && !catalog.loadingMore ? (
                  <div role="alert" className="catalog-empty">
                    <p>{catalog.error}</p>
                    <Button onClick={catalog.reload}>Thử lại</Button>
                  </div>
                ) : catalog.loading && !catalog.loadingMore ? (
                  <div className="catalog-grid">
                    {[1, 2, 3].map((id) => (
                      <div className="product-skeleton" key={id}>
                        <Skeleton active />
                      </div>
                    ))}
                  </div>
                ) : catalog.total ? (
                  <>
                    <div className="catalog-grid" id="catalog-products">
                      {catalog.items.map((product) => (
                        <ProductCard compact key={product.id} product={product} onSelect={onSelect} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="catalog-empty">
                    <Empty description="Chưa có sản phẩm phù hợp" />
                    <p>Thử bỏ bớt bộ lọc hoặc tìm với từ khóa khác.</p>
                    <Button onClick={catalog.reset}>Xóa bộ lọc</Button>
                  </div>
                )}
                <div className="catalog-footer">
                {/* <p className="catalog-demo-note">
                  Giá, tồn kho và khuyến mại là dữ liệu minh họa của dự án học tập.
                </p> */}
                {(!catalog.loading || catalog.loadingMore) && catalog.items.length > 0 && (
                  <div className="catalog-load-more">
                    {/* <p role="status">Đã hiển thị {catalog.items.length}/{catalog.total} sản phẩm</p> */}
                    {catalog.error && catalog.loadingMore && <p role="alert">{catalog.error}</p>}
                    {catalog.items.length < catalog.total && (
                      <Button
                        loading={catalog.loading}
                        aria-controls="catalog-products"
                        onClick={catalog.error ? catalog.reload : catalog.loadMore}
                      >
                        {catalog.error ? 'Thử lại' : 'Xem thêm'}
                      </Button>
                    )}
                  </div>
                )}
                </div>
              </section>
            </div>
          </div>
          <Drawer
            title="Lọc sản phẩm"
            placement="left"
            size="min(380px, 100vw)"
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
            footer={
              <Button type="primary" block onClick={() => setFilterOpen(false)}>
                Xem kết quả{!catalog.loading && ' (' + catalog.total + ')'}
              </Button>
            }
          >
            {facets && <CatalogFilters catalog={catalog} />}
          </Drawer>
        </div>
      )}
    </ShopLayout>
  )
}
