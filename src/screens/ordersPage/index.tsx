import React from 'react';
import { Stack, Typography } from '@mui/material';
import { Order, OrderStatus, PaymentMethod, PaymentStatus, OrderType } from './types';
import { ORDERS_SEED } from './sampleData';
import OrdersFilters from './OrdersFilters';
import OrdersTable from './OrdersTable';
import OrderEditDialog from './OrderEditDialog';

export default function OrdersPage() {
  const [rows, setRows] = React.useState<Order[]>(ORDERS_SEED);

  // filters
  const [search, setSearch] = React.useState('');
  const [type, setType] = React.useState<OrderType | 'ALL'>('ALL');
  const [status, setStatus] = React.useState<OrderStatus | 'ALL'>('ALL');
  const [payStatus, setPayStatus] = React.useState<PaymentStatus | 'ALL'>('ALL');
  const [payMethod, setPayMethod] = React.useState<PaymentMethod | 'ALL'>('ALL');

  const [page, setPage] = React.useState(2);
  const limit = 10;

  const [editing, setEditing] = React.useState<Order | null>(null);

  React.useEffect(() => { setPage(1); }, [search, type, status, payStatus, payMethod]);

  // filter + sort (local)
  const viewRows = React.useMemo(() => {
    let r = [...rows];
    const s = search.trim().toLowerCase();
    if (s) {
      r = r.filter(o =>
        o._id.toLowerCase().includes(s) ||
        (o.tableId ?? '').toLowerCase().includes(s) ||
        (o.memberId ?? '').toLowerCase().includes(s) ||
        (o.orderNote ?? '').toLowerCase().includes(s)
      );
    }
    if (type !== 'ALL') r = r.filter(o => o.orderType === type);
    if (status !== 'ALL') r = r.filter(o => o.orderStatus === status);
    if (payStatus !== 'ALL') r = r.filter(o => o.paymentStatus === payStatus);
    if (payMethod !== 'ALL') r = r.filter(o => o.paymentMethod === payMethod);
    r.sort((a,b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return r;
  }, [rows, search, type, status, payStatus, payMethod]);

  const handleSave = (patch: { orderStatus: OrderStatus; paymentStatus: PaymentStatus; paymentMethod: PaymentMethod }) => {
    if (!editing) return;
    setRows(prev => prev.map(o => o._id === editing._id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o));
    setEditing(null);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h3" fontWeight={700} textAlign={"center"}>Orders</Typography>

      <OrdersFilters
        search={search} onSearchChange={setSearch}
        type={type} onTypeChange={setType}
        status={status} onStatusChange={setStatus}
        payStatus={payStatus} onPayStatusChange={setPayStatus}
        payMethod={payMethod} onPayMethodChange={setPayMethod}
      />

      <OrdersTable
        rows={viewRows}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onEdit={setEditing}
      />

      <OrderEditDialog
        order={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />
    </Stack>
  );
}
