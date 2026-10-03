import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  getProducts, 
  getCustomers, 
  getUtangBalances
} from '@/services/api';
import { Product, Customer, UtangBalance } from '@/types';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [utangBalances, setUtangBalances] = useState<UtangBalance[]>([]);
  
  useEffect(() => {
    async function loadData() {
      try {
        const [p, c, ub] = await Promise.all([
          getProducts(),
          getCustomers(),
          getUtangBalances()
        ]);
        setProducts(p);
        setCustomers(c);
        setUtangBalances(ub);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    }
    loadData();
  }, []);

  const totalOutstandingUtang = utangBalances.reduce((sum, ub) => sum + ub.balance, 0);
  const customersWithUtang = utangBalances.filter(ub => ub.balance > 0).length;
  const lowStockProducts = products.filter(p => p.stock_quantity <= p.reorder_level);
  
  // Format as PHP Currency
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of your store's performance today.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Utang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{formatCurrency(totalOutstandingUtang)}</div>
            <p className="text-xs text-muted-foreground">From {customersWithUtang} customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">Items needing reorder</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Registered in inventory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
