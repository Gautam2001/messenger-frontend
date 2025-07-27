import React, { useEffect, useState } from "react";
import "./RequestSignup.css";
import { LuMessagesSquare } from "react-icons/lu";
import { usePopup } from "../../GlobalFunctions/GlobalPopup/GlobalPopupContext";
import { useApiClients } from "../../../Api/useApiClients";
import { useNavigate } from "react-router-dom";

const RequestSignup = () => {
  const navigate = useNavigate();
  const { showPopup } = usePopup();
  const { loginApi, messengerApi } = useApiClients();

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!username || !name || !password || !confirmPassword) {
      return showPopup("Please fill in all fields.", "error");
    }

    if (!isValidEmail(username)) {
      return showPopup("Enter a valid email address.", "error");
    }

    if (password !== confirmPassword) {
      return showPopup("Passwords do not match.", "error");
    }

    if (password.length < 6) {
      return showPopup(
        "Password should be at least 6 characters long.",
        "error"
      );
    }

    setStatus("loading");

    try {
      const existsRes = await messengerApi.post("/messenger/exists", {
        username,
      });

      if (existsRes.data.status === "1") {
        // Continue to signup
        const signupRes = await loginApi.post("/auth/request-signup", {
          username,
          name,
          password,
          role: "USER",
        });

        const signupData = signupRes.data;

        if (signupData.status === "0") {
          showPopup(signupData.message || "Signup successful!", "success");
          navigate("/signup-otp", { state: { username } });
        } else {
          showPopup(signupData.message || "Signup failed.", "error");
        }
      } else {
        showPopup(
          existsRes.data.message || "Email is already registered.",
          "error"
        );
        navigate("/join");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Network error. Please try again.";
      showPopup(message, "error");
    } finally {
      setStatus("");
    }
  };

  return (
    <div className="fcc-page">
      <div className="req-signup-card">
        <div className="req-signup-header">
          <LuMessagesSquare size={60} />
          <h1>Messengers</h1>
          <p>Connect. Chat. Share moments instantly.</p>
        </div>

        <form onSubmit={handleSignup} className="req-signup-form">
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Username</label>
              <input
                className="input-field"
                type="email"
                placeholder="Enter your email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">Name</label>
              <input
                className="input-field"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">Confirm Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            className="primary-button"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <div className="req-signup-footer">
          <p>
            Already a member? <a href="/login">Log in here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RequestSignup;
