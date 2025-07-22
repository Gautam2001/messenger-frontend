import React, { useState } from "react";
import "./ContactList.css";

const ContactList = ({ onSelectContact, contacts, setContacts }) => {
  const [search, setSearch] = useState("");

  const loginData = JSON.parse(sessionStorage.getItem("LoginData"));
  const currentUsername = loginData?.username;

  const filteredContacts = contacts.filter((contact) =>
    contact.contactUsername.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (isoString) => {
    const messageDate = new Date(isoString);
    const now = new Date();

    const isToday = messageDate.toDateString() === now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();

    if (isToday) {
      return messageDate.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (isYesterday) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "SENT":
        return <span className="status-icon">✓</span>;
      case "DELIVERED":
        return <span className="status-icon">✓✓</span>;
      case "SEEN":
        return <span className="status-icon seen">✓✓</span>;
      default:
        return null;
    }
  };

  return (
    <div className="contact-list">
      <h2 className="contact-list-header">Chats</h2>

      <input
        type="text"
        placeholder="Search contacts..."
        className="contact-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="contacts-scroll">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact, index) => (
            <div
              key={index}
              onClick={() => onSelectContact(contact)}
              className="contact-item"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  contact.contactName
                )}&background=007bff&color=fff&rounded=true&size=42`}
                alt={contact.contactName}
                className="contact-avatar"
              />
              <div className="contact-info">
                <div className="contact-top">
                  <span className="contact-name">
                    {contact.contactName}
                    {contact.contactUsername === currentUsername
                      ? " (You)"
                      : ""}
                  </span>
                  <span className="contact-time">
                    {formatTime(contact.timestamp)}
                  </span>
                </div>
                <div className="contact-message">
                  {getStatusIcon(contact.status)}{" "}
                  {contact.latestMessage || "No messages yet"}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-contacts">No contacts found.</div>
        )}
      </div>
    </div>
  );
};

export default ContactList;
