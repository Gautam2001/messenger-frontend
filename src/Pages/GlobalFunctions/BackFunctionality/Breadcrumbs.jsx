import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Breadcrumbs.css";

const Breadcrumbs = ({ labelMap = {}, extraPaths = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const loginData = sessionStorage.getItem("LoginData")
    ? JSON.parse(sessionStorage.getItem("LoginData"))
    : null;
  const role = loginData?.role;

  const basePath = role === "ADMIN" ? "/admin-dashboard" : "/dashboard";
  const baseLabel = role === "ADMIN" ? "Dashboard" : "Home";

  const pathnames = location.pathname.split("/").filter((x) => x);
  const buildPath = (index) => "/" + pathnames.slice(0, index + 1).join("/");

  return (
    <div className="breadcrumb">
      <span onClick={() => navigate(basePath)}>{baseLabel}</span>

      {extraPaths.map(({ label, path }, i) => (
        <span key={`extra-${i}`}>
          {" / "}
          <span className="breadcrumb-link" onClick={() => navigate(path)}>
            {label}
          </span>
        </span>
      ))}

      {pathnames.map((name, index) => {
        const routeTo = buildPath(index);
        const isLast = index === pathnames.length - 1;
        const label = labelMap[name] || decodeURIComponent(name);

        return (
          <span key={routeTo}>
            {" / "}
            {isLast ? (
              <span className="breadcrumb-current">{label}</span>
            ) : (
              <span
                className="breadcrumb-link"
                onClick={() => navigate(routeTo)}
              >
                {label}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;
