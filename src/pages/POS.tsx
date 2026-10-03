import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getProducts, getCustomers, createSale } from '@/services/api';
import { Product, Customer } from '@/types';
import { Search, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentType, setPaymentType] = useState<"CASH" | "CREDIT">("CASH");
  const [cashReceived, setCashReceived] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error);
    getCustomers().then(setCustomers).catch(console.error);
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.barcode && p.barcode.includes(search)) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      alert("Out of stock!");
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
           alert("Cannot exceed available stock.");
           return prev;
        }
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQ = item.quantity + delta;
        if (newQ > item.product.stock_quantity) {
          alert("Cannot exceed available stock.");
          return item;
        }
        return { ...item, quantity: Math.max(1, newQ) };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const totalCents = cart.reduce((sum, item) => sum + (item.product.selling_price * item.quantity), 0);
  const totalDisplay = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(totalCents / 100);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty");
    
    if (paymentType === "CREDIT" && !selectedCustomerId) {
      return alert("Please select a customer for credit sales.");
    }

    const cash = Math.round((parseFloat(cashReceived) || 0) * 100);
    if (paymentType === "CASH" && cash < totalCents) {
      return alert("Insufficient cash received.");
    }

    try {
      await createSale({
        customer_id: selectedCustomerId,
        payment_type: paymentType,
        cash_received: paymentType === "CASH" ? cash : 0,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.selling_price
        }))
      });
      
      alert("Sale completed successfully!");
      setCart([]);
      setCashReceived('');
      setSelectedCustomerId(null);
      // reload products to update stock
      getProducts().then(setProducts).catch(console.error);
    } catch (error: any) {
      alert("Failed to complete sale: " + error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6">
      {/* Products Section */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products, barcode, SKU..." 
              className="pl-8" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
            {filteredProducts.map(product => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:border-primary transition-colors flex flex-col"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="font-semibold text-sm line-clamp-2">{product.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">Stock: {product.stock_quantity}</div>
                  </div>
                  <div className="font-bold text-primary mt-2">
                    ₱{(product.selling_price / 100).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-[400px] flex flex-col gap-4 bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-muted/20 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <h2 className="font-semibold text-lg">Current Sale</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Cart is empty
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.product.id} className="flex gap-2 items-center">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.product.name}</div>
                    <div className="text-xs text-muted-foreground">₱{(item.product.selling_price / 100).toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, -1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product.id, 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="font-semibold text-sm w-16 text-right">
                    ₱{((item.product.selling_price * item.quantity) / 100).toFixed(2)}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-muted/10 space-y-4">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total</span>
            <span className="text-primary">{totalDisplay}</span>
          </div>

          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              variant={paymentType === 'CASH' ? 'default' : 'outline'}
              onClick={() => setPaymentType('CASH')}
            >
              CASH
            </Button>
            <Button 
              className="flex-1" 
              variant={paymentType === 'CREDIT' ? 'default' : 'outline'}
              onClick={() => setPaymentType('CREDIT')}
            >
              UTANG (CREDIT)
            </Button>
          </div>

          {paymentType === 'CASH' ? (
            <div className="space-y-2">
              <label className="text-xs font-medium">Cash Received (₱)</label>
              <Input 
                type="number" 
                placeholder="Enter amount..." 
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
              />
              {cashReceived && parseFloat(cashReceived) * 100 >= totalCents && (
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>Change:</span>
                  <span className="font-bold text-foreground">₱{((parseFloat(cashReceived) * 100 - totalCents) / 100).toFixed(2)}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-medium">Select Customer</label>
              <select 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={selectedCustomerId || ""}
                onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
              >
                <option value="" disabled>Select customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <Button 
            className="w-full h-12 text-lg font-bold" 
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            Complete Sale
          </Button>
        </div>
      </div>
    </div>
  );
}
