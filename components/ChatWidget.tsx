'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      sendMessage('hi');
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text }),
      });
      const data = await res.json();
      if (data.sessionId) setSessionId(data.sessionId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Call Shelter on 0808 800 4444.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-[480px] h-[640px] max-h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden z-50">
      <div className="bg-ss-primary text-white px-4 py-3 flex justify-between items-center">
        <h2 className="font-semibold">Street Support Network's Assistant</h2>
        <button onClick={onClose} className="hover:bg-ss-accent rounded p-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-ss-bg chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-ss-secondary text-white' : 'bg-white text-ss-text shadow'}`}>
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg px-4 py-3 shadow">
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

      <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="p-3 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type something..."
            disabled={loading}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-ss-accent"
          />
          <button type="submit" disabled={loading || !input.trim()} className="text-ss-accent disabled:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
