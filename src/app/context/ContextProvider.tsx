import React, { ReactNode, useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { Member } from "../../lib/types/member";
import { GlobalContext } from "../hooks/useGlobals";
import { socket } from "../../lib/config";

const ContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const cookies = new Cookies();
  if (!cookies.get("accessToken")) localStorage.removeItem("memberData");

  const [authMember, setAuthMember] = useState<Member | null>(
    localStorage.getItem("memberData")
      ? JSON.parse(localStorage.getItem("memberData") as string)
      : null
  );

  const [tableCall, setTableCall] = useState<any[]>([]);
  const [newOrder, setNewOrder] = useState<any[]>([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });
    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err.message);
    });

    socket.on("tableCall", (call) => {
      console.log("table Call:", call);
      setTableCall((prev) => [call, ...prev]);
    });
    socket.on("newOrder", (order) => {
      console.log("table Call:", order);
      setTableCall((prev) => [order, ...prev]);
    });

    // cleanup
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
        tableCall,
        setTableCall,
        newOrder,
        setNewOrder,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default ContextProvider;
