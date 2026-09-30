import { useState } from 'react'
import { Button, Modal, Radio } from 'antd'
import Icon from '../Icon'
import { formatMoney } from '../../utils/formatMoney'

export default function ProductDialog({ product, onClose, onAdd }) {
  const [variantId, setVariantId] = useState(
    product.variants.find((variant) => variant.stock > 0)?.id || product.variants[0].id,
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const variant = product.variants.find((item) => item.id === variantId)
  async function add() {
    setBusy(true)
    setError('')
    try {
      await onAdd(variantId)
    } catch (issue) {
      setError(issue.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      title={product.name}
      width={800}
      centered
      className="product-dialog"
    >
      <div className="product-detail">
        <div className="detail-image">
          <img src={product.image} alt={product.name} width="800" height="512" />
        </div>
        <div className="detail-copy">
          <p className="product-badge">{product.badge}</p>
          <p>{product.description}</p>
          <a className="text-action" href={`/san-pham/${encodeURIComponent(product.id)}`}>Xem chi tiết sản phẩm ↗</a>
          <ul className="detail-specs">
            {product.specs.map((spec) => (
              <li key={spec}>{spec}</li>
            ))}
          </ul>
          <p className="variant-label" id="variant-label">
            Chọn phiên bản
          </p>
          <Radio.Group
            value={variantId}
            onChange={(event) => {
              setVariantId(event.target.value)
              setError('')
            }}
            aria-labelledby="variant-label"
          >
            {product.variants.map((item) => (
              <Radio key={item.id} value={item.id} disabled={!item.stock}>
                {item.label}
                {!item.stock && ' — Hết hàng'}
              </Radio>
            ))}
          </Radio.Group>
          <p className="detail-price">{formatMoney(variant.price)}</p>
          <p className="surface-note">
            Giá minh họa · {variant.stock > 0 ? `Còn ${variant.stock} sản phẩm` : 'Tạm hết hàng'}
          </p>
          {error && (
            <p className="form-feedback" role="alert">
              {error}
            </p>
          )}
          <Button type="primary" block loading={busy} disabled={!variant.stock} onClick={add}>
            <Icon name="bag" />
            Thêm vào giỏ
          </Button>
        </div>
      </div>
    </Modal>
  )
}
