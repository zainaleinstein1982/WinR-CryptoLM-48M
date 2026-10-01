import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Settings,
  Moon,
  Sun,
  Cpu,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Conversation } from '../hooks/useChat';

interface SidebarProps {
  conversations: Conversation[];
  currentId: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onToggleWiki: () => void;
  isWikiOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  currentId,
  onSelect,
  onNewChat,
  onDelete,
  onToggleWiki,
  isWikiOpen,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-[#242424] text-slate-300 hover:text-white border border-[#333333]"
      >
        {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[280px] bg-[#141414] border-r border-[#242424] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-3 border-b border-[#222222] space-y-2">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#222222] hover:bg-[#2a2a2a] text-slate-200 text-sm font-medium transition border border-[#2f2f2f] group"
          >
            <span className="flex items-center space-x-2">
              <Plus className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>New Chat</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500 bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-[#333]">Ctrl+K</span>
          </button>

          <button
            onClick={onToggleWiki}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold transition border ${
              isWikiOpen
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                : 'bg-[#1b1b1b] text-slate-300 border-[#262626] hover:bg-[#222]'
            }`}
          >
            <span className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Wiki Knowledge Base</span>
            </span>
            <span className="text-[10px] font-mono bg-[#242424] px-1.5 py-0.5 rounded text-slate-400">RAG</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          <div className="text-[11px] font-semibold text-slate-500 px-3 py-1.5 uppercase tracking-wider">
            Recent Chats
          </div>
          {conversations.map((conv) => {
            const isSelected = conv.id === currentId;
            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition ${
                  isSelected
                    ? 'bg-[#222222] text-white font-medium border border-[#333333]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1a1a]'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate pr-6">
                  <MessageSquare className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span className="truncate">{conv.title || 'New Conversation'}</span>
                </div>
                <button
                  onClick={(e) => onDelete(conv.id, e)}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#333] text-slate-400 hover:text-red-400 transition"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-[#222222] space-y-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#181818] border border-[#222]">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                <Cpu className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">CryptoLM-48M</div>
                <div className="text-[10px] text-emerald-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>≤50M params (Scratch)</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-lg hover:bg-[#242424] text-slate-400 hover:text-white transition"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {showSettings && (
            <div className="p-3 rounded-xl bg-[#1b1b1b] border border-[#333] text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-slate-300">
                <span>Theme Mode</span>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-1.5 rounded bg-[#242424] hover:bg-[#333] text-slate-300 transition"
                >
                  {isDarkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="pt-2 border-t border-[#2a2a2a] text-[10px] text-slate-500 flex justify-between items-center">
                <span>GIBC V2 Track 01 TECH</span>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center space-x-1">
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
