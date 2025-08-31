import axios from "axios";
import { serverApi } from "../lib/config";
import { Product, ProductInquiry } from "../lib/types/product";

class ProductService {
  private readonly path: string;

  constructor() {
    this.path = serverApi;
  }

  public async getAllProducts(input: ProductInquiry): Promise<Product[]> {
    try {
      const url =
        this.path +
        `/admin/product/all?limit=${input.limit}&order=${input.order}&page=${input.page}`;
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
