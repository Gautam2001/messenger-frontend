import React, { useEffect, useState } from "react";
import "./Signup.css";
import { LuMessagesSquare } from "react-icons/lu";
import { usePopup } from "../../GlobalFunctions/GlobalPopup/GlobalPopupContext";
import { useApiClients } from "../../../Api/useApiClients";
import { useLocation, useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username || "";
  const { showPopup } = usePopup();
  const { loginApi, messengerApi } = useApiClients();

  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  useEffect(() => {
    if (!username) {
      showPopup("Invalid or expired OTP link", "error");
      navigate("/signup");
    }
  }, [username, navigate, showPopup]);

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleResendOtp = async () => {
    if (!username) {
      return showPopup("Username cannot be blank.", "error");
    }

    if (!isValidEmail(username)) {
      return showPopup("Enter a valid email address.", "error");
    }

    try {
      const res = await loginApi.post("/auth/signup-resend-otp", { username });
      if (res.data.status === "0") {
        showPopup(
          res.data.message || "OTP Sent Successfully to Email.",
          "success"
        );
      } else {
        showPopup(res.data.message || "Cannot send OTP, try again.", "error");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Network error while loading contacts.";
      showPopup(msg, "error");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!username || !otp) {
      return showPopup("Please fill in all fields.", "error");
    }

    if (!isValidEmail(username)) {
      return showPopup("Enter a valid email address.", "error");
    }

    if (!/^\d{6}$/.test(otp)) {
      return showPopup("OTP must be a 6-digit number.", "error");
    }

    setStatus("loading");

    try {
      const signupRes = await loginApi.post("/auth/signup", {
        username,
        otp,
      });

      if (signupRes.data.status === "0") {
        // Continue to join
        const joinRes = await messengerApi.post("/messenger/join", {
          username,
        });

        const singupData = joinRes.data;

        if (singupData.status === "0") {
          showPopup(singupData.message || "Signup successful!", "success");
          navigate("/login");
        } else {
          showPopup(
            singupData.message || "Signup successful!, please join...",
            "success"
          );
          navigate("/join");
        }
      } else {
        showPopup(
          signupRes.data.message || "Email is already registered.",
          "error"
        );
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
      <div className="signup-card">
        <div className="signup-header">
          <LuMessagesSquare size={60} />
          <h1>Messengers</h1>
          <p>Connect. Chat. Share moments instantly.</p>
          <h2>SIGNUP OTP</h2>
        </div>

        <form onSubmit={handleSignup} className="signup-form">
          <div className="form-group">
            <label className="input-label">Username</label>
            <input
              className="input-field"
              type="email"
              placeholder="Enter your email"
              value={username}
              disabled
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label">OTP</label>
            <input
              className="input-field"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,6}$/.test(value)) setOtp(value);
              }}
              required
            />
          </div>

          <button
            className="primary-button"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            <a
              onClick={(e) => {
                e.preventDefault();
                handleResendOtp();
              }}
            >
              Resend OTP
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
