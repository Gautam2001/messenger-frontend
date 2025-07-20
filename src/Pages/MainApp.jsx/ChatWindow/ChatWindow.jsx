import React, { useEffect, useRef, useState } from "react";
import "./ChatWindow.css";
import { usePopup } from "../../GlobalFunctions/GlobalPopup/GlobalPopupContext";
import { useApiClients } from "../../../Api/useApiClients";
import { FaSmile, FaPaperclip, FaPaperPlane } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import format from "date-fns/format";
import isToday from "date-fns/isToday";
import isYesterday from "date-fns/isYesterday";

const ChatWindow = ({ contact, setSelectedContact }) => {
  const { showPopup } = usePopup();
  const { messengerApi } = useApiClients();

  const [cursorId, setCursorId] = useState(0);
  const [messages, setMessages] = useState([]);
  const [myUsername, setMyUsername] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const chatHistoryRef = useRef(null);

  useEffect(() => {
    const loginData = JSON.parse(sessionStorage.getItem("LoginData"));
    setMyUsername(loginData?.username || "");
  }, []);

  useEffect(() => {
    if (contact?.contactUsername && myUsername) {
      setMessages([]);
      setCursorId(0);
      getChatHistory(0);
    }
  }, [contact, myUsername]);

  const getChatHistory = async (cursorIdParam) => {
    console.log("chat history called:::");

    try {
      const el = chatHistoryRef.current;
      const oldScrollHeight = el?.scrollHeight || 0;

      const res = await messengerApi.post("/messenger/chat-history", {
        username: myUsername,
        contactUsername: contact.contactUsername,
        ...(cursorIdParam !== 0 && { cursorId: cursorIdParam }),
      });

      const data = res.data;
      if (data.status === "0") {
        setMessages((prev) => [...data.chatHistory, ...prev]);
        setCursorId(data.nextCursorId); // use -1 when no more messages

        setTimeout(() => {
          if (el) {
            if (cursorIdParam === 0) {
              el.scrollTop = el.scrollHeight; // Scroll to bottom initially
            } else {
              const newScrollHeight = el.scrollHeight;
              el.scrollTop = newScrollHeight - oldScrollHeight; // Preserve scroll
            }
          }
        }, 10);
      } else {
        showPopup(data.message || "Something went wrong.", "error");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Network error. Please try again later.";
      showPopup(message, "error");
    }
  };

  // Throttle scroll handler to avoid frequent triggering
  useEffect(() => {
    const el = chatHistoryRef.current;
    if (!el) return;

    let throttleTimeout = null;

    const handleScroll = () => {
      if (throttleTimeout) return;

      throttleTimeout = setTimeout(() => {
        if (el.scrollTop === 0 && !isLoadingMore && cursorId !== -1) {
          setIsLoadingMore(true);
          getChatHistory(cursorId).finally(() => setIsLoadingMore(false));
        }
        throttleTimeout = null;
      }, 150);
    };

    el.addEventListener("scroll", handleScroll);
    return () => {
      el.removeEventListener("scroll", handleScroll);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [cursorId, isLoadingMore]);

  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "dd MMM yyyy");
  };

  const formatTime = (dateStr) => format(new Date(dateStr), "hh:mm a");

  const textareaRef = useRef(null);

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  };

  return (
    <div className="chat-window">
      {/* Header */}
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

      {/* Chat History */}
      <div className="chat-history" ref={chatHistoryRef}>
        {(() => {
          let lastDate = null;

          return [...messages].reverse().map((msg) => {
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

      {/* Input Area */}
      <div className="chat-input-area">
        <button className="chat-icon-button">
          <FaSmile />
        </button>
        <textarea
          ref={textareaRef}
          placeholder="Type your message..."
          className="chat-textarea"
          rows={1}
          onInput={handleInput}
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
