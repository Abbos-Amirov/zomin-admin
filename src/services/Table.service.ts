import axios from "axios";
import { serverApi } from "../lib/config";
import { Table, TableInquiry } from "../lib/types/table";

class TableService {
  private readonly path: string;

  constructor() {
    this.path = serverApi;
  }

  public async getAllTables(input: TableInquiry): Promise<Table[]> {
    try {
      const url =
        this.path + `/admin/table/all?limit=${input.limit}&page=${input.page}`;
      const result = await axios.get(url);
      console.log("getAllTables: ", result.data);
      return result.data;
    } catch (err) {
      console.log("Error, getAllTables:", err);
      throw err;
    }
  }
}

export default TableService;
