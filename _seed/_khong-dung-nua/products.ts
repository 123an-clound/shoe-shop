import type { Product } from "@/types";

/**
 * 24 sản phẩm mẫu cho VELOCE.
 *
 * Giá tham khảo mặt bằng thị trường Việt Nam 08/2026:
 *  - Sneaker nội địa (Ananas, Biti's Hunter): 290.000₫ – 1.100.000₫
 *  - Sneaker quốc tế (Nike, adidas, New Balance): 1.800.000₫ – 4.500.000₫
 *  - Giày da nam cao cấp (Laforce, Antoni Fernando): 1.500.000₫ – 2.500.000₫
 *  - Boot da: 2.200.000₫ – 2.600.000₫
 *
 * LƯU Ý: mọi sản phẩm đều mang thương hiệu hư cấu VELOCE với các dòng
 * Aero / Vector / Pulse / Meridian / Cordell / Ridge.
 * KHÔNG dùng tên Nike, adidas, New Balance... trong dữ liệu — tránh vấn đề nhãn hiệu.
 *
 * `unsplashId` là mã ảnh gốc trên Unsplash (giấy phép cho phép dùng thương mại).
 * Chạy `npm run gen:images` để tải và cắt thành 3 khung ảnh cho mỗi sản phẩm.
 */

export const products: Product[] = [
  // ─────────────────────────── SNEAKER (8) ───────────────────────────
  {
    id: "p01", slug: "aero-drift-low", name: "Aero Drift Low", brand: "VELOCE",
    category: "sneaker", price: 1290000, originalPrice: 1690000,
    unsplashId: "jvoZ-Aux9aw",
    colors: [{ name: "Pastel Mint", hex: "#a7d8c8" }, { name: "Trắng Kem", hex: "#f2ede4" }, { name: "Xám Khói", hex: "#8b8b96" }],
    sizes: [39, 40, 41, 42, 43, 44], rating: 4.8, reviewCount: 214, badge: "SALE",
    description: "Phom low-top gọn gàng với phần cổ giày ôm chân, đế cao su đúc nguyên khối. Aero Drift Low là đôi mang được cả tuần mà không thấy chán.",
    features: ["Upper da tổng hợp phủ lớp chống thấm nhẹ", "Đế giữa EVA đúc nguyên khối, êm và nhẹ", "Lót trong kháng khuẩn, tháo rời được", "Trọng lượng 285g (size 42)"],
    stock: 32,
  },
  {
    id: "p02", slug: "aero-court-high", name: "Aero Court High", brand: "VELOCE",
    category: "sneaker", price: 1590000,
    unsplashId: "SxAXphIPWeg",
    colors: [{ name: "Trắng Tinh", hex: "#f7f7f5" }, { name: "Đen Tuyền", hex: "#16161a" }],
    sizes: [39, 40, 41, 42, 43, 44, 45], rating: 4.7, reviewCount: 168, badge: "HOT",
    description: "Cổ cao dựng phom bóng rổ cổ điển, da bò lộn ở phần mũi. Đôi này ăn ảnh và hợp với quần ống suông.",
    features: ["Upper da bò thật, khâu tay phần mũi", "Cổ giày đệm mút cao 8cm ôm mắt cá", "Đế ngoài cao su vulcanized bám tốt", "Lỗ xỏ dây bằng kim loại chống gỉ"],
    stock: 18,
  },
  {
    id: "p03", slug: "aero-mono-black", name: "Aero Mono Black", brand: "VELOCE",
    category: "sneaker", price: 1190000,
    unsplashId: "PqbL_mxmaUE",
    colors: [{ name: "Đen Full", hex: "#111114" }, { name: "Đen Sọc Trắng", hex: "#2a2a30" }],
    sizes: [39, 40, 41, 42, 43, 44], rating: 4.6, reviewCount: 291,
    description: "Đen từ upper xuống đế, không một chi tiết thừa. Đôi giày dễ phối nhất trong bộ sưu tập, đi làm hay đi chơi đều được.",
    features: ["Da microfiber bề mặt lì, ít bám bẩn", "Đế đen nguyên khối, không lộ vết xước", "Chỉ khâu cùng tông, đường may kín", "Lót đệm 6mm dày hơn bản tiêu chuẩn"],
    stock: 45,
  },
  {
    id: "p04", slug: "aero-retro-runner", name: "Aero Retro Runner", brand: "VELOCE",
    category: "sneaker", price: 1390000, originalPrice: 1790000,
    unsplashId: "a-QH9MAAVNI",
    colors: [{ name: "Đỏ Burgundy", hex: "#7d2b3a" }, { name: "Xanh Navy", hex: "#22314f" }, { name: "Be Cát", hex: "#cbb79b" }],
    sizes: [40, 41, 42, 43, 44], rating: 4.5, reviewCount: 132, badge: "SALE",
    description: "Thiết kế lấy cảm hứng từ giày chạy thập niên 80: mũi vuốt nhẹ, gót nhô, phối ba tông màu. Đi với quần jeans là chuẩn nhất.",
    features: ["Upper phối suede và lưới mesh thoáng khí", "Đế giữa cao 32mm tạo dáng chunky vừa phải", "Miếng lót gót chống trượt", "Dây giày dẹt tặng kèm 2 màu"],
    stock: 27,
  },
  {
    id: "p05", slug: "aero-canvas-slip", name: "Aero Canvas Slip-On", brand: "VELOCE",
    category: "sneaker", price: 890000,
    unsplashId: "SD9Jyl1xNQ4",
    colors: [{ name: "Trắng Ngà", hex: "#efece3" }, { name: "Xám Tro", hex: "#7c7c85" }, { name: "Xanh Rêu", hex: "#4a5340" }],
    sizes: [39, 40, 41, 42, 43, 44], rating: 4.4, reviewCount: 356, badge: "NEW",
    description: "Không dây, xỏ vào là đi. Vải canvas 12oz dày dặn, giặt máy được. Đôi rẻ nhất nhưng bán chạy nhất cửa hàng.",
    features: ["Canvas cotton 12oz, dệt chặt", "Chun hai bên co giãn, dễ xỏ", "Đế cao su lưu hóa, chống trượt", "Giặt máy được ở chế độ nhẹ"],
    stock: 88,
  },
  {
    id: "p06", slug: "aero-suede-classic", name: "Aero Suede Classic", brand: "VELOCE",
    category: "sneaker", price: 1690000,
    unsplashId: "Y0RB2z12F1A",
    colors: [{ name: "Nâu Cognac", hex: "#8f5a34" }, { name: "Xám Đá", hex: "#6e6e75" }],
    sizes: [40, 41, 42, 43, 44, 45], rating: 4.9, reviewCount: 97, badge: "LIMITED",
    description: "Da lộn nguyên tấm, không ghép nối. Bề mặt nhung mịn lên màu đẹp dần theo thời gian. Số lượng giới hạn 200 đôi.",
    features: ["Da lộn bò nguyên tấm, không nối", "Đế crepe tự nhiên đàn hồi", "Tem số thứ tự dập nổi ở lưỡi gà", "Tặng kèm bộ chăm sóc da lộn"],
    stock: 9,
  },
  {
    id: "p07", slug: "aero-street-mid", name: "Aero Street Mid", brand: "VELOCE",
    category: "sneaker", price: 1490000,
    unsplashId: "aDZ5YIuedQg",
    colors: [{ name: "Đỏ Đen", hex: "#a32b2b" }, { name: "Trắng Xanh", hex: "#dfe6ef" }],
    sizes: [39, 40, 41, 42, 43, 44], rating: 4.7, reviewCount: 245, badge: "HOT",
    description: "Cổ lửng, phối màu tương phản mạnh. Phom rộng hơn bản Low nửa size, ai chân bè nên chọn đôi này.",
    features: ["Phom rộng, phù hợp bàn chân bè", "Upper da tổng hợp phối lưới", "Đế ngoài chia rãnh chống trơn", "Có phiên bản size 45 riêng"],
    stock: 36,
  },
  {
    id: "p08", slug: "aero-mesh-light", name: "Aero Mesh Light", brand: "VELOCE",
    category: "sneaker", price: 990000, originalPrice: 1290000,
    unsplashId: "dwKiHoqqxk8",
    colors: [{ name: "Trắng Cam", hex: "#e8734a" }, { name: "Xám Bạc", hex: "#9aa0a6" }],
    sizes: [39, 40, 41, 42, 43], rating: 4.3, reviewCount: 178, badge: "SALE",
    description: "Nhẹ nhất bộ sưu tập, chỉ 240g. Toàn bộ upper là lưới mesh một lớp, cực thoáng — hợp thời tiết miền Nam.",
    features: ["Chỉ 240g mỗi chiếc (size 42)", "Upper mesh một lớp siêu thoáng", "Đế phylon nhẹ, đàn hồi tốt", "Khô nhanh sau khi giặt"],
    stock: 52,
  },

  // ─────────────────────────── THỂ THAO (4) ───────────────────────────
  {
    id: "p09", slug: "pulse-run-daily", name: "Pulse Run Daily", brand: "VELOCE",
    category: "the-thao", price: 1890000,
    unsplashId: "Y4fKN-RlMV4",
    colors: [{ name: "Xám Than", hex: "#4a4a52" }, { name: "Đen Neon", hex: "#1c1c22" }],
    sizes: [39, 40, 41, 42, 43, 44], rating: 4.6, reviewCount: 203, badge: "NEW",
    description: "Đôi chạy bộ hằng ngày cho quãng 5–10km. Đế giữa hoàn năng lượng tốt, không ê chân khi chạy đường nhựa.",
    features: ["Đế giữa foam hoàn năng lượng 78%", "Drop 8mm phù hợp tiếp đất giữa bàn chân", "Dải phản quang 360° chạy đêm an toàn", "Trọng lượng 265g (size 42)"],
    stock: 24,
  },
  {
    id: "p10", slug: "pulse-trail-grip", name: "Pulse Trail Grip", brand: "VELOCE",
    category: "the-thao", price: 2390000,
    unsplashId: "LxVxPA1LOVM",
    colors: [{ name: "Xanh Rêu", hex: "#3f4a35" }, { name: "Cam Đất", hex: "#b5623a" }],
    sizes: [40, 41, 42, 43, 44, 45], rating: 4.8, reviewCount: 86,
    description: "Chạy địa hình. Gai đế sâu 5mm bám tốt trên đất ẩm và đá dăm. Mũi giày có ốp cao su chống va đập.",
    features: ["Gai đế cao su sâu 5mm, bám đa hướng", "Ốp mũi cao su chống va đập vào đá", "Lớp lót chống nước, thoát hơi tốt", "Dây giày khóa nhanh giấu trong lưỡi gà"],
    stock: 15,
  },
  {
    id: "p11", slug: "pulse-gym-trainer", name: "Pulse Gym Trainer", brand: "VELOCE",
    category: "the-thao", price: 1590000, originalPrice: 1990000,
    unsplashId: "J2-wAQDckus",
    colors: [{ name: "Trắng Đỏ", hex: "#d43f3f" }, { name: "Đen Xám", hex: "#26262c" }],
    sizes: [39, 40, 41, 42, 43, 44], rating: 4.5, reviewCount: 141, badge: "SALE",
    description: "Đế phẳng và cứng, ổn định khi squat và deadlift. Không dùng để chạy đường dài — đây là đôi chuyên cho phòng gym.",
    features: ["Đế phẳng, độ cứng cao — ổn định khi nâng tạ", "Đai giữa bàn chân khóa chắc", "Upper chống mài mòn khi đẩy tạ", "Drop 4mm sát mặt đất"],
    stock: 30,
  },
  {
    id: "p12", slug: "pulse-court-tennis", name: "Pulse Court Tennis", brand: "VELOCE",
    category: "the-thao", price: 2190000,
    unsplashId: "A4579vLezz8",
    colors: [{ name: "Trắng Xanh", hex: "#3d6fb5" }, { name: "Trắng Toàn Phần", hex: "#f4f4f2" }],
    sizes: [40, 41, 42, 43, 44], rating: 4.4, reviewCount: 62,
    description: "Giày tennis sân cứng. Phần gót gia cố chịu được động tác dừng đột ngột và di chuyển ngang liên tục.",
    features: ["Gót gia cố chịu lực dừng đột ngột", "Đế herringbone bám sân cứng", "Vùng mũi chống mài khi rê chân", "Bảo hành mòn đế 6 tháng"],
    stock: 21,
  },

  // ─────────────────────────── GIÀY DA (5) ───────────────────────────
  {
    id: "p13", slug: "meridian-oxford-den", name: "Meridian Oxford Đen", brand: "VELOCE",
    category: "giay-da", price: 2290000,
    unsplashId: "2nST4hbvTkc",
    colors: [{ name: "Đen Bóng", hex: "#141416" }],
    sizes: [39, 40, 41, 42, 43], rating: 4.9, reviewCount: 74, badge: "HOT",
    description: "Oxford buộc dây kín, phom thon dài. Đôi giày mặc định cho vest và lễ cưới. Da bò Ý thuộc thảo mộc, đánh màu thủ công.",
    features: ["Da bò Ý thuộc thảo mộc, đánh màu thủ công", "Cấu trúc khâu Blake, đế da bò thật", "Phom thon dài, ôm gót", "Kèm cây giữ phom bằng gỗ tuyết tùng"],
    stock: 12,
  },
  {
    id: "p14", slug: "meridian-derby-nau", name: "Meridian Derby Nâu", brand: "VELOCE",
    category: "giay-da", price: 1990000, originalPrice: 2350000,
    unsplashId: "FkNIKhdnnjQ",
    colors: [{ name: "Nâu Cà Phê", hex: "#5c3a24" }, { name: "Nâu Tây", hex: "#8a5a37" }],
    sizes: [39, 40, 41, 42, 43, 44], rating: 4.7, reviewCount: 118, badge: "SALE",
    description: "Derby mở dây, dễ chịu hơn Oxford với bàn chân dày. Đi công sở hằng ngày, phối được cả quần âu lẫn chino.",
    features: ["Phần dây mở, rộng hơn Oxford — hợp chân dày", "Da bò thuộc thảo mộc lên màu theo thời gian", "Đế cao su đúc chống trơn sàn ướt", "Lót trong da bò chống hôi"],
    stock: 26,
  },
  {
    id: "p15", slug: "meridian-wholecut", name: "Meridian Wholecut", brand: "VELOCE",
    category: "giay-da", price: 2590000,
    unsplashId: "87V27nw0sS0",
    colors: [{ name: "Nâu Hạt Dẻ", hex: "#6b3f2a" }, { name: "Đen Tuyền", hex: "#18181b" }],
    sizes: [40, 41, 42, 43], rating: 5.0, reviewCount: 38, badge: "LIMITED",
    description: "Cắt từ một tấm da duy nhất, chỉ có một đường khâu ở gót. Đây là phép thử tay nghề của thợ giày — và là đôi đắt nhất cửa hàng.",
    features: ["Cắt từ một tấm da nguyên, chỉ một đường khâu", "Khâu Goodyear welt, thay đế được nhiều lần", "Da bê Pháp mặt mịn", "Sản xuất theo đơn, 3–4 tuần chờ"],
    stock: 4,
  },
  {
    id: "p16", slug: "meridian-monk-strap", name: "Meridian Monk Strap", brand: "VELOCE",
    category: "giay-da", price: 2190000,
    unsplashId: "q4ExhrHaSLY",
    colors: [{ name: "Nâu Đậm", hex: "#4f3222" }, { name: "Đen", hex: "#151517" }],
    sizes: [39, 40, 41, 42, 43], rating: 4.6, reviewCount: 55,
    description: "Khóa quai đôi thay dây buộc. Nổi bật hơn Oxford nhưng vẫn đủ trang trọng cho hội nghị và tiệc tối.",
    features: ["Khóa quai đôi bằng đồng thau mạ", "Điều chỉnh được độ ôm bằng 2 nấc", "Da bò thuộc thảo mộc", "Đế da khâu Blake, thay được"],
    stock: 17,
  },
  {
    id: "p17", slug: "meridian-brogue-cap", name: "Meridian Brogue Cap Toe", brand: "VELOCE",
    category: "giay-da", price: 2350000,
    unsplashId: "wh2udxkVPWA",
    colors: [{ name: "Nâu Rượu", hex: "#6d3b31" }, { name: "Xanh Đen", hex: "#232b3a" }],
    sizes: [40, 41, 42, 43, 44], rating: 4.8, reviewCount: 66, badge: "NEW",
    description: "Đục lỗ trang trí chạy dọc mũi và thân giày. Đôi này có tính cách nhất trong dòng Meridian — hợp người thích chi tiết.",
    features: ["Đục lỗ brogue thủ công từng lỗ", "Mũi cap-toe gia cố giữ phom lâu", "Da bò Ý, đánh patina hai tông", "Đế da khâu Goodyear"],
    stock: 14,
  },

  // ─────────────────────────── LOAFER (4) ───────────────────────────
  {
    id: "p18", slug: "cordell-penny-loafer", name: "Cordell Penny Loafer", brand: "VELOCE",
    category: "loafer", price: 1750000,
    unsplashId: "erHlzWCN6zQ",
    colors: [{ name: "Nâu Cognac", hex: "#8b5527" }, { name: "Đen", hex: "#17171a" }],
    sizes: [39, 40, 41, 42, 43, 44], rating: 4.7, reviewCount: 129, badge: "HOT",
    description: "Penny loafer phom cổ điển, quai ngang có khe. Xỏ vào là đi, không cần buộc dây — tiện cho ngày đi lại nhiều.",
    features: ["Quai ngang có khe penny truyền thống", "Da bò mềm, không cần thời gian break-in lâu", "Đế cao su mỏng, đi êm cả ngày", "Gót cao 2,5cm"],
    stock: 33,
  },
  {
    id: "p19", slug: "cordell-suede-tassel", name: "Cordell Suede Tassel", brand: "VELOCE",
    category: "loafer", price: 1890000, originalPrice: 2200000,
    unsplashId: "KOavcW0p7oc",
    colors: [{ name: "Nâu Lộn", hex: "#96683f" }, { name: "Xanh Navy Lộn", hex: "#33405c" }],
    sizes: [40, 41, 42, 43, 44], rating: 4.5, reviewCount: 71, badge: "SALE",
    description: "Da lộn với chùm tua rua ở mũi. Đôi giày phá cách nhất cho môi trường công sở không quá cứng nhắc.",
    features: ["Da lộn bò, tua rua khâu tay", "Đế crepe êm, đi nhẹ chân", "Lót đệm gót chống tuột", "Kèm bàn chải chăm sóc da lộn"],
    stock: 19,
  },
  {
    id: "p20", slug: "cordell-horsebit", name: "Cordell Horsebit", brand: "VELOCE",
    category: "loafer", price: 2300000,
    unsplashId: "LkuH3Txi_gs",
    colors: [{ name: "Nâu Đỏ", hex: "#7b4028" }, { name: "Đen Bóng", hex: "#141417" }],
    sizes: [39, 40, 41, 42, 43], rating: 4.8, reviewCount: 48, badge: "LIMITED",
    description: "Khóa kim loại hình hàm thiếc ngựa ở mũi. Chi tiết nhỏ nhưng nâng cả bộ đồ lên một bậc.",
    features: ["Khóa horsebit bằng đồng thau mạ vàng nhạt", "Da bê mặt bóng, ít nhăn", "Đế da khâu Blake", "Số lượng giới hạn 150 đôi"],
    stock: 7,
  },
  {
    id: "p21", slug: "cordell-slip-den", name: "Cordell Slip-On Đen", brand: "VELOCE",
    category: "loafer", price: 1490000,
    unsplashId: "NySU2CFS9Eo",
    colors: [{ name: "Đen Lì", hex: "#131316" }],
    sizes: [39, 40, 41, 42, 43, 44, 45], rating: 4.4, reviewCount: 164,
    description: "Loafer trơn không chi tiết, đen tuyệt đối. Đôi an toàn nhất — đi cưới, đi họp, đi ăn tối đều không sai.",
    features: ["Không chi tiết trang trí, tối giản hoàn toàn", "Da bò mặt lì, không bám vân tay", "Đế cao su chống trơn", "Có size 45 cho chân lớn"],
    stock: 41,
  },

  // ─────────────────────────── BOOT (3) ───────────────────────────
  {
    id: "p22", slug: "ridge-chelsea-boot", name: "Ridge Chelsea Boot", brand: "VELOCE",
    category: "boot", price: 2350000,
    unsplashId: "4lf8mVuZESQ",
    colors: [{ name: "Nâu Đất", hex: "#6f4630" }, { name: "Đen", hex: "#16161a" }],
    sizes: [39, 40, 41, 42, 43, 44], rating: 4.8, reviewCount: 92, badge: "HOT",
    description: "Chelsea boot chun hai bên, không dây. Cổ cao qua mắt cá, đi với quần ống côn là đẹp nhất.",
    features: ["Chun hai bên co giãn, xỏ nhanh", "Quai kéo phía sau bằng da bện", "Đế chunky cao 3,5cm", "Da bò thuộc thảo mộc lên màu đẹp dần"],
    stock: 22,
  },
  {
    id: "p23", slug: "ridge-chukka-suede", name: "Ridge Chukka Suede", brand: "VELOCE",
    category: "boot", price: 2200000, originalPrice: 2600000,
    unsplashId: "miNo_SFAcws",
    colors: [{ name: "Nâu Cát", hex: "#a97b4f" }, { name: "Xám Đá", hex: "#75757d" }],
    sizes: [40, 41, 42, 43, 44], rating: 4.6, reviewCount: 58, badge: "SALE",
    description: "Chukka hai lỗ xỏ dây, cổ thấp hơn Chelsea. Da lộn mềm, đế crepe — đôi boot nhẹ nhất, đi mùa mưa vẫn ổn.",
    features: ["Chỉ 2 lỗ xỏ dây, tháo lắp nhanh", "Da lộn bò phủ lớp chống thấm nhẹ", "Đế crepe tự nhiên êm và nhẹ", "Trọng lượng 390g (size 42)"],
    stock: 16,
  },
  {
    id: "p24", slug: "ridge-combat-boot", name: "Ridge Combat Boot", brand: "VELOCE",
    category: "boot", price: 2590000,
    unsplashId: "esxf7PJmExQ",
    colors: [{ name: "Nâu Đậm", hex: "#4d3122" }, { name: "Đen Nhám", hex: "#1b1b1f" }],
    sizes: [40, 41, 42, 43, 44, 45], rating: 4.9, reviewCount: 44, badge: "NEW",
    description: "Cổ cao 7 lỗ xỏ dây, đế lug răng sâu. Đôi bền nhất cửa hàng — mua một lần đi được nhiều năm.",
    features: ["Đế lug răng sâu, bám mọi địa hình", "Khâu Goodyear welt — thay đế được", "Da bò dày 2,0mm chống trầy", "Bảo hành đường khâu 24 tháng"],
    stock: 11,
  },
];

export const getProductBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);

export const getRelatedProducts = (product: Product, limit = 4) =>
  products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
