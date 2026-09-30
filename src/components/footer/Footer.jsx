import './Footer.css'
export default function Footer({ onCategory, onInfo }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <a className="wordmark" href="/">
              Chanh<span>&</span>Man.
            </a>
            <p>Chọn đúng. Trải nghiệm hơn.</p>
            <p className="footer-intro">
              Công nghệ phù hợp.
              <br />
              Cho những điều quan trọng với bạn.
            </p>
          </div>
          <div className="footer-column">
            <h3>Khám phá</h3>
            <button onClick={() => onCategory('laptop')}>Laptop</button>
            <button onClick={() => onCategory('phone')}>Điện thoại</button>
            <button onClick={() => onCategory('pc')}>Linh kiện PC</button>
            <a href="/#nhu-cau">Chọn theo nhu cầu</a>
          </div>
          <div className="footer-column">
            <h3>Đồng hành cùng bạn</h3>
            <button onClick={() => onInfo('advice')}>Hướng dẫn chọn mua</button>
            <button onClick={() => onInfo('warranty')}>Thông tin bảo hành</button>
            <button onClick={() => onInfo('delivery')}>Giao nhận</button>
            <button onClick={() => onInfo('returns')}>Đổi trả</button>
          </div>
          <div className="footer-column">
            <h3>Về Chanh&Man</h3>
            <button onClick={() => onInfo('about')}>Câu chuyện của chúng tôi</button>
            <button onClick={() => onInfo('privacy')}>Quyền riêng tư</button>
            <button onClick={() => onInfo('account')}>Tài khoản của bạn</button>
            <a href="/#ho-tro">Hỗ trợ mua hàng</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Chanh&Man.</span>
          <span>Dự án học tập · Giá và sản phẩm minh họa · Chưa tiếp nhận đơn hàng</span>
          <span>Việt Nam</span>
        </div>
      </div>
    </footer>
  )
}
