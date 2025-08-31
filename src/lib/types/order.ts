import {
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
} from "../enums/order.enum";

export interface OrderItem {
  _id: string;
  itemQuantity: number;
  itemPrice: number;
  orderId: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: string;
  orderType: OrderType;
  orderStatus: OrderStatus;
  orderTotal: number;
  deliveryFee: number;
  tableId: string | null;
  memberId: string | null;
  orderNote: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
  /** from aggregations */
  // orderItems: OrderItem[];
  // productData: Product[];
}

export interface OrderItemInput {
  itemQuantity: number;
  itemPrice: number;
  productId: string;
  orderId?: string;
}

export interface OrderUpdateInput {
  orderId: string;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
}

export interface OrderInquiry {
  page: number;
  limit: number;
  type?: OrderType;
  status?: OrderStatus;
  payStatus?: PaymentMethod;
  search?: string;
  orderStatus?: OrderStatus;
}

export interface OrderInput {
  orderType: OrderType;
  orderStatus?: OrderStatus;
  orderTotal: number;
  deliveryFee: number;
  tableId?: string;
  memberId?: string;
  orderNote?: string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
}

export interface OrderStatis {
  totalOrder: number;
  pendingOrder: number;
  complatedOrder: number;
  todayIncomeAndAOV: TodayIncomeAndAOV[];
  ordersByCategory: OrdersByCategory[];
  topSellingItems: TopSellingItems[];
}

export interface TodayIncomeAndAOV {
  totalSum: number;
  deliverySum: number;
  aovGross: number;
}

export interface OrdersByCategory {
  collection: string;
  totalQuantity: number;
  revenue: number;
  orders: number;
}

export interface TopSellingItems{
  productId: string;
  productName: string;
  totalQuantity:number;
}

