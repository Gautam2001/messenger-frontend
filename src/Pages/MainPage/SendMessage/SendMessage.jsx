import React, { useRef, useState } from "react";
import "./SendMessage.css";
import { usePopup } from "../../GlobalFunctions/GlobalPopup/GlobalPopupContext";
import { useApiClients } from "../../../Api/useApiClients";
import { FaSmile, FaPaperclip, FaPaperPlane } from "react-icons/fa";

const SendMessage = ({ contactUsername }) => {
  const loginData = JSON.parse(sessionStorage.getItem("LoginData"));
  const username = loginData?.username;
  const { showPopup } = usePopup();
  const { messengerApi } = useApiClients();

  const [content, setContent] = useState("");
  const textareaRef = useRef(null);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    try {
      const res = await messengerApi.post("/messenger/send-message", {
        sender: username,
        receiver: contactUsername,
        content: trimmed,
      });

      if (res.data.status === "0") {
        setContent("");
        autoResize(); // Reset textarea height after sending
      } else {
        showPopup(res.data.message || "Failed to send message", "error");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send message";
      showPopup(msg, "error");
    }
  };

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 3 * 24) + "px"; // max 3 lines
    }
  };

  return (
    <div className="send-message-container">
      {/* <button className="icon-button">
        <FaSmile />
      </button> */}
      <textarea
        ref={textareaRef}
        className="chat-textarea"
        placeholder="Type your message..."
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          autoResize();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        rows={1}
        maxLength={1000}
      />
      {/* <button className="icon-button">
        <FaPaperclip />
      </button> */}
      <button className="send-button" onClick={handleSend}>
        <FaPaperPlane />
      </button>
    </div>
  );
};

export default SendMessage;
