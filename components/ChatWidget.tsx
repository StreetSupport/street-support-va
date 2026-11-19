'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { ServiceCard } from '@/lib/types';

// ============================================================
// SSN BRAND COLORS (Official)
// ============================================================
const SSN_COLORS = {
  primary: '#236c58',      // Main brand green (6.25:1 with white, WCAG AA for text)
  primaryDark: '#2d8a70',  // Not for text: 4.25:1 on white fails AA. Use primary.
  mint: '#b0dccf',         // Light teal
  yellow: '#ffec83',       // Yellow (solid badges)
  purple: '#5f3f77',       // Purple (solid badges)
  text: '#333333',
  grayBorder: '#dedede',
  grayLight: '#f5f5f5',
  inputBorder: '#767676',  // 4.54:1 on white, meets 3:1 for control boundaries
};

// Stable id for the launcher button, so focus can return to it after close
// (ChatLauncher unmounts while the widget is open).
const LAUNCHER_ID = 'ssn-va-launcher';

// Visible keyboard focus ring (2px, 3:1). 'ss-primary' is #236c58 in tailwind.config.js.
const FOCUS_RING = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ss-primary';
// White ring for controls sitting on the green header
const FOCUS_RING_ON_PRIMARY = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

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
        <a key={`url-${match.index}`} href={matchedText} target="_blank" rel="noopener noreferrer" 
           className={`font-medium underline break-all rounded-sm ${FOCUS_RING}`} style={{ color: SSN_COLORS.primary }}>
          {matchedText}
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      );
    } else {
      parts.push(
        <a key={`phone-${match.index}`} href={`tel:${matchedText.replace(/[\s-]/g, '')}`} 
           className={`font-semibold underline rounded-sm ${FOCUS_RING}`} style={{ color: SSN_COLORS.primary }}>
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

function stripInstructionsAndOptions(text: string, optionLabels: string[] = []): string {
  if (!text) return '';
  
  const numberedLineRegex = /^\d+[.)]\s*(.+)$/;
  const optionSet = new Set(optionLabels.map(label => label.trim().toLowerCase()));
  const lines = text.split('\n');
  // If the message has exactly as many numbered lines as there are quick-reply
  // options, they are the option list and are all removed. Otherwise only lines
  // that repeat a quick-reply label are removed.
  const numberedCount = lines.filter(l => numberedLineRegex.test(l.trim())).length;
  const numberedAreOptionList = optionLabels.length > 0 && numberedCount === optionLabels.length;
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
    
    const numbered = numberedLineRegex.exec(line.trim());
    if (numbered && (numberedAreOptionList || optionSet.has(numbered[1].trim().toLowerCase()))) {
      continue;
    }
    
    cleanedLines.push(line);
  }
  
  return cleanedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// ============================================================
// SECTION HEADER CONFIG (single source of truth)
// ============================================================

const SECTION_HEADERS: Record<string, string> = {
  'YOUR FIRST STEP': 'Your First Step',
  'OUTREACH SUPPORT': 'Outreach Support',
  'LOCAL SUPPORT': 'Local Support',
  'SPECIALIST SUPPORT': 'Specialist Support',
  "YOUNG PEOPLE'S SUPPORT": "Young People's Support",
  'IMPORTANT FOR YOUNG PEOPLE': "Young People's Support",
  'IF YOU NEED MORE HELP': 'Additional Support',
  'LOCAL SERVICES': 'Local Services',
  'NATIONAL RESOURCES': 'National Resources',
  'FIND MORE SERVICES': 'More Services',
  // Crisis exit headers
  'CRISIS SUPPORT': 'Crisis Support',
  'SPECIALIST HELPLINE': 'Specialist Helpline',
  'LOCAL COUNCIL': 'Local Council',
  'HOUSING ADVICE': 'Housing Advice',
  'MENTAL HEALTH SUPPORT': 'Mental Health Support',
  "CHILDREN'S SERVICES": "Children's Services",
  'EMERGENCY HOUSING': 'Emergency Housing',
  'ADDITIONAL SUPPORT': 'Additional Support',
  'SOMEONE TO TALK TO': 'Someone To Talk To',
  'NHS MENTAL HEALTH SUPPORT': 'NHS Mental Health',
  'MIND INFOLINE': 'Mind Infoline',
  'DOMESTIC ABUSE SUPPORT': 'Domestic Abuse Support',
  'SEXUAL VIOLENCE SUPPORT': 'Sexual Violence Support',
};

const sectionHeaderKeys = Object.keys(SECTION_HEADERS);

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
    text.includes('found some services') ||
    sectionHeaderKeys.some(h => text.includes(h));
    
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
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for outro separator FIRST (before skipping generic dash lines)
    if (trimmed === '---') {
      if (currentService?.name) {
        services.push(currentService as ServiceCard);
        currentService = null;
      }
      collectingOutro = true;
      continue;
    }

    // Skip other dash-only lines (visual separators)
    if (/^-+$/.test(trimmed)) continue;

    const isHeader = trimmed in SECTION_HEADERS;
    
    if (isHeader) {
      if (currentService?.name) {
        services.push(currentService as ServiceCard);
      }
      
      currentCategory = trimmed;
      currentService = null;
      reachedFirstSection = true;
      
      // Special handling for "IF YOU NEED MORE HELP" - create Shelter Helpline card immediately
      if (trimmed === 'IF YOU NEED MORE HELP') {
        currentService = {
          name: 'Shelter Helpline',
          category: currentCategory,
          isVerified: false,
          isDropIn: false,
          website: 'https://england.shelter.org.uk/housing_advice/homelessness'
        };
      }
      continue;
    }
    
    if (!reachedFirstSection && trimmed) {
      intro += line + '\n';
      continue;
    }
    
    if (!trimmed) continue;
    
    if (collectingOutro) {
      outro += line + '\n';
      continue;
    }
    
    // For "IF YOU NEED MORE HELP" section - all content goes to description
    if (currentCategory === 'IF YOU NEED MORE HELP' && currentService) {
      // Detect outro text - "You've taken..." starts the closing message
      if (trimmed.toLowerCase().startsWith("you've taken") || 
          trimmed.toLowerCase().startsWith("you have taken")) {
        // Save current service and switch to outro collection
        if (currentService?.name) {
          services.push(currentService as ServiceCard);
          currentService = null;
        }
        collectingOutro = true;
        outro += line + '\n';
        continue;
      }
      
      if (trimmed.startsWith('http')) {
        // Don't overwrite our pre-set homelessness advice URL
        if (!currentService.website) {
          currentService.website = trimmed;
        }
      } else if (/^0\d/.test(trimmed) || trimmed.includes('(free')) {
        currentService.phone = trimmed;
      } else if (trimmed.toLowerCase() === 'shelter') {
        // Skip standalone "Shelter" line - we already have the title
        continue;
      } else {
        // All other text is description
        if (currentService.description) {
          currentService.description += ' ' + trimmed;
        } else {
          currentService.description = trimmed;
        }
      }
      continue;
    }
    
    // Standard parsing for other sections
    const looksLikeOrgName = 
      !trimmed.startsWith('http') && 
      !trimmed.startsWith('0') && 
      !trimmed.includes('(free') &&
      // Exclude description-like patterns
      !trimmed.toLowerCase().startsWith('they ') &&
      !trimmed.toLowerCase().startsWith('this ') &&
      !trimmed.toLowerCase().startsWith('if ') &&
      !trimmed.toLowerCase().startsWith('contact ') &&
      !trimmed.toLowerCase().startsWith('explain ') &&
      !trimmed.toLowerCase().startsWith('let ') &&
      !trimmed.toLowerCase().startsWith('ask ') &&
      !trimmed.toLowerCase().startsWith('drop-in') &&
      !trimmed.toLowerCase().startsWith('specialist ') &&
      !trimmed.toLowerCase().startsWith('support for') &&
      !trimmed.toLowerCase().startsWith('for ') &&
      !trimmed.toLowerCase().startsWith('24/') &&
      !trimmed.toLowerCase().startsWith('24 hour') &&
      !trimmed.toLowerCase().startsWith('expert') &&
      !trimmed.toLowerCase().startsWith('free ') &&
      !trimmed.toLowerCase().startsWith('information') &&
      !trimmed.toLowerCase().startsWith('you can') &&
      !trimmed.toLowerCase().startsWith('young people') &&
      !trimmed.toLowerCase().startsWith('once you') &&
      !trimmed.toLowerCase().startsWith('out of hours') &&
      trimmed.length < 80 &&
      (trimmed.includes('Council') || 
       trimmed.includes('Shelter') || 
       trimmed.includes('P3') || 
       trimmed.includes('Navigator') ||
       trimmed.includes('Streetlink') ||
       trimmed.includes('Outreach') ||
       trimmed.includes('Support') ||
       trimmed.includes('Service') ||
       trimmed.includes('Team') ||
       trimmed.includes('Helpline') ||
       trimmed.includes('Centre') ||
       trimmed.includes('Hub') ||
       /^[A-Z]/.test(trimmed));
    
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
    } else if (looksLikeOrgName && currentService.phone) {
      services.push(currentService as ServiceCard);
      currentService = { 
        name: trimmed, 
        category: currentCategory,
        isDropIn: currentCategory === 'LOCAL SUPPORT',
        isVerified: currentCategory === 'YOUR FIRST STEP'
      };
    } else {
      if (currentService.description) {
        currentService.description += ' ' + trimmed;
      } else {
        currentService.description = trimmed;
      }
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
// SERVICE CARD - Clean white style matching website
// ============================================================

function ServiceCardComponent({ service }: { service: ServiceCard }) {
  return (
    <div 
      className="rounded-lg p-4 mb-3 bg-white"
      style={{ border: `1px solid ${SSN_COLORS.grayBorder}` }}
    >
      {/* Top badges row */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Verified badge - green outline style like website */}
        {service.isVerified && (
          <span 
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
            style={{ 
              backgroundColor: '#e8f5e9',
              color: '#256b29', // 5.81:1 on #e8f5e9 (was #2e7d32, 4.56:1)
              border: '1px solid #4caf50'
            }}
          >
            <svg aria-hidden="true" className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Start Here
          </span>
        )}
        
        {/* Drop-in badge - gray outline like website categories */}
        {service.isDropIn && (
          <span 
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: 'white',
              color: SSN_COLORS.text,
              border: `1px solid ${SSN_COLORS.grayBorder}`
            }}
          >
            Drop-in
          </span>
        )}
        
        {/* Category badge - solid purple like website service tags */}
        <span 
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: SSN_COLORS.purple }}
        >
          {SECTION_HEADERS[service.category] || service.category}
        </span>
      </div>
      
      {/* Org name - larger, bolder for readability */}
      <h3 className="font-bold text-base mb-3" style={{ color: SSN_COLORS.text }}>
        {service.name}
      </h3>
      
      {/* Contact details - clear tappable buttons */}
      <div className="space-y-2 mb-3">
        {service.phone && (
          <a 
            href={`tel:${service.phone.replace(/[^\d+]/g, '')}`} 
            className={`flex items-center min-h-[44px] font-semibold text-sm bg-white rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50 ${FOCUS_RING}`}
            style={{ color: SSN_COLORS.primary, border: `1px solid ${SSN_COLORS.grayBorder}` }}
          >
            <svg aria-hidden="true" className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className={`flex items-center min-h-[44px] font-medium text-sm bg-white rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50 ${FOCUS_RING}`}
            style={{ color: SSN_COLORS.primary, border: `1px solid ${SSN_COLORS.grayBorder}` }}
          >
            <svg aria-hidden="true" className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>{service.name} website</span>
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        )}
      </div>
      
      {/* Description - good line height for readability */}
      {service.description && (
        <p className="text-sm leading-relaxed" style={{ color: '#555555' }}>
          {service.description}
        </p>
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
  const [, setLocationMode] = useState<'none' | 'geolocation' | 'postcode'>('none');
  const [awaitingPostcode, setAwaitingPostcode] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const latestAssistantRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
  const wasLoadingRef = useRef(false);

  useEffect(() => {
    if (lastMessageRef.current && messagesContainerRef.current) {
      setTimeout(() => {
        const reduceMotion = typeof window !== 'undefined' &&
          window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        lastMessageRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }, 100);
    }
  }, [messages]);

  // Focus trap: keep Tab cycling within the dialog while open
  const handleFocusTrap = useCallback((e: KeyboardEvent) => {
    if (!dialogRef.current) return;

    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key !== 'Tab') return;

    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    // Focus is on the dialog container itself, on <body>, or outside the dialog
    // (e.g. after a focused control was disabled or removed): wrap into the dialog.
    if (!active || active === dialogRef.current || !dialogRef.current.contains(active)) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
      return;
    }

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }, [onClose]);

  // Attach focus trap while open
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleFocusTrap);
    return () => document.removeEventListener('keydown', handleFocusTrap);
  }, [isOpen, handleFocusTrap]);

  // Manage focus on the open and close transitions only
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      const active = document.activeElement;
      triggerRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
      // Focus the input if a conversation is in progress, otherwise the dialog itself
      setTimeout(() => {
        if (inputRef.current && !inputRef.current.disabled) {
          inputRef.current.focus();
        } else {
          dialogRef.current?.focus();
        }
      }, 0);
    } else if (!isOpen && wasOpenRef.current) {
      // Return focus to the opener. The launcher unmounts while the widget is
      // open, so fall back to its stable id once it has re-rendered.
      const trigger = triggerRef.current;
      triggerRef.current = null;
      setTimeout(() => {
        const target = trigger?.isConnected ? trigger : document.getElementById(LAUNCHER_ID);
        target?.focus();
      }, 0);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  // After a reply arrives, move focus to the newest assistant message so a screen
  // reader reads all of it (including any phone numbers) before Tab reaches the
  // options. Fall back to the input, then the panel.
  useEffect(() => {
    const finishedLoading = wasLoadingRef.current && !isLoading;
    wasLoadingRef.current = isLoading;
    if (!finishedLoading || !isOpen) return;
    setTimeout(() => {
      if (latestAssistantRef.current) {
        latestAssistantRef.current.focus();
      } else if (inputRef.current && !inputRef.current.disabled) {
        inputRef.current.focus();
      } else {
        // Session ended or input unavailable: keep focus inside the dialog
        dialogRef.current?.focus();
      }
    }, 0);
  }, [isLoading, isOpen]);

  // ============================================================
  // LOCATION HANDLING
  // ============================================================

  const callLocationApi = async (data: { postcode?: string; latitude?: number; longitude?: number }) => {
    try {
      const response = await fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Location API failed');
      return await response.json();
    } catch (error) {
      console.error('Location API error:', error);
      return { success: false, error: 'Failed to detect location' };
    }
  };

  const sendLocationResult = async (locationData: {
    success: boolean;
    localAuthority?: string;
    latitude?: number;
    longitude?: number;
    isWMCA?: boolean;
    isScotland?: boolean;
    error?: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          s: sessionState, 
          message: '__LOCATION_RESULT__',
          locationData 
        }),
      });
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      
      if (data.s) setSessionState(data.s);
      setLocationMode('none');
      setAwaitingPostcode(false);
      addAssistantMessage(data);
    } catch (error) {
      console.error('Error sending location result:', error);
      addErrorMessage();
    }
    setIsLoading(false);
  };

  const requestGeolocation = async () => {
    if (!navigator.geolocation) {
      // Geolocation not supported - ask for postcode
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Your browser doesn't support location detection. Please enter your postcode instead.",
        timestamp: new Date().toISOString(),
      }]);
      setAwaitingPostcode(true);
      setLocationMode('postcode');
      return;
    }

    setIsLoading(true);
    setLocationMode('geolocation');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Call location API to reverse geocode
      const locationData = await callLocationApi({ latitude, longitude });
      
      if (locationData.success) {
        setMessages(prev => [...prev, {
          role: 'user',
          content: 'Location shared',
          timestamp: new Date().toISOString(),
        }]);
      }
      
      await sendLocationResult(locationData);
      
    } catch (error) {
      console.error('Geolocation error:', error);
      setIsLoading(false);
      setLocationMode('none');
      
      // Geolocation failed - ask for postcode
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I couldn't get your location automatically. Could you please enter your postcode?",
        timestamp: new Date().toISOString(),
      }]);
      setAwaitingPostcode(true);
      setLocationMode('postcode');
    }
  };

  const handlePostcodeSubmit = async (postcode: string) => {
    setMessages(prev => [...prev, {
      role: 'user',
      content: postcode,
      timestamp: new Date().toISOString(),
    }]);
    
    setIsLoading(true);
    setInputValue('');
    
    const locationData = await callLocationApi({ postcode });
    await sendLocationResult(locationData);
  };

  // ============================================================
  // API CALLS
  // ============================================================

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

  const addAssistantMessage = (data: { m?: string; o?: string[]; e?: boolean; responseType?: string }) => {
    const quickReplies: QuickReply[] = Array.isArray(data.o) 
      ? data.o.map((opt: string, idx: number) => ({ label: opt, value: String(idx + 1) }))
      : [];

    const messageText = quickReplies.length > 0 
      ? stripInstructionsAndOptions(data.m || '', quickReplies.map(reply => reply.label))
      : (data.m || '');

    // Only add message if there's content
    if (messageText) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: messageText,
        timestamp: new Date().toISOString(),
        quickReplies,
      }]);
    }

    if (data.e) setSessionEnded(true);
    
    // Handle special response types
    if (data.responseType === 'request_geolocation') {
      // Automatically trigger geolocation request
      requestGeolocation();
    } else if (data.responseType === 'postcode_input') {
      setAwaitingPostcode(true);
      setLocationMode('postcode');
    }
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
    if (!inputValue?.trim()) return;
    
    // If awaiting postcode, handle specially
    if (awaitingPostcode) {
      handlePostcodeSubmit(inputValue.trim());
      return;
    }
    
    sendMessage(inputValue);
  };

  const handleQuickReply = async (reply: QuickReply) => {
    if (!reply?.value || isLoading || sessionEnded) return;
    
    // Reset postcode mode when selecting quick reply
    setAwaitingPostcode(false);
    setLocationMode('none');

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

  const handleStarterClick = () => { void sendMessage('hi', true); };

  const handleRestart = () => {
    setMessages([]);
    setSessionState(null);
    setSessionEnded(false);
    setConversationStarted(false);
    setLocationMode('none');
    setAwaitingPostcode(false);
  };

  const renderMessageContent = (content: string) => {
    const parsed = parseServiceContent(content);
    
    if (parsed.isServiceResponse && parsed.services.length > 0) {
      return (
        <div className="space-y-3">
          {parsed.intro && (
            <p className="text-sm leading-relaxed mb-4" style={{ color: SSN_COLORS.text }}>
              {parsed.intro}
            </p>
          )}
          
          <ul role="list" className="space-y-3">
            {parsed.services.map((service, idx) => (
              <li key={idx}>
                <ServiceCardComponent service={service} />
              </li>
            ))}
          </ul>
          
          {parsed.outro && (
            <p className="text-sm leading-relaxed mt-4 pt-3" style={{ color: '#555555', borderTop: `1px solid ${SSN_COLORS.grayBorder}` }}>
              {parsed.outro}
            </p>
          )}
        </div>
      );
    }
    
    return (
      <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: SSN_COLORS.text }}>
        <LinkifiedText text={content || ''} />
      </p>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Street Support assistant"
      tabIndex={-1}
      className="fixed inset-0 bg-white shadow-2xl flex flex-col overflow-hidden z-50 sm:inset-auto sm:bottom-4 sm:right-4 sm:w-full sm:max-w-[480px] sm:h-[640px] sm:max-h-[90vh] sm:rounded-xl"
      style={{ border: `1px solid ${SSN_COLORS.grayBorder}` }}
    >
      {/* Header - SSN teal */}
      <div 
        className="text-white px-4 py-3 flex items-center justify-between flex-shrink-0"
        style={{ backgroundColor: SSN_COLORS.primary }}
      >
        <h2 className="font-bold text-lg">Street Support Assistant</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRestart}
            className={`p-3 hover:bg-white/20 rounded-lg transition-colors ${FOCUS_RING_ON_PRIMARY}`}
            title="Start new conversation"
            aria-label="Start new conversation"
          >
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className={`p-3 hover:bg-white/20 rounded-lg transition-colors ${FOCUS_RING_ON_PRIMARY}`}
            title="Close"
            aria-label="Close assistant"
          >
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content - light gray background for contrast */}
      <div
        ref={messagesContainerRef}
        role="log"
        aria-live="polite"
        className="flex-1 overflow-y-auto p-4"
        style={{ backgroundColor: SSN_COLORS.grayLight }}
      >
        {/* Welcome Screen */}
        {!conversationStarted && (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <p className="text-2xl font-bold text-center mb-8 leading-relaxed" style={{ color: SSN_COLORS.text }}>
              Hello, I'm Street Support Network's assistant! How can I help you today?
            </p>
            <div className="flex flex-col gap-3 w-full max-w-sm">
              {conversationStarters.map((label, index) => (
                <button
                  key={index}
                  onClick={handleStarterClick}
                  disabled={isLoading}
                  className={`px-5 py-4 text-base font-semibold rounded-lg bg-white text-left disabled:opacity-50 shadow-sm hover:shadow-md transition-all ${FOCUS_RING}`}
                  style={{ 
                    color: SSN_COLORS.text, 
                    border: `1px solid ${SSN_COLORS.grayBorder}`,
                  }}
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
                    <div 
                      className={`max-w-[95%] rounded-xl px-4 py-3 ${
                        message.role === 'user' ? 'text-white' : ''
                      }`}
                      style={{
                        backgroundColor: message.role === 'user' ? SSN_COLORS.primary : 'white',
                        border: message.role === 'assistant' ? `1px solid ${SSN_COLORS.grayBorder}` : 'none',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                      }}
                    >
                      <div
                        id={`ssn-va-msg-${index}`}
                        ref={isLastMessage && message.role === 'assistant' ? latestAssistantRef : null}
                        tabIndex={message.role === 'assistant' ? -1 : undefined}
                        className={`relative rounded-sm ${FOCUS_RING}`}
                      >
                        <span className="sr-only">{message.role === 'user' ? 'You said: ' : 'Assistant: '}</span>
                        {message.role === 'assistant'
                          ? renderMessageContent(message.content)
                          : <p className="text-sm font-medium">{message.content}</p>
                        }
                      </div>
                    </div>
                  </div>

                  {/* Quick Replies - clean pill style */}
                  {message.role === 'assistant' && 
                   message.quickReplies && 
                   message.quickReplies.length > 0 && 
                   isLastMessage && 
                   !sessionEnded && (
                    <div
                      role="group"
                      aria-labelledby={`ssn-va-msg-${index}`}
                      className="mt-3 flex flex-wrap gap-2"
                    >
                      {message.quickReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => { void handleQuickReply(reply); }}
                          disabled={isLoading}
                          className={`min-h-[44px] px-4 py-2.5 text-sm font-semibold rounded-full bg-white disabled:opacity-50 shadow-sm hover:shadow-md transition-all ${FOCUS_RING}`}
                          style={{ 
                            color: SSN_COLORS.text, 
                            border: `1px solid ${SSN_COLORS.grayBorder}`,
                          }}
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
                <div 
                  className="bg-white rounded-xl px-4 py-3"
                  style={{ border: `1px solid ${SSN_COLORS.grayBorder}`, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                >
                  <span className="sr-only">Assistant is typing</span>
                  <div className="flex gap-1.5" aria-hidden="true">
                    <div className="w-2.5 h-2.5 rounded-full motion-safe:animate-bounce" style={{ backgroundColor: SSN_COLORS.primary, animationDelay: '0ms' }}></div>
                    <div className="w-2.5 h-2.5 rounded-full motion-safe:animate-bounce" style={{ backgroundColor: SSN_COLORS.primary, animationDelay: '150ms' }}></div>
                    <div className="w-2.5 h-2.5 rounded-full motion-safe:animate-bounce" style={{ backgroundColor: SSN_COLORS.primary, animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Session Ended */}
      {sessionEnded && (
        <div role="status" className="px-4 py-3 bg-gray-100 border-t border-gray-200 text-center">
          <p className="text-sm font-medium" style={{ color: '#555555' }}>
            This conversation has ended.{' '}
            <button 
              onClick={handleRestart} 
              className={`font-bold underline rounded-sm ${FOCUS_RING}`}
              style={{ color: SSN_COLORS.primary }}
            >
              Start a new conversation
            </button>
          </p>
        </div>
      )}

      {/* Input */}
      {conversationStarted && (
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t flex-shrink-0" style={{ borderColor: SSN_COLORS.grayBorder }}>
          {awaitingPostcode && !sessionEnded && (
            <p id="ssn-va-postcode-hint" className="text-sm font-medium mb-2" style={{ color: '#555555' }}>
              Enter your postcode, for example WV1 1AA
            </p>
          )}
          <div className="flex items-center gap-2">
            <label htmlFor="ssn-va-input" className="sr-only">
              {awaitingPostcode ? 'Postcode' : 'Message'}
            </label>
            <input
              ref={inputRef}
              id="ssn-va-input"
              type="text"
              autoComplete={awaitingPostcode ? 'postal-code' : 'off'}
              aria-describedby={awaitingPostcode && !sessionEnded ? 'ssn-va-postcode-hint' : undefined}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={sessionEnded ? 'Conversation ended' : awaitingPostcode ? 'Postcode' : 'Type a message...'}
              disabled={isLoading || sessionEnded}
              className={`flex-1 px-4 py-2.5 rounded-lg disabled:bg-gray-50 disabled:text-gray-400 font-medium ${FOCUS_RING}`}
              style={{ 
                color: SSN_COLORS.text, 
                border: `1px solid ${SSN_COLORS.inputBorder}`,
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = SSN_COLORS.primary}
              onBlur={(e) => e.currentTarget.style.borderColor = SSN_COLORS.inputBorder}
            />
            <button
              type="submit"
              disabled={!inputValue?.trim() || isLoading || sessionEnded}
              aria-label="Send message"
              className={`p-3 text-white rounded-lg disabled:bg-gray-300 transition-colors ${FOCUS_RING}`}
              style={{ backgroundColor: SSN_COLORS.primary }}
            >
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
