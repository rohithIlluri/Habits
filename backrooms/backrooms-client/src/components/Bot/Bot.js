import React, { useState, useEffect } from 'react';
import socket from './socket';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const Bot = () => {
  const [messages, setMessages] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]); // For system logs
  const [input, setInput] = useState('');

  useEffect(() => {
    // Connect the socket if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // Listen for bot responses
    socket.on('bot-response', (response) => {
      console.log('New bot response:', response);
      setMessages((prevMessages) => [...prevMessages, response]);
    });

    // Listen for system logs
    socket.on('system-log', (log) => {
      setSystemLogs((prevLogs) => [...prevLogs, log]);
    });

    // Clean up event listeners on component unmount
    return () => {
      socket.off('bot-response');
      socket.off('system-log');
    };
  }, []);

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
        <a
          href="https://github.com/rohithIlluri"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
        >
          <FaGithub className="social-icon" />
        </a>
        <a
          href="https://www.linkedin.com/in/sree-naga-rohith-reddy-illuri-99258a1ab/"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
        >
          <FaLinkedin className="social-icon" />
        </a>
      </div>

      {/* Bot Title */}
      <div className="bot-title">Terminal_of_Bully</div>

      {/* System Log */}
      <div className="system-log">
        <h3>System Log</h3>
        <ul>
          {systemLogs.map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>
      </div>

      {/* Chat Box */}
      <div className="bot-chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`bot-chat-message ${
              msg.sender === 'User' ? 'user-message' : 'bot-message'
            }`}
          >
            <span className="message-sender">
              {msg.sender === 'User' ? 'User' : 'Terminal_of_Bully'}:
            </span>{' '}
            {msg.text}
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
