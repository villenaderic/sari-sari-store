use crate::models::stock::StockMovement;
use crate::errors::{Result, AppError};
use tauri::State;
use crate::database::Database;
use rusqlite::params;

#[tauri::command]
pub fn get_stock_movements(db: State<'_, Database>) -> Result<Vec<StockMovement>> {
    let conn = db.get_connection()?;
    let mut stmt = conn.prepare("SELECT id, product_id, movement_type, quantity, previous_stock, new_stock, reference_id, reason, created_at FROM stock_movements ORDER BY created_at DESC")?;
    
    let movements = stmt.query_map([], |row| {
        Ok(StockMovement {
            id: row.get(0)?,
            product_id: row.get(1)?,
            movement_type: row.get(2)?,
            quantity: row.get(3)?,
            previous_stock: row.get(4)?,
            new_stock: row.get(5)?,
            reference_id: row.get(6)?,
            reason: row.get(7)?,
            created_at: row.get(8)?,
        })
    })?.collect::<std::result::Result<Vec<_>, _>>()?;
    
    Ok(movements)
}

#[tauri::command]
pub fn add_stock_movement(db: State<'_, Database>, product_id: i64, movement_type: String, quantity: i32, reason: Option<String>) -> Result<()> {
    let mut conn = db.get_connection()?;
    let tx = conn.transaction()?;

    let previous_stock: i32 = tx.query_row("SELECT stock_quantity FROM products WHERE id = ?1", params![product_id], |row| row.get(0))?;

    let new_stock = match movement_type.as_str() {
        "STOCK_IN" | "RETURN" => previous_stock + quantity,
        "SALE" | "DAMAGE" | "EXPIRED" => {
            if previous_stock < quantity {
                return Err(AppError::BusinessRule("Insufficient stock for this movement.".into()));
            }
            previous_stock - quantity
        },
        "ADJUSTMENT" => {
            let s = previous_stock + quantity;
            if s < 0 {
                return Err(AppError::BusinessRule("Adjustment results in negative stock.".into()));
            }
            s
        },
        _ => return Err(AppError::Validation("Invalid movement type".into())),
    };

    tx.execute(
        "INSERT INTO stock_movements (product_id, movement_type, quantity, previous_stock, new_stock, reason) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![product_id, movement_type, quantity, previous_stock, new_stock, reason]
    )?;

    tx.execute(
        "UPDATE products SET stock_quantity = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = ?2",
        params![new_stock, product_id]
    )?;

    tx.commit()?;
    Ok(())
}
