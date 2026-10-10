'use strict';
/**
 * AuthenticityAI Guard - popup logic (v1.1)
 *
 * What it does (for real, no fake timers):
 *   1. Finds the meaningful images on the active page.
 *   2. Downloads each one and sends it to YOUR backend for analysis.
 *   3. Shows the backend's honest verdict per image, outlines it on the page,
 *      and caches results so re-opening the popup is instant.
 *
 * Backend contract: POST /api/upload (multipart file), then POST /api/analyze
 * with JSON { file_id, mode }. Browser-internal pages cannot be scanned.
 */

const CONFIG = {
  UPLOAD_PATH: '/api/upload',
  ANALYZE_PATH: '/api/analyze',
  HEALTH_PATH: '/openapi.json',      // FastAPI serves this by default
  MIN_SIZE: 200,                     // ignore icons / tracking pixels
  MAX_IMAGES: 8,
  MAX_BYTES: 15 * 1024 * 1024,
  REQUEST_TIMEOUT_MS: 90000,         // first call may download the ML model
  CACHE_TTL_MS: 60 * 60 * 1000,
};
const DEFAULTS = {
  apiBase: 'http://localhost:8000',
  webUrl: 'http://localhost:5173/analyze',
  autoScan: true,
};
const UPLOADABLE = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

const VERDICTS = {
  'Likely AI-Generated':     { cls: 'bad',     label: 'Likely AI-generated' },
  'Potentially Manipulated': { cls: 'warn',    label: 'Possibly edited' },
  'Suspicious':              { cls: 'warn',    label: 'Suspicious' },
  'Likely Authentic':        { cls: 'ok',      label: 'No AI signs found' },
  'Inconclusive':            { cls: 'neutral', label: 'Inconclusive' },
};
const OUTLINE = { bad: '#f87171', warn: '#fbbf24', ok: '#34d399', neutral: '#94a3b8' };

const $ = (id) => document.getElementById(id);
let settings = { ...DEFAULTS };
let activeTab = null;
let scanning = false;
let lastCheckError = '';

/* ------------------------------------------------------------------ utils */
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;   // textContent only: no HTML injection
  return n;
}
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36) + s.length.toString(36);
}
function originPattern(url) { return new URL(url).origin + '/*'; }
function isLocal(url) {
  try { const h = new URL(url).hostname; return h === 'localhost' || h === '127.0.0.1'; }
  catch { return false; }
}
function validUrl(u) {
  try { const x = new URL(u); return x.protocol === 'http:' || x.protocol === 'https:'; }
  catch { return false; }
}
function showError(msg) { const e = $('error'); e.textContent = msg; e.hidden = !msg; }

/* --------------------------------------------------- functions run IN the page */
function collectPageImages(minSize, maxImages) {
  const seen = new Set();
  const out = [];
  for (const img of document.images) {
    const url = img.currentSrc || img.src;
    if (!url || seen.has(url)) continue;
    if (img.naturalWidth < minSize || img.naturalHeight < minSize) continue;
    seen.add(url);
    out.push({ url, w: img.naturalWidth, h: img.naturalHeight });
  }
  out.sort((a, b) => b.w * b.h - a.w * a.h);
  return out.slice(0, maxImages);
}
async function readBlobUrlInPage(url, maxBytes) {
  try {
    const blob = await (await fetch(url)).blob();
    if (blob.size > maxBytes) return { error: 'too large' };
    const dataUrl = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = () => rej(new Error('read failed'));
      r.readAsDataURL(blob);
    });
    return { dataUrl };
  } catch (e) { return { error: String(e) }; }
}
function markImageInPage(url, color, text) {
  const img = [...document.images].find((i) => (i.currentSrc || i.src) === url);
  if (!img) return;
  img.style.outline = `3px solid ${color}`;
  img.style.outlineOffset = '-3px';
  img.title = text;
  img.setAttribute('data-aai', '1');
}
function clearMarksInPage() {
  document.querySelectorAll('img[data-aai]').forEach((i) => {
    i.style.outline = ''; i.style.outlineOffset = ''; i.removeAttribute('data-aai');
  });
}
function scrollToImageInPage(url) {
  const img = [...document.images].find((i) => (i.currentSrc || i.src) === url);
  if (img) img.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function runInPage(func, args = []) {
  return chrome.scripting.executeScript({ target: { tabId: activeTab.id }, func, args })
    .then((r) => r && r[0] ? r[0].result : undefined);
}

/* ------------------------------------------------------------------ cache */
async function cacheGet(url) {
  const k = 'r:' + hashStr(url);
  const o = await chrome.storage.session.get(k);
  const v = o[k];
  return v && Date.now() - v.t < CONFIG.CACHE_TTL_MS ? v.data : null;
}
async function cacheSet(url, data) {
  await chrome.storage.session.set({ ['r:' + hashStr(url)]: { t: Date.now(), data } });
}

/* ---------------------------------------------------------------- backend */
function offlineMessage() {
  return `Cannot reach the server. Tried: ${lastCheckError || 'unknown'}. ` +
    'Fix in this order: (1) open http://127.0.0.1:8000/docs in a new tab - if it does not open, start the backend; ' +
    '(2) in chrome://extensions the extension must show version 1.1.0 - press reload (↻); ' +
    '(3) if the backend runs on another port, set it in Settings.';
}

function setStatus(state, text) {
  $('status-dot').className = 'dot ' + state;
  $('status-text').textContent = text;
}
async function ping(base) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const r = await fetch(base + CONFIG.HEALTH_PATH, { signal: ctrl.signal, cache: 'no-store' });
    return { ok: r.status < 500, status: r.status };
  } catch (e) {
    return { ok: false, error: e.name === 'AbortError' ? 'no answer within 6 seconds' : (e.message || String(e)) };
  } finally { clearTimeout(timer); }
}
/** localhost <-> 127.0.0.1 : Windows often resolves "localhost" to IPv6 (::1) while uvicorn listens on IPv4 only. */
function alternateBase(base) {
  try {
    const u = new URL(base);
    if (u.hostname === 'localhost') u.hostname = '127.0.0.1';
    else if (u.hostname === '127.0.0.1') u.hostname = 'localhost';
    else return null;
    return u.origin;
  } catch { return null; }
}
async function checkBackend() {
  setStatus('checking', 'Checking server…');
  const tried = [];
  let res = await ping(settings.apiBase);
  if (!res.ok) {
    tried.push(`${settings.apiBase}: ${res.error || 'HTTP ' + res.status}`);
    const alt = alternateBase(settings.apiBase);
    if (alt) {
      const res2 = await ping(alt);
      if (res2.ok) {                       // the other spelling works -> remember it
        settings.apiBase = alt;
        await chrome.storage.local.set({ apiBase: alt });
        renderPrivacyNote();
        res = res2;
      } else {
        tried.push(`${alt}: ${res2.error || 'HTTP ' + res2.status}`);
      }
    }
  }
  if (res.ok) { setStatus('online', 'Server online'); lastCheckError = ''; return true; }
  lastCheckError = tried.join(' | ');
  setStatus('offline', 'Server offline');
  return false;
}
function buildFormData(blob, filename) {
  const fd = new FormData();
  fd.append('file', blob, filename);
  return fd;
}
async function requestJson(path, options, actionLabel) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), CONFIG.REQUEST_TIMEOUT_MS);
  try {
    const r = await fetch(settings.apiBase + path, {
      ...options,
      signal: ctrl.signal,
      cache: 'no-store',
    });
    let payload = null;
    try { payload = await r.json(); } catch { /* response may not be JSON */ }
    if (!r.ok) {
      const detail = payload && (payload.detail || payload.message);
      throw new Error(`Server returned ${r.status}${detail ? ': ' + String(detail).slice(0, 180) : ''}`);
    }
    if (!payload || typeof payload !== 'object') {
      throw new Error(`The server returned an invalid response during ${actionLabel}.`);
    }
    return payload;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error(`Server took too long to answer during ${actionLabel}.`);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
async function analyzeBlob(blob, filename) {
  // This backend first stores the file and returns a file_id.
  const uploaded = await requestJson(CONFIG.UPLOAD_PATH, {
    method: 'POST',
    body: buildFormData(blob, filename),
  }, 'upload');

  const fileId = uploaded.file_id || uploaded.id;
  if (!fileId) throw new Error('Upload succeeded, but the backend did not return a file_id.');

  // The analysis endpoint expects JSON with file_id, not a multipart file.
  return requestJson(CONFIG.ANALYZE_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_id: fileId, mode: 'standard' }),
  }, 'analysis');
}
function canonicalAssessment(value) {
  const s = String(value || '').trim().toLowerCase();
  if (s.includes('inconclusive') || s.includes('insufficient evidence')) return 'Inconclusive';
  if (s.includes('manipulat') || s.includes('tamper') || s.includes('edited')) return 'Potentially Manipulated';
  if (s.includes('suspicious') || s.includes('needs a second look')) return 'Suspicious';
  if (s.includes('ai-generated') || s.includes('ai generated') || s.includes('likely ai') || s.includes('synthetic')) return 'Likely AI-Generated';
  if (s.includes('authentic') || s.includes('no signs found') || s.includes('no ai signs')) return 'Likely Authentic';
  return 'Inconclusive';
}
/** Normalizes the backend's AnalysisResponse to what the popup renders. */
function normalize(json) {
  const r = (json && (json.result || json.report || json.analysis)) || json || {};
  const rawAssessment = r.assessment || r.verdict || r.final_assessment || r.overall_assessment || 'Inconclusive';
  const rawConfidence = r.confidence ?? r.confidence_label;
  let confidence = typeof rawConfidence === 'string' ? rawConfidence : '';
  if (!confidence) {
    const n = Number(r.confidence_score ?? (typeof rawConfidence === 'number' ? rawConfidence : NaN));
    if (Number.isFinite(n)) confidence = `${Math.round(n <= 1 ? n * 100 : n)}%`;
  }
  const why = r.why_explanation || r.explanation || r.summary || '';
  const reasons = Array.isArray(r.uncertainty_reasons)
    ? r.uncertainty_reasons
    : Array.isArray(r.reasons) ? r.reasons : [];
  return {
    assessment: canonicalAssessment(rawAssessment),
    confidence,
    why: typeof why === 'string' ? why : '',
    reasons: reasons.filter((x) => typeof x === 'string').slice(0, 4),
  };
}

/* ------------------------------------------------------------ image fetch */
async function getImageBlob(item) {
  if (item.url.startsWith('blob:')) {
    const res = await runInPage(readBlobUrlInPage, [item.url, CONFIG.MAX_BYTES]);
    if (!res || res.error) throw new Error('Could not read this in-page image');
    return await (await fetch(res.dataUrl)).blob();
  }
  let resp;
  try { resp = await fetch(item.url, { credentials: 'omit', referrerPolicy: 'no-referrer' }); }
  catch { throw new Error('Download blocked (allow image access and try again)'); }
  if (!resp.ok) throw new Error(`Image download failed (${resp.status})`);
  const blob = await resp.blob();
  if (blob.size > CONFIG.MAX_BYTES) throw new Error('Image is larger than 15 MB');
  return blob;
}
async function toUploadable(blob, url) {
  if (UPLOADABLE[blob.type]) return { blob, name: `page-${hashStr(url)}.${UPLOADABLE[blob.type]}`, converted: false };
  if (!blob.type.startsWith('image/') || blob.type === 'image/svg+xml')
    throw new Error('Unsupported image type (' + (blob.type || 'unknown') + ')');
  const bmp = await createImageBitmap(blob);               // gif / avif / bmp -> PNG
  const canvas = new OffscreenCanvas(bmp.width, bmp.height);
  canvas.getContext('2d').drawImage(bmp, 0, 0);
  const png = await canvas.convertToBlob({ type: 'image/png' });
  return { blob: png, name: `page-${hashStr(url)}.png`, converted: true };
}

/* ------------------------------------------------------------------- UI */
function makeRow(item) {
  const row = el('div', 'row neutral');
  const thumb = el('img', 'thumb');
  thumb.alt = '';
  thumb.referrerPolicy = 'no-referrer';
  if (/^(https?:|data:)/.test(item.url)) thumb.src = item.url;
  const body = el('div', 'body');
  const badge = el('span', 'badge', 'Scanning…');
  const meta = el('div', 'meta', `${item.w} × ${item.h}px`);
  body.append(badge, meta);
  row.append(thumb, body);
  return { row, body, badge, meta, thumb };
}
function fillRow(ui, item, result) {
  const v = VERDICTS[result.assessment] || VERDICTS['Inconclusive'];
  ui.row.className = 'row ' + v.cls;
  ui.badge.textContent = v.label;
  ui.meta.textContent = `${item.w} × ${item.h}px` + (result.confidence ? ` · ${result.confidence} confidence` : '');
  if (result.why) {
    ui.body.append(el('div', 'why',
      result.why.length > 170 ? result.why.slice(0, 167) + '…' : result.why));
  }
  if (result.reasons.length) {
    const d = el('details');
    d.append(el('summary', '', 'Why this may be wrong'));
    const ul = el('ul');
    result.reasons.forEach((r) => ul.append(el('li', '', r)));
    d.append(ul);
    ui.body.append(d);
  }
  const show = el('button', 'link-btn', 'Show on page');
  show.addEventListener('click', () => runInPage(scrollToImageInPage, [item.url]).catch(() => {}));
  ui.body.append(show);
  runInPage(markImageInPage, [item.url, OUTLINE[v.cls], `AuthenticityAI: ${v.label}`]).catch(() => {});
}
function failRow(ui, message) {
  ui.row.className = 'row neutral';
  ui.badge.textContent = 'Could not check';
  ui.body.append(el('div', 'why', message));
}
function updateSummary(tally, total) {
  const s = $('summary');
  const parts = [`${total} image${total === 1 ? '' : 's'} checked`];
  if (tally.bad) parts.push(`${tally.bad} likely AI`);
  if (tally.warn) parts.push(`${tally.warn} suspicious / edited`);
  if (tally.fail) parts.push(`${tally.fail} failed`);
  s.textContent = parts.join(' · ');
  s.hidden = false;
}

function isScannablePage(rawUrl) {
  try {
    const u = new URL(rawUrl);
    if (!['http:', 'https:'].includes(u.protocol)) return false;
    const host = u.hostname.toLowerCase();
    const path = u.pathname.toLowerCase();
    if (host === 'chromewebstore.google.com') return false;
    if (host === 'chrome.google.com' && path.includes('/webstore')) return false;
    if (host === 'microsoftedge.microsoft.com' && path.startsWith('/addons')) return false;
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------- scan */
async function startScan(userGesture) {
  if (scanning) return;
  const btn = $('scan-page-btn');
  scanning = true;
  btn.disabled = true;
  showError('');

  try {
    // Browser UI pages (edge://, chrome://, extensions, new-tab) cannot be injected into.
    if (!isScannablePage(activeTab && activeTab.url)) {
      showError('This is a browser-internal or restricted page and cannot be scanned. Open a normal website (http:// or https://) containing images, then open AuthenticityAI Guard again.');
      return;
    }

    // Must be requested first, directly inside the click.
    const hasAll = await chrome.permissions.contains({ origins: ['<all_urls>'] });
    if (!hasAll && userGesture) {
      await chrome.permissions.request({ origins: ['<all_urls>'] });
    }
    if (!(await checkBackend())) {
      showError(offlineMessage());
      return;
    }

    let images;
    try {
      images = await runInPage(collectPageImages, [CONFIG.MIN_SIZE, CONFIG.MAX_IMAGES]);
    } catch {
      showError("This page can't be scanned (browser-internal pages and the Chrome Web Store are protected).");
      return;
    }
    await runInPage(clearMarksInPage).catch(() => {});
    $('results').replaceChildren();
    $('summary').hidden = true;
    if (!images || !images.length) {
      showError(`No images of at least ${CONFIG.MIN_SIZE}×${CONFIG.MIN_SIZE}px found on this page.`);
      return;
    }

    const tally = { bad: 0, warn: 0, fail: 0 };
    let done = 0;
    for (const item of images) {
      const ui = makeRow(item);
      $('results').append(ui.row);
      btn.textContent = `Scanning ${++done}/${images.length}…`;
      try {
        let result = userGesture ? null : await cacheGet(item.url);   // button click = fresh scan
        if (!result) {
          const raw = await getImageBlob(item);
          const up = await toUploadable(raw, item.url);
          result = normalize(await analyzeBlob(up.blob, up.name));
          await cacheSet(item.url, result);
        }
        fillRow(ui, item, result);
        const v = VERDICTS[result.assessment] || VERDICTS['Inconclusive'];
        if (v.cls === 'bad') tally.bad++; else if (v.cls === 'warn') tally.warn++;
      } catch (e) {
        tally.fail++;
        failRow(ui, e.message || 'Unknown error');
      }
      updateSummary(tally, done);
    }
  } catch (e) {
    showError('Unexpected error: ' + (e && e.message ? e.message : e));
  } finally {
    scanning = false;
    btn.disabled = false;
    btn.textContent = '🔍 Scan Again';
  }
}

/* --------------------------------------------------------------- settings */
function renderPrivacyNote() {
  $('privacy-note').textContent =
    `Images are downloaded by this extension and sent only to ${new URL(settings.apiBase).host}. ` +
    'Nothing is scanned in the background.';
  $('open-web').href = settings.webUrl;
}
async function saveSettings() {
  const api = $('set-api').value.trim().replace(/\/+$/, '');
  const web = $('set-web').value.trim();
  const msg = $('settings-msg');
  if (!validUrl(api) || !validUrl(web)) { msg.textContent = 'Please enter valid http(s) URLs.'; return; }
  const origins = [originPattern(api)];
  if (!(await chrome.permissions.contains({ origins })) && !(await chrome.permissions.request({ origins }))) {
    msg.textContent = 'Permission to contact that server was denied.';
    return;
  }
  settings = { apiBase: api, webUrl: web, autoScan: $('set-auto').checked };
  await chrome.storage.local.set(settings);
  renderPrivacyNote();
  msg.textContent = 'Saved.';
  checkBackend();
}

/* ------------------------------------------------------------------- init */
document.addEventListener('DOMContentLoaded', async () => {
  settings = { ...DEFAULTS, ...(await chrome.storage.local.get(DEFAULTS)) };
  $('set-api').value = settings.apiBase;
  $('set-web').value = settings.webUrl;
  $('set-auto').checked = settings.autoScan;
  renderPrivacyNote();

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTab = tabs[0] || null;
  if (activeTab && activeTab.url) {
    try {
      const u = new URL(activeTab.url);
      $('current-url').textContent = isScannablePage(activeTab.url)
        ? u.hostname + u.pathname.slice(0, 40)
        : 'Restricted browser page';
    } catch {
      $('current-url').textContent = 'Restricted or unknown page';
    }
  } else {
    $('current-url').textContent = 'Restricted or unknown page';
  }

  $('scan-page-btn').addEventListener('click', () => startScan(true));
  $('save-settings').addEventListener('click', saveSettings);

  const online = await checkBackend();
  if (!isScannablePage(activeTab && activeTab.url)) {
    showError('This is a browser-internal or restricted page and cannot be scanned. Open a normal website (http:// or https://) containing images, then open AuthenticityAI Guard again.');
  } else if (!online) {
    showError(offlineMessage());
  }
  const hasAll = await chrome.permissions.contains({ origins: ['<all_urls>'] });
  if (activeTab && online && settings.autoScan && hasAll && isLocal(settings.apiBase)) {
    startScan(false);                      // automatic: cached results are reused
  } else if (online && !hasAll) {
    $('privacy-note').textContent += ' First scan asks once for permission to download page images.';
  }
});