use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StockMovement {
    pub id: i64,
    pub product_id: i64,
    pub movement_type: String, // "STOCK_IN", "SALE", "RETURN", "DAMAGE", "EXPIRED", "ADJUSTMENT"
    pub quantity: i32,
    pub previous_stock: i32,
    pub new_stock: i32,
    pub reference_id: Option<String>,
    pub reason: Option<String>,
    pub created_at: String,
}
