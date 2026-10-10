/**
 * =============================================================================
 *  History.jsx  -  AuthenticityAI analysis history (audit log)
 * =============================================================================
 *  Project ki need ke hisab se rebuild:
 *
 *   - Fake demo records HATA diye. Ab sirf api.getHistory() ka asli data dikhta
 *     hai, khali ho to proper empty state + "Analyze a file" button
 *   - "View report" ab /results/:analysis_id kholta hai (pehle /analyze jata tha)
 *   - Real stats: total, flagged, authentic, threat rate, 7-day activity,
 *     verdict mix, media type mix - sab tumhare records se nikalte hain
 *   - Search + media filter + verdict filter + sort, sab URL mein save
 *     (?q=&type=&verdict=&sort=) to refresh/share pe bhi wahi view
 *   - Row select, bulk export, CSV / JSON export (asli file download)
 *   - Remove / Clear: is device se hide hota hai (localStorage) aur reload ke
 *     baad bhi hidden rehta hai, Undo ke saath
 *   - Loading skeleton, error state with Retry, pagination
 *   - Mobile pe table cards ban jata hai
 *
 *  Backend contract same: api.getHistory() -> [{ analysis_id, filename,
 *  media_type, assessment, confidence, file_size_formatted, analyzed_at }]
 * =============================================================================
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  History as HistoryIcon,
  PlusCircle,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Download,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  X,
  Database,
  Undo2,
  Sparkles,
  Activity,
  HelpCircle,
  FileJson,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';

/* =============================================================================
   CONSTANTS
   ============================================================================= */

const PAGE_SIZE = 10;
const HIDDEN_KEY = 'authenticity_history_hidden';

const TONES = {
  danger: { label: 'Flagged', bg: 'rgba(239, 68, 68, 0.14)', color: '#f87171', border: 'rgba(239, 68, 68, 0.35)' },
  warn: { label: 'Flagged', bg: 'rgba(245, 158, 11, 0.14)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)' },
  ok: { label: 'Authentic', bg: 'rgba(16, 185, 129, 0.14)', color: '#34d399', border: 'rgba(16, 185, 129, 0.35)' },
  neutral: { label: 'Inconclusive', bg: 'rgba(148, 163, 184, 0.14)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.35)' }
};

const MEDIA_META = {
  image: { icon: ImageIcon, color: '#60a5fa', label: 'Image' },
  video: { icon: Video, color: '#fbbf24', label: 'Video' },
  audio: { icon: Music, color: '#34d399', label: 'Audio' },
  document: { icon: FileText, color: '#c084fc', label: 'Document' }
};

const TYPE_FILTERS = ['all', 'image', 'video', 'audio', 'document'];

const VERDICT_FILTERS = [
  { id: 'all', label: 'All verdicts' },
  { id: 'flagged', label: 'Flagged' },
  { id: 'authentic', label: 'Authentic' },
  { id: 'inconclusive', label: 'Inconclusive' }
];

const SORTS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'conf-high', label: 'Confidence: high to low' },
  { id: 'conf-low', label: 'Confidence: low to high' },
  { id: 'name', label: 'File name (A to Z)' }
];

/* =============================================================================
   HELPERS
   ============================================================================= */

function verdictTone(assessment) {
  const a = String(assessment || '').toLowerCase();
  if (a.includes('ai-generated') || a.includes('ai generated') || a.includes('synthetic')) return 'danger';
  if (a.includes('manipulated') || a.includes('suspicious') || a.includes('edited')) return 'warn';
  if (a.includes('authentic') || a.includes('genuine')) return 'ok';
  return 'neutral';
}

function parseConfidence(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace('%', ''));
  if (Number.isNaN(n)) return null;
  if (typeof value === 'number' && n <= 1) return n * 100;
  return Math.max(0, Math.min(100, n));
}

function normalizeRecord(raw) {
  const time = raw.analyzed_at ? new Date(raw.analyzed_at) : null;
  const validTime = time && !Number.isNaN(time.getTime()) ? time : null;
  return {
    id: String(raw.analysis_id ?? raw.id ?? `${raw.filename}-${raw.analyzed_at}`),
    filename: raw.filename || 'Untitled file',
    mediaType: String(raw.media_type || 'unknown').toLowerCase(),
    assessment: raw.assessment || 'Inconclusive',
    tone: verdictTone(raw.assessment),
    confidence: parseConfidence(raw.confidence),
    sizeLabel: raw.file_size_formatted || '',
    time: validTime,
    raw
  };
}

function formatDate(date) {
  if (!date) return 'Unknown';
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function relativeTime(date) {
  if (!date) return '';
  const diff = Date.now() - date.getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? '' : 's'} ago`;
  return formatDate(date);
}

function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function loadHidden() {
  try {
    const raw = localStorage.getItem(HIDDEN_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (err) {
    return new Set();
  }
}

function saveHidden(set) {
  try {
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    /* storage can be blocked, safe to ignore */
  }
}

/* spreadsheet apps run text that starts with = + - @ as a formula, so defuse it */
function csvCell(value) {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(rows) {
  const header = ['analysis_id', 'filename', 'media_type', 'assessment', 'confidence_percent', 'file_size', 'analyzed_at'];
  const lines = rows.map((r) =>
    [
      r.id,
      r.filename,
      r.mediaType,
      r.assessment,
      r.confidence === null ? '' : r.confidence.toFixed(1),
      r.sizeLabel,
      r.time ? r.time.toISOString() : ''
    ]
      .map(csvCell)
      .join(',')
  );
  return [header.join(','), ...lines].join('\n');
}

function buildJson(rows) {
  return JSON.stringify(
    rows.map((r) => ({
      analysis_id: r.id,
      filename: r.filename,
      media_type: r.mediaType,
      assessment: r.assessment,
      confidence_percent: r.confidence === null ? null : Number(r.confidence.toFixed(1)),
      file_size: r.sizeLabel || null,
      analyzed_at: r.time ? r.time.toISOString() : null
    })),
    null,
    2
  );
}

function downloadText(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

/* =============================================================================
   SMALL COMPONENTS
   ============================================================================= */

function VerdictBadge({ tone, text }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span className="hs-badge" style={{ background: t.bg, color: t.color, borderColor: t.border }}>
      {text}
    </span>
  );
}

function ConfidenceCell({ value, tone }) {
  if (value === null) return <span className="hs-muted">Not reported</span>;
  const t = TONES[tone] || TONES.neutral;
  return (
    <div className="hs-conf">
      <b>{value.toFixed(1)}%</b>
      <span className="hs-conf-bar">
        <i style={{ width: `${value}%`, background: t.color }} />
      </span>
    </div>
  );
}

function MediaChip({ type }) {
  const meta = MEDIA_META[type];
  if (!meta) return <span className="hs-media">{type}</span>;
  const Icon = meta.icon;
  return (
    <span className="hs-media" style={{ '--mc': meta.color }}>
      <Icon size={14} />
      {meta.label}
    </span>
  );
}

/* =============================================================================
   PAGE
   ============================================================================= */

export default function HistoryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [hidden, setHidden] = useState(() => loadHidden());
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);

  const mountedRef = useRef(true);
  const searchRef = useRef(null);
  const toastTimerRef = useRef(null);

  /* ---- filters live in the URL ---- */
  const search = searchParams.get('q') || '';
  const typeFilter = TYPE_FILTERS.includes(searchParams.get('type')) ? searchParams.get('type') : 'all';
  const verdictFilter = VERDICT_FILTERS.some((v) => v.id === searchParams.get('verdict'))
    ? searchParams.get('verdict')
    : 'all';
  const sortBy = SORTS.some((s) => s.id === searchParams.get('sort')) ? searchParams.get('sort') : 'newest';

  const setParam = useCallback(
    (key, value, defaultValue) => {
      const next = new URLSearchParams(searchParams);
      if (!value || value === defaultValue) next.delete(key);
      else next.set(key, value);
      setSearchParams(next, { replace: true });
      setPage(1);
    },
    [searchParams, setSearchParams]
  );

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
    setPage(1);
  };

  /* ---------------------------------------------------------------------- */
  /* data                                                                    */
  /* ---------------------------------------------------------------------- */

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await api.getHistory();
      if (!mountedRef.current) return;
      const list = Array.isArray(data) ? data : [];
      setRecords(list.map(normalizeRecord));
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('Failed to load history:', err);
      const status = err && err.response && err.response.status;
      setLoadError(
        status === 401 || status === 403
          ? 'Your session has expired. Sign in again to see your history.'
          : 'We could not load your history. Check that the backend is running, then try again.'
      );
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadHistory();
    return () => {
      mountedRef.current = false;
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [loadHistory]);

  /* press "/" to jump to search */
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target && e.target.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        if (searchRef.current) searchRef.current.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* ---------------------------------------------------------------------- */
  /* derived data                                                            */
  /* ---------------------------------------------------------------------- */

  const visible = useMemo(() => records.filter((r) => !hidden.has(r.id)), [records, hidden]);

  const stats = useMemo(() => {
    const total = visible.length;
    const flagged = visible.filter((r) => r.tone === 'danger' || r.tone === 'warn').length;
    const authentic = visible.filter((r) => r.tone === 'ok').length;
    const inconclusive = total - flagged - authentic;
    const rate = total > 0 ? (flagged / total) * 100 : 0;

    const byType = {};
    visible.forEach((r) => {
      byType[r.mediaType] = (byType[r.mediaType] || 0) + 1;
    });

    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push({
        key: dayKey(d),
        label: d.toLocaleDateString(undefined, { weekday: 'short' }),
        count: 0,
        flagged: 0
      });
    }
    visible.forEach((r) => {
      if (!r.time) return;
      const slot = days.find((d) => d.key === dayKey(r.time));
      if (slot) {
        slot.count += 1;
        if (r.tone === 'danger' || r.tone === 'warn') slot.flagged += 1;
      }
    });
    const maxDay = Math.max(1, ...days.map((d) => d.count));

    return { total, flagged, authentic, inconclusive, rate, byType, days, maxDay };
  }, [visible]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = visible.filter((r) => {
      if (typeFilter !== 'all' && r.mediaType !== typeFilter) return false;
      if (verdictFilter === 'flagged' && !(r.tone === 'danger' || r.tone === 'warn')) return false;
      if (verdictFilter === 'authentic' && r.tone !== 'ok') return false;
      if (verdictFilter === 'inconclusive' && r.tone !== 'neutral') return false;
      if (term) {
        return (
          r.filename.toLowerCase().includes(term) ||
          r.assessment.toLowerCase().includes(term) ||
          r.id.toLowerCase().includes(term)
        );
      }
      return true;
    });

    const byTime = (r) => (r.time ? r.time.getTime() : 0);
    const byConf = (r) => (r.confidence === null ? -1 : r.confidence);
    const sorted = [...list];
    if (sortBy === 'newest') sorted.sort((a, b) => byTime(b) - byTime(a));
    if (sortBy === 'oldest') sorted.sort((a, b) => byTime(a) - byTime(b));
    if (sortBy === 'conf-high') sorted.sort((a, b) => byConf(b) - byConf(a));
    if (sortBy === 'conf-low') sorted.sort((a, b) => byConf(a) - byConf(b));
    if (sortBy === 'name') sorted.sort((a, b) => a.filename.localeCompare(b.filename));
    return sorted;
  }, [visible, search, typeFilter, verdictFilter, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const hasActiveFilters = Boolean(search) || typeFilter !== 'all' || verdictFilter !== 'all';

  const selectedRows = useMemo(() => visible.filter((r) => selected.has(r.id)), [visible, selected]);
  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

  /* ---------------------------------------------------------------------- */
  /* actions                                                                 */
  /* ---------------------------------------------------------------------- */

  const showToast = useCallback((message, undoIds) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, undoIds });
    toastTimerRef.current = setTimeout(() => setToast(null), 7000);
  }, []);

  const hideIds = (ids) => {
    if (ids.length === 0) return;
    const next = new Set(hidden);
    ids.forEach((id) => next.add(id));
    setHidden(next);
    saveHidden(next);
    setSelected((prev) => {
      const copy = new Set(prev);
      ids.forEach((id) => copy.delete(id));
      return copy;
    });
    showToast(`${ids.length} record${ids.length === 1 ? '' : 's'} removed from this device.`, ids);
  };

  const undoHide = () => {
    if (!toast || !toast.undoIds) return;
    const next = new Set(hidden);
    toast.undoIds.forEach((id) => next.delete(id));
    setHidden(next);
    saveHidden(next);
    setToast(null);
  };

  const clearAll = () => {
    if (visible.length === 0) return;
    const ok = window.confirm(
      `Remove all ${visible.length} records from this device? They will no longer show here. You can undo right after.`
    );
    if (ok) hideIds(visible.map((r) => r.id));
  };

  const restoreAllHidden = () => {
    setHidden(new Set());
    saveHidden(new Set());
  };

  const openReport = (id) => navigate(`/results/${id}`);

  const toggleRow = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) pageRows.forEach((r) => next.delete(r.id));
      else pageRows.forEach((r) => next.add(r.id));
      return next;
    });
  };

  const exportRows = (rows, format) => {
    if (rows.length === 0) return;
    if (format === 'csv') {
      downloadText(`authenticity-history-${stamp()}.csv`, buildCsv(rows), 'text/csv;charset=utf-8');
    } else {
      downloadText(`authenticity-history-${stamp()}.json`, buildJson(rows), 'application/json');
    }
  };

  const hiddenCount = records.filter((r) => hidden.has(r.id)).length;

  /* ---------------------------------------------------------------------- */
  /* render pieces                                                           */
  /* ---------------------------------------------------------------------- */

  const statCards = [
    {
      id: 'total',
      icon: Database,
      color: '#60a5fa',
      value: stats.total,
      label: 'Total analyses',
      active: verdictFilter === 'all',
      onClick: () => setParam('verdict', 'all', 'all')
    },
    {
      id: 'flagged',
      icon: AlertTriangle,
      color: '#f87171',
      value: stats.flagged,
      label: 'Flagged as AI or edited',
      active: verdictFilter === 'flagged',
      onClick: () => setParam('verdict', 'flagged', 'all')
    },
    {
      id: 'authentic',
      icon: ShieldCheck,
      color: '#34d399',
      value: stats.authentic,
      label: 'Likely authentic',
      active: verdictFilter === 'authentic',
      onClick: () => setParam('verdict', 'authentic', 'all')
    },
    {
      id: 'rate',
      icon: Activity,
      color: '#fbbf24',
      value: `${stats.rate.toFixed(1)}%`,
      label: 'Flag rate',
      active: false,
      onClick: null
    }
  ];

  const mixTotal = Math.max(1, stats.total);

  const renderSkeleton = () => (
    <div className="hs-panel" aria-busy="true" aria-label="Loading history">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="hs-skel-row">
          <span className="hs-skel" style={{ width: '34%' }} />
          <span className="hs-skel" style={{ width: '10%' }} />
          <span className="hs-skel" style={{ width: '16%' }} />
          <span className="hs-skel" style={{ width: '12%' }} />
          <span className="hs-skel" style={{ width: '14%' }} />
        </div>
      ))}
    </div>
  );

  const renderEmpty = () => (
    <div className="hs-panel hs-empty">
      <div className="hs-empty-ico">
        <HistoryIcon size={32} />
      </div>
      {visible.length === 0 ? (
        <>
          <h3>No analyses yet</h3>
          <p>
            Every file you analyze is saved here with its verdict, confidence and report, so you can
            come back to it later.
          </p>
          <Link to="/analyze" className="hs-btn hs-btn-primary">
            <PlusCircle size={16} /> Analyze your first file
          </Link>
          {hiddenCount > 0 && (
            <button type="button" className="hs-link" onClick={restoreAllHidden}>
              Show {hiddenCount} record{hiddenCount === 1 ? '' : 's'} removed from this device
            </button>
          )}
        </>
      ) : (
        <>
          <h3>No records match these filters</h3>
          <p>Try a different search word, or clear the filters to see all {visible.length} records.</p>
          <button type="button" className="hs-btn hs-btn-ghost" onClick={clearFilters}>
            <X size={16} /> Clear filters
          </button>
        </>
      )}
    </div>
  );

  /* ---------------------------------------------------------------------- */
  /* render                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="hs-page">
      <style>{HISTORY_CSS}</style>

      {/* header */}
      <header className="hs-header">
        <div>
          <span className="hs-pill">
            <Sparkles size={13} /> Analysis history
          </span>
          <h1>Your forensic analyses</h1>
          <p>
            Every file you have checked, with its verdict and confidence. Open a record to see the
            full evidence report.
          </p>
        </div>
        <div className="hs-header-btns">
          <button type="button" className="hs-btn hs-btn-ghost" onClick={loadHistory} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'hs-spin' : ''} /> Refresh
          </button>
          <button
            type="button"
            className="hs-btn hs-btn-danger"
            onClick={clearAll}
            disabled={visible.length === 0}
          >
            <Trash2 size={15} /> Clear history
          </button>
          <Link to="/analyze" className="hs-btn hs-btn-primary">
            <PlusCircle size={16} /> New analysis
          </Link>
        </div>
      </header>

      {loadError && (
        <div className="hs-alert" role="alert">
          <AlertTriangle size={20} />
          <span>{loadError}</span>
          <button type="button" className="hs-btn hs-btn-ghost hs-small" onClick={loadHistory}>
            <RefreshCw size={13} /> Try again
          </button>
        </div>
      )}

      {/* stat cards */}
      <section className="hs-stats" aria-label="Summary">
        {statCards.map((c) => {
          const Icon = c.icon;
          const Tag = c.onClick ? 'button' : 'div';
          return (
            <Tag
              key={c.id}
              type={c.onClick ? 'button' : undefined}
              className={`hs-stat${c.active && c.onClick ? ' is-active' : ''}${c.onClick ? ' is-click' : ''}`}
              style={{ '--sc': c.color }}
              onClick={c.onClick || undefined}
            >
              <span className="hs-stat-ico">
                <Icon size={22} />
              </span>
              <span className="hs-stat-text">
                <b>{loading ? '-' : c.value}</b>
                <small>{c.label}</small>
              </span>
            </Tag>
          );
        })}
      </section>

      {/* insights */}
      {!loading && stats.total > 0 && (
        <section className="hs-insights" aria-label="Insights">
          <div className="hs-panel hs-insight">
            <div className="hs-insight-head">
              <h3>Last 7 days</h3>
              <span className="hs-legend">
                <i style={{ background: '#60a5fa' }} /> Analyses
                <i style={{ background: '#f87171' }} /> Flagged
              </span>
            </div>
            <div className="hs-bars">
              {stats.days.map((d) => (
                <div key={d.key} className="hs-bar-col" title={`${d.count} analyses, ${d.flagged} flagged`}>
                  <div className="hs-bar-track">
                    <div className="hs-bar-fill" style={{ height: `${(d.count / stats.maxDay) * 100}%` }}>
                      {d.flagged > 0 && (
                        <span
                          className="hs-bar-flag"
                          style={{ height: `${(d.flagged / d.count) * 100}%` }}
                        />
                      )}
                    </div>
                  </div>
                  <span className="hs-bar-num">{d.count}</span>
                  <span className="hs-bar-day">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hs-panel hs-insight">
            <div className="hs-insight-head">
              <h3>Verdict mix</h3>
              <span className="hs-muted">{stats.total} total</span>
            </div>
            <div className="hs-mix" role="img" aria-label="Verdict distribution">
              <span style={{ width: `${(stats.flagged / mixTotal) * 100}%`, background: '#f87171' }} />
              <span style={{ width: `${(stats.authentic / mixTotal) * 100}%`, background: '#34d399' }} />
              <span style={{ width: `${(stats.inconclusive / mixTotal) * 100}%`, background: '#64748b' }} />
            </div>
            <div className="hs-mix-legend">
              <span><i style={{ background: '#f87171' }} /> Flagged <b>{stats.flagged}</b></span>
              <span><i style={{ background: '#34d399' }} /> Authentic <b>{stats.authentic}</b></span>
              <span><i style={{ background: '#64748b' }} /> Inconclusive <b>{stats.inconclusive}</b></span>
            </div>
            <div className="hs-types">
              {Object.keys(stats.byType).map((t) => {
                const meta = MEDIA_META[t];
                const Icon = meta ? meta.icon : HelpCircle;
                return (
                  <button
                    key={t}
                    type="button"
                    className="hs-type-chip"
                    style={{ '--mc': meta ? meta.color : '#94a3b8' }}
                    onClick={() => setParam('type', t, 'all')}
                  >
                    <Icon size={14} />
                    {meta ? meta.label : t}
                    <b>{stats.byType[t]}</b>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* toolbar */}
      <section className="hs-panel hs-toolbar" aria-label="Filters">
        <div className="hs-search">
          <Search size={17} />
          <input
            ref={searchRef}
            type="text"
            className="hs-input"
            placeholder="Search by file name, verdict or ID   ( press / )"
            value={search}
            onChange={(e) => setParam('q', e.target.value, '')}
            aria-label="Search history"
          />
          {search && (
            <button type="button" className="hs-search-clear" onClick={() => setParam('q', '', '')} aria-label="Clear search">
              <X size={15} />
            </button>
          )}
        </div>

        <div className="hs-chips" role="group" aria-label="Media type">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              type="button"
              className={`hs-chip${typeFilter === t ? ' is-on' : ''}`}
              onClick={() => setParam('type', t, 'all')}
            >
              {t === 'all' ? 'All media' : MEDIA_META[t].label}
            </button>
          ))}
        </div>

        <div className="hs-selects">
          <select
            className="hs-select"
            value={verdictFilter}
            onChange={(e) => setParam('verdict', e.target.value, 'all')}
            aria-label="Verdict filter"
          >
            {VERDICT_FILTERS.map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
          <select
            className="hs-select"
            value={sortBy}
            onChange={(e) => setParam('sort', e.target.value, 'newest')}
            aria-label="Sort order"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </section>

      {/* bulk bar */}
      {selectedRows.length > 0 && (
        <div className="hs-bulk" role="status">
          <b>{selectedRows.length} selected</b>
          <div className="hs-bulk-btns">
            <button type="button" className="hs-btn hs-btn-ghost hs-small" onClick={() => exportRows(selectedRows, 'csv')}>
              <FileSpreadsheet size={14} /> Export CSV
            </button>
            <button type="button" className="hs-btn hs-btn-ghost hs-small" onClick={() => exportRows(selectedRows, 'json')}>
              <FileJson size={14} /> Export JSON
            </button>
            <button type="button" className="hs-btn hs-btn-danger hs-small" onClick={() => hideIds(selectedRows.map((r) => r.id))}>
              <Trash2 size={14} /> Remove
            </button>
            <button type="button" className="hs-btn hs-btn-ghost hs-small" onClick={() => setSelected(new Set())}>
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* records */}
      {loading ? (
        renderSkeleton()
      ) : filtered.length === 0 ? (
        loadError ? null : renderEmpty()
      ) : (
        <section className="hs-panel hs-table-wrap" aria-label="Analysis records">
          <div className="hs-table-top">
            <span>
              {filtered.length} record{filtered.length === 1 ? '' : 's'}
              {hasActiveFilters ? ' match your filters' : ''}
            </span>
            <span className="hs-table-actions">
              {hasActiveFilters && (
                <button type="button" className="hs-link" onClick={clearFilters}>Clear filters</button>
              )}
              <button type="button" className="hs-btn hs-btn-ghost hs-small" onClick={() => exportRows(filtered, 'csv')}>
                <Download size={14} /> Export CSV
              </button>
              <button type="button" className="hs-btn hs-btn-ghost hs-small" onClick={() => exportRows(filtered, 'json')}>
                <Download size={14} /> JSON
              </button>
            </span>
          </div>

          <div className="hs-scroll">
            <table className="hs-table">
              <thead>
                <tr>
                  <th className="hs-col-check">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={togglePage}
                      aria-label="Select all records on this page"
                    />
                  </th>
                  <th>File</th>
                  <th>Media</th>
                  <th>Verdict</th>
                  <th>Confidence</th>
                  <th>Analyzed</th>
                  <th className="hs-col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr
                    key={r.id}
                    className={selected.has(r.id) ? 'is-selected' : ''}
                    tabIndex={0}
                    onClick={() => openReport(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target === e.currentTarget) openReport(r.id);
                    }}
                  >
                    <td className="hs-col-check" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onChange={() => toggleRow(r.id)}
                        aria-label={`Select ${r.filename}`}
                      />
                    </td>
                    <td data-label="File">
                      <div className="hs-file">
                        <b title={r.filename}>{r.filename}</b>
                        <small>{r.sizeLabel || 'Size not recorded'}</small>
                      </div>
                    </td>
                    <td data-label="Media">
                      <MediaChip type={r.mediaType} />
                    </td>
                    <td data-label="Verdict">
                      <VerdictBadge tone={r.tone} text={r.assessment} />
                    </td>
                    <td data-label="Confidence">
                      <ConfidenceCell value={r.confidence} tone={r.tone} />
                    </td>
                    <td data-label="Analyzed" title={formatDate(r.time)}>
                      <div className="hs-when">
                        <span>{relativeTime(r.time) || 'Unknown'}</span>
                        <small>{formatDate(r.time)}</small>
                      </div>
                    </td>
                    <td className="hs-col-actions" onClick={(e) => e.stopPropagation()}>
                      <button type="button" className="hs-view" onClick={() => openReport(r.id)}>
                        View report <ExternalLink size={13} />
                      </button>
                      <button
                        type="button"
                        className="hs-icon-btn"
                        onClick={() => hideIds([r.id])}
                        aria-label={`Remove ${r.filename} from this device`}
                        title="Remove from this device"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="hs-pager">
            <span>
              Showing {(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, filtered.length)} of{' '}
              {filtered.length}
            </span>
            <div className="hs-pager-btns">
              <button
                type="button"
                className="hs-icon-btn"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft size={17} />
              </button>
              <span className="hs-page-num">
                Page {safePage} of {pageCount}
              </span>
              <button
                type="button"
                className="hs-icon-btn"
                disabled={safePage >= pageCount}
                onClick={() => setPage(safePage + 1)}
                aria-label="Next page"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>
      )}

      {hiddenCount > 0 && visible.length > 0 && (
        <button type="button" className="hs-link hs-restore" onClick={restoreAllHidden}>
          {hiddenCount} record{hiddenCount === 1 ? ' is' : 's are'} hidden on this device. Show them again
        </button>
      )}

      {/* undo toast */}
      {toast && (
        <div className="hs-toast" role="status">
          <span>{toast.message}</span>
          {toast.undoIds && (
            <button type="button" onClick={undoHide}>
              <Undo2 size={14} /> Undo
            </button>
          )}
          <button type="button" className="hs-toast-x" onClick={() => setToast(null)} aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

/* =============================================================================
   CSS (uses your global CSS variables when present, with safe fallbacks)
   ============================================================================= */

const HISTORY_CSS = `
.hs-page {
  --hs-text: var(--text-primary, #f1f5ff);
  --hs-muted: var(--text-secondary, #94a3c8);
  --hs-faint: var(--text-tertiary, #6b7aa6);
  --hs-surface: var(--bg-surface, #0a1027);
  --hs-line: var(--border-subtle, rgba(148, 163, 255, 0.15));
  max-width: 1200px;
  margin: 0 auto;
  padding: 8px 24px 90px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  color: var(--hs-text);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  animation: hs-fade 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.hs-page *, .hs-page *::before, .hs-page *::after { box-sizing: border-box; }
.hs-page button:focus-visible,
.hs-page a:focus-visible,
.hs-page input:focus-visible,
.hs-page select:focus-visible,
.hs-page tr:focus-visible { outline: 2px solid #93c5fd; outline-offset: 2px; }

.hs-muted { color: var(--hs-faint); font-size: 0.84rem; }

/* header */
.hs-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; flex-wrap: wrap; }
.hs-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 14px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #60a5fa;
  font-size: 0.8rem;
  font-weight: 700;
}
.hs-header h1 { margin: 12px 0 6px; font-size: clamp(1.9rem, 3.6vw, 2.5rem); font-weight: 800; letter-spacing: -0.025em; }
.hs-header p { margin: 0; color: var(--hs-muted); max-width: 560px; line-height: 1.6; }
.hs-header-btns { display: flex; gap: 10px; flex-wrap: wrap; }

/* buttons */
.hs-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}
.hs-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.hs-btn-primary { color: #fff; background: linear-gradient(135deg, #3b82f6, #6d5cf0); box-shadow: 0 8px 22px rgba(79, 70, 229, 0.35); }
.hs-btn-primary:hover { transform: translateY(-2px); }
.hs-btn-ghost { color: var(--hs-text); background: rgba(255, 255, 255, 0.04); border-color: var(--hs-line); }
.hs-btn-ghost:hover:not(:disabled) { background: rgba(59, 130, 246, 0.14); }
.hs-btn-danger { color: #fca5a5; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); }
.hs-btn-danger:hover:not(:disabled) { background: rgba(239, 68, 68, 0.2); }
.hs-small { padding: 6px 12px; font-size: 0.8rem; border-radius: 9px; }
.hs-link { background: none; border: none; color: #60a5fa; font-weight: 600; font-size: 0.84rem; cursor: pointer; padding: 0; text-align: left; }
.hs-link:hover { text-decoration: underline; }
.hs-restore { align-self: center; }
.hs-spin { animation: hs-rot 0.9s linear infinite; }

/* alert */
.hs-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px 18px;
  border-radius: 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fca5a5;
  font-size: 0.92rem;
}
.hs-alert span { flex: 1; min-width: 200px; }

/* panels */
.hs-panel {
  border-radius: 20px;
  background: var(--hs-surface);
  border: 1px solid var(--hs-line);
}

/* stat cards */
.hs-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.hs-stat {
  --sc: #60a5fa;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 18px;
  background: var(--hs-surface);
  border: 1px solid var(--hs-line);
  color: inherit;
  text-align: left;
  font-family: inherit;
}
.hs-stat.is-click { cursor: pointer; transition: transform 0.2s ease, border-color 0.2s ease; }
.hs-stat.is-click:hover { transform: translateY(-3px); border-color: var(--sc); }
.hs-stat.is-active { border-color: var(--sc); background: color-mix(in srgb, var(--sc) 9%, var(--hs-surface)); }
.hs-stat-ico {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sc);
  background: color-mix(in srgb, var(--sc) 15%, transparent);
  flex-shrink: 0;
}
.hs-stat-text b { display: block; font-size: 1.75rem; font-weight: 800; line-height: 1.1; font-variant-numeric: tabular-nums; }
.hs-stat-text small { display: block; margin-top: 3px; color: var(--hs-muted); font-size: 0.82rem; font-weight: 600; }

/* insights */
.hs-insights { display: grid; grid-template-columns: 1.3fr 1fr; gap: 14px; }
.hs-insight { padding: 20px 22px; }
.hs-insight-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
.hs-insight-head h3 { margin: 0; font-size: 0.98rem; font-weight: 700; }
.hs-legend { display: inline-flex; align-items: center; gap: 8px; font-size: 0.76rem; color: var(--hs-faint); }
.hs-legend i, .hs-mix-legend i { display: inline-block; width: 9px; height: 9px; border-radius: 3px; }
.hs-legend i:nth-of-type(2) { margin-left: 8px; }

.hs-bars { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; align-items: end; }
.hs-bar-col { display: flex; flex-direction: column; align-items: center; gap: 5px; }
.hs-bar-track { width: 100%; height: 96px; display: flex; align-items: flex-end; border-radius: 8px; background: rgba(148, 163, 255, 0.06); overflow: hidden; }
.hs-bar-fill {
  position: relative;
  width: 100%;
  min-height: 3px;
  display: flex;
  align-items: flex-end;
  background: linear-gradient(180deg, #60a5fa, #3b82f6);
  border-radius: 6px 6px 0 0;
  transition: height 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.hs-bar-flag { display: block; width: 100%; background: #f87171; }
.hs-bar-num { font-size: 0.78rem; font-weight: 700; font-variant-numeric: tabular-nums; }
.hs-bar-day { font-size: 0.72rem; color: var(--hs-faint); }

.hs-mix { display: flex; height: 14px; border-radius: 999px; overflow: hidden; background: rgba(148, 163, 255, 0.08); }
.hs-mix span { display: block; height: 100%; transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
.hs-mix-legend { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 14px; font-size: 0.82rem; color: var(--hs-muted); }
.hs-mix-legend span { display: inline-flex; align-items: center; gap: 7px; }
.hs-mix-legend b { color: var(--hs-text); }
.hs-types { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 18px; padding-top: 16px; border-top: 1px dashed var(--hs-line); }
.hs-type-chip {
  --mc: #94a3b8;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--mc) 40%, transparent);
  background: color-mix(in srgb, var(--mc) 10%, transparent);
  color: var(--mc);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.hs-type-chip b { color: var(--hs-text); }

/* toolbar */
.hs-toolbar { padding: 16px 18px; display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
.hs-search { position: relative; flex: 1 1 280px; min-width: 240px; }
.hs-search > svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--hs-faint); pointer-events: none; }
.hs-input {
  width: 100%;
  padding: 11px 38px 11px 40px;
  border-radius: 12px;
  border: 1px solid var(--hs-line);
  background: rgba(2, 6, 23, 0.6);
  color: var(--hs-text);
  font-size: 0.9rem;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.hs-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.22); }
.hs-search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: var(--hs-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.hs-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.hs-chip {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--hs-line);
  background: rgba(255, 255, 255, 0.03);
  color: var(--hs-muted);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s ease, color 0.2s ease;
}
.hs-chip:hover { color: #fff; }
.hs-chip.is-on { background: #2563eb; border-color: #2563eb; color: #fff; }
.hs-selects { display: flex; gap: 8px; flex-wrap: wrap; }
.hs-select {
  padding: 9px 12px;
  border-radius: 10px;
  border: 1px solid var(--hs-line);
  background: rgba(2, 6, 23, 0.6);
  color: var(--hs-text);
  font-size: 0.84rem;
  font-family: inherit;
  cursor: pointer;
}

/* bulk bar */
.hs-bulk {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding: 12px 18px;
  border-radius: 14px;
  background: rgba(37, 99, 235, 0.14);
  border: 1px solid rgba(96, 165, 250, 0.45);
  animation: hs-fade 0.25s ease-out;
}
.hs-bulk-btns { display: flex; gap: 8px; flex-wrap: wrap; }

/* table */
.hs-table-wrap { overflow: hidden; }
.hs-table-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px 20px;
  border-bottom: 1px solid var(--hs-line);
  font-size: 0.86rem;
  color: var(--hs-muted);
}
.hs-table-actions { display: inline-flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.hs-scroll { overflow-x: auto; }
.hs-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
.hs-table th {
  padding: 13px 18px;
  color: var(--hs-faint);
  font-size: 0.76rem;
  font-weight: 700;
  white-space: nowrap;
  border-bottom: 1px solid var(--hs-line);
}
.hs-table td { padding: 15px 18px; vertical-align: middle; border-bottom: 1px solid rgba(148, 163, 255, 0.07); }
.hs-table tbody tr { cursor: pointer; transition: background 0.18s ease; }
.hs-table tbody tr:hover { background: rgba(59, 130, 246, 0.07); }
.hs-table tbody tr.is-selected { background: rgba(59, 130, 246, 0.12); }
.hs-table tbody tr:last-child td { border-bottom: none; }
.hs-col-check { width: 44px; }
.hs-col-check input, .hs-page input[type='checkbox'] { accent-color: #3b82f6; width: 16px; height: 16px; cursor: pointer; }
.hs-col-actions { text-align: right; white-space: nowrap; }

.hs-file { min-width: 0; max-width: 320px; }
.hs-file b { display: block; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hs-file small { color: var(--hs-faint); font-size: 0.76rem; }

.hs-media {
  --mc: #94a3b8;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--mc);
  background: color-mix(in srgb, var(--mc) 12%, transparent);
}
.hs-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}
.hs-conf { display: flex; flex-direction: column; gap: 6px; min-width: 96px; }
.hs-conf b { font-size: 0.9rem; font-variant-numeric: tabular-nums; }
.hs-conf-bar { display: block; height: 5px; border-radius: 999px; background: rgba(148, 163, 255, 0.12); overflow: hidden; }
.hs-conf-bar i { display: block; height: 100%; border-radius: 999px; }
.hs-when span { display: block; font-weight: 600; font-size: 0.86rem; }
.hs-when small { display: block; color: var(--hs-faint); font-size: 0.74rem; margin-top: 2px; }

.hs-view {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 9px;
  border: 1px solid rgba(59, 130, 246, 0.35);
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.hs-view:hover { background: rgba(59, 130, 246, 0.24); }
.hs-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  margin-left: 6px;
  border-radius: 9px;
  border: 1px solid var(--hs-line);
  background: rgba(255, 255, 255, 0.03);
  color: var(--hs-muted);
  cursor: pointer;
}
.hs-icon-btn:hover:not(:disabled) { color: #fca5a5; background: rgba(239, 68, 68, 0.14); border-color: rgba(239, 68, 68, 0.35); }
.hs-icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.hs-pager {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px 20px;
  border-top: 1px solid var(--hs-line);
  font-size: 0.84rem;
  color: var(--hs-muted);
}
.hs-pager-btns { display: inline-flex; align-items: center; gap: 4px; }
.hs-pager-btns .hs-icon-btn { margin-left: 0; }
.hs-pager-btns .hs-icon-btn:hover:not(:disabled) { color: #fff; background: rgba(59, 130, 246, 0.2); border-color: #3b82f6; }
.hs-page-num { padding: 0 10px; font-weight: 600; color: var(--hs-text); }

/* empty + skeleton */
.hs-empty { padding: 64px 24px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; }
.hs-empty-ico { width: 68px; height: 68px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #60a5fa; background: rgba(59, 130, 246, 0.14); }
.hs-empty h3 { margin: 6px 0 0; font-size: 1.35rem; font-weight: 800; }
.hs-empty p { margin: 0 0 8px; max-width: 440px; color: var(--hs-muted); line-height: 1.65; }

.hs-skel-row { display: flex; gap: 24px; align-items: center; padding: 20px; border-bottom: 1px solid rgba(148, 163, 255, 0.07); }
.hs-skel-row:last-child { border-bottom: none; }
.hs-skel {
  display: block;
  height: 14px;
  border-radius: 7px;
  background: linear-gradient(90deg, rgba(148, 163, 255, 0.08) 25%, rgba(148, 163, 255, 0.18) 50%, rgba(148, 163, 255, 0.08) 75%);
  background-size: 200% 100%;
  animation: hs-shimmer 1.3s linear infinite;
}

/* toast */
.hs-toast {
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  z-index: 1500;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px 12px 20px;
  border-radius: 14px;
  background: #111a3a;
  border: 1px solid rgba(96, 165, 250, 0.45);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55);
  color: var(--hs-text);
  font-size: 0.88rem;
  animation: hs-toast 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.hs-toast button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 9px;
  border: 1px solid rgba(96, 165, 250, 0.5);
  background: rgba(59, 130, 246, 0.18);
  color: #93c5fd;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  font-family: inherit;
}
.hs-toast .hs-toast-x { padding: 6px; border-color: transparent; background: transparent; color: var(--hs-muted); }

@keyframes hs-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes hs-toast { from { opacity: 0; transform: translate(-50%, 14px); } to { opacity: 1; transform: translate(-50%, 0); } }
@keyframes hs-rot { to { transform: rotate(360deg); } }
@keyframes hs-shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }

@media (prefers-reduced-motion: reduce) {
  .hs-page, .hs-page *, .hs-toast { animation: none !important; transition: none !important; }
}

/* responsive */
@media (max-width: 980px) {
  .hs-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .hs-insights { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .hs-page { padding: 4px 16px 80px; }
  .hs-stats { grid-template-columns: 1fr 1fr; gap: 10px; }
  .hs-stat { padding: 14px; gap: 10px; }
  .hs-stat-ico { width: 38px; height: 38px; }
  .hs-stat-text b { font-size: 1.4rem; }

  /* table becomes cards */
  .hs-table thead { display: none; }
  .hs-table, .hs-table tbody, .hs-table tr, .hs-table td { display: block; width: 100%; }
  .hs-table tbody tr { padding: 14px 16px; border-bottom: 1px solid var(--hs-line); position: relative; }
  .hs-table td { padding: 6px 0; border: none; }
  .hs-table td[data-label]::before {
    content: attr(data-label);
    display: block;
    margin-bottom: 3px;
    color: var(--hs-faint);
    font-size: 0.7rem;
    font-weight: 700;
  }
  .hs-col-check { position: absolute; right: 14px; top: 14px; width: auto !important; padding: 0 !important; }
  .hs-col-actions { text-align: left; padding-top: 10px !important; }
  .hs-icon-btn { margin-left: 8px; }
  .hs-file { max-width: calc(100% - 36px); }
}
`;
