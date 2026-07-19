import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { POST } from "../app/api/requests/route.ts";

let ipSequence = 0;

const validPayload = {
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

function createRequest(payload = validPayload, ip = `127.0.1.${++ipSequence}`) {
  return new Request("http://localhost/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(payload),
  });
}

function resetDeliveryConfiguration() {
  delete process.env.MOCK_DB;
  delete process.env.DATABASE_URL;
}

afterEach(resetDeliveryConfiguration);

test("API route succeeds with database storage", async () => {
  process.env.MOCK_DB = "true";

  const response = await POST(createRequest());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).success, true);
});

test("API route returns 503 when the database is not configured", async () => {
  const response = await POST(createRequest());
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /unconfigured/i);
});

test("API route returns 400 for invalid request", async () => {
  process.env.MOCK_DB = "true";
  const response = await POST(createRequest({ ...validPayload, email: "not-an-email" }));
  assert.equal(response.status, 400);
  const json = await response.json();
  assert.equal(json.error, "Validation failed");
  assert.ok(json.fields.email);
});

test("API route returns 400 for malformed JSON", async () => {
  process.env.MOCK_DB = "true";
  const request = new Request("http://localhost/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.2.1" },
    body: "{not-json",
  });

  const response = await POST(request);
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "Invalid JSON request.");
});

test("API route silently accepts honeypot submissions without persisting", async () => {
  const response = await POST(createRequest({ ...validPayload, website: "spam-bot-fill" }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).success, true);
});

test("API route rate limiting works after limit exceeded", async () => {
  process.env.MOCK_DB = "true";
  const ip = "127.0.0.99";

  for (let requestNumber = 0; requestNumber < 5; requestNumber += 1) {
    const response = await POST(createRequest({
      ...validPayload,
      request: `Request ${requestNumber}`,
    }, ip));
    assert.equal(response.status, 200);
  }

  const response = await POST(createRequest(validPayload, ip));
  assert.equal(response.status, 429);
  assert.equal(
    (await response.json()).error,
    "Too many requests. Please try again in a minute."
  );
});
