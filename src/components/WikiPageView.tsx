import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, BookOpen, ExternalLink } from 'lucide-react';

interface WikiPageViewProps {
  pageContent: { id: string; title: string; content: string; source: string } | null;
  onClose: () => void;
  onSelectPage: (id: string) => void;
}

export const WikiPageView: React.FC<WikiPageViewProps> = ({
  pageContent,
  onClose,
  onSelectPage,
}) => {
  if (!pageContent) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-[#333] w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{pageContent.title}</h3>
              <span className="text-[10px] text-slate-400 font-mono">Source: {pageContent.source}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#252525] text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar prose prose-invert max-w-none text-sm text-slate-200">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a({ node, children, href, ...props }: any) {
                // Handle internal wiki links like [[page-id]] or custom hrefs
                return (
                  <button
                    onClick={() => href && onSelectPage(href.replace('/', ''))}
                    className="text-blue-400 hover:underline font-medium inline-flex items-center space-x-1"
                    {...props}
                  >
                    <span>{children}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                );
              }
            }}
          >
            {pageContent.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
