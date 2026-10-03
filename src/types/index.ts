export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  category_id: number | null;
  sku: string | null;
  barcode: string | null;
  name: string;
  unit: string;
  cost_price: number; // in centavos
  selling_price: number; // in centavos
  stock_quantity: number;
  reorder_level: number;
  supplier: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UtangBalance {
  customer_id: number;
  account_id: number;
  balance: number;
}

export interface StockMovement {
  id: number;
  product_id: number;
  movement_type: string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reference_id: string | null;
  reason: string | null;
  created_at: string;
}

export interface SaleItemPayload {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface SalePayload {
  customer_id: number | null;
  payment_type: "CASH" | "CREDIT";
  cash_received: number;
  items: SaleItemPayload[];
}

export interface Sale {
  id: number;
  receipt_number: string;
  customer_id: number | null;
  payment_type: string;
  subtotal: number;
  total: number;
  cash_received: number;
  change_amount: number;
  status: string;
  created_at: string;
}
