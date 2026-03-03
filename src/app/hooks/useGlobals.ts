import { createContext, useContext, Dispatch, SetStateAction } from "react";
import { Member } from "../../lib/types/member";
import { Notification } from "../../lib/types/notif";

interface GlobalInterface {
  authMember: Member | null;
  setAuthMember: Dispatch<SetStateAction<Member | null>>;
  notifications: Notification[];
  setNotifications: Dispatch<SetStateAction<Notification[]>>;
  notificationAlert: Notification | null;
  setNotificationAlert: Dispatch<SetStateAction<Notification | null>>;
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
}

export const GlobalContext = createContext<GlobalInterface | undefined>(
  undefined
);

export const useGlobals = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobals must be used within Provider");
  return context;
};
