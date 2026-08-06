import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Layout from '../components/Layout';
import { sendChatMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  sources?: string[];
}

const PROMPT_SUGGESTIONS = [
  'Ask me anything from your notes',
  'Try: explain B+ trees from my DBMS notes',
  'Summarize the key points of my OS chapter on deadlocks',
];

export default function Chat() {
  const { currentUser } = useAuth();
  const storageKey = `chatHistory:${currentUser?.uid ?? 'anonymous'}`;
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setMessages(saved ? JSON.parse(saved) : []);
    } catch {
      setMessages([]);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(text);
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: res.reply,
        sources: res.sources,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'Something went wrong. Please try again.';
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'error', content: detail },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Layout activePage="chat">
      <div className="flex flex-col h-full relative bg-background text-on-background">
        {/* Chat Canvas */}
        <div className="flex-1 overflow-y-auto px-4 pb-[140px] scroll-smooth">
          <div className="max-w-[900px] mx-auto flex flex-col gap-stack-lg py-stack-md">
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center text-center gap-4 py-24">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-text-primary">
                  Ask me anything from your notes
                </h2>
                <div className="flex flex-col gap-2 max-w-md w-full mt-2">
                  {PROMPT_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="px-4 py-2.5 bg-surface border border-border rounded-full font-label-sm text-label-sm text-on-surface-variant hover:border-primary hover:text-primary transition-colors shadow-soft text-left"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => {
              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end w-full group">
                    <div className="max-w-[75%] bg-primary text-white rounded-[16px] rounded-tr-sm px-5 py-4 shadow-soft whitespace-pre-wrap">
                      <p className="font-body-md text-body-md">{msg.content}</p>
                    </div>
                  </div>
                );
              }
              if (msg.role === 'error') {
                return (
                  <div key={msg.id} className="flex justify-start w-full">
                    <div className="max-w-[85%] bg-error-container/40 border border-error/30 text-on-error-container rounded-[16px] px-5 py-3">
                      <p className="font-body-md text-body-md text-error">{msg.content}</p>
                    </div>
                  </div>
                );
              }
              return (
                <div key={msg.id} className="flex justify-start w-full">
                  <div className="max-w-[85%] bg-surface rounded-[16px] rounded-tl-sm shadow-soft border-l-4 border-primary border-t border-r border-b border-border overflow-hidden">
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="bg-surface-container-lowest border-b border-border px-5 py-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">description</span>
                        <span className="font-label-sm text-label-sm text-text-muted">
                          Found in:{' '}
                          <span className="font-semibold text-on-surface">{msg.sources.join(', ')}</span>
                        </span>
                      </div>
                    )}
                    <div className="px-5 py-4">
                      <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start pl-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-[32px] border border-border shadow-soft">
                  <span className="material-symbols-outlined text-[16px] text-primary animate-pulse">search</span>
                  <span className="font-label-sm text-label-sm text-text-muted">Searching your notes...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>

        {/* Bottom Input Area (Glassmorphism) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface/80 backdrop-blur-xl border-t border-border/50">
          <div className="max-w-[900px] mx-auto relative">
            <div className="relative bg-surface rounded-[16px] shadow-soft border border-border focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all duration-200">
              <textarea
                className="w-full bg-transparent border-none rounded-[16px] pl-4 pr-16 py-3 resize-none font-body-md text-body-md text-on-surface placeholder-text-muted focus:ring-0"
                placeholder="Ask a question about your GATE notes..."
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    className="p-2 text-text-muted hover:text-primary transition-colors rounded-full hover:bg-surface-container-low disabled:opacity-50"
                    title="New chat"
                    type="button"
                    onClick={() => setMessages([])}
                    disabled={loading}
                  >
                    <span className="material-symbols-outlined">edit_square</span>
                  </button>
                )}
                <button
                  className="p-2 text-text-muted hover:text-primary transition-colors rounded-full hover:bg-surface-container-low"
                  title="Attach Document"
                  type="button"
                >
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                <button
                  className="w-10 h-10 bg-primary hover:bg-primary-container text-white rounded-lg flex items-center justify-center shadow-soft transition-colors shadow-hover disabled:opacity-50"
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  type="button"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="font-label-sm text-label-sm text-text-muted">
                my_assistant can make mistakes. Verify important formulas.
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
