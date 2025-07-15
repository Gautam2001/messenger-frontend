import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { PopupEventBus } from "./PopupEventBus";

const GlobalPopupContext = createContext();

export const usePopup = () => useContext(GlobalPopupContext);

export const GlobalPopupProvider = ({ children }) => {
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showPopup = useCallback(
    (message, type = "success", duration = 4000) => {
      setPopup({ show: true, message, type });

      setTimeout(() => {
        setPopup({ show: false, message: "", type: "success" });
      }, duration);
    },
    []
  );

  const closePopup = () => {
    setPopup({ show: false, message: "", type: "success" });
  };

  useEffect(() => {
    const listener = (message, type) => showPopup(message, type);
    PopupEventBus.on(listener);
    return () => PopupEventBus.off(listener);
  }, []);

  return (
    <GlobalPopupContext.Provider value={{ showPopup, closePopup }}>
      {children}
      {popup.show && <GlobalPopup message={popup.message} type={popup.type} />}
    </GlobalPopupContext.Provider>
  );
};

const GlobalPopup = ({ message, type }) => {
  return <div className={`global-popup ${type}`}>{message}</div>;
};
