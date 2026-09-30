import { useId, useState } from 'react'
import { Checkbox, Radio, Button } from 'antd'
import Icon from '../Icon'

function FilterGroup({ title, children }) {
  const [open, setOpen] = useState(true)
  const contentId = useId()
  return (
    <fieldset className="filter-group">
      <legend>
        <span className="filter-group-heading">
          <span>{title}</span>
          <Button
            type="text"
            className="filter-toggle"
            aria-label={(open ? 'Thu gọn ' : 'Mở rộng ') + title}
            aria-expanded={open}
            aria-controls={contentId}
            onClick={() => setOpen((value) => !value)}
            icon={<Icon name="chevron" />}
          />
        </span>
      </legend>
      <div id={contentId} hidden={!open}>{children}</div>
    </fieldset>
  )
}

export default function CatalogFilters({ catalog }) {
  const { facets, filters, change, reset } = catalog
  const [expanded, setExpanded] = useState(false)
  const brandListId = useId()
  const visibleBrands = facets.brands.filter((brand, index) =>
    expanded || index < 8 || filters.brands.includes(brand),
  )
  const hiddenCount = facets.brands.length - visibleBrands.length
  return (
    <div className="catalog-filters">
      <div className="filter-heading">
        <h2>Bộ lọc</h2>
        <Button type="link" onClick={reset}>
          Đặt lại
        </Button>
      </div>
      <FilterGroup title="Thương hiệu">
        <div className="brand-chips" id={brandListId}>
          {visibleBrands.map((brand) => {
            const selected = filters.brands.includes(brand)
            return (
              <Button
                key={brand}
                className="brand-chip"
                aria-pressed={selected}
                onClick={() => change({
                  brands: selected
                    ? filters.brands.filter((value) => value !== brand)
                    : [...filters.brands, brand],
                })}
              >
                {brand}
              </Button>
            )
          })}
        </div>
        {(hiddenCount > 0 || expanded) && (
          <Button
            type="text"
            className="brand-expand"
            aria-expanded={expanded}
            aria-controls={brandListId}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Thu gọn' : 'Xem thêm ' + hiddenCount}
          </Button>
        )}
      </FilterGroup>
      <FilterGroup title="Khoảng giá">
        <p className="filter-hint">Theo giá khởi điểm của sản phẩm.</p>
        <Radio.Group
          value={filters.priceRange}
          onChange={(e) => change({ priceRange: e.target.value })}
          options={[{ value: '', label: 'Tất cả mức giá' }, ...facets.priceRanges]}
        />
      </FilterGroup>
      <FilterGroup title="Màu sắc">
        <Checkbox.Group
          value={filters.colors}
          options={facets.colors}
          onChange={(colors) => change({ colors })}
        />
      </FilterGroup>
      <FilterGroup title="Ưu đãi & tình trạng">
        <Checkbox
          checked={filters.promotion}
          onChange={(e) => change({ promotion: e.target.checked })}
        >
          Có khuyến mại
        </Checkbox>
        <Checkbox checked={filters.inStock} onChange={(e) => change({ inStock: e.target.checked })}>
          Còn hàng
        </Checkbox>
      </FilterGroup>
    </div>
  )
}
