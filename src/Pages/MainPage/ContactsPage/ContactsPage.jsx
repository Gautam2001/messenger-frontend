import React, { useEffect, useRef, useState } from "react";
import "./ContactsPage.css";
import { usePopup } from "../../GlobalFunctions/GlobalPopup/GlobalPopupContext";
import { useApiClients } from "../../../Api/useApiClients";
import { BsCheck, BsCheckAll } from "react-icons/bs";

const ContactsPage = ({
  contactsList,
  setContactsList,
  selectedContact,
  onSelectContact,
  loadingContacts,
  setActiveSection,
}) => {
  const loginData = JSON.parse(sessionStorage.getItem("LoginData"));
  const username = loginData?.username;
  const debounceTimeout = useRef(null);
  const { showPopup } = usePopup();
  const { messengerApi } = useApiClients();
  const [search, setSearch] = useState("");

  const existingContactsList = contactsList.filter(
    (c) => c.latestMessage && c.timestamp !== null
  );
  const newContactsList = contactsList.filter(
    (c) =>
      (!c.latestMessage ||
        c.latestMessage === "" ||
        c.latestMessage === "No conversations yet.") &&
      c.timestamp === null
  );

  const matchesSearch = (searchContact) => {
    const lower = search.toLowerCase();
    return (
      searchContact.contactName.toLowerCase().includes(lower) ||
      searchContact.contactUsername.toLowerCase().includes(lower)
    );
  };

  const looksLikeEmail = (text) =>
    text.includes("@") && /\S+@\S+\.\S+/.test(text);

  const searchGlobalUsers = async (searchEmail) => {
    try {
      const res = await messengerApi.post("/messenger/search-user", {
        username: username,
        contactUsername: searchEmail,
      });

      if (res.data.status === "0" && Array.isArray(res.data.users)) {
        const newGlobalUsers = res.data.users
          .filter(
            (u) => !contactsList.some((c) => c.contactUsername === u.username)
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
          setContactsList((prev) => [...prev, ...newGlobalUsers]);
        }
      } else {
        showPopup(res.data.message || "No users found.", "info");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Network error. Please try again later.";
      showPopup(message, "error");
    }
  };

  // Debounced search for global users
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (looksLikeEmail(search)) {
      debounceTimeout.current = setTimeout(() => {
        searchGlobalUsers(search);
      }, 500);
    }

    return () => clearTimeout(debounceTimeout.current);
  }, [search]);

  const filteredExistingContactsList =
    existingContactsList.filter(matchesSearch); //final existing contact list
  const filteredNewContactsList = newContactsList.filter(matchesSearch); //final new contact list

  //formatting chages here for visuals

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

  const RenderContact = ({ displayContact, isGlobal = false }) => {
    if (!displayContact) {
      return null;
    }
    const isSelf = displayContact.contactUsername === username;

    return (
      <div
        key={displayContact.contactUsername}
        className={`contact-item ${
          selectedContact?.contactUsername === displayContact.contactUsername
            ? "selected-contact"
            : ""
        }`}
        onClick={() => {
          setActiveSection("chats");
          onSelectContact(displayContact);
          setSearch("");
        }}
      >
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            displayContact.contactName
          )}&background=007bff&color=fff&rounded=true&size=42`}
          alt={displayContact.contactName}
          className="contact-avatar"
        />
        <div className="contact-info">
          <div className="contact-top">
            <span className="contact-name">
              {displayContact.contactName}
              {isSelf ? " (You)" : ""}
            </span>
            {!isGlobal && displayContact.timestamp && (
              <span className="contact-time">
                {formatTime(displayContact.timestamp)}
              </span>
            )}
          </div>
          <div className="contact-message">
            {!isGlobal ? (
              <>
                <span>
                  {displayContact.latestMessageSender === username &&
                    getStatusIcon(displayContact.status)}{" "}
                  {displayContact.latestMessage}
                </span>
                {displayContact.unread > 0 && (
                  <span className="unread-badge-message">
                    {displayContact.unread}
                  </span>
                )}
              </>
            ) : (
              <i className="contact-placeholder">No conversation yet</i>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loadingContacts) return <div>Loading chat messages...</div>;

  return (
    <div className="contact-list">
      <h2 className="contact-list-header">Chats</h2>

      <input
        type="text"
        className="contact-search"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="contacts-scroll">
        {filteredExistingContactsList.length === 0 &&
        filteredNewContactsList.length === 0 ? (
          <div className="no-contacts">No contacts found.</div>
        ) : (
          <>
            {filteredExistingContactsList.map((existingContact) => (
              <RenderContact
                key={existingContact.contactUsername}
                displayContact={existingContact}
              />
            ))}

            {filteredNewContactsList.length > 0 && (
              <div className="global-contacts-header">Global Users</div>
            )}

            {filteredNewContactsList.map((newContact) => (
              <RenderContact
                key={newContact.contactUsername}
                displayContact={newContact}
                isGlobal
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ContactsPage;
