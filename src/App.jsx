import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GlobalPopupProvider } from "./Pages/GlobalFunctions/GlobalPopup/GlobalPopupContext";
import "./Pages/GlobalFunctions/GlobalPopup/GlobalPopup.css";
import Maintenance from "./Pages/GlobalFunctions/Maintenance";
import Join from "./Pages/LoginRelated/Join";
import Login from "./Pages/LoginRelated/Login";
import MainApp from "./Pages/MainApp.jsx/MainApp";

const isMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === "true";

const App = () => {
  if (isMaintenance) {
    return <Maintenance />;
  }

  return (
    <GlobalPopupProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route path="/login" element={<Login />} />

          {/* Protected route later*/}
          <Route path="/chats" element={<MainApp />} />
        </Routes>
      </BrowserRouter>
    </GlobalPopupProvider>
  );
};

export default App;
