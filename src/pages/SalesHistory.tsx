import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSales, getCustomers } from '@/services/api';
import { Sale, Customer } from '@/types';
import { format } from 'date-fns';

export default function SalesHistory() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    getSales().then(setSales).catch(console.error);
    getCustomers().then(setCustomers).catch(console.error);
  }, []);

  const getCustomerName = (id: number | null) => {
    if (!id) return 'Walk-in';
    return customers.find(c => c.id === id)?.name || `Unknown (${id})`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Sales History</h1>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map(sale => (
              <TableRow key={sale.id}>
                <TableCell className="font-mono text-xs">{sale.receipt_number}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(sale.created_at + 'Z'), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell>{getCustomerName(sale.customer_id)}</TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${sale.payment_type === 'CASH' ? 'bg-secondary text-secondary-foreground' : 'bg-warning text-warning-foreground'}`}>
                    {sale.payment_type}
                  </span>
                </TableCell>
                <TableCell className="font-bold">₱{(sale.total / 100).toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold ${sale.status === 'COMPLETED' ? 'text-primary' : 'text-destructive'}`}>
                    {sale.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No sales found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
