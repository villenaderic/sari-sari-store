use crate::models::utang::UtangTransaction;
use crate::errors::{Result, AppError};
use tauri::State;
use crate::database::Database;
use rusqlite::params;
use serde::Serialize;

#[derive(Serialize)]
pub struct UtangBalance {
    pub customer_id: i64,
    pub account_id: i64,
    pub balance: i64, // positive means they owe us
}

#[tauri::command]
pub fn get_utang_balances(db: State<'_, Database>) -> Result<Vec<UtangBalance>> {
    let conn = db.get_connection()?;
    let mut stmt = conn.prepare("
        SELECT a.customer_id, a.id, COALESCE(SUM(
            CASE 
                WHEN t.transaction_type = 'CREDIT_SALE' THEN t.amount
                WHEN t.transaction_type = 'PAYMENT' THEN -t.amount
                WHEN t.transaction_type = 'ADJUSTMENT' THEN t.amount
                ELSE 0
            END
        ), 0) as balance
        FROM utang_accounts a
        LEFT JOIN utang_transactions t ON a.id = t.account_id
        GROUP BY a.id, a.customer_id
    ")?;
    
    let balances = stmt.query_map([], |row| {
        Ok(UtangBalance {
            customer_id: row.get(0)?,
            account_id: row.get(1)?,
            balance: row.get(2)?,
        })
    })?.collect::<std::result::Result<Vec<_>, _>>()?;
    
    Ok(balances)
}

#[tauri::command]
pub fn get_utang_transactions(db: State<'_, Database>, account_id: i64) -> Result<Vec<UtangTransaction>> {
    let conn = db.get_connection()?;
    let mut stmt = conn.prepare("SELECT id, account_id, transaction_type, reference_id, amount, description, created_at FROM utang_transactions WHERE account_id = ?1 ORDER BY created_at DESC")?;
    
    let txs = stmt.query_map(params![account_id], |row| {
        Ok(UtangTransaction {
            id: row.get(0)?,
            account_id: row.get(1)?,
            transaction_type: row.get(2)?,
            reference_id: row.get(3)?,
            amount: row.get(4)?,
            description: row.get(5)?,
            created_at: row.get(6)?,
        })
    })?.collect::<std::result::Result<Vec<_>, _>>()?;
    
    Ok(txs)
}

#[tauri::command]
pub fn record_utang_payment(db: State<'_, Database>, account_id: i64, amount: i64, description: Option<String>) -> Result<()> {
    if amount <= 0 {
         return Err(AppError::Validation("Amount must be greater than zero".into()));
    }

    let conn = db.get_connection()?;
    
    // verify account exists
    let exists: i64 = conn.query_row("SELECT COUNT(*) FROM utang_accounts WHERE id = ?1", params![account_id], |row| row.get(0))?;
    if exists == 0 {
        return Err(AppError::NotFound("Utang account not found".into()));
    }

    conn.execute(
        "INSERT INTO utang_transactions (account_id, transaction_type, amount, description) VALUES (?1, 'PAYMENT', ?2, ?3)",
        params![account_id, amount, description]
    )?;
    
    conn.execute("UPDATE utang_accounts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?1", params![account_id])?;

    Ok(())
}
