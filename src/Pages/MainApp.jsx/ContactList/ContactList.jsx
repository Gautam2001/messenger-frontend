import React, { useState, useEffect, useRef } from "react";
import "./ContactList.css";
import { usePopup } from "../../GlobalFunctions/GlobalPopup/GlobalPopupContext";
import { useApiClients } from "../../../Api/useApiClients";
import { BsCheck, BsCheckAll } from "react-icons/bs";

const ContactList = ({ onSelectContact, contacts, setContacts }) => {
  const { showPopup } = usePopup();
  const { messengerApi } = useApiClients();
  const [search, setSearch] = useState("");
  const loginData = JSON.parse(sessionStorage.getItem("LoginData"));
  const currentUsername = loginData?.username;

  const debounceTimeout = useRef(null);

  const localContacts = contacts.filter(
    (c) => c.latestMessage && c.timestamp !== null
  );
  const globalContacts = contacts.filter(
    (c) => (!c.latestMessage || c.latestMessage === "") && c.timestamp === null
  );

  const matchesSearch = (contact) => {
    const lower = search.toLowerCase();
    return (
      contact.contactName.toLowerCase().includes(lower) ||
      contact.contactUsername.toLowerCase().includes(lower)
    );
  };

  const filteredLocal = localContacts.filter(matchesSearch);
  const filteredGlobal = globalContacts.filter(matchesSearch);

  const looksLikeEmail = (text) => {
    return text.includes("@") && /\S+@\S+\.\S+/.test(text);
  };

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (looksLikeEmail(search)) {
      debounceTimeout.current = setTimeout(() => {
        const fetchGlobalUsers = async () => {
          try {
            const res = await messengerApi.post("/messenger/search-user", {
              username: currentUsername,
              contactUsername: search,
            });

            if (res.data.status === "0" && Array.isArray(res.data.users)) {
              const newGlobalUsers = res.data.users
                .filter(
                  (u) => !contacts.some((c) => c.contactUsername === u.username)
                )
                .map((u) => ({
                  contactName: u.name,
                  contactUsername: u.username,
                  userId: u.userId,
                  latestMessage: "",
                  timestamp: null,
                  status: "",
                }));

              if (newGlobalUsers.length > 0) {
                setContacts((prev) => [...prev, ...newGlobalUsers]);
              }
            } else {
              showPopup(res.data.message || "No users found.", "info");
            }
          } catch (err) {
            const message =
              err.response?.data?.message ||
              "Network error. Please try again later.";
            showPopup(message, "error");
          }
        };

        fetchGlobalUsers();
      }, 500);
    }

    return () => clearTimeout(debounceTimeout.current);
  }, [search, contacts, setContacts]);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (isYesterday) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
    }
  };

  const getStatusIcon = (status) => {
    console.log(contacts);

    switch (status) {
      case "SENT":
        return <BsCheck className="status-icon" size={16} color="gray" />;
      case "DELIVERED":
        return <BsCheckAll className="status-icon" size={16} color="gray" />;
      case "SEEN":
        return <BsCheckAll className="status-icon" size={16} color="#007bff" />;
      default:
        return null;
    }
  };

  const renderContact = (contact, isGlobal = false) => (
    <div
      key={contact.contactUsername}
      onClick={() => {
        onSelectContact(contact);
        setSearch("");
      }}
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
            {contact.contactUsername === currentUsername ? " (You)" : ""}
          </span>
          {!isGlobal && contact.timestamp && (
            <span className="contact-time">
              {formatTime(contact.timestamp)}
            </span>
          )}
        </div>
        <div className="contact-message">
          {!isGlobal ? (
            <>
              <span>
                {contact.latestMessageSender === currentUsername &&
                  getStatusIcon(contact.status)}{" "}
                {contact.latestMessage}
              </span>
              {contact.unread > 0 && (
                <span className="unread-badge-message">{contact.unread}</span>
              )}
            </>
          ) : (
            <i className="contact-placeholder">No conversation yet</i>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="contact-list">
      <h2 className="contact-list-header">Chats</h2>

      <input
        type="text"
        placeholder="Search by name or email..."
        className="contact-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="contacts-scroll">
        {filteredLocal.length === 0 && filteredGlobal.length === 0 ? (
          <div className="no-contacts">No contacts found.</div>
        ) : (
          <>
            {filteredLocal.map((c) => renderContact(c))}
            {filteredGlobal.length > 0 && (
              <div className="global-contacts-header">Global Users</div>
            )}
            {filteredGlobal.map((c) => renderContact(c, true))}
          </>
        )}
      </div>
    </div>
  );
};

export default ContactList;
