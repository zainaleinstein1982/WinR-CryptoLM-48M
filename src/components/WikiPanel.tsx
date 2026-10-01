import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  RefreshCw,
  Plus,
  Share2,
  FileText,
  ChevronRight,
  X,
  Sparkles
} from 'lucide-react';
import { useWiki } from '../hooks/useWiki';

interface WikiPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (id: string) => void;
}

export const WikiPanel: React.FC<WikiPanelProps> = ({
  isOpen,
  onClose,
  onSelectPage,
}) => {
  const {
    pages,
    graphData,
    searchQuery,
    setSearchQuery,
    fetchPages,
    rescanWiki,
    ingestDoc,
  } = useWiki();

  const [activeTab, setActiveTab] = useState<'pages' | 'graph' | 'ingest'>('pages');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newSource, setNewSource] = useState<string>('');
  const [ingestSuccess, setIngestSuccess] = useState<boolean>(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    fetchPages(q);
  };

  const handleIngestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    const success = await ingestDoc(newTitle, newContent, newSource || 'User Ingest');
    if (success) {
      setNewTitle('');
      setNewContent('');
      setNewSource('');
      setIngestSuccess(true);
      setTimeout(() => setIngestSuccess(false), 3000);
      setActiveTab('pages');
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="w-[340px] bg-[#141414] border-l border-[#242424] flex flex-col h-full z-30 animate-slideLeft">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-[#222] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide">Wiki Knowledge Base</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={rescanWiki}
            className="p-1.5 rounded-lg hover:bg-[#222] text-slate-400 hover:text-white transition"
            title="Rescan Wiki Directory"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#222] text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#222] bg-[#181818] px-2 py-1.5 space-x-1">
        {[
          { id: 'pages', label: 'Pages', icon: FileText },
          { id: 'graph', label: 'Graph', icon: Share2 },
          { id: 'ingest', label: 'Ingest', icon: Plus },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-[#252525] text-blue-400 border border-[#333]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {activeTab === 'pages' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search wiki pages..."
                className="w-full bg-[#1b1b1b] border border-[#2f2f2f] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              {pages.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">No wiki pages found.</div>
              ) : (
                pages.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onSelectPage(p.id)}
                    className="p-3 rounded-xl bg-[#1a1a1a] hover:bg-[#222] border border-[#262626] cursor-pointer transition group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition truncate">
                        {p.title}
                      </h4>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{p.summary}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-mono bg-[#242424] px-1.5 py-0.5 rounded">{p.source}</span>
                      <span>{p.links?.length || 0} links</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'graph' && (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-400 px-1">
              Visualizing link relationships between wiki documents:
            </div>
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-4 flex flex-col items-center justify-center min-h-[300px]">
              {/* SVG Force / Link Graph representation */}
              <svg width="260" height="260" className="overflow-visible">
                {graphData.links.map((link, idx) => {
                  const sourceNode = graphData.nodes.find(n => n.id === link.source);
                  const targetNode = graphData.nodes.find(n => n.id === link.target);
                  if (!sourceNode || !targetNode) return null;
                  // Simple radial layout calculation for demo nodes
                  const angle1 = (graphData.nodes.indexOf(sourceNode) / graphData.nodes.length) * 2 * Math.PI;
                  const angle2 = (graphData.nodes.indexOf(targetNode) / graphData.nodes.length) * 2 * Math.PI;
                  const x1 = 130 + 70 * Math.cos(angle1);
                  const y1 = 130 + 70 * Math.sin(angle1);
                  const x2 = 130 + 70 * Math.cos(angle2);
                  const y2 = 130 + 70 * Math.sin(angle2);
                  return (
                    <line
                      key={idx}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#333"
                      strokeWidth="1.5"
                    />
                  );
                })}
                {graphData.nodes.map((node, idx) => {
                  const angle = (idx / graphData.nodes.length) * 2 * Math.PI;
                  const cx = 130 + 70 * Math.cos(angle);
                  const cy = 130 + 70 * Math.sin(angle);
                  return (
                    <g key={node.id} onClick={() => onSelectPage(node.id)} className="cursor-pointer group">
                      <circle
                        cx={cx}
                        cy={cy}
                        r="18"
                        className="fill-[#222] stroke-blue-500 group-hover:fill-blue-600 transition"
                        strokeWidth="2"
                      />
                      <text
                        x={cx}
                        y={cy + 28}
                        textAnchor="middle"
                        className="text-[9px] fill-slate-300 font-mono pointer-events-none"
                      >
                        {node.title.slice(0, 12)}...
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {activeTab === 'ingest' && (
          <form onSubmit={handleIngestSubmit} className="space-y-3">
            {ingestSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs text-center font-medium">
                ✅ Document successfully ingested into wiki!
              </div>
            )}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Document Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Smart Contract Audit Spec"
                className="w-full bg-[#1b1b1b] border border-[#2f2f2f] rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Source Reference</label>
              <input
                type="text"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="e.g. Internal Security Wiki"
                className="w-full bg-[#1b1b1b] border border-[#2f2f2f] rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Markdown Content</label>
              <textarea
                rows={6}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Write or paste markdown content here..."
                className="w-full bg-[#1b1b1b] border border-[#2f2f2f] rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none custom-scrollbar"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ingest into Knowledge Base</span>
            </button>
          </form>
        )}
      </div>
    </aside>
  );
};
