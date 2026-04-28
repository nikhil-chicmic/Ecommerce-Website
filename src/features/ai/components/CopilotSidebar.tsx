import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Sparkles, X, Send, BrainCircuit, ChevronRight, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RootState } from '../../../store';
import { addChatMessage, toggleCopilot, setReasoning } from '../store/aiSlice';
import { useCart } from '../../cart/hooks/useCart';
import { geminiService } from '../services/geminiService';
import './Copilot.css';

export const CopilotSidebar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen: isCartOpen } = useCart();
  const { isCopilotVisible, chatHistory, activeReasoning, context } = useSelector((state: RootState) => state.ai);
  
  // Logic to only show on home, product details, and categories, and NOT when cart is open
  const shouldShow = (
    location.pathname === '/' || 
    location.pathname.startsWith('/product/') || 
    location.pathname.startsWith('/category/')
  ) && !isCartOpen;
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-open logic (only once per session)
  useEffect(() => {
    const hasAutoOpened = sessionStorage.getItem('copilot_auto_opened');
    if (!hasAutoOpened && shouldShow && !isCopilotVisible) {
      // Small delay for premium feel
      const timer = setTimeout(() => {
        dispatch(toggleCopilot());
        sessionStorage.setItem('copilot_auto_opened', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Auto-close if we navigate to a restricted page OR if cart opens
    if (!shouldShow && isCopilotVisible) {
      dispatch(toggleCopilot());
    }
  }, [location.pathname, shouldShow, isCopilotVisible, isCartOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  if (!shouldShow) return null;

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userQuery = input;
    setInput('');
    dispatch(addChatMessage({ role: 'user', content: userQuery }));
    setIsTyping(true);
    dispatch(setReasoning('Analyzing session behavior and intent...'));

    try {
      console.log('AI STRATEGIST: Initiating intent analysis for query:', userQuery);
      const response = await geminiService.processCoPilotQuery(userQuery, {
        viewedProductIds: context.viewedProductIds,
        cartItems: [], 
        lastSearch: context.lastSearchQueries[context.lastSearchQueries.length - 1] || '',
      }, chatHistory);

      console.log('AI STRATEGIST: Analysis complete. Intent:', response.intent);
      dispatch(setReasoning(response.reasoning || null));
      await new Promise(r => setTimeout(r, 500)); 
      
      dispatch(addChatMessage({ 
        role: 'model', 
        content: response.text,
        suggestedProducts: response.suggestedProducts // We'll update the slice to support this
      }));
      
    } catch (error) {
      console.error('AI STRATEGIST: Critical loop failure:', error);
      dispatch(addChatMessage({ role: 'model', content: "I encountered a synchronization error. Please try again." }));
    } finally {
      setIsTyping(false);
      dispatch(setReasoning(null));
    }
  };

  if (!isCopilotVisible) {
    return (
      <button 
        className="copilot-launcher" 
        onClick={() => dispatch(toggleCopilot())}
      >
        <Sparkles size={24} />
      </button>
    );
  }

  return (
    <div className="copilot-overlay" onClick={() => dispatch(toggleCopilot())}>
      <div className="copilot-panel" onClick={(e) => e.stopPropagation()}>
        <div className="copilot-header">
          <div className="copilot-brand">
            <BrainCircuit className="brand-icon" />
            <div>
              <h3>Lumina Concierge</h3>
              <span className="status">Personal Shopper Online</span>
            </div>
          </div>
          <button className="close-btn" onClick={() => dispatch(toggleCopilot())}>
            <X size={20} />
          </button>
        </div>

      <div className="copilot-chat-area">
        <div className="chat-messages-container">
          <div ref={chatEndRef} />
          
          {isTyping && (
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          )}

          {activeReasoning && (
            <div className="reasoning-indicator">
              <Zap size={14} className="pulse" />
              <span>{activeReasoning}</span>
            </div>
          )}

          {[...chatHistory].reverse().map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                <div className="message-bubble">{msg.content}</div>
                
                {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                  <div className="chat-suggestions-grid">
                    {msg.suggestedProducts.map((product: any) => (
                      <div key={product.id} className="mini-product-card ai-glass-panel">
                        <img src={product.thumbnail} alt={product.title} />
                        <div className="mini-info">
                          <div className="mini-title">{product.title}</div>
                          <div className="mini-price">${product.price}</div>
                          <button className="btn-mini-action" onClick={() => {
    navigate(`/product/${product.id}`);
    dispatch(toggleCopilot());
  }}>View Details</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
          ))}

          {chatHistory.length === 0 && (
            <div className="welcome-area">
              <h2>Lumina Concierge</h2>
              <p>I'm your persistent commerce strategist. I remember your journey through Lumina and simplify every decision.</p>
              <div className="quick-suggestions">
                <button onClick={() => setInput('Find premium gym gear under 5k')}>
                  "Premium gym gear under 5k" <ChevronRight size={14} />
                </button>
                <button onClick={() => setInput('What fits my style based on views?')}>
                  "What fits my style based on views?" <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="copilot-input-area">
        <input 
          type="text" 
          placeholder="Ask anything..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={!input.trim() || isTyping}>
          <Send size={18} />
        </button>
      </div>
      </div>
    </div>
  );
};
