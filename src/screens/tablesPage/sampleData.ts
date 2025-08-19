import { RTable } from "./types";

const now = Date.now();
export const TABLES_SEED: RTable[] = [
  {
    _id: "t1",
    tableNumber: "1",
    qrToken: "tbl-1-abc",
    tableStatus: "AVAILABLE",
    currentOrderId: null,
    createdAt: new Date(now - 86400000).toISOString(),
    updateAt: new Date(now - 3600000).toISOString(),
  },
  {
    _id: "t2",
    tableNumber: "2",
    qrToken: "tbl-2-def",
    tableStatus: "OCCUPIED",
    currentOrderId: "66cOr001",
    createdAt: new Date(now - 7200000).toISOString(),
    updateAt: new Date(now - 1800000).toISOString(),
  },
  {
    _id: "t3",
    tableNumber: "3",
    qrToken: "tbl-3-ghi",
    tableStatus: "CLEANING",
    currentOrderId: null,
    createdAt: new Date(now - 5400000).toISOString(),
    updateAt: new Date(now - 5400000).toISOString(),
  },
  {
    _id: "t4",
    tableNumber: "4",
    qrToken: "tbl-4-jkl",
    tableStatus: "AVAILABLE",
    currentOrderId: null,
    createdAt: new Date(now - 3000000).toISOString(),
    updateAt: new Date(now - 3000000).toISOString(),
  },
  {
    _id: "t5",
    tableNumber: "5",
    qrToken: "tbl-5-mno",
    tableStatus: "OCCUPIED",
    currentOrderId: "66cOr007",
    createdAt: new Date(now - 2000000).toISOString(),
    updateAt: new Date(now - 1000000).toISOString(),
  },
];
