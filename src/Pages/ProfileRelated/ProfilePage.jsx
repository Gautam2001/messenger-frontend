import React, { useState } from "react";
import "./ProfilePage.css";
import ResetPassword from "./ResetPassword";

const ProfilePage = () => {
  const [showReset, setShowReset] = useState(false);

  const loginData = JSON.parse(sessionStorage.getItem("LoginData"));
  const name = loginData?.name || "User";
  const username = loginData?.username || "user@gmail.com";
  const joinedAtRaw = loginData?.joinedAt || "N/A";

  const joinedAt = joinedAtRaw
    ? new Date(joinedAtRaw).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  return (
    <div className="pp-container">
      <div className="pp-card">
        {/* Avatar */}
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            name
          )}&background=007bff&color=fff&rounded=true&size=100`}
          alt={name}
          className="pp-avatar"
        />

        {/* User Info */}
        <h2 className="pp-name">{name}</h2>
        <p className="pp-username">{username}</p>
        <p className="pp-joined">Joined On: {joinedAt}</p>

        {/* Reset Password */}
        {!showReset ? (
          <button className="primary-button" onClick={() => setShowReset(true)}>
            Reset Password
          </button>
        ) : (
          <ResetPassword onClose={() => setShowReset(false)} />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
