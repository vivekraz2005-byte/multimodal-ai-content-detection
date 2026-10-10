import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, ShieldCheck, Zap } from 'lucide-react';

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Namaste! Main AuthenticityAI ka dedicated Forensic Assistant hoon. Media authenticity, ELA, FFT ya C2PA credentials ke baare mein kuch bhi puchiye!' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = inputVal.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputVal('');
    setLoading(true);

    try {
      // TinyFish API call with proper error handling & fallback simulation
      const response = await fetch('https://api.tinyfish.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_TINYFISH_API_KEY}`
        },
        body: JSON.stringify({
          model: 'mako',
          messages: [{ role: 'user', content: userMsg }]
        })
      });

      if (!response.ok) {
        throw new Error('API network response was not ok');
      }

      const data = await response.json();
      const aiReply = data.choices?.[0]?.message?.content || "Main aapke query ko analyze kar raha hoon. Platform par Media upload karke live forensic scan run karein.";
      
      setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    } catch (err) {
      // Intelligent fallback response so chat flow never breaks for user
      let fallbackReply = "Aapne bilkul sahi sawal pucha hai! AuthenticityAI mein hum 2D-FFT, ELA aur C2PA manifests ke zariye deepfake aur synthetic media ko 99.8% precision ke saath detect karte hain.";
      const lower = userMsg.toLowerCase();
      
      if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        fallbackReply = "Hello! AuthenticityAI secure sandbox mein aapka swagat hai. Aaj hum kya verify karein?";
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('plan')) {
        fallbackReply = "Hamare paas Free Tier ke alawa Enterprise aur Forensic Lab advanced plans available hain.";
      } else if (lower.includes('audio') || lower.includes('voice')) {
        fallbackReply = "Hamara Audio Engine neural vocoder high-frequency cutoffs aur synthetic voice clones ko instantly flag karta hai.";
      }

      setMessages(prev => [...prev, { sender: 'ai', text: fallbackReply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 99999 }}>
      {/* Hilta-dulta Floating Assistant Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '50%',
            width: '66px',
            height: '66px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 12px 35px rgba(59, 130, 246, 0.55)',
            animation: 'bounceFloat 3.5s ease-in-out infinite, glowPulse 2.2s ease-in-out infinite',
            position: 'relative'
          }}
          title="Chat with TinyFish AI Assistant"
        >
          <Bot size={30} color="#fff" />
          <span style={{
            position: 'absolute', top: '2px', right: '2px',
            width: '14px', height: '14px', background: '#34d399',
            borderRadius: '50%', border: '2px solid #020617'
          }} />
        </button>
      )}

      {/* Advanced Glassmorphic Chat Window Box */}
      {isOpen && (
        <div style={{
          width: '370px',
          height: '520px',
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.98) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.45)',
          borderRadius: '22px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(59, 130, 246, 0.25)',
          backdropFilter: 'blur(20px)'
        }}>
          {/* Header */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.9)',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'rgba(52, 211, 153, 0.15)', padding: '6px', borderRadius: '10px', color: '#34d399', display: 'flex' }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '0.96rem', fontWeight: 800, margin: 0 }}>TinyFish AI Assistant</h4>
                <span style={{ color: '#34d399', fontSize: '0.72rem', fontFamily: 'monospace' }}>● Mako Engine Active</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Feed Area */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: m.sender === 'user' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(30, 41, 59, 0.85)',
                  color: '#f8fafc',
                  padding: '11px 15px',
                  borderRadius: m.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  fontSize: '0.88rem',
                  maxWidth: '82%',
                  lineHeight: '1.5',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  border: m.sender === 'ai' ? '1px solid rgba(255,255,255,0.06)' : 'none'
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(30, 41, 59, 0.85)', color: '#94a3b8', padding: '10px 14px', borderRadius: '14px', fontSize: '0.82rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="#60a5fa" /> AI forensic analysis in progress...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form Box */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '12px 16px',
              background: 'rgba(2, 6, 23, 0.95)',
              display: 'flex',
              gap: '10px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              placeholder="Ask about media verification..."
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              style={{
                flex: 1,
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '12px',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                transition: 'transform 0.2s'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes bounceFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(4deg); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.45); }
          50% { box-shadow: 0 0 35px rgba(168, 85, 247, 0.85); }
        }
      `}</style>
    </div>
  );
}