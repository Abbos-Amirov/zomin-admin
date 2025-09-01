import axios from "axios";
import { serverApi } from "../lib/config";
import { Product, ProductInquiry, ProductsStat } from "../lib/types/product";

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

  public async getAllProducts(input: ProductInquiry): Promise<Product[]> {
    try {
      let url =
        this.path +
        `/admin/product/all?limit=${input.limit}&order=${input.order}&page=${input.page}`;
      if (input.productCollection)
        url += `&productCollection=${input.productCollection}`;
      if (input.search) url += `&search=${input.search}`;
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
