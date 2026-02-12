const ALLOWED_ORIGINS = [
  "https://605designs.com",
  "https://www.605designs.com",
  "https://bluecrane.pro",
  "https://www.bluecrane.pro",
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return handleCORS(origin);
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405, origin);
    }

    let formType;
    if (url.pathname === "/submit/consulting") {
      formType = "consulting";
    } else if (url.pathname === "/submit/service") {
      formType = "service";
    } else {
      return jsonResponse({ error: "Not found" }, 404, origin);
    }

    if (!ALLOWED_ORIGINS.includes(origin)) {
      return jsonResponse({ error: "Origin not allowed" }, 403, origin);
    }

    // Rate limiting
    const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";
    const { success: withinLimit } = await env.FORM_RATE_LIMITER.limit({
      key: clientIP,
    });
    if (!withinLimit) {
      return jsonResponse(
        { error: "Too many submissions. Please try again later." },
        429,
        origin
      );
    }

    // Parse form data
    let formData;
    try {
      formData = await request.formData();
    } catch {
      return jsonResponse({ error: "Invalid form data" }, 400, origin);
    }

    // Honeypot check
    const honeypot = formData.get("website");
    if (honeypot) {
      return jsonResponse(
        { success: true, message: "Thank you for your inquiry!" },
        200,
        origin
      );
    }

    // Turnstile verification
    const turnstileToken = formData.get("cf-turnstile-response");
    if (!turnstileToken) {
      return jsonResponse(
        { error: "CAPTCHA verification required." },
        400,
        origin
      );
    }

    const turnstileOk = await verifyTurnstile(
      turnstileToken,
      clientIP,
      env.TURNSTILE_SECRET_KEY
    );
    if (!turnstileOk) {
      return jsonResponse(
        { error: "CAPTCHA verification failed." },
        400,
        origin
      );
    }

    // Extract and validate fields
    const submission = extractFields(formData, formType);
    if (!submission.name || !submission.email) {
      return jsonResponse(
        { error: "Name and email are required." },
        400,
        origin
      );
    }

    // Store in KV
    const submissionId = `${formType}_${Date.now()}_${crypto.randomUUID()}`;
    const submissionData = {
      id: submissionId,
      formType,
      ...submission,
      ip: clientIP,
      timestamp: new Date().toISOString(),
    };

    ctx.waitUntil(
      env.FORM_SUBMISSIONS.put(submissionId, JSON.stringify(submissionData), {
        expirationTtl: 60 * 60 * 24 * 90,
      })
    );

    // Send email via Resend
    ctx.waitUntil(sendEmail(env.RESEND_API_KEY, submissionData));

    return jsonResponse(
      {
        success: true,
        message:
          "Thank you for your inquiry! We will be in touch within 1-2 business days.",
      },
      200,
      origin
    );
  },
};

async function verifyTurnstile(token, ip, secretKey) {
  const resp = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: ip,
      }),
    }
  );
  const result = await resp.json();
  return result.success === true;
}

function extractFields(formData, formType) {
  const fields = {
    name: formData.get("name")?.trim() || "",
    email: formData.get("email")?.trim() || "",
    phone: formData.get("phone")?.trim() || "",
    contact_method: formData.get("contact_method") || "",
    help: formData.getAll("help[]"),
    details: formData.get("details")?.trim() || "",
  };

  if (formType === "consulting") {
    fields.stage = formData.get("stage") || "";
    fields.funded = formData.get("funded") || "";
  }

  return fields;
}

async function sendEmail(apiKey, data) {
  const helpList = (data.help || []).join(", ") || "None selected";
  const typeLabel =
    data.formType === "consulting" ? "Consulting" : "Service";

  let body = `New ${typeLabel} inquiry received:\n\n`;
  body += `Name: ${data.name}\n`;
  body += `Email: ${data.email}\n`;
  body += `Phone: ${data.phone || "Not provided"}\n`;
  body += `Preferred Contact: ${data.contact_method || "Not specified"}\n`;
  body += `Areas of Interest: ${helpList}\n`;

  if (data.formType === "consulting") {
    body += `Project Stage: ${data.stage || "Not specified"}\n`;
    body += `Fully Funded: ${data.funded || "Not specified"}\n`;
  }

  body += `\nDetails:\n${data.details || "No additional details provided."}\n`;
  body += `\n---\nSubmission ID: ${data.id}\n`;
  body += `Submitted: ${data.timestamp}\n`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Blue Crane Forms <forms@bluecrane.pro>",
      to: ["chad@bluecrane.pro"],
      subject: `New ${typeLabel} Inquiry from ${data.name}`,
      text: body,
    }),
  });
}

function handleCORS(origin) {
  const headers = corsHeaders(origin);
  headers.set("Content-Length", "0");
  return new Response(null, { status: 204, headers });
}

function corsHeaders(origin) {
  const headers = new Headers();
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Max-Age", "86400");
  return headers;
}

function jsonResponse(data, status, origin) {
  const headers = corsHeaders(origin);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), { status, headers });
}
