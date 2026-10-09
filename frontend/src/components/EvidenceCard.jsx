
import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldAlert,
} from "lucide-react";

const severityConfig = {
  high: {
    label: "High",
    color: "#f87171",
    background: "rgba(248, 113, 113, 0.10)",
    icon: ShieldAlert,
    meaning: "A strong indicator was reported and deserves review.",
  },
  medium: {
    label: "Medium",
    color: "#fbbf24",
    background: "rgba(251, 191, 36, 0.10)",
    icon: AlertTriangle,
    meaning: "A possible concern was reported; further checking is needed.",
  },
  low: {
    label: "Low",
    color: "#60a5fa",
    background: "rgba(96, 165, 250, 0.10)",
    icon: Info,
    meaning: "A weak indicator was reported and may have an ordinary explanation.",
  },
  informational: {
    label: "Informational",
    color: "#34d399",
    background: "rgba(52, 211, 153, 0.08)",
    icon: Info,
    meaning: "This is an observation, not proof that the file is fake.",
  },
};

function getSeverity(severity) {
  const key = String(severity || "Informational").toLowerCase();
  return severityConfig[key] || severityConfig.informational;
}

function explainCategory(category) {
  const value = String(category || "").toLowerCase();

  if (value.includes("ai generation")) {
    return (
      "This finding relates to a possible AI-generation signal. " +
      "A single heuristic cannot reliably confirm that an image was " +
      "created by AI."
    );
  }

  if (value.includes("manipulation")) {
    return (
      "This finding relates to a possible edit or alteration. " +
      "Compression, resizing, filters and normal editing can also " +
      "produce similar signals."
    );
  }

  if (value.includes("metadata")) {
    return (
      "This finding concerns information stored alongside the file. " +
      "Metadata can be missing or changed during normal sharing and export."
    );
  }

  if (value.includes("provenance")) {
    return (
      "This finding concerns the file's origin or Content Credentials. " +
      "A marker is not the same as a successfully verified digital signature."
    );
  }

  return (
    "This is an observation produced by the analysis pipeline. " +
    "Its significance depends on the detection method and supporting evidence."
  );
}

const EvidenceCard = ({ evidence = {}, index = 0 }) => {
  const [expanded, setExpanded] = useState(false);

  const title = evidence.title || `Forensic finding ${index + 1}`;
  const category = evidence.category || "General analysis";
  const description =
    evidence.description || "No additional description was provided.";

  const severity = getSeverity(evidence.severity);
  const SeverityIcon = severity.icon;

  const technicalDetails = evidence.technical_details;

  return (
    <article
      style={{
        border: "1px solid var(--border-subtle, #263247)",
        borderRadius: "12px",
        padding: "18px",
        background: "var(--bg-surface, #101a2d)",
        color: "var(--text-primary, #f1f5f9)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: "12px", minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: "9px",
              background: severity.background,
              color: severity.color,
            }}
          >
            <SeverityIcon size={19} />
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                color: "var(--text-secondary, #aab5c5)",
                fontSize: "0.75rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                overflowWrap: "anywhere",
              }}
            >
              Evidence #{index + 1} · {category}
            </div>

            <h3
              style={{
                margin: "6px 0 0",
                fontSize: "1rem",
                lineHeight: 1.5,
                overflowWrap: "anywhere",
              }}
            >
              {title}
            </h3>
          </div>
        </div>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "5px 10px",
            borderRadius: "999px",
            background: severity.background,
            color: severity.color,
            border: `1px solid ${severity.color}55`,
            fontSize: "0.78rem",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {severity.label} severity
        </span>
      </div>

      <p
        style={{
          margin: "14px 0",
          color: "var(--text-secondary, #c0cad8)",
          lineHeight: 1.7,
          overflowWrap: "anywhere",
        }}
      >
        {description}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "9px",
          padding: "12px",
          borderRadius: "8px",
          background: severity.background,
          marginBottom: "14px",
        }}
      >
        <Info
          size={17}
          color={severity.color}
          style={{ flexShrink: 0, marginTop: "2px" }}
        />

        <div>
          <strong style={{ fontSize: "0.85rem" }}>
            What this finding means
          </strong>

          <p
            style={{
              margin: "5px 0 0",
              fontSize: "0.86rem",
              lineHeight: 1.6,
              color: "var(--text-secondary, #c0cad8)",
            }}
          >
            {explainCategory(category)} {severity.meaning}
          </p>
        </div>
      </div>

      {technicalDetails !== undefined &&
        technicalDetails !== null &&
        technicalDetails !== "" && (
          <div>
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              aria-expanded={expanded}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "6px 0",
                border: "none",
                background: "transparent",
                color: "#60a5fa",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              {expanded ? (
                <>
                  <ChevronUp size={16} />
                  Hide technical details
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  View technical details
                </>
              )}
            </button>

            {expanded && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "12px",
                  borderRadius: "8px",
                  background: "rgba(148, 163, 184, 0.08)",
                  fontSize: "0.86rem",
                  lineHeight: 1.7,
                  overflowWrap: "anywhere",
                  whiteSpace: "pre-wrap",
                }}
              >
                {typeof technicalDetails === "string"
                  ? technicalDetails
                  : JSON.stringify(technicalDetails, null, 2)}
              </div>
            )}
          </div>
        )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          marginTop: "14px",
          paddingTop: "12px",
          borderTop: "1px solid var(--border-subtle, #263247)",
          color: "var(--text-secondary, #aab5c5)",
          fontSize: "0.8rem",
        }}
      >
        <CheckCircle size={15} />
        <span>
          Finding recorded · Not an independent authenticity verdict
        </span>
      </div>
    </article>
  );
};

export default EvidenceCard;
