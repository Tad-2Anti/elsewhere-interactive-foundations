import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../app/api/requests/route.ts";

process.env.NODE_ENV = "test";

test("API route returns success for valid request", async () => {
  const request = new Request("http://localhost/api/requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "+91 9876543210",
      location: "Delhi, India",
      contactPreference: "email",
      category: "arcade",
      request: "A vintage mechanical keyboard",
      reference: "https://example.com/keyboard",
      details: "Keycaps should be grey and retro.",
    }),
  });

  const response = await POST(request);
  assert.equal(response.status, 200);
  const json = await response.json();
  assert.ok(json.success);
});

test("API route returns 400 for invalid request", async () => {
  const request = new Request("http://localhost/api/requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Jane Doe",
      email: "not-an-email",
      location: "Delhi, India",
      contactPreference: "email",
      category: "arcade",
      request: "A vintage mechanical keyboard",
    }),
  });

  const response = await POST(request);
  assert.equal(response.status, 400);
  const json = await response.json();
  assert.equal(json.error, "Validation failed");
  assert.ok(json.fields.email);
});

test("API route rate limiting works after limit exceeded", async () => {
  const ip = "127.0.0.99"; // Unique IP for this test block

  // Send 5 successful requests
  for (let i = 0; i < 5; i++) {
    const request = new Request("http://localhost/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": ip,
      },
      body: JSON.stringify({
        name: "Jane Doe",
        email: "jane@example.com",
        location: "Delhi, India",
        contactPreference: "email",
        category: "arcade",
        request: "Request " + i,
      }),
    });
    const res = await POST(request);
    assert.ok(res.status === 200 || res.status === 429);
  }

  // The 6th request should definitely be rate limited
  const request = new Request("http://localhost/api/requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify({
      name: "Jane Doe",
      email: "jane@example.com",
      location: "Delhi, India",
      contactPreference: "email",
      category: "arcade",
      request: "Rate limit request",
    }),
  });
  const res = await POST(request);
  assert.equal(res.status, 429);
  const json = await res.json();
  assert.equal(json.error, "Too many requests. Please try again in a minute.");
});
