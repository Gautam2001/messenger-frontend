import React, { useEffect, useState } from "react";
import "./ForgotPassword.css";
import { LuMessagesSquare } from "react-icons/lu";
import { usePopup } from "../../GlobalFunctions/GlobalPopup/GlobalPopupContext";
import { useApiClients } from "../../../Api/useApiClients";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { showPopup } = usePopup();
  const { loginApi } = useApiClients();

  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const isValidUsername = (username) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username.trim());

  const handleSendOtp = async (e, isResend = false) => {
    if (e) e.preventDefault();

    if (!username) return showPopup("Username is required", "error");
    if (!isValidUsername(username))
      return showPopup("Enter a valid username", "error");

    setStatus("sending");

    try {
      const res = await loginApi.post("/auth/request-forgot-password", {
        username: username,
      });

      if (res.data.status === "0") {
        showPopup(
          res.data.message ||
            (isResend ? "OTP resent successfully" : "OTP sent successfully"),
          "success"
        );
        setOtpSent(true);
      } else {
        showPopup(res.data.message || "Failed to send OTP", "error");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Network error. Please try again later.";
      showPopup(message, "error");
    } finally {
      setStatus("");
    }
  };

  const handleResendOtp = async () => {
    if (!username) {
      return showPopup("Username cannot be blank.", "error");
    }

    if (!isValidUsername(username)) {
      return showPopup("Enter a valid username address.", "error");
    }

    try {
      const res = await loginApi.post("/auth/forgotpass-resend-otp", {
        username,
      });
      if (res.data.status === "0") {
        showPopup(
          res.data.message || "OTP Sent Successfully to Username.",
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

  const handleValidateOtp = async (e) => {
    e.preventDefault();

    if (!otp || !/^\d{6}$/.test(otp))
      return showPopup("Enter a valid 6-digit OTP", "error");

    setStatus("validating");

    try {
      const res = await loginApi.post("/auth/validate-otp", {
        username: username,
        otp,
      });

      if (res.data.status === "0") {
        showPopup(res.data.message || "OTP verified", "success");
        navigate("/change-password", {
          state: { username, otpToken: res.data.otpToken },
        });
      } else {
        showPopup(res.data.message || "Invalid OTP", "error");
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
      <div className="fp-card">
        <div className="fp-header">
          <LuMessagesSquare size={60} />
          <h1>Messengers</h1>
          <p>Connect. Chat. Share moments instantly.</p>
          <h2>FORGOT PASSWORD</h2>
        </div>

        <form
          className="fp-form"
          onSubmit={otpSent ? handleValidateOtp : handleSendOtp}
        >
          <div className="form-group">
            <label className="input-label">Username</label>
            <input
              className="input-field"
              type="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={otpSent}
            />
          </div>

          {otpSent && (
            <>
              <div className="form-group">
                <label className="input-label">OTP</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Enter the 6-digit OTP"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,6}$/.test(value)) setOtp(value);
                  }}
                  required
                />
              </div>
            </>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={status === "sending" || status === "validating"}
          >
            {status === "sending"
              ? "Sending OTP..."
              : status === "validating"
              ? "Validating OTP..."
              : otpSent
              ? "Validate OTP"
              : "Send OTP"}
          </button>
        </form>

        <div className="fp-footer" style={{ cursor: "pointer" }}>
          {otpSent && (
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
          )}
          <p>
            Remember your password?{" "}
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
            >
              Log in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
