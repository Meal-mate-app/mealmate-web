"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body style={{ background: "#080706", color: "#f2ece0", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <h2 style={{ fontSize: 24, marginBottom: 12 }}>Щось пішло не так</h2>
          <p style={{ color: "#9e9283", marginBottom: 24 }}>Виникла несподівана помилка. Спробуйте ще раз.</p>
          <button
            onClick={reset}
            style={{ background: "linear-gradient(135deg, #b8922e, #d4a843)", color: "#0a0908", border: "none", padding: "12px 32px", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Спробувати ще раз
          </button>
        </div>
      </body>
    </html>
  );
}
