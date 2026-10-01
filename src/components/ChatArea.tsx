import React, { useRef, useEffect } from 'react';
import { Cpu, Sparkles, Code2, ShieldCheck, Zap } from 'lucide-react';
import { Conversation, Message } from '../hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { Composer } from './Composer';

interface ChatAreaProps {
  conversation: Conversation;
  isStreaming: boolean;
  streamingContent: string;
  onSendMessage: (text: string) => void;
  onStop: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  isStreaming,
  streamingContent,
  onSendMessage,
  onStop,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, streamingContent]);

  const suggestions = [
    { title: 'Solidity Reentrancy Guard', prompt: 'Write a secure Solidity reentrancy guard contract with modifier check.' },
    { title: 'Rust Cryptographic Hash', prompt: 'Write a Rust function using sha2 to compute SHA-256 cryptographic hashes.' },
    { title: 'Transformer Attention Head', prompt: 'Explain the scaled dot-product attention formula in decoder-only transformers.' },
    { title: 'GIBC Track 01 Parameter Budget', prompt: 'Verify the 48.15M parameter breakdown for embeddings and transformer layers.' },
  ];

  const isEmpty = conversation.messages.length === 0 && !isStreaming;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1a1a1a] overflow-hidden relative">
      {/* Scrollable conversation pane */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-4 shadow-xl">
              <Cpu className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              Hi, I'm CryptoLM-48M.
            </h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Ask me about Solidity smart contracts, Rust cryptographic primitives, or foundational transformer architecture trained from scratch for GIBC V2 Track 01.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(s.prompt)}
                  className="p-3.5 rounded-xl bg-[#212121] hover:bg-[#282828] border border-[#2f2f2f] text-left transition group flex flex-col justify-between"
                >
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition mb-1">
                    {s.title}
                  </span>
                  <span className="text-[11px] text-slate-400 line-clamp-1">{s.prompt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-1">
            {conversation.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Live Streaming Assistant Message */}
            {isStreaming && (
              <MessageBubble
                message={{
                  id: 'streaming_temp',
                  role: 'assistant',
                  content: streamingContent || 'Thinking and generating tokens...',
                  timestamp: Date.now(),
                }}
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Composer */}
      <Composer
        onSendMessage={onSendMessage}
        isStreaming={isStreaming}
        onStop={onStop}
      />
    </div>
  );
};
