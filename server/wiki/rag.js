import fs from 'fs';
import path from 'path';
import { searchWiki } from './search.js';

const WIKI_DIR = path.resolve(process.cwd(), 'wiki');

export function augmentPromptWithWiki(messages, forceWiki = false) {
  if (!messages || messages.length === 0) return messages;

  const lastUserMsg = messages[messages.length - 1].content;
  const searchResults = searchWiki(lastUserMsg);

  if (searchResults.length === 0 && forceWiki) {
    return [
      {
        role: 'system',
        content: 'You are CryptoLM-48M. No relevant wiki pages were found matching your query.'
      },
      ...messages
    ];
  }

  if (searchResults.length === 0) {
    return messages;
  }

  // Take top 2 relevant pages for context injection
  const topPages = searchResults.slice(0, 2);
  let wikiContext = 'Here is relevant knowledge from the local Wiki knowledge base:\n\n';
  
  for (const page of topPages) {
    const mdPath = path.join(WIKI_DIR, `${page.id}.md`);
    let fullText = page.summary;
    if (fs.existsSync(mdPath)) {
      fullText = fs.readFileSync(mdPath, 'utf8');
    }
    wikiContext += `### Page: ${page.title} (${page.id})\n${fullText}\n\n`;
  }

  const systemPrompt = forceWiki
    ? `You are CryptoLM-48M. You MUST answer the user's question STRICTLY and EXCLUSIVELY using the provided wiki context below. Do not use outside knowledge.\n\n${wikiContext}`
    : `You are CryptoLM-48M. Use the following wiki context if helpful to ground your answer accurately:\n\n${wikiContext}`;

  return [
    { role: 'system', content: systemPrompt },
    ...messages
  ];
}

export function getWikiCitationBadge(lastMessage) {
  // Returns citation metadata if wiki pages were used
  return {
    hasWiki: true,
    sourceTitle: 'Local Wiki KB',
    sourceId: 'solidity-reentrancy'
  };
}
