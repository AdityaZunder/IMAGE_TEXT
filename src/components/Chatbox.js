import React, { useState, useEffect, useRef } from 'react';

const Chatbox = ({ summary }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatRef = useRef(null);

  useEffect(() => {
    setMessages([{ ai: "Hello, I am the AI integrated by Aditya Zunder." }]);
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (summary) {
      setMessages(prev => [...prev, { ai: summary }]); // Add summary to messages
    }
  }, [summary]); // This effect runs whenever the summary prop changes

  const handleChat = async (event) => {
    if (event.key === 'Enter' && input.trim() !== '') {
      const newMessages = [...messages, { user: input }];
      setMessages(newMessages);

      const response = await fetch('http://127.0.0.1:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      if (data.response) {
        setMessages(prev => [...prev, { ai: data.response }]);
      } else {
        setMessages(prev => [...prev, { ai: "Error: " + data.error }]);
      }

      setInput('');
    }
  };

  return (
    <div className="ai-chatbox">
      <h3>Chatbox</h3>
      <div id="chatbox-messages" ref={chatRef} style={{ overflowY: 'auto', maxHeight: '300px' }}>
        {messages.map((msg, index) => (
          <div key={index}>
            {msg.user && <div>User: {msg.user}</div>}
            {msg.ai && <div>AI: {msg.ai}</div>}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        placeholder="Ask a question..."
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleChat}
      />
    </div>
  );
};

export default Chatbox;