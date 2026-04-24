import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { aiApi, type AIResponse } from '../api/aiApi';
import '../styles/ai.css';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  suggestions?: AIResponse['suggestedProducts'];
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: "Hi! I'm your AI Shopping Assistant. Tell me what you're looking for, and I'll find the best options for you!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await aiApi.processIntent(userMsg.text);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.text,
        suggestions: response.suggestedProducts
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'bot', text: 'Sorry, my neural net is a bit foggy right now. Try again?' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="ai-assistant-wrapper">
      <div className={`ai-chat-window ${isOpen ? 'open' : ''}`}>
        <div className="ai-header">
          <div className="ai-header-brand">
            <img src="/logo.png" alt="AIStore Logo" style={{ height: '24px', width: 'auto', borderRadius: '4px' }} />
            <div>
              <h3>AI Assistant</h3>
              <p><span style={{ display: 'inline-block', width: '6px', height: '6px', background: 'var(--status-success)', borderRadius: '50%' }}></span> Always Online</p>
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
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className={`ai-msg ${msg.sender}`} style={msg.sender === 'bot' ? { display: 'flex', gap: '8px' } : {}}>
                {msg.sender === 'bot' && (
                  <img src="/logo.png" alt="" style={{ width: '24px', height: '24px', borderRadius: '4px', alignSelf: 'flex-end', marginBottom: '-4px' }} />
                )}
                <div style={{ flex: 1 }}>{msg.text}</div>
              </div>
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div style={{ marginTop: '8px', paddingLeft: msg.sender === 'bot' ? '32px' : '0' }}>
                  {msg.suggestions.map(product => (
                    <div 
                      key={product.id} 
                      className="ai-suggestion-card"
                      onClick={() => navigate(`/product/${product.id}`)}
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
          ))}
          {isTyping && (
            <div className="ai-msg bot" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logo.png" alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
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
            placeholder="E.g., I need a cheap laptop..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />
          <button type="submit" className="ai-send-btn" disabled={!input.trim() || isTyping}>
            <Send size={16} />
          </button>
        </form>
      </div>

      <button className="ai-toggle-btn" onClick={() => setIsOpen(!isOpen)} title="Chat with AI">
        {isOpen ? <X size={28} /> : <Bot size={28} />}
      </button>
    </div>
  );
};
