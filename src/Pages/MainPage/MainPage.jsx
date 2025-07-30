import React, { useEffect, useRef, useState } from "react";
import "./MainPage.css";
import { useWebSocket } from "../GlobalFunctions/GlobalWebsocket/WebSocketContext";
import { useApiClients } from "../../Api/useApiClients";
import { usePopup } from "../GlobalFunctions/GlobalPopup/GlobalPopupContext";
import ContactsPage from "./ContactsPage/ContactsPage";
import ChatPage from "./ChatPage/ChatPage";
import SidebarPage from "./SidebarPage/SidebarPage";
import ShowcasePage from "../ShowcasePage/ShowcasePage";

const MainPage = () => {
  const DEBOUNCE_INTERVAL = 10000;
  const loginData = JSON.parse(sessionStorage.getItem("LoginData"));
  const username = loginData?.username;
  const { messengerApi } = useApiClients();
  const { showPopup } = usePopup();
  const { addMessageListener, sendMessage } = useWebSocket();

  const [loading, setLoading] = useState(false);
  const [contactsList, setContactsList] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [cursorId, setCursorId] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const deliveredRef = useRef(new Set());
  const seenRef = useRef(new Set());
  const unseenRef = useRef(new Set());
  const debounceTimerRef = useRef(null);

  const fetchContacts = async () => {
    try {
      const result = await messengerApi.post("/messenger/message-delivered", {
        username,
      });
      if (result.data.status !== "0") {
        showPopup(
          result.data.message || "Failed to update delivered status",
          "error"
        );
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Network error during delivery update.";
      showPopup(msg, "error");
    }

    try {
      setLoading(true);
      const res = await messengerApi.post("/messenger/contacts", { username });
      if (res.data.status === "0") {
        const list = res.data.contactList || [];
        setContactsList(list);

        const selfContact = list.find((c) => c.contactUsername === username);
        if (selfContact) {
          setSelectedContact(selfContact);
        }
      } else {
        showPopup(res.data.message || "Failed to load contacts", "error");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Network error while loading contacts.";
      showPopup(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    if (loadingMore || cursorId === -1) return;
    try {
      const result = await messengerApi.post("/messenger/message-seen", {
        username,
        contactUsername: selectedContact.contactUsername,
      });
      if (result.data.status !== "0") {
        showPopup(
          result.data.message || "Failed to update seen status",
          "error"
        );
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Network error during seen update.";
      showPopup(msg, "error");
    }

    try {
      setLoadingMore(true);
      const res = await messengerApi.post("/messenger/chat-history", {
        username,
        contactUsername: selectedContact.contactUsername,
        ...(cursorId !== 0 && { cursorId }),
      });

      if (res.data.status === "0") {
        const newMsgs = res.data.chatHistory;
        setChatHistory((prev) => {
          const existingIds = new Set(prev.map((m) => m.messageId));
          const filtered = newMsgs.filter((m) => !existingIds.has(m.messageId));
          return [...filtered, ...prev];
        });

        setCursorId(res.data.nextCursorId);
      } else {
        showPopup(res.data.message || "Failed to load chat history", "error");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Network error.";
      showPopup(msg, "error");
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (!selectedContact || !selectedContact.contactUsername) return;

    setChatHistory([]);
    setCursorId(0);

    setTimeout(() => {
      const unseenIds = Array.from(unseenRef.current);
      if (unseenIds.length > 0) {
        sendMessage("/messenger/status-update", {
          username,
          delivered: [],
          seen: unseenIds,
        });

        unseenIds.forEach((id) => seenRef.current.add(id));
        unseenRef.current.clear();
      }
    }, 100);
  }, [selectedContact]);

  useEffect(() => {
    if (selectedContact && selectedContact.contactUsername && cursorId === 0) {
      setContactsList((prevList) =>
        prevList.map((contact) => {
          if (contact.contactUsername === selectedContact.contactUsername) {
            return {
              ...contact,
              unread: 0,
            };
          }
          return contact;
        })
      );

      fetchChatHistory();
    }
  }, [selectedContact, cursorId]);

  const triggerStatusUpdate = () => {
    const deliveredArr = Array.from(deliveredRef.current);
    const seenArr = Array.from(seenRef.current);

    if (deliveredArr.length === 0 && seenArr.length === 0) return;

    deliveredArr.forEach((id) => {
      if (!seenRef.current.has(id)) unseenRef.current.add(id);
    });

    const payload = { username, delivered: deliveredArr, seen: seenArr };

    deliveredRef.current.clear();
    seenRef.current.clear();

    sendMessage("/messenger/status-update", payload);
  };

  const debounceSend = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(
      triggerStatusUpdate,
      DEBOUNCE_INTERVAL
    );
  };

  const handleNewMessage = (msg) => {
    const participants = [msg.sender, msg.receiver];
    const isChatMatch =
      selectedContact &&
      participants.includes(selectedContact.contactUsername) &&
      participants.includes(username);

    const isIncoming = msg.receiver === username;
    const isCurrentChatOpen = selectedContact?.contactUsername === msg.sender;

    if (isIncoming) {
      if (isCurrentChatOpen) {
        deliveredRef.current.add(msg.messageId);
        seenRef.current.add(msg.messageId);
      } else {
        deliveredRef.current.add(msg.messageId);
      }
      debounceSend();
    }

    if (isChatMatch) {
      setChatHistory((prev) => {
        if (prev.some((m) => m.messageId === msg.messageId)) return prev;
        return [...prev, msg];
      });
    }

    setContactsList((prevList) =>
      prevList.map((contact) => {
        const otherUser = msg.sender === username ? msg.receiver : msg.sender;
        const isMatch = contact.contactUsername === otherUser;
        if (!isMatch) return contact;

        const isIncoming = msg.receiver === username;
        const isCurrentChatOpen =
          selectedContact?.contactUsername === contact.contactUsername;

        return {
          ...contact,
          latestMessage: msg.content,
          latestMessageSender: msg.sender,
          latestMessageId: msg.messageId,
          status: msg.status,
          timestamp: msg.sentAt,
          unread:
            isIncoming && !isCurrentChatOpen
              ? (contact.unread || 0) + 1
              : contact.unread,
        };
      })
    );
  };

  const handleStatusUpdate = (msg) => {
    const deliveredIds = msg.delivered || [];
    const seenIds = msg.seen || [];

    setChatHistory((prevHistory) =>
      prevHistory.map((m) => {
        if (seenIds.includes(m.messageId)) return { ...m, status: "SEEN" };
        if (deliveredIds.includes(m.messageId) && m.status !== "SEEN")
          return { ...m, status: "DELIVERED" };
        return m;
      })
    );

    setContactsList((prev) =>
      prev.map((contact) => {
        const id = contact.latestMessageId;
        if (seenIds.includes(id)) return { ...contact, status: "SEEN" };
        if (deliveredIds.includes(id) && contact.status !== "SEEN")
          return { ...contact, status: "DELIVERED" };
        return contact;
      })
    );
  };

  const handleDeletedMessage = (msg) => {
    setChatHistory((prev) =>
      prev.map((m) =>
        m.messageId === msg.messageId ? { ...m, isDeleted: true } : m
      )
    );

    setContactsList((prevList) =>
      prevList.map((contact) => {
        if (contact.latestMessageId === msg.messageId) {
          return {
            ...contact,
            latestMessage: "This message was deleted",
          };
        }
        return contact;
      })
    );
  };

  const handleEditedMessage = (msg) => {
    setChatHistory((prev) =>
      prev.map((m) =>
        m.messageId === msg.messageId
          ? {
              ...m,
              content: msg.content,
              isEdited: true,
            }
          : m
      )
    );

    setContactsList((prevList) =>
      prevList.map((contact) => {
        if (contact.latestMessageId === msg.messageId) {
          return {
            ...contact,
            latestMessage: msg.content,
          };
        }
        return contact;
      })
    );
  };

  useEffect(() => {
    const listener = (msg) => {
      if (msg?.type === "DELETED") {
        handleDeletedMessage(msg);
      } else if (msg?.type === "EDITED") {
        handleEditedMessage(msg);
      } else {
        if (!msg.delivered && !msg.seen) {
          handleNewMessage(msg);
        }

        if (msg.delivered || msg.seen) {
          setTimeout(() => {
            handleStatusUpdate(msg);
          }, 50);
        }
      }
    };

    const unsubscribe = addMessageListener(listener);
    return () => {
      unsubscribe();
      clearTimeout(debounceTimerRef.current);
    };
  }, [selectedContact, username]);

  if (!loginData?.accessToken || !loginData?.userId) {
    return <div>Loading chat...</div>;
  }

  return (
    <div className="main-layout">
      <div className={`sidebar ${selectedContact ? "hide-on-mobile" : ""}`}>
        <SidebarPage />
      </div>
      <div
        className={`contacts-container ${
          selectedContact ? "hide-on-mobile" : ""
        }`}
      >
        <ContactsPage
          contactsList={contactsList}
          setContactsList={setContactsList}
          selectedContact={selectedContact}
          onSelectContact={setSelectedContact}
          loadingContacts={loading}
        />
      </div>
      <div
        className={`chat-container ${!selectedContact ? "hide-on-mobile" : ""}`}
      >
        {selectedContact ? (
          <ChatPage
            selectedContact={selectedContact}
            setSelectedContact={setSelectedContact}
            chatHistory={chatHistory}
            loadingChat={loading}
            cursorId={cursorId}
            fetchOldChats={fetchChatHistory}
          />
        ) : (
          <ShowcasePage />
        )}
      </div>
    </div>
  );
};

export default MainPage;
