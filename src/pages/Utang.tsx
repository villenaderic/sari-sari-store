import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCustomers, getUtangBalances, recordUtangPayment } from '@/services/api';
import { Customer, UtangBalance } from '@/types';
import { Search, Receipt } from 'lucide-react';

export default function Utang() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [balances, setBalances] = useState<UtangBalance[]>([]);
  const [search, setSearch] = useState('');
  
  const loadData = async () => {
    try {
      const [c, b] = await Promise.all([getCustomers(), getUtangBalances()]);
      setCustomers(c);
      setBalances(b);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePayment = async (accountId: number, customerName: string) => {
    const amountStr = prompt(`Enter payment amount (₱) for ${customerName}:`);
    if (!amountStr) return;
    const amount = parseFloat(amountStr) * 100;
    if (isNaN(amount) || amount <= 0) {
      return alert("Invalid amount.");
    }
    
    try {
      await recordUtangPayment(accountId, amount, "Manual Payment");
      alert("Payment recorded!");
      loadData();
    } catch (error: any) {
      alert("Failed to record payment: " + error);
    }
  };

  const rows = customers.map(c => {
    const balance = balances.find(b => b.customer_id === c.id);
    return {
      ...c,
      account_id: balance?.account_id,
      balance: balance?.balance || 0,
    };
  }).filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) && r.balance > 0
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Utang Ledger</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search active utang..." 
            className="pl-8" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Outstanding Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(row => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.phone || '-'}</TableCell>
                <TableCell className="font-bold text-warning">₱{(row.balance / 100).toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  {row.account_id && (
                    <Button variant="outline" size="sm" onClick={() => handlePayment(row.account_id!, row.name)}>
                      <Receipt className="mr-2 h-4 w-4" />
                      Pay
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No active utang found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
