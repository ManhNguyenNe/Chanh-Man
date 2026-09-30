// Sample prices and stock for the learning project, not live retail offers.
export const products = [
  {
    id: 'air-13',
    colors: ['Xanh'],
    promotion: true,
    name: 'MacBook Air 13 inch',
    brand: 'Apple',
    category: 'laptop',
    image: '/images/macbook-air.jpg',
    badge: 'Mỏng nhẹ mỗi ngày',
    specs: ['Apple silicon', '16GB RAM', '256GB SSD'],
    needs: ['study', 'work'],
    description:
      'Gọn nhẹ để mang theo. Không gian làm việc rộng mở để học tập, xử lý công việc và bắt đầu những ý tưởng mới.',
    variants: [
      { id: 'air-13-256', label: '16GB / 256GB · Xanh', price: 24990000, stock: 8 },
      { id: 'air-13-512', label: '16GB / 512GB · Xanh', price: 29990000, stock: 4 },
    ],
  },
  {
    id: 'iphone-pro',
    colors: ['Cam'],
    promotion: false,
    name: 'iPhone 17 Pro',
    brand: 'Apple',
    category: 'phone',
    image: '/images/iphone-pro.jpg',
    images: ['/images/iphone-pro.jpg', '/images/iphone-pro-transparent.png'],
    badge: 'Dành cho sáng tạo',
    specs: ['256GB', 'Camera Pro', 'Màu cam'],
    needs: ['creative', 'work'],
    description:
      'Ghi lại góc nhìn của bạn. Trải nghiệm điện thoại với hệ thống camera linh hoạt và không gian lưu trữ cho những điều đáng nhớ.',
    variants: [
      { id: 'iphone-pro-256', label: '256GB · Cam', price: 32990000, stock: 6 },
      { id: 'iphone-pro-512', label: '512GB · Cam', price: 38990000, stock: 0 },
    ],
  },
  {
    id: 'pro-14',
    colors: ['Đen'],
    promotion: false,
    name: 'MacBook Pro 14 inch',
    brand: 'Apple',
    category: 'laptop',
    image: '/images/macbook-pro.jpg',
    badge: 'Hiệu năng chuyên nghiệp',
    specs: ['Apple silicon', '24GB RAM', '512GB SSD'],
    needs: ['creative', 'work'],
    description:
      'Không gian cho những dự án lớn. Một lựa chọn cho lập trình, thiết kế và quy trình sáng tạo cần hiệu năng bền bỉ.',
    variants: [
      { id: 'pro-14-512', label: '24GB / 512GB · Đen', price: 42990000, stock: 3 },
      { id: 'pro-14-1tb', label: '24GB / 1TB · Đen', price: 47990000, stock: 2 },
    ],
  },
  {
    id: 'rtx-5090',
    colors: ['Đen'],
    promotion: false,
    name: 'GeForce RTX 5090',
    brand: 'NVIDIA',
    category: 'pc',
    image: '/images/gpu.jpg',
    badge: 'Nâng tầm bộ máy',
    specs: ['32GB GDDR7', 'PCIe', 'Card đồ họa'],
    needs: ['game', 'creative', 'upgrade'],
    description:
      'Mảnh ghép hiệu năng cho bộ máy của bạn. Hãy kiểm tra nguồn điện, kích thước case và khả năng tương thích trước khi chọn nâng cấp.',
    variants: [{ id: 'rtx-5090-32', label: '32GB · Founders Edition', price: 62990000, stock: 2 }],
  },
  {
    id: 'iphone-17',
    colors: ['Tím', 'Trắng'],
    promotion: true,
    name: 'iPhone 17',
    brand: 'Apple',
    category: 'phone',
    image: '/images/iphone.jpg',
    images: ['/images/iphone.jpg', '/images/iphone-transparent.png'],
    badge: 'Màu sắc của riêng bạn',
    specs: ['256GB', 'Màn hình OLED', 'Nhiều màu sắc'],
    needs: ['study', 'work'],
    description:
      'Những điều thường ngày, theo cách mới. Một thiết bị gọn gàng để kết nối, giải trí và lưu giữ khoảnh khắc.',
    variants: [
      { id: 'iphone-17-lavender', label: '256GB · Tím', price: 24990000, stock: 9 },
      { id: 'iphone-17-white', label: '256GB · Trắng', price: 24990000, stock: 5 },
    ],
  },
  {
    id: 'air-15',
    colors: ['Vàng'],
    promotion: false,
    name: 'MacBook Air 15 inch',
    brand: 'Apple',
    category: 'laptop',
    image: '/images/macbook-air.jpg',
    badge: 'Thêm không gian cảm hứng',
    specs: ['Apple silicon', '16GB RAM', '512GB SSD'],
    needs: ['study', 'work', 'creative'],
    description:
      'Màn hình rộng hơn cho tài liệu, bài giảng và những trang ý tưởng. Vẫn giữ sự gọn nhẹ cho một ngày năng động.',
    variants: [{ id: 'air-15-512', label: '16GB / 512GB · Vàng', price: 34990000, stock: 4 }],
  },

  {
    "id": "asus-vivobook",
    "name": "ASUS Vivobook 15",
    "brand": "ASUS",
    "category": "laptop",
    "image": "/images/product-pending.svg",
    "colors": [
      "Bạc"
    ],
    "promotion": true,
    "badge": "Lựa chọn tham khảo",
    "specs": [
      "Core i5",
      "16GB RAM",
      "512GB SSD"
    ],
    "needs": [
      "study",
      "work"
    ],
    "description": "ASUS Vivobook 15: sản phẩm mẫu để thử tìm kiếm, bộ lọc và giỏ hàng. Cấu hình, giá và tồn kho dưới đây là dữ liệu giả lập, không phải thông tin chào bán.",
    "variants": [
      {
        "id": "asus-vivobook-standard",
        "label": "Core i5 / 16GB RAM · Bạc",
        "price": 15990000,
        "stock": 3
      },
      {
        "id": "asus-vivobook-extended",
        "label": "Core i5 / 16GB RAM · Bạc · Bảo hành mở rộng (mẫu)",
        "price": 16490000,
        "stock": 0
      }
    ]
  },
  {
    "id": "lenovo-ideapad",
    "name": "Lenovo IdeaPad Slim 5",
    "brand": "Lenovo",
    "category": "laptop",
    "image": "/images/product-pending.svg",
    "colors": [
      "Xám"
    ],
    "promotion": false,
    "badge": "Lựa chọn tham khảo",
    "specs": [
      "Ryzen 5",
      "16GB RAM",
      "512GB SSD"
    ],
    "needs": [
      "study",
      "work"
    ],
    "description": "Lenovo IdeaPad Slim 5: sản phẩm mẫu để thử tìm kiếm, bộ lọc và giỏ hàng. Cấu hình, giá và tồn kho dưới đây là dữ liệu giả lập, không phải thông tin chào bán.",
    "variants": [
      {
        "id": "lenovo-ideapad-standard",
        "label": "Ryzen 5 / 16GB RAM · Xám",
        "price": 19990000,
        "stock": 4
      },
      {
        "id": "lenovo-ideapad-extended",
        "label": "Ryzen 5 / 16GB RAM · Xám · Bảo hành mở rộng (mẫu)",
        "price": 20490000,
        "stock": 3
      }
    ]
  },
  {
    "id": "dell-inspiron",
    "name": "Dell Inspiron 14",
    "brand": "Dell",
    "category": "laptop",
    "image": "/images/product-pending.svg",
    "colors": [
      "Bạc"
    ],
    "promotion": false,
    "badge": "Lựa chọn tham khảo",
    "specs": [
      "Core i7",
      "16GB RAM",
      "512GB SSD"
    ],
    "needs": [
      "work"
    ],
    "description": "Dell Inspiron 14: sản phẩm mẫu để thử tìm kiếm, bộ lọc và giỏ hàng. Cấu hình, giá và tồn kho dưới đây là dữ liệu giả lập, không phải thông tin chào bán.",
    "variants": [
      {
        "id": "dell-inspiron-standard",
        "label": "Core i7 / 16GB RAM · Bạc",
        "price": 22990000,
        "stock": 5
      },
      {
        "id": "dell-inspiron-extended",
        "label": "Core i7 / 16GB RAM · Bạc · Bảo hành mở rộng (mẫu)",
        "price": 23490000,
        "stock": 4
      }
    ]
  },
  {
    "id": "hp-pavilion",
    "name": "HP Pavilion 14",
    "brand": "HP",
    "category": "laptop",
    "image": "/images/product-pending.svg",
    "colors": [
      "Trắng"
    ],
    "promotion": true,
    "badge": "Lựa chọn tham khảo",
    "specs": [
      "Core i5",
      "16GB RAM",
      "512GB SSD"
    ],
    "needs": [
      "study",
      "work"
    ],
    "description": "HP Pavilion 14: sản phẩm mẫu để thử tìm kiếm, bộ lọc và giỏ hàng. Cấu hình, giá và tồn kho dưới đây là dữ liệu giả lập, không phải thông tin chào bán.",
    "variants": [
      {
        "id": "hp-pavilion-standard",
        "label": "Core i5 / 16GB RAM · Trắng",
        "price": 17990000,
        "stock": 6
      },
      {
        "id": "hp-pavilion-extended",
        "label": "Core i5 / 16GB RAM · Trắng · Bảo hành mở rộng (mẫu)",
        "price": 18490000,
        "stock": 5
      }
    ]
  },
  {
    "id": "asus-rog",
    "name": "ASUS ROG Zephyrus G14",
    "brand": "ASUS",
    "category": "laptop",
    "image": "/images/product-pending.svg",
    "colors": [
      "Đen"
    ],
    "promotion": false,
    "badge": "Lựa chọn tham khảo",
    "specs": [
      "Ryzen 9",
      "32GB RAM",
      "1TB SSD"
    ],
    "needs": [
      "game",
      "creative"
    ],
    "description": "ASUS ROG Zephyrus G14: sản phẩm mẫu để thử tìm kiếm, bộ lọc và giỏ hàng. Cấu hình, giá và tồn kho dưới đây là dữ liệu giả lập, không phải thông tin chào bán.",
    "variants": [
      {
        "id": "asus-rog-standard",
        "label": "Ryzen 9 / 32GB RAM · Đen",
        "price": 45990000,
        "stock": 0
      },
      {
        "id": "asus-rog-extended",
        "label": "Ryzen 9 / 32GB RAM · Đen · Bảo hành mở rộng (mẫu)",
        "price": 46490000,
        "stock": 0
      }
    ]
  },
  {
    "id": "samsung-s24",
    "name": "Samsung Galaxy S24",
    "brand": "Samsung",
    "category": "phone",
    "image": "/images/product-pending.svg",
    "colors": [
      "Tím"
    ],
    "promotion": false,
    "badge": "Lựa chọn tham khảo",
    "specs": [
      "8GB RAM",
      "256GB",
      "Màn hình AMOLED"
    ],
    "needs": [
      "work",
      "creative"
    ],
    "description": "Samsung Galaxy S24: sản phẩm mẫu để thử tìm kiếm, bộ lọc và giỏ hàng. Cấu hình, giá và tồn kho dưới đây là dữ liệu giả lập, không phải thông tin chào bán.",
    "variants": [
      {
        "id": "samsung-s24-standard",
        "label": "8GB RAM / 256GB · Tím",
        "price": 18990000,
        "stock": 8
      },
      {
        "id": "samsung-s24-extended",
        "label": "8GB RAM / 256GB · Tím · Bảo hành mở rộng (mẫu)",
        "price": 19490000,
        "stock": 2
      }
    ]
  },
  {
    "id": "samsung-a55",
    "name": "Samsung Galaxy A55",
    "brand": "Samsung",
    "category": "phone",
    "image": "/images/product-pending.svg",
    "colors": [
      "Xanh"
    ],
    "promotion": true,
    "badge": "Lựa chọn tham khảo",
    "specs": [
      "8GB RAM",
      "128GB",
      "Pin 5000mAh"
    ],
    "needs": [
      "study",
      "work"
    ],
    "description": "Samsung Galaxy A55: sản phẩm mẫu để thử tìm kiếm, bộ lọc và giỏ hàng. Cấu hình, giá và tồn kho dưới đây là dữ liệu giả lập, không phải thông tin chào bán.",
    "variants": [
      {
        "id": "samsung-a55-standard",
        "label": "8GB RAM / 128GB · Xanh",
        "price": 8990000,
        "stock": 9
      },
      {
        "id": "samsung-a55-extended",
        "label": "8GB RAM / 128GB · Xanh · Bảo hành mở rộng (mẫu)",
        "price": 9490000,
        "stock": 3
      }
    ]
  },
  {
    "id": "xiaomi-14",
    "name": "Xiaomi 14",
    "brand": "Xiaomi",
    "category": "phone",
    "image": "/images/product-pending.svg",
    "colors": [
      "Đen"
    ],
    "promotion": false,
    "badge": "Lựa chọn tham khảo",
    "specs": [
      "12GB RAM",
      "256GB",
      "Camera 50MP"
    ],
    "needs": [
      "creative",
      "game"
    ],
    "description": "Xiaomi 14: sản phẩm mẫu để thử tìm kiếm, bộ lọc và giỏ hàng. Cấu hình, giá và tồn kho dưới đây là dữ liệu giả lập, không phải thông tin chào bán.",
    "variants": [
      {
        "id": "xiaomi-14-standard",
        "label": "12GB RAM / 256GB · Đen",
        "price": 16990000,
        "stock": 10
      },
      {
        "id": "xiaomi-14-extended",
        "label": "12GB RAM / 256GB · Đen · Bảo hành mở rộng (mẫu)",
        "price": 17490000,
        "stock": 4
      }
    ]
  },
  {
    "id": "redmi-note",
    "name": "Xiaomi Redmi Note 13",
    "brand": "Xiaomi",
    "category": "phone",
    "image": "/images/product-pending.svg",
    "colors": [
      "Xanh"
    ],
    "promotion": false,
    "badge": "Lựa chọn tham khảo",
    "specs": [
      "8GB RAM",
      "128GB",
      "Màn hình AMOLED"
    ],
    "needs": [
      "study"
    ],
    "description": "Xiaomi Redmi Note 13: sản phẩm mẫu để thử tìm kiếm, bộ lọc và giỏ hàng. Cấu hình, giá và tồn kho dưới đây là dữ liệu giả lập, không phải thông tin chào bán.",
    "variants": [
      {
        "id": "redmi-note-standard",
        "label": "8GB RAM / 128GB · Xanh",
        "price": 4990000,
        "stock": 11
      },
      {
        "id": "redmi-note-extended",
        "label": "8GB RAM / 128GB · Xanh · Bảo hành mở rộng (mẫu)",
        "price": 5490000,
        "stock": 0
      }
    ]
  },
  {
    "id": "oppo-reno",
    "name": "OPPO Reno11",
    "brand": "OPPO",
    "category": "phone",
    "image": "/images/product-pending.svg",
    "colors": [
      "Trắng"
    ],
    "promotion": true,
    "badge": "Lựa chọn tham khảo",
    "specs": [
      "8GB RAM",
      "256GB",
      "Sạc nhanh"
    ],
    "needs": [
      "creative",
      "work"
    ],
    "description": "OPPO Reno11: sản phẩm mẫu để thử tìm kiếm, bộ lọc và giỏ hàng. Cấu hình, giá và tồn kho dưới đây là dữ liệu giả lập, không phải thông tin chào bán.",
    "variants": [
      {
        "id": "oppo-reno-standard",
        "label": "8GB RAM / 256GB · Trắng",
        "price": 10990000,
        "stock": 0
      },
      {
        "id": "oppo-reno-extended",
        "label": "8GB RAM / 256GB · Trắng · Bảo hành mở rộng (mẫu)",
        "price": 11490000,
        "stock": 0
      }
    ]
  },
  {
    "id": "vivo-v30",
    "name": "vivo V30",
    "brand": "vivo",
    "category": "phone",
    "image": "/images/product-pending.svg",
    "colors": [
      "Xanh"
    ],
    "promotion": false,
    "badge": "Lựa chọn tham khảo",
    "specs": [
      "12GB RAM",
      "256GB",
      "Camera chân dung"
    ],
    "needs": [
      "creative",
      "study"
    ],
    "description": "vivo V30: sản phẩm mẫu để thử tìm kiếm, bộ lọc và giỏ hàng. Cấu hình, giá và tồn kho dưới đây là dữ liệu giả lập, không phải thông tin chào bán.",
    "variants": [
      {
        "id": "vivo-v30-standard",
        "label": "12GB RAM / 256GB · Xanh",
        "price": 11990000,
        "stock": 4
      },
      {
        "id": "vivo-v30-extended",
        "label": "12GB RAM / 256GB · Xanh · Bảo hành mở rộng (mẫu)",
        "price": 12490000,
        "stock": 2
      }
    ]
  },
  {
    "id": "amd-ryzen",
    "name": "AMD Ryzen 7 7700",
    "brand": "AMD",
    "category": "pc",
    "image": "/images/product-pending.svg",
    "colors": [
      "Bạc"
    ],
    "promotion": false,
    "badge": "Lựa chọn tham khảo",
    "specs": [
      "8 nhân / 16 luồng",
      "Socket AM5",
      "CPU"
    ],
    "needs": [
      "game",
      "work",
      "upgrade"
    ],
    "description": "AMD Ryzen 7 7700: sản phẩm mẫu để thử tìm kiếm, bộ lọc và giỏ hàng. Cấu hình, giá và tồn kho dưới đây là dữ liệu giả lập, không phải thông tin chào bán.",
    "variants": [
      {
        "id": "amd-ryzen-standard",
        "label": "8 nhân / 16 luồng / Socket AM5 · Bạc",
        "price": 7490000,
        "stock": 5
      },
      {
        "id": "amd-ryzen-extended",
        "label": "8 nhân / 16 luồng / Socket AM5 · Bạc · Bảo hành mở rộng (mẫu)",
        "price": 7990000,
        "stock": 3
      }
    ]
  },
  {
    "id": "intel-i5",
    "name": "Intel Core i5-14400",
    "brand": "Intel",
    "category": "pc",
    "image": "/images/product-pending.svg",
    "colors": [
      "Bạc"
    ],
    "promotion": true,
    "badge": "Lựa chọn tham khảo",
    "specs": [
      "10 nhân",
      "Socket LGA1700",
      "CPU"
    ],
    "needs": [
      "work",
      "upgrade"
    ],
    "description": "Intel Core i5-14400: sản phẩm mẫu để thử tìm kiếm, bộ lọc và giỏ hàng. Cấu hình, giá và tồn kho dưới đây là dữ liệu giả lập, không phải thông tin chào bán.",
    "variants": [
      {
        "id": "intel-i5-standard",
        "label": "10 nhân / Socket LGA1700 · Bạc",
        "price": 5990000,
        "stock": 6
      },
      {
        "id": "intel-i5-extended",
        "label": "10 nhân / Socket LGA1700 · Bạc · Bảo hành mở rộng (mẫu)",
        "price": 6490000,
        "stock": 0
      }
    ]
  },
  {
    "id": "corsair-ram",
    "name": "Corsair Vengeance DDR5",
    "brand": "Corsair",
    "category": "pc",
    "image": "/images/product-pending.svg",
    "colors": [
      "Đen"
    ],
    "promotion": false,
    "badge": "Lựa chọn tham khảo",
    "specs": [
      "32GB (2 × 16GB)",
      "DDR5 6000",
      "RAM"
    ],
    "needs": [
      "game",
      "creative",
      "upgrade"
    ],
    "description": "Corsair Vengeance DDR5: sản phẩm mẫu để thử tìm kiếm, bộ lọc và giỏ hàng. Cấu hình, giá và tồn kho dưới đây là dữ liệu giả lập, không phải thông tin chào bán.",
    "variants": [
      {
        "id": "corsair-ram-standard",
        "label": "32GB (2 × 16GB) / DDR5 6000 · Đen",
        "price": 2990000,
        "stock": 7
      },
      {
        "id": "corsair-ram-extended",
        "label": "32GB (2 × 16GB) / DDR5 6000 · Đen · Bảo hành mở rộng (mẫu)",
        "price": 3490000,
        "stock": 5
      }
    ]
  },
  {
    "id": "kingston-ssd",
    "name": "Kingston NV2 SSD",
    "brand": "Kingston",
    "category": "pc",
    "image": "/images/product-pending.svg",
    "colors": [
      "Xanh"
    ],
    "promotion": false,
    "badge": "Lựa chọn tham khảo",
    "specs": [
      "1TB",
      "M.2 NVMe",
      "PCIe 4.0"
    ],
    "needs": [
      "study",
      "work",
      "upgrade"
    ],
    "description": "Kingston NV2 SSD: sản phẩm mẫu để thử tìm kiếm, bộ lọc và giỏ hàng. Cấu hình, giá và tồn kho dưới đây là dữ liệu giả lập, không phải thông tin chào bán.",
    "variants": [
      {
        "id": "kingston-ssd-standard",
        "label": "1TB / M.2 NVMe · Xanh",
        "price": 1490000,
        "stock": 8
      },
      {
        "id": "kingston-ssd-extended",
        "label": "1TB / M.2 NVMe · Xanh · Bảo hành mở rộng (mẫu)",
        "price": 1990000,
        "stock": 6
      }
    ]
  },
  {
    "id": "samsung-ssd",
    "name": "Samsung 990 PRO SSD",
    "brand": "Samsung",
    "category": "pc",
    "image": "/images/product-pending.svg",
    "colors": [
      "Đen"
    ],
    "promotion": true,
    "badge": "Lựa chọn tham khảo",
    "specs": [
      "1TB",
      "M.2 NVMe",
      "PCIe 4.0"
    ],
    "needs": [
      "creative",
      "upgrade"
    ],
    "description": "Samsung 990 PRO SSD: sản phẩm mẫu để thử tìm kiếm, bộ lọc và giỏ hàng. Cấu hình, giá và tồn kho dưới đây là dữ liệu giả lập, không phải thông tin chào bán.",
    "variants": [
      {
        "id": "samsung-ssd-standard",
        "label": "1TB / M.2 NVMe · Đen",
        "price": 3490000,
        "stock": 9
      },
      {
        "id": "samsung-ssd-extended",
        "label": "1TB / M.2 NVMe · Đen · Bảo hành mở rộng (mẫu)",
        "price": 3990000,
        "stock": 2
      }
    ]
  },
  {
    "id": "msi-mainboard",
    "name": "MSI B650 Gaming Plus WiFi",
    "brand": "MSI",
    "category": "pc",
    "image": "/images/product-pending.svg",
    "colors": [
      "Đen"
    ],
    "promotion": false,
    "badge": "Lựa chọn tham khảo",
    "specs": [
      "Socket AM5",
      "DDR5",
      "ATX"
    ],
    "needs": [
      "game",
      "upgrade"
    ],
    "description": "MSI B650 Gaming Plus WiFi: sản phẩm mẫu để thử tìm kiếm, bộ lọc và giỏ hàng. Cấu hình, giá và tồn kho dưới đây là dữ liệu giả lập, không phải thông tin chào bán.",
    "variants": [
      {
        "id": "msi-mainboard-standard",
        "label": "Socket AM5 / DDR5 · Đen",
        "price": 4990000,
        "stock": 0
      },
      {
        "id": "msi-mainboard-extended",
        "label": "Socket AM5 / DDR5 · Đen · Bảo hành mở rộng (mẫu)",
        "price": 5490000,
        "stock": 0
      }
    ]
  },
  {
    "id": "coolermaster-psu",
    "name": "Cooler Master MWE Gold 750",
    "brand": "Cooler Master",
    "category": "pc",
    "image": "/images/product-pending.svg",
    "colors": [
      "Đen"
    ],
    "promotion": false,
    "badge": "Lựa chọn tham khảo",
    "specs": [
      "750W",
      "80 Plus Gold",
      "Nguồn máy tính"
    ],
    "needs": [
      "game",
      "upgrade"
    ],
    "description": "Cooler Master MWE Gold 750: sản phẩm mẫu để thử tìm kiếm, bộ lọc và giỏ hàng. Cấu hình, giá và tồn kho dưới đây là dữ liệu giả lập, không phải thông tin chào bán.",
    "variants": [
      {
        "id": "coolermaster-psu-standard",
        "label": "750W / 80 Plus Gold · Đen",
        "price": 2490000,
        "stock": 11
      },
      {
        "id": "coolermaster-psu-extended",
        "label": "750W / 80 Plus Gold · Đen · Bảo hành mở rộng (mẫu)",
        "price": 2990000,
        "stock": 4
      }
    ]
  }

]
export const categories = [
  {
    id: 'laptop',
    name: 'Laptop',
    caption: 'Mang ý tưởng đi xa.',
    image: '/images/macbook-air.jpg',
    icon: 'laptop',
  },
  {
    id: 'phone',
    name: 'Điện thoại',
    caption: 'Kết nối theo cách của bạn.',
    image: '/images/iphone.jpg',
    icon: 'phone',
  },
  {
    id: 'pc',
    name: 'Linh kiện PC',
    caption: 'Sức mạnh từ từng lựa chọn.',
    image: '/images/gpu.jpg',
    icon: 'chip',
  },
]
export const needs = [
  { id: 'study', name: 'Học tập', description: 'Sẵn sàng cho bài học mới', icon: 'study' },
  { id: 'work', name: 'Văn phòng', description: 'Một ngày làm việc trôi chảy', icon: 'work' },
  { id: 'game', name: 'Gaming', description: 'Nhập cuộc, hết mình', icon: 'game' },
  {
    id: 'creative',
    name: 'Sáng tạo',
    description: 'Biến ý tưởng thành tác phẩm',
    icon: 'creative',
  },
  { id: 'upgrade', name: 'Nâng cấp PC', description: 'Thêm sức mạnh cho bộ máy', icon: 'chip' },
]
