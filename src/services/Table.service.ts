import axios from "axios";
import { serverApi } from "../lib/config";
import {
  Table,
  TableInput,
  TableInquiry,
  TableUpdateInput,
} from "../lib/types/table";

/** Backend JSON: tableKind / table_kind; ba'zi sxemalarda `type` */
function normalizeTableRow(raw: Record<string, unknown>): Table {
  let tableKindRaw: unknown =
    raw.tableKind ?? raw.table_kind ?? raw["tableKind"] ?? raw["table_kind"];
  if (
    (tableKindRaw == null || String(tableKindRaw).trim() === "") &&
    raw.type != null &&
    (typeof raw.type === "string" || typeof raw.type === "number")
  ) {
    tableKindRaw = raw.type;
  }
  const tableKind =
    tableKindRaw != null && String(tableKindRaw).trim() !== ""
      ? String(tableKindRaw).trim()
      : undefined;
  return { ...(raw as unknown as Table), tableKind };
}

/** Inputdan stol turini olish */
function pickTableKind(
  input: TableInput | TableUpdateInput
): string | undefined {
  const v = input.tableKind;
  if (v == null) return undefined;
  const s = String(v).trim();
  return s.length > 0 ? s : undefined;
}

/** Bodyga tableKind + table_kind (type yuborilmaydi — Mongoose bilan to‘qnashuv) */
function applyTableKind(
  body: Record<string, unknown>,
  input: TableInput | TableUpdateInput
): void {
  const k = pickTableKind(input);
  if (!k) {
    delete body.tableKind;
    delete body.table_kind;
    return;
  }
  body.tableKind = k;
  body.table_kind = k;
}

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
      const raw = result.data;
      const list = Array.isArray(raw) ? raw : [];
      return list.map((row) =>
        normalizeTableRow(row as Record<string, unknown>)
      );
    } catch (err) {
      console.log("Error, getAllTables:", err);
      throw err;
    }
  }

  public async createNewTable(input: TableInput): Promise<Table> {
    try {
      const url = `${this.path}/admin/table/create`;
      const body: Record<string, unknown> = {
        tableNumber: input.tableNumber,
        tableStatus: input.tableStatus,
        table_number: input.tableNumber,
        table_status: input.tableStatus,
      };
      if (input.qrToken) {
        body.qrToken = input.qrToken;
        body.qr_token = input.qrToken;
      }
      applyTableKind(body, input);
      const result = await axios.post(url, body, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      console.log("createNewTable: ", result);
      return normalizeTableRow(result.data as Record<string, unknown>);
    } catch (err) {
      console.log("Error, createNewTable:", err);
      throw err;
    }
  }

  public async updateChosenTable(input: TableUpdateInput): Promise<Table> {
    try {
      const url = `${this.path}/admin/table/${input._id}`;
      // { ...input } ishlatilmaydi — _id bodyda bo‘lmasin; faqat aniq maydonlar (Postman kabi)
      const body: Record<string, unknown> = {};
      if (input.tableNumber !== undefined) {
        body.tableNumber = input.tableNumber;
        body.table_number = input.tableNumber;
      }
      if (input.tableStatus !== undefined) {
        body.tableStatus = input.tableStatus;
        body.table_status = input.tableStatus;
      }
      if (input.qrToken !== undefined) {
        body.qrToken = input.qrToken;
        body.qr_token = input.qrToken;
      }
      if (input.tableCall !== undefined) {
        body.tableCall = input.tableCall;
        body.table_call = input.tableCall;
      }
      if (input.activeIdentifier !== undefined) {
        body.activeIdentifier = input.activeIdentifier;
      }
      applyTableKind(body, input);
      const result = await axios.post(url, body, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      console.log("updateChosenTable: ", result);
      return normalizeTableRow(result.data as Record<string, unknown>);
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
