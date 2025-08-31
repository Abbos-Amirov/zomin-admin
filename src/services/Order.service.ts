import axios from "axios";
import { serverApi } from "../lib/config";
import { OrderStatis } from "../lib/types/order";

class OrderService {
  private readonly path: string;

  constructor() {
    this.path = serverApi;
  }

  public async getOrderStatis(): Promise<OrderStatis> {
    try {
      const url = this.path + "/admin/order/statis";
      const result = await axios.get(url);
      console.log("getOrderStatis: ", result.data);
      return result.data;
    } catch (err) {
      console.log("Error, getOrderStatis:", err);
      throw err;
    }
  }
}

export default OrderService;
