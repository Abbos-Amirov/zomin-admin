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
