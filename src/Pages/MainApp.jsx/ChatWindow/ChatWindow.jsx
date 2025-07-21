import React, { useEffect, useRef, useState } from "react";
import "./ChatWindow.css";
import { usePopup } from "../../GlobalFunctions/GlobalPopup/GlobalPopupContext";
import { useWebSocket } from "../../GlobalFunctions/GlobalWebsocket/WebSocketContext";
import { useApiClients } from "../../../Api/useApiClients";
import { FaSmile, FaPaperclip, FaPaperPlane } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import format from "date-fns/format";
import isToday from "date-fns/isToday";
import isYesterday from "date-fns/isYesterday";

const ChatWindow = ({ contact, setSelectedContact }) => {
  const { showPopup } = usePopup();
  const { messengerApi } = useApiClients();
  const { addMessageListener } = useWebSocket();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [myUsername, setMyUsername] = useState("");
  const [cursorId, setCursorId] = useState(0);
  const [seenIds, setSeenIds] = useState(new Set());
  const [loadingMore, setLoadingMore] = useState(false);

  const chatRef = useRef(null);
  const textareaRef = useRef(null);
  const seenIdsRef = useRef(seenIds);

  useEffect(() => {
    seenIdsRef.current = seenIds;
  }, [seenIds]);

  useEffect(() => {
    const loginData = JSON.parse(sessionStorage.getItem("LoginData"));
    if (loginData?.username) setMyUsername(loginData.username);
  }, []);

  useEffect(() => {
    if (!myUsername || !contact?.contactUsername) return;
    resetChat();
  }, [myUsername, contact]);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (el.scrollTop === 0 && !loadingMore && cursorId !== -1) {
        loadMessages(cursorId);
      }
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [cursorId, loadingMore]);

  useEffect(() => {
    if (!myUsername) return;

    const listener = (msg) => {
      const isSelfChat =
        msg.sender === myUsername && msg.receiver === myUsername;

      const isInCurrentChat =
        (msg.sender === contact.contactUsername &&
          msg.receiver === myUsername) ||
        (msg.sender === myUsername &&
          msg.receiver === contact.contactUsername) ||
        isSelfChat;

      if (isInCurrentChat && !seenIdsRef.current.has(msg.messageId)) {
        setSeenIds((prev) => new Set(prev).add(msg.messageId));
        setMessages((prev) => {
          const alreadyExists = prev.find((m) => m.messageId === msg.messageId);
          if (alreadyExists) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      }
    };

    const unsubscribe = addMessageListener(listener);
    return unsubscribe;
  }, [myUsername, contact]);

  const resetChat = async () => {
    setMessages([]);
    setCursorId(0);
    setSeenIds(new Set());
    await loadMessages(0);
  };

  const loadMessages = async (cursor) => {
    try {
      const el = chatRef.current;
      const prevScrollHeight = el?.scrollHeight || 0;

      setLoadingMore(true);
      const res = await messengerApi.post("/messenger/chat-history", {
        username: myUsername,
        contactUsername: contact.contactUsername,
        ...(cursor !== 0 && { cursorId: cursor }),
      });

      if (res.data.status === "0") {
        const newMsgs = res.data.chatHistory;
        setMessages((prev) => [...newMsgs, ...prev]);
        setSeenIds(
          (prev) => new Set([...prev, ...newMsgs.map((m) => m.messageId)])
        );
        setCursorId(res.data.nextCursorId);

        setTimeout(() => {
          if (el) {
            if (cursor === 0) el.scrollTop = el.scrollHeight;
            else el.scrollTop = el.scrollHeight - prevScrollHeight;
          }
        }, 20);
      } else {
        showPopup(res.data.message || "Failed to load chat history", "error");
      }
    } catch {
      showPopup("Network error while loading chat history", "error");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content) return;

    try {
      const res = await messengerApi.post("/messenger/send-message", {
        sender: myUsername,
        receiver: contact.contactUsername,
        content,
      });

      if (res.data.status === "0") {
        // Do NOT manually update messages — wait for WebSocket to deliver
        setNewMessage("");
      } else {
        showPopup(res.data.message || "Failed to send message", "error");
      }
    } catch {
      showPopup("Network error while sending message", "error");
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      const el = chatRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 30);
  };

  const handleTextareaResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "dd MMM yyyy");
  };

  const formatTime = (dateStr) => format(new Date(dateStr), "hh:mm a");

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-user-info">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              contact.contactName
            )}&background=007bff&color=fff&rounded=true&size=42`}
            alt={contact.contactName}
            className="contact-avatar"
          />
          <div className="chat-user-details">
            <span className="chat-user-name">
              {contact.contactUsername === myUsername
                ? `${contact.contactName} (You)`
                : contact.contactName}
            </span>
            <span className="chat-user-status">Online</span>
          </div>
        </div>
        <button
          className="chat-close-button"
          onClick={() => setSelectedContact(null)}
        >
          <IoMdClose size={20} />
        </button>
      </div>

      <div className="chat-history" ref={chatRef}>
        {(() => {
          let lastDate = null;
          return messages.map((msg) => {
            const sentAt = msg.sentAt || new Date().toISOString();
            const msgDate = sentAt.split("T")[0];
            const showDate = msgDate !== lastDate;
            lastDate = msgDate;
            const isMe = msg.sender === myUsername;

            return (
              <React.Fragment key={msg.messageId || `${sentAt}-${msg.sender}`}>
                {showDate && (
                  <div className="chat-date-separator">
                    {formatDateHeader(sentAt)}
                  </div>
                )}
                <div className={`chat-message ${isMe ? "sent" : "received"}`}>
                  <div className="chat-message-text">{msg.content}</div>
                  <div className="chat-message-time">{formatTime(sentAt)}</div>
                </div>
              </React.Fragment>
            );
          });
        })()}
      </div>

      <div className="chat-input-area">
        <button className="chat-icon-button">
          <FaSmile />
        </button>
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onInput={handleTextareaResize}
          rows={1}
        />
        <button className="chat-icon-button">
          <FaPaperclip />
        </button>
        <button className="chat-send-button" onClick={handleSend}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
