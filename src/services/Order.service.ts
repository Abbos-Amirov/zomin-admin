import axios from "axios";
import { serverApi } from "../lib/config";
import {
  Order,
  OrderInquiry,
  OrderStatis,
  OrderUpdateInput,
} from "../lib/types/order";

class OrderService {
  private readonly path: string;

  constructor() {
    this.path = serverApi;
  }

  public async getOrderStatis(): Promise<OrderStatis> {
    try {
      const url = this.path + "/admin/order/statis";
      const result = await axios.get(url, { withCredentials: true });
      console.log("getOrderStatis: ", result.data);
      return result.data;
    } catch (err) {
      console.log("Error, getOrderStatis:", err);
      throw err;
    }
  }

  public async getCompletedOrdersWithDetails(): Promise<any[]> {
    try {
      const url = `${this.path}/admin/order/all?page=1&limit=50000&status=COMPLETED`;
      const result = await axios.get(url, { withCredentials: true });
      const payload = result.data;
      return (
        Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.orders)
          ? payload.orders
          : Array.isArray(payload?.data?.orders)
          ? payload.data.orders
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.result)
          ? payload.result
          : Array.isArray(payload?.rows)
          ? payload.rows
          : []
      ) as any[];
    } catch (err) {
      console.warn("getCompletedOrdersWithDetails:", err);
      return [];
    }
  }

  public async getOrdersForStats(): Promise<Order[]> {
    try {
      const url = `${this.path}/admin/order/all?page=1&limit=50000&status=COMPLETED&payStatus=PAID`;
      const result = await axios.get(url, { withCredentials: true });
      const payload = result.data;
      return (
        Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.orders)
          ? payload.orders
          : Array.isArray(payload?.data?.orders)
          ? payload.data.orders
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.result)
          ? payload.result
          : Array.isArray(payload?.rows)
          ? payload.rows
          : []
      ) as Order[];
    } catch (err) {
      console.warn("getOrdersForStats:", err);
      return [];
    }
  }

  /** Link orqali olib ketish (saboy) buyurtmalari */
  public async getLinkTakeoutOrders(): Promise<any[]> {
    try {
      const url = `${this.path}/admin/order/link/takeout`;
      const result = await axios.get(url, { withCredentials: true });
      const payload = result.data;
      return (
        Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.orders)
          ? payload.orders
          : Array.isArray(payload?.result)
          ? payload.result
          : []
      ) as any[];
    } catch (err) {
      console.warn("getLinkTakeoutOrders:", err);
      return [];
    }
  }

  /** Link orqali o‘tirib yeyish buyurtmalari (mijoz ismi, telefon, kelish vaqti) */
  public async getLinkDineInOrders(): Promise<any[]> {
    try {
      const url = `${this.path}/admin/order/link/dine-in`;
      const result = await axios.get(url, { withCredentials: true });
      const payload = result.data;
      return (
        Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.orders)
          ? payload.orders
          : Array.isArray(payload?.result)
          ? payload.result
          : []
      ) as any[];
    } catch (err) {
      console.warn("getLinkDineInOrders:", err);
      return [];
    }
  }

  public async getOrderById(orderId: string): Promise<any> {
    try {
      const url = `${this.path}/admin/order/${orderId}`;
      const result = await axios.get(url, { withCredentials: true });
      return result.data;
    } catch (err) {
      console.warn("getOrderById:", err);
      throw err;
    }
  }

  public async getAllOrders(input: OrderInquiry): Promise<Order[]> {
    try {
      let url = `${this.path}/admin/order/all?page=${input.page}&limit=${input.limit}`;
      if (input.search) url += `&search=${input.search}`;
      if (input.type) url += `&type=${input.type}`;
      if (input.status) url += `&status=${input.status}`;
      if (input.payStatus) url += `&payStatus=${input.payStatus}`;
      if (input.payMeth) url += `&payMeth=${input.payMeth}`;
      const result = await axios.get(url, { withCredentials: true });
      console.log("getAllOrders: ", result);
      return result.data;
    } catch (err) {
      console.log("Error, getOrderStatis:", err);
      throw err;
    }
  }

  public async updateChosenOrder(input: OrderUpdateInput): Promise<Order> {
    try {
      const url = `${this.path}/admin/order/${input.orderId}`;
      const result = await axios.post(url, input, { withCredentials: true });
      console.log("updateChosenOrder: ", result);
      return result.data;
    } catch (err) {
      console.log("Error, updateChosenOrder:", err);
      throw err;
    }
  }

  public async completeTableOrders(tableId: string): Promise<unknown> {
    try {
      const url = `${this.path}/admin/order/table/${tableId}/complete`;
      const result = await axios.post(url, {}, { withCredentials: true });
      console.log("completeTableOrders: ", result);
      return result.data;
    } catch (err) {
      console.log("Error, completeTableOrders:", err);
      throw err;
    }
  }
}

export default OrderService;
