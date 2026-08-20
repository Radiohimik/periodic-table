#!/usr/bin/env node
/* Fetch the latest medical-isotope research articles from Europe PMC and write
   articles.json. Run by .github/workflows/update-articles.yml every 2 weeks.
   Europe PMC REST API is open (no key) and returns JSON. Node 18+ has fetch. */
import { writeFileSync } from 'node:fs';

// Title-scoped terms keep the feed on-topic (articles actually *about* medical
// isotopes / radiopharmaceuticals). The bare radionuclide*/radioisotope*
// wildcards are dropped (they pull in environmental-radioactivity papers);
// "radionuclide therapy" is kept as a phrase, and a NOT clause filters the
// remaining environmental-monitoring noise (soil / food / radon / etc.).
const QUERY =
  '(TITLE:theranostic* OR TITLE:radiotheranostic* OR TITLE:radioligand OR ' +
  'TITLE:radiopharmaceutical* OR TITLE:radiotracer* OR TITLE:radiolabel* OR ' +
  'TITLE:"radionuclide therapy" OR TITLE:"targeted alpha therapy" OR ' +
  'TITLE:"peptide receptor radionuclide therapy" OR TITLE:PSMA OR ' +
  'TITLE:DOTATATE OR TITLE:DOTATOC OR TITLE:FAPI) ' +
  'NOT (TITLE:soil OR TITLE:food OR TITLE:radon OR TITLE:environmental OR ' +
  'TITLE:dietary OR TITLE:water OR TITLE:"risk assessment" OR TITLE:foodstuff*)';

/* ------------------------------------------------------------------
   Affiliation-country allow-list.
   This filters on WHERE THE RESEARCH WAS DONE (the corresponding/first
   author's institution), never on author names or ethnicity. A researcher
   with any name working at MIT, Cambridge or Karolinska passes; a lab in a
   non-listed country does not.
   ------------------------------------------------------------------ */
const ALLOWED_COUNTRIES = [
  // United States
  'USA', 'U\\.S\\.A', 'United States',
  // United Kingdom
  'United Kingdom', 'UK', 'England', 'Scotland', 'Wales', 'Northern Ireland',
  // EU-27
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
  'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece',
  'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta',
  'Netherlands', 'The Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia',
  'Slovenia', 'Spain', 'Sweden',
  // Asia-Pacific (as requested)
  'Singapore', 'Japan', 'Taiwan', 'South Korea', 'Republic of Korea', 'Korea',
];
// NOTE: "Republic of China" is deliberately NOT listed — it is a substring of
// "People's Republic of China". Taiwanese affiliations always name "Taiwan".
const COUNTRY_RE = new RegExp('\\b(' + ALLOWED_COUNTRIES.join('|') + ')\\b', 'i');
const DPRK_RE = /democratic\s+people|north\s+korea|d\.?p\.?r\.?k/i;

function affiliationsOf(a) {
  const out = [];
  const authors = (a.authorList && a.authorList.author) || [];
  for (const au of authors) {
    const det = (au.authorAffiliationDetailsList &&
                 au.authorAffiliationDetailsList.authorAffiliation) || [];
    for (const d of det) if (d && d.affiliation) out.push(d.affiliation);
    if (au.affiliation) out.push(au.affiliation);
  }
  if (a.affiliation) out.push(a.affiliation);
  return out;
}
// First author's affiliation is the standard "country of origin" for a paper;
// fall back to any listed affiliation when the first author has none.
function primaryAffiliation(a) {
  const authors = (a.authorList && a.authorList.author) || [];
  const first = authors[0];
  if (first) {
    const det = (first.authorAffiliationDetailsList &&
                 first.authorAffiliationDetailsList.authorAffiliation) || [];
    if (det.length && det[0].affiliation) return det[0].affiliation;
    if (first.affiliation) return first.affiliation;
  }
  if (a.affiliation) return a.affiliation;
  const all = affiliationsOf(a);
  return all.length ? all[0] : '';
}
function allowedCountry(aff) {
  if (!aff) return null;
  if (DPRK_RE.test(aff)) return null;
  const m = COUNTRY_RE.exec(aff);
  return m ? m[1] : null;
}

/* ---------- Isotope tagging (same logic as the front-end) ---------- */
const ELEMENTS = {
  H:1, He:2, Li:3, Be:4, B:5, C:6, N:7, O:8, F:9, Ne:10, Na:11, Mg:12, Al:13,
  Si:14, P:15, S:16, Cl:17, Ar:18, K:19, Ca:20, Sc:21, Ti:22, V:23, Cr:24,
  Mn:25, Fe:26, Co:27, Ni:28, Cu:29, Zn:30, Ga:31, Ge:32, As:33, Se:34, Br:35,
  Kr:36, Rb:37, Sr:38, Y:39, Zr:40, Nb:41, Mo:42, Tc:43, Ru:44, Rh:45, Pd:46,
  Ag:47, Cd:48, In:49, Sn:50, Sb:51, Te:52, I:53, Xe:54, Cs:55, Ba:56, La:57,
  Ce:58, Pr:59, Nd:60, Pm:61, Sm:62, Eu:63, Gd:64, Tb:65, Dy:66, Ho:67, Er:68,
  Tm:69, Yb:70, Lu:71, Hf:72, Ta:73, W:74, Re:75, Os:76, Ir:77, Pt:78, Au:79,
  Hg:80, Tl:81, Pb:82, Bi:83, Po:84, At:85, Rn:86, Fr:87, Ra:88, Ac:89, Th:90,
  Pa:91, U:92, Np:93, Pu:94, Am:95, Cm:96,
};
const SYMBOL_BY_LOWER = {};
for (const s of Object.keys(ELEMENTS)) SYMBOL_BY_LOWER[s.toLowerCase()] = s;
const ELEMENT_NAMES = {
  hydrogen:'H', carbon:'C', nitrogen:'N', oxygen:'O', fluorine:'F', sodium:'Na',
  phosphorus:'P', scandium:'Sc', cobalt:'Co', copper:'Cu', gallium:'Ga',
  selenium:'Se', krypton:'Kr', rubidium:'Rb', strontium:'Sr', yttrium:'Y',
  zirconium:'Zr', technetium:'Tc', molybdenum:'Mo', palladium:'Pd', indium:'In',
  tin:'Sn', iodine:'I', xenon:'Xe', cesium:'Cs', caesium:'Cs', samarium:'Sm',
  terbium:'Tb', dysprosium:'Dy', holmium:'Ho', erbium:'Er', ytterbium:'Yb',
  lutetium:'Lu', rhenium:'Re', iridium:'Ir', gold:'Au', thallium:'Tl', lead:'Pb',
  bismuth:'Bi', astatine:'At', radium:'Ra', actinium:'Ac', thorium:'Th',
  uranium:'U', gadolinium:'Gd', germanium:'Ge', tungsten:'W', zinc:'Zn',
  titanium:'Ti', calcium:'Ca', tellurium:'Te', lanthanum:'La',
};
function plausibleA(sym, A) {
  const Z = ELEMENTS[sym];
  if (!Z || A < Z) return false;
  const lo = Z <= 20 ? Z : Math.floor(1.7 * Z);
  const hi = Z <= 20 ? 3 * Z + 4 : Math.ceil(3.0 * Z);
  return A >= lo && A <= hi;
}
function stripMarkup(s) {
  return String(s)
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
}
function extractIsotopes(rawTitle) {
  const t = stripMarkup(rawTitle);
  const found = new Map();
  const add = (sym, A, m) => {
    if (!plausibleA(sym, A)) return;
    const key = `${sym}-${A}${m ? 'm' : ''}`;
    if (!found.has(key)) found.set(key, true);
  };
  for (const mt of t.matchAll(/(?<![A-Za-z0-9-])(\d{1,3})\s*(m?)\s*-?\s*([A-Za-z]{1,2})(?![a-z])/g)) {
    const sym = SYMBOL_BY_LOWER[mt[3].toLowerCase()];
    if (sym) add(sym, parseInt(mt[1], 10), mt[2]);
  }
  for (const mt of t.matchAll(/(?<![A-Za-z0-9])([A-Za-z]{1,2})\s*-\s*(\d{1,3})(m?)(?![0-9])/g)) {
    const sym = SYMBOL_BY_LOWER[mt[1].toLowerCase()];
    if (sym) add(sym, parseInt(mt[2], 10), mt[3]);
  }
  for (const mt of t.matchAll(/\b([A-Za-z]{3,12})\s*-\s*(\d{1,3})(m?)\b/g)) {
    const sym = ELEMENT_NAMES[mt[1].toLowerCase()];
    if (sym) add(sym, parseInt(mt[2], 10), mt[3]);
  }
  return [...found.keys()];
}

/* ---------------------------- fetch ---------------------------- */
const WANT = 20;
const FETCH_SIZE = 200;   // over-fetch: most get filtered out by country
const url =
  'https://www.ebi.ac.uk/europepmc/webservices/rest/search' +
  '?query=' + encodeURIComponent(QUERY + ' AND (SRC:MED) AND HAS_ABSTRACT:Y') +
  '&format=json&resultType=core&pageSize=' + FETCH_SIZE +
  '&sort=' + encodeURIComponent('P_PDATE_D desc');

const res = await fetch(url, { headers: { Accept: 'application/json' } });
if (!res.ok) {
  console.error('Europe PMC returned HTTP', res.status);
  process.exit(1);
}
const data = await res.json();
const result = (data.resultList && data.resultList.result) || [];

let noAff = 0, notAllowed = 0;
const articles = [];
for (const a of result) {
  if (articles.length >= WANT) break;
  const aff = primaryAffiliation(a);
  if (!aff) { noAff++; continue; }
  const country = allowedCountry(aff);
  if (!country) { notAllowed++; continue; }

  let link;
  if (a.doi) link = 'https://doi.org/' + a.doi;
  else if (a.pmid) link = 'https://pubmed.ncbi.nlm.nih.gov/' + a.pmid + '/';
  else link = 'https://europepmc.org/article/' + (a.source || 'MED') + '/' + a.id;

  const title = (a.title || '(untitled)').replace(/\s+/g, ' ').trim();
  articles.push({
    title,
    authors: a.authorString || '',
    journal: a.journalTitle || a.source || '',
    year: a.pubYear || '',
    date: a.firstPublicationDate || '',
    country,
    isotopes: extractIsotopes(title),
    url: link,
  });
}

if (!articles.length) {
  console.error('No articles passed the affiliation filter — leaving articles.json unchanged.');
  process.exit(1);
}

const out = {
  updated: new Date().toISOString().slice(0, 10),
  source: 'Europe PMC',
  query: QUERY,
  affiliationFilter: ALLOWED_COUNTRIES,
  articles,
};
writeFileSync('articles.json', JSON.stringify(out, null, 2) + '\n');
console.log(
  `Scanned ${result.length} · kept ${articles.length} · ` +
  `skipped ${notAllowed} (affiliation outside allow-list), ${noAff} (no affiliation data)`
);
