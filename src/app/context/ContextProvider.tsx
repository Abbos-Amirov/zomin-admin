import React, { ReactNode, useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { Member } from "../../lib/types/member";
import { GlobalContext } from "../hooks/useGlobals";
import { socket } from "../../lib/config";
import { Notification } from "../../lib/types/notif";

const ContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const cookies = new Cookies();
  if (!cookies.get("accessToken")) {
    localStorage.removeItem("memberData");
  }

  const [authMember, setAuthMember] = useState<Member | null>(
    localStorage.getItem("memberData")
      ? JSON.parse(localStorage.getItem("memberData") as string)
      : null
  );

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connect error:", err.message);
    });

    socket.on("newNotification", (notif: Notification) => {
      console.log("📩 newNotif:", notif);
      setNotifications((prev) => [
        { ...notif, read: false }, // har doim unread
        ...prev,
      ]);
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
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default ContextProvider;
