/* Contact form endpoint. Runs server-side only: the Resend key is read from
   the environment here and is never sent to the browser.

   Required environment variables (see .env.example):
     RESEND_API_KEY   — server-only secret, no NEXT_PUBLIC_ prefix
     CONTACT_TO_EMAIL — inbox that receives the messages
     CONTACT_FROM     — verified sender, e.g. "Portfolio <onboarding@resend.dev>"

   RESEND_API_URL is optional and only overrides the provider endpoint for
   local testing. Leave it unset in production.
*/

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMITS = { name: 120, email: 200, subject: 160, message: 5000 };
const RESEND_ENDPOINT =
  process.env.RESEND_API_URL || "https://api.resend.com/emails";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Same rules as the client, re-checked here because the client can be bypassed. */
function validate(body) {
  const clean = {};
  const errors = {};

  for (const key of ["name", "email", "subject", "message"]) {
    const raw = typeof body?.[key] === "string" ? body[key].trim() : "";
    if (raw.length > LIMITS[key]) {
      errors[key] = true;
      continue;
    }
    clean[key] = raw;
  }

  if (!clean.name || clean.name.length < 2) errors.name = true;
  if (!EMAIL_RE.test(clean.email || "")) errors.email = true;
  if (!clean.subject || clean.subject.length < 2) errors.subject = true;
  if (!clean.message || clean.message.length < 10) errors.message = true;

  return { clean, errors, ok: Object.keys(errors).length === 0 };
}

/* Plain text only — nothing the sender types is interpolated into HTML. */
function compose({ name, email, subject, message }) {
  return `${message}\n\n—\nFrom: ${name}\nEmail: ${email}\nSubject: ${subject}\nSent from the portfolio contact form.`;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, message: "That request could not be read. Please try again." },
      { status: 400 }
    );
  }

  const { clean, errors, ok } = validate(body);
  if (!ok) {
    return Response.json(
      { ok: false, errors, message: "Please check the highlighted fields." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM || "Portfolio <onboarding@resend.dev>";

  /* Not configured yet (typical in local dev): fail cleanly with a useful
     message instead of throwing, so the page keeps working. */
  if (!apiKey || !to) {
    console.warn(
      "[contact] RESEND_API_KEY or CONTACT_TO_EMAIL is not set — message not sent."
    );
    return Response.json(
      {
        ok: false,
        message:
          "The message service isn't configured yet. Please email me directly in the meantime.",
      },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: clean.email,
        subject: `Portfolio — ${clean.subject}`,
        text: compose(clean),
      }),
    });

    if (!res.ok) {
      /* Log the provider's reason for the server console only. */
      const detail = await res.text().catch(() => "");
      console.error("[contact] Resend rejected the request:", res.status, detail);
      return Response.json(
        {
          ok: false,
          message:
            "The message couldn't be sent just now. Please try again, or email me directly.",
        },
        { status: 502 }
      );
    }

    /* Resend replies with the queued message id. Surfacing it makes a real
       send verifiable from outside; it is an opaque id, not a credential. */
    const payload = await res.json().catch(() => ({}));
    const id = payload?.id || null;
    if (!id) {
      console.warn("[contact] Resend returned 2xx but no message id:", payload);
    } else {
      console.log("[contact] Resend accepted the message, id:", id);
    }

    return Response.json({ ok: true, id });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return Response.json(
      {
        ok: false,
        message:
          "The message couldn't be sent just now. Please try again, or email me directly.",
      },
      { status: 500 }
    );
  }
}
