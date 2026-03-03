export interface Notification {
  id: string;
  message: string;
  title?: string;
  status?: string;
  read?: boolean;
  type?: "ORDER" | "CALL";
  tableId?: string | null;
  tableNumber?: string | null;
  orderId?: string | null;
}

