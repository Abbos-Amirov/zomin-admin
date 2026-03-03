import axios from "axios";
import { serverApi } from "../lib/config";
import { Notification } from "../lib/types/notif";

/** Backend dan kelgan notification obyekti */
interface NotifFromApi {
  _id: string;
  notifType?: string;
  notifStatus?: string;
  orderId?: string | null;
  tableId?: string | null;
  title?: string;
  message?: string;
  createdAt?: string;
  updatedAt?: string;
}

function toNotification(row: NotifFromApi): Notification {
  return {
    id: String(row._id),
    message: row.title || row.message || "—",
    read: row.notifStatus === "READ",
    type: row.notifType === "ORDER" ? "ORDER" : row.notifType === "CALL" ? "CALL" : undefined,
    tableId: row.tableId ? String(row.tableId) : null,
  };
}

class NotificationService {
  private readonly path: string = serverApi;

  /** Bazadagi barcha notificationlarni olish (admin sahifa ochilganda) */
  public async getNotifications(): Promise<Notification[]> {
    try {
      const url = `${this.path}/admin/notifications`;
      const result = await axios.get<NotifFromApi[]>(url, { withCredentials: true });
      const list = Array.isArray(result.data) ? result.data : [];
      return list.map(toNotification);
    } catch (err) {
      console.log("Error, getNotifications:", err);
      return [];
    }
  }
}

export default NotificationService;
