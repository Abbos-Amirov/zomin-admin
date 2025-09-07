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
}

export interface TableInput {
  tableNumber: string;
  qrToken?: string;
  tableStatus?: TableStatus;
}

export interface TableUpdateInput {
  _id: string;
  tableNumber?: string;
  qrToken?: string;
  tableStatus?: TableStatus;
  tableCall?: TableCall;
  activeIdentifier?: string | null;
}

export interface TableInquiry {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}
