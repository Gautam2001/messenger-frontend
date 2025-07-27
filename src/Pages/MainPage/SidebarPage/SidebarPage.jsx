import React from "react";
import "./SidebarPage.css";
import { LuMessagesSquare } from "react-icons/lu";
import { FiUser, FiUsers, FiSettings } from "react-icons/fi";
import { BsSun, BsMoon } from "react-icons/bs";

const SidebarPage = () => {
  const isDarkMode = false; // Replace with context/state if implementing theme toggle

  return (
    <div className="sidebar">
      {/* Top Section: Logo and Navigation Icons */}
      <div className="sidebar-section">
        <div className="sidebar-logo" title="Messenger">
          <LuMessagesSquare size={24} cursor="pointer" />
        </div>

        <div className="sidebar-item active" title="Profile">
          <FiUser size={20} cursor="pointer" />
        </div>

        <div className="sidebar-item" title="Contacts">
          <FiUsers size={20} cursor="pointer" />
        </div>
      </div>

      {/* Bottom Section: Theme and Settings */}
      <div className="sidebar-footer">
        <button className="sidebar-mode-toggle" title="Toggle Theme">
          {isDarkMode ? <BsSun size={20} /> : <BsMoon size={18} />}
        </button>

        <button className="sidebar-settings" title="Settings">
          <FiSettings size={20} />
        </button>
      </div>
    </div>
  );
};

export default SidebarPage;
