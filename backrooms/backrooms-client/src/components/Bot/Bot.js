import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const Bot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socket = io('http://localhost:4000');

  useEffect(() => {
    socket.on('bot-response', (response) => {
      setMessages((prevMessages) => [...prevMessages, response]);
    });

    return () => socket.disconnect();
  }, [socket]);

  const sendMessage = () => {
    if (input.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'User', text: input },
      ]);
      socket.emit('user-message', { text: input });
      setInput('');
    }
  };

  return (
    <div className="bot-container">
      {/* Social Links Section */}
      <div className="social-links">
        <a href="https://github.com/rohithIlluri" target="_blank" rel="noopener noreferrer">
          <FaGithub className="social-icon" />
        </a>
        <a href="https://www.linkedin.com/in/sree-naga-rohith-reddy-illuri-99258a1ab/" target="_blank" rel="noopener noreferrer">
          <FaLinkedin className="social-icon" />
        </a>
      </div>

      {/* Bot Title */}
      <div className="bot-title">Bully</div>

      {/* Chat Box */}
      <div className="bot-chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`bot-chat-message ${
              msg.sender === 'User' ? 'user-message' : 'bot-message'
            }`}
          >
            <span className="message-sender">{msg.sender}:</span> {msg.text}
          </div>
        ))}
      </div>

      {/* Input Section */}
      <div className="bot-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="bot-input"
        />
        <button onClick={sendMessage} className="bot-send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default Bot;
