'use client';

import { useState, useRef, useEffect } from 'react';

// Types defined inline to avoid external dependency
interface QuickReply {
  label: string;
  value: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  quickReplies?: QuickReply[];
}

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================================
// LINKIFICATION COMPONENT
// ============================================================

/**
 * Renders text with clickable URLs and phone numbers
 * - URLs become links that open in new tab
 * - Phone numbers become tel: links (tap to call on mobile)
 */
function LinkifiedText({ text }: { text: string }) {
  // Combined regex for URLs and UK phone numbers
  // URLs: https://... or http://...
  // Phones: 0800 123 4567, 0808 800 4444, 116 123, 0300 500 0914, 020 3598 3898, etc.
  const combinedRegex = /(https?:\/\/[^\s<>"')\]]+)|(\b(?:116\s?123|0\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4})\b)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  // Reset regex state
  combinedRegex.lastIndex = 0;

  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.slice(lastIndex, match.index)}
        </span>
      );
    }

    const matchedText = match[0];
    const isUrl = match[1] !== undefined;

    if (isUrl) {
      // URL link - opens in new tab
      parts.push(
        <a
          key={`url-${match.index}`}
          href={matchedText}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ss-accent hover:underline break-all"
        >
          {matchedText}
        </a>
      );
    } else {
      // Phone number - tap to call
      const phoneDigits = matchedText.replace(/[\s-]/g, '');
      parts.push(
        <a
          key={`phone-${match.index}`}
          href={`tel:${phoneDigits}`}
          className="text-ss-accent hover:underline font-medium"
        >
          {matchedText}
        </a>
      );
    }

    lastIndex = match.index + matchedText.length;
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-end-${lastIndex}`}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  // If no matches found, return original text
  if (parts.length === 0) {
    return <>{text}</>;
  }

  return <>{parts}</>;
}

// ============================================================
// CHAT WIDGET COMPONENT
// ============================================================

export default function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Send initial greeting when widget first opens
  useEffect(() => {
    if (isOpen && messages.length === 0 && !sessionId) {
      sendMessage('hi');
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || sessionEnded) return;

    // Add user message to display
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Store session ID
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        quickReplies: data.quickReplies,
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Handle session end
      if (data.sessionEnded) {
        setSessionEnded(true);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I\'m sorry, something went wrong. Please try again or call Shelter on 0808 800 4444 for immediate help.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickReply = (reply: QuickReply) => {
    sendMessage(reply.value);
  };

  const handleRestart = () => {
    setMessages([]);
    setSessionId(null);
    setSessionEnded(false);
    // Trigger new session
    setTimeout(() => sendMessage('hi'), 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-[480px] h-[640px] max-h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-ss-primary text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <h2 className="font-semibold text-lg">Street Support Network's Assistant</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRestart}
            className="p-1 hover:bg-ss-accent rounded transition-colors"
            title="Start new conversation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-ss-accent rounded transition-colors"
            title="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-ss-bg chat-messages">
        {messages.map((message, index) => (
          <div key={index}>
            <div
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-ss-secondary text-white'
                    : 'bg-white text-ss-text shadow-sm border border-gray-100'
                }`}
              >
                {/* UPDATED: Use LinkifiedText for assistant messages */}
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.role === 'assistant' ? (
                    <LinkifiedText text={message.content} />
                  ) : (
                    message.content
                  )}
                </p>
              </div>
            </div>

            {/* Quick Replies */}
            {message.role === 'assistant' && message.quickReplies && message.quickReplies.length > 0 && index === messages.length - 1 && !sessionEnded && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.quickReplies.map((reply, replyIndex) => (
                  <button
                    key={replyIndex}
                    onClick={() => handleQuickReply(reply)}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-full bg-white text-ss-text hover:border-ss-accent hover:text-ss-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reply.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-ss-primary rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-ss-primary rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-ss-primary rounded-full typing-dot"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Session Ended Notice */}
      {sessionEnded && (
        <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            This conversation has ended.{' '}
            <button
              onClick={handleRestart}
              className="text-ss-accent hover:underline font-medium"
            >
              Start a new conversation
            </button>
          </p>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={sessionEnded ? 'Conversation ended' : 'Type something...'}
            disabled={isLoading || sessionEnded}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ss-accent focus:ring-1 focus:ring-ss-accent disabled:bg-gray-50 disabled:text-gray-400"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || sessionEnded}
            className="p-2 text-ss-accent hover:text-ss-primary disabled:text-gray-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
