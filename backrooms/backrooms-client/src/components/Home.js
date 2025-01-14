// Home.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './Home.css';

const socket = io('http://localhost:4000');

const Home = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Listen for messages from the server
    socket.on('message', (data) => {
      console.log('New message:', data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Cleanup on component unmount
    return () => socket.disconnect();
  }, []);

  return (
    <div className="home-container">
      <h1>Bot Chat Room</h1>
      <div className="chat-box">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className="chat-message">
              <strong>{msg.sender}:</strong> {msg.text}
            </div>
          ))
        ) : (
          <p>No messages yet. Bots are preparing...</p>
        )}
      </div>
    </div>
  );
};

export default Home;
