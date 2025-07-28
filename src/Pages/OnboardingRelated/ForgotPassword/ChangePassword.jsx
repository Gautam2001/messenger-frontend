import React, { useState, useEffect } from "react";
import "./ChangePassword.css";
import { LuMessagesSquare } from "react-icons/lu";
import { useLocation, useNavigate } from "react-router-dom";
import { usePopup } from "../../GlobalFunctions/GlobalPopup/GlobalPopupContext";
import { useApiClients } from "../../../Api/useApiClients";

const ChangePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showPopup } = usePopup();
  const { loginApi } = useApiClients();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");

  const username = location.state?.username;
  const otpToken = location.state?.otpToken;

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  useEffect(() => {
    if (!username || !otpToken) {
      showPopup("Invalid or expired password reset link", "error");
      navigate("/forgot-password");
    }
  }, [username, otpToken, navigate, showPopup]);

  const isStrongPassword = (password) => {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      return showPopup("Please fill out both password fields", "error");
    }

    if (newPassword !== confirmPassword) {
      return showPopup("Passwords do not match", "error");
    }

    if (!isStrongPassword(newPassword)) {
      return showPopup(
        "Password must be 8+ characters, with 1 uppercase, 1 number, and 1 special character.",
        "error"
      );
    }

    setStatus("changing");

    try {
      const res = await loginApi.post("/auth/forgot-password", {
        username,
        newPassword,
        otpToken,
      });

      if (res.data.status === "0") {
        showPopup(
          res.data.message || "Password changed successfully",
          "success"
        );
        navigate("/login");
      } else {
        showPopup(res.data.message || "Failed to change password", "error");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Network error, please try again.";
      showPopup(msg, "error");
    } finally {
      setStatus("");
    }
  };

  return (
    <div className="fcc-page">
      <div className="cp-card">
        <div className="cp-header">
          <LuMessagesSquare size={60} />
          <h1>Messengers</h1>
          <p>Connect. Chat. Share moments instantly.</p>
          <h2>FORGOT PASSWORD OTP</h2>
        </div>

        <form className="cp-form" onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="input-label">New Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label">Confirm Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="primary-button"
            type="submit"
            disabled={status === "changing"}
          >
            {status === "changing" ? "Changing..." : "Change Password"}
          </button>
        </form>

        <div className="cp-footer">
          <p>
            Go back to{" "}
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
