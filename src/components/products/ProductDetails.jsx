import { useState } from 'react'
import { Button, Empty, Form, Input, Modal, Rate, Tabs } from 'antd'
import ProductCard from './ProductCard'
import { formatMoney } from '../../utils/formatMoney'
import './ProductDetails.css'

export default function ProductDetails({ product, related, onAdd, onInfo, onSelect }) {
  const [variantId, setVariantId] = useState(product.variants.find((item) => item.stock > 0)?.id || product.variants[0].id)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [buyOpen, setBuyOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviews, setReviews] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const [preview, setPreview] = useState(false)
  const [specsOpen, setSpecsOpen] = useState(false)
  const [form] = Form.useForm()
  const variant = product.variants.find((item) => item.id === variantId)
  const images = product.images?.length ? product.images : [product.image]
  const average = reviews.length ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length : 0
  async function add() {
    setBusy(true)
    setError('')
    try {
      await onAdd(variant.id)
      setBuyOpen(false)
    } catch (issue) {
      setError(issue.message)
    } finally {
      setBusy(false)
    }
  }
  const specs = <dl className="pdp-specs">
    <div><dt>Thương hiệu</dt><dd>{product.brand}</dd></div>
    <div><dt>Sản phẩm</dt><dd>{product.name}</dd></div>
    <div><dt>Phiên bản đang chọn</dt><dd>{variant.label}</dd></div>
    {product.specs.map((spec, index) => <div key={spec}><dt>Đặc điểm {index + 1}</dt><dd>{spec}</dd></div>)}
  </dl>
  return <>
    <div className="pdp-layout">
      <section className="pdp-panel pdp-gallery" aria-labelledby="product-title">
        <div className="pdp-media">
        <button className="pdp-main-image" onClick={() => setPreview(true)} aria-label={`Phóng to ảnh ${product.name}`}>
          <img src={images[imageIndex]} alt={product.name} width="800" height="512" fetchPriority="high" />
        </button>
        <div className="pdp-thumbnails" aria-label="Chọn ảnh">
          {images.map((src, index) => <button key={src} aria-label={`Ảnh ${index + 1}`} aria-pressed={imageIndex === index} onClick={() => setImageIndex(index)}><img src={src} alt="" width="64" height="48" /></button>)}
        </div>
        </div>
        <div className="pdp-configuration">
        <header className="pdp-heading">
          <p className="eyebrow">{product.brand} · {product.badge}</p>
          <h1 id="product-title">{product.name}</h1>
          <p className="surface-note pdp-sku">Mã phiên bản: {variant.id}</p>
          <div className="pdp-meta"><a href="#nhan-xet">{reviews.length ? `${average.toFixed(1)} / 5 · ${reviews.length} nhận xét dùng thử` : 'Chưa có đánh giá'}</a></div>
        </header>
          <h2 className="pdp-variant-title">Phiên bản</h2>
        <div className="pdp-variants" role="group" aria-label="Phiên bản sản phẩm">
          {product.variants.map((item) => <button key={item.id} aria-pressed={variantId === item.id} disabled={busy || !item.stock} onClick={() => { setVariantId(item.id); setError('') }}>
            <span>{item.label}<small>{item.stock ? `Còn ${item.stock} sản phẩm` : 'Tạm hết hàng'}</small></span><strong>{formatMoney(item.price)}</strong>
          </button>)}
        </div>
          <section className="pdp-spec-summary" aria-labelledby="spec-summary-title">
            <div className="pdp-section-title"><h2 id="spec-summary-title">Thông số kỹ thuật</h2><Button onClick={() => setSpecsOpen(true)}>Xem tất cả</Button></div>
            <ul>{product.specs.map((spec) => <li key={spec}>{spec}</li>)}</ul>
          </section>
        </div>
      <section className="pdp-policies" aria-labelledby="policies-title">
        <h2 id="policies-title">Chính sách sản phẩm</h2>
        <div className="pdp-policy-grid">
          {[['warranty', 'Bảo hành', 'Thông tin và điều kiện bảo hành'], ['delivery', 'Giao nhận', 'Phí và thời gian giao dự kiến'], ['returns', 'Kiểm tra & đổi trả', 'Những điều cần biết khi nhận máy'], ['advice', 'Tư vấn chọn mua', 'Tìm cấu hình phù hợp với bạn']].map(([id, title, text]) => <button key={id} onClick={() => onInfo(id)}><span aria-hidden="true">↗</span><span><strong>{title}</strong><small>{text}</small></span></button>)}
        </div>
      </section>
      </section>
      <aside className="pdp-panel pdp-purchase" aria-labelledby="purchase-title">
        <h2 id="purchase-title" className="sr-only">Thao tác mua sản phẩm</h2>
        <div className="pdp-total" aria-live="polite"><span>Giá phiên bản đã chọn</span><strong>{formatMoney(variant.price)}</strong><p>{variant.label}</p></div>
        {error && <p className="form-feedback" role="alert">{error}</p>}
        <div className="pdp-actions"><Button type="primary" block disabled={busy || !variant.stock} onClick={() => setBuyOpen(true)}>Đặt mua</Button><Button block loading={busy} disabled={!variant.stock} onClick={add}>Thêm vào giỏ hàng</Button></div>
        <p className="surface-note">{variant.stock ? `Còn ${variant.stock} sản phẩm` : 'Tạm hết hàng'}</p>
        <div className="pdp-purchase-section"><h3>Bảo hành & giao nhận</h3><button className="text-action" onClick={() => onInfo('warranty')}>Xem thông tin bảo hành ↗</button><button className="text-action" onClick={() => onInfo('delivery')}>Thông tin giao hàng ↗</button></div>
        <div className="pdp-purchase-note"><strong>Thông tin trước khi mua</strong><p>Giá và tồn kho minh họa. Chính sách, ưu đãi và phí giao hàng sẽ được cập nhật khi mở bán.</p></div>
        <p className="surface-note">Chưa tiếp nhận đơn hàng hoặc thanh toán thực tế.</p>
        <button className="text-action" onClick={() => onInfo('advice')}>Cần hỗ trợ chọn sản phẩm? ↗</button>
      </aside>
    </div>
    <section className="pdp-panel pdp-related" aria-labelledby="related-title"><div className="pdp-section-title"><div><h2 id="related-title">Sản phẩm thường được mua cùng</h2><p className="surface-note">Gợi ý minh họa từ danh mục Chanh&Man.</p></div><a className="text-action" href="/san-pham">Xem tất cả ↗</a></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} onSelect={onSelect} />)}</div></section>
    <div className="pdp-content">
      <section className="pdp-panel pdp-description" aria-label="Thông tin chi tiết sản phẩm">
        <Tabs items={[
          { key: 'description', label: 'Mô tả', children: <>
            <div className="pdp-story"><p className="eyebrow">{product.badge}</p><h2>{product.name}<br /><span>Theo cách của bạn.</span></h2><img src={product.image} alt={product.name} width="800" height="512" loading="lazy" /></div>
            <div className="pdp-description-copy"><h3>Khám phá {product.name}</h3><p>{product.description}</p>
              {expanded && <div id="expanded-description"><h3>Những điểm đáng chú ý</h3><ul>{product.specs.map((spec) => <li key={spec}>{spec}</li>)}</ul><p>Chọn phiên bản để xem giá và tình trạng hàng tương ứng. Tham khảo thông số và thông tin chính sách trước khi quyết định.</p></div>}
              <Button onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls="expanded-description">{expanded ? 'Thu gọn' : 'Xem thêm mô tả'}</Button>
            </div>
          </> },
          { key: 'specs', label: 'Thông số kỹ thuật', children: specs },
          { key: 'info', label: 'Thông tin sản phẩm', children: <div className="pdp-description-copy"><h2>Thông tin sản phẩm</h2><p>{product.description}</p><p>Mã sản phẩm: {product.id}. Thương hiệu: {product.brand}.</p><p>Cấu hình, giá và tồn kho trên trang là dữ liệu minh họa của Chanh&Man.</p></div> },
        ]} />
      </section>
      <section id="nhan-xet" className="pdp-panel pdp-reviews" aria-labelledby="reviews-title">
        <div className="pdp-section-title"><div><p className="eyebrow">Góc nhìn người dùng</p><h2 id="reviews-title">Nhận xét của khách hàng</h2></div><Button onClick={() => setReviewOpen(true)}>Viết nhận xét</Button></div>
        <div className="pdp-rating-summary"><div><strong>{reviews.length ? average.toFixed(1) : '—'}<small> / 5</small></strong><Rate disabled value={average} allowHalf /><p>{reviews.length} nhận xét dùng thử</p></div><div className="pdp-rating-bars">{[5, 4, 3, 2, 1].map((rating) => { const count = reviews.filter((item) => item.rating === rating).length; return <div key={rating}><span>{rating} ★</span><progress aria-label={`${rating} sao`} value={count} max={reviews.length || 1} /><span>{count}</span></div> })}</div></div>
        {reviews.length ? reviews.map((review, index) => <article className="pdp-review" key={index}><strong>{review.name}</strong><span className="surface-note"> · Nhận xét dùng thử</span><div><Rate disabled value={review.rating} /></div><p>{review.content}</p></article>) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có nhận xét. Hãy chia sẻ cảm nhận đầu tiên của bạn." />}
        <p className="surface-note">Nhận xét dùng thử chỉ hiển thị trong phiên này, chưa được gửi hoặc lưu lên hệ thống.</p>
      </section>
    </div>
    <Modal open={specsOpen} onCancel={() => setSpecsOpen(false)} footer={null} title="Thông số kỹ thuật" width={720}>{specs}</Modal>
    <Modal
      open={preview}
      onCancel={() => setPreview(false)}
      footer={null}
      title={product.name}
      width="min(960px, calc(100vw - 32px))"
      centered
      style={{ paddingBottom: 0 }}
      classNames={{ container: 'pdp-preview-container', header: 'pdp-preview-header', body: 'pdp-preview-body', title: 'pdp-preview-title', close: 'pdp-preview-close' }}
    >
      <img src={images[imageIndex]} alt={product.name} width="800" height="512" className="pdp-preview" />
    </Modal>
    <Modal open={buyOpen} onCancel={() => { if (!busy) setBuyOpen(false) }} title="Kiểm tra lựa chọn của bạn" footer={<Button type="primary" disabled={!variant.stock} loading={busy} onClick={add}>Lưu lựa chọn vào giỏ</Button>}><div className="pdp-order"><h3>{product.name}</h3><p>{variant.label}</p><strong>{formatMoney(variant.price)}</strong><p>Chanh&Man chưa tiếp nhận đơn hàng thực tế. Bạn có thể lưu lựa chọn vào giỏ để tiếp tục trải nghiệm.</p>{error && <p role="alert">{error}</p>}</div></Modal>
    <Modal open={reviewOpen} onCancel={() => setReviewOpen(false)} title="Viết nhận xét dùng thử" footer={null}>
      <Form form={form} layout="vertical" onFinish={(values) => { setReviews([...reviews, { ...values, name: values.name.trim(), content: values.content.trim() }]); setReviewOpen(false); form.resetFields() }}>
        <Form.Item name="name" label="Tên của bạn" rules={[{ required: true, whitespace: true, message: 'Vui lòng nhập tên.' }, { max: 60, message: 'Tên tối đa 60 ký tự.' }]}><Input maxLength={60} /></Form.Item>
        <Form.Item name="rating" label="Mức độ hài lòng" rules={[{ required: true, type: 'number', min: 1, max: 5, message: 'Vui lòng chọn từ 1 đến 5 sao.' }]}><Rate style={{ color: 'var(--primary)' }} /></Form.Item>
        <Form.Item name="content" label="Nhận xét của bạn" rules={[{ required: true, whitespace: true, message: 'Vui lòng nhập nhận xét.' }, { max: 1000, message: 'Nhận xét tối đa 1.000 ký tự.' }]}><Input.TextArea rows={4} maxLength={1000} showCount /></Form.Item>
        <p className="surface-note">Nội dung chỉ hiển thị trong phiên hiện tại.</p><Button type="primary" htmlType="submit">Đăng nhận xét dùng thử</Button>
      </Form>
    </Modal>
  </>
}

