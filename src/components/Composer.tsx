import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Sparkles, BookOpen } from 'lucide-react';

interface ComposerProps {
  onSendMessage: (text: string, forceWiki?: boolean) => void;
  isStreaming: boolean;
  onStop: () => void;
}

export const Composer: React.FC<ComposerProps> = ({
  onSendMessage,
  isStreaming,
  onStop,
}) => {
  const [input, setInput] = useState<string>('');
  const [forceWikiMode, setForceWikiMode] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isStreaming) {
        let msg = input.trim();
        let isWikiCmd = forceWikiMode;
        if (msg.startsWith('/wiki')) {
          isWikiCmd = true;
          msg = msg.replace('/wiki', '').trim();
        }
        if (msg) {
          onSendMessage(msg, isWikiCmd);
          setInput('');
          setForceWikiMode(false);
          if (textareaRef.current) textareaRef.current.style.height = 'auto';
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isStreaming) {
      let msg = input.trim();
      let isWikiCmd = forceWikiMode;
      if (msg.startsWith('/wiki')) {
        isWikiCmd = true;
        msg = msg.replace('/wiki', '').trim();
      }
      if (msg) {
        onSendMessage(msg, isWikiCmd);
        setInput('');
        setForceWikiMode(false);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <div className="p-4 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/90 to-transparent sticky bottom-0 z-20">
      <div className="max-w-3xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="relative bg-[#242424] border border-[#333333] rounded-2xl shadow-xl focus-within:border-blue-500 transition-colors p-2 flex flex-col"
        >
          {forceWikiMode && (
            <div className="px-3 pt-1 pb-1 flex items-center space-x-1.5 text-xs text-blue-400 font-medium">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Wiki-Only RAG Mode Active (/wiki)</span>
              <button
                type="button"
                onClick={() => setForceWikiMode(false)}
                className="ml-auto text-slate-400 hover:text-white text-[10px] underline"
              >
                Disable
              </button>
            </div>
          )}

          <div className="flex items-end">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message CryptoLM-48M (type /wiki for wiki-only query)..."
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm px-3 py-2.5 focus:outline-none resize-none max-h-[180px] custom-scrollbar"
            />

            <div className="flex items-center space-x-2 pb-1.5 pr-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setForceWikiMode(!forceWikiMode)}
                className={`p-2 rounded-xl transition flex items-center space-x-1 text-xs font-medium ${
                  forceWikiMode
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-[#2a2a2a] text-slate-400 hover:text-white'
                }`}
                title="Toggle Wiki-only RAG mode"
              >
                <BookOpen className="w-4 h-4" />
              </button>

              {isStreaming ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="p-2 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 transition flex items-center space-x-1 text-xs font-medium"
                  title="Stop generating"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span className="hidden sm:inline">Stop</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={`p-2 rounded-xl transition flex items-center justify-center ${
                    input.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/30'
                      : 'bg-[#333333] text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="text-center mt-2 text-[11px] text-slate-500 flex items-center justify-center space-x-1">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span>CryptoLM-48M is trained from scratch (48.15M params) for GIBC V2 Track 01. Research prototype disclaimer applies.</span>
        </div>
      </div>
    </div>
  );
};
