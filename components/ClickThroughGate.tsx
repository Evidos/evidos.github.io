import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { LICENSE_VERSION, LicenseText } from "./LicenseText";

const STORAGE_KEY = "signhost-sdk-license-accepted";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "";
const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE || "";
const AIRTABLE_PAT = process.env.AIRTABLE_PAT || "";
// reCAPTCHA site keys are public by design (embedded in client-side JS); no need to keep this a secret
const RECAPTCHA_SITE_KEY = "6Leeq7MtAAAAAP9ZrHhyJz-OvhlKnL5qjcorHFu2";
const RECAPTCHA_SCRIPT_SRC = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string },
      ) => Promise<string>;
    };
  }
}

interface Acceptance {
  accepted: boolean;
  timestamp: string;
  licenseVersion: string;
}

function getAcceptance(): Acceptance | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed?.accepted === true &&
      typeof parsed.timestamp === "string" &&
      typeof parsed.licenseVersion === "string"
    ) {
      return parsed as Acceptance;
    }
  } catch {
    // Corrupted or unavailable localStorage
  }
  return null;
}

function loadRecaptchaScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.grecaptcha) {
      resolve();
      return;
    }
    const existing = document.querySelector(
      `script[src="${RECAPTCHA_SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("script")));
      return;
    }
    const script = document.createElement("script");
    script.src = RECAPTCHA_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("script"));
    document.head.appendChild(script);
  });
}

async function getRecaptchaToken(): Promise<string> {
  await loadRecaptchaScript();
  return new Promise((resolve, reject) => {
    if (!window.grecaptcha) {
      reject(new Error("grecaptcha unavailable"));
      return;
    }
    window.grecaptcha.ready(() => {
      window.grecaptcha
        ?.execute(RECAPTCHA_SITE_KEY, { action: "sdk_license_accept" })
        .then(resolve, reject);
    });
  });
}

// Only unlocks on a confirmed write â€” this is the durable record, localStorage is just UX memory
async function submitAcceptance(fields: {
  name: string;
  email: string;
  account: string;
  honeypot: string;
}): Promise<void> {
  const recaptchaToken = await getRecaptchaToken();

  const response = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_PAT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Name: fields.name,
          Email: fields.email,
          Account: fields.account,
          "Client Timestamp": new Date().toISOString(),
          "License Version": LICENSE_VERSION,
          Event: "accept_click",
          "Page URL": window.location.href,
          "User Agent": navigator.userAgent,
          Honeypot: fields.honeypot,
          "Recaptcha Token": recaptchaToken,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Airtable write failed: ${response.status}`);
  }
}

export const ClickThroughGate = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const [acceptance, setAcceptance] = useState<Acceptance | null>(null);
  const [checked, setChecked] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [account, setAccount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAcceptance(getAcceptance());
    const params = new URLSearchParams(window.location.search);
    setAccount(params.get("account") || "");
    setMounted(true);
  }, []);

  const canSubmit =
    checked &&
    name.trim() !== "" &&
    account.trim() !== "" &&
    EMAIL_PATTERN.test(email);

  const handleAccept = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    try {
      await submitAcceptance({
        name: name.trim(),
        email: email.trim(),
        account: account.trim(),
        honeypot: honeypotRef.current?.value || "",
      });
      const record: Acceptance = {
        accepted: true,
        timestamp: new Date().toISOString(),
        licenseVersion: LICENSE_VERSION,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
      setAcceptance(record);
    } catch {
      setError(
        "We couldn't record your acceptance. Please check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Avoid hydration mismatch â€” render nothing until client-side mount
  if (!mounted) return null;

  if (acceptance) {
    const date = new Date(acceptance.timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <div>
        <div style={styles.acceptedBanner}>
          <span>You accepted the SDK License Agreement on {date}.</span>
        </div>
        {children}
      </div>
    );
  }

  return (
    <form onSubmit={handleAccept}>
      <div style={styles.licenseContainer}>
        <LicenseText />
      </div>

      <div style={styles.field}>
        <label style={styles.fieldLabel} htmlFor="license-name">
          Name
        </label>
        <input
          id="license-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.fieldLabel} htmlFor="license-email">
          Work email
        </label>
        <input
          id="license-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.fieldLabel} htmlFor="license-account">
          Company
        </label>
        <input
          id="license-account"
          type="text"
          required
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          style={styles.input}
        />
      </div>

      {/* Honeypot: hidden from sighted users, left blank by real visitors */}
      <input
        ref={honeypotRef}
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={styles.honeypot}
      />

      <label style={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          style={styles.checkbox}
        />
        I have read and agree to the SDK License Agreement
      </label>

      {error && <div style={styles.errorBanner}>{error}</div>}

      <div>
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          style={{
            ...styles.acceptButton,
            ...(canSubmit && !submitting ? {} : styles.acceptButtonDisabled),
          }}
        >
          {submitting ? "Recording acceptance..." : "Accept and continue"}
        </button>
      </div>
    </form>
  );
};

const styles: Record<string, React.CSSProperties> = {
  licenseContainer: {
    maxHeight: "400px",
    overflowY: "auto",
    border: "1px solid var(--rp-c-divider)",
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "20px",
    backgroundColor: "var(--rp-c-bg-soft)",
    fontSize: "14px",
    lineHeight: "1.6",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "12px",
  },
  fieldLabel: {
    fontSize: "13px",
    fontWeight: 500,
  },
  input: {
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid var(--rp-c-divider)",
    borderRadius: "6px",
    backgroundColor: "var(--rp-c-bg)",
    color: "inherit",
  },
  honeypot: {
    position: "absolute",
    left: "-9999px",
    width: "1px",
    height: "1px",
    opacity: 0,
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "16px 0",
    fontSize: "15px",
    fontWeight: 500,
    cursor: "pointer",
    userSelect: "none",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    accentColor: "var(--rp-c-brand)",
    cursor: "pointer",
  },
  acceptButton: {
    padding: "10px 28px",
    fontSize: "15px",
    fontWeight: 600,
    color: "#fff",
    backgroundColor: "var(--rp-c-brand)",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  acceptButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  acceptedBanner: {
    padding: "12px 16px",
    marginBottom: "24px",
    borderRadius: "8px",
    backgroundColor: "var(--rp-c-bg-soft)",
    border: "1px solid var(--rp-c-divider-light)",
    fontSize: "14px",
    color: "var(--rp-c-text-2)",
  },
  errorBanner: {
    padding: "12px 16px",
    marginBottom: "16px",
    borderRadius: "8px",
    backgroundColor: "var(--rp-c-bg-soft)",
    border: "1px solid #d33",
    fontSize: "14px",
    color: "#d33",
  },
};
