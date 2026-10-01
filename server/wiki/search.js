import fs from 'fs';
import path from 'path';
import { loadWikiIndex } from './ingest.js';

const WIKI_DIR = path.resolve(process.cwd(), 'wiki');

export function searchWiki(query) {
  if (!query || !query.trim()) {
    const indexData = loadWikiIndex();
    return indexData.pages;
  }

  const q = query.toLowerCase();
  const indexData = loadWikiIndex();
  const results = [];

  for (const page of indexData.pages) {
    let score = 0;
    const titleMatch = page.title.toLowerCase().includes(q);
    const summaryMatch = page.summary.toLowerCase().includes(q);
    
    if (titleMatch) score += 10;
    if (summaryMatch) score += 5;

    // Read full markdown content for deeper match
    const mdPath = path.join(WIKI_DIR, `${page.id}.md`);
    if (fs.existsSync(mdPath)) {
      const content = fs.readFileSync(mdPath, 'utf8').toLowerCase();
      if (content.includes(q)) {
        score += 3;
      }
    }

    if (score > 0) {
      results.push({ ...page, score });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}
