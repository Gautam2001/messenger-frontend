import React, { useEffect, useState } from "react";
import "./Login.css";
import { LuMessagesSquare } from "react-icons/lu";
import { usePopup } from "../../GlobalFunctions/GlobalPopup/GlobalPopupContext";
import { useApiClients } from "../../../Api/useApiClients";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { showPopup } = usePopup();
  const { loginApi, messengerApi } = useApiClients();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    sessionStorage.clear();
    const pingServers = async () => {
      try {
        const [authRes, messengerRes] = await Promise.all([
          loginApi.get("/auth/ping"),
          messengerApi.get("/messenger/ping"),
        ]);

        console.log("Auth Ping Response:", authRes.data);
        console.log("Messenger Ping Response:", messengerRes.data);
      } catch (err) {
        console.error("Ping failed:", err);
      }
    };

    pingServers();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setStatus("loading");

    try {
      const res = await messengerApi.post("/messenger/exists", {
        username,
      });
      const data = res.data;

      if (data.status === "0") {
        //continue to login
        const loginRes = await loginApi.post("/auth/login", {
          username,
          password,
        });
        const loginData = {
          ...res.data,
          ...loginRes.data,
        };

        if (loginData.status === "0") {
          showPopup(loginData.message || "Login successful!", "success");
          sessionStorage.setItem(
            "LoginData",
            JSON.stringify(loginData, null, 2)
          );
          // console.log("LoginData : " + sessionStorage.getItem("LoginData"));
          navigate("/chats");
        } else {
          showPopup(loginData.message || "Something went wrong.", "error"); //proceed  for signup
        }
      } else {
        //user does not exists in messenger table
        showPopup(data.message || "Something went wrong.", "error"); //proceed for join
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
      <div className="login-card">
        <div className="login-header">
          <LuMessagesSquare size={60} cursor={"pointer"} />
          <h1>Messengers</h1>
          <p>Connect. Chat. Share moments instantly.</p>
          <h2>LOGIN</h2>
        </div>

        <form onSubmit={handleLogin} className="login-form">
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

          <button
            className="primary-button"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Logging In..." : "Login"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            <a href="/forgot-password">Forgot Password?</a>
          </p>
          <p>
            Become a member? <a href="/signup">Sign up here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
