import fs from 'fs';
import path from 'path';

const WIKI_DIR = path.resolve(process.cwd(), 'wiki');
const INDEX_PATH = path.join(WIKI_DIR, 'index.json');

export function loadWikiIndex() {
  if (!fs.existsSync(INDEX_PATH)) {
    return { pages: [] };
  }
  try {
    const data = fs.readFileSync(INDEX_PATH, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return { pages: [] };
  }
}

export function saveWikiIndex(indexData) {
  if (!fs.existsSync(WIKI_DIR)) {
    fs.mkdirSync(WIKI_DIR, { recursive: true });
  }
  fs.writeFileSync(INDEX_PATH, JSON.stringify(indexData, null, 2), 'utf8');
}

/**
 * Two-Step Chain-of-Thought Ingest pattern:
 * 1. Analyze raw text content, extract title, summary, and links.
 * 2. Generate structured markdown page and update index.json.
 */
export async function ingestDocument({ title, content, source }) {
  if (!content) {
    throw new Error('Content is required for ingestion.');
  }

  const id = (title || 'untitled_' + Date.now())
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const finalTitle = title || 'Untitled Document';
  const lines = content.split('\n').filter(Boolean);
  const summary = lines[0] ? lines[0].slice(0, 160) + '...' : 'Ingested wiki document.';

  // Extract internal wiki links like [[page-id]]
  const linkMatches = content.match(/\[\[(.*?)\]\]/g) || [];
  const links = linkMatches.map(m => m.replace(/\[\[|\]\]/g, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'));

  const markdownContent = `# ${finalTitle}\n\n${content}\n\n*Source*: ${source || 'User Ingestion'}\n`;

  if (!fs.existsSync(WIKI_DIR)) {
    fs.mkdirSync(WIKI_DIR, { recursive: true });
  }

  const mdFilePath = path.join(WIKI_DIR, `${id}.md`);
  fs.writeFileSync(mdFilePath, markdownContent, 'utf8');

  // Update index.json
  const indexData = loadWikiIndex();
  const existingIdx = indexData.pages.findIndex(p => p.id === id);
  const pageEntry = {
    id,
    title: finalTitle,
    summary,
    links: Array.from(new Set(links)),
    source: source || 'User Ingestion'
  };

  if (existingIdx >= 0) {
    indexData.pages[existingIdx] = pageEntry;
  } else {
    indexData.pages.push(pageEntry);
  }

  saveWikiIndex(indexData);
  return pageEntry;
}

export function rescanWikiDirectory() {
  if (!fs.existsSync(WIKI_DIR)) {
    fs.mkdirSync(WIKI_DIR, { recursive: true });
    return loadWikiIndex();
  }

  const files = fs.readdirSync(WIKI_DIR).filter(f => f.endsWith('.md'));
  const indexData = loadWikiIndex();
  const existingIds = new Set(indexData.pages.map(p => p.id));

  for (const file of files) {
    const id = file.replace('.md', '');
    if (!existingIds.has(id)) {
      const filePath = path.join(WIKI_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const firstLine = content.split('\n')[0].replace('#', '').trim();
      indexData.pages.push({
        id,
        title: firstLine || id,
        summary: 'Rescanned wiki document.',
        links: [],
        source: 'Directory Rescan'
      });
    }
  }

  saveWikiIndex(indexData);
  return indexData;
}
