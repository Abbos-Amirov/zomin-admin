
export type OrderType = 'TABLE' | 'DELIVERY' | 'TAKEOUT';
export type OrderStatus = 'PENDING' | 'PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';

export type Order = {
  _id: string;
  orderType: OrderType;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  orderTotal: number;
  deliveryFee: number;
  tableId?: string | null;
  memberId?: string | null;
  orderNote?: string;
  createdAt: string;
  updatedAt: string;
};
