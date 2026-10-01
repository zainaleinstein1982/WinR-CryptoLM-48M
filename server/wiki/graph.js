import { loadWikiIndex } from './ingest.js';

export function getWikiGraph() {
  const indexData = loadWikiIndex();
  const nodes = indexData.pages.map(p => ({
    id: p.id,
    title: p.title,
    group: 1
  }));

  const links = [];
  for (const page of indexData.pages) {
    if (page.links && Array.isArray(page.links)) {
      for (const targetId of page.links) {
        // Only link if target page exists
        if (indexData.pages.some(p => p.id === targetId)) {
          links.push({
            source: page.id,
            target: targetId,
            value: 1
          });
        }
      }
    }
  }

  return { nodes, links };
}
