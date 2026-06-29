#!/usr/bin/env node
/* Fetch the latest medical-isotope research articles from Europe PMC and write
   articles.json. Run by .github/workflows/update-articles.yml every 2 weeks.
   Europe PMC REST API is open (no key) and returns JSON. Node 18+ has fetch. */
import { writeFileSync } from 'node:fs';

const QUERY =
  '(theranostic* OR "radioligand therapy" OR radiopharmaceutical* OR ' +
  '"radionuclide therapy" OR "medical radioisotope*" OR "medical radionuclide*" OR ' +
  '"targeted alpha therapy" OR "peptide receptor radionuclide therapy")';

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
