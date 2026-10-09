
import React from "react";
import { Cpu, Sliders, Database, Shield } from "lucide-react";

const RiskIndicator = ({ signals }) => {
  if (!signals) return null;

  const channels = [
    { key: "ai_generation", label: "AI Generation Signal", icon: Cpu },
    { key: "manipulation", label: "Manipulation / Splicing", icon: Sliders },
    { key: "metadata", label: "Metadata Inconsistency", icon: Database },
    { key: "provenance", label: "Provenance Verification", icon: Shield },
  ];

  const getStatus = (signal) => {
    const summary = String(signal?.summary || "").toLowerCase();

    if (!signal || summary.includes("no trained ai detector ran")) {
      return "unavailable";
    }

    if (summary.includes("no validated manipulation model ran")) {
      return "unavailable";
    }

    if (
      summary.includes("not an ai-detection score") ||
      summary.includes("not verified")
    ) {
      return "informational";
    }

    return "available";
  };

  const getColor = (score) => {
    if (score >= 0.7) return "#ef4444";
    if (score >= 0.45) return "#f59e0b";
    return "#10b981";
  };

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
          Signal Breakdown
        </h3>
        <span className="badge badge-neutral">4 Forensic Vectors</span>
      </div>

      {channels.map(({ key, label, icon: Icon }) => {
        const signal = signals[key];
        const status = getStatus(signal);
        const score = Number(signal?.score);
        const validScore = Number.isFinite(score)
          ? Math.max(0, Math.min(1, score))
          : null;

        const showScore = status === "available" && validScore !== null;
        const percent = showScore ? Math.round(validScore * 100) : null;
        const color = showScore ? getColor(validScore) : "#94a3b8";

        return (
          <div
            key={key}
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon size={16} color="#94a3b8" />
                <span style={{ fontWeight: 600 }}>{label}</span>
              </div>

              <span style={{ color, fontWeight: 700 }}>
                {showScore
                  ? `${percent}%`
                  : status === "informational"
                    ? "Informational"
                    : "N/A"}
              </span>
            </div>

            <div
              style={{
                height: "8px",
                background: "rgba(255,255,255,0.06)",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${percent ?? 0}%`,
                  height: "100%",
                  background: color,
                  transition: "width 0.5s ease",
                }}
              />
            </div>

            {signal?.summary && (
              <p
                style={{
                  margin: 0,
                  color: "#94a3b8",
                  fontSize: "0.8rem",
                  lineHeight: 1.5,
                }}
              >
                {signal.summary}
              </p>
            )}
          </div>
        );
      })}

      <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.5 }}>
        N/A means a reliable score is unavailable. A low score does not prove
        that a file is authentic.
      </p>
    </div>
  );
};

export default RiskIndicator;
