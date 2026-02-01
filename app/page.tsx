'use client';

import { useState } from 'react';
import ChatWidget from '@/components/ChatWidget';
import ChatLauncher from '@/components/ChatLauncher';

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Street Support Network</h1>
        <p className="text-gray-600 mb-4">Virtual Assistant Demo</p>
        <p className="text-sm text-gray-500">Click the chat button in the bottom right corner to start.</p>
      </div>

      <ChatLauncher isOpen={isChatOpen} onClick={() => setIsChatOpen(true)} />
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </main>
  );
}
