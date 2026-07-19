import assert from "node:assert/strict";
import test from "node:test";
import { requestSchema } from "../app/request-schema.ts";

test("valid request payload parses successfully", () => {
  const payload = {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "+91 9876543210",
    location: "Delhi, India",
    contactPreference: "email",
    category: "arcade",
    request: "A vintage mechanical keyboard",
    reference: "https://example.com/keyboard",
    details: "Keycaps should be grey and retro.",
  };

  const parsed = requestSchema.safeParse(payload);
  assert.ok(parsed.success);
  assert.equal(parsed.data.name, "Jane Doe");
});

test("rejects request missing required fields", () => {
  const payload = {
    name: "Jane Doe",
    // email is missing
    location: "Delhi, India",
    contactPreference: "email",
    category: "arcade",
    request: "A vintage mechanical keyboard",
  };

  const parsed = requestSchema.safeParse(payload);
  assert.equal(parsed.success, false);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    assert.ok(fieldErrors.email);
  }
});

test("rejects invalid email formats", () => {
  const payload = {
    name: "Jane Doe",
    email: "not-an-email",
    location: "Delhi, India",
    contactPreference: "email",
    category: "arcade",
    request: "A vintage mechanical keyboard",
  };

  const parsed = requestSchema.safeParse(payload);
  assert.equal(parsed.success, false);
});
