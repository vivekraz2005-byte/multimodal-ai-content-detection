
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Database,
  Download,
  FileText,
  History,
  Lightbulb,
  Loader2,
  PlusCircle,
  Printer,
  RefreshCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Share2,
} from "lucide-react";

import ResultCard from "../components/ResultCard";
import ConfidenceMeter from "../components/ConfidenceMeter";
import RiskIndicator from "../components/RiskIndicator";
import EvidenceCard from "../components/EvidenceCard";
import MetadataPanel from "../components/MetadataPanel";
import ProvenancePanel from "../components/ProvenancePanel";
import { api } from "../services/api";

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    width: "100%",
    minWidth: 0,
  },
  card: {
    padding: "22px",
    borderRadius: "14px",
    border: "1px solid var(--border-subtle, #263247)",
    background: "var(--bg-surface, #101a2d)",
    color: "var(--text-primary, #f1f5f9)",
    minWidth: 0,
  },
  muted: {
    color: "var(--text-secondary, #aab5c5)",
    lineHeight: 1.7,
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
  },
};

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
}

function formatBytes(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  if (value < 1024) return `${value} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`;

  return `${(value / 1024 ** 2).toFixed(2)} MB`;
}

function getScoreDescription(score) {
  if (typeof score !== "number" || !Number.isFinite(score)) {
    return "Not available";
  }

  return `${Math.round(Math.max(0, Math.min(1, score)) * 100)}%`;
}

function getAssessmentInfo(assessment) {
  const value = String(assessment || "Inconclusive").toLowerCase();

  if (value.includes("ai-generated") || value.includes("ai generated")) {
    return {
      title: "AI-generation indicators detected",
      description:
        "The analysis flagged AI-generation indicators. This is a screening result, not definitive proof.",
      color: "#f59e0b",
      icon: ShieldAlert,
    };
  }

  if (value.includes("manipulated")) {
    return {
      title: "Possible manipulation detected",
      description:
        "The analysis found manipulation-related indicators. Normal editing can also create similar signals.",
      color: "#f59e0b",
      icon: AlertTriangle,
    };
  }

  if (value.includes("suspicious")) {
    return {
      title: "Further verification recommended",
      description:
        "Some indicators deserve further investigation. The available result does not establish fraud or prove that the file is fake.",
      color: "#f59e0b",
      icon: ShieldAlert,
    };
  }

  if (value.includes("authentic")) {
    return {
      title: "No decisive authenticity conclusion",
      description:
        "Review the evidence and the detection method before relying on this result. A low risk score does not prove authenticity.",
      color: "#60a5fa",
      icon: ShieldCheck,
    };
  }

  return {
    title: "Unable to reach a reliable conclusion",
    description:
      "The available checks could not reliably establish whether this file is authentic, AI-generated or manipulated.",
    color: "#94a3b8",
    icon: Search,
  };
}

const Results = () => {
  const { analysisId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("evidence");
  const [actionMessage, setActionMessage] = useState("");

  const fetchResults = useCallback(async () => {
    if (!analysisId) {
      setError("The analysis ID is missing. Start a new analysis.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setData(null);

      const response = await api.getResults(analysisId);

      if (!response || typeof response !== "object") {
        throw new Error("The server returned an invalid analysis report.");
      }

      setData(response);
    } catch (err) {
      console.error("Failed to load analysis results:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load this report. Check the backend and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const showMessage = (message) => {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(""), 3000);
  };

  const handleDownload = () => {
    if (!data) return;

    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      const safeFilename = String(data.filename || "media")
        .replace(/[^a-z0-9_-]/gi, "_")
        .toLowerCase();

      link.href = url;
      link.download = `analysis_${safeFilename}.json`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
      showMessage("Report download started.");
    } catch (err) {
      console.error("Report download failed:", err);
      showMessage("Unable to download the report.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "AuthenticityAI Analysis Report",
          text: "Review this preliminary media analysis report.",
          url: shareUrl,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        showMessage("Report link copied.");
        return;
      }

      showMessage("Sharing is not supported in this browser.");
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error("Sharing failed:", err);
        showMessage("Unable to share the report.");
      }
    }
  };

  if (loading) {
    return (
      <div
        style={{
          ...styles.card,
          minHeight: "280px",
          display: "grid",
          placeItems: "center",
          gap: "12px",
        }}
      >
        <Loader2 size={34} className="results-spinner" />
        <h2>Loading analysis report</h2>
        <p style={styles.muted}>
          Retrieving the report and forensic evidence...
        </p>

        <style>{`
          .results-spinner {
            animation: results-spin 1s linear infinite;
          }
          @keyframes results-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ ...styles.card, maxWidth: "650px", margin: "40px auto" }}>
        <AlertTriangle size={36} color="#f87171" />

        <h2>Report unavailable</h2>
        <p style={styles.muted}>
          {error || "The requested analysis report could not be found."}
        </p>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={fetchResults}
            style={styles.button}
          >
            <RefreshCcw size={16} />
            Retry
          </button>

          <Link to="/analyze" style={styles.button}>
            <PlusCircle size={16} />
            New analysis
          </Link>
        </div>
      </div>
    );
  }

  const evidence = Array.isArray(data.evidence_list)
    ? data.evidence_list
    : [];

  const recommendations = Array.isArray(data.recommendations)
    ? data.recommendations
    : [];

  const assessmentInfo = getAssessmentInfo(data.assessment);
  const AssessmentIcon = assessmentInfo.icon;

  const tabs = [
    { id: "evidence", label: "Evidence", icon: Search },
    { id: "recommendations", label: "Next steps", icon: Lightbulb },
    { id: "metadata", label: "File metadata", icon: Database },
    { id: "provenance", label: "Provenance", icon: History },
  ];

  const fileSize =
    data.metadata?.["File Size"] ||
    formatBytes(data.file_size_bytes) ||
    "Not available";

  return (
    <div style={styles.page}>
      {actionMessage && (
        <div
          role="status"
          style={{
            ...styles.card,
            padding: "12px 16px",
            borderColor: "#10b981",
          }}
        >
          <CheckCircle
            size={17}
            style={{ verticalAlign: "middle", marginRight: "8px" }}
          />
          {actionMessage}
        </div>
      )}

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          paddingBottom: "16px",
          borderBottom: "1px solid var(--border-subtle, #263247)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            type="button"
            aria-label="Go back"
            onClick={() => navigate(-1)}
            style={styles.button}
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem" }}>
              Analysis report
            </h1>
            <p style={{ ...styles.muted, margin: "4px 0 0" }}>
              {data.filename || "Unnamed file"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleShare}
            style={styles.button}
          >
            <Share2 size={16} />
            Share
          </button>

          <button
            type="button"
            onClick={handleDownload}
            style={styles.button}
          >
            <Download size={16} />
            Download JSON
          </button>

          <button
            type="button"
            onClick={handlePrint}
            style={styles.button}
          >
            <Printer size={16} />
            Print
          </button>

          <Link to="/analyze" style={styles.button}>
            <PlusCircle size={16} />
            New analysis
          </Link>
        </div>
      </header>

      <div
        className="results-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.7fr) minmax(280px, 1fr)",
          gap: "22px",
          alignItems: "start",
        }}
      >
        <main style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <section
            style={{
              ...styles.card,
              borderLeft: `4px solid ${assessmentInfo.color}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <AssessmentIcon size={28} color={assessmentInfo.color} />

              <div>
                <p
                  style={{
                    margin: 0,
                    color: styles.muted.color,
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Overall assessment
                </p>

                <h2 style={{ margin: "5px 0 0", fontSize: "1.6rem" }}>
                  {data.assessment || "Inconclusive"}
                </h2>
              </div>
            </div>

            <h3>{assessmentInfo.title}</h3>
            <p style={styles.muted}>{assessmentInfo.description}</p>

            {data.why_explanation && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  borderRadius: "10px",
                  background: "rgba(148, 163, 184, 0.08)",
                }}
              >
                <strong>Why did we get this result?</strong>
                <p style={styles.muted}>{data.why_explanation}</p>
              </div>
            )}

            {Array.isArray(data.uncertainty_reasons) &&
              data.uncertainty_reasons.length > 0 && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "16px",
                    borderRadius: "10px",
                    border: "1px solid rgba(245, 158, 11, 0.35)",
                  }}
                >
                  <strong style={{ color: "#fbbf24" }}>
                    Limitations and uncertainty
                  </strong>

                  <ul style={{ ...styles.muted, paddingLeft: "20px" }}>
                    {data.uncertainty_reasons.map((reason, index) => (
                      <li key={`${index}-${reason}`}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
          </section>

          <section style={styles.card}>
            <h2 style={{ marginTop: 0 }}>Detailed report</h2>

            <div
              role="tablist"
              aria-label="Analysis report sections"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                borderBottom: "1px solid var(--border-subtle, #263247)",
                paddingBottom: "14px",
              }}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      ...styles.button,
                      color: selected ? "#93c5fd" : "inherit",
                      background: selected
                        ? "rgba(59, 130, 246, 0.13)"
                        : "transparent",
                      border: selected
                        ? "1px solid #3b82f6"
                        : "1px solid transparent",
                    }}
                  >
                    <Icon size={16} />
                    {tab.label}
                    {tab.id === "evidence" && ` (${evidence.length})`}
                  </button>
                );
              })}
            </div>

            <div style={{ paddingTop: "18px" }}>
              {activeTab === "evidence" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {evidence.length > 0 ? (
                    evidence.map((item, index) => (
                      <EvidenceCard
                        key={item.id || index}
                        evidence={item}
                        index={index}
                      />
                    ))
                  ) : (
                    <div>
                      <Search size={30} />
                      <h3>No evidence items returned</h3>
                      <p style={styles.muted}>
                        The analyzer did not return individual findings.
                        This does not prove that the file is genuine or safe.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "recommendations" && (
                <div>
                  <h3>Recommended next steps</h3>

                  {recommendations.length > 0 ? (
                    <ol style={{ ...styles.muted, paddingLeft: "22px" }}>
                      {recommendations.map((item, index) => (
                        <li key={index} style={{ marginBottom: "12px" }}>
                          {item}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p style={styles.muted}>
                      No additional steps were provided by the analyzer.
                    </p>
                  )}

                  <div
                    style={{
                      padding: "14px",
                      borderRadius: "8px",
                      background: "rgba(245, 158, 11, 0.08)",
                    }}
                  >
                    <strong>For possible scams</strong>
                    <p style={styles.muted}>
                      Verify identities and payment requests through a
                      separate trusted channel. Do not rely on an image
                      alone to establish that a claim is genuine.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "metadata" && (
                <div>
                  {data.metadata ? (
                    <MetadataPanel metadata={data.metadata} />
                  ) : (
                    <p style={styles.muted}>
                      No file metadata was included in this report.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "provenance" && (
                <div>
                  {data.provenance ? (
                    <ProvenancePanel provenance={data.provenance} />
                  ) : (
                    <p style={styles.muted}>
                      Provenance verification information is unavailable.
                      Missing provenance is not proof of fabrication.
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        </main>

        <aside style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <section style={styles.card}>
            <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>
              Analysis confidence
            </h2>

            <ConfidenceMeter
              confidence={data.confidence}
              confidenceScore={data.confidence_score}
              evidenceStrength={data.evidence_strength}
              uncertainty={data.uncertainty}
            />

            <p style={{ ...styles.muted, fontSize: "0.85rem" }}>
              A confidence score is meaningful only if its calculation is
              validated. Do not interpret a heuristic score as the
              probability that a file is fake.
            </p>
          </section>

          <section style={styles.card}>
            <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>
              Signal breakdown
            </h2>

            {data.signals ? (
              <RiskIndicator signals={data.signals} />
            ) : (
              <p style={styles.muted}>No signal breakdown is available.</p>
            )}

            <p style={{ ...styles.muted, fontSize: "0.85rem" }}>
              Signals are screening indicators. They are not proof of
              AI generation, manipulation, or fraud.
            </p>
          </section>

          <section style={styles.card}>
            <h2
              style={{
                marginTop: 0,
                display: "flex",
                gap: "8px",
                alignItems: "center",
                fontSize: "1.1rem",
              }}
            >
              <FileText size={19} />
              File information
            </h2>

            <InfoRow label="File name" value={data.filename} />
            <InfoRow label="Media type" value={data.media_type} />
            <InfoRow label="File size" value={fileSize} />
            <InfoRow
              label="File extension"
              value={data.metadata?.["File Extension"]}
            />
            <InfoRow
              label="Analysis date"
              value={formatDate(data.analyzed_at)}
            />
            <InfoRow
              label="Analysis ID"
              value={data.analysis_id}
            />

            <div style={{ marginTop: "16px" }}>
              <strong>Detection method</strong>
              <p style={styles.muted}>
                {data.engine_mode ||
                  "Heuristic screening. A validated AI-detection model has not been confirmed."}
              </p>
            </div>
          </section>
        </aside>
      </div>

      <section
        style={{
          ...styles.card,
          borderColor: "rgba(245, 158, 11, 0.4)",
          background: "rgba(245, 158, 11, 0.06)",
        }}
      >
        <h3 style={{ marginTop: 0, color: "#fbbf24" }}>
          <AlertTriangle
            size={18}
            style={{ verticalAlign: "middle", marginRight: "8px" }}
          />
          Important: Read before relying on this report
        </h3>

        <p style={styles.muted}>
          This report provides automated screening, not a guarantee of
          authenticity or fraud. AI-generated content can evade detectors,
          and genuine media can trigger false alarms. Independently verify
          important identity, financial, legal, or safety-related claims.
        </p>

        {data.disclaimer && (
          <p style={{ ...styles.muted, fontSize: "0.85rem" }}>
            {data.disclaimer}
          </p>
        )}
      </section>

      <style>{`
        @media (max-width: 850px) {
          .results-layout {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }

        @media print {
          button,
          a {
            display: none !important;
          }

          body {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
};

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "14px",
        padding: "10px 0",
        borderBottom: "1px solid var(--border-subtle, #263247)",
      }}
    >
      <span style={styles.muted}>{label}</span>
      <span
        style={{
          textAlign: "right",
          overflowWrap: "anywhere",
          maxWidth: "65%",
        }}
      >
        {value === undefined || value === null || value === ""
          ? "Not available"
          : String(value)}
      </span>
    </div>
  );
}

export default Results;
