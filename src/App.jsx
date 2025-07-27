import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GlobalPopupProvider } from "./Pages/GlobalFunctions/GlobalPopup/GlobalPopupContext";
import "./Pages/GlobalFunctions/GlobalPopup/GlobalPopup.css";

import Maintenance from "./Pages/GlobalFunctions/Maintenance";
import Join from "./Pages/LoginRelated/Join";
import Login from "./Pages/LoginRelated/Login";
import MainPage from "./Pages/MainPage/MainPage";
import ProtectedRoute from "./ProtectedRoutes/ProtectedRoute";
import { WebSocketProvider } from "./Pages/GlobalFunctions/GlobalWebsocket/WebSocketContext";

const isMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === "true";

const WebSocketWithAuth = ({ children }) => {
  const loginData = JSON.parse(sessionStorage.getItem("LoginData") || "null");
  const token = loginData?.accessToken;
  const userId = loginData?.userId;

  return (
    <WebSocketProvider token={token} userId={userId}>
      {children}
    </WebSocketProvider>
  );
};

const App = () => {
  if (isMaintenance) return <Maintenance />;

  return (
    <GlobalPopupProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<Join />} />

          {/* Protected Route with WebSocket */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/chats"
              element={
                <WebSocketWithAuth>
                  <MainPage />
                </WebSocketWithAuth>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </GlobalPopupProvider>
  );
};

export default App;
