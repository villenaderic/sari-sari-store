import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getStockMovements, getProducts } from '@/services/api';
import { StockMovement, Product } from '@/types';
import { format } from 'date-fns';

export default function Inventory() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const loadData = async () => {
    try {
      const [m, p] = await Promise.all([getStockMovements(), getProducts()]);
      setMovements(m);
      setProducts(p);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getProductName = (id: number) => {
    return products.find(p => p.id === id)?.name || `Unknown (${id})`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Movements</h1>
        <div className="flex gap-2">
          <Button variant="outline">Stock Adjustment</Button>
          <Button>Stock In</Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Prev</TableHead>
              <TableHead>New</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map(m => (
              <TableRow key={m.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(m.created_at + 'Z'), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell className="font-medium">{getProductName(m.product_id)}</TableCell>
                <TableCell>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-muted">
                    {m.movement_type}
                  </span>
                </TableCell>
                <TableCell className={m.movement_type === 'SALE' || m.movement_type === 'DAMAGE' ? 'text-destructive' : 'text-primary'}>
                  {m.movement_type === 'SALE' || m.movement_type === 'DAMAGE' || m.movement_type === 'EXPIRED' ? '-' : '+'}{Math.abs(m.quantity)}
                </TableCell>
                <TableCell>{m.previous_stock}</TableCell>
                <TableCell className="font-bold">{m.new_stock}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{m.reason || '-'}</TableCell>
              </TableRow>
            ))}
            {movements.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No stock movements found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
