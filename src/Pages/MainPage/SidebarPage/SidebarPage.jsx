import React from "react";
import "./SidebarPage.css";
import { LuMessagesSquare } from "react-icons/lu";
import { FiUser, FiSettings, FiPower } from "react-icons/fi";
import { useApiClients } from "../../../Api/useApiClients";
import { usePopup } from "../../GlobalFunctions/GlobalPopup/GlobalPopupContext";

const SidebarPage = ({ activeSection, setActiveSection }) => {
  const loginData = JSON.parse(sessionStorage.getItem("LoginData"));
  const name = loginData?.name || "User";
  const { loginApi } = useApiClients();
  const { showPopup } = usePopup();

  const handleLogout = async () => {
    try {
      const res = await loginApi.post("/auth/logout");

      if (res.data.status === "0") {
        showPopup(res.data.message || "Logged out successfully", "success");
        sessionStorage.clear();
        window.location.href = "/login";
      } else {
        showPopup(res.data.message || "Logout failed", "error");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Network error while logging out.";
      showPopup(msg, "error");
    }
  };

  return (
    <div className="sidebar">
      {/* Top Section: Logo and Navigation Icons */}
      <div className="sidebar-section">
        <div
          className="sidebar-logo"
          title="Messenger"
          onClick={() => setActiveSection("showcase")}
        >
          <LuMessagesSquare size={24} cursor="pointer" />
        </div>

        <div
          className={`sidebar-item ${
            activeSection === "chats" ? "active" : ""
          }`}
          title="Chats"
          onClick={() => setActiveSection("chats")}
        >
          <FiUser size={24} cursor="pointer" />
        </div>
      </div>

      {/* Bottom Section: Theme and Settings */}
      <div className="sidebar-footer">
        <button
          className="sidebar-settings"
          title={`Profile: ${name}`}
          onClick={() => setActiveSection("profile")}
        >
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              name
            )}&background=007bff&color=fff&rounded=true&size=32`}
            alt={name}
            className="sidebar-avatar"
          />
        </button>

        <button
          className="sidebar-settings"
          title="Logout"
          onClick={handleLogout} //add logout functionality
        >
          <FiPower size={20} />
        </button>
      </div>
    </div>
  );
};

export default SidebarPage;
