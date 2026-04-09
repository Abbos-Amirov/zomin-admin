import { TableStatus } from "../enums/table.enum";
import { TableCall } from "../enums/tableCall.enum";

export interface Table {
  _id: string;
  tableNumber: string;
  qrToken: string;
  tableStatus: TableStatus;
  tableCall: TableCall;
  activeIdentifier: string;
  createdAt: Date;
  updatedAt: Date;
  /** Ixtiyoriy matn — backend qabul qilgan qiymat */
  tableKind?: string;
}

export interface TableInput {
  tableNumber: string;
  qrToken?: string;
  tableStatus?: TableStatus;
  tableKind?: string;
}

export interface TableUpdateInput {
  _id: string;
  tableNumber?: string;
  qrToken?: string;
  tableStatus?: TableStatus;
  tableCall?: TableCall;
  activeIdentifier?: string | null;
  tableKind?: string;
}

export interface TableInquiry {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}
