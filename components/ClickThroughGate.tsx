import { type ReactNode, useEffect, useState } from "react";
import { LicenseText } from "./LicenseText";

const STORAGE_KEY = "signhost-sdk-license-accepted";

interface Acceptance {
  accepted: boolean;
  timestamp: string;
}

function getAcceptance(): Acceptance | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.accepted === true && typeof parsed.timestamp === "string") {
      return parsed as Acceptance;
    }
  } catch {
    // Corrupted or unavailable localStorage
  }
  return null;
}

export const ClickThroughGate = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const [acceptance, setAcceptance] = useState<Acceptance | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAcceptance(getAcceptance());
    setMounted(true);
  }, []);

  const handleAccept = () => {
    const record: Acceptance = {
      accepted: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    setAcceptance(record);
    setChecked(false);
  };

  // Avoid hydration mismatch — render nothing until client-side mount
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
          <span>
            You accepted the SDK License Agreement on {date}.
          </span>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div>
      <div style={styles.licenseContainer}>
        <LicenseText />
      </div>
      <label style={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          style={styles.checkbox}
        />
        I have read and agree to the SDK License Agreement
      </label>
      <div>
        <button
          type="button"
          disabled={!checked}
          onClick={handleAccept}
          style={{
            ...styles.acceptButton,
            ...(checked ? {} : styles.acceptButtonDisabled),
          }}
        >
          Accept and continue
        </button>
      </div>
    </div>
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
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
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
};
