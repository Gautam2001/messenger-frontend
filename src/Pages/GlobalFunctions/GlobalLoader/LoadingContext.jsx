import React, { createContext, useContext, useRef, useState } from "react";
import "./LoadingScreen.css";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const delayTimeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const startTimeRef = useRef(null);
  const minVisibleRef = useRef(1000);

  const showLoader = (delay = 300, minVisible = 1000) => {
    clearTimeout(delayTimeoutRef.current);
    clearTimeout(hideTimeoutRef.current);

    minVisibleRef.current = minVisible;

    delayTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      startTimeRef.current = Date.now();
    }, delay);
  };

  const hideLoader = () => {
    clearTimeout(delayTimeoutRef.current);

    if (isVisible) {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = minVisibleRef.current - elapsed;

      if (remaining > 0) {
        hideTimeoutRef.current = setTimeout(
          () => setIsVisible(false),
          remaining
        );
      } else {
        setIsVisible(false);
      }
    } else {
      setIsVisible(false);
    }
  };

  return (
    <LoadingContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      {isVisible && <LoadingScreen />}
    </LoadingContext.Provider>
  );
};

const LoadingScreen = () => {
  return (
    <div className="global-loading-overlay">
      <div className="global-loading-spinner" />
    </div>
  );
};

export const useLoading = () => useContext(LoadingContext);
