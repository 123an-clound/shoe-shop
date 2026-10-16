import { test, expect } from "@playwright/test";

for (const locale of ["", "/en"]) {
  test(`product fits phone and tablet widths ${locale || "vi"}`, async ({ page }) => {
    await page.goto(`${locale}/san-pham/aero-drift-low`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Giày|Sneaker/i);
    for (const width of [360, 390, 430, 600, 768, 820, 1024, 1180, 1440]) {
      await page.setViewportSize({ width, height: width < 600 ? 844 : 1024 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
    }
    await page.evaluate(() => { document.documentElement.dataset.theme = "light"; });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  });
}

test("mobile menu traps focus, supports Escape and restores the trigger", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Mở menu", exact: true });
  await trigger.click();
  const close = page.getByRole("button", { name: "Đóng menu", exact: true });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");
});

test("filters persist through product navigation and results render in bounded groups", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/san-pham");
  await expect(page.locator('main a[href*="/san-pham/"]')).not.toHaveCount(0);
  expect(await page.locator('main a[href*="/san-pham/"]').count()).toBeLessThanOrEqual(24);
  await page.getByRole("button", { name: "Bộ lọc", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "40", exact: true }).click();
  await expect(page).toHaveURL(/size=40/);
  await page.getByRole("button", { name: "Đóng bộ lọc", exact: true }).click();
  await expect(page.getByRole("button", { name: "Bộ lọc", exact: true })).toBeFocused();
  const filteredUrl = page.url();
  await page.locator('main a[href*="/san-pham/"]').first().click();
  await expect(page).toHaveURL(/\/san-pham\/[^?]+/);
  await page.goBack();
  await expect(page).toHaveURL(filteredUrl);
  await page.getByRole("button", { name: "Bộ lọc", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("button", { name: "40", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("gallery and checkout remain operable with reduced motion and offline submission", async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/san-pham/aero-drift-low");
  await page.getByRole("button", { name: "Ảnh tiếp", exact: true }).click();
  await expect(page.getByRole("button", { name: "Xem ảnh 2", exact: true })).toHaveAttribute("aria-current", "true");
  await page.getByRole("button", { name: "Phóng to ảnh", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("img")).toBeVisible();
  await page.getByRole("button", { name: "Đóng ảnh", exact: true }).click();
  await expect(page.getByRole("button", { name: "Phóng to ảnh", exact: true })).toBeFocused();
  await page.getByRole("radio", { name: "Size 40", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Size 41", exact: true })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: /Thêm vào giỏ hàng/ }).click();
  await page.getByRole("button", { name: /Mở giỏ hàng/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto("/thanh-toan");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Họ và tên", exact: true })).toBeFocused();
  const phone = page.getByRole("textbox", { name: "Số điện thoại", exact: true });
  await expect(phone).toHaveAttribute("type", "tel");
  await expect(phone).toHaveAttribute("autocomplete", "tel");
  await expect(phone).toHaveCSS("font-size", "16px");
  await page.getByRole("textbox", { name: "Họ và tên", exact: true }).fill("Khách kiểm thử");
  await phone.fill("0900000000");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page.locator('input[name="address"]').fill("Địa chỉ kiểm thử, không gửi đơn thật");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  // No real order: network is disabled before the only submission in this suite.
  await context.setOffline(true);
  await page.getByRole("button", { name: "Đặt COD", exact: true }).click();
  await expect(page.locator("form").filter({ has: page.getByRole("button", { name: "Đặt COD", exact: true }) })).toContainText(/thử lại|kết nối/i);
  await expect(page.getByRole("button", { name: "Đặt COD", exact: true })).toBeEnabled();
});

test("production responses include security headers and fresh CSP nonces", async ({ request }) => {
  const first = await request.get("/");
  const second = await request.get("/");
  expect(first.headers()["x-content-type-options"]).toBe("nosniff");
  expect(first.headers()["x-frame-options"]).toBe("DENY");
  expect(first.headers()["x-powered-by"]).toBeUndefined();
  expect(first.status()).toBe(200);
  expect(first.headers()["content-security-policy-report-only"]).toBeUndefined();
  const policy = first.headers()["content-security-policy"];
  expect(policy).toContain("strict-dynamic");
  expect(policy).not.toEqual(second.headers()["content-security-policy"]);
  const nonce = policy.match(/'nonce-([^']+)'/)?.[1];
  expect(nonce).toBeTruthy();
  expect(await first.text()).toContain(`nonce="${nonce}"`);
});

test("CSP blocks an inline script without a nonce while the storefront stays interactive", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route(/\/$/, async route => {
    const response = await route.fetch();
    const body = (await response.text()).replace("</head>", '<script>document.documentElement.dataset.securityProbe="executed"</script></head>');
    await route.fulfill({ response, body });
  });
  await page.goto("/");
  // Payload phải đi qua HTML parser; DevTools evaluate có thể mang quyền script tin cậy.
  const executed = await page.evaluate(() => document.documentElement.dataset.securityProbe === "executed");
  expect(executed).toBe(false);
  await page.getByRole("button", { name: "Mở menu", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("session API does not grant cross-origin credentialed reads", async ({ request }) => {
  const headers = { Origin: "https://untrusted.invalid", "Access-Control-Request-Method": "GET" };
  for (const response of [await request.get("/api/customer/session", { headers }), await request.fetch("/api/customer/session", { method: "OPTIONS", headers })]) {
    expect(response.headers()["access-control-allow-origin"]).toBeUndefined();
    expect(response.headers()["access-control-allow-credentials"]).toBeUndefined();
  }
});
