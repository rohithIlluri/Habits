import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './Room.css';

const socket = io('http://localhost:4000');

const Room = () => {
  const [context, setContext] = useState('');
  const [messages, setMessages] = useState([]);
  const [newContext, setNewContext] = useState('');

  useEffect(() => {
    socket.on('roomData', (data) => {
      setContext(data.context);
      setMessages(data.messages);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const updateContext = () => {
    if (newContext.trim()) {
      socket.emit('updateContext', newContext);
      setNewContext('');
    }
  };

  const startBots = () => {
    socket.emit('startBots');
  };

  return (
    <div className="room-container">
      <h1>Backrooms Chat</h1>
      <div className="context-section">
        <h2>Context</h2>
        <p>{context}</p>
        <input
          type="text"
          value={newContext}
          onChange={(e) => setNewContext(e.target.value)}
          placeholder="Update the context"
        />
        <button onClick={updateContext}>Update Context</button>
        <button onClick={startBots}>Start Bots</button>
      </div>
      <div className="chat-box">
        <h2>Messages</h2>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender === 'Bot A' ? 'bot-a' : 'bot-b'}`}
          >
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Room;
