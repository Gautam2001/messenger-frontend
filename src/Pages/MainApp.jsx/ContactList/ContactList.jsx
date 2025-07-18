import React, { useState } from "react";
import "./ContactList.css";

const ContactList = () => {
  const [search, setSearch] = useState("");

  const dummyContacts = [
    {
      name: "Alice",
      message: "Hey, how are you?",
      time: "10:30 AM",
      pic: "https://via.placeholder.com/40",
    },
    {
      name: "Bob",
      message: "Meeting at 3?",
      time: "9:15 AM",
      pic: "https://via.placeholder.com/40",
    },
    {
      name: "Charlie",
      message: "Got the files?",
      time: "Yesterday",
      pic: "https://via.placeholder.com/40",
    },
    {
      name: "David",
      message: "See you soon!",
      time: "Mon",
      pic: "https://via.placeholder.com/40",
    },
    {
      name: "Eve",
      message: "Thanks!",
      time: "Sun",
      pic: "https://via.placeholder.com/40",
    },
    {
      name: "Charlie",
      message: "Got the files?",
      time: "Yesterday",
      pic: "https://via.placeholder.com/40",
    },
    {
      name: "David",
      message: "See you soon!",
      time: "Mon",
      pic: "https://via.placeholder.com/40",
    },
    {
      name: "Eve",
      message: "Thanks!",
      time: "Sun",
      pic: "https://via.placeholder.com/40",
    },
  ];

  const filteredContacts = dummyContacts.filter((contact) =>
    contact.name.toLowerCase().includes(search.toLowerCase())
  );

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
            <div key={index} className="contact-item">
              <img
                src={contact.pic}
                alt={contact.name}
                className="contact-avatar"
              />
              <div className="contact-info">
                <div className="contact-top">
                  <span className="contact-name">{contact.name}</span>
                  <span className="contact-time">{contact.time}</span>
                </div>
                <div className="contact-message">{contact.message}</div>
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
