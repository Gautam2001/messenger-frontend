import React, { useEffect, useState } from "react";
import "./Join.css";
import { LuMessagesSquare } from "react-icons/lu";
import { usePopup } from "../../GlobalFunctions/GlobalPopup/GlobalPopupContext";
import { useApiClients } from "../../../Api/useApiClients";
import { useNavigate } from "react-router-dom";

const Join = () => {
  const navigate = useNavigate();
  const { showPopup } = usePopup();
  const { messengerApi } = useApiClients();
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!username) return;

    setStatus("loading");

    try {
      const res = await messengerApi.post("/messenger/join", { username });
      const data = res.data;

      if (data.status === "0") {
        showPopup(data.message || "Joined successfully!", "success"); //proceed for login
        navigate("/login");
      } else if (data.status === "1") {
        showPopup(
          data.message || "User does not exist, please Signup!",
          "error"
        ); //proceed for signup
        navigate("/signup");
      } else {
        showPopup(data.message || "Something went wrong.", "error");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Network error. Please try again later.";
      showPopup(message, "error");
    } finally {
      setStatus("");
    }
  };

  return (
    <div className="fcc-page">
      <div className="join-card">
        <div className="join-header">
          <LuMessagesSquare size={60} cursor={"pointer"} />
          <h1>Messengers</h1>
          <p>Connect. Chat. Share moments instantly.</p>
          <h2>JOIN</h2>
        </div>

        <form onSubmit={handleJoin} className="join-form">
          <div className="form-group">
            <label className="input-label">Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="Enter your email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <button
            className="primary-button"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Joining..." : "Join Now"}
          </button>
        </form>

        <div className="join-footer">
          <p>
            Already a member? <a href="/login">Log in here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Join;
