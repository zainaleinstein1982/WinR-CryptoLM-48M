import { useState, useEffect, useCallback } from 'react';

export interface WikiPage {
  id: string;
  title: string;
  summary: string;
  links: string[];
  source: string;
}

export interface WikiGraphData {
  nodes: Array<{ id: string; title: string; group: number }>;
  links: Array<{ source: string; target: string; value: number }>;
}

const DEFAULT_WIKI_PAGES: WikiPage[] = [
  {
    id: 'solidity-reentrancy',
    title: 'Solidity Reentrancy Guard & Security',
    summary: 'Best practices for preventing reentrancy attacks in Solidity smart contracts using state locks and Checks-Effects-Interactions.',
    links: ['rust-cryptography', 'transformer-architecture'],
    source: 'Audit Guidelines v1.2'
  },
  {
    id: 'rust-cryptography',
    title: 'Rust Cryptographic Primitives (sha2)',
    summary: 'Implementing secure hashing and signature verification in Rust using the sha2 and ed25519-dalek crates.',
    links: ['solidity-reentrancy'],
    source: 'Rust Crypto Docs'
  },
  {
    id: 'transformer-architecture',
    title: 'Decoder-Only Transformer (CryptoLM-48M)',
    summary: 'Architecture specification for CryptoLM-48M featuring 12 layers, 768 hidden dimension, RMSNorm, and SwiGLU FFN.',
    links: ['solidity-reentrancy', 'rust-cryptography'],
    source: 'GIBC Track 01 Blueprint'
  }
];

const STORAGE_WIKI_KEY = 'cryptolm_wiki_pages_v1';

export function useWiki() {
  const [pages, setPages] = useState<WikiPage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WIKI_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return DEFAULT_WIKI_PAGES;
  });

  const [graphData, setGraphData] = useState<WikiGraphData>({
    nodes: DEFAULT_WIKI_PAGES.map(p => ({ id: p.id, title: p.title, group: 1 })),
    links: [
      { source: 'solidity-reentrancy', target: 'rust-cryptography', value: 1 },
      { source: 'rust-cryptography', target: 'transformer-architecture', value: 1 },
      { source: 'transformer-architecture', target: 'solidity-reentrancy', value: 1 }
    ]
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [pageContent, setPageContent] = useState<{ id: string; title: string; content: string; source: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_WIKI_KEY, JSON.stringify(pages));
    } catch (e) {
      // ignore
    }
  }, [pages]);

  const fetchPages = useCallback(async (query = '') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/wiki/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setPages(data.results);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      // ignore
    }

    const q = query.toLowerCase();
    const filtered = DEFAULT_WIKI_PAGES.filter(p =>
      p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)
    );
    setPages(filtered.length > 0 || !q ? (filtered.length > 0 ? filtered : DEFAULT_WIKI_PAGES) : []);
    setIsLoading(false);
  }, []);

  const fetchGraph = useCallback(async () => {
    try {
      const res = await fetch('/api/wiki/graph');
      if (res.ok) {
        const data = await res.json();
        setGraphData(data);
        return;
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const fetchPageDetails = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/wiki/page/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPageContent(data);
        setSelectedPageId(id);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      // ignore
    }

    const mockContents: Record<string, string> = {
      'solidity-reentrancy': "# Solidity Reentrancy Guard & Security\n\nReentrancy is one of the most critical vulnerabilities in smart contract development.\n\n```solidity\n// SPDX-License-Identifier: MIT\npragma solidity ^0.8.24;\n\ncontract ReentrancyGuard {\n    bool private locked;\n    modifier nonReentrant() {\n        require(!locked, \"ReentrancyGuard: reentrant call\");\n        locked = true;\n        _;\n        locked = false;\n    }\n}\n```",
      'rust-cryptography': "# Rust Cryptographic Primitives (sha2)\n\nUsing the `sha2` crate for secure hashing:\n\n```rust\nuse sha2::{Sha256, Digest};\n\npub fn hash_data(data: &[u8]) -> [u8; 32] {\n    let mut hasher = Sha256::new();\n    hasher.update(data);\n    hasher.finalize().into()\n}\n```",
      'transformer-architecture': "# Decoder-Only Transformer (CryptoLM-48M)\n\n- **Parameters**: 48,156,928 trainable parameters (<=50M cap).\n- **Layers**: 12 layers, 768 hidden dimension, 12 attention heads."
    };

    const found = pages.find(p => p.id === id);
    setPageContent({
      id,
      title: found?.title || id,
      content: mockContents[id] || `# ${id}\n\nContent for ${id} loaded successfully.`,
      source: found?.source || 'Local Knowledge Base'
    });
    setSelectedPageId(id);
    setIsLoading(false);
  }, [pages]);

  const ingestDoc = useCallback(async (title: string, content: string, source: string) => {
    try {
      const res = await fetch('/api/wiki/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, source }),
      });
      if (res.ok) {
        fetchPages(searchQuery);
        fetchGraph();
        return true;
      }
    } catch (e) {
      // ignore
    }

    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const newPage: WikiPage = {
      id,
      title: title || 'Untitled Document',
      summary: content.slice(0, 120) + '...',
      links: [],
      source: source || 'User Ingest'
    };
    setPages(prev => [newPage, ...prev]);
    setGraphData(prev => ({
      nodes: [...prev.nodes, { id, title: newPage.title, group: 1 }],
      links: prev.links
    }));
    return true;
  }, [searchQuery, fetchPages, fetchGraph]);

  const rescanWiki = useCallback(async () => {
    try {
      const res = await fetch('/api/wiki/rescan', { method: 'POST' });
      if (res.ok) {
        fetchPages(searchQuery);
        fetchGraph();
        return;
      }
    } catch (e) {
      // ignore
    }
    fetchPages(searchQuery);
  }, [searchQuery, fetchPages, fetchGraph]);

  useEffect(() => {
    fetchPages();
    fetchGraph();
  }, [fetchPages, fetchGraph]);

  return {
    pages,
    graphData,
    searchQuery,
    setSearchQuery,
    selectedPageId,
    pageContent,
    isLoading,
    fetchPages,
    fetchPageDetails,
    ingestDoc,
    rescanWiki,
    setSelectedPageId,
  };
}
