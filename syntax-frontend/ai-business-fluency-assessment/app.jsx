/* ============================================================
   AI Business Fluency Assessment - Syntax-styled rebuild
   Single-file React app, served via Babel-standalone.
   Questions, options, results copy are verbatim from
   https://www.scaler.com/ai-business-fluency-assessment
   Only the UI/visual system has changed.
   ============================================================ */

const { useState, useMemo } = React;

/* ---------- Inline icons (Lucide-style stroke 2) ---------- */
function Icon({ name, size = 20 }) {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor",
    strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
  };
  const paths = {
    arrow_right: <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
    arrow_left: <><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    sparkles: <><path d="m12 3-1.9 5.7a2 2 0 0 1-1.4 1.4L3 12l5.7 1.9a2 2 0 0 1 1.4 1.4L12 21l1.9-5.7a2 2 0 0 1 1.4-1.4L21 12l-5.7-1.9a2 2 0 0 1-1.4-1.4Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></>,
    briefcase: <><rect width="20" height="14" x="2" y="7" rx="0"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
    chart: <><path d="M3 3v18h18"/><path d="m7 14 4-4 4 4 5-5"/></>,
    code: <><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></>,
    layers: <><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.91a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    megaphone: <><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></>,
    book: <><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></>,
    graduation: <><path d="M22 10v6"/><path d="M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.7 3 3 6 3s6-1.3 6-3v-5"/></>,
    check: <path d="M20 6 9 17l-5-5"/>,
    lock: <><rect width="18" height="11" x="3" y="11" rx="0"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></>,
    share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></>,
    refresh: <><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

/* ============================================================
   TRACKING - mirrors the live page's /api/track + Google Sheet webhook
   so CRM, lead routing, and analytics keep working unchanged.
   ============================================================ */
const SHEET_WEBHOOK = "https://script.google.com/macros/s/AKfycbwWoIPtW0JbpmKFVv-QM7nafQtC_-zddafcNwoazpynvf9zCXWeNOdU0bLU9VxPFX7qUQ/exec";
const BACKEND_URL = "https://ai-fluency-backend-production.up.railway.app";

function _uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
function _ist() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const date = ist.toISOString().split("T")[0];
  const time = ist.toISOString().split("T")[1].split(".")[0];
  return { timestamp_ist: `${date} ${time}`, date_ist: date, time_ist: time };
}
function _utm() {
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source: p.get("utm_source") || "",
    utm_medium: p.get("utm_medium") || "",
    utm_campaign: p.get("utm_campaign") || "",
    utm_term: p.get("utm_term") || "",
    utm_content: p.get("utm_content") || "",
  };
}
function _trafficSource() {
  const ref = document.referrer || "";
  const utmSource = new URLSearchParams(window.location.search).get("utm_source") || "";
  if (utmSource) return utmSource;
  if (!ref) return "direct";
  if (ref.includes("google")) return "google";
  if (ref.includes("facebook") || ref.includes("fb.com") || ref.includes("instagram")) return "meta";
  if (ref.includes("linkedin")) return "linkedin";
  if (ref.includes("twitter") || ref.includes("x.com")) return "twitter";
  if (ref.includes("whatsapp") || ref.includes("wa.me")) return "whatsapp";
  if (ref.includes("t.me") || ref.includes("telegram")) return "telegram";
  if (ref.includes("youtube")) return "youtube";
  try { return new URL(ref).hostname; } catch (e) { return ref.substring(0, 50); }
}
const TRACK_STATE = { userId: _uuid(), name: "", email: "", phone: "" };
function setTrackingLead({ name, email, phone }) {
  TRACK_STATE.name = name || "";
  TRACK_STATE.email = email || "";
  TRACK_STATE.phone = phone || "";
}
function trackEvent(event, data = {}) {
  const payload = {
    user_id: TRACK_STATE.userId,
    event,
    ..._ist(),
    name: TRACK_STATE.name,
    email: TRACK_STATE.email,
    phone: TRACK_STATE.phone,
    referrer: document.referrer || "",
    traffic_source: _trafficSource(),
    ..._utm(),
    ...data,
  };
  try {
    fetch(SHEET_WEBHOOK, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch (e) {}
  try {
    fetch(BACKEND_URL + "/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch (e) {}
}

/* ---------- Scaler OTP auth (signup + verify) ---------- */
const TURNSTILE_SITEKEY = "0x4AAAAAAATOoPzNrSMFG9jp";
const SCALER_SIGNUP_URL = "/users/v2/";
const SCALER_VERIFY_URL = "/users/v2/verify";
const SCALER_CSRF_URL = "/csrf-token";

// Scaler's Rails backend requires X-CSRF-Token on POST /users/v2/ — without it
// the request is treated as a non-XHR form post and the backend responds with
// a Turbolinks.visit redirect instead of dispatching an OTP. Fetch once on
// boot, stash on a meta tag, and read back per request.
async function fetchAndStoreCsrfToken() {
  try {
    const res = await fetch(SCALER_CSRF_URL, {
      credentials: "same-origin",
      headers: {
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    if (!res.ok) {
      try { trackEvent("csrf_failed", { status: res.status, reason: "non_ok" }); } catch (_) {}
      return "";
    }
    const json = await res.json();
    const token = json && json.csrf_token;
    if (!token) {
      try { trackEvent("csrf_failed", { status: res.status, reason: "no_token" }); } catch (_) {}
      return "";
    }
    let meta = document.querySelector('meta[name="csrf-token"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "csrf-token";
      document.head.appendChild(meta);
    }
    meta.content = token;
    try { trackEvent("csrf_fetched"); } catch (_) {}
    return token;
  } catch (e) {
    try { trackEvent("csrf_failed", { status: 0, reason: "network" }); } catch (_) {}
    return "";
  }
}

function readCsrfToken() {
  const m = document.querySelector('meta[name="csrf-token"]');
  return (m && m.content) || "";
}

// Returns a JWT string if the user has an active scaler.com session, or "" if
// not. Same probe career-profile-tool uses on its standalone landing page.
async function generateJwtIfLoggedIn() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const csrf = readCsrfToken();
    const res = await fetch("/generate-jwt", {
      method: "POST",
      credentials: "include",
      redirect: "manual",
      headers: {
        "Content-Type": "text/plain",
        "X-Requested-With": "XMLHttpRequest",
        ...(csrf ? { "X-CSRF-Token": csrf } : {}),
      },
      body: JSON.stringify({}),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok || res.status !== 200) return "";
    const token = await res.text();
    return token && token.length > 0 ? token : "";
  } catch (_) {
    return "";
  }
}

// Fetches the logged-in user's profile via /api/v3/users. Returns null on any
// failure. Only call if generateJwtIfLoggedIn() returned a non-empty token.
async function fetchLoggedInUser(jwt) {
  try {
    const res = await fetch("/api/v3/users", {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-User-Token": jwt,
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const attrs = json && json.data && json.data.attributes;
    if (!attrs) return null;
    return {
      name: attrs.name || "",
      email: attrs.email || "",
      phone: (attrs.phone_number || attrs.phone || "").replace(/^\+?91[-\s]?/, "").replace(/\D/g, "").slice(-10),
      phoneVerified: Boolean(attrs.phone_verified),
      raw: attrs,
    };
  } catch (_) {
    return null;
  }
}

async function scalerAuthCall(url, payload) {
  let csrf = readCsrfToken();
  if (!csrf) csrf = await fetchAndStoreCsrfToken();
  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "X-Accept-Flash": "true",
  };
  if (csrf) headers["X-CSRF-Token"] = csrf;
  try {
    const res = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers,
      body: JSON.stringify(payload),
    });
    let json = null;
    try { json = await res.json(); } catch (_) {}
    return { ok: res.ok, status: res.status, json };
  } catch (e) {
    return { ok: false, status: 0, json: null };
  }
}

function TurnstileWidget({ onToken }) {
  const ref = React.useRef(null);
  const widgetIdRef = React.useRef(null);

  React.useEffect(() => {
    let cancelled = false;
    function tryRender() {
      if (cancelled) return;
      if (!window.turnstile || !ref.current) {
        setTimeout(tryRender, 150);
        return;
      }
      if (widgetIdRef.current !== null) return;
      widgetIdRef.current = window.turnstile.render(ref.current, {
        sitekey: TURNSTILE_SITEKEY,
        appearance: "interaction-only",
        callback: (t) => onToken(t),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    }
    tryRender();
    return () => {
      cancelled = true;
      if (window.turnstile && widgetIdRef.current !== null) {
        try { window.turnstile.remove(widgetIdRef.current); } catch (_) {}
      }
    };
  }, [onToken]);

  return <div ref={ref} className="turnstile-wrap" />;
}

/* ---------- Scaler sign-out ---------- */
const SCALER_SIGN_OUT_URL = "/users/sign_out";
async function scalerSignOut() {
  const csrf = readCsrfToken();
  try {
    await fetch(SCALER_SIGN_OUT_URL, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(csrf ? { "X-CSRF-Token": csrf } : {}),
      },
    });
  } catch (_) {}
}

/* ---------- User menu (logged-in pill + dropdown) ---------- */
function UserMenu({ user, onSignOut }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label = user.email || user.phone || user.name || "Account";
  const initial = (user.name || user.email || "U").trim().charAt(0).toUpperCase();

  return (
    <div className="usermenu" ref={rootRef}>
      <button
        type="button"
        className="usermenu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span className="usermenu__avatar" aria-hidden="true">{initial}</span>
        <span className="usermenu__label">
          <span className="usermenu__label-eyebrow">Signed in as</span>
          <span className="usermenu__label-value">{label}</span>
        </span>
        <svg className={"usermenu__chev" + (open ? " usermenu__chev--open" : "")} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div className="usermenu__panel" role="menu">
          <div className="usermenu__panel-head">
            {user.name && <div className="usermenu__panel-name">{user.name}</div>}
            {user.email && <div className="usermenu__panel-sub">{user.email}</div>}
            {user.phone && <div className="usermenu__panel-sub">+91 {user.phone}</div>}
          </div>
          <button type="button" className="usermenu__item usermenu__item--danger" role="menuitem" onClick={onSignOut}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Top bar ---------- */
function Bar({ user, onSignOut }) {
  return (
    <header className="bar">
      <div className="bar__logo">
        <img src="./assets/logo-colour.svg" alt="Scaler" />
      </div>
      <div className="bar__right">
        {user ? (
          <UserMenu user={user} onSignOut={onSignOut} />
        ) : (
          <span className="bar__pill">
            <span className="dot"></span>
            Free · 3 min
          </span>
        )}
      </div>
    </header>
  );
}

/* ---------- Footer ---------- */
function Foot() {
  return (
    <footer className="foot">
      <span>© 2026 InterviewBit Software Services LLP</span>
      <div>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Contact</a>
      </div>
    </footer>
  );
}

/* ============================================================
   STAGE 1 - LANDING (single-fold split)
   ============================================================ */
function Landing({ onVerified, initialValues, initialTurnstileToken }) {
  const [name, setName] = useState((initialValues && initialValues.name) || "");
  const [email, setEmail] = useState((initialValues && initialValues.email) || "");
  const [phone, setPhone] = useState((initialValues && initialValues.phone) || "");
  const [touched, setTouched] = useState({ name: false, email: false, phone: false });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(initialTurnstileToken || "");
  const [serverErr, setServerErr] = useState("");

  // OTP phase: "idle" → "sending" → "sent" → "verifying"
  const [otpPhase, setOtpPhase] = useState("idle");
  const [otpSentTo, setOtpSentTo] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [otpErr, setOtpErr] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const otpInputsRef = React.useRef([]);

  const nameValid = name.trim().length > 1;
  const emailValid = /\S+@\S+\.\S+/.test(email.trim());
  const phoneValid = phone.replace(/\D/g, "").length >= 10;
  const canRequestOtp = nameValid && emailValid && phoneValid && !!turnstileToken;
  const otpDigits = digits.join("");
  const otpComplete = /^\d{6}$/.test(otpDigits);
  const otpSent = otpPhase === "sent" || otpPhase === "verifying";

  const showNameErr = (touched.name || submitAttempted) && !nameValid;
  const showEmailErr = (touched.email || submitAttempted) && !emailValid;
  const showPhoneErr = (touched.phone || submitAttempted) && !phoneValid;

  const nameErrMsg = name.trim().length === 0 ? "Please enter your full name" : "Name must be at least 2 characters";
  const emailErrMsg = email.trim().length === 0 ? "Please enter your work email" : "Enter a valid email address";
  const phoneErrMsg = phone.trim().length === 0 ? "Please enter your phone number" : "Enter a valid 10-digit phone number";

  const cleanPhone = () => phone.replace(/\D/g, "").slice(-10);

  const sendOtp = async () => {
    setSubmitAttempted(true);
    setTouched({ name: true, email: true, phone: true });
    setServerErr("");
    if (!nameValid || !emailValid || !phoneValid) return;
    if (!turnstileToken) {
      setServerErr("Please complete the verification check below, then try again.");
      return;
    }
    setOtpPhase("sending");
    const cp = cleanPhone();
    const { ok, status, json } = await scalerAuthCall(SCALER_SIGNUP_URL, {
      user: {
        name: name.trim(),
        email: email.trim(),
        phone_number: "+91-" + cp,
        skip_existing_user_check: true,
      },
      "cf-turnstile-response": turnstileToken,
      type: "marketing",
    });
    if (!ok) {
      setOtpPhase("idle");
      const msg = (json && (json.flashError || json.message)) ||
        (status === 422 ? "Please check your details and try again." :
         status === 429 ? "Too many attempts. Please wait a few minutes." :
         "Could not send OTP. Please try again.");
      setServerErr(msg);
      return;
    }
    trackEvent("otp_sent");
    trackEvent("started");
    setOtpSentTo(cp);
    setOtpPhase("sent");
    setTimeout(() => { if (otpInputsRef.current[0]) otpInputsRef.current[0].focus(); }, 50);
  };

  const setDigit = (idx, v) => {
    const clean = v.replace(/\D/g, "").slice(0, 1);
    const next = digits.slice();
    next[idx] = clean;
    setDigits(next);
    if (clean && idx < 5 && otpInputsRef.current[idx + 1]) otpInputsRef.current[idx + 1].focus();
  };
  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) otpInputsRef.current[idx - 1].focus();
  };
  const handleOtpPaste = (e) => {
    const txt = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "");
    if (!txt) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < 6 && i < txt.length; i++) next[i] = txt[i];
    setDigits(next);
    const focusIdx = Math.min(txt.length, 5);
    if (otpInputsRef.current[focusIdx]) otpInputsRef.current[focusIdx].focus();
  };

  const verifyAndStart = async () => {
    setOtpErr("");
    if (!otpComplete) { setOtpErr("Enter the 6-digit code we sent to your phone."); return; }
    setOtpPhase("verifying");
    const { ok, status, json } = await scalerAuthCall(SCALER_VERIFY_URL, {
      user: {
        phone_number: "+91-" + otpSentTo,
        otp: otpDigits,
        email: email.trim(),
        type: "marketing",
        skip_existing_user_check: true,
      },
    });
    if (!ok) {
      setOtpPhase("sent");
      const msg = (json && (json.flashError || json.message)) ||
        (status === 422 ? "Invalid OTP. Please try again." :
         status === 406 ? "OTP expired. Please resend a new code." :
         "Verification failed. Please try again.");
      trackEvent("otp_failed", { status });
      setOtpErr(msg);
      return;
    }
    trackEvent("otp_verified");
    onVerified({ name: name.trim(), email: email.trim(), phone: otpSentTo, turnstileToken });
  };

  const resendOtp = async () => {
    if (resending) return;
    setResending(true);
    setResendMsg("Sending...");
    setOtpErr("");
    const { ok } = await scalerAuthCall(SCALER_SIGNUP_URL, {
      user: {
        name: name.trim(),
        email: email.trim(),
        phone_number: "+91-" + otpSentTo,
        skip_existing_user_check: true,
      },
      "cf-turnstile-response": turnstileToken,
      type: "marketing",
    });
    setResendMsg(ok ? "OTP sent" : "Failed, try again");
    setTimeout(() => { setResending(false); setResendMsg(""); }, 30000);
  };

  const changeNumber = () => {
    setOtpPhase("idle");
    setOtpSentTo("");
    setDigits(["", "", "", "", "", ""]);
    setOtpErr("");
    setResendMsg("");
  };

  return (
    <section className="land">
      {/* LEFT - dark navy */}
      <div className="land-l">
        <div className="land-l__brand">
          <img src="./assets/logo-white.svg" alt="Scaler" />
          <span className="land-l__brand-divider"></span>
          <span className="land-l__brand-sub">AI Fluency</span>
        </div>

        <div className="land-l__main">
          <div className="land-l__eyebrow">Free · Takes 3 minutes</div>
          <h1 className="land-l__title">Your AI Fluency Report</h1>
          <p className="land-l__sub">
            Find out exactly where you stand with AI - tailored to your role,
            your workflows, and the tools you should be using.
          </p>
          <div className="land-l__mobile-eyebrow">Why it matters</div>

          <div className="land-l__stats">
            <div className="land-l__stat">
              <div className="land-l__stat__n">2.5×</div>
              <div className="land-l__stat__l">average career growth for AI-fluent professionals</div>
            </div>
            <div className="land-l__stat">
              <div className="land-l__stat__n">73%</div>
              <div className="land-l__stat__l">of business roles now require AI fluency</div>
            </div>
            <div className="land-l__stat">
              <div className="land-l__stat__n">12 mo</div>
              <div className="land-l__stat__l">before the gap becomes uncatchable</div>
            </div>
          </div>

          <div className="land-l__checks">
            <div className="land-l__check">
              <span className="land-l__check__icon"><Icon name="check" size={12} /></span>
              Skill Gap Assessment
            </div>
            <div className="land-l__check">
              <span className="land-l__check__icon"><Icon name="check" size={12} /></span>
              Personalized AI Roadmap
            </div>
            <div className="land-l__check">
              <span className="land-l__check__icon"><Icon name="check" size={12} /></span>
              Curriculum Match Score
            </div>
            <div className="land-l__check">
              <span className="land-l__check__icon"><Icon name="check" size={12} /></span>
              Career Transition Path
            </div>
          </div>
        </div>

        <div></div>
      </div>

      {/* RIGHT - white form */}
      <div className="land-r">
        <div className="land-r__card">
          {/* Mobile-only header - establishes what this tool is before the form */}
          <div className="land-r__mhead">
            <div className="land-r__mhead__eyebrow">Free · Takes 3 minutes</div>
            <h1 className="land-r__mhead__title">Your AI Fluency Report</h1>
            <p className="land-r__mhead__sub">
              Find out exactly where you stand with AI - tailored to your role,
              workflows, and the tools you should be using.
            </p>
          </div>

          <div className="land-r__icon"><Icon name="users" size={22} /></div>
          <h2 className="land-r__title">Start Your Assessment</h2>
          <p className="land-r__sub">Takes 3 minutes. Results are instant.</p>

          <div className="field">
            <label className="field__label">Full name <span className="field__req">*</span></label>
            <input
              className={"field__input" + (showNameErr ? " field__input--err" : "")}
              placeholder="Anil Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, name: true }))}
              required
              aria-invalid={showNameErr}
            />
            {showNameErr && <div className="field__err">{nameErrMsg}</div>}
          </div>
          <div className="field">
            <label className="field__label">Work email <span className="field__req">*</span></label>
            <input
              className={"field__input" + (showEmailErr ? " field__input--err" : "")}
              type="email"
              placeholder="anil@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, email: true }))}
              required
              aria-invalid={showEmailErr}
            />
            {showEmailErr && <div className="field__err">{emailErrMsg}</div>}
          </div>
          <div className="field">
            <label className="field__label">Phone number <span className="field__req">*</span></label>
            <div className="field__phone field__phone--with-action">
              <input className="field__input" value="+91" readOnly />
              <input
                className={"field__input" + (showPhoneErr ? " field__input--err" : "")}
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                inputMode="numeric"
                required
                aria-invalid={showPhoneErr}
                disabled={otpSent}
                readOnly={otpSent}
              />
              <button
                type="button"
                className={"btn btn--otp" + (otpSent ? " btn--otp-sent" : "")}
                onClick={otpSent ? changeNumber : sendOtp}
                disabled={otpPhase === "sending" || (!otpSent && !canRequestOtp)}
                aria-disabled={otpPhase === "sending" || (!otpSent && !canRequestOtp)}
              >
                {otpPhase === "sending" ? "Sending..." :
                 otpSent ? "Change" :
                 "Get OTP"}
              </button>
            </div>
            {showPhoneErr && <div className="field__err">{phoneErrMsg}</div>}
          </div>

          {otpSent && (
            <div className="field field--otp">
              <label className="field__label">
                Enter OTP <span className="field__req">*</span>
              </label>
              <div className="otp-row" onPaste={handleOtpPaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpInputsRef.current[i] = el)}
                    className="otp-cell"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    aria-label={`OTP digit ${i + 1}`}
                  />
                ))}
              </div>
              {otpErr && <div className="field__err">{otpErr}</div>}
              <div className="otp-meta">
                <span>Didn't get it? </span>
                <a onClick={resendOtp} className={resending ? "otp-link otp-link--disabled" : "otp-link"}>Resend OTP</a>
                {resendMsg && <span className="otp-meta__status"> — {resendMsg}</span>}
              </div>
            </div>
          )}

          <TurnstileWidget onToken={setTurnstileToken} />
          {serverErr && <div className="field__err" style={{ marginTop: 4 }}>{serverErr}</div>}

          <button
            className="btn btn--primary btn--lg btn--block land-r__cta"
            onClick={verifyAndStart}
            aria-disabled={!otpSent || !otpComplete || otpPhase === "verifying"}
            disabled={!otpSent || !otpComplete || otpPhase === "verifying"}
          >
            {otpPhase === "verifying" ? "Verifying..." : "Start Assessment"}
            <Icon name="arrow_right" size={16} />
          </button>

          <div className="land-r__trust">
            <Icon name="lock" size={12} />
            By continuing you agree to receive an OTP. Your data is secure and never shared.
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   STAGE 2 - ROLE SELECTION (verbatim from live site)
   ============================================================ */
const ROLES = [
  { id: "product",   name: "Product Manager",                        desc: "Building products, defining roadmaps", icon: "layers" },
  { id: "consult",   name: "Business / Strategy Consultant",         desc: "Advising clients, driving strategy",   icon: "book" },
  { id: "ops",       name: "Operations / Supply Chain Manager",      desc: "Optimizing processes, managing logistics", icon: "briefcase" },
  { id: "marketing", name: "Marketing / Growth Manager",             desc: "Running campaigns, driving growth",    icon: "megaphone" },
  { id: "tech",      name: "Tech Professional transitioning to Business", desc: "Moving from code to commerce",    icon: "code" },
  { id: "founder",   name: "Founder / Entrepreneur",                 desc: "Building a company from scratch",      icon: "sparkles" },
  { id: "finance",   name: "Finance / Commercial Manager",           desc: "Managing money, driving deals",        icon: "chart" },
];

function RoleSelect({ onBack, onContinue }) {
  const [selected, setSelected] = useState(null);
  return (
    <section className="role">
      <div className="role__inner">
        <div className="role__eyebrow">Step 1 of 2</div>
        <h2 className="role__title">What do you do?</h2>
        <p className="role__sub">
          Select the role closest to your current job. We'll tailor the questions to
          the workflows you live in every day.
        </p>

        <div className="role__grid">
          {ROLES.map((r) => (
            <button
              key={r.id}
              className={"role-card" + (selected === r.id ? " is-selected" : "")}
              onClick={() => setSelected(r.id)}
              aria-pressed={selected === r.id}
            >
              <span className="role-card__icon"><Icon name={r.icon} size={28} /></span>
              <span className="role-card__body">
                <span className="role-card__name">{r.name}</span>
                <span className="role-card__desc">{r.desc}</span>
              </span>
              <span className="role-card__chev" aria-hidden="true">
                {selected === r.id ? <Icon name="check" size={16} /> : <Icon name="arrow_right" size={16} />}
              </span>
            </button>
          ))}
        </div>

        <div className={"role__footer" + (selected ? " is-active" : "")}>
          <button className="btn btn--ghost" onClick={onBack}>
            <Icon name="arrow_left" size={16} />
            Back
          </button>
          <button
            className="btn btn--primary btn--lg"
            disabled={!selected}
            onClick={() => onContinue(selected)}
          >
            Begin assessment
            <Icon name="arrow_right" size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   STAGE 3 - QUESTIONS (verbatim from live PM flow)
   Each question has a title and 5 Level descriptions.
   ============================================================ */
const QUESTIONS_PM = [
  {
    title: "AI-assisted PRD & spec writing",
    levels: [
      "Level 1 - You write PRDs manually in Google Docs. AI hasn't entered your spec workflow.",
      "Level 2 - You've used ChatGPT to brainstorm feature ideas or clean up PRD language. You copy-paste and edit.",
      "Level 3 - You have a go-to prompt that generates PRD sections - problem statement, user stories, success metrics, edge cases. You iterate with the model until the spec is tight. Your PRDs come out 2x faster.",
      "Level 4 - You've built a PRD template as a system prompt. You feed it customer research, ticket data, and competitive context - and it generates a first draft that your engineering team actually reviews seriously. You use AI to stress-test your own specs by asking \"what will break?\"",
      "Level 5 - Your team's spec process runs through AI. New PMs on your team use your prompt templates. You've integrated spec generation into your workflow tools (Notion AI, Linear, etc.) and the output quality is indistinguishable from a senior PM's manual work.",
    ],
  },
  {
    title: "Using AI agents for product research & discovery",
    levels: [
      "Level 1 - You Google for competitor info and manually read through reviews, forums, and reports.",
      "Level 2 - You've asked ChatGPT or Perplexity to summarize a competitor's product page or a market report.",
      "Level 3 - You run structured research sessions - you prompt AI with specific research briefs (\"Analyze the onboarding flows of these 5 competitors and identify the 3 biggest UX gaps\"). You use Perplexity for real-time data and Claude for synthesis.",
      "Level 4 - You've built a research workflow: competitive monitoring prompts you run weekly, customer feedback synthesis pipelines (app reviews → themes → opportunities), and you combine multiple AI tools to triangulate insights.",
      "Level 5 - You've built or spec'd an AI-powered research system for your product team. Agents auto-monitor competitor changelogs, synthesize NPS verbatims, and surface opportunity areas. You've moved from \"I use AI to research\" to \"AI runs our research layer.\"",
    ],
  },
  {
    title: "Prompt engineering for product workflows",
    levels: [
      "Level 1 - You type natural language into ChatGPT and take whatever comes out.",
      "Level 2 - You've learned to add context - \"You are a senior PM at a B2B SaaS company\" - and you get noticeably better outputs.",
      "Level 3 - You write structured prompts with role, context, constraints, and output format. You test variations. You've written 10+ prompts you reuse regularly - for user story generation, bug triage summaries, release notes, and stakeholder updates.",
      "Level 4 - You design prompt chains - discovery prompt → PRD prompt → edge case finder → test case generator. You anticipate hallucination risks and add guardrails (\"Only cite data from the attached document\"). Your team uses your prompts.",
      "Level 5 - You've built a prompt playbook for your PM org. You understand when to use system prompts vs. few-shot examples vs. chain-of-thought. You've debugged enough prompts to predict which design choices matter for product work. You shape how your org interacts with LLMs.",
    ],
  },
  {
    title: "AI for user data analysis & product metrics",
    levels: [
      "Level 1 - You look at dashboards someone else built. You maybe pull basic numbers from Amplitude or Mixpanel.",
      "Level 2 - You've asked AI to explain a metric trend or write a SQL query for you.",
      "Level 3 - You regularly use AI to write SQL, analyze funnel data, build cohort analyses, and identify patterns in user behavior. You paste data into Claude and get actionable insights in minutes instead of waiting for the analytics team.",
      "Level 4 - You've built an analytics workflow where AI handles the heavy lifting - you feed it raw event data, retention tables, or survey responses, and it produces structured analyses with recommendations. You validate AI outputs against your product intuition and business logic.",
      "Level 5 - You've built or spec'd AI-powered analytics features into your product. Your team uses AI to run automated cohort analyses, churn prediction models, or feature adoption scoring. You've moved analytics from \"pull request to data team\" to \"self-serve with AI guardrails.\"",
    ],
  },
  {
    title: "Building & speccing AI-powered features",
    levels: [
      "Level 1 - You haven't been involved in defining or shipping AI features.",
      "Level 2 - You've seen AI features in other products and have opinions, but haven't written specs for one.",
      "Level 3 - You've written a PRD for an AI-powered feature - defined the user problem, the AI's role, success metrics, and edge cases. You understand that AI features need evaluation criteria, not just acceptance criteria.",
      "Level 4 - You actively collaborate with ML/AI engineers on feature design. You define fallback behavior, confidence thresholds, human-in-the-loop flows, and feedback loops. You've shipped at least one AI feature and learned from its failure modes.",
      "Level 5 - You lead AI product strategy at your company. You evaluate build vs. buy vs. fine-tune decisions. You've designed evaluation frameworks for AI features (accuracy, latency, cost, user trust). Your AI features have measurable business impact and you can articulate exactly why each design choice was made.",
    ],
  },
  {
    title: "AI agents: from basic automation to orchestrated systems",
    levels: [
      "Level 1 - You've heard of AI agents but haven't used or built one.",
      "Level 2 - You've tried a basic agent - maybe a GPT with custom instructions, or a simple Zapier AI workflow.",
      "Level 3 - You've built or spec'd an agent that handles a real task end-to-end: a customer support triage agent, a bug classification bot, or a research assistant that pulls data from multiple sources. It works, but it's brittle.",
      "Level 4 - Your agents are robust - they handle errors, have fallback paths, and you've tested them against edge cases. You chain agents together (Agent A's output feeds Agent B). You understand tool-use, function calling, and context window management.",
      "Level 5 - You've built an integrated agent system - a multi-agent workflow where specialized agents collaborate. You've designed the orchestration layer, defined agent boundaries, and measured system-level performance. You're the person your org comes to for \"how should we use agents for X?\"",
    ],
  },
  {
    title: "AI for stakeholder communication & alignment",
    levels: [
      "Level 1 - You write all your stakeholder emails, updates, and presentations manually.",
      "Level 2 - You've used AI to draft a status update or clean up a presentation.",
      "Level 3 - You use AI to generate weekly product updates, executive summaries, and board-ready narratives from raw data. You edit for voice and accuracy, but AI does the first 80%.",
      "Level 4 - You've built communication templates - AI generates your sprint reviews from Jira data, your monthly business reviews from metrics dashboards, and your strategy narratives from research docs. Your stakeholders don't know (or care) that AI helped.",
      "Level 5 - You've systematized product communication with AI. New PMs on your team use your templates. You've built workflows where AI translates technical updates into business language, customizes messaging for different audiences (eng vs. exec vs. customer), and maintains a consistent product narrative.",
    ],
  },
  {
    title: "AI-powered user feedback synthesis",
    levels: [
      "Level 1 - You read user feedback manually - support tickets, NPS comments, app reviews - one by one.",
      "Level 2 - You've pasted a batch of feedback into ChatGPT and asked for themes.",
      "Level 3 - You run structured feedback analysis - you prompt AI with your product context and taxonomy, feed it hundreds of reviews or tickets, and get a prioritized list of themes with supporting quotes. You do this monthly.",
      "Level 4 - You've built a feedback pipeline: raw data (Intercom, Zendesk, app reviews, Gong calls) → AI-powered theme extraction → opportunity scoring → prioritization input for your roadmap. It runs with minimal manual effort.",
      "Level 5 - You've productized feedback synthesis for your org. PMs, designers, and CS teams use the system you built. It auto-surfaces emerging issues, tracks sentiment trends over time, and connects user pain to revenue impact. Your roadmap decisions are visibly data-backed because of this system.",
    ],
  },
  {
    title: "Personal AI productivity system",
    levels: [
      "Level 1 - You open ChatGPT occasionally when you're stuck on something.",
      "Level 2 - You use 1–2 AI tools regularly - maybe ChatGPT for writing and Perplexity for research.",
      "Level 3 - You have a personal AI stack - specific tools for specific tasks. Claude for deep analysis, Perplexity for research, Notion AI for docs, Granola or Otter for meetings. You save 5+ hours/week.",
      "Level 4 - You've built a personal productivity OS. AI handles your meeting prep (auto-generates briefs from past notes + agenda), your writing (first drafts of everything from emails to strategy docs), and your research (competitive monitoring, market analysis). You've measured the time savings.",
      "Level 5 - You've built an integrated system - your personal AI workflow feeds your product work seamlessly. Meeting notes auto-generate action items that create Jira tickets. Research auto-populates your competitive dashboard. Your productivity system is something other PMs ask you about and try to replicate.",
    ],
  },
  {
    title: "Leading AI adoption in your product org",
    levels: [
      "Level 1 - You use AI individually. Your team doesn't have shared AI practices.",
      "Level 2 - You've shared an AI tip or tool recommendation in a team Slack channel.",
      "Level 3 - You've piloted an AI tool for your team - maybe an AI-powered user research tool, a Copilot setup, or an AI writing assistant. You got at least 3 teammates to adopt it.",
      "Level 4 - You've led AI adoption for your product team - defined which tools to use for what, created prompt templates, run training sessions, and measured adoption metrics. Your team is measurably more productive.",
      "Level 5 - You drive AI strategy for your product org. You've defined the AI toolkit policy, created an internal AI playbook, and built a culture where AI-assisted work is the default. You present AI productivity gains to leadership and influence org-wide AI adoption.",
    ],
  },
];

// Slug → JSON file. Question and result JSON live in /data and are loaded via fetch.
const ROLE_SLUG = {
  product:   "product",
  consult:   "consult",
  ops:       "ops",
  marketing: "marketing",
  tech:      "tech",
  founder:   "founder",
  finance:   "finance",
};

const _roleDataCache = {};
async function loadRoleData(role) {
  const slug = ROLE_SLUG[role] || "product";
  if (_roleDataCache[slug]) return _roleDataCache[slug];
  const [qs, res, hiring] = await Promise.all([
    fetch(`./data/questions_${slug}.json`).then(r => r.json()),
    fetch(`./data/results_${slug}.json`).then(r => r.json()),
    fetch(`./data/hiring_${slug}.json`).then(r => r.ok ? r.json() : []).catch(() => []),
  ]);
  _roleDataCache[slug] = { questions: qs, result: res, hiring };
  return _roleDataCache[slug];
}

function getHiringForRole(role) {
  const slug = ROLE_SLUG[role] || "product";
  return _roleDataCache[slug]?.hiring || [];
}

// Synchronous fallback for first render (PM, embedded above).
function getQuestionsForRole(role) {
  const slug = ROLE_SLUG[role] || "product";
  return _roleDataCache[slug]?.questions || QUESTIONS_PM;
}

// Map each question title to a short skill label used in the results table.
const SKILL_SHORT = {
  "AI-assisted PRD & spec writing":                          "Spec writing",
  "Using AI agents for product research & discovery":        "Discovery",
  "Prompt engineering for product workflows":                "Prompting",
  "AI for user data analysis & product metrics":             "Analytics",
  "Building & speccing AI-powered features":                 "AI features",
  "AI agents: from basic automation to orchestrated systems":"Agents",
  "AI for stakeholder communication & alignment":            "Stakeholder comms",
  "AI-powered user feedback synthesis":                      "Feedback synth",
  "Personal AI productivity system":                          "Productivity",
  "Leading AI adoption in your product org":                  "Adoption",
};

function splitLevel(text) {
  // "Level 3 - body…" → { head: "Level 3 - ", body: "body…" }
  const m = text.match(/^(Level\s+\d+\s+-\s+)([\s\S]+)$/);
  if (!m) return { head: "", body: text };
  return { head: m[1], body: m[2] };
}

function Quiz({ role, onBack, onComplete }) {
  const QUESTIONS = useMemo(() => getQuestionsForRole(role), [role]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const total = QUESTIONS.length;
  const q = QUESTIONS[idx];
  const selected = answers[idx];

  const next = () => {
    if (idx < total - 1) setIdx(idx + 1);
    else onComplete({ answers, questions: QUESTIONS });
  };
  const back = () => {
    if (idx > 0) setIdx(idx - 1);
    else onBack();
  };

  return (
    <section className="quiz">
      <div className="quiz__inner">
        <div className="quiz__progress">
          <div className="quiz__progress__label">Skill {idx + 1} of {total}</div>
          <div className="quiz__progress__track">
            <div className="quiz__progress__fill" style={{ width: `${((idx + (selected != null ? 1 : 0)) / total) * 100}%` }} />
          </div>
          <div className="quiz__progress__count">{String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>
        </div>

        <h3 className="quiz__question">{q.title}</h3>
        <p className="quiz__sub">Select the level that best describes where you are today.</p>

        <div className="quiz__options">
          {q.levels.map((opt, i) => {
            const { head, body } = splitLevel(opt);
            return (
              <button
                key={i}
                className={"opt" + (selected === i ? " is-selected" : "")}
                onClick={() => {
                  setAnswers({ ...answers, [idx]: i });
                  const optPayload = {
                    question_number: idx + 1,
                    question_name: q.title,
                    answer_level: i + 1,
                    answer_text: opt,
                  };
                  q.levels.forEach((lv, li) => {
                    optPayload[`option_${li + 1}`] = lv;
                  });
                  trackEvent("question_answered", optPayload);
                }}
              >
                <span className="opt__badge">{i + 1}</span>
                <span className="opt__text">
                  {head && <strong>{head}</strong>}
                  {body}
                </span>
              </button>
            );
          })}
        </div>

        <div className="quiz__footer">
          <button className="btn btn--ghost" onClick={back}>
            <Icon name="arrow_left" size={16} />
            {idx === 0 ? "Back to roles" : "Previous"}
          </button>
          <button
            className="btn btn--primary btn--lg"
            disabled={selected == null}
            onClick={next}
          >
            {idx === total - 1 ? "See my report" : "Next"}
            <Icon name="arrow_right" size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   STAGE 4 - RESULTS
   Live mapping: 1pt per Level (1–5). 10 questions → 10–50 total.
   Bands: AI Curious / AI Aware / AI Capable / AI Leader.
   ============================================================ */
const RESULT_PM = {
  currentRole: "Product Manager",
  targetRole: "AI-First Product Leader",
  transitionSkills: [
    { name: "AI-First Spec Writing",          desc: "Generate PRDs, user stories & edge cases with prompt chains in Claude" },
    { name: "AI Agent Design for Products",   desc: "Build multi-agent systems with tool-use, orchestration & fallback paths" },
    { name: "AI-Powered User Research",       desc: "Auto-synthesize NPS, reviews & Gong calls into roadmap-ready insights" },
    { name: "Prompt Playbook Engineering",    desc: "Build reusable prompt libraries your entire PM team runs on" },
    { name: "AI Feature Evaluation",          desc: "Define confidence thresholds, hallucination guardrails & human-in-the-loop flows" },
    { name: "AI Analytics Pipelines",         desc: "SQL generation → cohort analysis → churn prediction without the data team" },
    { name: "AI Competitive Intelligence",    desc: "Weekly auto-monitoring of competitor changelogs, pricing & feature launches" },
    { name: "AI Stakeholder Automation",      desc: "Sprint reviews, exec summaries & board narratives auto-generated from data" },
    { name: "AI Productivity OS",             desc: "Meeting prep → action items → Jira tickets - fully AI-orchestrated" },
    { name: "AI Adoption Leadership",         desc: "Team training, tool policy, prompt playbooks & measurable productivity gains" },
  ],
};

function getResultDataForRole(role) {
  const slug = ROLE_SLUG[role] || "product";
  return _roleDataCache[slug]?.result || RESULT_PM;
}

function computeScore(answers, questions) {
  let total = 0;
  questions.forEach((_, idx) => {
    const ans = answers[idx];
    total += ans == null ? 0 : ans + 1; // 0→1, 1→2, … 4→5
  });
  return total;
}

// Bands match the live page (data/bands.json).
const BANDS = [
  { min: 10, max: 18, name: "AI Curious", desc: "Right now, AI is changing how every industry works - and you haven't started using it yet. That's not a criticism, it's a fact. The people in your role who figure this out in the next 12 months will pull ahead. The ones who don't will struggle to stay relevant. The good news? You don't need to become a coder. You need the right framework." },
  { min: 19, max: 28, name: "AI Aware",   desc: "You've started using AI, which puts you ahead of many. But there's a big difference between using ChatGPT once a week and actually transforming how you work. Right now, you're scratching the surface. Professionals who go deeper - who learn to build workflows, automate decisions, and lead with AI - will be the ones who get promoted, hired, and trusted with bigger roles." },
  { min: 29, max: 38, name: "AI Capable", desc: "You're already better at AI than most people in your role. That's the good news. The not-so-good news? Everyone is catching up fast. The gap between 'good with AI' and 'irreplaceable because of AI' is exactly where career acceleration happens. You need peers at your level and structured challenges to push further." },
  { min: 39, max: 50, name: "AI Leader",  desc: "You're in the top tier. Most people in your role aren't close to where you are. But here's what separates leaders from legends: scaling your impact beyond yourself. Building systems, training teams, driving org-wide change. That's the next level - and it's hard to do alone." },
];
function band(score) {
  return BANDS.find(b => score >= b.min && score <= b.max) || BANDS[0];
}

function Result({ role, lead, answers, questions, onRestart }) {
  const total = useMemo(() => computeScore(answers, questions), [answers, questions]);
  const b = band(total);
  const data = getResultDataForRole(role);
  const hiring = getHiringForRole(role);
  const [showCallback, setShowCallback] = useState(false);

  const onCallback = () => {
    trackEvent("requested_callback");
    setShowCallback(true);
  };
  const onShare = () => {
    const text = `I scored ${total}/50 on the Scaler AI Fluency Assessment - ${b.name}. Take yours at scaler.com/ai-business-fluency-assessment`;
    if (navigator.share) {
      navigator.share({ title: "My AI Fluency Score", text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => alert("Score copied to clipboard!"))
        .catch(() => alert(text));
    } else {
      alert(text);
    }
  };
  const onDownload = () => {
    window.print();
  };

  const skills = questions.map((q, idx) => ({
    full: q.title,
    name: SKILL_SHORT[q.title] || q.title,
    score: answers[idx] == null ? 0 : answers[idx] + 1,
  }));
  const strong = skills.filter((s) => s.score >= 4).slice(0, 4);
  const gaps   = skills.filter((s) => s.score <= 2).slice(0, 4);

  const labelFor = (score) => {
    if (score >= 5) return { text: "Strong",  cls: "skill-row__band--strong" };
    if (score >= 4) return { text: "Solid",   cls: "skill-row__band--strong" };
    if (score >= 3) return { text: "Mid",     cls: "" };
    return                 { text: "Gap",     cls: "skill-row__band--gap" };
  };

  const firstName = (lead?.name || "").trim().split(/\s+/)[0] || "there";

  return (
    <section className="result">
      <div className="result__hero">
        <img src="./assets/gradients/star-16-outline.svg" alt="" className="result__hero__star" />
        <div className="result__hero__inner">
          <div>
            <div className="result__hero__eyebrow">Your AI Fluency Score</div>
            <h2 className="result__hero__title">Here's where you stand, {firstName}.</h2>
            <p className="result__hero__sub">
              Based on how you handle 10 real {data.currentRole.toLowerCase()} workflows.
              The score is out of 50. The gap is what the next 12 months will demand of you.
            </p>
          </div>
          <div className="result__score">
            <div className="result__score__label">Score</div>
            <div className="result__score__num">
              {total}<em>/50</em>
            </div>
            <div className="result__score__band">{b.name}</div>
          </div>
        </div>
      </div>

      <div className="result__body">
        <div className="result__sect">
          <div className="result__sect__head">
            <div className="result__sect__eyebrow">What this means</div>
            <h3 className="result__sect__title">You're at the {b.name} stage.</h3>
          </div>
          <div className="meaning">
            <div className="meaning__cell meaning__cell--prose">
              <p className="meaning__prose">{b.desc}</p>
            </div>
            <div className="meaning__cell">
              <div className="meaning__label">Where you're ahead</div>
              <ul className="meaning__strengths">
                {(strong.length ? strong : skills.slice(0, 3)).map((s) => (
                  <li key={s.full}>{s.name}</li>
                ))}
              </ul>
              <div className="meaning__label" style={{ marginTop: "20px" }}>Where the gap is</div>
              <ul className="meaning__gaps">
                {(gaps.length ? gaps : skills.slice(-3)).map((s) => (
                  <li key={s.full}>{s.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="result__sect">
          <div className="result__sect__head">
            <div className="result__sect__eyebrow">Your skill breakdown</div>
            <h3 className="result__sect__title">Ten skills, scored out of five.</h3>
          </div>
          <div className="skill-table">
            <div className="skill-table__head">
              <div>#</div>
              <div>Skill</div>
              <div>Level</div>
              <div style={{ textAlign: "right" }}>Score</div>
              <div style={{ textAlign: "right" }}>Band</div>
            </div>
            {skills.map((s, i) => {
              const lab = labelFor(s.score);
              return (
                <div className="skill-row" key={s.full}>
                  <div className="skill-row__idx">{String(i + 1).padStart(2, "0")}</div>
                  <div className="skill-row__name" title={s.full}>{s.name}</div>
                  <div className="skill-row__bar">
                    <div className="skill-row__bar__fill" style={{ width: `${(s.score / 5) * 100}%` }} />
                  </div>
                  <div className="skill-row__score">{s.score} / 5</div>
                  <div className={"skill-row__band " + lab.cls}>{lab.text}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="result__sect">
          <div className="result__sect__head">
            <div className="result__sect__eyebrow">Where you are → where you could be</div>
            <h3 className="result__sect__title">
              {data.currentRole} <span className="path__arrow">→</span> {data.targetRole}
            </h3>
            <p className="result__sect__sub">To make this transition, you need these skills:</p>
          </div>
          <div className="path-grid">
            {data.transitionSkills.map((s) => (
              <div className="path-card" key={s.name}>
                <div className="path-card__name">{s.name}</div>
                <div className="path-card__desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {hiring.length > 0 && (
          <div className="result__sect">
            <div className="result__sect__head">
              <div className="result__sect__eyebrow">What this unlocks for you</div>
              <h3 className="result__sect__title">These are the roles you become hireable for.</h3>
              <p className="result__sect__sub">
                Live openings at top companies - the exact skills they're paying for are the ones
                you'll build. Click any card to see the full JD.
              </p>
            </div>
            <div className="hire-grid">
              {hiring.map((h) => (
                <a
                  className="hire-card"
                  key={h.company + h.role}
                  href={h.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="hire-card__head">
                    <img
                      className="hire-card__logo"
                      src={h.logo || `https://www.google.com/s2/favicons?sz=128&domain=${h.domain}`}
                      alt=""
                      onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                    />
                    <div className="hire-card__company">{h.company}</div>
                  </div>
                  <div className="hire-card__role">{h.role}</div>
                  <div className="hire-card__loc">{h.location}</div>
                  <ul className="hire-card__asks">
                    {h.asks.map((a, i) => (<li key={i}>{a}</li>))}
                  </ul>
                  <div className="hire-card__foot">
                    <span className="hire-card__foot__label">You'll learn this with us:</span>
                    <span className="hire-card__chips">
                      {h.covered.map((c) => (
                        <span className="hire-chip" key={c}>{c}</span>
                      ))}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="match">
          <div className="match__num-block">
            <div className="match__num">
              95<span className="match__num__suffix">%</span>
            </div>
            <div className="match__num__caption">
              of these skills are covered in the Scaler Online PGP in Business &amp; AI curriculum.
            </div>
          </div>
          <div className="match__body-block">
            <div className="match__eyebrow">Where to close the gap</div>
            <h3 className="match__title">Scaler Online PGP in Business &amp; AI</h3>
            <p className="match__body">
              A 12-month program built for working professionals - live sessions,
              hands-on projects, and real-world case studies - taught by practitioners
              from the companies setting the bar.
            </p>
            <div className="match__cta-prompt">Want to know more?</div>
            <div className="match__buttons">
              <button className="btn btn--primary btn--lg" onClick={onCallback}>
                Request a callback
                <Icon name="arrow_right" size={16} />
              </button>
              <button
                className="btn btn--outline btn--lg"
                style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}
                onClick={() => {
                  trackEvent("clicked_curriculum");
                  window.open("https://www.scaler.com/online-pgp-in-business-and-ai", "_blank");
                }}
              >
                Explore the full curriculum
              </button>
            </div>
          </div>
        </div>

        <div className="actions">
          <div>
            <h3 className="actions__title">What's next</h3>
            <p className="actions__sub">
              Save your report, share it with your team, or retake the assessment in 90 days
              to track how far you've moved.
            </p>
          </div>
          <div className="actions__buttons">
            <button className="btn btn--ghost btn--lg btn--block" onClick={onDownload}>
              <Icon name="download" size={16} />
              Download report
            </button>
            <button className="btn btn--ghost btn--lg btn--block" onClick={onShare}>
              <Icon name="share" size={16} />
              Share your score
            </button>
            <button className="btn btn--ghost btn--lg btn--block" onClick={onRestart}>
              <Icon name="refresh" size={16} />
              Retake assessment
            </button>
          </div>
        </div>
      </div>

      {/* Sticky callback CTA */}
      <div className="result__sticky-cta">
        <button className="btn btn--primary btn--lg btn--block" onClick={onCallback}>
          Request a Callback
          <Icon name="arrow_right" size={16} />
        </button>
      </div>

      {showCallback && (
        <div className="cb-modal" onClick={(e) => { if (e.target.classList.contains("cb-modal")) setShowCallback(false); }}>
          <div className="cb-modal__card">
            <div className="cb-modal__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <div className="cb-modal__title">We'll reach out shortly!</div>
            <div className="cb-modal__body">
              A Scaler program advisor will call you{lead && lead.phone ? <> at <strong>+91 {lead.phone}</strong></> : ""} within 24 hours to help you plan your AI learning path.
            </div>
            <button className="btn btn--primary" onClick={() => setShowCallback(false)}>Got it</button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ============================================================
   APP
   ============================================================ */
function App() {
  const [stage, setStage] = useState("bootstrap"); // bootstrap | landing | otp | role | quiz | result
  const [lead, setLead] = useState(null);
  const [sessionUser, setSessionUser] = useState(null); // populated only when scaler.com session is active
  const [turnstileToken, setTurnstileTokenState] = useState("");
  const [role, setRole] = useState(null);
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);

  const handleSignOut = async () => {
    trackEvent("signed_out");
    await scalerSignOut();
    window.location.reload();
  };

  React.useEffect(() => {
    trackEvent("page_loaded");
    let cancelled = false;
    (async () => {
      // CSRF first — required by /generate-jwt and by the OTP signup POST.
      await fetchAndStoreCsrfToken();
      if (cancelled) return;

      // Probe for an existing scaler.com session. Fail-safe: any error here
      // falls through to the landing form, preserving the original flow.
      const jwt = await generateJwtIfLoggedIn();
      if (cancelled) return;

      if (jwt) {
        const user = await fetchLoggedInUser(jwt);
        if (cancelled) return;
        if (user) setSessionUser(user);
        if (user && user.phoneVerified && user.phone) {
          // Skip landing + OTP entirely. Hydrate identity and jump to role.
          const hydrated = { name: user.name, email: user.email, phone: user.phone };
          setLead(hydrated);
          setTrackingLead(hydrated);
          trackEvent("session_resumed", { phone_verified: true });
          trackEvent("started");
          setStage("role");
          return;
        }
        // Logged in but no verified phone — still treat as anonymous so the
        // OTP step runs. Pre-fill what we know.
        if (user) {
          const partial = { name: user.name, email: user.email, phone: user.phone };
          setLead(partial);
          setTrackingLead(partial);
          trackEvent("session_resumed", { phone_verified: false });
        }
      }
      setStage("landing");
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="page">
      <div className={(stage === "landing" || stage === "bootstrap") ? "bar-wrap bar-wrap--landing" : "bar-wrap"}>
        <Bar user={sessionUser} onSignOut={handleSignOut} />
      </div>

      {stage === "bootstrap" && (
        <div className="bootstrap-screen">
          <div className="bootstrap-spinner" aria-label="Loading" />
          <div className="bootstrap-text">Setting up your assessment…</div>
        </div>
      )}

      {stage === "landing" && (
        <Landing
          initialValues={lead}
          initialTurnstileToken={turnstileToken}
          onVerified={(l) => {
            const leadOnly = { name: l.name, email: l.email, phone: l.phone };
            setLead(leadOnly);
            setTurnstileTokenState(l.turnstileToken || "");
            setTrackingLead(leadOnly);
            setStage("role");
          }}
        />
      )}
      {stage === "role" && (
        <RoleSelect
          onBack={() => setStage("landing")}
          onContinue={async (r) => {
            setRole(r);
            trackEvent("role_selected", { role: r });
            await loadRoleData(r);
            setStage("quiz");
          }}
        />
      )}
      {stage === "quiz" && (
        <Quiz
          role={role}
          onBack={() => setStage("role")}
          onComplete={({ answers: a, questions: qs }) => {
            setAnswers(a);
            setQuestions(qs);
            // Build completed payload mirroring live page (skill_N_name + skill_N_level + score + band)
            let total = 0;
            qs.forEach((_, idx) => { total += a[idx] == null ? 0 : a[idx] + 1; });
            const b = band(total);
            const payload = { score: total, band: b.name };
            qs.forEach((q, i) => {
              payload[`skill_${i + 1}_name`]  = q.title;
              payload[`skill_${i + 1}_level`] = a[i] == null ? 0 : a[i] + 1;
            });
            trackEvent("completed", payload);
            setStage("result");
            window.scrollTo(0, 0);
          }}
        />
      )}
      {stage === "result" && (
        <Result
          role={role}
          lead={lead}
          answers={answers}
          questions={questions}
          onRestart={() => {
            trackEvent("retook_test");
            setAnswers({});
            setStage("role");
            window.scrollTo(0, 0);
          }}
        />
      )}

      <Foot />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
