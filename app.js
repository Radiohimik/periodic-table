/* ============================================================
   NUCLIDE EXPLORER — Application Logic
   ============================================================ */

const NA_CONST = 6.02214076e23;

let ELEMENT_DATA = null;
let activeZ = null;
let activeIsotope = null;

/* ============================================================
   MEDICAL ISOTOPE DATABASE
   Sources: EANM/SNMMI guidelines, published literature
   ============================================================ */
const MEDICAL_ISOTOPES = {
  // F  — F-18 FDG / PSMA PET
  9:  [{ A:18,  status:'established', type:'diagnostic',  modality:'PET',          indications:['neuroendocrine','prostate','cardiac','brain','lymphoma'] }],
  // Na — Na-22 (research PET)
  11: [{ A:22,  status:'development', type:'diagnostic',  modality:'PET',          indications:[] }],
  // P  — P-32 brachytherapy
  15: [{ A:32,  status:'established', type:'therapy',     modality:'brachytherapy',indications:[] }],
  // Sc — Sc-44 PET / Sc-47 theranostic pair
  21: [
    { A:44,  status:'development', type:'diagnostic',  modality:'PET',          indications:[] },
    { A:47,  status:'development', type:'theranostic', modality:'beta',         indications:['neuroendocrine'] }
  ],
  // Cu — Cu-64 theranostic PET
  29: [{ A:64,  status:'established', type:'theranostic', modality:'PET',          indications:['lymphoma','breast'] }],
  // Ga — Ga-68 PSMA / DOTATATE PET
  31: [{ A:68,  status:'established', type:'diagnostic',  modality:'PET',          indications:['neuroendocrine','prostate'] }],
  // Rb — Rb-82 cardiac PET
  37: [{ A:82,  status:'established', type:'diagnostic',  modality:'PET',          indications:['cardiac'] }],
  // Sr — Sr-89 bone pain palliation
  38: [{ A:89,  status:'established', type:'therapy',     modality:'beta',         indications:['bone'] }],
  // Y  — Y-90 microspheres / SIRT / DOTATATE
  39: [{ A:90,  status:'established', type:'therapy',     modality:'brachytherapy',indications:['liver','neuroendocrine'] }],
  // Zr — Zr-89 immuno-PET
  40: [{ A:89,  status:'established', type:'diagnostic',  modality:'PET',          indications:[] }],
  // Tc — Tc-99m (world's most used diagnostic)
  43: [{ A:99,  status:'established', type:'diagnostic',  modality:'SPECT',        indications:['bone','cardiac'] }],
  // In — In-111 Octreoscan SPECT
  49: [{ A:111, status:'established', type:'diagnostic',  modality:'SPECT',        indications:['neuroendocrine'] }],
  // I  — I-123 SPECT + I-131 theranostic thyroid
  53: [
    { A:123, status:'established', type:'diagnostic',  modality:'SPECT',        indications:['thyroid'] },
    { A:131, status:'established', type:'theranostic', modality:'beta',         indications:['thyroid'] }
  ],
  // Sm — Sm-153 bone pain
  62: [{ A:153, status:'established', type:'therapy',     modality:'beta',         indications:['bone'] }],
  // Tb — Tb-149 alpha / Tb-161 beta (theranostic quartet)
  65: [
    { A:149, status:'development', type:'therapy',     modality:'alpha',        indications:[] },
    { A:161, status:'development', type:'theranostic', modality:'beta',         indications:['neuroendocrine','prostate'] }
  ],
  // Dy — Dy-165 radiation synovectomy
  66: [{ A:165, status:'established', type:'therapy',     modality:'synovectomy',  indications:[] }],
  // Ho — Ho-166 TARE liver / microspheres
  67: [{ A:166, status:'established', type:'therapy',     modality:'brachytherapy',indications:['liver'] }],
  // Er — Er-169 radiation synovectomy
  68: [{ A:169, status:'established', type:'therapy',     modality:'synovectomy',  indications:[] }],
  // Lu — Lu-177 PSMA-617 / DOTATATE (fastest growing)
  71: [{ A:177, status:'established', type:'theranostic', modality:'beta',         indications:['neuroendocrine','prostate'] }],
  // Re — Re-186 / Re-188 bone / liver
  75: [
    { A:186, status:'established', type:'therapy',     modality:'beta',         indications:['bone'] },
    { A:188, status:'established', type:'therapy',     modality:'beta',         indications:['bone','liver'] }
  ],
  // Tl — Tl-201 cardiac SPECT
  81: [{ A:201, status:'established', type:'diagnostic',  modality:'SPECT',        indications:['cardiac'] }],
  // Pb — Pb-212 Pb-DOTAMTATE (alpha cascade)
  82: [{ A:212, status:'development', type:'therapy',     modality:'alpha',        indications:['neuroendocrine','prostate'] }],
  // Bi — Bi-213 alpha TAT
  83: [{ A:213, status:'development', type:'therapy',     modality:'alpha',        indications:[] }],
  // At — At-211 alpha TAT
  85: [{ A:211, status:'development', type:'therapy',     modality:'alpha',        indications:[] }],
  // Ra — Ra-223 dichloride bone mets (first approved alpha therapy)
  88: [{ A:223, status:'established', type:'therapy',     modality:'alpha',        indications:['bone'] }],
  // Ac — Ac-225 PSMA alpha TAT
  89: [{ A:225, status:'development', type:'therapy',     modality:'alpha',        indications:['prostate'] }],
};

/* Medical type -> dot color */
const MED_COLORS = {
  diagnostic:  '#5CA8FF',
  theranostic: '#5EEAD4',
  therapy:     '#FF8A5C'
};

/* ============================================================
   FILTER STATE
   ============================================================ */
const filterState = {
  medicalOnly: false,
  status:     new Set(),
  type:       new Set(),
  modality:   new Set(),
  indication: new Set()
};

/* ============================================================
   DECAY HELPERS (unchanged)
   ============================================================ */
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

/* ============================================================
   NUMBER FORMATTING HELPERS (unchanged)
   ============================================================ */
function sciHTML(value, sig = 3) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  if (value === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(value)));
  let mant = value / Math.pow(10, exp);
  let mantR = parseFloat(mant.toFixed(sig - 1));
  let e = exp;
  if (Math.abs(mantR) >= 10) { mantR /= 10; e += 1; }
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
  if (Math.abs(mantR) >= 10) { mantR /= 10; e += 1; }
  const mantStr = mantR.toFixed(sig - 1);
  if (e === 0) return mantStr;
  return `${mantStr}e${e}`;
}

function copyBtn(value, label) {
  if (value === null || value === undefined || value === '') return '';
  const safeValue = String(value).replace(/"/g, '&quot;');
  return `<button class="copy-btn" type="button" data-copy-value="${safeValue}" aria-label="Copy ${label || 'value'}" title="Copy ${label || 'value'}">
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
  ta.style.cssText = 'position:fixed;opacity:0;';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
  if (onDone) onDone();
}

function formatHalfLife(iso) {
  if (iso.is_stable) return { primary:'Stable', secondary:'Does not decay', isResonance:false };
  if (!iso.half_life_value) return { primary:'Unknown', secondary:'—', isResonance:false };
  const val = iso.half_life_value;
  const unit = iso.half_life_unit || '';
  const sec = iso.half_life_seconds;
  const unc = iso.half_life_unc ? ` ± ${iso.half_life_unc}` : '';
  const isResonance = ['MEV','KEV','EV'].includes(unit.toUpperCase());
  if (isResonance) return { primary:`${val}${unc} ${unit}`, secondary: sec != null ? sciHTML(sec) : '—', isResonance:true };
  return { primary:`${val}${unc} ${unitLabel(unit)}`, secondary: sec != null ? sciHTML(sec) : '—', isResonance:false };
}
function unitLabel(u) {
  const map = { s:'s', ms:'ms', us:'µs', ns:'ns', ps:'ps', fs:'fs', as:'as', zs:'zs', ys:'ys',
    m:'min', h:'h', d:'days', y:'years', Y:'years', ky:'kyr', My:'Myr', Gy:'Gyr', Py:'Pyr', Ey:'Eyr', Ty:'Tyr' };
  return map[u] || u;
}
function spinParityHTML(jp) {
  if (!jp) return '—';
  const m = jp.match(/^(\(?[\d/]+\)?)\s*([+\-])$/);
  if (!m) return jp;
  return `${m[1]}<sup>${m[2]}</sup>`;
}

/* ============================================================
   SIDEBAR: compute counts & wire up interactivity
   ============================================================ */
function getMedicalIsotopesForZ(Z) {
  return MEDICAL_ISOTOPES[Z] || [];
}

function computeCounts() {
  // Flatten all medical isotopes
  const all = Object.values(MEDICAL_ISOTOPES).flat();
  const countFor = (group, val) => all.filter(iso => {
    if (group === 'status')     return iso.status === val;
    if (group === 'type')       return iso.type === val;
    if (group === 'modality')   return iso.modality === val;
    if (group === 'indication') return iso.indications.includes(val);
    return false;
  }).length;

  // Status
  document.getElementById('count-established').textContent = countFor('status','established');
  document.getElementById('count-development').textContent = countFor('status','development');
  // Type
  document.getElementById('count-diagnostic').textContent  = countFor('type','diagnostic');
  document.getElementById('count-theranostic').textContent = countFor('type','theranostic');
  document.getElementById('count-therapy').textContent     = countFor('type','therapy');
  // Modality
  document.getElementById('count-PET').textContent          = countFor('modality','PET');
  document.getElementById('count-SPECT').textContent        = countFor('modality','SPECT');
  document.getElementById('count-alpha').textContent        = countFor('modality','alpha');
  document.getElementById('count-brachytherapy').textContent= countFor('modality','brachytherapy');
  document.getElementById('count-beta').textContent         = countFor('modality','beta');
  document.getElementById('count-synovectomy').textContent  = countFor('modality','synovectomy');
  // Indication
  ['neuroendocrine','prostate','thyroid','liver','bone','lymphoma','breast','cardiac','brain'].forEach(ind => {
    const el = document.getElementById('count-' + ind);
    if (el) el.textContent = countFor('indication', ind);
  });
}

function initSidebar() {
  computeCounts();

  // Medical toggle
  document.getElementById('medicalToggle').addEventListener('change', (e) => {
    filterState.medicalOnly = e.target.checked;
    document.getElementById('toggleHelper').textContent =
      filterState.medicalOnly ? 'Toggle ON to filter.' : 'No filter — show all.';
    applyFilters();
  });

  // Filter items
  document.querySelectorAll('.filter-item[data-filter-group]').forEach(item => {
    const group = item.dataset.filterGroup;
    const value = item.dataset.filterValue;
    const checkbox = item.querySelector('input[type="checkbox"]');

    item.addEventListener('click', (e) => {
      // If medical toggle is off, turn it on automatically
      if (!filterState.medicalOnly) {
        filterState.medicalOnly = true;
        document.getElementById('medicalToggle').checked = true;
        document.getElementById('toggleHelper').textContent = 'Toggle ON to filter.';
      }
      checkbox.checked = !checkbox.checked;
      const set = filterState[group];
      if (checkbox.checked) set.add(value); else set.delete(value);
      item.classList.toggle('is-active', checkbox.checked);
      applyFilters();
    });
  });
}

/* ============================================================
   FILTER LOGIC
   ============================================================ */
function elementMatchesFilters(Z) {
  const medIsos = getMedicalIsotopesForZ(Z);
  if (medIsos.length === 0) return false;

  // If no sub-filters active, any medical element matches
  const anySubFilter = filterState.status.size > 0 || filterState.type.size > 0 ||
                       filterState.modality.size > 0 || filterState.indication.size > 0;
  if (!anySubFilter) return true;

  return medIsos.some(iso => {
    const statusOk  = filterState.status.size === 0     || filterState.status.has(iso.status);
    const typeOk    = filterState.type.size === 0       || filterState.type.has(iso.type);
    const modalOk   = filterState.modality.size === 0   || filterState.modality.has(iso.modality);
    const indOk     = filterState.indication.size === 0 || iso.indications.some(i => filterState.indication.has(i));
    return statusOk && typeOk && modalOk && indOk;
  });
}

function applyFilters() {
  if (!ELEMENT_DATA) return;
  document.querySelectorAll('.element-tile').forEach(tile => {
    const Z = parseInt(tile.dataset.z);
    if (!filterState.medicalOnly) {
      tile.classList.remove('is-dimmed');
    } else {
      const matches = elementMatchesFilters(Z);
      tile.classList.toggle('is-dimmed', !matches);
    }
  });
}

/* ============================================================
   PERIODIC TABLE RENDERING
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
    tile.setAttribute('aria-label', `${el.name} (${el.symbol}), Z=${el.Z}`);

    // Grid position
    let col, row;
    if (el.category === 'lanthanide') { col = (el.Z - 57) + 4; row = 9; }
    else if (el.category === 'actinide') { col = (el.Z - 89) + 4; row = 10; }
    else { col = el.group; row = el.period; }
    tile.style.gridColumn = col;
    tile.style.gridRow = row;

    // Decay strip data
    const counts = { stable:0, alpha:0, betam:0, betap:0, it:0, sf:0, other:0 };
    el.isotopes.forEach(iso => counts[decayCategory(iso.decay_modes, iso.is_stable)]++);
    const stripSegments = Object.entries(counts)
      .filter(([,c]) => c > 0)
      .map(([cat,c]) => `<span style="background:${DECAY_COLORS[cat]};flex-grow:${c}"></span>`)
      .join('');

    // Medical dots
    const medIsos = getMedicalIsotopesForZ(el.Z);
    let dotsHtml = '';
    if (medIsos.length > 0) {
      // Show up to 3 dots, one per unique type
      const seen = new Set();
      const dots = medIsos
        .filter(m => { const k = m.type; if (seen.has(k)) return false; seen.add(k); return true; })
        .slice(0, 3)
        .map(m => `<span class="tile-med-dot ${m.status}" style="background:${MED_COLORS[m.type]}; color:${MED_COLORS[m.type]};"></span>`)
        .join('');
      dotsHtml = `<div class="tile-med-dots">${dots}</div>`;
    }

    tile.innerHTML = `
      ${dotsHtml}
      <div class="tile-num">${el.Z}</div>
      <div class="tile-symbol">${el.symbol}</div>
      <div class="tile-bottom">
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

  // La/Ac reference placeholders
  [{ col:3, row:6, text:'57–71' }, { col:3, row:7, text:'89–103' }].forEach(({ col, row, text }) => {
    const ref = document.createElement('div');
    ref.className = 'la-ac-ref';
    ref.style.gridColumn = col;
    ref.style.gridRow = row;
    ref.textContent = text;
    grid.appendChild(ref);
  });

  // Apply any existing filters
  applyFilters();
}

function heaviestIsotope(el) {
  if (!el.isotopes || el.isotopes.length === 0) return '—';
  return el.isotopes.reduce((a, b) => a.A > b.A ? a : b).A;
}

/* ============================================================
   ELEMENT SELECTION
   ============================================================ */
function selectElement(Z) {
  activeZ = Z;
  activeIsotope = null;

  document.querySelectorAll('.element-tile').forEach(t =>
    t.classList.toggle('is-active', parseInt(t.dataset.z) === Z));

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
    <span>Atomic weight: <b>${el.standard_weight ? el.standard_weight : 'none stable'}</b></span>
    <span>Isotopes: <b>${el.isotopes.length}</b></span>
    <span>Stable: <b>${stableCount}</b></span>
    ${isomerCount ? `<span>Isomers: <b>${isomerCount}</b></span>` : ''}
  `;

  // Isotope strip
  const strip = document.getElementById('isoStrip');
  strip.innerHTML = '';
  el.isotopes.forEach(iso => {
    const cat = decayCategory(iso.decay_modes, iso.is_stable);
    const chip = document.createElement('div');
    chip.className = 'iso-chip';
    chip.dataset.a = iso.A;
    chip.tabIndex = 0;
    chip.setAttribute('role', 'button');
    chip.innerHTML = `
      <sup style="font-size:8px;color:var(--text);font-weight:700;display:block;">${iso.A}</sup>${el.symbol}
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
        ichip.tabIndex = 0;
        ichip.setAttribute('role', 'button');
        ichip.innerHTML = `
          <sup style="font-size:8px;color:var(--text);font-weight:700;display:block;">${isomer.isomer_label}</sup>${el.symbol}
          <span class="chip-m">ISOMER</span>
          <div class="chip-strip" style="background:${DECAY_COLORS[icat]}"></div>
        `;
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

  // Scroll to panel
  setTimeout(() => {
    const panel = document.getElementById('isoPanel');
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  alpha_MeV:       { label:'Q(α) — alpha decay energy',               symbol:'Q_α' },
  beta_minus_MeV:  { label:'Q(β⁻) — beta-minus decay energy',         symbol:'Q_β⁻' },
  ec_beta_plus_MeV:{ label:'Q(EC/β⁺) — electron capture / β⁺ energy', symbol:'Q_EC' },
  it_MeV:          { label:'E(IT) — isomeric transition energy',       symbol:'E_IT' }
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
  const hl = formatHalfLife({ ...iso, is_stable: stable });

  /* ---- Identity card ---- */
  let html = `
    <div class="detail-card" style="grid-column:1/-1;">
      <div class="detail-headline">
        <span class="iso-name">${nuclideSymbol} <span style="font-size:13px;color:var(--text-dim);font-weight:400;">(${nuclideName})</span></span>
        <span class="iso-tag" style="color:${color};">${stable ? 'STABLE' : (isIsomer ? 'METASTABLE ISOMER' : 'RADIOACTIVE')}</span>
        ${isIsomer ? `<span class="iso-tag" style="color:var(--text-dim);">Ground state: <sup>${parentIso.A}</sup>${el.symbol}</span>` : ''}
      </div>
      <div style="display:flex;gap:22px;flex-wrap:wrap;margin-top:8px;font-family:var(--font-mono);font-size:11.5px;color:var(--text-dim);">
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

  /* ---- Medical use card (if applicable) ---- */
  const medIsos = getMedicalIsotopesForZ(el.Z).filter(m => m.A === massNumber);
  if (medIsos.length > 0) {
    html += `
      <div class="detail-card medical-card">
        <h3>Medical / Clinical Use <span class="src-tag">EANM / SNMMI</span></h3>
        ${medIsos.map(m => `
          <div class="med-isotope-row">
            <span class="med-iso-name">${el.symbol}-${m.A}</span>
            <span class="med-pill ${m.type}">${m.type}</span>
            <span class="med-pill">${m.modality}</span>
            <span class="med-pill ${m.status}">${m.status === 'established' ? 'Established' : 'In Development'}</span>
            ${m.indications.length ? `<span class="med-indication">${m.indications.join(' · ')}</span>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ---- Applications card (existing data) ---- */
  if (iso.application) {
    const isCurated = !!iso.application_curated;
    html += `
      <div class="detail-card applications-card">
        <h3>Applications <span class="app-badge ${isCurated ? 'curated' : 'general'}">${isCurated ? 'Documented use' : 'General note'}</span></h3>
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
            This nuclide is <b>observationally stable</b> — no radioactive decay has ever been measured, or its half-life is so long (&gt;10<span class="exp">18</span> yr) it is treated as stable for all practical purposes.
          </div>
        </div>
      </div>
    `;
  } else if (hl.isResonance) {
    html += `
      <div class="detail-card">
        <h3>Decay width (resonance) <span class="src-tag">IAEA / ENSDF</span></h3>
        <div class="value-row"><span class="v-label">Reported width Γ</span><span class="v-value">${hl.primary}</span></div>
        <div class="value-row"><span class="v-label">Equivalent lifetime (ħ/Γ)</span><span class="v-value">${hl.secondary}<span class="unit"> s</span></span></div>
      </div>
      <div class="detail-card" style="grid-column:span 2;">
        <h3>Why no decay modes?</h3>
        <div style="font-size:12px;color:var(--text-dim);line-height:1.7;">
          This is an <b style="color:var(--text);">unbound nuclear resonance</b> beyond the drip line — the IAEA reports a <b style="color:var(--text);">decay width Γ</b> in energy units (via Γ·τ ≈ ħ). It disintegrates on a timescale of ~10<span class="exp">-21</span>–10<span class="exp">-22</span> s.
        </div>
      </div>
    `;
  } else {
    /* ---- Half-life card ---- */
    html += `
      <div class="detail-card">
        <h3>Half-life <span class="src-tag">IAEA / ENSDF</span></h3>
        <div class="value-row copyable">
          <span class="v-label">Reported value</span>
          <span class="v-value"><span class="v-num">${hl.primary}</span> ${copyBtn(iso.half_life_value,'reported half-life')}</span>
        </div>
        <div class="value-row copyable">
          <span class="v-label">In seconds</span>
          <span class="v-value"><span class="v-num">${hl.secondary}<span class="unit"> s</span></span> ${copyBtn(sciPlain(iso.half_life_seconds),'half-life in seconds')}</span>
        </div>
        ${iso.half_life_seconds ? `
        <div class="value-row copyable">
          <span class="v-label">Decay constant λ = ln2/T½</span>
          <span class="v-value"><span class="v-num">${sciHTML(Math.log(2)/iso.half_life_seconds)}<span class="unit"> s⁻¹</span></span> ${copyBtn(sciPlain(Math.log(2)/iso.half_life_seconds),'decay constant')}</span>
        </div>` : ''}
      </div>
    `;

    /* ---- Specific activity ---- */
    if (iso.specific_activity_Bq_per_g != null) {
      const sa = iso.specific_activity_Bq_per_g;
      const saCi = sa / 3.7e10;
      const saMol = Math.log(2) * NA_CONST / iso.half_life_seconds;
      html += `
        <div class="detail-card">
          <h3>Specific activity <span class="src-tag">derived: ln2·Nₐ/(T½·M)</span></h3>
          <div class="value-row copyable"><span class="v-label">Per gram (Bq)</span><span class="v-value"><span class="v-num">${sciHTML(sa)}<span class="unit"> Bq/g</span></span> ${copyBtn(sciPlain(sa),'Bq/g')}</span></div>
          <div class="value-row copyable"><span class="v-label">Per gram (Ci)</span><span class="v-value"><span class="v-num">${sciHTML(saCi)}<span class="unit"> Ci/g</span></span> ${copyBtn(sciPlain(saCi),'Ci/g')}</span></div>
          <div class="value-row copyable"><span class="v-label">Per mole</span><span class="v-value"><span class="v-num">${sciHTML(saMol)}<span class="unit"> Bq/mol</span></span> ${copyBtn(sciPlain(saMol),'Bq/mol')}</span></div>
        </div>
      `;
    } else {
      html += `
        <div class="detail-card">
          <h3>Specific activity</h3>
          <div class="value-row"><span class="v-label">Not computable</span><span class="v-value">—</span></div>
          <div style="font-size:11.5px;color:var(--text-faint);margin-top:5px;">Half-life or atomic mass unavailable in source dataset.</div>
        </div>
      `;
    }

    /* ---- Decay modes ---- */
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
              const u = parseFloat(dm.percent_unc);
              if (!isNaN(u) && u > 0) pctLabel += ` <span style="color:var(--text-faint);font-weight:400;">± ${sciHTML(u,1)}%</span>`;
            }
          } else {
            pctLabel = `${pct}%`;
            if (dm.percent_unc) pctLabel += ` <span style="color:var(--text-faint);font-weight:400;">± ${dm.percent_unc}</span>`;
          }
        } else {
          pctLabel = dm.percent_raw ? dm.percent_raw + '%' : '—';
        }
        let barWidth;
        if (pct == null || pct <= 0) barWidth = 0;
        else if (pct < 1) barWidth = 1.2;
        else barWidth = Math.min(100, pct);
        html += `
          <div class="decay-mode-row">
            <div class="dm-label-line">
              <span class="dm-name"><span class="dm-dot" style="background:${dcolor}"></span>${dm.label} <span style="color:var(--text-faint);font-family:var(--font-mono);font-size:9.5px;">(${dm.mode})</span></span>
              <span class="dm-pct" style="color:${dcolor}">${pctLabel}</span>
            </div>
            <div class="dm-bar-track"><div class="dm-bar-fill" style="width:${barWidth}%;background:${dcolor};"></div></div>
          </div>
        `;
      });
      html += `</div>`;
    }

    /* ---- Decay energies ---- */
    const energies = iso.decay_energies_MeV || {};
    const energyKeys = Object.keys(energies);
    if (energyKeys.length) {
      html += `<div class="detail-card"><h3>Decay energies (Q-values) <span class="src-tag">NUBASE</span></h3>`;
      energyKeys.forEach(key => {
        const info = ENERGY_LABELS[key] || { label:key, symbol:key };
        const val = energies[key];
        html += `
          <div class="value-row"><span class="v-label">${info.label}</span><span class="v-value">${val.toFixed(4)}<span class="unit"> MeV</span></span></div>
          <div class="value-row"><span class="v-label" style="font-size:10.5px;">— in joules</span><span class="v-value" style="font-size:11px;">${sciHTML(val * 1.602176634e-13)}<span class="unit"> J</span></span></div>
        `;
      });
      html += `<div style="font-size:10.5px;color:var(--text-faint);margin-top:6px;line-height:1.5;">Q-values: total energy released, shared between decay products.</div></div>`;
    }

    /* ---- Gamma card ---- */
    const gamma = iso.gamma_summary;
    const gammaLines = iso.gamma_lines || [];
    if (gamma && gammaLines.length > 0 && gamma.dominant_energy_keV != null) {
      const topLines = gammaLines.slice(0, 8);
      const allShown = gammaLines.length <= 8;
      html += `
        <div class="detail-card gamma-card">
          <h3>Gamma radiation <span class="src-tag">IAEA ENSDF — ${gamma.n_lines} line${gamma.n_lines > 1 ? 's' : ''}</span></h3>
          <div class="gamma-stats">
            <div class="gamma-stat">
              <span class="gs-label">Dominant line</span>
              <span class="gs-value">${(gamma.dominant_energy_keV ?? 0).toFixed(3)} <span class="gs-unit">keV</span></span>
              <span class="gs-sub">${(gamma.dominant_intensity_pct ?? 0).toFixed(3)}% / decay</span>
            </div>
            <div class="gamma-stat">
              <span class="gs-label">Sum of intensities</span>
              <span class="gs-value">${(gamma.total_intensity_pct ?? 0).toFixed(2)}<span class="gs-unit">%</span></span>
              <span class="gs-sub">over all ${gamma.n_lines} lines</span>
            </div>
            <div class="gamma-stat">
              <span class="gs-label">Weighted mean E</span>
              <span class="gs-value">${(gamma.mean_energy_keV ?? 0).toFixed(2)} <span class="gs-unit">keV</span></span>
              <span class="gs-sub">Σ(E·I) / Σ(I)</span>
            </div>
          </div>
          <div class="gamma-table-wrap">
            <table class="gamma-table">
              <thead><tr><th>Energy (keV)</th><th>Intensity (%/decay)</th><th>Uncertainty</th><th class="gamma-bar-col"></th></tr></thead>
              <tbody>
                ${topLines.map(g => {
                  const e = g.e ?? g.energy_keV ?? 0;
                  const i = g.i ?? g.intensity_pct ?? 0;
                  const u = g.u ?? g.unc_pct ?? null;
                  const barW = (gamma.dominant_intensity_pct ?? 0) > 0
                    ? Math.max(2, (i / gamma.dominant_intensity_pct) * 100).toFixed(1) : 2;
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
          <div style="font-size:12px;color:var(--text-dim);padding:6px 0;">No significant gamma emission in ENSDF — may be a pure β/α emitter or data not yet evaluated.</div>
        </div>
      `;
    }

    /* ---- Isomer cross-reference ---- */
    if (isIsomer) {
      html += `
        <div class="detail-card">
          <h3>Relation to ground state</h3>
          <div class="value-row"><span class="v-label">Ground state nuclide</span><span class="v-value"><sup>${parentIso.A}</sup>${el.symbol}</span></div>
          <div class="value-row"><span class="v-label">Excitation energy above g.s.</span><span class="v-value">${iso.excitation_energy_keV.toFixed(3)}<span class="unit"> keV</span></span></div>
          <div class="value-row"><span class="v-label">Ground-state half-life</span><span class="v-value">${parentIso.is_stable ? 'Stable' : `${parentIso.half_life_value} ${unitLabel(parentIso.half_life_unit)}`}</span></div>
        </div>
      `;
    }
  }

  const detail = document.getElementById('detailPanel');
  detail.innerHTML = `<div class="detail-grid">${html}</div>`;
  detail.classList.add('is-open');
}

/* ============================================================
   DATA LOADING / INIT
   ============================================================ */
async function init() {
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
    initSidebar();
  } catch (err) {
    grid.innerHTML = `<div class="loading-state" style="grid-column:1/-1;color:var(--decay-sf);">
      Failed to load nuclide dataset (${err.message}). Ensure data.json is in the same folder.
    </div>`;
    document.getElementById('dataStatus').textContent = 'Error';
    // Still init sidebar with medical data counts
    initSidebar();
  }
}

init();
