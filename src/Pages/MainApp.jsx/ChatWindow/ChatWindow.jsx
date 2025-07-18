import React from "react";
import "./ChatWindow.css";
import { FaSmile, FaPaperclip, FaPaperPlane } from "react-icons/fa";

// Dummy data with date, time, message, and sender
const dummyMessages = [
  {
    sender: "Alice",
    text: "Hi there!",
    time: "09:00 AM",
    date: "2025-07-14",
  },
  {
    sender: "me",
    text: "Hey! How are you?",
    time: "09:02 AM",
    date: "2025-07-14",
  },
  {
    sender: "Alice",
    text: "I'm good, just working on a project.",
    time: "09:05 AM",
    date: "2025-07-14",
  },
  {
    sender: "me",
    text: "Nice! Let me know if I can help.",
    time: "09:10 AM",
    date: "2025-07-14",
  },
  {
    sender: "Alice",
    text: "Will do. Thanks!",
    time: "09:15 AM",
    date: "2025-07-14",
  },
  {
    sender: "me",
    text: "See you tomorrow!",
    time: "06:00 PM",
    date: "2025-07-14",
  },
  {
    sender: "Alice",
    text: "Bye!",
    time: "06:05 PM",
    date: "2025-07-14",
  },
  {
    sender: "me",
    text: "Morning!",
    time: "08:15 AM",
    date: "2025-07-15",
  },
  {
    sender: "Alice",
    text: "Good morning!",
    time: "08:17 AM",
    date: "2025-07-15",
  },
];

const ChatWindow = () => {
  let lastDate = null;

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-user-info">
          <img
            src="https://via.placeholder.com/40"
            alt="Profile"
            className="chat-user-avatar"
          />
          <div className="chat-user-details">
            <span className="chat-user-name">Alice</span>
            <span className="chat-user-status">Online</span>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div className="chat-history">
        {dummyMessages.map((msg, index) => {
          const showDate = msg.date !== lastDate;
          lastDate = msg.date;

          return (
            <React.Fragment key={index}>
              {showDate && (
                <div className="chat-date-separator">
                  {new Date(msg.date).toDateString()}
                </div>
              )}
              <div
                className={`chat-message ${
                  msg.sender === "me" ? "sent" : "received"
                }`}
              >
                <div className="chat-message-text">{msg.text}</div>
                <div className="chat-message-time">{msg.time}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <button className="chat-icon-button">
          <FaSmile />
        </button>
        <input
          type="text"
          placeholder="Type your message..."
          className="chat-input"
        />
        <button className="chat-icon-button">
          <FaPaperclip />
        </button>
        <button className="chat-send-button">
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
