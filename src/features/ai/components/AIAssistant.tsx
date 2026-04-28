import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { aiApi, type AIResponse } from '../api/aiApi';
import type { RootState } from '../../../store';
import '../styles/ai.css';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  suggestions?: any[];
}

export const AIAssistant: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: "Hi! I'm your Lumina Concierge. Tell me what you're looking for, and I'll find the best options for you!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history from Supabase on mount
  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.id) return;
      
      setIsInitialLoading(true);
      try {
        const history = await aiApi.getChatHistory(user.id);
        if (history && history.length > 0) {
          const formattedHistory: Message[] = history.map(h => ({
            id: h.id,
            sender: h.sender,
            text: h.message,
            suggestions: h.metadata?.products || []
          }));
          setMessages(formattedHistory);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setIsInitialLoading(false);
        setTimeout(scrollToBottom, 100);
      }
    };

    if (isOpen) {
      loadHistory();
    }
  }, [user, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await aiApi.processIntent(userMsg.text, user?.id);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.text,
        suggestions: response.suggestedProducts
      };

      // Special handling for 'order' intent
      if (response.intent === 'order') {
        botMsg.text += " \n\nYou can track all your recent orders in your profile section.";
      }

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'bot', text: "I'm having a bit of trouble syncing with the Lumina database. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="ai-assistant-wrapper">
      <div className={`ai-chat-window ${isOpen ? 'open' : ''}`}>
        <div className="ai-header">
          <div className="ai-header-brand">
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} color="white" />
            </div>
            <div>
              <h3>Lumina Concierge</h3>
              <p><span style={{ display: 'inline-block', width: '6px', height: '6px', background: 'var(--status-success)', borderRadius: '50%' }}></span> Online</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="ai-messages">
          {isInitialLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <Loader2 className="animate-spin" color="var(--brand-primary)" />
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className={`ai-msg ${msg.sender}`} style={msg.sender === 'bot' ? { display: 'flex', gap: '8px' } : {}}>
                  {msg.sender === 'bot' && (
                    <div style={{ width: '24px', height: '24px', background: 'var(--brand-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end', marginBottom: '-4px' }}>
                      <Bot size={14} color="white" />
                    </div>
                  )}
                  <div style={{ flex: 1, whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                </div>
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div style={{ marginTop: '8px', paddingLeft: msg.sender === 'bot' ? '32px' : '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {msg.suggestions.map(product => (
                      <div 
                        key={product.id} 
                        className="ai-suggestion-card"
                        onClick={() => navigate(`/product/${product.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img src={product.thumbnail} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{product.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 700 }}>${product.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          {isTyping && (
            <div className="ai-msg bot" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '24px', height: '24px', background: 'var(--brand-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={14} color="white" />
              </div>
              <div className="typing-indicator">
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="ai-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            className="ai-input" 
            placeholder="Search products or ask about orders..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping || isInitialLoading}
          />
          <button type="submit" className="ai-send-btn" disabled={!input.trim() || isTyping || isInitialLoading}>
            <Send size={16} />
          </button>
        </form>
      </div>

      <button className="ai-toggle-btn" onClick={() => setIsOpen(!isOpen)} title="Chat with Lumina Concierge">
        {isOpen ? <X size={28} /> : <Bot size={28} />}
      </button>
    </div>
  );
};
