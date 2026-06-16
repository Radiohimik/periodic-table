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
// Format a number in scientific notation as HTML: m.mm × 10^xx
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

// Plain-text scientific notation for clipboard copying, e.g. "1.95e+17" -> "1.95e17"
// Uses the same rounding as sciHTML so the copied number matches what's displayed.
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

// Build a copy-button HTML snippet. `value` is the exact plain-text string
// that will be placed on the clipboard when clicked.
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

// Event delegation: handle clicks on any .copy-btn within the detail panel
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

// Fallback clipboard method for browsers/contexts without navigator.clipboard
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

// Format half-life nicely with original unit + seconds equivalent in sci notation
function formatHalfLife(iso) {
  if (iso.is_stable) return { primary: 'Stable', secondary: 'Does not decay', isResonance:false };
  if (!iso.half_life_value) return { primary: 'Unknown', secondary: '—', isResonance:false };
  const val = iso.half_life_value;
  const unit = iso.half_life_unit || '';
  const sec = iso.half_life_seconds;
  const unc = iso.half_life_unc ? ` ± ${iso.half_life_unc}` : '';
  const isResonance = ['MEV','KEV','EV'].includes(unit.toUpperCase());
  if (isResonance) {
    return {
      primary: `${val}${unc} ${unit}`,
      secondary: sec != null ? sciHTML(sec) : '—',
      isResonance: true
    };
  }
  const primary = `${val}${unc} ${unitLabel(unit)}`;
  const secondary = sec != null ? sciHTML(sec) : '—';
  return { primary, secondary, isResonance:false };
}
function unitLabel(u) {
  const map = {
    s:'s', ms:'ms', us:'µs', ns:'ns', ps:'ps', fs:'fs', as:'as', zs:'zs', ys:'ys',
    m:'min', h:'h', d:'days', y:'years', Y:'years', ky:'kyr', My:'Myr', Gy:'Gyr',
    Py:'Pyr', Ey:'Eyr', Ty:'Tyr'
  };
  return map[u] || u;
}

// Render a spin-parity string like "9/2+" or "(3/2-)" with the parity sign superscripted
function spinParityHTML(jp) {
  if (!jp) return '—';
  const m = jp.match(/^(\(?[\d/]+\)?)\s*([+\-])$/);
  if (!m) return jp;
  return `${m[1]}<sup>${m[2]}</sup>`;
}

/* ============================================================
   PERIODIC TABLE GRID RENDERING
   ============================================================ */
function buildPeriodicTable() {
  const grid = document.getElementById('ptGrid');
  grid.innerHTML = '';

  // Build a position map for special rows: lanthanides/actinides shown as
  // a reference cell in the main block, and as separate rows below.
  Object.values(ELEMENT_DATA).forEach(el => {
    const tile = document.createElement('div');
    tile.className = `element-tile cat-${el.category}`;
    tile.dataset.z = el.Z;
    tile.tabIndex = 0;
    tile.setAttribute('role', 'button');
    tile.setAttribute('aria-label', `${el.name} (${el.symbol}), atomic number ${el.Z}. Click to view isotopes.`);

    let col, row;
    if (el.category === 'lanthanide') {
      col = (el.Z - 57) + 4; // La=57 starts at col 4 of row 9
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

    // Dominant decay-mode strip across this element's isotopes
    const counts = { stable:0, alpha:0, betam:0, betap:0, it:0, sf:0, other:0 };
    el.isotopes.forEach(iso => counts[decayCategory(iso.decay_modes, iso.is_stable)]++);
    const total = el.isotopes.length || 1;
    const stripSegments = Object.entries(counts)
      .filter(([,c]) => c > 0)
      .map(([cat,c]) => `<span style="background:${DECAY_COLORS[cat]}; flex-grow:${c}"></span>`)
      .join('');

    tile.innerHTML = `
      <div class="tile-num">${el.Z}</div>
      <div class="tile-symbol">${el.symbol}</div>
      <div class="tile-name">${el.name}</div>
      <div class="tile-mass">${el.standard_weight ? el.standard_weight.toFixed(el.standard_weight % 1 === 0 ? 0 : 3) : `[${heaviestIsotope(el)}]`}</div>
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

  // highlight tile
  document.querySelectorAll('.element-tile').forEach(t => {
    t.classList.toggle('is-active', parseInt(t.dataset.z) === Z);
  });

  const el = ELEMENT_DATA[Z];
  const panel = document.getElementById('isoPanel');
  panel.classList.add('is-open');

  // header
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

  // isotope strip
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

    // If this isotope has a notable isomer, add a second chip for it
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

  // reset detail panel
  const detail = document.getElementById('detailPanel');
  detail.classList.remove('is-open');
  detail.innerHTML = `<div class="detail-empty">Select an isotope above to view half-life, decay modes, decay energies and specific activity.</div>`;

  // scroll panel into view smoothly
  panel.scrollIntoView({ behavior:'smooth', block:'nearest' });
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
  alpha_MeV: { label:'Q(α) — alpha decay energy', symbol:'Q_α' },
  beta_minus_MeV: { label:'Q(β⁻) — beta-minus decay energy', symbol:'Q_β⁻' },
  ec_beta_plus_MeV: { label:'Q(EC/β⁺) — electron capture / positron decay energy', symbol:'Q_EC' },
  it_MeV: { label:'E(IT) — isomeric transition (γ-ray) energy', symbol:'E_IT' }
};

function selectIsotope(iso, chipEl, isIsomer = false, parentIso = null) {
  activeIsotope = iso;

  // update chip selection state
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
    /* ---------- Unbound resonance state (beyond drip line) ---------- */
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
        // bar width: proportional, but with a visible minimum sliver for tiny branches
        let barWidth;
        if (pct == null) barWidth = 0;
        else if (pct <= 0) barWidth = 0;
        else if (pct < 1) barWidth = 1.2; // visible sliver for sub-1% branches
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
  } catch (err) {
    grid.innerHTML = `<div class="loading-state" style="grid-column:1/-1; color:var(--decay-sf);">
      Failed to load nuclide dataset (${err.message}). Ensure data.json is in the same folder as index.html.
    </div>`;
    document.getElementById('dataStatus').textContent = 'Error';
  }
}

init();
