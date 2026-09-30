import { App } from 'antd'
import ShopLayout from '../layouts/ShopLayout'
import { Hero, Categories, Needs, Collection, Support } from '../components/home/HomeSections'
import ProductShowcase from '../components/products/ProductShowcase'
import useCatalog from '../hooks/useCatalog'
import { getProduct } from '../services/productService'
import { categoryUrl } from '../utils/categoryRoutes'
export default function Home() {
  const catalog = useCatalog()
  const { message } = App.useApp()
  const category = (id) => window.location.assign(categoryUrl(id))
  const need = (id) => catalog.changeFilters({ category: 'all', q: '', need: id, all: true })
  return (
    <ShopLayout
      query={catalog.filters.q}
      onSearch={(q) => catalog.changeFilters({ q, category: 'all', need: '', all: true })}
    >
      {({ onSelect, onInfo }) => (
        <>
          <Hero
            onDiscover={() => category('all')}
            onProduct={async () => {
              try {
                onSelect(await getProduct('air-13'))
              } catch (error) {
                message.error(error.message)
              }
            }}
          />
          <Categories categories={catalog.categories} onCategory={category} />
          <ProductShowcase catalog={catalog} onSelect={onSelect} />
          <Needs needs={catalog.needs} onNeed={need} />
          <Collection onDiscover={() => need('creative')} />
          <Support onInfo={onInfo} />
        </>
      )}
    </ShopLayout>
  )
}
