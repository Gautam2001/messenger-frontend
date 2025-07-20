import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GlobalPopupProvider } from "./Pages/GlobalFunctions/GlobalPopup/GlobalPopupContext";
import { WebSocketProvider } from "./Pages/GlobalFunctions/GlobalWebsocket/WebSocketContext";
import "./Pages/GlobalFunctions/GlobalPopup/GlobalPopup.css";
import Maintenance from "./Pages/GlobalFunctions/Maintenance";
import Join from "./Pages/LoginRelated/Join";
import Login from "./Pages/LoginRelated/Login";
import MainApp from "./Pages/MainApp.jsx/MainApp";

const isMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === "true";

const App = () => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loginDataString = sessionStorage.getItem("LoginData");
    // console.log("Session raw:", loginDataString);

    try {
      const loginData = JSON.parse(loginDataString ?? "null");
      const savedToken = loginData?.accessToken;
      const savedUserId = loginData?.userId;

      // console.log("Parsed:", savedToken, savedUserId);

      if (savedToken && savedUserId) {
        setToken(savedToken);
        setUserId(savedUserId);
      }
    } catch (e) {
      console.error("Error parsing LoginData", e);
    }
  }, []);

  if (isMaintenance) {
    return <Maintenance />;
  }

  return (
    <GlobalPopupProvider>
      <WebSocketProvider token={token} userId={userId}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/join" element={<Join />} />
            <Route path="/login" element={<Login />} />

            {/* Protected route later*/}
            <Route path="/chats" element={<MainApp />} />
          </Routes>
        </BrowserRouter>
      </WebSocketProvider>
    </GlobalPopupProvider>
  );
};

export default App;
