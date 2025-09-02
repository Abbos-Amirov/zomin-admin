import axios from "axios";
import { Messages, serverApi } from "../lib/config";
import {
  Product,
  ProductInput,
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

  public async updateChosenProduct(
    input: ProductUpdateInput
  ): Promise<Product> {
    try {
      const url = this.path + `/admin/product/${input._id}`;
      const result = await axios.post(url, input, { withCredentials: true });
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
