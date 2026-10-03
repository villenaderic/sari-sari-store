import { invoke } from '@tauri-apps/api/core';
import type { 
  Category, 
  Product, 
  Customer, 
  UtangBalance, 
  StockMovement,
  SalePayload,
  Sale
} from '@/types';

// Categories
export const getCategories = () => invoke<Category[]>('get_categories');
export const createCategory = (name: string, description: string | null) => 
  invoke<Category>('create_category', { name, description });
export const updateCategory = (id: number, name: string, description: string | null) => 
  invoke<Category>('update_category', { id, name, description });
export const deleteCategory = (id: number) => invoke<void>('delete_category', { id });

// Products
export const getProducts = () => invoke<Product[]>('get_products');
export const createProduct = (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => 
  invoke<Product>('create_product', { product });
export const updateProduct = (product: Product) => 
  invoke<Product>('update_product', { product });
export const deleteProduct = (id: number) => invoke<void>('delete_product', { id });

// Customers
export const getCustomers = () => invoke<Customer[]>('get_customers');
export const createCustomer = (name: string, phone: string | null, address: string | null, notes: string | null) => 
  invoke<Customer>('create_customer', { name, phone, address, notes });
export const updateCustomer = (id: number, name: string, phone: string | null, address: string | null, notes: string | null, status: string) => 
  invoke<Customer>('update_customer', { id, name, phone, address, notes, status });
export const deleteCustomer = (id: number) => invoke<void>('delete_customer', { id });

// Inventory
export const getStockMovements = () => invoke<StockMovement[]>('get_stock_movements');
export const addStockMovement = (productId: number, movementType: string, quantity: number, reason: string | null) => 
  invoke<void>('add_stock_movement', { productId, movementType, quantity, reason });

// Utang
export const getUtangBalances = () => invoke<UtangBalance[]>('get_utang_balances');
export const getUtangTransactions = (accountId: number) => invoke<any[]>('get_utang_transactions', { accountId });
export const recordUtangPayment = (accountId: number, amount: number, description: string | null) => 
  invoke<void>('record_utang_payment', { accountId, amount, description });

// Sales
export const getSales = () => invoke<Sale[]>('get_sales');
export const createSale = (payload: SalePayload) => invoke<Sale>('create_sale', { payload });

// Backup
export const backupDatabase = (destination: string) => invoke<void>('backup_database', { destination });
export const restoreDatabase = (source: string) => invoke<void>('restore_database', { source });

