import { getDb } from "../../../db/index.ts";
import { sourcingRequests } from "../../../db/schema.ts";
import { requestSchema, type RequestPayload } from "../../request-schema.ts";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

type DeliveryResult = {
  channel: "database" | "web3forms";
  configured: boolean;
  succeeded: boolean;
};

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = 5;
  const windowMs = 60 * 1000;
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= limit) return false;

  record.count += 1;
  return true;
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip") || "unknown";
}

function isHoneypotSubmission(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const website = (body as Record<string, unknown>).website;
  return typeof website === "string" && website !== "";
}

function providerAccepted(body: unknown): boolean {
  return Boolean(body && typeof body === "object" && (body as { success?: unknown }).success === true);
}

async function persistRequest(data: RequestPayload): Promise<DeliveryResult> {
  try {
    const database = getDb();
    if (!database) return { channel: "database", configured: false, succeeded: false };

    await database.insert(sourcingRequests).values({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      location: data.location,
      contactPreference: data.contactPreference,
      category: data.category,
      request: data.request,
      reference: data.reference || null,
      details: data.details || null,
      status: "pending",
    });
    return { channel: "database", configured: true, succeeded: true };
  } catch (error) {
    console.error("Request database delivery failed", error);
    return { channel: "database", configured: true, succeeded: false };
  }
}

async function forwardToWeb3Forms(data: RequestPayload): Promise<DeliveryResult> {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY?.trim();
  if (!accessKey) return { channel: "web3forms", configured: false, succeeded: false };

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `New ELSEWHERE Sourcing Request: ${data.request}`,
        from_name: "ELSEWHERE Sourcing Form",
        ...data,
      }),
      signal: AbortSignal.timeout(8_000),
    });
    const responseBody: unknown = await response.json().catch(() => null);
    const succeeded = response.ok && providerAccepted(responseBody);
    if (!succeeded) console.error("Web3Forms delivery rejected", { status: response.status });
    return { channel: "web3forms", configured: true, succeeded };
  } catch (error) {
    console.error("Web3Forms delivery failed", error);
    return { channel: "web3forms", configured: true, succeeded: false };
  }
}

function deliveryResponse(results: DeliveryResult[]): Response {
  if (!results.some((result) => result.configured)) {
    return Response.json(
      { error: "Submission service is not configured. Please contact us directly." },
      { status: 503 }
    );
  }
  if (!results.some((result) => result.succeeded)) {
    return Response.json(
      { error: "We could not deliver your request. Please try again shortly." },
      { status: 502 }
    );
  }
  return Response.json({ success: true, message: "Your request has been successfully submitted." });
}

export async function POST(request: Request) {
  if (!checkRateLimit(getClientIp(request))) {
    return Response.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  if (isHoneypotSubmission(body)) {
    return Response.json({ success: true, message: "Request received" });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const results = await Promise.all([persistRequest(parsed.data), forwardToWeb3Forms(parsed.data)]);
  return deliveryResponse(results);
}
