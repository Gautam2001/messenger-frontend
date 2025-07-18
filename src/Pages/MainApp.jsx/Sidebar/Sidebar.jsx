import React from "react";
import "./Sidebar.css";
import { LuMessagesSquare } from "react-icons/lu";
import { FiUser, FiUsers, FiSettings } from "react-icons/fi";
import { BsSun, BsMoon } from "react-icons/bs";

const Sidebar = () => {
  const isDarkMode = false;

  return (
    <div className="sidebar">
      {/* Navigation Section */}
      <div className="sidebar-section">
        <div className="logo">
          <LuMessagesSquare size={24} cursor={"pointer"} />
        </div>
        <div className="sidebar-item active">
          <FiUser size={20} cursor={"pointer"} />
        </div>
        <div className="sidebar-item">
          <FiUsers size={20} cursor={"pointer"} />
        </div>
      </div>

      {/* Footer / Settings */}
      <div className="sidebar-footer">
        <button className="sidebar-mode-toggle">
          {isDarkMode ? <BsSun size={20} /> : <BsMoon size={18} />}
        </button>
        <button className="sidebar-settings">
          <FiSettings size={20} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
