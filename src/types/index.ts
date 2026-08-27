/** Hình dạng của cột jsonb `colors` trong `veloce_products`. */
export type ProductColor = {
  name: string;
  hex: string;
};

/** Hình dạng một dòng trong cột jsonb `items` của `veloce_orders` (bản chụp lúc đặt). */
export type OrderItem = {
  product_id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  size: number | string;
  color: string;
  quantity: number;
};
