import React, { useState } from "react";
import "./ResetPassword.css";
import { usePopup } from "../GlobalFunctions/GlobalPopup/GlobalPopupContext";
import { useApiClients } from "../../Api/useApiClients";

const ResetPassword = ({ onClose }) => {
  const loginData = JSON.parse(sessionStorage.getItem("LoginData"));
  const username = loginData?.username || "User";
  const { loginApi } = useApiClients();
  const { showPopup } = usePopup();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1 = verify old password, Step 2 = new password
  const [otp, setOtp] = useState(null);

  // Step 1: Verify old password
  const handleVerifyOldPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    const oldPassword = e.target.oldPassword.value;

    try {
      const res = await loginApi.post("/auth/request-reset-password", {
        username,
        password: oldPassword,
      });

      if (res.data.status === "0") {
        setOtp(res.data.otpToken); // backend must return this
        showPopup("Old password verified. Enter new password.", "success");
        setStep(2);
      } else {
        showPopup(res.data.message || "Invalid old password", "error");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Network error while verifying password.";
      showPopup(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    // Validate strength
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      showPopup(
        "Password must be at least 8 chars, include uppercase, lowercase, number, and special char.",
        "error"
      );
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      showPopup("Passwords do not match", "error");
      setLoading(false);
      return;
    }

    try {
      const res = await loginApi.post("/auth/reset-password", {
        username,
        newPassword,
        otpToken: otp,
      });

      if (res.data.status === "0") {
        showPopup("Password reset successfully", "success");
        onClose();
      } else {
        showPopup(res.data.message || "Failed to reset password", "error");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Network error while resetting password.";
      showPopup(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {step === 1 && (
        <form className="rp-form" onSubmit={handleVerifyOldPassword}>
          <input
            type="password"
            name="oldPassword"
            placeholder="Enter Old Password"
            required
            className="rp-input"
          />
          <div className="rp-actions">
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Verifying..." : "Next"}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form className="rp-form" onSubmit={handleResetPassword}>
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            required
            className="rp-input"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            required
            className="rp-input"
          />
          <div className="rp-actions">
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Resetting..." : "Submit"}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
