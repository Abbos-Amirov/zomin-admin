export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING';

export type RTable = {
  _id: string;
  tableNumber: string;       
  qrToken: string;
  tableStatus: TableStatus;
  currentOrderId?: string | null;
  createdAt: string;          
  updateAt: string;           
};
