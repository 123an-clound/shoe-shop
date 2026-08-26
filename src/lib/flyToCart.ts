/**
 * Clone ảnh sản phẩm và bay theo đường thẳng tới icon giỏ hàng ở header
 * (mục 6 PLAN.md). Chỉ animate `transform`/`opacity`, tự dọn dẹp sau khi xong.
 */
export function flyToCart(sourceEl: HTMLElement, imageUrl: string) {
  const target = document.getElementById("header-cart-icon");
  if (!target) return;

  const sourceRect = sourceEl.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  const clone = document.createElement("img");
  clone.src = imageUrl;
  clone.alt = "";
  Object.assign(clone.style, {
    position: "fixed",
    left: `${sourceRect.left}px`,
    top: `${sourceRect.top}px`,
    width: `${sourceRect.width}px`,
    height: `${sourceRect.height}px`,
    objectFit: "cover",
    borderRadius: "12px",
    zIndex: "100",
    pointerEvents: "none",
    willChange: "transform, opacity",
    transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease",
  });
  document.body.appendChild(clone);

  const deltaX =
    targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
  const deltaY =
    targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2);

  requestAnimationFrame(() => {
    clone.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.15)`;
    clone.style.opacity = "0.3";
  });

  clone.addEventListener("transitionend", () => clone.remove(), { once: true });
}
