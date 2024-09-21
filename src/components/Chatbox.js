import React, { useState, useEffect } from 'react';

const Chatbox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Set the default message when the component mounts
    setMessages([{ ai: "Hello, I am the AI integrated by Aditya Zunder." }]);
  }, []);

  const handleChat = async (event) => {
    if (event.key === 'Enter' && input.trim() !== '') {
      const newMessages = [...messages, { user: input }];
      setMessages(newMessages);

      // Send the user message to the backend
      const response = await fetch('http://127.0.0.1:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      // Add AI response to messages
      if (data.response) {
        setMessages((prev) => [...prev, { ai: data.response }]);
      } else {
        setMessages((prev) => [...prev, { ai: "Error: " + data.error }]);
      }

      setInput('');
    }
  };

  return (
    <div className="ai-chatbox">
      <h3>Chatbox</h3>
      <div id="chatbox-messages">
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