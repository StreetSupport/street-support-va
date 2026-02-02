'use client';

import { useState, useRef, useEffect } from 'react';

// ============================================================
// TYPES
// ============================================================

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

interface ServiceCard {
  name: string;
  phone?: string;
  website?: string;
  description?: string;
  category: string;
  isVerified?: boolean;
  isDropIn?: boolean;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================================
// LINKIFICATION
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
      parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
    }

    const matchedText = match[0];
    if (match[1]) {
      parts.push(
        <a key={`url-${match.index}`} href={matchedText} target="_blank" rel="noopener noreferrer" className="text-ss-accent font-medium hover:underline break-all">
          {matchedText}
        </a>
      );
    } else {
      parts.push(
        <a key={`phone-${match.index}`} href={`tel:${matchedText.replace(/[\s-]/g, '')}`} className="text-ss-accent font-semibold hover:underline">
          {matchedText}
        </a>
      );
    }
    lastIndex = match.index + matchedText.length;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`text-end-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return parts.length === 0 ? <>{text}</> : <>{parts}</>;
}

// ============================================================
// TEXT PROCESSING
// ============================================================

function stripInstructionsAndOptions(text: string): string {
  if (!text) return '';
  
  const lines = text.split('\n');
  const cleanedLines: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();
    
    if (trimmed.includes('reply with the number') ||
        trimmed.includes('reply with a number') ||
        trimmed.includes('please select') ||
        trimmed.includes('choose from the options') ||
        trimmed.includes('pick the option') ||
        trimmed.includes('which fits best') ||
        trimmed.includes('type the number')) {
      continue;
    }
    
    if (/^\d+[\.\)]\s*.+/.test(line.trim())) {
      continue;
    }
    
    cleanedLines.push(line);
  }
  
  return cleanedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// ============================================================
// SERVICE CARD PARSER
// ============================================================

interface ParsedContent {
  intro: string;
  services: ServiceCard[];
  outro: string;
  isServiceResponse: boolean;
}

function parseServiceContent(text: string): ParsedContent {
  const isServiceResponse = 
    text.includes('YOUR FIRST STEP') || 
    text.includes('LOCAL SUPPORT') ||
    text.includes('found some services') ||
    text.includes('IF YOU NEED MORE HELP');
    
  if (!isServiceResponse) {
    return { intro: text, services: [], outro: '', isServiceResponse: false };
  }

  const services: ServiceCard[] = [];
  const lines = text.split('\n');
  
  let currentCategory = '';
  let currentService: Partial<ServiceCard> | null = null;
  let intro = '';
  let outro = '';
  let reachedFirstSection = false;
  let collectingOutro = false;
  let inShelterSection = false;
  let shelterIntroText = '';
  
  const sectionHeaders = [
    'YOUR FIRST STEP',
    'OUTREACH SUPPORT', 
    'LOCAL SUPPORT',
    'SPECIALIST SUPPORT',
    "YOUNG PEOPLE'S SUPPORT",
    'IMPORTANT FOR YOUNG PEOPLE',
    'IF YOU NEED MORE HELP'
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (/^-+$/.test(trimmed)) continue;
    
    const isHeader = sectionHeaders.some(h => trimmed === h);
    
    if (isHeader) {
      if (currentService?.name) {
        services.push(currentService as ServiceCard);
      }
      
      currentCategory = trimmed;
      currentService = null;
      reachedFirstSection = true;
      inShelterSection = trimmed === 'IF YOU NEED MORE HELP';
      shelterIntroText = '';
      continue;
    }
    
    if (!reachedFirstSection && trimmed) {
      intro += line + '\n';
      continue;
    }
    
    if (trimmed === '---') {
      if (currentService?.name) {
        services.push(currentService as ServiceCard);
        currentService = null;
      }
      collectingOutro = true;
      continue;
    }
    
    if (!trimmed) {
      if (inShelterSection && currentService?.website && !currentService.description) {
        continue;
      }
      if (currentService?.name && currentService.phone) {
        services.push(currentService as ServiceCard);
        currentService = null;
      }
      continue;
    }
    
    if (collectingOutro) {
      outro += line + '\n';
      continue;
    }
    
    if (inShelterSection) {
      if (/^0\d/.test(trimmed) || trimmed.includes('(free')) {
        if (!currentService) {
          currentService = { 
            name: 'Shelter', 
            category: currentCategory,
            description: shelterIntroText.trim()
          };
        }
        currentService.phone = trimmed;
        continue;
      }
      
      if (trimmed.startsWith('http')) {
        if (currentService) {
          currentService.website = trimmed;
        }
        continue;
      }
      
      if (trimmed.toLowerCase() === 'shelter') {
        continue;
      }
      
      if (currentService?.website) {
        if (currentService.description) {
          currentService.description += ' ' + trimmed;
        } else {
          currentService.description = trimmed;
        }
        continue;
      }
      
      shelterIntroText += trimmed + ' ';
      continue;
    }
    
    if (!currentService) {
      currentService = { 
        name: trimmed, 
        category: currentCategory,
        isDropIn: currentCategory === 'LOCAL SUPPORT',
        isVerified: currentCategory === 'YOUR FIRST STEP'
      };
    } else if (trimmed.startsWith('http')) {
      currentService.website = trimmed;
    } else if (/^0\d/.test(trimmed) || trimmed.includes('(free')) {
      currentService.phone = trimmed;
    } else if (!currentService.description) {
      currentService.description = trimmed;
    } else {
      currentService.description += ' ' + trimmed;
    }
  }
  
  if (currentService?.name) {
    services.push(currentService as ServiceCard);
  }
  
  return { 
    intro: intro.trim(), 
    services, 
    outro: outro.trim(),
    isServiceResponse: true 
  };
}

// ============================================================
// SERVICE CARD COMPONENT
// ============================================================

function ServiceCardComponent({ service }: { service: ServiceCard }) {
  const categoryStyles: Record<string, { bg: string; border: string; badge: string }> = {
    'YOUR FIRST STEP': { bg: 'bg-green-50', border: 'border-green-300', badge: 'bg-green-600 text-white' },
    'OUTREACH SUPPORT': { bg: 'bg-orange-50', border: 'border-orange-300', badge: 'bg-orange-500 text-white' },
    'LOCAL SUPPORT': { bg: 'bg-blue-50', border: 'border-blue-300', badge: 'bg-blue-600 text-white' },
    'SPECIALIST SUPPORT': { bg: 'bg-purple-50', border: 'border-purple-300', badge: 'bg-purple-600 text-white' },
    "YOUNG PEOPLE'S SUPPORT": { bg: 'bg-yellow-50', border: 'border-yellow-400', badge: 'bg-yellow-500 text-white' },
    'IMPORTANT FOR YOUNG PEOPLE': { bg: 'bg-yellow-50', border: 'border-yellow-400', badge: 'bg-yellow-500 text-white' },
    'IF YOU NEED MORE HELP': { bg: 'bg-slate-50', border: 'border-slate-300', badge: 'bg-slate-600 text-white' },
  };
  
  const style = categoryStyles[service.category] || categoryStyles['LOCAL SUPPORT'];
  
  return (
    <div className={`rounded-xl border-2 ${style.border} ${style.bg} p-4 mb-3 shadow-md`}>
      {/* Top badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        {service.isVerified && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-600 text-white shadow-sm">
            <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Start Here
          </span>
        )}
        {service.isDropIn && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm">
            Drop-in
          </span>
        )}
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${style.badge}`}>
          {service.category === 'IF YOU NEED MORE HELP' ? 'Need More Help?' : service.category.replace(/'/g, "'")}
        </span>
      </div>
      
      {/* Org name */}
      <h4 className="font-bold text-gray-900 text-base mb-3">{service.name}</h4>
      
      {/* Contact details */}
      <div className="space-y-2 mb-3">
        {service.phone && (
          <a 
            href={`tel:${service.phone.replace(/[^\d+]/g, '')}`} 
            className="flex items-center text-ss-accent hover:text-ss-primary font-semibold text-sm bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm transition-colors"
          >
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {service.phone}
          </a>
        )}
        {service.website && (
          <a 
            href={service.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-ss-accent hover:text-ss-primary font-medium text-sm bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm transition-colors"
          >
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="truncate">{service.website.replace('https://', '').replace('http://', '')}</span>
          </a>
        )}
      </div>
      
      {/* Description */}
      {service.description && (
        <p className="text-gray-700 text-sm leading-relaxed">{service.description}</p>
      )}
    </div>
  );
}

// ============================================================
// CONVERSATION STARTERS
// ============================================================

const conversationStarters = [
  'Advice and Guidance',
  'Help connecting to support',
  'Search for a specific organisation',
];

// ============================================================
// CHAT WIDGET
// ============================================================

export default function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionState, setSessionState] = useState<string | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (lastMessageRef.current && messagesContainerRef.current) {
      setTimeout(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && conversationStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, conversationStarted]);

  const callApi = async (text: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s: sessionState, message: text }),
      });
      if (!response.ok) throw new Error('Failed');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const addAssistantMessage = (data: { m?: string; o?: string[]; e?: boolean }) => {
    const quickReplies: QuickReply[] = Array.isArray(data.o) 
      ? data.o.map((opt: string, idx: number) => ({ label: opt, value: String(idx + 1) }))
      : [];

    const messageText = quickReplies.length > 0 
      ? stripInstructionsAndOptions(data.m || '')
      : (data.m || '');

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: messageText,
      timestamp: new Date().toISOString(),
      quickReplies,
    }]);

    if (data.e) setSessionEnded(true);
  };

  const addErrorMessage = () => {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'I\'m sorry, something went wrong. Please try again or call Shelter on 0808 800 4444 for immediate help.',
      timestamp: new Date().toISOString(),
      quickReplies: [],
    }]);
  };

  const sendMessage = async (text: string, hideUserMessage: boolean = false) => {
    if (!text?.trim() || isLoading || sessionEnded) return;

    if (!conversationStarted) setConversationStarted(true);

    if (!hideUserMessage) {
      setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date().toISOString() }]);
    }
    
    setInputValue('');
    setIsLoading(true);

    const data = await callApi(text);
    
    if (data) {
      if (data.s) setSessionState(data.s);
      addAssistantMessage(data);
    } else {
      addErrorMessage();
    }

    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue?.trim()) sendMessage(inputValue);
  };

  const handleQuickReply = async (reply: QuickReply) => {
    if (!reply?.value || isLoading || sessionEnded) return;

    setMessages(prev => [...prev, { role: 'user', content: reply.label, timestamp: new Date().toISOString() }]);
    setIsLoading(true);

    const data = await callApi(reply.value);
    
    if (data) {
      if (data.s) setSessionState(data.s);
      addAssistantMessage(data);
    } else {
      addErrorMessage();
    }

    setIsLoading(false);
  };

  const handleStarterClick = () => sendMessage('hi', true);

  const handleRestart = () => {
    setMessages([]);
    setSessionState(null);
    setSessionEnded(false);
    setConversationStarted(false);
  };

  const renderMessageContent = (content: string) => {
    const parsed = parseServiceContent(content);
    
    if (parsed.isServiceResponse && parsed.services.length > 0) {
      return (
        <div className="space-y-3">
          {parsed.intro && (
            <p className="text-sm leading-relaxed text-gray-800 font-medium mb-4">{parsed.intro}</p>
          )}
          
          {parsed.services.map((service, idx) => (
            <ServiceCardComponent key={idx} service={service} />
          ))}
          
          {parsed.outro && (
            <p className="text-sm leading-relaxed text-gray-700 mt-4 pt-3 border-t border-gray-200 font-medium">
              {parsed.outro}
            </p>
          )}
        </div>
      );
    }
    
    return (
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
        <LinkifiedText text={content || ''} />
      </p>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-[480px] h-[640px] max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-300">
      {/* Header */}
      <div className="bg-ss-primary text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <h2 className="font-bold text-lg">Street Support Network's Assistant</h2>
        <div className="flex items-center gap-2">
          <button onClick={handleRestart} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Start new conversation">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4"
        style={{ background: 'linear-gradient(180deg, #ffffff 0%, #e8f4f0 100%)' }}
      >
        {/* Welcome Screen */}
        {!conversationStarted && (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-8 leading-relaxed">
              Hello, I'm Street Support Network's assistant! How can I help you today?
            </h1>
            <div className="flex flex-col gap-4 w-full max-w-sm">
              {conversationStarters.map((label, index) => (
                <button
                  key={index}
                  onClick={handleStarterClick}
                  disabled={isLoading}
                  className="px-6 py-4 text-base font-semibold border-2 border-gray-300 rounded-xl bg-white text-gray-800 hover:border-ss-accent hover:text-ss-accent hover:shadow-md transition-all text-left disabled:opacity-50 shadow-sm"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {conversationStarted && (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isLastMessage = index === messages.length - 1;
              
              return (
                <div 
                  key={index} 
                  ref={isLastMessage ? lastMessageRef : null}
                >
                  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[95%] rounded-xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-ss-secondary text-white shadow-md'
                        : 'bg-white text-gray-800 shadow-md border border-gray-200'
                    }`}>
                      {message.role === 'assistant' 
                        ? renderMessageContent(message.content)
                        : <p className="text-sm font-medium">{message.content}</p>
                      }
                    </div>
                  </div>

                  {/* Quick Replies */}
                  {message.role === 'assistant' && 
                   message.quickReplies && 
                   message.quickReplies.length > 0 && 
                   isLastMessage && 
                   !sessionEnded && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {message.quickReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickReply(reply)}
                          disabled={isLoading}
                          className="px-4 py-2.5 text-sm font-semibold border-2 border-gray-300 rounded-full bg-white text-gray-800 hover:border-ss-accent hover:text-ss-accent hover:shadow-md transition-all disabled:opacity-50 shadow-sm"
                        >
                          {reply.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-xl px-4 py-3 shadow-md border border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-ss-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-ss-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-ss-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Session Ended */}
      {sessionEnded && (
        <div className="px-4 py-3 bg-gray-100 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-700 font-medium">
            This conversation has ended.{' '}
            <button onClick={handleRestart} className="text-ss-accent hover:underline font-bold">
              Start a new conversation
            </button>
          </p>
        </div>
      )}

      {/* Input */}
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
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-ss-accent focus:ring-2 focus:ring-ss-accent/20 disabled:bg-gray-50 disabled:text-gray-400 text-gray-800 font-medium"
            />
            <button
              type="submit"
              disabled={!inputValue?.trim() || isLoading || sessionEnded}
              className="p-2.5 bg-ss-accent text-white rounded-xl hover:bg-ss-primary disabled:bg-gray-300 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
