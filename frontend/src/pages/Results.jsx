/**
 * =============================================================================
 *  Results.jsx  -  Forensic Analysis Report (premium redesign)
 * =============================================================================
 *  Path: src/pages/Results.jsx   (drop-in replacement)
 *
 *  Dependencies (already in your project): react, react-router-dom, lucide-react
 *  and ../services/api (api.getResults). No other component imports needed;
 *  this file is self-contained (old ConfidenceMeter / RiskIndicator /
 *  EvidenceCard / MetadataPanel / ProvenancePanel are no longer required).
 *
 *  Design rules used here
 *   1. Say each thing ONCE (verdict, limits, disclaimer are not repeated).
 *   2. Plain language first, technical detail on demand (accordions).
 *   3. Show the "why" and "how we checked" so the user can trust the report.
 *   4. Never show a fake "% fake" number: two honest gauges only
 *      (highest risk signal, confidence in the verdict) + how they are made.
 *   5. Missing provenance is shown as NEUTRAL, never as a red flag.
 * =============================================================================
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  Copy,
  Cpu,
  Database,
  Download,
  Film,
  FileText,
  History,
  Image as ImageGlyph,
  Info,
  Layers,
  Lightbulb,
  Music,
  PlusCircle,
  Printer,
  RefreshCcw,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { api } from "../services/api";

/* ---------------------------------------------------------------------------
 * Small utilities
 * ------------------------------------------------------------------------- */

const clamp01 = (n) => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));

const toNumber = (value, fallback = null) => {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
};

/** Accepts 0..1 or 0..100 and always returns 0..1 */
const normalizeScore = (value) => {
  const n = toNumber(value, null);
  if (n === null) return null;
  return clamp01(n > 1 ? n / 100 : n);
};

const toPercent = (value) => {
  const s = normalizeScore(value);
  return s === null ? null : Math.round(s * 100);
};

const isEmptyValue = (v) =>
  v === undefined ||
  v === null ||
  v === "" ||
  v === "Not available" ||
  v === "None" ||
  v === "Unknown";

function formatDate(value) {
  if (!value) return "Not available";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(value) {
  const d = new Date(value);
  if (!value || Number.isNaN(d.getTime())) return "";
  const sec = Math.round((Date.now() - d.getTime()) / 1000);
  if (sec < 45) return "just now";
  if (sec < 3600) return `${Math.round(sec / 60)} min ago`;
  if (sec < 86400) return `${Math.round(sec / 3600)} h ago`;
  return `${Math.round(sec / 86400)} d ago`;
}

function formatBytes(value) {
  const n = toNumber(value, null);
  if (n === null) return null;
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 ** 2).toFixed(2)} MB`;
}

const storage = {
  get(key, fallback) {
    try {
      const v = window.localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* private mode etc. */
    }
  },
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Animated count-up (respects reduced motion) */
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === null || target === undefined) return undefined;
    if (prefersReducedMotion()) {
      setValue(target);
      return undefined;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

/** Clipboard helper with fallback */
async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

function useCopyState() {
  const [copied, setCopied] = useState("");
  const timer = useRef(null);

  const copy = useCallback(async (key, text) => {
    const ok = await copyText(String(text));
    if (ok) {
      setCopied(key);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(""), 1600);
    }
    return ok;
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  return [copied, copy];
}

/* ---------------------------------------------------------------------------
 * Verdict configuration (plain language, English + Hinglish)
 * ------------------------------------------------------------------------- */

const VERDICTS = {
  authentic: {
    key: "authentic",
    label: "Likely authentic",
    color: "#34d399",
    icon: ShieldCheck,
    en: {
      headline: "No signs of AI generation or tampering were found",
      meaning:
        "We checked the file's markers, hidden data and pixel patterns. Nothing pointed to AI creation or editing.",
      action:
        "Still confirm the context (who sent it, when, where) before you rely on it.",
    },
    hi: {
      headline: "AI ya chhedchhad ka koi sabut nahi mila",
      meaning:
        "Humne file ke andar ke markers, chhupa data aur pixel patterns check kiye. Kuch bhi AI se bana ya edit hua nahi dikha.",
      action:
        "Phir bhi bharosa karne se pehle context confirm karo: kisne bheja, kab, kahan ka hai.",
    },
  },
  ai: {
    key: "ai",
    label: "Likely AI-generated",
    color: "#fb7185",
    icon: ShieldAlert,
    en: {
      headline: "This looks like it was made by an AI tool",
      meaning:
        "The file shows strong signs of being generated by software rather than captured by a camera.",
      action:
        "Do not treat it as a real photo or recording of an actual event without independent proof.",
    },
    hi: {
      headline: "Ye file AI tool se bani lag rahi hai",
      meaning:
        "File mein aise sanket hain jo bataate hain ki ye camera se nahi, software se generate hui hai.",
      action:
        "Bina doosre pukhta saboot ke ise asli photo ya video ki tarah mat maano.",
    },
  },
  manipulated: {
    key: "manipulated",
    label: "Possibly edited",
    color: "#fb923c",
    icon: AlertTriangle,
    en: {
      headline: "Parts of this file may have been changed",
      meaning:
        "We found signs of editing. Many edits are harmless (crop, colour), but some change the meaning.",
      action:
        "Compare with the original source and check faces, text and numbers carefully.",
    },
    hi: {
      headline: "Is file ke kuch hisse badle gaye ho sakte hain",
      meaning:
        "Editing ke sanket mile hain. Kai edits bekaar ke hote hain (crop, colour), par kuch matlab hi badal dete hain.",
      action:
        "Original source se milao aur chehre, text aur numbers dhyan se check karo.",
    },
  },
  suspicious: {
    key: "suspicious",
    label: "Needs a second look",
    color: "#fbbf24",
    icon: ShieldAlert,
    en: {
      headline: "A few things look unusual, but nothing is proven",
      meaning:
        "Some signals are out of the ordinary. They are not strong enough to say the file is fake.",
      action:
        "Verify the sender and the source through a separate trusted channel.",
    },
    hi: {
      headline: "Kuch cheezein ajeeb lag rahi hain, par kuch sabit nahi hua",
      meaning:
        "Kuch signals normal se alag hain. Itne mazboot nahi ki file ko fake keh sakein.",
      action: "Bhejne wale aur source ko kisi alag bharosemand tareeke se verify karo.",
    },
  },
  inconclusive: {
    key: "inconclusive",
    label: "Inconclusive",
    color: "#94a3b8",
    icon: Search,
    en: {
      headline: "We could not reach a reliable answer",
      meaning:
        "The file did not carry enough evidence for us to say either way. This is not a pass or a fail.",
      action:
        "Try to get the original file from the source and analyse that instead.",
    },
    hi: {
      headline: "Hum pakka jawab nahi de paaye",
      meaning:
        "File mein itna saboot hi nahi tha ki haan ya na bol sakein. Ye na pass hai na fail.",
      action: "Source se original file mangwao aur wahi analyse karo.",
    },
  },
};

function getVerdict(assessment) {
  const v = String(assessment || "").toLowerCase();
  if (v.includes("ai-generated") || v.includes("ai generated")) return VERDICTS.ai;
  if (v.includes("manipulat")) return VERDICTS.manipulated;
  if (v.includes("suspicious")) return VERDICTS.suspicious;
  if (v.includes("authentic")) return VERDICTS.authentic;
  return VERDICTS.inconclusive;
}

/* ---------------------------------------------------------------------------
 * Signal, severity and category configuration
 * ------------------------------------------------------------------------- */

const SIGNAL_META = {
  ai_generation: {
    title: "AI generation",
    question: "Was it made by an AI tool?",
    icon: Cpu,
  },
  manipulation: {
    title: "Editing / tampering",
    question: "Was it changed after it was captured?",
    icon: Layers,
  },
  metadata: {
    title: "Hidden file data",
    question: "Does the embedded data look natural?",
    icon: Database,
  },
  provenance: {
    title: "Origin record",
    question: "Does the file carry a signed origin record?",
    icon: History,
  },
};

const SIGNAL_ORDER = ["ai_generation", "manipulation", "metadata", "provenance"];

function normalizeSignals(signals) {
  const out = {};
  if (!signals) return out;
  if (Array.isArray(signals)) {
    signals.forEach((s) => {
      const key = s?.key || s?.name || s?.id;
      if (key) out[key] = s;
    });
    return out;
  }
  if (typeof signals === "object") {
    Object.entries(signals).forEach(([k, v]) => {
      if (v && typeof v === "object") out[k] = v;
    });
  }
  return out;
}

function riskBand(score) {
  if (score === null || score === undefined) {
    return { label: "n/a", color: "#64748b", level: 0 };
  }
  if (score < 0.3) return { label: "Low", color: "#34d399", level: 1 };
  if (score < 0.5) return { label: "Mild", color: "#a3e635", level: 2 };
  if (score < 0.7) return { label: "Elevated", color: "#fbbf24", level: 3 };
  return { label: "High", color: "#fb7185", level: 4 };
}

const SEVERITY = {
  High: { rank: 4, color: "#fb7185", label: "Important", weight: "Strong clue" },
  Medium: { rank: 3, color: "#fbbf24", label: "Notable", weight: "Moderate clue" },
  Low: { rank: 2, color: "#60a5fa", label: "Minor", weight: "Weak clue" },
  Informational: { rank: 1, color: "#94a3b8", label: "Info", weight: "Context only" },
};

const getSeverity = (s) => SEVERITY[s] || SEVERITY.Informational;

const CATEGORY = {
  "AI Generation": { label: "AI generation", icon: Cpu },
  Manipulation: { label: "Editing", icon: Layers },
  Metadata: { label: "File data", icon: Database },
  "Signal Extraction": { label: "Signal check", icon: Search },
  System: { label: "System note", icon: Info },
  Analysis: { label: "Analysis", icon: Search },
};

const getCategory = (c) => CATEGORY[c] || { label: c || "Analysis", icon: Search };

/** Plain-language explainers keyed by evidence id fragments */
const EXPLAINERS = [
  {
    match: /ML_UNAVAILABLE/i,
    what: "The AI-image classifier could not run on the server for this scan.",
    why: "Without it, AI detection relies on markers and weaker checks, so a clean result is less reliable.",
  },
  {
    match: /ML_CLASSIFIER/i,
    what: "A trained model looked at the whole image and estimated how likely it is to be AI-made.",
    why: "It learns the subtle look of generated images. It is an estimate, so we weigh it with other evidence.",
  },
  {
    match: /GEN_SIGNATURE|AI_DECLARED|SYNTH_TAG|LLM_TAG/i,
    what: "The file itself says it was produced by an AI tool.",
    why: "Generators and platforms often leave a label inside the file. A declared label is a strong clue.",
  },
  {
    match: /AI_EDIT/i,
    what: "The file says AI was used to edit or composite part of it.",
    why: "AI edits can add or replace content, so parts may not come from a camera.",
  },
  {
    match: /ELA/i,
    what: "We re-saved the image and compared how each region changed (Error Level Analysis).",
    why: "Regions pasted from another source can compress differently. Mixed content or repeated saving can look similar.",
  },
  {
    match: /NOISE/i,
    what: "We measured the fine grain (noise) pattern of the image.",
    why: "Cameras leave natural grain. Very smooth or uneven grain can hint at editing or synthetic rendering.",
  },
  {
    match: /SPECTRAL|FFT/i,
    what: "We looked at the image's frequency pattern for repeating artifacts.",
    why: "Some generators leave periodic patterns. This is a weak clue for newer tools.",
  },
  {
    match: /EDITOR/i,
    what: "The file records the software it was last saved with.",
    why: "Editing software means the file was opened and saved, which is common and not wrongdoing by itself.",
  },
  {
    match: /OPTICAL|HARDWARE/i,
    what: "The file contains camera make/model tags.",
    why: "Real photos usually carry them. They can be copied, so this only supports other evidence.",
  },
  {
    match: /STRIPPED/i,
    what: "The usual camera information is missing from the file.",
    why: "Messaging apps and websites remove it automatically, so this alone says very little.",
  },
  {
    match: /MUXER|CONTAINER/i,
    what: "We inspected how the video file was packaged and which tool wrote it.",
    why: "Re-encoding is common. It matters only together with other signs.",
  },
  {
    match: /PDF|OOXML|DOC_EVID/i,
    what: "We inspected the document's internal structure and properties.",
    why: "Edits, re-saves and the producing software leave traces in the file structure.",
  },
];

function explainEvidence(item) {
  const id = String(item?.id || "");
  const found = EXPLAINERS.find((e) => e.match.test(id));
  if (found) return found;
  const cat = String(item?.category || "");
  if (cat === "AI Generation") {
    return {
      what: "A check for signs that software generated this content.",
      why: "Combined with the other checks to form the overall verdict.",
    };
  }
  if (cat === "Manipulation") {
    return {
      what: "A check for signs that the content was edited after creation.",
      why: "Combined with the other checks to form the overall verdict.",
    };
  }
  return {
    what: "A supporting check on the file's data.",
    why: "Used as context for the overall verdict.",
  };
}

/** Which methods actually ran, derived from the real evidence ids */
function detectMethods(data, evidence) {
  const ids = evidence.map((e) => String(e?.id || "")).join(" ");
  const mlOff = /ML_UNAVAILABLE/i.test(ids);
  const mlOn = /ML_CLASSIFIER/i.test(ids);
  const list = [
    { key: "meta", label: "File data read", on: !!data?.metadata },
    { key: "prov", label: "Origin record scan", on: !!data?.provenance },
    { key: "ml", label: "AI classifier", on: mlOn, off: mlOff },
    { key: "ela", label: "Compression test", on: /ELA_(ANOMALY|UNIFORM)/i.test(ids) },
    { key: "noise", label: "Noise & frequency", on: /NOISE|SPECTRAL/i.test(ids) },
    { key: "docvid", label: "Structure check", on: /PDF|OOXML|MUXER|CONTAINER|VID_|DOC_/i.test(ids) },
  ];
  return list.filter((m) => m.on || m.off);
}

/* ---------------------------------------------------------------------------
 * Metadata grouping
 * ------------------------------------------------------------------------- */

const META_GROUPS = [
  { id: "file", title: "File", match: /^(file|system|format|dimensions|width|height|color mode|container|document type|encrypted|extension)/i },
  { id: "device", title: "Camera & device", match: /(camera|iso|focal|lens|exposure|aperture)/i },
  { id: "software", title: "Software & origin", match: /(software|editor|producer|creator|encoder|encoding|codec|brand|author|modified by|last modified by|revision)/i },
  { id: "dates", title: "Dates & time", match: /(date|time|created|modified)/i },
  { id: "media", title: "Media properties", match: /(duration|resolution|frame|sample|bitrate|channels|bit depth|page|word|line|character|icc|profile|embedded|comment|title|artist)/i },
];

function groupMetadata(metadata) {
  const groups = META_GROUPS.map((g) => ({ ...g, rows: [] }));
  const other = { id: "other", title: "Other", rows: [] };
  Object.entries(metadata || {}).forEach(([key, value]) => {
    if (value !== null && typeof value === "object") return;
    const target = groups.find((g) => g.match.test(key)) || other;
    target.rows.push({ key, value, empty: isEmptyValue(value) });
  });
  return [...groups, other].filter((g) => g.rows.length > 0);
}

/* ---------------------------------------------------------------------------
 * Plain-text summary (for copy / WhatsApp)
 * ------------------------------------------------------------------------- */

function buildSummaryText(data, verdict, risk, confidence) {
  const lines = [
    "AuthenticityAI - Automated screening report",
    `File: ${data.filename || "Unnamed file"}`,
    `Result: ${data.assessment || verdict.label}`,
    verdict.en.headline + ".",
  ];
  if (risk) lines.push(`Highest risk signal: ${risk.pct}% (${risk.label})`);
  if (confidence !== null) lines.push(`Confidence in this result: ${confidence}%`);
  if (data.why_explanation) lines.push(`Why: ${data.why_explanation}`);
  lines.push("This is a screening result, not proof.");
  return lines.join("\n");
}

function mediaIcon(type) {
  const t = String(type || "").toLowerCase();
  if (t === "image") return ImageGlyph;
  if (t === "video") return Film;
  if (t === "audio") return Music;
  return FileText;
}

function resolvePreviewUrl(url) {
  if (!url || typeof url !== "string") return null;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  try {
    const env = import.meta.env || {};
    const base = env.VITE_API_URL || env.VITE_API_BASE_URL || "";
    return `${String(base).replace(/\/api\/?$/, "").replace(/\/$/, "")}${url}`;
  } catch {
    return url;
  }
}

/* ---------------------------------------------------------------------------
 * Styles (scoped under .rp, uses your theme variables with safe fallbacks)
 * ------------------------------------------------------------------------- */

const REPORT_CSS = `
.rp {
  --rp-bg: var(--bg-primary, #0a1120);
  --rp-surface: var(--bg-surface, #101a2d);
  --rp-surface-2: #14213a;
  --rp-surface-3: #1a2a47;
  --rp-border: var(--border-subtle, #263247);
  --rp-border-strong: #33425c;
  --rp-text: var(--text-primary, #f1f5f9);
  --rp-text-2: var(--text-secondary, #aab5c5);
  --rp-text-3: #7f8da3;
  --rp-accent: #60a5fa;
  --rp-accent-soft: rgba(96, 165, 250, 0.12);
  --rp-radius: 16px;
  --rp-radius-sm: 10px;
  --rp-shadow: 0 1px 0 rgba(255,255,255,0.03) inset, 0 12px 32px rgba(2, 8, 23, 0.35);
  --rp-tone: #94a3b8;
  display: flex;
  flex-direction: column;
  gap: 22px;
  width: 100%;
  min-width: 0;
  color: var(--rp-text);
  font-family: inherit;
  line-height: 1.55;
}
.rp *, .rp *::before, .rp *::after { box-sizing: border-box; }
.rp h1, .rp h2, .rp h3, .rp h4, .rp p { margin: 0; }
.rp button { font: inherit; color: inherit; }
.rp :focus-visible { outline: 2px solid var(--rp-accent); outline-offset: 2px; border-radius: 6px; }
.rp-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* ---------- entrance ---------- */
.rp-in { opacity: 0; transform: translateY(10px); animation: rp-rise .55s cubic-bezier(.2,.7,.2,1) forwards; }
@keyframes rp-rise { to { opacity: 1; transform: none; } }

/* ---------- surfaces ---------- */
.rp-card {
  background: linear-gradient(180deg, var(--rp-surface-2) 0%, var(--rp-surface) 100%);
  border: 1px solid var(--rp-border);
  border-radius: var(--rp-radius);
  box-shadow: var(--rp-shadow);
  padding: 22px;
  min-width: 0;
}
.rp-card-title {
  display: flex; align-items: center; gap: 10px;
  font-size: 0.78rem; font-weight: 700; letter-spacing: .09em; text-transform: uppercase;
  color: var(--rp-text-3); margin-bottom: 16px;
}
.rp-card-title svg { color: var(--rp-accent); }
.rp-muted { color: var(--rp-text-2); }
.rp-small { font-size: 0.84rem; }
.rp-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }

/* ---------- buttons ---------- */
.rp-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 9px 14px; border-radius: 10px; cursor: pointer; text-decoration: none;
  font-size: 0.86rem; font-weight: 600; line-height: 1;
  background: rgba(148,163,184,0.08); border: 1px solid var(--rp-border); color: var(--rp-text);
  transition: background .15s, border-color .15s, transform .15s;
}
.rp-btn:hover { background: rgba(148,163,184,0.16); border-color: var(--rp-border-strong); }
.rp-btn:active { transform: translateY(1px); }
.rp-btn-primary { background: var(--rp-accent); border-color: var(--rp-accent); color: #04101f; }
.rp-btn-primary:hover { background: #7fb6fb; border-color: #7fb6fb; }
.rp-btn-icon { padding: 9px; }
.rp-btn-ghost { background: transparent; }

/* ---------- top header ---------- */
.rp-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.rp-top-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.rp-crumb { min-width: 0; }
.rp-eyebrow { font-size: .72rem; letter-spacing: .12em; text-transform: uppercase; color: var(--rp-text-3); font-weight: 700; }
.rp-title { font-size: 1.35rem; font-weight: 750; letter-spacing: -.01em; overflow-wrap: anywhere; }
.rp-actions { display: flex; flex-wrap: wrap; gap: 8px; }

/* ---------- toast ---------- */
.rp-toast {
  position: fixed; left: 50%; bottom: 26px; transform: translateX(-50%);
  background: #0f2a22; border: 1px solid #10b981; color: #d1fae5;
  padding: 11px 16px; border-radius: 12px; font-size: .88rem; font-weight: 600;
  display: flex; align-items: center; gap: 8px; z-index: 60;
  box-shadow: 0 12px 30px rgba(0,0,0,.45); animation: rp-rise .3s ease forwards;
}

/* ---------- sticky bar ---------- */
.rp-sticky {
  position: fixed; top: 0; left: 0; right: 0; z-index: 40;
  transform: translateY(-110%); transition: transform .28s ease;
  background: rgba(10, 17, 32, 0.88); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--rp-border);
}
.rp-sticky[data-show="true"] { transform: none; }
.rp-sticky-in {
  max-width: 1280px; margin: 0 auto; padding: 10px 20px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.rp-sticky-l { display: flex; align-items: center; gap: 10px; min-width: 0; }
.rp-sticky-name { font-weight: 650; font-size: .9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ---------- chips ---------- */
.rp-chip {
  display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px;
  border-radius: 999px; font-size: .74rem; font-weight: 700; letter-spacing: .02em;
  border: 1px solid color-mix(in srgb, var(--chip, #94a3b8) 45%, transparent);
  background: color-mix(in srgb, var(--chip, #94a3b8) 14%, transparent);
  color: var(--chip, #94a3b8); white-space: nowrap;
}
.rp-chip-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--chip, #94a3b8); }

/* ---------- hero ---------- */
.rp-hero {
  position: relative; overflow: hidden;
  border-radius: 20px; padding: 28px;
  border: 1px solid color-mix(in srgb, var(--rp-tone) 40%, var(--rp-border));
  background:
    radial-gradient(900px 300px at 0% -10%, color-mix(in srgb, var(--rp-tone) 20%, transparent), transparent 60%),
    linear-gradient(180deg, var(--rp-surface-2), var(--rp-surface));
  box-shadow: var(--rp-shadow);
}
.rp-hero-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(260px, 1fr); gap: 28px; align-items: center; }
.rp-verdict-row { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; flex-wrap: wrap; }
.rp-verdict-icon {
  width: 52px; height: 52px; border-radius: 16px; display: grid; place-items: center; flex: none;
  background: color-mix(in srgb, var(--rp-tone) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--rp-tone) 50%, transparent); color: var(--rp-tone);
}
.rp-verdict-label { font-size: 1.9rem; font-weight: 800; letter-spacing: -.02em; line-height: 1.1; color: var(--rp-text); }
.rp-headline { font-size: 1.12rem; font-weight: 650; margin-bottom: 8px; }
.rp-meaning { color: var(--rp-text-2); max-width: 62ch; }
.rp-next {
  margin-top: 16px; display: flex; gap: 10px; align-items: flex-start;
  padding: 12px 14px; border-radius: 12px;
  background: color-mix(in srgb, var(--rp-tone) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--rp-tone) 28%, transparent);
  font-size: .92rem;
}
.rp-next svg { flex: none; margin-top: 2px; color: var(--rp-tone); }

.rp-lang { display: inline-flex; padding: 3px; border-radius: 999px; border: 1px solid var(--rp-border); background: rgba(2,8,23,.35); }
.rp-lang button {
  border: 0; background: transparent; cursor: pointer; padding: 5px 12px; border-radius: 999px;
  font-size: .76rem; font-weight: 700; color: var(--rp-text-3);
}
.rp-lang button[aria-pressed="true"] { background: var(--rp-surface-3); color: var(--rp-text); }

/* ---------- gauges ---------- */
.rp-gauges { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.rp-gauge {
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px;
  padding: 16px 10px 14px; border-radius: 14px; background: rgba(2,8,23,.35); border: 1px solid var(--rp-border);
}
.rp-ring { position: relative; width: 112px; height: 112px; }
.rp-ring svg { transform: rotate(-90deg); display: block; }
.rp-ring-track { stroke: rgba(148,163,184,.16); }
.rp-ring-bar { transition: stroke-dashoffset 1.1s cubic-bezier(.2,.7,.2,1); }
.rp-ring-center { position: absolute; inset: 0; display: grid; place-items: center; }
.rp-ring-num { font-size: 1.65rem; font-weight: 800; letter-spacing: -.02em; }
.rp-ring-num small { font-size: .8rem; font-weight: 700; color: var(--rp-text-3); margin-left: 1px; }
.rp-gauge-label { font-size: .8rem; font-weight: 700; }
.rp-gauge-sub { font-size: .74rem; color: var(--rp-text-3); line-height: 1.35; }

/* ---------- how calculated ---------- */
.rp-how { margin-top: 18px; border-top: 1px dashed var(--rp-border); padding-top: 12px; }
.rp-link-btn {
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer; background: none; border: 0; padding: 4px 0;
  color: var(--rp-accent); font-size: .84rem; font-weight: 650;
}
.rp-link-btn svg { transition: transform .2s; }
.rp-link-btn[aria-expanded="true"] svg { transform: rotate(180deg); }
.rp-how-body { margin-top: 10px; display: grid; gap: 8px; color: var(--rp-text-2); font-size: .86rem; }
.rp-how-body li { margin-left: 18px; }

/* ---------- key findings ---------- */
.rp-key { margin-top: 20px; }
.rp-key-title { font-size: .76rem; letter-spacing: .09em; text-transform: uppercase; color: var(--rp-text-3); font-weight: 700; margin-bottom: 10px; }
.rp-key-list { display: flex; flex-wrap: wrap; gap: 8px; }
.rp-key-item {
  display: inline-flex; align-items: center; gap: 8px; cursor: pointer; text-align: left;
  padding: 8px 12px; border-radius: 12px; font-size: .84rem; font-weight: 600;
  background: rgba(2,8,23,.35); border: 1px solid var(--rp-border);
  transition: border-color .15s, background .15s;
}
.rp-key-item:hover { border-color: var(--rp-border-strong); background: rgba(2,8,23,.5); }
.rp-key-dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }

/* ---------- notices ---------- */
.rp-notice {
  display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; border-radius: 14px;
  background: rgba(251,191,36,.07); border: 1px solid rgba(251,191,36,.35); font-size: .9rem;
}
.rp-notice svg { flex: none; color: #fbbf24; margin-top: 2px; }
.rp-notice strong { color: #fde68a; }

/* ---------- layout ---------- */
.rp-layout { display: grid; grid-template-columns: minmax(0, 1.75fr) minmax(300px, 1fr); gap: 22px; align-items: start; }
.rp-main, .rp-side { display: flex; flex-direction: column; gap: 22px; min-width: 0; }
.rp-side { position: sticky; top: 76px; }

/* ---------- tabs ---------- */
.rp-tabs { display: flex; gap: 6px; flex-wrap: wrap; padding: 5px; border-radius: 14px; background: rgba(2,8,23,.4); border: 1px solid var(--rp-border); }
.rp-tab {
  flex: 1 1 auto; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 14px; border-radius: 10px; cursor: pointer; border: 0; background: transparent;
  color: var(--rp-text-2); font-size: .88rem; font-weight: 650; transition: background .15s, color .15s;
}
.rp-tab:hover { color: var(--rp-text); }
.rp-tab[aria-selected="true"] { background: var(--rp-accent-soft); color: #bfdbfe; box-shadow: inset 0 0 0 1px rgba(96,165,250,.45); }
.rp-tab-count { font-size: .72rem; padding: 1px 7px; border-radius: 999px; background: rgba(148,163,184,.16); }
.rp-panel { display: none; padding-top: 18px; }
.rp-panel[data-active="true"] { display: block; animation: rp-rise .35s ease forwards; }

/* ---------- filters ---------- */
.rp-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
.rp-seg { display: inline-flex; padding: 3px; border-radius: 10px; border: 1px solid var(--rp-border); background: rgba(2,8,23,.35); }
.rp-seg button { border: 0; background: transparent; cursor: pointer; padding: 6px 12px; border-radius: 8px; font-size: .8rem; font-weight: 650; color: var(--rp-text-3); }
.rp-seg button[aria-pressed="true"] { background: var(--rp-surface-3); color: var(--rp-text); }

/* ---------- evidence ---------- */
.rp-ev-list { display: flex; flex-direction: column; gap: 10px; }
.rp-ev {
  border: 1px solid var(--rp-border); border-radius: 14px; background: rgba(2,8,23,.28);
  overflow: hidden; transition: border-color .2s, box-shadow .2s;
}
.rp-ev[data-open="true"] { border-color: var(--rp-border-strong); background: rgba(2,8,23,.4); }
.rp-ev[data-flash="true"] { box-shadow: 0 0 0 2px var(--rp-accent); }
.rp-ev-head {
  width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px 16px;
  background: transparent; border: 0; cursor: pointer; text-align: left;
}
.rp-ev-bar { width: 4px; align-self: stretch; border-radius: 4px; flex: none; }
.rp-ev-main { flex: 1; min-width: 0; }
.rp-ev-title { font-weight: 650; font-size: .95rem; }
.rp-ev-meta { display: flex; gap: 8px; align-items: center; margin-top: 4px; flex-wrap: wrap; color: var(--rp-text-3); font-size: .76rem; }
.rp-ev-chev { color: var(--rp-text-3); transition: transform .25s; flex: none; }
.rp-ev[data-open="true"] .rp-ev-chev { transform: rotate(180deg); }
.rp-acc { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .3s ease; }
.rp-ev[data-open="true"] .rp-acc { grid-template-rows: 1fr; }
.rp-acc-in { overflow: hidden; min-height: 0; }
.rp-ev-body { padding: 0 16px 16px 32px; display: grid; gap: 14px; }
.rp-ev-block h4 { font-size: .72rem; letter-spacing: .09em; text-transform: uppercase; color: var(--rp-text-3); margin-bottom: 4px; }
.rp-ev-block p { color: var(--rp-text-2); font-size: .9rem; }
.rp-tech {
  position: relative; padding: 12px 44px 12px 12px; border-radius: 10px; font-size: .78rem;
  background: #060d1b; border: 1px solid var(--rp-border); color: #b6c3d8; overflow-wrap: anywhere;
}
.rp-copy {
  position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; display: grid; place-items: center;
  border-radius: 8px; cursor: pointer; background: rgba(148,163,184,.1); border: 1px solid var(--rp-border); color: var(--rp-text-2);
}
.rp-copy:hover { background: rgba(148,163,184,.2); }

/* ---------- empty ---------- */
.rp-empty { text-align: center; padding: 34px 16px; color: var(--rp-text-2); display: grid; gap: 8px; justify-items: center; }
.rp-empty svg { color: var(--rp-text-3); }

/* ---------- signals ---------- */
.rp-sig-list { display: flex; flex-direction: column; gap: 16px; }
.rp-sig-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
.rp-sig-name { display: flex; align-items: center; gap: 8px; font-weight: 650; font-size: .92rem; }
.rp-sig-name svg { color: var(--rp-text-3); }
.rp-sig-q { font-size: .78rem; color: var(--rp-text-3); margin-bottom: 8px; }
.rp-meter { position: relative; height: 8px; border-radius: 999px; background: rgba(148,163,184,.14); overflow: hidden; }
.rp-meter-fill { position: absolute; inset: 0 auto 0 0; border-radius: 999px; width: 0; transition: width 1s cubic-bezier(.2,.7,.2,1); }
.rp-meter-ticks { position: absolute; inset: 0; display: flex; justify-content: space-between; pointer-events: none; }
.rp-meter-ticks i { width: 1px; background: rgba(2,8,23,.55); }
.rp-sig-foot { margin-top: 6px; font-size: .78rem; color: var(--rp-text-3); }

/* ---------- methods ---------- */
.rp-methods { display: flex; flex-wrap: wrap; gap: 8px; }
.rp-method { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 999px; font-size: .78rem; font-weight: 600; border: 1px solid var(--rp-border); background: rgba(2,8,23,.3); }
.rp-method[data-on="true"] svg { color: #34d399; }
.rp-method[data-off="true"] { border-color: rgba(251,191,36,.4); color: #fde68a; }

/* ---------- info rows ---------- */
.rp-rows { display: flex; flex-direction: column; }
.rp-row { display: flex; justify-content: space-between; gap: 14px; padding: 10px 0; border-bottom: 1px solid var(--rp-border); font-size: .88rem; }
.rp-row:last-child { border-bottom: 0; }
.rp-row dt { color: var(--rp-text-3); flex: none; }
.rp-row dd { margin: 0; text-align: right; overflow-wrap: anywhere; max-width: 66%; }

/* ---------- file card ---------- */
.rp-file { display: flex; gap: 14px; align-items: center; margin-bottom: 14px; }
.rp-thumb {
  width: 64px; height: 64px; border-radius: 14px; flex: none; display: grid; place-items: center; overflow: hidden;
  background: var(--rp-surface-3); border: 1px solid var(--rp-border); color: var(--rp-text-2);
}
.rp-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* ---------- metadata explorer ---------- */
.rp-search {
  display: flex; align-items: center; gap: 8px; padding: 0 12px; border-radius: 10px;
  background: rgba(2,8,23,.4); border: 1px solid var(--rp-border); flex: 1 1 220px;
}
.rp-search input { flex: 1; min-width: 0; background: transparent; border: 0; color: var(--rp-text); padding: 10px 0; font-size: .88rem; outline: none; }
.rp-search:focus-within { border-color: var(--rp-accent); }
.rp-mgroup { margin-bottom: 18px; }
.rp-mgroup h4 { font-size: .74rem; letter-spacing: .09em; text-transform: uppercase; color: var(--rp-text-3); margin-bottom: 6px; }
.rp-mtable { border: 1px solid var(--rp-border); border-radius: 12px; overflow: hidden; }
.rp-mrow { display: grid; grid-template-columns: minmax(120px, 0.8fr) minmax(0, 1.6fr) 30px; gap: 10px; align-items: center; padding: 10px 12px; font-size: .86rem; border-bottom: 1px solid var(--rp-border); }
.rp-mrow:last-child { border-bottom: 0; }
.rp-mrow:nth-child(odd) { background: rgba(2,8,23,.22); }
.rp-mkey { color: var(--rp-text-3); }
.rp-mval { overflow-wrap: anywhere; }
.rp-mval[data-empty="true"] { color: var(--rp-text-3); font-style: italic; }
.rp-mcopy { opacity: 0; cursor: pointer; background: none; border: 0; color: var(--rp-text-2); display: grid; place-items: center; }
.rp-mrow:hover .rp-mcopy, .rp-mcopy:focus-visible { opacity: 1; }

/* ---------- provenance ---------- */
.rp-prov-status { display: flex; gap: 14px; align-items: center; padding: 16px; border-radius: 14px; margin-bottom: 16px; border: 1px solid color-mix(in srgb, var(--chip) 40%, transparent); background: color-mix(in srgb, var(--chip) 9%, transparent); }
.rp-prov-status svg { color: var(--chip); flex: none; }
.rp-timeline { position: relative; margin: 6px 0 0 8px; padding-left: 22px; border-left: 2px solid var(--rp-border); display: grid; gap: 14px; }
.rp-tl-item { position: relative; }
.rp-tl-item::before { content: ""; position: absolute; left: -29px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: var(--rp-accent); box-shadow: 0 0 0 4px var(--rp-surface); }
.rp-tl-title { font-weight: 650; font-size: .9rem; }

/* ---------- action plan ---------- */
.rp-progress { height: 6px; border-radius: 999px; background: rgba(148,163,184,.14); overflow: hidden; margin: 8px 0 16px; }
.rp-progress i { display: block; height: 100%; background: #34d399; transition: width .4s ease; }
.rp-check { display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--rp-border); background: rgba(2,8,23,.28); cursor: pointer; width: 100%; text-align: left; margin-bottom: 8px; }
.rp-check:hover { border-color: var(--rp-border-strong); }
.rp-box { width: 22px; height: 22px; border-radius: 7px; flex: none; display: grid; place-items: center; border: 2px solid var(--rp-border-strong); color: transparent; margin-top: 1px; transition: all .15s; }
.rp-check[aria-checked="true"] .rp-box { background: #34d399; border-color: #34d399; color: #04130d; }
.rp-check[aria-checked="true"] .rp-check-text { color: var(--rp-text-3); text-decoration: line-through; }
.rp-tools { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px; margin-top: 8px; }
.rp-tool { display: block; text-decoration: none; color: inherit; padding: 14px; border-radius: 12px; border: 1px solid var(--rp-border); background: rgba(2,8,23,.28); transition: border-color .15s, transform .15s; }
.rp-tool:hover { border-color: var(--rp-accent); transform: translateY(-1px); }
.rp-tool strong { display: block; font-size: .9rem; margin-bottom: 2px; }
.rp-scam { margin-top: 18px; padding: 16px; border-radius: 14px; background: rgba(251,113,133,.07); border: 1px solid rgba(251,113,133,.32); }
.rp-scam strong { color: #fecdd3; }

/* ---------- footer ---------- */
.rp-foot { display: flex; gap: 14px; align-items: flex-start; padding: 18px 20px; border-radius: 16px; border: 1px solid var(--rp-border); background: rgba(2,8,23,.3); color: var(--rp-text-2); font-size: .86rem; }
.rp-foot svg { color: var(--rp-text-3); flex: none; margin-top: 2px; }
.rp-print-head { display: none; }

/* ---------- skeleton ---------- */
.rp-sk { background: linear-gradient(90deg, rgba(148,163,184,.08) 25%, rgba(148,163,184,.18) 37%, rgba(148,163,184,.08) 63%); background-size: 400% 100%; animation: rp-shimmer 1.4s ease infinite; border-radius: 10px; }
@keyframes rp-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }

/* ---------- error ---------- */
.rp-error { max-width: 640px; margin: 48px auto; text-align: center; display: grid; gap: 14px; justify-items: center; }
.rp-error-icon { width: 64px; height: 64px; border-radius: 20px; display: grid; place-items: center; background: rgba(248,113,113,.12); border: 1px solid rgba(248,113,113,.4); color: #f87171; }

/* ---------- responsive ---------- */
@media (max-width: 980px) {
  .rp-layout { grid-template-columns: minmax(0, 1fr); }
  .rp-side { position: static; }
  .rp-hero-grid { grid-template-columns: minmax(0, 1fr); gap: 22px; }
}
@media (max-width: 560px) {
  .rp-hero { padding: 20px 16px; }
  .rp-card { padding: 18px 16px; }
  .rp-verdict-label { font-size: 1.5rem; }
  .rp-gauges { grid-template-columns: 1fr 1fr; gap: 10px; }
  .rp-ring { width: 92px; height: 92px; }
  .rp-ring-num { font-size: 1.3rem; }
  .rp-mrow { grid-template-columns: 1fr; gap: 2px; }
  .rp-mcopy { display: none; }
  .rp-tab { padding: 9px 10px; font-size: .82rem; }
  .rp-btn-label { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .rp-in, .rp-panel[data-active="true"], .rp-toast { animation: none; opacity: 1; transform: none; }
  .rp-ring-bar, .rp-meter-fill, .rp-acc, .rp-progress i { transition: none; }
  .rp-sk { animation: none; }
}

/* ---------- print: clean, light, everything expanded ---------- */
@media print {
  .rp { --rp-text: #0f172a; --rp-text-2: #334155; --rp-text-3: #64748b; --rp-border: #cbd5e1; --rp-border-strong: #94a3b8; gap: 14px; color: #0f172a; }
  .rp-card, .rp-hero, .rp-ev, .rp-gauge, .rp-foot { background: #fff !important; box-shadow: none !important; border-color: #cbd5e1 !important; }
  .rp-actions, .rp-sticky, .rp-toast, .rp-tabs, .rp-toolbar, .rp-lang, .rp-copy, .rp-mcopy, .rp-link-btn, .rp-top-left .rp-btn { display: none !important; }
  .rp-panel { display: block !important; padding-top: 10px; page-break-inside: auto; }
  .rp-acc { grid-template-rows: 1fr !important; }
  .rp-ev, .rp-card, .rp-hero { page-break-inside: avoid; }
  .rp-layout { grid-template-columns: 1fr; }
  .rp-side { position: static; }
  .rp-tech { background: #f1f5f9; color: #0f172a; }
  .rp-print-head { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #0f172a; padding-bottom: 8px; font-size: 12px; }
  .rp-in { opacity: 1; transform: none; animation: none; }
}
`;

/* ---------------------------------------------------------------------------
 * Presentational components
 * ------------------------------------------------------------------------- */

function Chip({ color = "#94a3b8", dot = false, children }) {
  return (
    <span className="rp-chip" style={{ "--chip": color }}>
      {dot && <span className="rp-chip-dot" />}
      {children}
    </span>
  );
}

function CardTitle({ icon: Icon, children }) {
  return (
    <h2 className="rp-card-title">
      {Icon && <Icon size={16} aria-hidden="true" />}
      {children}
    </h2>
  );
}

function InfoRow({ label, value, mono = false }) {
  const empty = isEmptyValue(value);
  return (
    <div className="rp-row">
      <dt>{label}</dt>
      <dd className={mono ? "rp-mono" : ""}>{empty ? "Not available" : String(value)}</dd>
    </div>
  );
}

/** Animated circular gauge */
function ScoreRing({ value, color, label, sub, unit = "%" }) {
  const R = 46;
  const C = 2 * Math.PI * R;
  const [ready, setReady] = useState(false);
  const shown = useCountUp(value);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const hasValue = value !== null && value !== undefined;
  const offset = C * (1 - (ready && hasValue ? value / 100 : 0));

  return (
    <div className="rp-gauge">
      <div
        className="rp-ring"
        role="img"
        aria-label={`${label}: ${hasValue ? `${value} percent` : "not available"}`}
      >
        <svg width="100%" height="100%" viewBox="0 0 112 112">
          <circle className="rp-ring-track" cx="56" cy="56" r={R} fill="none" strokeWidth="9" />
          <circle
            className="rp-ring-bar"
            cx="56"
            cy="56"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="rp-ring-center">
          <span className="rp-ring-num">
            {hasValue ? shown : "--"}
            {hasValue && <small>{unit}</small>}
          </span>
        </div>
      </div>
      <div>
        <div className="rp-gauge-label" style={{ color }}>
          {label}
        </div>
        <div className="rp-gauge-sub">{sub}</div>
      </div>
    </div>
  );
}

/* ---------- risk helpers ---------- */

function computeRisk(signals) {
  const ai = normalizeScore(signals.ai_generation?.score);
  const manip = normalizeScore(signals.manipulation?.score);
  if (ai === null && manip === null) return null;
  const useAi = (ai ?? -1) >= (manip ?? -1);
  const value = useAi ? ai : manip;
  const band = riskBand(value);
  return {
    value,
    pct: Math.round(value * 100),
    label: band.label,
    color: band.color,
    source: useAi ? "AI generation" : "Editing / tampering",
  };
}

/* ---------- sticky mini bar ---------- */

function StickyBar({ show, verdict, filename, onShare, onPrint }) {
  const Icon = verdict.icon;
  return (
    <div className="rp-sticky" data-show={show ? "true" : "false"} aria-hidden={!show}>
      <div className="rp-sticky-in">
        <div className="rp-sticky-l">
          <Icon size={20} color={verdict.color} aria-hidden="true" />
          <Chip color={verdict.color} dot>
            {verdict.label}
          </Chip>
          <span className="rp-sticky-name">{filename || "Unnamed file"}</span>
        </div>
        <div className="rp-actions">
          <button type="button" className="rp-btn" onClick={onShare} tabIndex={show ? 0 : -1}>
            <Share2 size={15} />
            <span className="rp-btn-label">Share</span>
          </button>
          <button type="button" className="rp-btn" onClick={onPrint} tabIndex={show ? 0 : -1}>
            <Printer size={15} />
            <span className="rp-btn-label">Print</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- hero ---------- */

function VerdictHero({
  data,
  verdict,
  lang,
  setLang,
  risk,
  confidence,
  keyFindings,
  onJump,
  heroRef,
}) {
  const [showHow, setShowHow] = useState(false);
  const text = verdict[lang] || verdict.en;
  const Icon = verdict.icon;
  const confLabel = data.confidence ? String(data.confidence) : "";
  const strength = data.evidence_strength ? String(data.evidence_strength) : "";

  return (
    <section
      ref={heroRef}
      className="rp-hero rp-in"
      style={{ "--rp-tone": verdict.color, animationDelay: "60ms" }}
      aria-labelledby="rp-verdict"
    >
      <div className="rp-hero-grid">
        <div>
          <div className="rp-verdict-row">
            <div className="rp-verdict-icon">
              <Icon size={26} aria-hidden="true" />
            </div>
            <div>
              <div className="rp-eyebrow">Overall result</div>
              <h2 id="rp-verdict" className="rp-verdict-label">
                {data.assessment || verdict.label}
              </h2>
            </div>
            <div className="rp-lang" role="group" aria-label="Explanation language" style={{ marginLeft: "auto" }}>
              <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
                English
              </button>
              <button type="button" aria-pressed={lang === "hi"} onClick={() => setLang("hi")}>
                Hinglish
              </button>
            </div>
          </div>

          <p className="rp-headline">{text.headline}</p>
          <p className="rp-meaning">{text.meaning}</p>

          <div className="rp-next">
            <Lightbulb size={18} aria-hidden="true" />
            <span>
              <strong>{lang === "hi" ? "Ab kya karein: " : "What to do: "}</strong>
              {text.action}
            </span>
          </div>

          {data.why_explanation && (
            <p className="rp-muted rp-small" style={{ marginTop: 14 }}>
              <strong style={{ color: "var(--rp-text)" }}>Why we say this: </strong>
              {data.why_explanation}
            </p>
          )}
        </div>

        <div>
          <div className="rp-gauges">
            <ScoreRing
              value={risk ? risk.pct : null}
              color={risk ? risk.color : "#64748b"}
              label={risk ? `${risk.label} risk signal` : "Risk signal"}
              sub={risk ? `Strongest: ${risk.source}` : "Not available"}
            />
            <ScoreRing
              value={confidence}
              color="#60a5fa"
              label="Confidence"
              sub={[confLabel, strength && `${strength} evidence`].filter(Boolean).join(" · ") || "In this result"}
            />
          </div>

          <div className="rp-how">
            <button
              type="button"
              className="rp-link-btn"
              aria-expanded={showHow}
              onClick={() => setShowHow((v) => !v)}
            >
              How are these two numbers made?
              <ChevronDown size={15} />
            </button>
            {showHow && (
              <ul className="rp-how-body">
                <li>
                  <strong>Risk signal</strong> is the higher of the AI-generation and editing scores. It is
                  not the chance that the file is fake.
                </li>
                <li>
                  <strong>Confidence</strong> shows how sure the system is about the overall result, based on
                  how strong and how many clues agree.
                </li>
                <li>A high confidence in "Likely authentic" still does not prove a real capture.</li>
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="rp-key">
        <div className="rp-key-title">
          {keyFindings.length > 0 ? "Key findings (tap to open)" : "Key findings"}
        </div>
        {keyFindings.length > 0 ? (
          <div className="rp-key-list">
            {keyFindings.map((item) => (
              <button type="button" key={item._k} className="rp-key-item" onClick={() => onJump(item._k)}>
                <span className="rp-key-dot" style={{ background: getSeverity(item.severity).color }} />
                {item.title}
              </button>
            ))}
          </div>
        ) : (
          <p className="rp-muted rp-small">
            No important or notable findings. Supporting checks are listed under Findings.
          </p>
        )}
      </div>
    </section>
  );
}

/* ---------- limited-scan notice ---------- */

function LimitNotice({ methods, reasons }) {
  const mlOff = methods.some((m) => m.key === "ml" && m.off);
  const list = Array.isArray(reasons) ? reasons.filter(Boolean) : [];
  if (!mlOff && list.length === 0) return null;
  return (
    <div className="rp-notice rp-in" role="note" style={{ animationDelay: "120ms" }}>
      <AlertTriangle size={20} aria-hidden="true" />
      <div>
        <strong>{mlOff ? "Limited scan: AI classifier was offline" : "What this result cannot tell you"}</strong>
        {mlOff && (
          <p className="rp-muted rp-small" style={{ marginTop: 4 }}>
            Only markers and weaker checks ran, so AI images without labels can be missed. Re-run after the
            server's AI classifier is enabled.
          </p>
        )}
        {list.length > 0 && (
          <ul className="rp-muted rp-small" style={{ margin: "6px 0 0", paddingLeft: 18 }}>
            {list.map((r, i) => (
              <li key={`${i}-${r}`}>{r}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------- signals ---------- */

function SignalPanel({ signals, provenance }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const keys = SIGNAL_ORDER.filter((k) => signals[k]);
  if (keys.length === 0) {
    return <p className="rp-muted rp-small">No signal breakdown was returned for this report.</p>;
  }

  return (
    <div className="rp-sig-list">
      {keys.map((key) => {
        const sig = signals[key];
        const meta = SIGNAL_META[key];
        const Icon = meta.icon;
        const score = normalizeScore(sig.score);
        const count = toNumber(sig.indicators_detected, 0);
        const conf = sig.confidence ? String(sig.confidence) : null;

        if (key === "provenance") {
          const declared = (score ?? 0) >= 0.7;
          const found = !!provenance?.detected || count > 0;
          const color = declared ? "#fb7185" : found ? "#34d399" : "#94a3b8";
          const state = declared ? "Declares AI" : found ? "Record found" : "None found (normal)";
          return (
            <div key={key}>
              <div className="rp-sig-head">
                <span className="rp-sig-name">
                  <Icon size={16} aria-hidden="true" />
                  {meta.title}
                </span>
                <Chip color={color} dot>
                  {state}
                </Chip>
              </div>
              <div className="rp-sig-q">{meta.question}</div>
              {sig.summary && <div className="rp-sig-foot">{sig.summary}</div>}
            </div>
          );
        }

        const band = riskBand(score);
        return (
          <div key={key}>
            <div className="rp-sig-head">
              <span className="rp-sig-name">
                <Icon size={16} aria-hidden="true" />
                {meta.title}
              </span>
              <Chip color={band.color} dot>
                {band.label}
              </Chip>
            </div>
            <div className="rp-sig-q">{meta.question}</div>
            <div
              className="rp-meter"
              role="meter"
              aria-label={`${meta.title} signal`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={score === null ? 0 : Math.round(score * 100)}
            >
              <div
                className="rp-meter-fill"
                style={{ width: ready && score !== null ? `${Math.round(score * 100)}%` : "0%", background: band.color }}
              />
              <div className="rp-meter-ticks" aria-hidden="true">
                <i style={{ opacity: 0 }} />
                <i />
                <i />
                <i />
                <i style={{ opacity: 0 }} />
              </div>
            </div>
            <div className="rp-sig-foot">
              {[conf && `Confidence: ${conf}`, `${count} ${count === 1 ? "clue" : "clues"} found`]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MethodsCard({ methods }) {
  if (methods.length === 0) return null;
  return (
    <section className="rp-card rp-in" style={{ animationDelay: "240ms" }}>
      <CardTitle icon={Cpu}>How we checked</CardTitle>
      <div className="rp-methods">
        {methods.map((m) => (
          <span key={m.key} className="rp-method" data-on={m.on ? "true" : "false"} data-off={m.off ? "true" : "false"}>
            {m.off ? <AlertTriangle size={14} /> : <Check size={14} />}
            {m.label}
            {m.off ? " (offline)" : ""}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ---------- file / custody ---------- */

function CustodyCard({ data, fileSize, onCopy, copied }) {
  const Glyph = mediaIcon(data.media_type);
  const preview = data.media_type === "image" ? resolvePreviewUrl(data.preview_url) : null;
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <section className="rp-card rp-in" style={{ animationDelay: "300ms" }}>
      <CardTitle icon={FileText}>Report details</CardTitle>

      <div className="rp-file">
        <div className="rp-thumb">
          {preview && !imgFailed ? (
            <img src={preview} alt="Analysed file preview" onError={() => setImgFailed(true)} />
          ) : (
            <Glyph size={26} aria-hidden="true" />
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 650, overflowWrap: "anywhere" }}>{data.filename || "Unnamed file"}</div>
          <div className="rp-muted rp-small">
            {[data.media_type, fileSize].filter((x) => !isEmptyValue(x)).join(" · ")}
          </div>
        </div>
      </div>

      <dl className="rp-rows" style={{ margin: 0 }}>
        <InfoRow label="Analysed" value={`${formatDate(data.analyzed_at)}${data.analyzed_at ? ` (${timeAgo(data.analyzed_at)})` : ""}`} />
        <InfoRow label="File type" value={data.metadata?.["File Extension"]} />
        {data.engine_mode && <InfoRow label="Engine" value={data.engine_mode} />}
        {data.file_sha256 && <InfoRow label="SHA-256" value={data.file_sha256} mono />}
        <div className="rp-row">
          <dt>Report ID</dt>
          <dd style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
            <span className="rp-mono rp-small">{data.analysis_id ? String(data.analysis_id).slice(0, 13) + "…" : "Not available"}</span>
            {data.analysis_id && (
              <button
                type="button"
                className="rp-btn rp-btn-icon rp-btn-ghost"
                aria-label="Copy full report ID"
                onClick={() => onCopy("id", data.analysis_id)}
                style={{ padding: 6 }}
              >
                {copied === "id" ? <Check size={14} /> : <Copy size={14} />}
              </button>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}

/* ---------- evidence ---------- */

function EvidenceItem({ item, open, flash, onToggle, copied, onCopy }) {
  const sev = getSeverity(item.severity);
  const cat = getCategory(item.category);
  const CatIcon = cat.icon;
  const explain = explainEvidence(item);
  const bodyId = `rp-body-${item._k}`;

  return (
    <article
      id={`rp-ev-${item._k}`}
      className="rp-ev"
      data-open={open ? "true" : "false"}
      data-flash={flash ? "true" : "false"}
    >
      <button
        type="button"
        className="rp-ev-head"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => onToggle(item._k)}
      >
        <span className="rp-ev-bar" style={{ background: sev.color }} aria-hidden="true" />
        <span className="rp-ev-main">
          <span className="rp-ev-title">{item.title || "Finding"}</span>
          <span className="rp-ev-meta">
            <Chip color={sev.color}>{sev.label}</Chip>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <CatIcon size={13} aria-hidden="true" />
              {cat.label}
            </span>
          </span>
        </span>
        <ChevronDown size={18} className="rp-ev-chev" aria-hidden="true" />
      </button>

      <div className="rp-acc" id={bodyId} role="region" aria-label={item.title}>
        <div className="rp-acc-in">
          <div className="rp-ev-body">
            {item.description && (
              <div className="rp-ev-block">
                <h4>What we found</h4>
                <p>{item.description}</p>
              </div>
            )}
            <div className="rp-ev-block">
              <h4>How to read it · {sev.weight}</h4>
              <p>
                {explain.what} {explain.why}
              </p>
            </div>
            {item.technical_details && (
              <div className="rp-ev-block">
                <h4>Technical details</h4>
                <div className="rp-tech rp-mono">
                  {String(item.technical_details)}
                  <button
                    type="button"
                    className="rp-copy"
                    aria-label="Copy technical details"
                    onClick={() => onCopy(`t-${item._k}`, item.technical_details)}
                  >
                    {copied === `t-${item._k}` ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function EvidenceList({ items, openIds, flashId, onToggle, setAll, filter, setFilter, copied, onCopy, total }) {
  const filters = [
    { id: "all", label: `All (${total})` },
    { id: "important", label: "Important" },
    { id: "context", label: "Context" },
  ];

  return (
    <div>
      <div className="rp-toolbar">
        <div className="rp-seg" role="group" aria-label="Filter findings">
          {filters.map((f) => (
            <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" className="rp-btn rp-btn-ghost" onClick={() => setAll(true)}>
            Expand all
          </button>
          <button type="button" className="rp-btn rp-btn-ghost" onClick={() => setAll(false)}>
            Collapse
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rp-empty">
          <Search size={30} aria-hidden="true" />
          <h3>{total === 0 ? "No individual findings were returned" : "Nothing in this filter"}</h3>
          <p className="rp-small">
            {total === 0
              ? "This does not prove the file is genuine. Try a higher-quality original."
              : "Switch the filter to see all findings."}
          </p>
        </div>
      ) : (
        <div className="rp-ev-list">
          {items.map((item) => (
            <EvidenceItem
              key={item._k}
              item={item}
              open={openIds.has(item._k)}
              flash={flashId === item._k}
              onToggle={onToggle}
              copied={copied}
              onCopy={onCopy}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- metadata explorer ---------- */

function MetadataExplorer({ metadata, copied, onCopy }) {
  const [query, setQuery] = useState("");
  const [showEmpty, setShowEmpty] = useState(false);

  const groups = useMemo(() => groupMetadata(metadata), [metadata]);
  const emptyCount = useMemo(
    () => groups.reduce((n, g) => n + g.rows.filter((r) => r.empty).length, 0),
    [groups]
  );

  const q = query.trim().toLowerCase();
  const visible = groups
    .map((g) => ({
      ...g,
      rows: g.rows.filter((r) => {
        if (r.empty && !showEmpty) return false;
        if (!q) return true;
        return r.key.toLowerCase().includes(q) || String(r.value).toLowerCase().includes(q);
      }),
    }))
    .filter((g) => g.rows.length > 0);

  if (!metadata || groups.length === 0) {
    return <p className="rp-muted">No file data was included in this report.</p>;
  }

  return (
    <div>
      <div className="rp-toolbar">
        <label className="rp-search">
          <Search size={16} aria-hidden="true" />
          <span className="rp-sr">Search file data</span>
          <input
            type="search"
            placeholder="Search file data…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {emptyCount > 0 && (
          <button type="button" className="rp-btn rp-btn-ghost" onClick={() => setShowEmpty((v) => !v)}>
            {showEmpty ? "Hide" : "Show"} empty fields ({emptyCount})
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="rp-empty">
          <Search size={28} aria-hidden="true" />
          <p className="rp-small">No fields match your search.</p>
        </div>
      ) : (
        visible.map((g) => (
          <div className="rp-mgroup" key={g.id}>
            <h4>{g.title}</h4>
            <div className="rp-mtable">
              {g.rows.map((r) => (
                <div className="rp-mrow" key={r.key}>
                  <span className="rp-mkey">{r.key}</span>
                  <span className="rp-mval" data-empty={r.empty ? "true" : "false"}>
                    {r.empty ? "Not available" : String(r.value)}
                  </span>
                  {!r.empty ? (
                    <button
                      type="button"
                      className="rp-mcopy"
                      aria-label={`Copy ${r.key}`}
                      onClick={() => onCopy(`m-${r.key}`, r.value)}
                    >
                      {copied === `m-${r.key}` ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ---------- provenance ---------- */

function ProvenanceView({ provenance }) {
  if (!provenance) {
    return (
      <p className="rp-muted">
        Origin-record information is unavailable. A missing record is not proof of fabrication.
      </p>
    );
  }

  const src = String(provenance.digital_source_type || "").toLowerCase();
  const declaresAi = /ai generated|ai edited|trainedalgorithmic|compositewith|compositesynthetic/.test(src);
  const found = !!provenance.detected;

  let state;
  if (declaresAi) {
    state = {
      color: "#fb7185",
      icon: ShieldAlert,
      title: "The file declares AI involvement",
      text: "Its own metadata states that AI generated or edited it.",
    };
  } else if (found) {
    state = {
      color: "#34d399",
      icon: ShieldCheck,
      title: "Origin record found",
      text: "A Content Credentials (C2PA) record is present. Its signature was not cryptographically validated here.",
    };
  } else {
    state = {
      color: "#94a3b8",
      icon: Info,
      title: "No origin record found (this is normal)",
      text: "Most real photos and videos carry none, and apps often remove it. It is neither good nor bad news.",
    };
  }
  const StateIcon = state.icon;
  const actions = Array.isArray(provenance.actions) ? provenance.actions : [];

  return (
    <div>
      <div className="rp-prov-status" style={{ "--chip": state.color }}>
        <StateIcon size={30} aria-hidden="true" />
        <div>
          <div style={{ fontWeight: 700 }}>{state.title}</div>
          <div className="rp-muted rp-small">{state.text}</div>
        </div>
      </div>

      <dl className="rp-rows" style={{ margin: 0 }}>
        <InfoRow label="Status" value={provenance.status} />
        <InfoRow label="Record type" value={provenance.manifest_type} />
        <InfoRow label="Created with" value={provenance.claim_generator} />
        <InfoRow label="Creator" value={provenance.creator} />
        <InfoRow label="Source type" value={provenance.digital_source_type} />
      </dl>

      {provenance.explanation && (
        <p className="rp-muted rp-small" style={{ marginTop: 14 }}>
          {provenance.explanation}
        </p>
      )}

      {actions.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div className="rp-key-title">History recorded in the file</div>
          <div className="rp-timeline">
            {actions.map((a, i) => (
              <div className="rp-tl-item" key={`${i}-${a?.action}`}>
                <div className="rp-tl-title">{a?.action || "Action"}</div>
                <div className="rp-muted rp-small">
                  {[a?.software, a?.detail, a?.timestamp].filter((x) => !isEmptyValue(x)).join(" · ") || "No extra detail"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="rp-small" style={{ marginTop: 18 }}>
        <a
          href="https://contentcredentials.org/verify"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--rp-accent)" }}
        >
          Check Content Credentials independently
        </a>
      </p>
    </div>
  );
}

/* ---------- action plan ---------- */

const VERIFY_TOOLS = [
  {
    id: "lens",
    title: "Google Lens",
    text: "Reverse image search to find where it first appeared.",
    href: "https://lens.google.com/",
    media: ["image"],
  },
  {
    id: "tineye",
    title: "TinEye",
    text: "Find older or original copies of an image.",
    href: "https://tineye.com/",
    media: ["image"],
  },
  {
    id: "foto",
    title: "FotoForensics",
    text: "Second opinion with compression analysis.",
    href: "https://fotoforensics.com/",
    media: ["image"],
  },
  {
    id: "cc",
    title: "Content Credentials Verify",
    text: "Validate signed origin records (C2PA).",
    href: "https://contentcredentials.org/verify",
    media: ["image", "video", "audio", "document"],
  },
];

function ActionPlan({ recommendations, verdictKey, mediaType }) {
  const [done, setDone] = useState({});
  const total = recommendations.length;
  const doneCount = recommendations.filter((_, i) => done[i]).length;
  const tools = VERIFY_TOOLS.filter((t) => t.media.includes(String(mediaType || "image").toLowerCase()));

  return (
    <div>
      {total > 0 ? (
        <>
          <div className="rp-muted rp-small">
            {doneCount} of {total} steps done
          </div>
          <div className="rp-progress" aria-hidden="true">
            <i style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }} />
          </div>
          {recommendations.map((item, i) => (
            <button
              key={`${i}-${item}`}
              type="button"
              role="checkbox"
              aria-checked={!!done[i]}
              className="rp-check"
              onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}
            >
              <span className="rp-box">
                <Check size={14} />
              </span>
              <span className="rp-check-text">{item}</span>
            </button>
          ))}
        </>
      ) : (
        <p className="rp-muted">No extra steps were suggested for this file.</p>
      )}

      {tools.length > 0 && (
        <>
          <div className="rp-key-title" style={{ marginTop: 22 }}>
            Verify it yourself
          </div>
          <div className="rp-tools">
            {tools.map((t) => (
              <a key={t.id} className="rp-tool" href={t.href} target="_blank" rel="noopener noreferrer">
                <strong>{t.title}</strong>
                <span className="rp-muted rp-small">{t.text}</span>
              </a>
            ))}
          </div>
        </>
      )}

      {verdictKey !== "authentic" && (
        <div className="rp-scam">
          <strong>If money, a job or an identity is involved</strong>
          <p className="rp-muted rp-small" style={{ marginTop: 6 }}>
            Do not pay or share OTPs/documents based on an image alone. Confirm through a call you place
            yourself. In India, report cyber fraud at{" "}
            <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: "#fda4af" }}>
              cybercrime.gov.in
            </a>{" "}
            or call helpline <strong>1930</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------- loading and error ---------- */

function LoadingView() {
  const block = (h, w = "100%", extra = {}) => (
    <div className="rp-sk" style={{ height: h, width: w, ...extra }} />
  );
  return (
    <div className="rp" aria-busy="true" aria-live="polite">
      <span className="rp-sr">Loading analysis report</span>
      {block(40, "46%")}
      <div className="rp-card" style={{ display: "grid", gap: 14 }}>
        {block(26, "30%")}
        {block(44, "70%")}
        {block(16, "90%")}
        {block(16, "62%")}
        <div style={{ display: "flex", gap: 12 }}>
          {block(120, "50%", { borderRadius: 14 })}
          {block(120, "50%", { borderRadius: 14 })}
        </div>
      </div>
      <div className="rp-layout">
        <div className="rp-card" style={{ display: "grid", gap: 12 }}>
          {block(40)}
          {block(64)}
          {block(64)}
          {block(64)}
        </div>
        <div className="rp-card" style={{ display: "grid", gap: 12 }}>
          {block(22, "50%")}
          {block(10)}
          {block(10)}
          {block(10)}
        </div>
      </div>
    </div>
  );
}

function ErrorView({ message, onRetry }) {
  return (
    <div className="rp">
      <div className="rp-card rp-error" role="alert">
        <div className="rp-error-icon">
          <AlertTriangle size={30} aria-hidden="true" />
        </div>
        <h2>We could not open this report</h2>
        <p className="rp-muted">{message || "The requested analysis report could not be found."}</p>
        <p className="rp-muted rp-small">
          Reports can expire if the server restarted. If that happened, run a new analysis.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <button type="button" className="rp-btn rp-btn-primary" onClick={onRetry}>
            <RefreshCcw size={16} />
            Try again
          </button>
          <Link to="/analyze" className="rp-btn">
            <PlusCircle size={16} />
            New analysis
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Main report view
 * ------------------------------------------------------------------------- */

const Styles = () => <style>{REPORT_CSS}</style>;

const TAB_IDS = ["findings", "details", "provenance", "actions"];

export function ReportView({ data }) {
  const navigate = useNavigate();

  const [lang, setLangState] = useState(() => (storage.get("rp-lang", "en") === "hi" ? "hi" : "en"));
  const [activeTab, setActiveTab] = useState("findings");
  const [filter, setFilter] = useState("all");
  const [flashId, setFlashId] = useState("");
  const [toast, setToast] = useState("");
  const [showSticky, setShowSticky] = useState(false);
  const [copied, copy] = useCopyState();

  const heroRef = useRef(null);
  const toastTimer = useRef(null);
  const flashTimer = useRef(null);

  const setLang = (value) => {
    setLangState(value);
    storage.set("rp-lang", value);
  };

  /* ---------- derived data ---------- */

  const verdict = useMemo(() => getVerdict(data.assessment), [data.assessment]);
  const signals = useMemo(() => normalizeSignals(data.signals), [data.signals]);
  const risk = useMemo(() => computeRisk(signals), [signals]);
  const confidence = useMemo(() => toPercent(data.confidence_score), [data.confidence_score]);

  const evidence = useMemo(() => {
    const list = Array.isArray(data.evidence_list) ? data.evidence_list : [];
    return list
      .filter((e) => e && typeof e === "object")
      .map((e, i) => ({ ...e, _k: `${String(e.id || "ev").replace(/[^a-z0-9_-]/gi, "_")}-${i}`, _i: i }));
  }, [data.evidence_list]);

  const sortedEvidence = useMemo(
    () =>
      [...evidence].sort(
        (a, b) => getSeverity(b.severity).rank - getSeverity(a.severity).rank || a._i - b._i
      ),
    [evidence]
  );

  const keyFindings = useMemo(
    () => sortedEvidence.filter((e) => getSeverity(e.severity).rank >= 3).slice(0, 4),
    [sortedEvidence]
  );

  const visibleEvidence = useMemo(() => {
    if (filter === "important") return sortedEvidence.filter((e) => getSeverity(e.severity).rank >= 3);
    if (filter === "context") return sortedEvidence.filter((e) => getSeverity(e.severity).rank <= 2);
    return sortedEvidence;
  }, [sortedEvidence, filter]);

  const [openIds, setOpenIds] = useState(
    () => new Set(sortedEvidence.filter((e) => getSeverity(e.severity).rank >= 4).map((e) => e._k))
  );

  const recommendations = useMemo(
    () => (Array.isArray(data.recommendations) ? data.recommendations.filter(Boolean) : []),
    [data.recommendations]
  );

  const methods = useMemo(() => detectMethods(data, evidence), [data, evidence]);
  const fileSize = data.metadata?.["File Size"] || formatBytes(data.file_size_bytes) || null;

  /* ---------- effects ---------- */

  useEffect(() => {
    const previous = document.title;
    document.title = `${data.assessment || "Report"} · ${data.filename || "Analysis"} | AuthenticityAI`;
    return () => {
      document.title = previous;
    };
  }, [data.assessment, data.filename]);

  useEffect(() => {
    const node = heroRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0, rootMargin: "-8px 0px 0px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(toastTimer.current);
      window.clearTimeout(flashTimer.current);
    },
    []
  );

  /* ---------- actions ---------- */

  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2600);
  }, []);

  const handleCopy = useCallback(
    async (key, text) => {
      const ok = await copy(key, text);
      if (!ok) showToast("Copy is not supported in this browser.");
    },
    [copy, showToast]
  );

  const handleDownload = () => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safe = String(data.filename || "media").replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
      link.href = url;
      link.download = `analysis_${safe}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast("Report download started.");
    } catch (err) {
      console.error("Report download failed:", err);
      showToast("Unable to download the report.");
    }
  };

  const handlePrint = () => window.print();

  const summaryText = useMemo(
    () => buildSummaryText(data, verdict, risk, confidence),
    [data, verdict, risk, confidence]
  );

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "AuthenticityAI report", text: summaryText, url });
        return;
      }
      const ok = await copyText(url);
      showToast(ok ? "Report link copied." : "Sharing is not supported in this browser.");
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error("Sharing failed:", err);
        showToast("Unable to share the report.");
      }
    }
  };

  const handleCopySummary = async () => {
    const ok = await copyText(`${summaryText}\n${window.location.href}`);
    showToast(ok ? "Summary copied. Paste it anywhere." : "Unable to copy the summary.");
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `${summaryText}\n${typeof window !== "undefined" ? window.location.href : ""}`
  )}`;

  const toggleEvidence = useCallback((key) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const setAllEvidence = useCallback(
    (open) => setOpenIds(open ? new Set(visibleEvidence.map((e) => e._k)) : new Set()),
    [visibleEvidence]
  );

  const jumpToEvidence = useCallback((key) => {
    setActiveTab("findings");
    setFilter("all");
    setOpenIds((prev) => new Set(prev).add(key));
    setFlashId(key);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashId(""), 1800);
    window.setTimeout(() => {
      const el = document.getElementById(`rp-ev-${key}`);
      if (el) {
        el.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "center",
        });
      }
    }, 120);
  }, []);

  const tabs = [
    { id: "findings", label: "Findings", icon: Search, count: evidence.length },
    { id: "details", label: "File data", icon: Database },
    { id: "provenance", label: "Origin record", icon: History },
    { id: "actions", label: "Next steps", icon: Lightbulb, count: recommendations.length || undefined },
  ];

  const onTabKey = (event) => {
    const index = TAB_IDS.indexOf(activeTab);
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % TAB_IDS.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + TAB_IDS.length) % TAB_IDS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TAB_IDS.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(TAB_IDS[next]);
    const el = document.getElementById(`rp-tab-${TAB_IDS[next]}`);
    if (el) el.focus();
  };

  /* ---------- render ---------- */

  return (
    <div className="rp">
      <Styles />

      <StickyBar
        show={showSticky}
        verdict={verdict}
        filename={data.filename}
        onShare={handleShare}
        onPrint={handlePrint}
      />

      <div className="rp-print-head" aria-hidden="true">
        <strong>AuthenticityAI · Automated screening report</strong>
        <span>
          {data.analysis_id ? `ID ${data.analysis_id}` : ""} · {formatDate(data.analyzed_at)}
        </span>
      </div>

      <header className="rp-top rp-in">
        <div className="rp-top-left">
          <button type="button" className="rp-btn rp-btn-icon" aria-label="Go back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <div className="rp-crumb">
            <div className="rp-eyebrow">Forensic report</div>
            <h1 className="rp-title">{data.filename || "Unnamed file"}</h1>
          </div>
        </div>

        <div className="rp-actions">
          <button type="button" className="rp-btn" onClick={handleShare}>
            <Share2 size={15} />
            <span className="rp-btn-label">Share</span>
          </button>
          <button type="button" className="rp-btn" onClick={handleCopySummary}>
            <Copy size={15} />
            <span className="rp-btn-label">Copy summary</span>
          </button>
          <a className="rp-btn" href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <FileText size={15} />
            <span className="rp-btn-label">WhatsApp</span>
          </a>
          <button type="button" className="rp-btn" onClick={handleDownload}>
            <Download size={15} />
            <span className="rp-btn-label">JSON</span>
          </button>
          <button type="button" className="rp-btn" onClick={handlePrint}>
            <Printer size={15} />
            <span className="rp-btn-label">Print</span>
          </button>
          <Link to="/analyze" className="rp-btn rp-btn-primary">
            <PlusCircle size={15} />
            <span className="rp-btn-label">New analysis</span>
          </Link>
        </div>
      </header>

      <VerdictHero
        data={data}
        verdict={verdict}
        lang={lang}
        setLang={setLang}
        risk={risk}
        confidence={confidence}
        keyFindings={keyFindings}
        onJump={jumpToEvidence}
        heroRef={heroRef}
      />

      <LimitNotice methods={methods} reasons={data.uncertainty_reasons} />

      <div className="rp-layout">
        <main className="rp-main">
          <section className="rp-card rp-in" style={{ animationDelay: "180ms" }}>
            <div className="rp-tabs" role="tablist" aria-label="Report sections" onKeyDown={onTabKey}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`rp-tab-${tab.id}`}
                    type="button"
                    role="tab"
                    className="rp-tab"
                    aria-selected={selected}
                    aria-controls={`rp-panel-${tab.id}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {tab.label}
                    {tab.count !== undefined && <span className="rp-tab-count">{tab.count}</span>}
                  </button>
                );
              })}
            </div>

            <div
              id="rp-panel-findings"
              role="tabpanel"
              aria-labelledby="rp-tab-findings"
              className="rp-panel"
              data-active={activeTab === "findings" ? "true" : "false"}
            >
              <EvidenceList
                items={visibleEvidence}
                total={evidence.length}
                openIds={openIds}
                flashId={flashId}
                onToggle={toggleEvidence}
                setAll={setAllEvidence}
                filter={filter}
                setFilter={setFilter}
                copied={copied}
                onCopy={handleCopy}
              />
            </div>

            <div
              id="rp-panel-details"
              role="tabpanel"
              aria-labelledby="rp-tab-details"
              className="rp-panel"
              data-active={activeTab === "details" ? "true" : "false"}
            >
              <MetadataExplorer metadata={data.metadata} copied={copied} onCopy={handleCopy} />
            </div>

            <div
              id="rp-panel-provenance"
              role="tabpanel"
              aria-labelledby="rp-tab-provenance"
              className="rp-panel"
              data-active={activeTab === "provenance" ? "true" : "false"}
            >
              <ProvenanceView provenance={data.provenance} />
            </div>

            <div
              id="rp-panel-actions"
              role="tabpanel"
              aria-labelledby="rp-tab-actions"
              className="rp-panel"
              data-active={activeTab === "actions" ? "true" : "false"}
            >
              <ActionPlan
                recommendations={recommendations}
                verdictKey={verdict.key}
                mediaType={data.media_type}
              />
            </div>
          </section>
        </main>

        <aside className="rp-side">
          <section className="rp-card rp-in" style={{ animationDelay: "200ms" }}>
            <CardTitle icon={Layers}>What each check found</CardTitle>
            <SignalPanel signals={signals} provenance={data.provenance} />
          </section>

          <MethodsCard methods={methods} />

          <CustodyCard data={data} fileSize={fileSize} onCopy={handleCopy} copied={copied} />
        </aside>
      </div>

      <footer className="rp-foot rp-in" style={{ animationDelay: "320ms" }}>
        <Info size={18} aria-hidden="true" />
        <div>
          <strong style={{ color: "var(--rp-text)" }}>Read this before relying on the report. </strong>
          This is an automated screening, not proof. Detectors can miss new AI tools and can flag genuine
          files. Confirm anything involving identity, money, legal or safety decisions with a trusted source.
          {data.disclaimer ? ` ${data.disclaimer}` : ""}
        </div>
      </footer>

      {toast && (
        <div className="rp-toast" role="status">
          <CheckCircle size={16} aria-hidden="true" />
          {toast}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Page: fetch + states
 * ------------------------------------------------------------------------- */

const Results = () => {
  const { analysisId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        err?.response?.data?.detail ||
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

  if (loading) {
    return (
      <>
        <Styles />
        <LoadingView />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Styles />
        <ErrorView message={error} onRetry={fetchResults} />
      </>
    );
  }

  return <ReportView key={data.analysis_id || analysisId} data={data} />;
};

export default Results;
