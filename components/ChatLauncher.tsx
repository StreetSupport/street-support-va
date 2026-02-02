'use client';

import { useState, useEffect } from 'react';

// SSN Brand Color
const SSN_PRIMARY = '#38ae8e';

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
          className="relative rounded-lg px-5 py-4 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 max-w-[280px]"
          style={{
            backgroundColor: SSN_PRIMARY,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
          }}
          onClick={onClick}
        >
          <p className="text-white text-base font-medium leading-snug pr-12">
            I'm Street Support's Virtual Assistant. How can I help?
          </p>
          {/* Close button */}
          <button 
            className="absolute top-2 right-2 text-white/80 hover:text-white text-xs flex items-center gap-1 px-2 py-1"
            onClick={(e) => { e.stopPropagation(); setShowMessage(false); }}
          >
            × Close
          </button>
        </div>
      )}
      
      {/* Chat icon button */}
      <button
        onClick={onClick}
        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        style={{ backgroundColor: SSN_PRIMARY }}
        title="Chat with Street Support Assistant"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </div>
  );
}
