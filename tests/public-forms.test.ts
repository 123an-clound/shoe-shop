import assert from "node:assert/strict";
import test from "node:test";
import { contactMessageInputSchema, newsletterInputSchema } from "../src/lib/validation/publicForms";

test("contact message requires a valid email and a useful message", () => {
  const valid = { name: "A customer", email: "person@example.com", message: "I have a question about sizing.", locale: "en" };
  assert.equal(contactMessageInputSchema.safeParse(valid).success, true);
  assert.equal(contactMessageInputSchema.safeParse({ ...valid, message: "short" }).success, false);
  assert.equal(contactMessageInputSchema.safeParse({ ...valid, email: "invalid" }).success, false);
});

test("newsletter trims and normalizes valid addresses and supported locales", () => {
  const parsed = newsletterInputSchema.safeParse({ email: "  PERSON@example.com  ", locale: "vi" });
  assert.equal(parsed.success, true);
  if (parsed.success) assert.equal(parsed.data.email, "person@example.com");
  assert.equal(newsletterInputSchema.safeParse({ email: "nope", locale: "vi" }).success, false);
  assert.equal(newsletterInputSchema.safeParse({ email: "person@example.com", locale: "fr" }).success, false);
});

test("the contact honeypot field is accepted for silent bot rejection", () => {
  const result = contactMessageInputSchema.safeParse({
    name: "A customer", email: "person@example.com", message: "I have a question about sizing.", locale: "en", website: "spam",
  });
  assert.equal(result.success, true);
});
