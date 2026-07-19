import { getDb } from "../../../db/index.ts";
import { sourcingRequests } from "../../../db/schema.ts";
import { requestSchema } from "../../request-schema.ts";

// Simple in-memory token bucket rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = 5; // 5 requests per 1 minute
  const windowMs = 60 * 1000;

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting
    const ip = request.headers.get("x-forwarded-for") || (request as any).ip || "unknown";
    if (!checkRateLimit(ip)) {
      return Response.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }

    // 2. Parse Body and Honey Pot Check
    const body = await request.json();
    if (body.website && body.website !== "") {
      // Honeypot triggered: silently reject
      return Response.json({ success: true, message: "Request received" });
    }

    // 3. Zod Validation
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return Response.json(
        { error: "Validation failed", fields: fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 4. DB Persistence Check
    const db = getDb();
    if (!db) {
      return Response.json(
        { error: "Database service is currently unconfigured. Submissions are unavailable." },
        { status: 503 }
      );
    }

    // Save to Postgres Database
    await db.insert(sourcingRequests).values({
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

    // 5. Forward to Web3Forms
    const web3formsAccessKey = process.env.WEB3FORMS_ACCESS_KEY || "46ef64cd-1715-4819-9dc0-761fed231a57";
    const web3formsPayload = {
      access_key: web3formsAccessKey,
      subject: `New ELSEWHERE Sourcing Request: ${data.request}`,
      from_name: "ELSEWHERE Sourcing Form",
      ...data,
    };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(web3formsPayload),
      });

      if (!response.ok) {
        console.error("Web3Forms forward failed", await response.text());
      }
    } catch (error) {
      console.error("Failed to forward to Web3Forms", error);
      // We do not fail the request if Web3Forms fails but DB succeeds, to align with
      // "Email failure must not destroy a stored request."
    }

    return Response.json({ success: true, message: "Your request has been successfully submitted." });
  } catch (error: any) {
    console.error("POST /api/requests error", error);
    return Response.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
