'use client';

import { useState, useRef, useEffect } from 'react';

// Types defined inline
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

function LinkifiedText({ text }: { text: string }) {
  if (!text) return null;
  
  const combinedRegex = /(https?:\/\/[^\s<>"')\]]+)|(\b(?:116\s?123|0\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4})\b)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  combinedRegex.lastIndex = 0;

  while ((match = combinedRegex.exec(text)) !== null) {
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

  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-end-${lastIndex}`}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  if (parts.length === 0) {
    return <>{text}</>;
  }

  return <>{parts}</>;
}

// ============================================================
// CONVERSATION STARTERS
// ============================================================

const conversationStarters: QuickReply[] = [
  { label: 'Advice and Guidance', value: '1' },
  { label: 'Help connecting to support', value: '2' },
  { label: 'Search for a specific organisation', value: '3' },
];

// ============================================================
// CHAT WIDGET COMPONENT
// ============================================================

export default function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when conversation starts
  useEffect(() => {
    if (isOpen && conversationStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, conversationStarted]);

  const sendMessage = async (text: string, displayText?: string) => {
    if (!text || !text.trim() || isLoading || sessionEnded) return;

    // Mark conversation as started
    if (!conversationStarted) {
      setConversationStarted(true);
    }

    // Add user message to display
    const userMessage: Message = {
      role: 'user',
      content: displayText || text,
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

      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message || '',
        timestamp: new Date().toISOString(),
        quickReplies: Array.isArray(data.quickReplies) ? data.quickReplies : [],
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (data.sessionEnded) {
        setSessionEnded(true);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I\'m sorry, something went wrong. Please try again or call Shelter on 0808 800 4444 for immediate help.',
        timestamp: new Date().toISOString(),
        quickReplies: [],
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue && inputValue.trim()) {
      sendMessage(inputValue);
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    if (reply && reply.value) {
      sendMessage(reply.value, reply.label);
    }
  };

  const handleStarterClick = (starter: QuickReply) => {
    if (starter && starter.value) {
      sendMessage(starter.value, starter.label);
    }
  };

  const handleRestart = () => {
    setMessages([]);
    setSessionId(null);
    setSessionEnded(false);
    setConversationStarted(false);
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
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Start new conversation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 chat-messages"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f0f7f4 100%)'
        }}
      >
        {/* Welcome Screen - shown before conversation starts */}
        {!conversationStarted && (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <h1 className="text-2xl font-semibold text-ss-text text-center mb-8 leading-relaxed">
              Hello, I'm Street Support Network's assistant! How can I help you today?
            </h1>
            
            <div className="flex flex-col gap-3 w-full max-w-xs">
              {conversationStarters.map((starter, index) => (
                <button
                  key={index}
                  onClick={() => handleStarterClick(starter)}
                  className="px-5 py-3 text-sm border border-gray-300 rounded-full bg-white text-ss-text hover:border-ss-accent hover:text-ss-accent transition-colors text-left"
                >
                  {starter.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages - shown after conversation starts */}
        {conversationStarted && (
          <div className="space-y-4">
            {messages && messages.length > 0 && messages.map((message, index) => (
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
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.role === 'assistant' ? (
                        <LinkifiedText text={message.content || ''} />
                      ) : (
                        message.content || ''
                      )}
                    </p>
                  </div>
                </div>

                {/* Quick Replies */}
                {message.role === 'assistant' && 
                 Array.isArray(message.quickReplies) && 
                 message.quickReplies.length > 0 && 
                 index === messages.length - 1 && 
                 !sessionEnded && (
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
                    <div className="w-2 h-2 bg-ss-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-ss-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-ss-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
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

      {/* Input - only show after conversation starts */}
      {conversationStarted && (
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
              disabled={!inputValue || !inputValue.trim() || isLoading || sessionEnded}
              className="p-2 text-ss-accent hover:text-ss-primary disabled:text-gray-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
