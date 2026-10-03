use rusqlite::Connection;
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

use crate::errors::Result;

pub struct Database {
    path: PathBuf,
}

impl Database {
    pub fn new(app_handle: &tauri::AppHandle) -> Result<Self> {
        let app_dir = app_handle.path().app_data_dir().expect("Failed to get app data dir");
        if !app_dir.exists() {
            fs::create_dir_all(&app_dir).expect("Failed to create app data dir");
        }
        let db_path = app_dir.join("sari_sari.db");
        
        let db = Database { path: db_path };
        db.init()?;
        Ok(db)
    }

    pub fn get_connection(&self) -> Result<Connection> {
        let conn = Connection::open(&self.path)?;
        // Enable foreign keys
        conn.execute("PRAGMA foreign_keys = ON;", [])?;
        Ok(conn)
    }

    fn init(&self) -> Result<()> {
        let mut conn = self.get_connection()?;
        
        let tx = conn.transaction()?;

        // Categories
        tx.execute(
            "CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;

        // Products
        tx.execute(
            "CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_id INTEGER REFERENCES categories(id),
                sku TEXT UNIQUE,
                barcode TEXT UNIQUE,
                name TEXT NOT NULL,
                unit TEXT NOT NULL,
                cost_price INTEGER NOT NULL,
                selling_price INTEGER NOT NULL,
                stock_quantity INTEGER NOT NULL DEFAULT 0,
                reorder_level INTEGER NOT NULL DEFAULT 0,
                supplier TEXT,
                status TEXT NOT NULL DEFAULT 'ACTIVE',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;

        // Customers
        tx.execute(
            "CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT,
                address TEXT,
                notes TEXT,
                status TEXT NOT NULL DEFAULT 'ACTIVE',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;

        // Sales
        tx.execute(
            "CREATE TABLE IF NOT EXISTS sales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                receipt_number TEXT NOT NULL UNIQUE,
                customer_id INTEGER REFERENCES customers(id),
                payment_type TEXT NOT NULL,
                subtotal INTEGER NOT NULL,
                total INTEGER NOT NULL,
                cash_received INTEGER NOT NULL,
                change_amount INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'COMPLETED',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;

        // Sale Items
        tx.execute(
            "CREATE TABLE IF NOT EXISTS sale_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sale_id INTEGER NOT NULL REFERENCES sales(id),
                product_id INTEGER NOT NULL REFERENCES products(id),
                quantity INTEGER NOT NULL,
                unit_price INTEGER NOT NULL,
                subtotal INTEGER NOT NULL
            )",
            [],
        )?;

        // Stock Movements
        tx.execute(
            "CREATE TABLE IF NOT EXISTS stock_movements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL REFERENCES products(id),
                movement_type TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                previous_stock INTEGER NOT NULL,
                new_stock INTEGER NOT NULL,
                reference_id TEXT,
                reason TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;

        // Utang Accounts
        tx.execute(
            "CREATE TABLE IF NOT EXISTS utang_accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL REFERENCES customers(id) UNIQUE,
                status TEXT NOT NULL DEFAULT 'ACTIVE',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;

        // Utang Transactions
        tx.execute(
            "CREATE TABLE IF NOT EXISTS utang_transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_id INTEGER NOT NULL REFERENCES utang_accounts(id),
                transaction_type TEXT NOT NULL,
                reference_id TEXT,
                amount INTEGER NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;

        // App Settings
        tx.execute(
            "CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )",
            [],
        )?;

        // Audit Logs
        tx.execute(
            "CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                entity_id INTEGER,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;

        tx.commit()?;
        Ok(())
    }
}
