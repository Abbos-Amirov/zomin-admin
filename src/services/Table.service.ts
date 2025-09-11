import axios from "axios";
import { serverApi } from "../lib/config";
import {
  Table,
  TableInput,
  TableInquiry,
  TableUpdateInput,
} from "../lib/types/table";

class TableService {
  private readonly path: string;

  constructor() {
    this.path = serverApi;
  }

  public async getAllTables(input: TableInquiry): Promise<Table[]> {
    try {
      let url =
        this.path + `/admin/table/all?limit=${input.limit}&page=${input.page}`;
      if (input.search) url += `&search=${input.search}`;
      if (input.status) url += `&status=${input.status}`;
      const result = await axios.get(url, { withCredentials: true });
      console.log("getAllTables: ", result.data);
      return result.data;
    } catch (err) {
      console.log("Error, getAllTables:", err);
      throw err;
    }
  }

  public async createNewTable(input: TableInput): Promise<Table> {
    try {
      const url = `${this.path}/admin/table/create`;
      const result = await axios.post(url, input, { withCredentials: true });
      console.log("createNewTable: ", result);
      return result.data;
    } catch (err) {
      console.log("Error, createNewTable:", err);
      throw err;
    }
  }

  public async updateChosenTable(input: TableUpdateInput): Promise<Table> {
    try {
      const url = `${this.path}/admin/table/${input._id}`;
      const result = await axios.post(url, input, { withCredentials: true });
      console.log("updateChosenTable: ", result);
      return result.data;
    } catch (err) {
      console.log("Error, updateChosenTable:", err);
      throw err;
    }
  }

  public async deleteChosenTable(id: string): Promise<boolean> {
    try {
      const url = `${this.path}/admin/table/delete/${id}`;
      const result = await axios.post(url, {}, { withCredentials: true });
      console.log("deleteChosenTable: ", result);
      return result.data;
    } catch (err) {
      console.log("Error, deleteChosenTable:", err);
      throw err;
    }
  }
}

export default TableService;
