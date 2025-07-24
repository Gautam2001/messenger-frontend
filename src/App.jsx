import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { GlobalPopupProvider } from "./Pages/GlobalFunctions/GlobalPopup/GlobalPopupContext";
import { WebSocketProvider } from "./Pages/GlobalFunctions/GlobalWebsocket/WebSocketContext";
import "./Pages/GlobalFunctions/GlobalPopup/GlobalPopup.css";

import Maintenance from "./Pages/GlobalFunctions/Maintenance";
import Join from "./Pages/LoginRelated/Join";
import Login from "./Pages/LoginRelated/Login";
import MainApp from "./Pages/MainApp.jsx/MainApp";

// 🛠️ Maintenance flag
const isMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === "true";

// ✅ Auth wrapper component
const RequireAuth = ({ children }) => {
  const loginDataString = sessionStorage.getItem("LoginData");

  try {
    const loginData = JSON.parse(loginDataString ?? "null");
    const token = loginData?.accessToken;
    const userId = loginData?.userId;

    if (!token || !userId) {
      return <Navigate to="/login" />;
    }

    return (
      <WebSocketProvider token={token} userId={userId}>
        {children}
      </WebSocketProvider>
    );
  } catch (e) {
    console.error("Invalid login data in sessionStorage", e);
    return <Navigate to="/login" />;
  }
};

const App = () => {
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Simulate a short delay to fully read sessionStorage
    setTimeout(() => {
      setAuthInitialized(true);
    }, 0); // or 100ms if needed
  }, []);

  if (isMaintenance) {
    return <Maintenance />;
  }

  if (!authInitialized) {
    return null; // ⏳ Prevent router from rendering too early
  }

  return (
    <GlobalPopupProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RedirectBasedOnLogin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<Join />} />

          {/* Protected Route */}
          <Route
            path="/chats"
            element={
              <RequireAuth>
                <MainApp />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </GlobalPopupProvider>
  );
};

export default App;

// 🔁 Redirect logic on root path "/"
const RedirectBasedOnLogin = () => {
  const loginDataString = sessionStorage.getItem("LoginData");

  try {
    const loginData = JSON.parse(loginDataString ?? "null");
    const token = loginData?.accessToken;
    const userId = loginData?.userId;

    return token && userId ? (
      <Navigate to="/chats" />
    ) : (
      <Navigate to="/login" />
    );
  } catch {
    return <Navigate to="/login" />;
  }
};
