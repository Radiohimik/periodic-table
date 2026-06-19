/* ============================================================
   NUCLIDE EXPLORER — Application Logic
   Loads elements/isotope dataset (derived from IAEA Live Chart
   of Nuclides) and renders an interactive periodic table with
   per-element isotope strips and full nuclear-data detail cards.
   ============================================================ */

const NA_CONST = 6.02214076e23; // Avogadro's number

let ELEMENT_DATA = null; // keyed by Z (string) -> element object
let activeZ = null;
let activeIsotope = null; // currently selected isotope object

/* ============================================================
   MEDICAL ISOTOPES DATA + FILTER STATE
   Techniques: SPECT, PET, Alpha therapy, Beta therapy, Brachytherapy
   ============================================================ */
const MEDICAL_ISOTOPES = [
  // ── SPECT ──────────────────────────────────────────────────
  { Z:43, symbol:'Tc', A:99,  label:'Tc-99m',  techniques:['SPECT'],
    halfLife:'6.01 h', note:'Most widely used diagnostic isotope. Bone scans, cardiac perfusion, renal, thyroid, hepatobiliary imaging. ~85 % of all nuclear medicine procedures.' },
  { Z:53, symbol:'I',  A:123, label:'I-123',   techniques:['SPECT'],
    halfLife:'13.2 h', note:'Thyroid function, neurological dopamine transporter imaging (DaTSCAN). Low radiation dose.' },
  { Z:81, symbol:'Tl', A:201, label:'Tl-201',  techniques:['SPECT'],
    halfLife:'73.1 h', note:'Cardiac perfusion SPECT. Being replaced by Tc-99m agents but still used in some centres.' },
  { Z:31, symbol:'Ga', A:67,  label:'Ga-67',   techniques:['SPECT'],
    halfLife:'78.3 h', note:'Infection / inflammation imaging, lymphoma. Multi-day protocol.' },
  { Z:49, symbol:'In', A:111, label:'In-111',  techniques:['SPECT'],
    halfLife:'67.3 h', note:'Octreoscan (somatostatin receptor), WBC imaging, antibody labelling.' },
  { Z:71, symbol:'Lu', A:177, label:'Lu-177',  techniques:['SPECT','Beta therapy'],
    halfLife:'6.65 d', note:'DOTATATE / PSMA theranostic: low-energy gamma enables SPECT imaging during β⁻ therapy. Approved for NETs and mCRPC.' },
  // ── PET ───────────────────────────────────────────────────
  { Z:9,  symbol:'F',  A:18,  label:'F-18',    techniques:['PET'],
    halfLife:'109.8 min', note:'FDG-PET/CT: cornerstone of oncological PET. Also NaF (bone), flortaucipir (tau), florbetapir (amyloid).' },
  { Z:31, symbol:'Ga', A:68,  label:'Ga-68',   techniques:['PET'],
    halfLife:'67.7 min', note:'PSMA-PET (prostate cancer), DOTATATE-PET (NETs). Generator-produced; no cyclotron needed on site.' },
  { Z:40, symbol:'Zr', A:89,  label:'Zr-89',   techniques:['PET'],
    halfLife:'78.4 h',   note:'Immuno-PET: long half-life matches antibody pharmacokinetics for whole-body mAb tracking.' },
  { Z:29, symbol:'Cu', A:64,  label:'Cu-64',   techniques:['PET','Beta therapy'],
    halfLife:'12.7 h',   note:'Theranostic copper. PET imaging (β⁺) plus β⁻ /Auger therapy potential in same nuclide.' },
  { Z:53, symbol:'I',  A:124, label:'I-124',   techniques:['PET'],
    halfLife:'4.18 d',   note:'Iodine PET: thyroid cancer dosimetry, radioimmunotherapy pre-dosimetry.' },
  { Z:6,  symbol:'C',  A:11,  label:'C-11',    techniques:['PET'],
    halfLife:'20.4 min',  note:'Brain PET: C-11 raclopride (dopamine), C-11 choline, C-11 methionine.' },
  { Z:7,  symbol:'N',  A:13,  label:'N-13',    techniques:['PET'],
    halfLife:'9.97 min',  note:'N-13 ammonia: cardiac perfusion PET, gold-standard myocardial flow reserve.' },
  { Z:8,  symbol:'O',  A:15,  label:'O-15',    techniques:['PET'],
    halfLife:'122 s',     note:'O-15 water: cerebral blood flow PET. Very short half-life; on-site cyclotron essential.' },
  { Z:37, symbol:'Rb', A:82,  label:'Rb-82',   techniques:['PET'],
    halfLife:'76 s',      note:'Generator-produced cardiac PET. High throughput; approved for myocardial perfusion.' },
  // ── Alpha therapy ─────────────────────────────────────────
  { Z:88, symbol:'Ra', A:223, label:'Ra-223',  techniques:['Alpha therapy'],
    halfLife:'11.43 d', note:'Xofigo (Bayer): first approved targeted alpha therapy. Bone metastases in castration-resistant prostate cancer.' },
  { Z:89, symbol:'Ac', A:225, label:'Ac-225',  techniques:['Alpha therapy'],
    halfLife:'9.92 d',  note:'Ac-225 PSMA-617: pivotal Phase III (TherapACs). Four alpha decays in one generator chain.' },
  { Z:83, symbol:'Bi', A:213, label:'Bi-213',  techniques:['Alpha therapy'],
    halfLife:'45.6 min', note:'Daughter of Ac-225. Used in targeted alpha therapy for AML and solid tumours.' },
  { Z:85, symbol:'At', A:211, label:'At-211',  techniques:['Alpha therapy'],
    halfLife:'7.21 h',  note:'Astatine-211: high-LET alpha, no beta. Under investigation for thyroid and glioblastoma.' },
  { Z:82, symbol:'Pb', A:212, label:'Pb-212',  techniques:['Alpha therapy'],
    halfLife:'10.6 h',  note:'In vivo generator decaying to Bi-212 then Tl-208; α-emitter for melanoma and pancreatic cancer trials.' },
  { Z:83, symbol:'Bi', A:212, label:'Bi-212',  techniques:['Alpha therapy'],
    halfLife:'60.6 min', note:'Daughter of Pb-212. Short-range alpha; used in targeted α therapy research.' },
  // ── Beta therapy ──────────────────────────────────────────
  { Z:39, symbol:'Y',  A:90,  label:'Y-90',    techniques:['Beta therapy'],
    halfLife:'64.1 h',  note:'SIR-Spheres / TheraSphere: radioembolisation for hepatocellular carcinoma. Also Y-90 ibritumomab (lymphoma).' },
  { Z:53, symbol:'I',  A:131, label:'I-131',   techniques:['Beta therapy'],
    halfLife:'8.02 d',  note:'Oldest targeted radionuclide therapy. Thyroid cancer ablation, hyperthyroidism, Bexxar (lymphoma).' },
  { Z:38, symbol:'Sr', A:89,  label:'Sr-89',   techniques:['Beta therapy'],
    halfLife:'50.6 d',  note:'Metastron: bone pain palliation in osteoblastic metastases. Mimics calcium in bone.' },
  { Z:62, symbol:'Sm', A:153, label:'Sm-153',  techniques:['Beta therapy'],
    halfLife:'46.3 h',  note:'Quadramet: EDTMP-chelated bone pain palliation; also emits 103 keV gamma for scintigraphy.' },
  { Z:75, symbol:'Re', A:186, label:'Re-186',  techniques:['Beta therapy'],
    halfLife:'90.6 h',  note:'HEDP complex for bone pain palliation. 137 keV gamma also allows scintigraphy.' },
  { Z:75, symbol:'Re', A:188, label:'Re-188',  techniques:['Beta therapy'],
    halfLife:'17.0 h',  note:'Generator-produced (W-188). Targeted therapy research; higher energy beta than Re-186.' },
  { Z:32, symbol:'Ge', A:77,  label:'Ge-77 / As-77', techniques:['Beta therapy'],
    halfLife:'38.8 h (As-77)', note:'As-77 (daughter of Ge-77): emerging β emitter for radiopharmaceutical therapy; PSMA conjugates in trials.' },
  // ── Brachytherapy ─────────────────────────────────────────
  { Z:53, symbol:'I',  A:125, label:'I-125',   techniques:['Brachytherapy'],
    halfLife:'59.4 d',  note:'Permanent prostate seed brachytherapy (LDR). Low-energy photons; ideal radiation protection profile.' },
  { Z:46, symbol:'Pd', A:103, label:'Pd-103',  techniques:['Brachytherapy'],
    halfLife:'16.99 d', note:'Prostate seed brachytherapy (LDR). Lower energy than I-125; favoured for some tumour grades.' },
  { Z:77, symbol:'Ir', A:192, label:'Ir-192',  techniques:['Brachytherapy'],
    halfLife:'73.8 d',  note:'HDR brachytherapy source. Gynaecological, breast, prostate, and skin cancers. Widely deployed.' },
  { Z:55, symbol:'Cs', A:131, label:'Cs-131',  techniques:['Brachytherapy'],
    halfLife:'9.69 d',  note:'Brain, prostate, and ocular brachytherapy. Short half-life suitable for resection-cavity implants.' },
  { Z:69, symbol:'Tm', A:170, label:'Tm-170',  techniques:['Brachytherapy'],
    halfLife:'128.6 d', note:'Eye brachytherapy applicators (ophthalmic use). Long-lasting beta source.' },
];

const TECHNIQUE_META = {
  'SPECT':          { color:'#4A9EFF', icon:'◎', desc:'Single-photon emission CT — gamma-emitting tracers' },
  'PET':            { color:'#FF8C42', icon:'⊕', desc:'Positron emission tomography — β⁺ emitters' },
  'Alpha therapy':  { color:'#FF4D6D', icon:'α',  desc:'Targeted alpha therapy — high-LET α emitters' },
  'Beta therapy':   { color:'#4CAF50', icon:'β⁻', desc:'Targeted β⁻ radionuclide therapy' },
  'Brachytherapy':  { color:'#B47FFF', icon:'⦿', desc:'Internal sealed-source radiotherapy' },
};

let activeTechniques = new Set(); // multi-select state

/* ---------- Decay mode -> visual category mapping ---------- */
function decayCategory(modes, isStable) {
  if (isStable) return 'stable';
  if (!modes || modes.length === 0) return 'other';
  const primary = modes[0].mode;
  if (primary.includes('A')) return 'alpha';
  if (primary.startsWith('B-')) return 'betam';
  if (primary.startsWith('B+') || primary.startsWith('EC')) return 'betap';
  if (primary === 'IT') return 'it';
  if (primary.includes('SF')) return 'sf';
  return 'other';
}
const DECAY_COLORS = {
  stable: 'var(--decay-stable)',
  alpha:  'var(--decay-alpha)',
  betam:  'var(--decay-betam)',
  betap:  'var(--decay-betap)',
  it:     'var(--decay-it)',
  sf:     'var(--decay-sf)',
  other:  'var(--decay-other)'
};

/* ---------- Number formatting helpers ---------- */
function sciHTML(value, sig = 3) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  if (value === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(value)));
  let mant = value / Math.pow(10, exp);
  let mantR = parseFloat(mant.toFixed(sig - 1));
  let e = exp;
  if (Math.abs(mantR) >= 10) { mantR = mantR / 10; e += 1; }
  const mantStr = mantR.toFixed(sig - 1);
  if (e === 0) return mantStr;
  return `${mantStr} × 10<span class="exp">${e}</span>`;
}

function sciPlain(value, sig = 3) {
  if (value === null || value === undefined || isNaN(value)) return '';
  if (value === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(value)));
  let mant = value / Math.pow(10, exp);
  let mantR = parseFloat(mant.toFixed(sig - 1));
  let e = exp;
  if (Math.abs(mantR) >= 10) { mantR = mantR / 10; e += 1; }
  const mantStr = mantR.toFixed(sig - 1);
  if (e === 0) return mantStr;
  return `${mantStr}e${e}`;
}

let copyBtnCounter = 0;
function copyBtn(value, label) {
  if (value === null || value === undefined || value === '') return '';
  copyBtnCounter++;
  const safeValue = String(value).replace(/"/g, '&quot;');
  return `<button class="copy-btn" type="button" data-copy-value="${safeValue}" aria-label="Copy ${label || 'value'} to clipboard" title="Copy ${label || 'value'}">
    <svg class="copy-icon-copy" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="9" height="9" rx="1.5"/><path d="M3 10.5V3.5C3 2.67 3.67 2 4.5 2H10.5"/></svg>
    <svg class="copy-icon-check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5L6 11.5L13 4.5"/></svg>
  </button>`;
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.copy-btn');
  if (!btn) return;
  const value = btn.dataset.copyValue;
  if (value === undefined) return;
  const doFeedback = () => {
    btn.classList.add('is-copied');
    setTimeout(() => btn.classList.remove('is-copied'), 1200);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value).then(doFeedback).catch(() => fallbackCopy(value, doFeedback));
  } else {
    fallbackCopy(value, doFeedback);
  }
});

function fallbackCopy(text, onDone) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
  if (onDone) onDone();
}

function formatHalfLife(iso) {
  if (iso.is_stable) return { primary: 'Stable', secondary: 'Does not decay', isResonance:false };
  if (!iso.half_life_value) return { primary: 'Unknown', secondary: '—', isResonance:false };
  const val = iso.half_life_value;
  const unit = iso.half_life_unit || '';
  const sec = iso.half_life_seconds;
  const unc = iso.half_life_unc ? ` ± ${iso.half_life_unc}` : '';
  const isResonance = ['MEV','KEV','EV'].includes(unit.toUpperCase());
  if (isResonance) {
    return { primary: `${val}${unc} ${unit}`, secondary: sec != null ? sciHTML(sec) : '—', isResonance: true };
  }
  return { primary: `${val}${unc} ${unitLabel(unit)}`, secondary: sec != null ? sciHTML(sec) : '—', isResonance:false };
}

function unitLabel(u) {
  const map = {
    s:'s', ms:'ms', us:'µs', ns:'ns', ps:'ps', fs:'fs', as:'as', zs:'zs', ys:'ys',
    m:'min', h:'h', d:'days', y:'years', Y:'years', ky:'kyr', My:'Myr', Gy:'Gyr',
    Py:'Pyr', Ey:'Eyr', Ty:'Tyr'
  };
  return map[u] || u;
}

function spinParityHTML(jp) {
  if (!jp) return '—';
  const m = jp.match(/^(\(?[\d/]+\)?)\s*([+\-])$/);
  if (!m) return jp;
  return `${m[1]}<sup>${m[2]}</sup>`;
}

/* ============================================================
   CSS INJECTION — fixes grid visibility + font sizes
   ============================================================ */
function injectStyles() {
  const style = document.createElement('style');
  style.id = 'nuclide-explorer-overrides';
  style.textContent = `
    /* ── Fix: ensure La/Ac rows are not clipped ── */
    #ptGrid {
      grid-template-rows: repeat(10, auto) !important;
      overflow: visible !important;
      height: auto !important;
      min-height: 0 !important;
      padding-bottom: 8px !important;
    }

    /* ── Larger, brighter atomic numbers ── */
    .tile-num {
      font-size: 11px !important;
      font-weight: 600 !important;
      color: rgba(255,255,255,0.82) !important;
    }

    /* ── Larger element symbol ── */
    .tile-symbol {
      font-size: 22px !important;
      line-height: 1.05 !important;
      font-weight: 700 !important;
    }

    /* ── Larger element name ── */
    .tile-name {
      font-size: 9.5px !important;
      font-weight: 500 !important;
      letter-spacing: 0.01em !important;
    }

    /* ── Medical filter panel ── */
    #medicalPanel {
      margin: 0 0 0 0;
      padding: 18px 20px 14px 20px;
      background: rgba(255,255,255,0.025);
      border-top: 1px solid rgba(255,255,255,0.06);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      display: flex;
      gap: 24px;
      align-items: flex-start;
      min-height: 0;
    }

    #medicalPanel .mp-left {
      flex: 0 0 220px;
      min-width: 180px;
    }

    #medicalPanel .mp-right {
      flex: 1;
      min-width: 0;
    }

    .mp-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.45);
      margin-bottom: 10px;
    }

    .mp-subtitle {
      font-size: 11px;
      color: rgba(255,255,255,0.35);
      margin-bottom: 10px;
      line-height: 1.45;
    }

    .mp-filter-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 7px 11px;
      margin-bottom: 5px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 6px;
      cursor: pointer;
      font-size: 12.5px;
      color: rgba(255,255,255,0.65);
      text-align: left;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
      font-family: inherit;
    }

    .mp-filter-btn:hover {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.9);
    }

    .mp-filter-btn.is-active {
      background: rgba(255,255,255,0.09);
      border-color: var(--mp-btn-color, rgba(255,255,255,0.35));
      color: #fff;
      box-shadow: 0 0 0 1px var(--mp-btn-color, transparent) inset;
    }

    .mp-filter-btn .mp-btn-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      background: var(--mp-btn-color, #888);
      opacity: 0.7;
      transition: opacity 0.15s;
    }

    .mp-filter-btn.is-active .mp-btn-dot { opacity: 1; }

    .mp-filter-btn .mp-btn-count {
      margin-left: auto;
      font-size: 10px;
      opacity: 0.5;
      font-family: var(--font-mono, monospace);
    }

    .mp-clear-btn {
      margin-top: 4px;
      padding: 5px 11px;
      background: none;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 6px;
      cursor: pointer;
      font-size: 11px;
      color: rgba(255,255,255,0.35);
      font-family: inherit;
      transition: color 0.15s, border-color 0.15s;
    }
    .mp-clear-btn:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.2); }

    /* ── Isotope result list ── */
    .mp-result-header {
      font-size: 11px;
      color: rgba(255,255,255,0.35);
      margin-bottom: 9px;
      font-weight: 500;
    }

    .mp-result-list {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
    }

    .mp-iso-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 7px;
      padding: 7px 11px;
      min-width: 140px;
      max-width: 220px;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
      position: relative;
    }

    .mp-iso-card:hover {
      background: rgba(255,255,255,0.08);
      border-color: rgba(255,255,255,0.2);
    }

    .mp-iso-card-name {
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 3px;
    }

    .mp-iso-card-hl {
      font-size: 10.5px;
      color: rgba(255,255,255,0.4);
      font-family: var(--font-mono, monospace);
      margin-bottom: 4px;
    }

    .mp-iso-card-note {
      font-size: 10.5px;
      color: rgba(255,255,255,0.5);
      line-height: 1.4;
    }

    .mp-iso-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 3px;
      margin-bottom: 4px;
    }

    .mp-iso-tag {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.06em;
      padding: 1px 5px;
      border-radius: 3px;
      color: #fff;
      opacity: 0.85;
    }

    .mp-empty {
      font-size: 12px;
      color: rgba(255,255,255,0.25);
      padding: 16px 0;
    }

    /* ── Publications link ── */
    .mp-pubmed-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-top: 12px;
      font-size: 10.5px;
      color: rgba(255,255,255,0.35);
      text-decoration: none;
      border-bottom: 1px solid rgba(255,255,255,0.12);
      padding-bottom: 1px;
      transition: color 0.15s, border-color 0.15s;
    }
    .mp-pubmed-link:hover { color: rgba(255,255,255,0.75); border-color: rgba(255,255,255,0.4); }
    .mp-pubmed-link svg { opacity: 0.6; }

    /* ── Tile highlight / dim when medical filter active ── */
    .element-tile.medical-highlight {
      outline: 2px solid rgba(255,255,255,0.55) !important;
      outline-offset: 1px;
      z-index: 2;
    }

    .element-tile.medical-dim {
      opacity: 0.22 !important;
      pointer-events: none;
    }

    /* keep selected tile always fully visible */
    .element-tile.is-active {
      opacity: 1 !important;
    }

    @media (max-width: 900px) {
      #medicalPanel { flex-direction: column; }
      #medicalPanel .mp-left { flex: none; width: 100%; }
    }
  `;
  document.head.appendChild(style);
}

/* ============================================================
   MEDICAL FILTER PANEL — BUILD + RENDER
   ============================================================ */
function buildMedicalPanel() {
  const panel = document.createElement('div');
  panel.id = 'medicalPanel';

  // Insert after ptGrid
  const grid = document.getElementById('ptGrid');
  grid.parentNode.insertBefore(panel, grid.nextSibling);

  renderMedicalPanel();
}

function renderMedicalPanel() {
  const panel = document.getElementById('medicalPanel');
  if (!panel) return;

  // Compute matching isotopes
  const matchingIsos = activeTechniques.size === 0
    ? []
    : MEDICAL_ISOTOPES.filter(iso => iso.techniques.some(t => activeTechniques.has(t)));

  // Count per technique
  const counts = {};
  Object.keys(TECHNIQUE_META).forEach(t => {
    counts[t] = MEDICAL_ISOTOPES.filter(iso => iso.techniques.includes(t)).length;
  });

  // Build PubMed URL for the past 2 weeks
  const pubmedUrl = buildPubmedUrl();

  // Left column: filter buttons
  let filterHTML = `
    <div class="mp-title">Medical Isotopes</div>
    <div class="mp-subtitle">Select one or more techniques to highlight matching elements and see matched isotopes.</div>
  `;
  Object.entries(TECHNIQUE_META).forEach(([tech, meta]) => {
    const isActive = activeTechniques.has(tech);
    filterHTML += `
      <button class="mp-filter-btn ${isActive ? 'is-active' : ''}"
              style="--mp-btn-color:${meta.color}"
              data-technique="${tech}"
              title="${meta.desc}">
        <span class="mp-btn-dot"></span>
        <span>${meta.icon} ${tech}</span>
        <span class="mp-btn-count">${counts[tech]}</span>
      </button>
    `;
  });

  if (activeTechniques.size > 0) {
    filterHTML += `<button class="mp-clear-btn" id="mpClearBtn">✕ Clear filters</button>`;
  }

  filterHTML += `
    <a class="mp-pubmed-link" href="${pubmedUrl}" target="_blank" rel="noopener" title="Search PubMed for recent medical isotope publications (last 2 weeks)">
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5v4l2.5 1.5"/></svg>
      Recent publications (PubMed, last 2 weeks)
    </a>
  `;

  // Right column: isotope result list
  let resultsHTML = '';
  if (activeTechniques.size === 0) {
    resultsHTML = `<div class="mp-empty">← Select a technique to see matching isotopes and highlight them on the table above.</div>`;
  } else if (matchingIsos.length === 0) {
    resultsHTML = `<div class="mp-empty">No isotopes found for the selected combination.</div>`;
  } else {
    const techLabel = activeTechniques.size === 1
      ? [...activeTechniques][0]
      : [...activeTechniques].join(' + ');
    resultsHTML = `<div class="mp-result-header">${matchingIsos.length} isotope${matchingIsos.length !== 1 ? 's' : ''} — ${techLabel}</div>`;
    resultsHTML += `<div class="mp-result-list">`;
    matchingIsos.forEach(iso => {
      const tagHTML = iso.techniques
        .map(t => `<span class="mp-iso-tag" style="background:${TECHNIQUE_META[t]?.color || '#555'}">${t}</span>`)
        .join('');
      resultsHTML += `
        <div class="mp-iso-card" data-jump-z="${iso.Z}" title="Click to open ${iso.label} on the periodic table">
          <div class="mp-iso-tags">${tagHTML}</div>
          <div class="mp-iso-card-name">${iso.label}</div>
          <div class="mp-iso-card-hl">T½ ${iso.halfLife}</div>
          <div class="mp-iso-card-note">${iso.note}</div>
        </div>
      `;
    });
    resultsHTML += `</div>`;
  }

  panel.innerHTML = `
    <div class="mp-left">${filterHTML}</div>
    <div class="mp-right">${resultsHTML}</div>
  `;

  // Bind filter button clicks
  panel.querySelectorAll('.mp-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => applyMedicalFilter(btn.dataset.technique));
  });

  // Bind clear button
  const clearBtn = panel.querySelector('#mpClearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      activeTechniques.clear();
      refreshMedicalHighlights();
      renderMedicalPanel();
    });
  }

  // Bind isotope card clicks → jump to element on table
  panel.querySelectorAll('.mp-iso-card[data-jump-z]').forEach(card => {
    card.addEventListener('click', () => {
      const z = parseInt(card.dataset.jumpZ);
      selectElement(z);
      // scroll table into view
      const tile = document.querySelector(`.element-tile[data-z="${z}"]`);
      if (tile) tile.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
}

function applyMedicalFilter(technique) {
  if (activeTechniques.has(technique)) {
    activeTechniques.delete(technique);
  } else {
    activeTechniques.add(technique);
  }
  refreshMedicalHighlights();
  renderMedicalPanel();
}

function refreshMedicalHighlights() {
  const matchingZ = new Set();
  if (activeTechniques.size > 0) {
    MEDICAL_ISOTOPES.forEach(iso => {
      if (iso.techniques.some(t => activeTechniques.has(t))) {
        matchingZ.add(iso.Z);
      }
    });
  }

  document.querySelectorAll('.element-tile').forEach(tile => {
    const z = parseInt(tile.dataset.z);
    tile.classList.remove('medical-highlight', 'medical-dim');
    if (activeTechniques.size > 0) {
      if (matchingZ.has(z)) {
        tile.classList.add('medical-highlight');
      } else {
        tile.classList.add('medical-dim');
      }
    }
  });
}

/* Build a PubMed search URL covering the last 2 weeks */
function buildPubmedUrl() {
  const now = new Date();
  const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);
  const fmt = d => `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
  const term = encodeURIComponent('medical radioisotope OR radiopharmaceutical OR targeted radionuclide therapy');
  return `https://pubmed.ncbi.nlm.nih.gov/?term=${term}&datetype=pdat&mindate=${fmt(twoWeeksAgo)}&maxdate=${fmt(now)}&sort=date`;
}

/* ============================================================
   PERIODIC TABLE GRID RENDERING
   ============================================================ */
function buildPeriodicTable() {
  const grid = document.getElementById('ptGrid');
  grid.innerHTML = '';

  Object.values(ELEMENT_DATA).forEach(el => {
    const tile = document.createElement('div');
    tile.className = `element-tile cat-${el.category}`;
    tile.dataset.z = el.Z;
    tile.tabIndex = 0;
    tile.setAttribute('role', 'button');
    tile.setAttribute('aria-label', `${el.name} (${el.symbol}), atomic number ${el.Z}. Click to view isotopes.`);

    let col, row;
    if (el.category === 'lanthanide') {
      col = (el.Z - 57) + 4;
      row = 9;
    } else if (el.category === 'actinide') {
      col = (el.Z - 89) + 4;
      row = 10;
    } else {
      col = el.group;
      row = el.period;
    }
    tile.style.gridColumn = col;
    tile.style.gridRow = row;

    const counts = { stable:0, alpha:0, betam:0, betap:0, it:0, sf:0, other:0 };
    el.isotopes.forEach(iso => counts[decayCategory(iso.decay_modes, iso.is_stable)]++);
    const stripSegments = Object.entries(counts)
      .filter(([,c]) => c > 0)
      .map(([cat,c]) => `<span style="background:${DECAY_COLORS[cat]}; flex-grow:${c}"></span>`)
      .join('');

    tile.innerHTML = `
      <div class="tile-num">${el.Z}</div>
      <div class="tile-symbol">${el.symbol}</div>
      <div class="tile-bottom">
        <div class="tile-name">${el.name}</div>
        <div class="tile-mass">${el.standard_weight
          ? (Number.isInteger(el.standard_weight) ? el.standard_weight : el.standard_weight.toFixed(3))
          : `[${heaviestIsotope(el)}]`}</div>
      </div>
      <div class="tile-decay-strip">${stripSegments}</div>
    `;
    tile.addEventListener('click', () => selectElement(el.Z));
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectElement(el.Z); }
    });
    grid.appendChild(tile);
  });

  // La/Ac reference placeholders in main block (group 3, periods 6 & 7)
  const laRef = document.createElement('div');
  laRef.className = 'la-ac-ref';
  laRef.style.gridColumn = 3; laRef.style.gridRow = 6;
  laRef.textContent = '57–71';
  grid.appendChild(laRef);

  const acRef = document.createElement('div');
  acRef.className = 'la-ac-ref';
  acRef.style.gridColumn = 3; acRef.style.gridRow = 7;
  acRef.textContent = '89–103';
  grid.appendChild(acRef);

  // Spacer row between main block and La/Ac rows
  const spacer = document.createElement('div');
  spacer.style.gridRow = 8;
  spacer.style.gridColumn = '1 / -1';
  spacer.style.height = '6px';
  grid.appendChild(spacer);
}

function heaviestIsotope(el) {
  if (!el.isotopes || el.isotopes.length === 0) return '—';
  const max = el.isotopes.reduce((a,b) => (a.A > b.A ? a : b));
  return max.A;
}

/* ============================================================
   ELEMENT SELECTION -> ISOTOPE STRIP
   ============================================================ */
function selectElement(Z) {
  activeZ = Z;
  activeIsotope = null;

  document.querySelectorAll('.element-tile').forEach(t => {
    t.classList.toggle('is-active', parseInt(t.dataset.z) === Z);
  });

  const el = ELEMENT_DATA[Z];
  const panel = document.getElementById('isoPanel');
  panel.classList.add('is-open');

  const badge = document.getElementById('isoBadge');
  badge.textContent = el.symbol;
  badge.className = `iso-element-badge cat-${el.category}`;

  document.getElementById('isoElementName').textContent = `${el.name} — ${el.symbol}`;

  const stableCount = el.isotopes.filter(i => i.is_stable).length;
  const isomerCount = el.isotopes.filter(i => i.isomers && i.isomers.length).length;
  document.getElementById('isoElementSub').innerHTML = `
    <span>Z = <b>${el.Z}</b></span>
    <span>Standard atomic weight: <b>${el.standard_weight ? el.standard_weight : 'no stable isotope'}</b></span>
    <span>Known isotopes: <b>${el.isotopes.length}</b></span>
    <span>Stable isotopes: <b>${stableCount}</b></span>
    ${isomerCount ? `<span>Notable isomers: <b>${isomerCount}</b></span>` : ''}
  `;

  const strip = document.getElementById('isoStrip');
  strip.innerHTML = '';
  el.isotopes.forEach(iso => {
    const cat = decayCategory(iso.decay_modes, iso.is_stable);
    const chip = document.createElement('div');
    chip.className = 'iso-chip';
    chip.dataset.a = iso.A;
    chip.tabIndex = 0;
    chip.setAttribute('role','button');
    chip.innerHTML = `
      <sup style="font-size:9px; color:var(--text-faint); display:block;">${iso.A}</sup>${el.symbol}
      <div class="chip-strip" style="background:${DECAY_COLORS[cat]}"></div>
    `;
    chip.addEventListener('click', () => selectIsotope(iso, chip));
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectIsotope(iso, chip); }
    });
    strip.appendChild(chip);

    if (iso.isomers && iso.isomers.length) {
      iso.isomers.forEach(isomer => {
        const icat = decayCategory(isomer.decay_modes, false);
        const ichip = document.createElement('div');
        ichip.className = 'iso-chip';
        ichip.innerHTML = `
          <sup style="font-size:9px; color:var(--text-faint); display:block;">${isomer.isomer_label}</sup>${el.symbol}
          <span class="chip-m">ISOMER</span>
          <div class="chip-strip" style="background:${DECAY_COLORS[icat]}"></div>
        `;
        ichip.tabIndex = 0;
        ichip.setAttribute('role','button');
        ichip.addEventListener('click', () => selectIsotope(isomer, ichip, true, iso));
        ichip.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectIsotope(isomer, ichip, true, iso); }
        });
        strip.appendChild(ichip);
      });
    }
  });

  const detail = document.getElementById('detailPanel');
  detail.classList.remove('is-open');
  detail.innerHTML = `<div class="detail-empty">Select an isotope above to view half-life, decay modes, decay energies and specific activity.</div>`;

  setTimeout(() => {
    const panelTop = panel.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: panelTop - 20, behavior: 'smooth' });
  }, 50);
}

document.getElementById('isoPanelClose').addEventListener('click', () => {
  document.getElementById('isoPanel').classList.remove('is-open');
  document.querySelectorAll('.element-tile').forEach(t => t.classList.remove('is-active'));
  activeZ = null;
});

/* ============================================================
   ISOTOPE DETAIL PANEL
   ============================================================ */
const ENERGY_LABELS = {
  alpha_MeV:        { label:'Q(α) — alpha decay energy',                      symbol:'Q_α'  },
  beta_minus_MeV:   { label:'Q(β⁻) — beta-minus decay energy',                symbol:'Q_β⁻' },
  ec_beta_plus_MeV: { label:'Q(EC/β⁺) — electron capture / positron decay energy', symbol:'Q_EC' },
  it_MeV:           { label:'E(IT) — isomeric transition (γ-ray) energy',     symbol:'E_IT' }
};

function selectIsotope(iso, chipEl, isIsomer = false, parentIso = null) {
  activeIsotope = iso;

  document.querySelectorAll('.iso-chip').forEach(c => c.classList.remove('is-selected'));
  if (chipEl) chipEl.classList.add('is-selected');

  const el = ELEMENT_DATA[activeZ];
  const cat = decayCategory(iso.decay_modes, iso.is_stable && !isIsomer);
  const color = DECAY_COLORS[cat];

  const massNumber = iso.A;
  const nuclideName = isIsomer
    ? `${el.name}-${massNumber}${iso.common_name.replace(massNumber,'').replace(/^0/,'')}`
    : `${el.name}-${massNumber}`;
  const nuclideSymbol = isIsomer
    ? `<sup>${iso.common_name}</sup>${el.symbol}`
    : `<sup>${massNumber}</sup>${el.symbol}`;

  const stable = iso.is_stable && !isIsomer;
  const hl = formatHalfLife({...iso, is_stable: stable});

  /* ---------- Headline / identity card ---------- */
  let html = `
    <div class="detail-card" style="grid-column: 1 / -1;">
      <div class="detail-headline">
        <span class="iso-name">${nuclideSymbol} <span style="font-size:14px;color:var(--text-dim);font-weight:400;">(${nuclideName})</span></span>
        <span class="iso-tag" style="color:${color};">${stable ? 'STABLE' : (isIsomer ? 'METASTABLE ISOMER' : 'RADIOACTIVE')}</span>
        ${isIsomer ? `<span class="iso-tag" style="color:var(--text-dim);">Ground state: <sup>${parentIso.A}</sup>${el.symbol}</span>` : ''}
      </div>
      <div style="display:flex; gap:28px; flex-wrap:wrap; margin-top:10px; font-family:var(--font-mono); font-size:12px; color:var(--text-dim);">
        <span>Z = ${iso.Z}</span>
        <span>N = ${iso.N}</span>
        <span>A = ${iso.A}</span>
        ${iso.spin_parity ? `<span>J<sup>π</sup> = ${spinParityHTML(iso.spin_parity)}</span>` : ''}
        ${iso.atomic_mass_u ? `<span>Atomic mass = ${iso.atomic_mass_u.toFixed(6)} u</span>` : ''}
        ${iso.abundance_percent != null ? `<span>Natural abundance = ${iso.abundance_percent}%</span>` : ''}
        ${isIsomer ? `<span>Excitation energy = ${iso.excitation_energy_keV.toFixed(3)} keV</span>` : ''}
        ${(!isIsomer && iso.discovery_year) ? `<span>Discovered ${iso.discovery_year}</span>` : ''}
      </div>
    </div>
  `;

  /* ---------- Applications card ---------- */
  if (iso.application) {
    const isCurated = !!iso.application_curated;
    html += `
      <div class="detail-card applications-card">
        <h3>Where this isotope is used
          <span class="app-badge ${isCurated ? 'curated' : 'general'}">${isCurated ? 'Documented use' : 'General note'}</span>
        </h3>
        <div class="app-text ${isCurated ? '' : 'is-fallback'}">${iso.application}</div>
      </div>
    `;
  }

  if (stable) {
    html += `
      <div class="detail-card">
        <h3>Stability <span class="src-tag">IAEA ENSDF</span></h3>
        <div class="stable-hero">
          <div class="stable-icon">∞</div>
          <div class="stable-text">
            This nuclide is <b>observationally stable</b> — no radioactive decay has ever been measured, or its half-life is so long (&gt;10<span class="exp">18</span> yr) it is treated as stable for all practical purposes. It does not emit radiation and has no specific activity.
          </div>
        </div>
      </div>
    `;
  } else if (hl.isResonance) {
    html += `
      <div class="detail-card">
        <h3>Decay width (resonance) <span class="src-tag">IAEA / ENSDF</span></h3>
        <div class="value-row">
          <span class="v-label">Reported width Γ</span>
          <span class="v-value">${hl.primary}</span>
        </div>
        <div class="value-row">
          <span class="v-label">Equivalent lifetime (ħ/Γ)</span>
          <span class="v-value">${hl.secondary}<span class="unit"> s</span></span>
        </div>
      </div>
      <div class="detail-card" style="grid-column: span 2;">
        <h3>Why no decay modes or activity?</h3>
        <div style="font-size:12.5px; color:var(--text-dim); line-height:1.7;">
          This is an <b style="color:var(--text);">unbound nuclear resonance</b> beyond the neutron or proton drip line — it is not a "normal" radioactive nuclide. Instead of a half-life, the IAEA database reports a <b style="color:var(--text);">decay width Γ</b> in energy units (MeV/keV), via the uncertainty relation Γ·τ ≈ ħ.
          It immediately falls apart (typically by emitting one or more neutrons or protons) on a timescale of ~10<span class="exp">-21</span>–10<span class="exp">-22</span> s — far too fast for a meaningful "specific activity" or branching-ratio table, so those sections are omitted here.
        </div>
      </div>
    `;
  } else {
    /* ---------- Half-life card ---------- */
    html += `
      <div class="detail-card">
        <h3>Half-life <span class="src-tag">IAEA / ENSDF</span></h3>
        <div class="value-row copyable">
          <span class="v-label">Reported value</span>
          <span class="v-value"><span class="v-num">${hl.primary}</span> ${copyBtn(iso.half_life_value, 'reported half-life')}</span>
        </div>
        <div class="value-row copyable">
          <span class="v-label">In seconds</span>
          <span class="v-value"><span class="v-num">${hl.secondary}<span class="unit"> s</span></span> ${copyBtn(sciPlain(iso.half_life_seconds), 'half-life in seconds')}</span>
        </div>
        ${iso.half_life_seconds ? `
        <div class="value-row copyable">
          <span class="v-label">Decay constant λ = ln2/T<span class="exp">½</span></span>
          <span class="v-value"><span class="v-num">${sciHTML(Math.log(2)/iso.half_life_seconds)}<span class="unit"> s⁻¹</span></span> ${copyBtn(sciPlain(Math.log(2)/iso.half_life_seconds), 'decay constant')}</span>
        </div>` : ''}
      </div>
    `;

    /* ---------- Specific activity card ---------- */
    if (iso.specific_activity_Bq_per_g != null) {
      const sa = iso.specific_activity_Bq_per_g;
      const saCi = sa / 3.7e10;
      const saMol = Math.log(2) * NA_CONST / iso.half_life_seconds;
      html += `
        <div class="detail-card">
          <h3>Specific activity <span class="src-tag">derived: A=ln2·N_A/(T½·M)</span></h3>
          <div class="value-row copyable">
            <span class="v-label">Activity per gram</span>
            <span class="v-value"><span class="v-num">${sciHTML(sa)}<span class="unit"> Bq/g</span></span> ${copyBtn(sciPlain(sa), 'specific activity in Bq/g')}</span>
          </div>
          <div class="value-row copyable">
            <span class="v-label">Per gram (curies)</span>
            <span class="v-value"><span class="v-num">${sciHTML(saCi)}<span class="unit"> Ci/g</span></span> ${copyBtn(sciPlain(saCi), 'specific activity in Ci/g')}</span>
          </div>
          <div class="value-row copyable">
            <span class="v-label">Activity per mole</span>
            <span class="v-value"><span class="v-num">${sciHTML(saMol)}<span class="unit"> Bq/mol</span></span> ${copyBtn(sciPlain(saMol), 'specific activity in Bq/mol')}</span>
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="detail-card">
          <h3>Specific activity</h3>
          <div class="value-row"><span class="v-label">Not computable</span><span class="v-value">—</span></div>
          <div style="font-size:12px;color:var(--text-faint); margin-top:6px;">Half-life or atomic mass unavailable for this nuclide in the source dataset.</div>
        </div>
      `;
    }

    /* ---------- Decay modes card ---------- */
    if (iso.decay_modes && iso.decay_modes.length) {
      html += `<div class="detail-card"><h3>Decay modes <span class="src-tag">branching ratios</span></h3>`;
      iso.decay_modes.forEach(dm => {
        const dcat = dm.mode.includes('A') && !dm.mode.startsWith('B') ? 'alpha'
                    : dm.mode.startsWith('B-') ? 'betam'
                    : (dm.mode.startsWith('B+') || dm.mode.startsWith('EC')) ? 'betap'
                    : dm.mode === 'IT' ? 'it'
                    : dm.mode.includes('SF') ? 'sf' : 'other';
        const dcolor = DECAY_COLORS[dcat];
        const pct = dm.percent != null ? dm.percent : null;
        let pctLabel;
        if (pct != null) {
          if (pct > 0 && pct < 0.001) {
            pctLabel = sciHTML(pct, 2) + '%';
            if (dm.percent_unc) {
              const uncNum = parseFloat(dm.percent_unc);
              if (!isNaN(uncNum) && uncNum > 0) {
                pctLabel += ` <span style="color:var(--text-faint); font-weight:400;">± ${sciHTML(uncNum, 1)}%</span>`;
              }
            }
          } else {
            pctLabel = `${pct}%`;
            if (dm.percent_unc) pctLabel += ` <span style="color:var(--text-faint); font-weight:400;">± ${dm.percent_unc}</span>`;
          }
        } else {
          pctLabel = dm.percent_raw ? dm.percent_raw + '%' : '—';
        }
        let barWidth;
        if (pct == null) barWidth = 0;
        else if (pct <= 0) barWidth = 0;
        else if (pct < 1) barWidth = 1.2;
        else barWidth = Math.min(100, pct);
        html += `
          <div class="decay-mode-row">
            <div class="dm-label-line">
              <span class="dm-name"><span class="dm-dot" style="background:${dcolor}"></span>${dm.label} <span style="color:var(--text-faint); font-family:var(--font-mono); font-size:10.5px;">(${dm.mode})</span></span>
              <span class="dm-pct" style="color:${dcolor}">${pctLabel}</span>
            </div>
            <div class="dm-bar-track"><div class="dm-bar-fill" style="width:${barWidth}%; background:${dcolor};"></div></div>
          </div>
        `;
      });
      html += `</div>`;
    }

    /* ---------- Decay energies card ---------- */
    const energies = iso.decay_energies_MeV || {};
    const energyKeys = Object.keys(energies);
    if (energyKeys.length) {
      html += `<div class="detail-card"><h3>Decay energies (Q-values) <span class="src-tag">IAEA / NUBASE mass evaluation</span></h3>`;
      energyKeys.forEach(key => {
        const info = ENERGY_LABELS[key] || { label:key, symbol:key };
        const val = energies[key];
        html += `
          <div class="value-row">
            <span class="v-label">${info.label}</span>
            <span class="v-value">${val.toFixed(4)}<span class="unit"> MeV</span></span>
          </div>
          <div class="value-row">
            <span class="v-label" style="font-size:11px;">— in joules</span>
            <span class="v-value" style="font-size:11.5px;">${sciHTML(val * 1.602176634e-13)}<span class="unit"> J</span></span>
          </div>
        `;
      });
      html += `
        <div style="font-size:11px; color:var(--text-faint); margin-top:8px; line-height:1.5;">
          Q-values represent total energy released, shared between decay products (recoil nucleus, emitted particle, neutrinos/gammas as applicable).
        </div>
      </div>`;
    }

    /* ---------- Gamma radiation card ---------- */
    const gamma = iso.gamma_summary;
    const gammaLines = iso.gamma_lines || [];
    if (gamma && gammaLines.length > 0 && gamma.dominant_energy_keV != null) {
      const topLines = gammaLines.slice(0, 8);
      const allShown = gammaLines.length <= 8;
      const domE = gamma.dominant_energy_keV ?? 0;
      const domI = gamma.dominant_intensity_pct ?? 0;
      const totI = gamma.total_intensity_pct ?? 0;
      const meanE = gamma.mean_energy_keV ?? 0;

      html += `
        <div class="detail-card gamma-card">
          <h3>Gamma radiation <span class="src-tag">IAEA ENSDF — ${gamma.n_lines} line${gamma.n_lines > 1 ? 's' : ''}</span></h3>
          <div class="gamma-stats">
            <div class="gamma-stat">
              <span class="gs-label">Dominant line</span>
              <span class="gs-value">${domE.toFixed(3)} <span class="gs-unit">keV</span></span>
              <span class="gs-sub">${domI.toFixed(3)}% / decay</span>
            </div>
            <div class="gamma-stat">
              <span class="gs-label">Sum of intensities</span>
              <span class="gs-value">${totI.toFixed(2)}<span class="gs-unit">%</span></span>
              <span class="gs-sub">over all ${gamma.n_lines} lines</span>
            </div>
            <div class="gamma-stat">
              <span class="gs-label">Intensity-weighted mean E</span>
              <span class="gs-value">${meanE.toFixed(2)} <span class="gs-unit">keV</span></span>
              <span class="gs-sub">Σ(E·I) / Σ(I)</span>
            </div>
          </div>
          <div class="gamma-table-wrap">
            <table class="gamma-table">
              <thead>
                <tr>
                  <th>Energy (keV)</th>
                  <th>Intensity (%/decay)</th>
                  <th>Uncertainty</th>
                  <th class="gamma-bar-col"></th>
                </tr>
              </thead>
              <tbody>
                ${topLines.map(g => {
                  const e = g.e ?? g.energy_keV ?? 0;
                  const i = g.i ?? g.intensity_pct ?? 0;
                  const u = g.u ?? g.unc_pct ?? null;
                  const barW = domI > 0 ? Math.max(2, (i / domI) * 100).toFixed(1) : 2;
                  const unc = u != null ? `± ${u < 0.01 ? u.toExponential(1) : u.toFixed(3)}` : '—';
                  return `<tr>
                    <td class="gamma-e">${e.toFixed(3)}</td>
                    <td class="gamma-i">${i < 0.001 ? i.toExponential(3) : i.toFixed(4)}</td>
                    <td class="gamma-u">${unc}</td>
                    <td class="gamma-bar-cell"><div class="gamma-bar" style="width:${barW}%"></div></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
            ${!allShown ? `<div class="gamma-more">+ ${gammaLines.length - 8} more lines not shown</div>` : ''}
          </div>
        </div>
      `;
    } else if (!stable && !hl.isResonance) {
      html += `
        <div class="detail-card">
          <h3>Gamma radiation <span class="src-tag">IAEA ENSDF</span></h3>
          <div style="font-size:12.5px; color:var(--text-dim); padding:8px 0;">
            No significant gamma emission found in IAEA ENSDF for this nuclide —
            it may be a pure β/α emitter, decay gammas are below detection, or ENSDF data not yet evaluated.
          </div>
        </div>
      `;
    }

    /* ---------- Isomer cross-reference card ---------- */
    if (isIsomer) {
      html += `
        <div class="detail-card">
          <h3>Relation to ground state</h3>
          <div class="value-row">
            <span class="v-label">Ground state nuclide</span>
            <span class="v-value"><sup>${parentIso.A}</sup>${el.symbol}</span>
          </div>
          <div class="value-row">
            <span class="v-label">Excitation energy above ground state</span>
            <span class="v-value">${iso.excitation_energy_keV.toFixed(3)}<span class="unit"> keV</span></span>
          </div>
          <div class="value-row">
            <span class="v-label">Ground-state half-life</span>
            <span class="v-value">${parentIso.is_stable ? 'Stable' : `${parentIso.half_life_value} ${unitLabel(parentIso.half_life_unit)}`}</span>
          </div>
          <div style="font-size:11px; color:var(--text-faint); margin-top:8px; line-height:1.5;">
            An isomer is a long-lived excited nuclear state of the same isotope. It decays either by emitting a γ-ray to reach the ground state (isomeric transition, IT) or directly via the modes listed above.
          </div>
        </div>
      `;
    }
  }

  const detail = document.getElementById('detailPanel');
  detail.innerHTML = `<div class="detail-grid">${html}</div>`;
  detail.classList.add('is-open');

  setTimeout(() => {
    const panel = document.getElementById('isoPanel');
    const panelTop = panel.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: panelTop - 20, behavior: 'smooth' });
  }, 50);
}

/* ============================================================
   DATA LOADING / INIT
   ============================================================ */
async function init() {
  // Inject CSS overrides first so they apply immediately
  injectStyles();

  const grid = document.getElementById('ptGrid');
  grid.innerHTML = `<div class="loading-state" style="grid-column:1/-1;">
    <div>Fetching nuclide dataset from IAEA Live Chart of Nuclides…</div>
    <div class="loading-bar"></div>
  </div>`;
  try {
    const res = await fetch('data.json');
    ELEMENT_DATA = await res.json();
    document.getElementById('dataStatus').textContent = `${Object.keys(ELEMENT_DATA).length} elements loaded`;
    buildPeriodicTable();
    buildMedicalPanel();
  } catch (err) {
    grid.innerHTML = `<div class="loading-state" style="grid-column:1/-1; color:var(--decay-sf);">
      Failed to load nuclide dataset (${err.message}). Ensure data.json is in the same folder as index.html.
    </div>`;
    document.getElementById('dataStatus').textContent = 'Error';
  }
}

init();
