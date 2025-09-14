import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GlobalPopupProvider } from "./Pages/GlobalFunctions/GlobalPopup/GlobalPopupContext";
import "./Pages/GlobalFunctions/GlobalPopup/GlobalPopup.css";

import ProtectedRoute from "./Api/ProtectedRoute";
import { WebSocketProvider } from "./Pages/GlobalFunctions/GlobalWebsocket/WebSocketContext";

import Maintenance from "./Pages/GlobalFunctions/Maintenance";

import Join from "./Pages/OnboardingRelated/Join/Join";
import Login from "./Pages/OnboardingRelated/Login/Login";
import RequestSignup from "./Pages/OnboardingRelated/Signup/RequestSignup";
import Signup from "./Pages/OnboardingRelated/Signup/Signup";
import ForgotPassword from "./Pages/OnboardingRelated/ForgotPassword/ForgotPassword";
import ChangePassword from "./Pages/OnboardingRelated/ForgotPassword/ChangePassword";
import MainPage from "./Pages/MainPage/MainPage";

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
          <Route path="/signup" element={<RequestSignup />} />
          <Route path="/signup-otp" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />

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
