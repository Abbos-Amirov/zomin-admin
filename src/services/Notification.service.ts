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
  private static endpointMissing = false;
  private readonly path: string = serverApi;
  private readonly endpoints = [
    "/admin/notifications",
    "/admin/notification",
    "/admin/notification/all",
  ];

  /** Bazadagi barcha notificationlarni olish (admin sahifa ochilganda) */
  public async getNotifications(): Promise<Notification[]> {
    if (NotificationService.endpointMissing) return [];

    for (const endpoint of this.endpoints) {
      try {
        const url = `${this.path}${endpoint}`;
        const result = await axios.get<NotifFromApi[]>(url, { withCredentials: true });
        const list = Array.isArray(result.data) ? result.data : [];
        return list.map(toNotification);
      } catch (err: any) {
        const status = err?.response?.status;
        // If endpoint doesn't exist, try next possible route.
        if (status === 404) continue;
        // For auth/network/other errors, stop retries and return empty list.
        return [];
      }
    }
    // All known endpoints returned 404 in this runtime; avoid repeating noisy requests.
    NotificationService.endpointMissing = true;
    return [];
  }
}

export default NotificationService;
