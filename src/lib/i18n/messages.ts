export type Locale = "vi" | "en";

export const MESSAGES = {
  vi: {
    nav: { home: "Trang chủ", products: "Sản phẩm", about: "Về chúng tôi", contact: "Liên hệ" },
    controls: { language: "Ngôn ngữ", theme: "Giao diện", light: "Sáng", dark: "Tối", openCart: "Mở giỏ hàng", openMenu: "Mở menu", closeMenu: "Đóng menu" },
    home: {
      heroCta: "Khám phá bộ sưu tập", heroSecondary: "Xem sản phẩm mới", scroll: "Cuộn để khám phá",
      categories: "Khám phá theo danh mục", featured: "Sản phẩm nổi bật", featuredIntro: "Những đôi được chọn mua nhiều nhất tuần này.", all: "Xem tất cả",
      story1: "Chất liệu chọn lọc kỹ càng", story1Body: "Da thuộc, vải canvas bền và cao su đúc nguyên khối — mỗi đôi bắt đầu từ nguyên liệu tốt nhất có thể tìm được.",
      story2: "Vừa vặn với từng bước chân", story2Body: "Phom giày được tinh chỉnh qua nhiều lần thử, đế giữa êm ái cho cả những ngày di chuyển nhiều nhất.",
      story3: "Bền theo năm tháng", story3Body: "Đường khâu chắc chắn, xử lý chống thấm nhẹ và đế cao su chịu mài mòn — mua một lần, dùng được nhiều năm.",
      statsProducts: "Mẫu giày đang bán", statsCategories: "Danh mục sản phẩm",
      testimonials: "Khách hàng nói gì", newsletter: "Đăng ký nhận tin", newsletterBody: "Để lại email để VELOCE ghi nhận yêu cầu cập nhật về sản phẩm mới và ưu đãi.",
      email: "Địa chỉ email", subscribe: "Đăng ký", subscribed: "Đăng ký của bạn đã được ghi nhận.", submitError: "Chưa lưu được email. Hãy thử lại.", newsletterPrivacy: "Email được lưu để đội ngũ VELOCE quản lý đăng ký nhận tin. Hiện chưa có email tự động được gửi.", new: "Hàng mới về",
    },
    product: {
      new: "Mới", sale: "Giảm giá", hot: "Bán chạy", limited: "Giới hạn", noImage: "Chưa có ảnh", soldOut: "Tạm hết hàng", lowStock: "Chỉ còn {{count}} đôi",
      all: "Tất cả sản phẩm", filters: "Bộ lọc", count: "{{count}} sản phẩm", sort: "Sắp xếp", featuredSort: "Nổi bật", newest: "Mới nhất", priceLow: "Giá thấp đến cao", priceHigh: "Giá cao đến thấp",
      noResults: "Không tìm thấy sản phẩm phù hợp bộ lọc.", clearFilters: "Xóa bộ lọc", size: "Size (EU)", reviews: "đánh giá", description: "Mô tả", specs: "Thông số", rating: "Đánh giá", reviewsCount: "{{count}} lượt đánh giá", related: "Có thể bạn thích", color: "Màu sắc", chooseSize: "Chọn size", addToCart: "Thêm vào giỏ hàng", added: "Đã thêm vào giỏ hàng", selectColor: "Chọn màu trước khi thêm vào giỏ hàng.", selectSize: "Vui lòng chọn size.", sizeGuide: "Hướng dẫn chọn size",
    },
    cart: { title: "Giỏ hàng", empty: "Giỏ hàng đang trống.", emptyTitle: "Giỏ hàng đang trống", emptyBody: "Chọn một đôi giày ưng ý và quay lại đây nhé.", continue: "Tiếp tục mua sắm", subtotal: "Tạm tính", checkout: "Thanh toán", fullCart: "Xem giỏ hàng đầy đủ", remove: "Xóa", quantity: "Số lượng", shippingNote: "Phí vận chuyển và giảm giá sẽ được tính chính xác ở bước thanh toán.", coupon: "Dùng mã {{code}} để giảm {{percent}}% khi thanh toán", estimated: "Tạm tính (ước tính)", totalNote: "Số tiền cuối cùng (đã gồm giảm giá, phí ship) do hệ thống tính chính xác sau khi đặt hàng.", proceed: "Tiến hành thanh toán" },
    checkout: { title: "Thanh toán", steps: ["Thông tin", "Giao hàng", "Xác nhận"], empty: "Giỏ hàng đang trống.", name: "Họ và tên", phone: "Số điện thoại", email: "Email (không bắt buộc)", address: "Địa chỉ giao hàng", note: "Ghi chú (không bắt buộc)", coupon: "Mã giảm giá (nếu có)", back: "Quay lại", next: "Tiếp tục", submitting: "Đang đặt hàng...", placeOrder: "Đặt COD", paymentTitle: "Thanh toán khi nhận hàng (COD)", paymentBody: "Bạn thanh toán cho đơn vị giao hàng khi nhận giày. Nhân viên VELOCE sẽ liên hệ xác nhận đơn.", product: "Sản phẩm", confirmationNote: "Số tiền cuối cùng (đã gồm giảm giá và phí vận chuyển) sẽ được tính chính xác khi đặt hàng.", errorEmpty: "Giỏ hàng đang trống.", errorRetry: "Chưa nhận được xác nhận từ máy chủ. Thử lại an toàn; hệ thống sẽ tránh tạo đơn trùng." },
    footer: { direction: "Điều hướng", contact: "Liên hệ", cod: "Hỗ trợ thanh toán COD khi nhận hàng." },
    about: { title: "Về chúng tôi", cta: "Khám phá bộ sưu tập" },
    contact: { title: "Liên hệ", form: "Gửi tin nhắn", name: "Họ và tên", phone: "Số điện thoại", email: "Email", message: "Nội dung", send: "Gửi tin nhắn", sending: "Đang gửi...", sent: "Tin nhắn đã được lưu. VELOCE sẽ phản hồi qua email của bạn.", error: "Chưa lưu được tin nhắn. Hãy kiểm tra kết nối và thử lại.", privacy: "Tên, email và nội dung được lưu trong hộp thư quản trị để phản hồi yêu cầu của bạn.", map: "Bản đồ vị trí cửa hàng" },
    success: { title: "Đặt hàng thành công", body: "Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ sớm liên hệ xác nhận.", code: "Mã đơn hàng", total: "Tổng thanh toán", continue: "Tiếp tục mua sắm" },
  },
  en: {
    nav: { home: "Home", products: "Shop", about: "Our story", contact: "Contact" },
    controls: { language: "Language", theme: "Appearance", light: "Light", dark: "Dark", openCart: "Open cart", openMenu: "Open menu", closeMenu: "Close menu" },
    home: {
      heroCta: "Explore the collection", heroSecondary: "Shop new arrivals", scroll: "Scroll to explore",
      categories: "Shop by category", featured: "Featured footwear", featuredIntro: "Pairs our customers keep coming back to.", all: "Shop all",
      story1: "Materials chosen with care", story1Body: "Durable leather, canvas and solid-molded rubber — every pair starts with thoughtfully selected materials.",
      story2: "A fit made for your stride", story2Body: "We refine each last through repeated fittings and add a comfortable midsole for your busiest days.",
      story3: "Made to go the distance", story3Body: "Reliable stitching, light water resistance and hard-wearing rubber — a pair made to serve you for years.",
      statsProducts: "Styles available", statsCategories: "Product categories",
      testimonials: "What customers say", newsletter: "Sign up for updates", newsletterBody: "Leave your email so VELOCE can record your request for product and offer updates.",
      email: "Email address", subscribe: "Sign up", subscribed: "Your request has been saved.", submitError: "We could not save your email. Please try again.", newsletterPrivacy: "Your email is saved for the VELOCE team to manage newsletter requests. Automated emails are not sent yet.", new: "New arrivals",
    },
    product: {
      new: "New", sale: "Sale", hot: "Bestseller", limited: "Limited", noImage: "Image coming soon", soldOut: "Out of stock", lowStock: "Only {{count}} pairs left",
      all: "All footwear", filters: "Filters", count: "{{count}} items", sort: "Sort by", featuredSort: "Featured", newest: "Newest", priceLow: "Price: low to high", priceHigh: "Price: high to low",
      noResults: "No footwear matches these filters.", clearFilters: "Clear filters", size: "Size (EU)", reviews: "reviews", description: "Details", specs: "Specifications", rating: "Reviews", reviewsCount: "{{count}} reviews", related: "You may also like", color: "Color", chooseSize: "Choose a size", addToCart: "Add to cart", added: "Added to cart", selectColor: "Choose a color before adding to cart.", selectSize: "Please choose a size.", sizeGuide: "Size guide",
    },
    cart: { title: "Your bag", empty: "Your bag is empty.", emptyTitle: "Your bag is empty", emptyBody: "Find a pair you love and come back here.", continue: "Continue shopping", subtotal: "Subtotal", checkout: "Checkout", fullCart: "View full bag", remove: "Remove", quantity: "Quantity", shippingNote: "Shipping and discounts are calculated at checkout.", coupon: "Use code {{code}} for {{percent}}% off at checkout", estimated: "Estimated subtotal", totalNote: "The final total, including discounts and shipping, is calculated when you place your order.", proceed: "Continue to checkout" },
    checkout: { title: "Checkout", steps: ["Your details", "Delivery", "Review"], empty: "Your bag is empty.", name: "Full name", phone: "Phone number", email: "Email (optional)", address: "Delivery address", note: "Order note (optional)", coupon: "Discount code (optional)", back: "Back", next: "Continue", submitting: "Placing order...", placeOrder: "Place COD order", paymentTitle: "Cash on delivery (COD)", paymentBody: "Pay the courier when your shoes arrive. A VELOCE team member will contact you to confirm the order.", product: "Item", confirmationNote: "Your final total, including discounts and shipping, will be calculated when you place the order.", errorEmpty: "Your bag is empty.", errorRetry: "The server has not confirmed the order. You can retry safely; the same attempt will not create a duplicate." },
    footer: { direction: "Explore", contact: "Contact", cod: "Cash on delivery is available." },
    about: { title: "Our story", cta: "Explore the collection" },
    contact: { title: "Contact", form: "Send us a message", name: "Full name", phone: "Phone number", email: "Email", message: "Message", send: "Send message", sending: "Sending...", sent: "Your message has been saved. VELOCE will reply to your email.", error: "We could not save your message. Check your connection and try again.", privacy: "Your name, email and message are saved in the admin inbox so we can respond to your request.", map: "Store location map" },
    success: { title: "Order placed", body: "Thanks for your order. We will contact you soon to confirm the details.", code: "Order number", total: "Order total", continue: "Continue shopping" },
  },
} as const;

export type Messages = (typeof MESSAGES)[Locale];

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}

export function localizedHref(href: string, locale: Locale): string {
  if (!href.startsWith("/")) return href;
  if (/^\/(admin|api|robots\.txt|sitemap\.xml)(\/|$)/.test(href)) return href;
  const withoutEnglishPrefix = href.replace(/^\/en(?=\/|\?|$)/, "") || "/";
  if (locale === "vi") return withoutEnglishPrefix;
  return withoutEnglishPrefix === "/" ? "/en" : `/en${withoutEnglishPrefix}`;
}

export function translate(template: string, values: Record<string, string | number> = {}): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(values[key] ?? ""));
}
