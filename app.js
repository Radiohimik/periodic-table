/* ============================================================
   NUCLIDE EXPLORER — app.js
   Medical isotope highlights integrated.
   ============================================================ */

/* ============================================================
   MEDICAL ISOTOPE DATABASE
   ============================================================ */
const MEDICAL_ISOTOPES = {
  "43-99m": ["established","diagnostic","cardio","bone","general"],
  "53-123": ["established","diagnostic","thyroid","neuro"],
  "53-131": ["established","theranostic","thyroid"],
  "53-124": ["development","diagnostic","theranostic","thyroid"],
  "53-125": ["established","therapy","prostate","brain"],
  "71-177": ["established","theranostic","neuro","prostate"],
  "31-67":  ["established","diagnostic","lymphoma","general"],
  "31-68":  ["established","diagnostic","neuro","prostate","lung"],
  "9-18":   ["established","diagnostic","general"],
  "39-90":  ["established","therapy","liver","lymphoma","neuro"],
  "49-111": ["established","diagnostic","neuro","general"],
  "38-89":  ["established","therapy","bone"],
  "38-90":  ["established","therapy","bone"],
  "62-153": ["established","therapy","bone"],
  "75-186": ["established","theranostic","bone","liver"],
  "75-188": ["development","theranostic","liver","bone"],
  "88-223": ["established","therapy","bone","prostate"],
  "89-225": ["development","therapy","prostate","neuro"],
  "83-213": ["development","therapy","general","lymphoma"],
  "85-211": ["development","therapy","thyroid","brain","general"],
  "29-64":  ["development","theranostic","breast","colorectal","general"],
  "29-67":  ["development","therapy","lymphoma","general"],
  "40-89":  ["development","diagnostic","general"],
  "21-44":  ["development","diagnostic","theranostic","general"],
  "21-47":  ["development","therapy","general"],
  "65-149": ["development","therapy","general"],
  "65-152": ["development","diagnostic","general"],
  "65-155": ["development","diagnostic","general"],
  "65-161": ["development","therapy","general"],
  "82-212": ["development","therapy","general","ovarian"],
  "90-227": ["development","therapy","bone","general"],
  "44-106": ["established","therapy","melanoma"],
  "46-103": ["established","therapy","prostate"],
  "77-192": ["established","therapy","general"],
  "55-137": ["established","therapy","general"],
  "68-169": ["established","therapy","synovitis"],
  "66-165": ["established","therapy","synovitis"],
  "67-166": ["development","therapy","liver","synovitis"],
  "70-177": ["development","therapy","general"],
  "50-117m":["development","therapy","bone","general"],
  "7-13":   ["established","diagnostic","cardio"],
  "8-15":   ["established","diagnostic","cardio","neuro"],
  "6-11":   ["established","diagnostic","neuro","general"],
  "37-82":  ["established","diagnostic","cardio"],
  "81-201": ["established","diagnostic","cardio"],
  "15-32":  ["established","therapy","bone","lymphoma"],
  "79-198": ["established","therapy","prostate","general"],
};

const MEDICAL_TAG_META = {
  established: { label:"Established",         color:"#22c55e", group:"status"  },
  development: { label:"In Development",      color:"#f59e0b", group:"status"  },
  diagnostic:  { label:"Diagnostic",          color:"#38bdf8", group:"app"     },
  theranostic: { label:"Theranostic",         color:"#a78bfa", group:"app"     },
  therapy:     { label:"Therapy",             color:"#fb923c", group:"app"     },
  neuro:       { label:"Neuroendocrine/Brain",color:"#c084fc", group:"cancer"  },
  prostate:    { label:"Prostate",            color:"#60a5fa", group:"cancer"  },
  thyroid:     { label:"Thyroid",             color:"#34d399", group:"cancer"  },
  liver:       { label:"Liver / HCC",         color:"#fbbf24", group:"cancer"  },
  bone:        { label:"Bone Mets",           color:"#f87171", group:"cancer"  },
  lymphoma:    { label:"Lymphoma",            color:"#818cf8", group:"cancer"  },
  breast:      { label:"Breast",              color:"#f9a8d4", group:"cancer"  },
  ovarian:     { label:"Ovarian",             color:"#a5f3fc", group:"cancer"  },
  colorectal:  { label:"Colorectal",          color:"#86efac", group:"cancer"  },
  lung:        { label:"Lung",                color:"#d1d5db", group:"cancer"  },
  kidney:      { label:"Kidney / Renal",      color:"#6ee7b7", group:"cancer"  },
  melanoma:    { label:"Melanoma",            color:"#7c3aed", group:"cancer"  },
  brain:       { label:"Brain",               color:"#e879f9", group:"cancer"  },
  pan:         { label:"Pancreatic",          color:"#fde68a", group:"cancer"  },
  general:     { label:"General Oncology",    color:"#9ca3af", group:"cancer"  },
  synovitis:   { label:"Synovitis",           color:"#2dd4bf", group:"cancer"  },
  cardio:      { label:"Cardiac",             color:"#fb7185", group:"cancer"  },
};

let activeMedFilters = new Set();
let medHighlightMode = false;

function getMedTags(Z, A, isIsomer) {
  const key = isIsomer ? `${Z}-${A}m` : `${Z}-${A}`;
  return MEDICAL_ISOTOPES[key] || [];
}

function isMedMatch(tags) {
  if (!medHighlightMode || tags.length === 0) return false;
  if (activeMedFilters.size === 0) return true;
  for (const f of activeMedFilters) { if (tags.includes(f)) return true; }
  return false;
}

function buildMedPanel() {
  const panel = document.createElement('div');
  panel.id = 'medPanel';
  panel.className = 'med-panel';
  const groups = [
    { label:'Status',            key:'status' },
    { label:'Application Type',  key:'app'    },
    { label:'Cancer / Indication', key:'cancer'},
  ];
  const renderGroup = (key) => Object.entries(MEDICAL_TAG_META)
    .filter(([,m]) => m.group === key)
    .map(([tag,m]) =>
      `<button class="med-filter-btn" data-tag="${tag}" style="--med-col:${m.color}" title="${m.label}">
         <span class="med-filter-dot"></span>${m.label}</button>`
    ).join('');

  panel.innerHTML = `
    <div class="med-hdr">
      <span class="med-hdr-icon">⚕</span>
      <span class="med-hdr-title">Medical Isotopes</span>
      <label class="med-toggle" title="Toggle highlights">
        <input type="checkbox" id="medMaster">
        <span class="med-knob"></span>
      </label>
    </div>
    <div class="med-body" id="medBody">
      <p class="med-hint">Toggle ON, then use filters to narrow.<br>No filter = show all medical.</p>
      ${groups.map(g=>`
        <div class="med-sec">
          <div class="med-sec-label">${g.label}</div>
          ${renderGroup(g.key)}
        </div>`).join('')}
      <button class="med-clear" id="medClear">Clear all filters</button>
      <div class="med-count" id="medCount"></div>
    </div>`;
  document.body.appendChild(panel);

  document.getElementById('medMaster').addEventListener('change', e => {
    medHighlightMode = e.target.checked;
    document.getElementById('medBody').classList.toggle('is-on', medHighlightMode);
    applyMedHighlights();
  });
  panel.querySelectorAll('.med-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.tag;
      if (activeMedFilters.has(t)) { activeMedFilters.delete(t); btn.classList.remove('is-on'); }
      else                         { activeMedFilters.add(t);    btn.classList.add('is-on');    }
      applyMedHighlights();
    });
  });
  document.getElementById('medClear').addEventListener('click', () => {
    activeMedFilters.clear();
    panel.querySelectorAll('.med-filter-btn').forEach(b=>b.classList.remove('is-on'));
    applyMedHighlights();
  });
}

function applyMedHighlights() {
  // --- Element tiles ---
  document.querySelectorAll('.element-tile').forEach(tile => {
    const Z = parseInt(tile.dataset.z);
    tile.classList.remove('med-glow','med-established','med-development',
                          'med-diagnostic','med-theranostic','med-therapy');
    if (!medHighlightMode) return;
    const el = ELEMENT_DATA[Z]; if (!el) return;
    let allTags = [];
    for (const iso of el.isotopes) {
      const t = getMedTags(Z, iso.A, false);
      if (isMedMatch(t)) allTags.push(...t);
      if (iso.isomers) {
        const ti = getMedTags(Z, iso.A, true);
        if (isMedMatch(ti)) allTags.push(...ti);
      }
    }
    if (allTags.length) {
      tile.classList.add('med-glow');
      if      (allTags.includes('theranostic')) tile.classList.add('med-theranostic');
      else if (allTags.includes('therapy'))     tile.classList.add('med-therapy');
      else if (allTags.includes('diagnostic'))  tile.classList.add('med-diagnostic');
      tile.classList.add(allTags.includes('established') ? 'med-established' : 'med-development');
    }
  });
  // --- Isotope chips ---
  document.querySelectorAll('.iso-chip').forEach(chip => {
    const Z = parseInt(chip.dataset.z);
    const A = parseInt(chip.dataset.a);
    const isIso = chip.dataset.isomer === '1';
    chip.classList.remove('med-chip','med-chip-established','med-chip-development',
                          'med-chip-diag','med-chip-ther','med-chip-thera');
    chip.querySelectorAll('.med-badge').forEach(b=>b.remove());
    if (!medHighlightMode) return;
    const tags = getMedTags(Z, A, isIso);
    if (!isMedMatch(tags)) return;
    chip.classList.add('med-chip');
    if      (tags.includes('theranostic')) chip.classList.add('med-chip-thera');
    else if (tags.includes('therapy'))     chip.classList.add('med-chip-ther');
    else if (tags.includes('diagnostic'))  chip.classList.add('med-chip-diag');
    chip.classList.add(tags.includes('established') ? 'med-chip-established' : 'med-chip-development');
    const b = document.createElement('span'); b.className='med-badge';
    b.textContent = tags.includes('theranostic')?'☯':tags.includes('therapy')?'⚡':'◎';
    chip.appendChild(b);
  });
  // --- Count ---
  const countEl = document.getElementById('medCount');
  if (countEl) {
    const n = Object.entries(MEDICAL_ISOTOPES).filter(([k,tags])=>isMedMatch(tags)).length;
    countEl.textContent = medHighlightMode ? `${n} isotope${n!==1?'s':''} matching` : '';
  }
}

/* ============================================================
   MAIN APP — Data loading, grid, isotope panel, detail panel
   ============================================================ */
let ELEMENT_DATA = {};
let activeZ = null;
let activeIsotope = null;

/* ---- LAYOUT POSITIONS ---- */
const PT_LAYOUT = {
  1:{col:1,row:1}, 2:{col:18,row:1},
  3:{col:1,row:2}, 4:{col:2,row:2},
  5:{col:13,row:2},6:{col:14,row:2},7:{col:15,row:2},8:{col:16,row:2},9:{col:17,row:2},10:{col:18,row:2},
  11:{col:1,row:3},12:{col:2,row:3},
  13:{col:13,row:3},14:{col:14,row:3},15:{col:15,row:3},16:{col:16,row:3},17:{col:17,row:3},18:{col:18,row:3},
  19:{col:1,row:4},20:{col:2,row:4},
  21:{col:3,row:4},22:{col:4,row:4},23:{col:5,row:4},24:{col:6,row:4},25:{col:7,row:4},
  26:{col:8,row:4},27:{col:9,row:4},28:{col:10,row:4},29:{col:11,row:4},30:{col:12,row:4},
  31:{col:13,row:4},32:{col:14,row:4},33:{col:15,row:4},34:{col:16,row:4},35:{col:17,row:4},36:{col:18,row:4},
  37:{col:1,row:5},38:{col:2,row:5},
  39:{col:3,row:5},40:{col:4,row:5},41:{col:5,row:5},42:{col:6,row:5},43:{col:7,row:5},
  44:{col:8,row:5},45:{col:9,row:5},46:{col:10,row:5},47:{col:11,row:5},48:{col:12,row:5},
  49:{col:13,row:5},50:{col:14,row:5},51:{col:15,row:5},52:{col:16,row:5},53:{col:17,row:5},54:{col:18,row:5},
  55:{col:1,row:6},56:{col:2,row:6},
  72:{col:4,row:6},73:{col:5,row:6},74:{col:6,row:6},75:{col:7,row:6},
  76:{col:8,row:6},77:{col:9,row:6},78:{col:10,row:6},79:{col:11,row:6},80:{col:12,row:6},
  81:{col:13,row:6},82:{col:14,row:6},83:{col:15,row:6},84:{col:16,row:6},85:{col:17,row:6},86:{col:18,row:6},
  87:{col:1,row:7},88:{col:2,row:7},
  104:{col:4,row:7},105:{col:5,row:7},106:{col:6,row:7},107:{col:7,row:7},
  108:{col:8,row:7},109:{col:9,row:7},110:{col:10,row:7},111:{col:11,row:7},112:{col:12,row:7},
  113:{col:13,row:7},114:{col:14,row:7},115:{col:15,row:7},116:{col:16,row:7},117:{col:17,row:7},118:{col:18,row:7},
  57:{col:3,row:9},58:{col:4,row:9},59:{col:5,row:9},60:{col:6,row:9},61:{col:7,row:9},
  62:{col:8,row:9},63:{col:9,row:9},64:{col:10,row:9},65:{col:11,row:9},66:{col:12,row:9},
  67:{col:13,row:9},68:{col:14,row:9},69:{col:15,row:9},70:{col:16,row:9},71:{col:17,row:9},
  89:{col:3,row:10},90:{col:4,row:10},91:{col:5,row:10},92:{col:6,row:10},93:{col:7,row:10},
  94:{col:8,row:10},95:{col:9,row:10},96:{col:10,row:10},97:{col:11,row:10},98:{col:12,row:10},
  99:{col:13,row:10},100:{col:14,row:10},101:{col:15,row:10},102:{col:16,row:10},103:{col:17,row:10},
};

/* ---- CATEGORY CSS CLASSES ---- */
const CAT_CLASS = {
  'alkali metal':'cat-alkali','alkaline earth metal':'cat-alkaline',
  'transition metal':'cat-transition','post-transition metal':'cat-post',
  'metalloid':'cat-metalloid','nonmetal':'cat-nonmetal',
  'halogen':'cat-halogen','noble gas':'cat-noble',
  'lanthanide':'cat-lanthanide','actinide':'cat-actinide','unknown':'cat-unknown',
};

/* ---- DECAY COLOUR ---- */
function decayClass(iso) {
  if (iso.is_stable) return 'dec-stable';
  const m = (iso.decay_1||'').toLowerCase();
  if (m.includes('a'))  return 'dec-alpha';
  if (m.includes('b-')) return 'dec-betam';
  if (m.includes('b+') || m.includes('ec')) return 'dec-betap';
  if (m.includes('it')) return 'dec-it';
  if (m.includes('sf')) return 'dec-sf';
  return 'dec-other';
}

/* ---- HALF-LIFE TEXT ---- */
function hlText(iso) {
  if (iso.is_stable) return 'Stable';
  if (!iso.half_life) return '?';
  const v = iso.half_life, u = (iso.unit_hl||'').toLowerCase();
  if      (u==='s')   return `${+v.toPrecision(3)} s`;
  else if (u==='ms')  return `${+v.toPrecision(3)} ms`;
  else if (u==='us')  return `${+v.toPrecision(3)} μs`;
  else if (u==='ns')  return `${+v.toPrecision(3)} ns`;
  else if (u==='ps')  return `${+v.toPrecision(3)} ps`;
  else if (u==='m')   return `${+v.toPrecision(3)} min`;
  else if (u==='h')   return `${+v.toPrecision(3)} h`;
  else if (u==='d')   return `${+v.toPrecision(3)} d`;
  else if (u==='y')   {
    if (v>=1e9)  return `${+(v/1e9).toPrecision(3)} Gy`;
    if (v>=1e6)  return `${+(v/1e6).toPrecision(3)} My`;
    if (v>=1e3)  return `${+(v/1e3).toPrecision(3)} ky`;
    return `${+v.toPrecision(3)} y`;
  }
  return `${+v.toPrecision(3)} ${u}`;
}

/* ---- SPECIFIC ACTIVITY ---- */
function specificActivity(iso) {
  if (iso.is_stable || !iso.half_life_sec || iso.half_life_sec <= 0) return null;
  const NA = 6.02214076e23, ln2 = Math.LN2;
  const M = iso.atomic_mass || iso.A;
  const Bqg = (ln2 * NA) / (iso.half_life_sec * M);
  return Bqg;
}

function fmtSci(val, unit='') {
  if (val === null || val === undefined || !isFinite(val)) return '—';
  const exp = Math.floor(Math.log10(Math.abs(val)));
  const mant = val / Math.pow(10, exp);
  return `${mant.toFixed(2)}×10<sup>${exp}</sup>${unit ? ' '+unit : ''}`;
}

/* ---- DECAY STRIP ON TILE ---- */
function buildDecayStrip(el) {
  const isos = el.isotopes;
  const total = isos.length;
  if (total === 0) return '';
  const groups = {};
  for (const iso of isos) {
    const c = decayClass(iso);
    groups[c] = (groups[c]||0) + 1;
  }
  return Object.entries(groups).map(([cls, count]) => {
    const pct = (count/total*100).toFixed(1);
    return `<span class="ds-seg ${cls}" style="width:${pct}%" title="${cls.replace('dec-','')}:${count}"></span>`;
  }).join('');
}

/* ============================================================
   BUILD PERIODIC TABLE GRID
   ============================================================ */
function buildGrid(data) {
  const grid = document.getElementById('ptGrid');
  grid.innerHTML = '';
  Object.values(data).forEach(el => {
    const pos = PT_LAYOUT[el.Z];
    if (!pos) return;
    const catCls = CAT_CLASS[el.category] || 'cat-unknown';
    const stripHTML = buildDecayStrip(el);
    const mass = el.standard_weight
      ? el.standard_weight.toFixed(el.standard_weight % 1 === 0 ? 0 : 3)
      : (() => { const mx = el.isotopes.reduce((a,b)=>a.A>b.A?a:b,{A:0}); return `[${mx.A||'?'}]`; })();

    const tile = document.createElement('div');
    tile.className = `element-tile ${catCls}`;
    tile.dataset.z = el.Z;
    tile.style.gridColumn = pos.col;
    tile.style.gridRow = pos.row;
    tile.tabIndex = 0;
    tile.innerHTML = `
      <div class="tile-num">${el.Z}</div>
      <div class="tile-symbol">${el.symbol}</div>
      <div class="tile-bottom">
        <div class="tile-name">${el.name}</div>
        <div class="tile-mass">${mass}</div>
      </div>
      <div class="tile-strip">${stripHTML}</div>`;
    tile.addEventListener('click', () => selectElement(el.Z));
    tile.addEventListener('keydown', e => {
      if (e.key==='Enter'||e.key===' ') { e.preventDefault(); selectElement(el.Z); }
    });
    grid.appendChild(tile);
  });
  // La/Ac placeholders
  const laRef = document.createElement('div');
  laRef.className = 'la-ac-ref'; laRef.style.gridColumn=3; laRef.style.gridRow=6; laRef.textContent='57–71';
  grid.appendChild(laRef);
  const acRef = document.createElement('div');
  acRef.className = 'la-ac-ref'; acRef.style.gridColumn=3; acRef.style.gridRow=7; acRef.textContent='89–103';
  grid.appendChild(acRef);
  const spacer = document.createElement('div');
  spacer.style.gridRow=8; spacer.style.gridColumn='1/-1'; spacer.style.height='6px';
  grid.appendChild(spacer);
}

/* ============================================================
   SELECT ELEMENT → ISOTOPE STRIP
   ============================================================ */
function selectElement(Z) {
  activeZ = Z; activeIsotope = null;
  document.querySelectorAll('.element-tile').forEach(t =>
    t.classList.toggle('is-active', parseInt(t.dataset.z)===Z));

  const el = ELEMENT_DATA[Z];
  const panel = document.getElementById('isoPanel');
  panel.classList.add('is-open');

  const catCls = CAT_CLASS[el.category] || 'cat-unknown';
  const badge  = document.getElementById('isoBadge');
  badge.textContent = el.symbol;
  badge.className = `iso-element-badge ${catCls}`;
  document.getElementById('isoElementName').textContent = `${el.name} — ${el.symbol}`;

  const stable = el.isotopes.filter(i=>i.is_stable).length;
  const isomerCount = el.isotopes.filter(i=>i.isomers&&i.isomers.length).length;
  document.getElementById('isoElementSub').innerHTML =
    `<span>Z = <b>${el.Z}</b></span>
     <span>Weight: <b>${el.standard_weight||'no stable isotope'}</b></span>
     <span>Isotopes: <b>${el.isotopes.length}</b></span>
     <span>Stable: <b>${stable}</b></span>
     ${isomerCount ? `<span>Isomers: <b>${isomerCount}</b></span>` : ''}`;

  // Build chip strip
  const strip = document.getElementById('isoStrip');
  strip.innerHTML = '';
  const sorted = [...el.isotopes].sort((a,b)=>a.A-b.A);
  for (const iso of sorted) {
    const chip = makeChip(el.Z, iso, false);
    strip.appendChild(chip);
    if (iso.isomers) {
      for (const ism of iso.isomers) {
        strip.appendChild(makeChip(el.Z, ism, true));
      }
    }
  }

  // Reset detail
  const detail = document.getElementById('detailPanel');
  detail.classList.remove('is-open');
  detail.innerHTML = `<div class="detail-empty">Select an isotope above to view half-life, decay modes, decay energies and specific activity.</div>`;

  setTimeout(()=>{
    const top = panel.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top-20, behavior:'smooth' });
  }, 50);

  applyMedHighlights();
}

function makeChip(Z, iso, isIsomer) {
  const chip = document.createElement('button');
  chip.className = `iso-chip ${decayClass(iso)}`;
  chip.dataset.z = Z;
  chip.dataset.a = iso.A;
  chip.dataset.isomer = isIsomer ? '1' : '0';
  const label = isIsomer ? `${iso.A}m` : `${iso.A}`;
  chip.innerHTML = `<span class="chip-a">${label}</span><span class="chip-hl">${hlText(iso)}</span>`;
  chip.addEventListener('click', () => selectIsotope(Z, iso, isIsomer));
  return chip;
}

/* ============================================================
   SELECT ISOTOPE → DETAIL PANEL
   ============================================================ */
function selectIsotope(Z, iso, isIsomer) {
  activeIsotope = iso;
  document.querySelectorAll('.iso-chip').forEach(c =>
    c.classList.toggle('is-active',
      parseInt(c.dataset.a)===iso.A && c.dataset.isomer===(isIsomer?'1':'0')));

  const el = ELEMENT_DATA[Z];
  const detail = document.getElementById('detailPanel');
  detail.classList.add('is-open');

  const sa  = specificActivity(iso);
  const saHTML = sa ? fmtSci(sa,'Bq/g') : '—';
  const saCi  = sa ? fmtSci(sa/3.7e10,'Ci/g') : '—';

  const medTags = getMedTags(Z, iso.A, isIsomer);
  const medHTML = medTags.length ? buildMedTagsHTML(medTags) : '';

  // Decay modes block
  let decayRows = '';
  for (let i=1; i<=5; i++) {
    const mode = iso[`decay_${i}`];
    const pct  = iso[`decay_${i}_%`];
    if (mode) decayRows += `<tr><td>${mode}</td><td>${pct!=null?pct.toFixed(2)+'%':'—'}</td></tr>`;
  }

  // Q-values
  let qRows = '';
  const qMap = {qa:'α Q-value',qbm:'β⁻ Q-value',qbp:'β⁺ Q-value',qec:'EC Q-value'};
  for (const [k,label] of Object.entries(qMap)) {
    if (iso[k]!=null) qRows += `<tr><td>${label}</td><td>${iso[k].toFixed(1)} keV</td></tr>`;
  }

  // Gamma lines
  let gammaHTML = '';
  if (iso.gammas && iso.gammas.length) {
    const sorted = [...iso.gammas].sort((a,b)=>b.intensity-a.intensity);
    const top = sorted.slice(0,8);
    const dom = top[0];
    gammaHTML = `
      <div class="data-card gamma-card">
        <div class="card-title">Gamma Radiation</div>
        <div class="gamma-stats">
          <div class="gamma-stat"><div class="gs-label">Dominant line</div>
            <div class="gs-value">${dom.energy.toFixed(2)}<span class="gs-unit">keV</span></div>
            <div class="gs-sub">${dom.intensity.toFixed(1)}% intensity</div></div>
          <div class="gamma-stat"><div class="gs-label">Lines in dataset</div>
            <div class="gs-value">${iso.gammas.length}</div></div>
        </div>
        <div class="gamma-table-wrap"><table class="gamma-table">
          <thead><tr><th>Energy (keV)</th><th>Intensity (%)</th><th>Bar</th></tr></thead>
          <tbody>${top.map(g=>`<tr>
            <td class="gamma-e">${g.energy.toFixed(3)}</td>
            <td class="gamma-i">${g.intensity.toFixed(2)}</td>
            <td class="gamma-bar-cell"><div class="gamma-bar" style="width:${Math.max(2,(g.intensity/dom.intensity*100)).toFixed(1)}%"></div></td>
          </tr>`).join('')}</tbody>
        </table></div>
        ${iso.gammas.length>8?`<div class="gamma-more">+${iso.gammas.length-8} more lines not shown</div>`:''}
      </div>`;
  }

  const label = isIsomer ? `${el.symbol}-${iso.A}m` : `${el.symbol}-${iso.A}`;
  detail.innerHTML = `
    <div class="detail-header">
      <span class="detail-nuclide">${label}</span>
      <span class="detail-name">${el.name}${isIsomer?' (isomer)':''}</span>
    </div>
    ${medHTML}
    <div class="detail-grid">
      <div class="data-card">
        <div class="card-title">Identity</div>
        <div class="value-row"><span class="v-label">Nuclide</span><span class="v-value">${label}</span></div>
        <div class="value-row"><span class="v-label">Element</span><span class="v-value">${el.name} (${el.symbol})</span></div>
        <div class="value-row"><span class="v-label">Z</span><span class="v-value">${Z}</span></div>
        <div class="value-row"><span class="v-label">A</span><span class="v-value">${iso.A}</span></div>
        <div class="value-row"><span class="v-label">N</span><span class="v-value">${iso.A-Z}</span></div>
        ${iso.atomic_mass ? `<div class="value-row"><span class="v-label">Atomic mass</span><span class="v-value">${iso.atomic_mass.toFixed(6)} u</span></div>`:''}
        ${iso.abundance!=null ? `<div class="value-row"><span class="v-label">Natural abundance</span><span class="v-value">${iso.abundance.toFixed(4)} %</span></div>`:''}
      </div>
      <div class="data-card">
        <div class="card-title">Radioactive Properties</div>
        <div class="value-row"><span class="v-label">Status</span>
          <span class="v-value ${iso.is_stable?'val-stable':'val-radio'}">${iso.is_stable?'Stable':'Radioactive'}</span></div>
        ${!iso.is_stable ? `
        <div class="value-row copyable"><span class="v-label">Half-life</span>
          <span class="v-value">${hlText(iso)}${makeCopyBtn(plainHl(iso))}</span></div>
        <div class="value-row copyable"><span class="v-label">Specific activity</span>
          <span class="v-value">${saHTML} ${sa?`(${saCi})`:''}${sa?makeCopyBtn((sa).toExponential(4)+' Bq/g'):''}</span></div>
        `:''}
      </div>
      ${decayRows ? `
      <div class="data-card">
        <div class="card-title">Decay Modes</div>
        <table class="mini-table"><thead><tr><th>Mode</th><th>Branch</th></tr></thead>
        <tbody>${decayRows}</tbody></table>
      </div>`:''}
      ${qRows ? `
      <div class="data-card">
        <div class="card-title">Decay Energies (Q-values)</div>
        <table class="mini-table"><thead><tr><th>Type</th><th>Energy</th></tr></thead>
        <tbody>${qRows}</tbody></table>
      </div>`:''}
      ${gammaHTML}
    </div>
    <div class="src-note">Specific activity: A = ln(2)·N<sub>A</sub>/(T<sub>½</sub>·M). Data from IAEA Live Chart of Nuclides (ENSDF). For research reference only.</div>`;

  detail.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.val).then(()=>{
        btn.classList.add('is-copied');
        setTimeout(()=>btn.classList.remove('is-copied'), 1500);
      });
    });
  });

  setTimeout(()=>{
    detail.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }, 60);
}

function makeCopyBtn(val) {
  return `<button class="copy-btn" data-val="${val}" title="Copy value">
    <svg class="copy-icon-copy" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="5" y="5" width="9" height="9" rx="1"/><path d="M3 11V3a1 1 0 0 1 1-1h8"/>
    </svg>
    <svg class="copy-icon-check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M3 8l3 3 7-7"/>
    </svg>
  </button>`;
}

function plainHl(iso) {
  if (iso.is_stable) return 'Stable';
  if (!iso.half_life) return '?';
  return `${iso.half_life} ${iso.unit_hl||''}`.trim();
}

function buildMedTagsHTML(tags) {
  const statusTag = tags.find(t=>t==='established')||tags.find(t=>t==='development');
  const appTag    = tags.find(t=>['diagnostic','theranostic','therapy'].includes(t));
  const cancers   = tags.filter(t=>MEDICAL_TAG_META[t]&&MEDICAL_TAG_META[t].group==='cancer');
  return `<div class="med-tags-row">
    <span class="med-tag-label">⚕ Medical:</span>
    ${statusTag ? `<span class="med-tag" style="--tc:${MEDICAL_TAG_META[statusTag].color}">${MEDICAL_TAG_META[statusTag].label}</span>`:''}
    ${appTag    ? `<span class="med-tag" style="--tc:${MEDICAL_TAG_META[appTag].color}">${MEDICAL_TAG_META[appTag].label}</span>`:''}
    ${cancers.map(t=>`<span class="med-tag" style="--tc:${MEDICAL_TAG_META[t].color}">${MEDICAL_TAG_META[t].label}</span>`).join('')}
  </div>`;
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const r = await fetch('data.json');
    const arr = await r.json();
    arr.forEach(el => { ELEMENT_DATA[el.Z] = el; });
    buildGrid(ELEMENT_DATA);
    buildMedPanel();
  } catch(e) {
    document.getElementById('ptGrid').innerHTML =
      `<div style="color:#f87171;padding:2rem">Failed to load data.json — ${e.message}</div>`;
  }
});
