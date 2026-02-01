'use client';
import { useState, useRef, useEffect } from 'react';

interface Msg { role: 'user' | 'assistant'; content: string; }

export default function ChatWidget({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [s, setS] = useState('');
  const [ended, setEnded] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  
  useEffect(() => {
    if (isOpen && !initialized.current) {
      initialized.current = true;
      send('start', '');
    }
  }, [isOpen]);

  const send = async (text: string, currentS: string) => {
    if (loading || ended) return;
    if (text !== 'start') setMessages(p => [...p, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s: currentS, message: text }),
      });
      const data = await res.json();
      if (data.s) setS(data.s);
      if (data.e) setEnded(true);
      setMessages(p => [...p, { role: 'assistant', content: data.m }]);
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: 'Error. Call Shelter: 0808 800 4444' }]);
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) send(input, s);
  };

  const restart = () => {
    setMessages([]);
    setS('');
    setEnded(false);
    initialized.current = false;
    setTimeout(() => { initialized.current = true; send('start', ''); }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-[480px] h-[640px] max-h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col z-50">
      <div className="bg-[#339378] text-white px-4 py-3 flex justify-between items-center rounded-t-lg">
        <span className="font-semibold">Street Support Network's Assistant</span>
        <div className="flex gap-2">
          <button onClick={restart} className="p-1 hover:bg-[#086049] rounded text-lg" title="Restart">↻</button>
          <button onClick={onClose} className="p-1 hover:bg-[#086049] rounded text-lg">✕</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f5f5f5]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-4 py-2 ${m.role === 'user' ? 'bg-[#721b78] text-white' : 'bg-white text-gray-900 shadow'}`}>
              <pre className="whitespace-pre-wrap font-sans text-sm">{m.content}</pre>
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-500 text-sm">Thinking...</div>}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-3 border-t bg-white rounded-b-lg">
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder={ended ? 'Session ended' : 'Type a number...'} disabled={loading || ended} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
          <button type="submit" disabled={!input.trim() || loading || ended} className="px-4 py-2 bg-[#339378] text-white rounded-lg disabled:opacity-50 text-sm font-medium">Send</button>
        </div>
      </form>
    </div>
  );
}
