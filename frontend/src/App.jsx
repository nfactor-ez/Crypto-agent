import { useState, useRef, useEffect } from 'react';
import './index.css';

function App() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your Crypto AI Agent. Ask me about the latest crypto prices or anything else!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5005/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.reply || "Sorry, I didn't get a proper response." 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "Error: Could not connect to the backend server. Make sure the Node server is running on port 5005." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="ambient-glow"></div>
      <div className="ambient-glow-2"></div>
      
      <div className="chat-container">
        <div className="chat-header">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="url(#paint0_linear)" strokeWidth="2"/>
            <path d="M8 12L11 15L16 9" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="paint0_linear" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4facfe"/>
                <stop offset="1" stopColor="#00f2fe"/>
              </linearGradient>
            </defs>
          </svg>
          <div>
            <h1>Crypto AI MCP AGENT </h1>
            <p>Powered by LLaMA 3.3</p>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-bubble ${msg.role === 'user' ? 'message-user' : 'message-ai'}`}>
              {msg.content}
            </div>
          ))}
          {isTyping && (
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-wrapper">
          <input 
            type="text" 
            className="chat-input"
            placeholder="Ask about a crypto price e.g. 'What is the price of Solana?'" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="chat-send-btn" onClick={handleSend} aria-label="Send message">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
