import React, { useEffect, useRef, useState } from "react";
import "./ChatPage.css";
import { IoMdClose } from "react-icons/io";
import { BsCheck, BsCheckAll } from "react-icons/bs";
import format from "date-fns/format";
import isToday from "date-fns/isToday";
import isYesterday from "date-fns/isYesterday";
import SendMessage from "../SendMessage/SendMessage";

const ChatPage = ({
  selectedContact,
  setSelectedContact,
  chatHistory,
  loadingChat,
  cursorId,
  fetchOldChats,
}) => {
  const loginData = JSON.parse(sessionStorage.getItem("LoginData"));
  const username = loginData?.username;

  const chatRef = useRef(null);
  const messageEndRef = useRef(null);
  const prevMessageCount = useRef(0);
  const [chatInitialized, setChatInitialized] = useState(false);

  // Determine if user is near bottom
  const isUserNearBottom = () => {
    const el = chatRef.current;
    if (!el) return false;
    const threshold = 400; // px from bottom
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  const scrollToBottom = (smooth = true) => {
    messageEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  // On contact change, reset scroll flag
  useEffect(() => {
    if (!selectedContact) return;
    setChatInitialized(false);
  }, [selectedContact]);

  // On initial messages load after selecting contact
  useEffect(() => {
    if (!chatInitialized && chatHistory.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom(false); // instant scroll
        setChatInitialized(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [chatHistory, chatInitialized]);

  // Scroll on new message if user was at bottom
  useEffect(() => {
    if (!chatInitialized) return;

    const isNewMessage = chatHistory.length > prevMessageCount.current;
    prevMessageCount.current = chatHistory.length;

    const lastMessage = chatHistory[chatHistory.length - 1];
    const isFromMe = lastMessage?.sender === username;

    if (isNewMessage && (isUserNearBottom() || isFromMe)) {
      scrollToBottom();
    }
  }, [chatHistory]);

  // Infinite scroll for loading old messages
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (el.scrollTop === 0 && cursorId !== -1) {
        fetchOldChats?.();
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [cursorId, fetchOldChats]);

  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "dd MMM yyyy");
  };

  const formatTime = (dateStr) => format(new Date(dateStr), "hh:mm a");

  const getStatusIcon = (status) => {
    if (status === "SENT") return <BsCheck size={16} color="gray" />;
    if (status === "DELIVERED") return <BsCheckAll size={16} color="gray" />;
    if (status === "SEEN") return <BsCheckAll size={16} color="#007bff" />;
    return null;
  };

  if (loadingChat) return <div>Loading chat messages...</div>;

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-user-info">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              selectedContact.contactName
            )}&background=007bff&color=fff&rounded=true&size=42`}
            alt={selectedContact.contactName}
            className="contact-avatar"
          />
          <div className="chat-user-details">
            <span className="chat-user-name">
              {selectedContact.contactUsername === username
                ? `${selectedContact.contactName} (You)`
                : selectedContact.contactName}
              <span className="chat-user-status"> Online</span>
            </span>
            <span className="chat-username">
              {selectedContact.contactUsername}
            </span>
          </div>
        </div>
        <button
          className="chat-close-button"
          onClick={() => setSelectedContact(null)}
        >
          <IoMdClose size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="chat-history" ref={chatRef}>
        {(() => {
          let lastDate = null;
          return chatHistory.map((msg) => {
            const sentAt = msg.sentAt;
            const msgDate = sentAt.split("T")[0];
            const showDate = msgDate !== lastDate;
            lastDate = msgDate;
            const isMe = msg.sender === username;

            return (
              <React.Fragment key={msg.messageId}>
                {showDate && (
                  <div className="chat-date-separator">
                    {formatDateHeader(sentAt)}
                  </div>
                )}
                <div className={`chat-message ${isMe ? "sent" : "received"}`}>
                  <div className="chat-message-text">{msg.content}</div>
                  <div
                    className={`chat-message-time ${
                      isMe ? "chat-message-status" : ""
                    }`}
                  >
                    {formatTime(sentAt)} {isMe && getStatusIcon(msg.status)}
                  </div>
                </div>
              </React.Fragment>
            );
          });
        })()}
        <div ref={messageEndRef} />
      </div>

      {/* Message Input */}
      <SendMessage contactUsername={selectedContact.contactUsername} />
    </div>
  );
};

export default ChatPage;
