import express from 'express';
import fs from 'fs';
import path from 'path';
import { ingestDocument, rescanWikiDirectory, loadWikiIndex } from './ingest.js';
import { searchWiki } from './search.js';
import { getWikiGraph } from './graph.js';

const router = express.Router();
const WIKI_DIR = path.resolve(process.cwd(), 'wiki');

// GET /api/wiki/search
router.get('/search', (req, res) => {
  try {
    const q = req.query.q || '';
    const results = searchWiki(q);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/wiki/page/:id
router.get('/page/:id', (req, res) => {
  try {
    const { id } = req.params;
    const mdPath = path.join(WIKI_DIR, `${id}.md`);
    if (!fs.existsSync(mdPath)) {
      return res.status(404).json({ error: 'Wiki page not found' });
    }
    const content = fs.readFileSync(mdPath, 'utf8');
    const indexData = loadWikiIndex();
    const meta = indexData.pages.find(p => p.id === id) || { title: id };
    res.json({ id, title: meta.title, content, source: meta.source });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/wiki/ingest
router.post('/ingest', async (req, res) => {
  try {
    const { title, content, source } = req.body;
    const page = await ingestDocument({ title, content, source });
    res.json({ success: true, page });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/wiki/graph
router.get('/graph', (req, res) => {
  try {
    const graph = getWikiGraph();
    res.json(graph);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/wiki/rescan
router.post('/rescan', (req, res) => {
  try {
    const indexData = rescanWikiDirectory();
    res.json({ success: true, index: indexData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
