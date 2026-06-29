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

const PAGE = 20;
const url =
  'https://www.ebi.ac.uk/europepmc/webservices/rest/search' +
  '?query=' + encodeURIComponent(QUERY + ' AND (SRC:MED) AND HAS_ABSTRACT:Y') +
  '&format=json&resultType=lite&pageSize=' + PAGE +
  '&sort=' + encodeURIComponent('P_PDATE_D desc');

const res = await fetch(url, { headers: { Accept: 'application/json' } });
if (!res.ok) {
  console.error('Europe PMC returned HTTP', res.status);
  process.exit(1);
}
const data = await res.json();
const result = (data.resultList && data.resultList.result) || [];

const articles = result.slice(0, PAGE).map(a => {
  let link;
  if (a.doi) link = 'https://doi.org/' + a.doi;
  else if (a.pmid) link = 'https://pubmed.ncbi.nlm.nih.gov/' + a.pmid + '/';
  else link = 'https://europepmc.org/article/' + (a.source || 'MED') + '/' + a.id;
  return {
    title: (a.title || '(untitled)').replace(/\s+/g, ' ').trim(),
    authors: a.authorString || '',
    journal: a.journalTitle || a.source || '',
    year: a.pubYear || '',
    date: a.firstPublicationDate || '',
    url: link,
  };
});

if (!articles.length) {
  console.error('No articles returned — leaving articles.json unchanged.');
  process.exit(1);
}

const out = {
  updated: new Date().toISOString().slice(0, 10),
  source: 'Europe PMC',
  query: QUERY,
  articles,
};
writeFileSync('articles.json', JSON.stringify(out, null, 2) + '\n');
console.log('Wrote', articles.length, 'articles; updated', out.updated);
