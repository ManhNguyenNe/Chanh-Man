import { Button } from 'antd'
import Icon from '../Icon'
import './HomeSections.css'

export function Hero({ onDiscover, onProduct }) {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="container hero-content">
        <p className="eyebrow">CÔNG NGHỆ TỐT. TRẢI NGHIỆM XỨNG ĐÁNG.</p>
        <h1 id="hero-title">
          Một lựa chọn tốt.
          <br />
          <span>Vạn điều có thể.</span>
        </h1>
        <p className="hero-description">Tìm thiết bị phù hợp. Mở ra những điều bạn muốn làm.</p>
        <div className="hero-actions">
          <Button type="primary" onClick={onDiscover}>
            Khám phá ngay <Icon name="arrow" />
          </Button>
          <button className="text-action" onClick={onProduct}>
            Gặp gỡ MacBook Air <Icon name="chevron" />
          </button>
        </div>
        <picture className="hero-image">
          <source media="(max-width: 640px)" srcSet="/images/hero-air-mobile.png" />
          <img
            src="/images/hero-air.png"
            width="980"
            height="469"
            alt="Hai chiếc MacBook Air màu xanh mỏng nhẹ, mở ở hai góc khác nhau"
            fetchPriority="high"
          />
        </picture>
        <div className="hero-caption">
          <span>MacBook Air</span>
          <span>Mỏng nhẹ. Rộng mở cảm hứng.</span>
        </div>
      </div>
    </section>
  )
}

export function Categories({ categories, onCategory }) {
  return (
    <section className="section category-section" id="danh-muc" aria-labelledby="category-title">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow section-kicker">BẮT ĐẦU TỪ ĐIỀU BẠN CẦN</p>
            <h2 id="category-title">Thế giới công nghệ của bạn.</h2>
          </div>
          <span className="section-index">01 / KHÁM PHÁ</span>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-card category-${category.id}`}
              onClick={() => onCategory(category.id)}
            >
              <div className="category-copy">
                <h3>{category.name}</h3>
                <p>{category.caption}</p>
              </div>
              <img src={category.image} alt="" width="800" height="512" loading="lazy" />
              <span className="category-bottom">
                <span>Khám phá {category.name.toLowerCase()}</span>
                <span className="circle-arrow">
                  <Icon name="arrow" />
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Needs({ needs, onNeed }) {
  return (
    <section className="section needs-section" id="nhu-cau" aria-labelledby="needs-title">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow section-kicker">MỖI NGÀY, MỘT ĐIỀU MUỐN LÀM</p>
            <h2 id="needs-title">Bạn muốn làm gì hôm nay?</h2>
            <p>Bắt đầu từ nhu cầu. Tìm thấy lựa chọn phù hợp.</p>
          </div>
        </div>
        <div className="needs-grid">
          {needs.map((need) => (
            <button key={need.id} className="need-item" onClick={() => onNeed(need.id)}>
              <span className="need-icon">
                <Icon name={need.icon} />
              </span>
              <h3>{need.name}</h3>
              <p>{need.description}</p>
              <span className="need-link">
                Khám phá <Icon name="chevron" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Collection({ onDiscover }) {
  return (
    <section className="collection-section" aria-labelledby="collection-title">
      <div className="container collection-inner">
        <div className="collection-copy">
          <p className="eyebrow">DÀNH CHO NHỮNG Ý TƯỞNG LỚN</p>
          <h2 id="collection-title">
            Sức mạnh để
            <br />
            đi xa hơn.
          </h2>
          <p>
            Từ dòng code đầu tiên đến khung hình cuối cùng.
            <br className="desktop-break" /> Khám phá thiết bị đồng hành cùng sức sáng tạo.
          </p>
          <Button type="primary" onClick={onDiscover}>
            Khám phá bộ sưu tập <Icon name="arrow" />
          </Button>
          <div className="collection-footnote">
            CHỌN BỞI CHANH&MAN <span>—</span> DÀNH CHO BẠN
          </div>
        </div>
        <div className="collection-photo">
          <img
            src="/images/collection-pro.jpg"
            width="1630"
            height="1694"
            alt="Thiết kế MacBook Pro màu đen với các cổng kết nối dành cho công việc sáng tạo"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}

const supportItems = [
  {
    id: 'advice',
    icon: 'support',
    title: 'Cùng bạn chọn đúng',
    copy: 'Hiểu cấu hình. Chọn theo nhu cầu.',
  },
  {
    id: 'warranty',
    icon: 'shield',
    title: 'Thông tin bảo hành',
    copy: 'Những điều cần biết về thiết bị.',
  },
  {
    id: 'delivery',
    icon: 'delivery',
    title: 'Giao nhận rõ ràng',
    copy: 'Tìm hiểu trước khi đặt hàng.',
  },
  {
    id: 'returns',
    icon: 'return',
    title: 'An tâm sau lựa chọn',
    copy: 'Hướng dẫn kiểm tra và đổi trả.',
  },
]
export function Support({ onInfo }) {
  return (
    <section className="section support-section" id="ho-tro" aria-labelledby="support-title">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow section-kicker">HƠN CẢ MỘT THIẾT BỊ</p>
            <h2 id="support-title">Một lựa chọn. Có người đồng hành.</h2>
          </div>
        </div>
        <div className="support-grid">
          {supportItems.map((item) => (
            <button className="support-item" key={item.id} onClick={() => onInfo(item.id)}>
              <Icon name={item.icon} />
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
              <span className="text-action">
                Tìm hiểu thêm <Icon name="chevron" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
