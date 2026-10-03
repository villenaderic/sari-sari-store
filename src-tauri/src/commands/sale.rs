use crate::models::sale::Sale;
use crate::errors::{Result, AppError};
use tauri::State;
use crate::database::Database;
use rusqlite::params;
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct NewSalePayload {
    pub customer_id: Option<i64>,
    pub payment_type: String, // "CASH" or "CREDIT"
    pub cash_received: i64,
    pub items: Vec<NewSaleItemPayload>,
}

#[derive(Deserialize, Debug)]
pub struct NewSaleItemPayload {
    pub product_id: i64,
    pub quantity: i32,
    pub unit_price: i64,
}

#[tauri::command]
pub fn get_sales(db: State<'_, Database>) -> Result<Vec<Sale>> {
    let conn = db.get_connection()?;
    let mut stmt = conn.prepare("SELECT id, receipt_number, customer_id, payment_type, subtotal, total, cash_received, change_amount, status, created_at FROM sales ORDER BY created_at DESC")?;
    
    let sales = stmt.query_map([], |row| {
        Ok(Sale {
            id: row.get(0)?,
            receipt_number: row.get(1)?,
            customer_id: row.get(2)?,
            payment_type: row.get(3)?,
            subtotal: row.get(4)?,
            total: row.get(5)?,
            cash_received: row.get(6)?,
            change_amount: row.get(7)?,
            status: row.get(8)?,
            created_at: row.get(9)?
        })
    })?.collect::<std::result::Result<Vec<_>, _>>()?;
    
    Ok(sales)
}

#[tauri::command]
pub fn create_sale(db: State<'_, Database>, payload: NewSalePayload) -> Result<Sale> {
    let mut conn = db.get_connection()?;
    let tx = conn.transaction()?;

    let mut subtotal: i64 = 0;
    
    // Validate stock and calculate subtotal
    for item in &payload.items {
        if item.quantity <= 0 {
            return Err(AppError::Validation("Quantity must be greater than zero".into()));
        }
        
        let stock_query: i32 = tx.query_row("SELECT stock_quantity FROM products WHERE id = ?1", params![item.product_id], |row| row.get(0))?;
        if stock_query < item.quantity {
            return Err(AppError::BusinessRule("Insufficient stock".into()));
        }

        subtotal += (item.quantity as i64) * item.unit_price;
    }

    let total = subtotal; // Apply discounts if we had them
    
    let change_amount = if payload.payment_type == "CASH" {
        payload.cash_received - total
    } else {
        0
    };

    if payload.payment_type == "CASH" && payload.cash_received < total {
        return Err(AppError::Validation("Cash received is less than total".into()));
    }

    if payload.payment_type == "CREDIT" && payload.customer_id.is_none() {
        return Err(AppError::Validation("Customer is required for credit sales".into()));
    }

    let receipt_number = uuid::Uuid::new_v4().to_string(); // Requires uuid crate or we can generate it

    tx.execute(
        "INSERT INTO sales (receipt_number, customer_id, payment_type, subtotal, total, cash_received, change_amount) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![receipt_number, payload.customer_id, payload.payment_type, subtotal, total, payload.cash_received, change_amount]
    )?;
    
    let sale_id = tx.last_insert_rowid();

    for item in &payload.items {
        let item_subtotal = (item.quantity as i64) * item.unit_price;
        tx.execute(
            "INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![sale_id, item.product_id, item.quantity, item.unit_price, item_subtotal]
        )?;

        let previous_stock: i32 = tx.query_row("SELECT stock_quantity FROM products WHERE id = ?1", params![item.product_id], |row| row.get(0))?;
        let new_stock = previous_stock - item.quantity;
        
        tx.execute(
            "UPDATE products SET stock_quantity = ?1 WHERE id = ?2",
            params![new_stock, item.product_id]
        )?;

        tx.execute(
            "INSERT INTO stock_movements (product_id, movement_type, quantity, previous_stock, new_stock, reference_id, reason) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![item.product_id, "SALE", item.quantity, previous_stock, new_stock, sale_id.to_string(), "Sale"]
        )?;
    }

    if payload.payment_type == "CREDIT" {
        if let Some(cust_id) = payload.customer_id {
            let account_id: i64 = tx.query_row("SELECT id FROM utang_accounts WHERE customer_id = ?1", params![cust_id], |row| row.get(0))?;
            
            tx.execute(
                "INSERT INTO utang_transactions (account_id, transaction_type, reference_id, amount, description) VALUES (?1, ?2, ?3, ?4, ?5)",
                params![account_id, "CREDIT_SALE", sale_id.to_string(), total, format!("Sale #{}", receipt_number)]
            )?;
            
            tx.execute("UPDATE utang_accounts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?1", params![account_id])?;
        }
    }

    tx.commit()?;

    let conn2 = db.get_connection()?;
    let sale = conn2.query_row(
        "SELECT id, receipt_number, customer_id, payment_type, subtotal, total, cash_received, change_amount, status, created_at FROM sales WHERE id = ?1", 
        params![sale_id], 
        |row| {
            Ok(Sale {
                id: row.get(0)?,
                receipt_number: row.get(1)?,
                customer_id: row.get(2)?,
                payment_type: row.get(3)?,
                subtotal: row.get(4)?,
                total: row.get(5)?,
                cash_received: row.get(6)?,
                change_amount: row.get(7)?,
                status: row.get(8)?,
                created_at: row.get(9)?
            })
    })?;

    Ok(sale)
}
