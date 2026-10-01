import { useState, useEffect, useCallback, useRef } from 'react';
import { streamChatCompletion } from '../lib/api';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

const STORAGE_KEY = 'cryptolm_chat_conversations_v2';

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load chat history from localStorage', e);
    }
    return [
      {
        id: 'default-1',
        title: 'New Conversation',
        messages: [],
        createdAt: Date.now(),
      },
    ];
  });

  const [currentId, setCurrentId] = useState<string>(() => conversations[0]?.id || 'default-1');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save chat history to localStorage', e);
    }
  }, [conversations]);

  const currentConversation = conversations.find((c) => c.id === currentId) || conversations[0];

  const createNewChat = useCallback(() => {
    const newConv: Conversation = {
      id: 'conv_' + Math.random().toString(36).substring(2, 9),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentId(newConv.id);
  }, []);

  const selectConversation = useCallback((id: string) => {
    setCurrentId(id);
  }, []);

  const deleteConversation = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      if (updated.length === 0) {
        const fresh: Conversation = {
          id: 'conv_' + Math.random().toString(36).substring(2, 9),
          title: 'New Conversation',
          messages: [],
          createdAt: Date.now(),
        };
        setCurrentId(fresh.id);
        return [fresh];
      }
      if (currentId === id) {
        setCurrentId(updated[0].id);
      }
      return updated;
    });
  }, [currentId]);

  const stopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(async (content: string, forceWiki?: boolean) => {
    if (!content.trim() || isStreaming) return;

    const userMsg: Message = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === currentConversation.id) {
          const newMessages = [...conv.messages, userMsg];
          const title = conv.messages.length === 0 ? content.slice(0, 32) + (content.length > 32 ? '...' : '') : conv.title;
          return { ...conv, title, messages: newMessages };
        }
        return conv;
      })
    );

    setIsStreaming(true);
    setStreamingContent('');

    const apiMessages = [...currentConversation.messages, userMsg].map((m) => ({
      role: m.role === 'error' ? 'assistant' : m.role,
      content: m.content,
    }));

    abortControllerRef.current = new AbortController();
    let accumulated = '';

    await streamChatCompletion({
      messages: apiMessages,
      conversationId: currentConversation.id,
      forceWiki,
      signal: abortControllerRef.current.signal,
      onToken: (token) => {
        accumulated += token;
        setStreamingContent(accumulated);
      },
      onError: (errMsg) => {
        const errorMsg: Message = {
          id: 'msg_' + Math.random().toString(36).substring(2, 9),
          role: 'error',
          content: `Error: ${errMsg}`,
          timestamp: Date.now(),
        };
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversation.id
              ? { ...conv, messages: [...conv.messages, errorMsg] }
              : conv
          )
        );
        setIsStreaming(false);
        setStreamingContent('');
      },
      onComplete: () => {
        if (accumulated) {
          const assistantMsg: Message = {
            id: 'msg_' + Math.random().toString(36).substring(2, 9),
            role: 'assistant',
            content: accumulated,
            timestamp: Date.now(),
          };
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === currentConversation.id
                ? { ...conv, messages: [...conv.messages, assistantMsg] }
                : conv
            )
          );
        }
        setIsStreaming(false);
        setStreamingContent('');
        abortControllerRef.current = null;
      },
    });
  }, [currentConversation, isStreaming]);

  return {
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
  };
}
