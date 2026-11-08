'use client';

import { useState, useEffect } from 'react';

// SSN Brand Color (6.25:1 with white, WCAG AA for text)
const SSN_PRIMARY = '#236c58';

// Stable id so ChatWidget can return focus here after close
const LAUNCHER_ID = 'ssn-va-launcher';

// Visible keyboard focus rings (2px, 3:1). 'ss-primary' is #236c58 in tailwind.config.js.
const FOCUS_RING = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ss-primary';
const FOCUS_RING_ON_PRIMARY = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

interface ChatLauncherProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function ChatLauncher({ isOpen, onClick }: ChatLauncherProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showMessage, setShowMessage] = useState(true);
  
  useEffect(() => {
    // Animate in after mount
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  // Hide launcher when chat is open
  if (isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end gap-3 z-40">
      {/* Teal message box - matches website style */}
      {showMessage && (
        <div 
          className="relative rounded-lg shadow-lg hover:shadow-xl motion-safe:transition-all motion-safe:duration-300 max-w-[280px]"
          style={{
            backgroundColor: SSN_PRIMARY,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          <button
            type="button"
            onClick={onClick}
            className={`block w-full text-left rounded-lg px-5 py-4 cursor-pointer ${FOCUS_RING}`}
          >
            <span className="block text-white text-base font-medium leading-snug pr-12">
              I'm Street Support's Virtual Assistant. How can I help?
            </span>
          </button>
          {/* Close button */}
          <button 
            type="button"
            className={`absolute top-1 right-1 min-h-[44px] text-white text-xs flex items-center gap-1 px-3 py-1 rounded-lg ${FOCUS_RING_ON_PRIMARY}`}
            onClick={(e) => { e.stopPropagation(); setShowMessage(false); }}
          >
            <span aria-hidden="true">×</span> Close<span className="sr-only"> message</span>
          </button>
        </div>
      )}
      
      {/* Chat icon button */}
      <button
        id={LAUNCHER_ID}
        type="button"
        onClick={onClick}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center motion-safe:hover:scale-105 motion-safe:transition-transform ${FOCUS_RING}`}
        style={{ backgroundColor: SSN_PRIMARY }}
        title="Chat with Street Support Assistant"
        aria-label="Open Street Support assistant"
      >
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </div>
  );
}
