'use client';

import { useState, useEffect } from 'react';
import ChatWidget from '@/components/ChatWidget';
import ChatLauncher from '@/components/ChatLauncher';

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isChatOpen) {
        setShowGreeting(true);
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [isChatOpen]);

  const handleOpenChat = () => {
    setIsChatOpen(true);
    setShowGreeting(false);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-ss-primary rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-ss-text">Street Support Network</h1>
              <p className="text-gray-600">Virtual Assistant Demo</p>
            </div>
          </div>
          <p className="text-lg text-gray-700 mb-4">
            This is a demonstration of the Street Support Virtual Assistant.
          </p>
          <div className="mt-8 p-4 bg-ss-bg rounded-lg border-l-4 border-ss-primary">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Click the chat button in the bottom right corner to start.
            </p>
          </div>
        </div>
      </div>

      {showGreeting && !isChatOpen && (
        <div className="fixed bottom-20 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-40 cursor-pointer" onClick={handleOpenChat}>
          <p className="text-sm text-ss-text">I am Street Support's Virtual Assistant. How can I help?</p>
        </div>
      )}

      <ChatLauncher isOpen={isChatOpen} onClick={handleOpenChat} />
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} /
