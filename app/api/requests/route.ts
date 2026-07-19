import { getDb } from "../../../db/index.ts";
import { sourcingRequests } from "../../../db/schema.ts";
import { requestSchema } from "../../request-schema.ts";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

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

  const database = getDb();
  if (!database) {
    return Response.json(
      { error: "Database service is currently unconfigured. Submissions are unavailable." },
      { status: 503 }
    );
  }

  const data = parsed.data;
  try {
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
    return Response.json({ success: true, message: "Your request has been successfully submitted." });
  } catch (error) {
    console.error("Request database delivery failed", error);
    return Response.json(
      { error: "We could not save your request. Please try again shortly." },
      { status: 502 }
    );
  }
}
