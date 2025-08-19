import React from "react";
import "./ProfilePage.css";

const ProfilePage = () => {
  const loginData = JSON.parse(sessionStorage.getItem("LoginData"));
  const name = loginData?.name || "User";
  const username = loginData?.username || "User";
  const joinedAtRaw = loginData?.joinedAt || "N/A";

  const joinedAt = joinedAtRaw
    ? new Date(joinedAtRaw).toLocaleString("en-US", {
        year: "numeric",
        month: "short", // change to "long" for full month name
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  return (
    <div className="pp-container">
      {/* Profile Card */}
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
        <button className="pp-reset-btn">Reset Password</button>
      </div>
    </div>
  );
};

export default ProfilePage;
