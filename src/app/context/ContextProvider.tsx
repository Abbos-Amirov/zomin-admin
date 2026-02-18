import React, { ReactNode, useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { Member } from "../../lib/types/member";
import { GlobalContext } from "../hooks/useGlobals";
import { socket } from "../../lib/config";
import { Notification } from "../../lib/types/notif";

const ContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authMember, setAuthMember] = useState<Member | null>(() => {
    const storedMember = localStorage.getItem("memberData");
    return storedMember ? JSON.parse(storedMember) : null;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const storedNotifications = localStorage.getItem("notifications");
    return storedNotifications ? JSON.parse(storedNotifications) : [];
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem("darkMode");
    return stored ? JSON.parse(stored) === true : false;
  });

  useEffect(() => {
    const cookies = new Cookies();
    const accessToken = cookies.get("accessToken");

    if (!accessToken) {
      localStorage.removeItem("memberData");
      setAuthMember(null);
    } else {
      const storedMember = localStorage.getItem("memberData");
      if (storedMember && !authMember) {
        setAuthMember(JSON.parse(storedMember));
      }
    }
  }, []);

  useEffect(() => {
    if (authMember) {
      localStorage.setItem("memberData", JSON.stringify(authMember));
    } else {
      localStorage.removeItem("memberData");
    }
  }, [authMember]);

  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem("notifications", JSON.stringify(notifications));
    } else {
      localStorage.removeItem("notifications");
    }
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connect error:", err.message);
    });

    socket.on("newNotification", (notif: Notification) => {
      console.log("📩 newNotif:", notif);
      setNotifications((prev) => {
        const updated = [{ ...notif, read: false }, ...prev];
        return updated;
      });
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("newNotification");
    };
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        authMember,
        setAuthMember,
        notifications,
        setNotifications,
        darkMode,
        setDarkMode,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default ContextProvider;
