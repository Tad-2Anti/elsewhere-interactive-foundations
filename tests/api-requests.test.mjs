import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { POST } from "../app/api/requests/route.ts";

const originalFetch = globalThis.fetch;
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
  delete process.env.WEB3FORMS_ACCESS_KEY;
  globalThis.fetch = originalFetch;
}

afterEach(resetDeliveryConfiguration);

test("API route succeeds with database storage only", async () => {
  process.env.MOCK_DB = "true";
  let providerCalled = false;
  globalThis.fetch = async () => {
    providerCalled = true;
    return Response.json({ success: true });
  };

  const response = await POST(createRequest());
  assert.equal(response.status, 200);
  assert.equal(providerCalled, false);
  assert.equal((await response.json()).success, true);
});

test("API route succeeds with Web3Forms delivery only", async () => {
  process.env.WEB3FORMS_ACCESS_KEY = "test-access-key";
  let submittedPayload;
  globalThis.fetch = async (_url, options) => {
    submittedPayload = JSON.parse(options.body);
    return Response.json({ success: true });
  };

  const response = await POST(createRequest());
  assert.equal(response.status, 200);
  assert.equal(submittedPayload.access_key, "test-access-key");
  assert.equal(submittedPayload.email, validPayload.email);
});

test("API route succeeds when one of two configured channels fails", async () => {
  process.env.MOCK_DB = "true";
  process.env.WEB3FORMS_ACCESS_KEY = "test-access-key";
  globalThis.fetch = async () => Response.json({ success: false }, { status: 400 });

  const response = await POST(createRequest());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).success, true);
});

test("API route returns 503 when no delivery channel is configured", async () => {
  const response = await POST(createRequest());
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /not configured/i);
});

test("API route rejects a provider HTTP success without success true", async () => {
  process.env.WEB3FORMS_ACCESS_KEY = "test-access-key";
  globalThis.fetch = async () => Response.json({ success: false });

  const response = await POST(createRequest());
  assert.equal(response.status, 502);
  assert.match((await response.json()).error, /could not deliver/i);
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
