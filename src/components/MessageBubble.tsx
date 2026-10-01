import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Cpu, User, AlertCircle, Copy, Check } from 'lucide-react';
import { Message } from '../hooks/useChat';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = React.useState<boolean>(false);
  const isUser = message.role === 'user';
  const isError = message.role === 'error';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`py-6 px-4 md:px-8 w-full flex justify-center ${isUser ? 'bg-[#1a1a1a]' : 'bg-[#212121]/60 border-y border-[#262626]'}`}>
      <div className="max-w-3xl w-full flex space-x-4">
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-semibold text-xs shadow-md">
              <User className="w-4 h-4" />
            </div>
          ) : isError ? (
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-md">
              <Cpu className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              {isUser ? 'You' : isError ? 'System Error' : 'CryptoLM-48M'}
            </span>
            <button
              onClick={handleCopy}
              className="opacity-60 hover:opacity-100 flex items-center space-x-1 text-[11px] text-slate-400 bg-[#2a2a2a] px-2 py-1 rounded transition"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className={`prose prose-invert max-w-none text-sm leading-relaxed ${isError ? 'text-red-300 bg-red-950/30 p-3 rounded-xl border border-red-900/50 font-mono text-xs' : 'text-slate-200'}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="rounded-xl overflow-hidden my-3 border border-[#333] bg-[#1e1e1e]">
                      <div className="bg-[#252526] px-4 py-1.5 text-[11px] font-mono text-slate-400 flex justify-between items-center border-b border-[#333]">
                        <span>{match[1]}</span>
                      </div>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, padding: '1rem', background: '#1e1e1e', fontSize: '12px' }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="bg-[#2a2a2a] text-blue-300 px-1.5 py-0.5 rounded font-mono text-xs" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};
