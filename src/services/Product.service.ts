import axios from "axios";
import { serverApi } from "../lib/config";
import {
  Product,
  ProductInquiry,
  ProductsStat,
  ProductUpdateInput,
} from "../lib/types/product";

class ProductService {
  private readonly path: string;

  constructor() {
    this.path = serverApi;
  }

  public async getProductsStat(): Promise<ProductsStat[]> {
    try {
      const url = this.path + "/admin/product/all/stat";
      const result = await axios.get(url, { withCredentials: true });
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
      if (
        input.productCollection &&
        input.productCollection !== "ALL"
      )
        url += `&productCollection=${input.productCollection}`;
      if (input.search) url += `&search=${encodeURIComponent(input.search)}`;
      const result = await axios.get(url, {
        withCredentials: true,
        timeout: 30000,
      });
      const data = result.data;
      if (Array.isArray(data)) return data;
      if (data?.data && Array.isArray(data.data)) return data.data;
      if (data?.products && Array.isArray(data.products)) return data.products;
      if (data?.result && Array.isArray(data.result)) return data.result;
      if (data && typeof data === "object") {
        const arr = Object.values(data).find((v) => Array.isArray(v));
        if (arr) return arr as Product[];
      }
      return [];
    } catch (err) {
      console.warn("getAllProducts:", err);
      throw err;
    }
  }

  public async updateChosenProduct(
    input: ProductUpdateInput
  ): Promise<Product> {
    try {
      const { authentication, authentution, ...payload } = input as ProductUpdateInput & {
        authentication?: unknown;
        authentution?: unknown;
      };
      const url = this.path + `/admin/product/${input._id}`;
      const result = await axios.post(url, payload, { withCredentials: true });
      console.log("updateChosenProduct: ", result.data);
      return result.data;
    } catch (err) {
      console.log("Error, updateChosenProduct:", err);
      throw err;
    }
  }

  public async createNewProduct(fd: FormData): Promise<Product> {
    const { data } = await axios.post(`${serverApi}/admin/product/create`, fd, {
      withCredentials: true,
    });
    return data;
  }

  public async updateProduct(id: string, fd: FormData): Promise<Product> {
    const { data } = await axios.post(`${serverApi}/admin/product/${id}`, fd, {
      withCredentials: true,
    });
    return data;
  }
}

export default ProductService;
