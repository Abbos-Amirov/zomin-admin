import { io } from "socket.io-client";

export const serverApi: string = `${process.env.REACT_APP_API_URL}`;
export const frontendUrl: string = `${process.env.REACT_APP_FRONTEND_URL}`;

export const socket = io(serverApi, {
  transports: ["websocket"],
  withCredentials: true,
});
export const Messages = {
  error1: "Somthing went wrong!",
  error2: "Please login first!",
  error3: "Please fulfill all inputs!",
  error4: "Message is empty!",
  error5: "Only images with jpeg, jpg, png format allowed!",
};

export function dateFmt(dateInput: string | Date): string {
  const d = new Date(dateInput);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}
