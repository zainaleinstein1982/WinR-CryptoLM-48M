/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useChat } from './hooks/useChat';
import { useWiki } from './hooks/useWiki';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { WikiPanel } from './components/WikiPanel';
import { WikiPageView } from './components/WikiPageView';

export default function App() {
  const {
    conversations,
    currentConversation,
    currentId,
    isStreaming,
    streamingContent,
    createNewChat,
    selectConversation,
    deleteConversation,
    sendMessage,
    stopGenerating,
  } = useChat();

  const {
    pageContent,
    fetchPageDetails,
    setSelectedPageId,
  } = useWiki();

  const [isWikiOpen, setIsWikiOpen] = useState<boolean>(true);
  const [activeModalPageId, setActiveModalPageId] = useState<string | null>(null);

  const handleSelectWikiPage = (id: string) => {
    fetchPageDetails(id);
    setActiveModalPageId(id);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1a1a1a] text-slate-100 font-sans">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        currentId={currentId}
        onSelect={selectConversation}
        onNewChat={createNewChat}
        onDelete={deleteConversation}
        onToggleWiki={() => setIsWikiOpen(!isWikiOpen)}
        isWikiOpen={isWikiOpen}
      />

      {/* Main Chat Area */}
      <ChatArea
        conversation={currentConversation}
        isStreaming={isStreaming}
        streamingContent={streamingContent}
        onSendMessage={sendMessage}
        onStop={stopGenerating}
      />

      {/* Wiki Slide-Out Panel */}
      <WikiPanel
        isOpen={isWikiOpen}
        onClose={() => setIsWikiOpen(false)}
        onSelectPage={handleSelectWikiPage}
      />

      {/* Wiki Page Details Modal Viewer */}
      {activeModalPageId && (
        <WikiPageView
          pageContent={pageContent}
          onClose={() => {
            setActiveModalPageId(null);
            setSelectedPageId(null);
          }}
          onSelectPage={(id) => fetchPageDetails(id)}
        />
      )}
    </div>
  );
}
