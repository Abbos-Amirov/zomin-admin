import axios from "axios";
import { serverApi } from "../lib/config";
import { ProductsStat } from "../lib/types/product";

class ProductService {
  private readonly path: string;

  constructor() {
    this.path = serverApi;
  }

  public async getProductsStat(): Promise<ProductsStat[]> {
    try {
      const url = this.path + "/admin/product/all/stat";
      const result = await axios.get(url);
      console.log("getAllProducts: ", result.data);
      return result.data;
    } catch (err) {
      console.log("Error, getAllProducts:", err);
      throw err;
    }
  }
}

export default ProductService;
